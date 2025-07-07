import argparse
import torch
import torch.nn as nn
import os
from torch.utils.data import DataLoader
from tqdm import tqdm
import pandas as pd
import jiwer
import matplotlib.pyplot as plt

from bilstm_encoder import BiLSTMEncoder
from linear_ctc_head import LinearCTCHead
from phoenix_dataset import PhoenixDataset, collate_fn
from tokenizer import SimpleTokenizer
from temp_v2 import Temporal1DEncoderV2

class WarmupScheduler(torch.optim.lr_scheduler._LRScheduler):
    def __init__(self, optimizer, warmup_steps, total_steps, last_epoch=-1):
        self.warmup_steps = warmup_steps
        self.total_steps = total_steps
        super(WarmupScheduler, self).__init__(optimizer, last_epoch)

    def get_lr(self):
        current_step = self.last_epoch + 1
        if current_step < self.warmup_steps:
            return [base_lr * float(current_step) / float(self.warmup_steps) for base_lr in self.base_lrs]
        else:
            return [base_lr * max(0.0, float(self.total_steps - current_step) / float(self.total_steps - self.warmup_steps)) for base_lr in self.base_lrs]


def evaluate_model(cnn_encoder, bilstm_encoder, classifier, val_loader, tokenizer, device, criterion, blank_idx): # Added cnn_encoder
    cnn_encoder.eval()
    bilstm_encoder.eval()
    classifier.eval()
    total_loss = 0.0
    all_pred_decoded_texts = []
    all_target_decoded_texts = []
    processed_batch_count = 0

    with torch.no_grad():
        for batch_data in val_loader:
            if batch_data[0] is None:
                continue
            
            inputs, labels, input_lengths, label_lengths = batch_data
            inputs, labels = inputs.to(device), labels.to(device)
            
            cnn_outputs = cnn_encoder(inputs) # Pass through CNN first
            encoder_outputs = bilstm_encoder(cnn_outputs) # Then BiLSTM
            logits = classifier(encoder_outputs) 
            log_probs = torch.nn.functional.log_softmax(logits, dim=-1)
            
            input_lengths_tensor = torch.tensor(input_lengths, dtype=torch.long)
            label_lengths_tensor = torch.tensor(label_lengths, dtype=torch.long)

            loss = criterion(log_probs.transpose(0, 1), labels, input_lengths_tensor, label_lengths_tensor)
            total_loss += loss.item()

            pred_batch_ids = torch.argmax(log_probs, dim=-1) 
            
            current_target_offset = 0
            for i in range(inputs.size(0)): 
                pred_len = input_lengths[i] 
                single_pred_ids_full = pred_batch_ids[i, :pred_len].tolist()
                
                decoded_pred_tokens = [p for j, p in enumerate(single_pred_ids_full) if p != blank_idx and (j == 0 or p != single_pred_ids_full[j-1])]
                all_pred_decoded_texts.append(tokenizer.decode(decoded_pred_tokens))

                target_len = label_lengths[i]
                single_target_ids = labels[current_target_offset : current_target_offset + target_len].tolist()
                all_target_decoded_texts.append(tokenizer.decode(single_target_ids))
                current_target_offset += target_len
            
            processed_batch_count += 1
                
    if processed_batch_count == 0:
        avg_loss = float('inf')
        wer = 1.0 
    else:
        avg_loss = total_loss / processed_batch_count
        wer = jiwer.wer(all_target_decoded_texts, all_pred_decoded_texts)
        
    return wer, avg_loss

def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"🚀 Using device: {device}")

    tokenizer = SimpleTokenizer()
    if not os.path.exists("checkpoints"):
        os.makedirs("checkpoints", exist_ok=True)
    vocab_file_path = os.path.join("checkpoints", "vocab.json")

    if not os.path.exists(vocab_file_path):
        print("⚠️ Vocab file not found. Building vocab from training data.")
        tokenizer.build_vocab_from_file(args.train_csv)
        tokenizer.save_vocab(vocab_file_path)
    
    tokenizer.load_vocab(vocab_file_path)
    vocab_size = tokenizer.vocab_size()
    blank_idx = tokenizer.get_blank_idx()
    print(f"📚 Vocab size: {vocab_size}")

    apply_augmentation = True
    if apply_augmentation:
        print("🔧 Applying data augmentation (Gaussian noise + time masking + random crop).")
        noise_std_dev = 0.012
        max_mask_percentage=0.18
        num_masks=1
    
    dataset = PhoenixDataset(args.train_features_dir, args.train_csv, tokenizer, apply_augmentation,
                              noise_std_dev, max_mask_percentage, num_masks)
    if len(dataset) == 0:
        print("Dataset is empty. Check paths and preprocessing.")
        return
    val_dataset = PhoenixDataset(args.val_features_dir, args.val_csv, tokenizer)
    if len(val_dataset) == 0:
        print("Validation dataset is empty. Check paths and preprocessing.")
        return # Allow training to proceed, evaluation will give inf loss/1.0 WER

    dataloader = DataLoader(
        dataset,
        batch_size=args.batch_size,
        shuffle=True,
        collate_fn=collate_fn,
        num_workers=args.num_workers
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        collate_fn=collate_fn,
        num_workers=args.num_workers
    )

    cnn_encoder = Temporal1DEncoderV2(
        input_dim=args.input_dim, # Dimension of features from preprocess.py
        block_dims=[128, 256, args.cnn_output_dim],
        out_dim=args.cnn_output_dim, # Output dimension of CNN
        kernel_size=5, # Kernel size of CNN
        dropout_rate=0.2 # Dropout rate of CNN
    ).to(device)

    bilstm_encoder = BiLSTMEncoder(
        input_dim=args.cnn_output_dim,       
        lstm_hidden_dim=args.lstm_hidden_dim,
        num_layers=args.num_encoder_layers,
        dropout=0.4             
    ).to(device)

    classifier_input_dim = bilstm_encoder.get_output_dim()
    classifier = LinearCTCHead(model_dim=classifier_input_dim, vocab_size=vocab_size).to(device)
    criterion = nn.CTCLoss(blank=blank_idx, zero_infinity=True)

    optimizer = torch.optim.AdamW(
        list(cnn_encoder.parameters()) + list(bilstm_encoder.parameters()) + list(classifier.parameters()), # Add CNN params
        lr=args.learning_rate,
        weight_decay=0.01
    )

    total_training_steps = (len(dataloader) * args.epochs)
    warmup_steps = int(0.1 * total_training_steps)  # 10% of training as warm-up
    scheduler = WarmupScheduler(optimizer, warmup_steps=warmup_steps, total_steps=total_training_steps)

    best_val_loss = float('inf')
    best_val_wer = float('inf') # Can track best WER model separately if needed
    patience = 10 
    wait = 0
    print("Starting training with 1DCNN -> BiLSTM -> CTC Head...")

    metrics_history = []
    start_epoch = 1
    checkpoint_path = os.path.join("checkpoints", "model.pt")

    if os.path.exists(checkpoint_path):
        print(f"Loading checkpoint from {checkpoint_path}")
        checkpoint = torch.load(checkpoint_path, map_location=device)
        cnn_encoder.load_state_dict(checkpoint['cnn_encoder_state_dict'])
        bilstm_encoder.load_state_dict(checkpoint['bilstm_encoder_state_dict'])
        classifier.load_state_dict(checkpoint['classifier_state_dict'])
        optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        best_val_loss = checkpoint.get('val_loss', float("inf"))
        best_val_wer = checkpoint.get('val_wer', float('inf'))
        start_epoch = checkpoint['epoch'] + 1
        metrics_csv_path = os.path.join("checkpoints", "training_metrics.csv")
        if os.path.exists(metrics_csv_path):
            past_metrics_df = pd.read_csv(metrics_csv_path)
            metrics_history = past_metrics_df[past_metrics_df['epoch'] < start_epoch].to_dict('records')

    for epoch in range(start_epoch, args.epochs + 1):
        cnn_encoder.train()
        bilstm_encoder.train()
        classifier.train()
        epoch_loss = 0.0
        batch_count = 0

        pbar = tqdm(dataloader, desc=f"Epoch {epoch}/{args.epochs}")
        for batch_data in pbar:
            if batch_data[0] is None:
                continue

            feats, labels, input_lengths, target_lengths = batch_data
            feats = feats.to(device)
            labels = labels.to(device)
            input_lengths_tensor = torch.tensor(input_lengths, dtype=torch.long)
            target_lengths_tensor = torch.tensor(target_lengths, dtype=torch.long)

            if any(i < t for i, t in zip(input_lengths_tensor, target_lengths_tensor)):
                print("CTCLoss invalid: input shorter than target. Skipping batch.")
                continue

            if (labels < 0).any() or (labels >= vocab_size).any():
                print("Invalid label index detected. Skipping batch.")
                continue

            try:
                optimizer.zero_grad()
                # Forward pass
                cnn_out = cnn_encoder(feats)
                bilstm_out = bilstm_encoder(cnn_out)
                logits = classifier(bilstm_out)
                log_probs = torch.nn.functional.log_softmax(logits, dim=-1)
                log_probs = log_probs.transpose(0, 1)

                loss = criterion(log_probs, labels, input_lengths_tensor, target_lengths_tensor)
                if torch.isnan(loss) or torch.isinf(loss):
                    print("NaN/Inf loss. Skipping batch.")
                    continue

                loss.backward()
                # Check gradients for all model parts
                all_params = list(cnn_encoder.parameters()) + list(bilstm_encoder.parameters()) + list(classifier.parameters())
                bad_grad = any(
                    (param.grad is not None) and (torch.isnan(param.grad).any() or torch.isinf(param.grad).any())
                    for param in all_params
                )
                if bad_grad:
                    print("Bad gradient detected. Skipping optimizer step.")
                    optimizer.zero_grad()
                    continue

                torch.nn.utils.clip_grad_norm_(all_params, max_norm=5.0)
                optimizer.step()
                scheduler.step()
                epoch_loss += loss.item()
                batch_count += 1
                pbar.set_postfix(loss=loss.item())

            except RuntimeError as e:
                print(f"Runtime error during batch: {e}")
                optimizer.zero_grad()
                continue

        if batch_count > 0:
            avg_epoch_loss = epoch_loss / batch_count
            print(f"Epoch {epoch} training average loss: {avg_epoch_loss:.4f}")
            
            # Evaluation
            val_wer, val_loss = evaluate_model(cnn_encoder, bilstm_encoder, classifier, val_loader, tokenizer, device, criterion, blank_idx)
            print(f"Epoch {epoch} finished. val_loss: {val_loss:.4f}, val_wer: {val_wer:.4f}")
            current_lr = optimizer.param_groups[0]['lr']
            print(f"   Current LR: {current_lr:.1e}")

            metrics_history.append({'epoch': epoch, 'val_loss': val_loss, 'val_wer': val_wer})

            if val_wer < best_val_wer:
                # Save the best model based on WER
                best_val_loss = val_loss # Save the best loss for reference
                best_val_wer = val_wer
                wait = 0
                print(f"Saving best model (val_wer={val_wer:.4f}) at epoch {epoch}")
                torch.save({
                    'epoch': epoch,
                    'cnn_encoder_state_dict': cnn_encoder.state_dict(),
                    'bilstm_encoder_state_dict': bilstm_encoder.state_dict(),
                    'classifier_state_dict': classifier.state_dict(),
                    'optimizer_state_dict': optimizer.state_dict(),
                    'val_loss': best_val_loss,
                    'val_wer': val_wer,
                }, checkpoint_path)
            else:
                wait += 1
                print(f"No improvement in val_wer (wait {wait}/{patience})")

            # Sample prediction logging
            if epoch % 5 == 0 and len(val_dataset) > 0:
                cnn_encoder.eval()
                bilstm_encoder.eval()
                classifier.eval()
                # Log first few samples
                for i in range(min(5, len(val_dataset))):
                    feat, true_target, name = val_dataset[i]
                    if feat.numel() > 0:
                        with torch.no_grad():
                            x = feat.unsqueeze(0).to(device)
                            cnn_out_sample = cnn_encoder(x)
                            bilstm_out_sample = bilstm_encoder(cnn_out_sample)
                            out_classifier_sample = classifier(bilstm_out_sample)
                            pred_ids_raw = torch.argmax(out_classifier_sample, dim=-1).squeeze(0).tolist()
                            decoded_pred_tokens = [p for j, p in enumerate(pred_ids_raw) if p != blank_idx and (j == 0 or p != pred_ids_raw[j-1])]
                            print(f"\n🔍 Sample '{name}' prediction at epoch {epoch}:")
                            print("Pred:", tokenizer.decode(decoded_pred_tokens))
                            print("Target:", tokenizer.decode(true_target.tolist()))
                    else:
                         print(f"\nSample '{name}' at epoch {epoch} has empty features, skipping.")
        else:
            print(f"Epoch {epoch} had no valid training batches.")

        if wait >= patience:
            print("Early stopping triggered.")
            break
    
    # Save metrics and plot
    if metrics_history:
        metrics_df = pd.DataFrame(metrics_history)
        metrics_csv_path = os.path.join("checkpoints", "training_metrics.csv")
        metrics_df.to_csv(metrics_csv_path, index=False)
        print(f"Metrics saved to {metrics_csv_path}")
        fig, ax1 = plt.subplots(figsize=(12, 7))
        color = 'tab:red'
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Validation Loss', color=color)
        ax1.plot(metrics_df['epoch'], metrics_df['val_loss'], color=color, linestyle='-', marker='o', label='Validation Loss')
        ax1.tick_params(axis='y', labelcolor=color)
        ax1.grid(True, axis='y', linestyle=':', alpha=0.7)
        ax2 = ax1.twinx()
        color = 'tab:blue'
        ax2.set_ylabel('Validation WER', color=color) 
        ax2.plot(metrics_df['epoch'], metrics_df['val_wer'], color=color, linestyle='--', marker='x', label='Validation WER')
        ax2.tick_params(axis='y', labelcolor=color)
        fig.suptitle('Training Metrics: Validation Loss and WER over Epochs', fontsize=16)
        fig.tight_layout(rect=[0, 0, 1, 0.96]) 
        lines, labels_ax1 = ax1.get_legend_handles_labels()
        lines2, labels_ax2 = ax2.get_legend_handles_labels()
        ax2.legend(lines + lines2, labels_ax1 + labels_ax2, loc='best')
        plot_path = os.path.join("checkpoints", "training_metrics_plot.png")
        plt.savefig(plot_path)
        print(f"Plot saved to {plot_path}")
        plt.close(fig)
    else:
        print("No metrics recorded, skipping CSV and plot generation.")

    print("Training finished.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train 1DCNN + BiLSTM Encoder with CTC Loss")
    parser.add_argument('--train_features_dir', type=str, required=True)
    parser.add_argument('--val_features_dir', type=str, required=True)
    parser.add_argument('--train_csv', type=str, required=True)
    parser.add_argument('--val_csv', type=str, required=True)
    parser.add_argument('--batch_size', type=int, default=32)
    parser.add_argument('--epochs', type=int, default=100)
    parser.add_argument('--input_dim', type=int, default=369, help="Dimension of input features (e.g., normalized keypoints).")
    parser.add_argument('--cnn_output_dim', type=int, default=512, help="Output dimension of the 1D CNN encoder.")
    parser.add_argument('--lstm_hidden_dim', type=int, default=384, help="Hidden dimension for BiLSTM (each direction).")
    parser.add_argument('--num_encoder_layers', type=int, default=3, help="Number of BiLSTM layers.")
    parser.add_argument('--num_workers', type=int, default=4)
    parser.add_argument('--learning_rate', type=float, default=5e-4)

    args = parser.parse_args()
    train(args)