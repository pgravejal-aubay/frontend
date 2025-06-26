# utils.py
import torch
import jiwer
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
from nltk.translate.meteor_score import meteor_score
# nltk.download('wordnet') # Run once if not downloaded
# nltk.download('omw-1.4') # Run once if not downloaded
from rouge_score import rouge_scorer # pip install rouge-score
import torch.nn.functional as F
from . import config
import os
import numpy as np

# --- Tokenizer Helper   ---
def tokenize_for_wer(text):
    """Simple whitespace tokenizer, converting to uppercase (common for glosses)."""
    return text.upper().split()

# --- Metric Calculation ---
def calculate_wer(predictions, targets, gloss_vocab):
    """
    Calculates Word Error Rate (WER) for gloss sequences.
    Args:
        predictions: List of predicted gloss sentence strings.
        targets: List of target gloss sentence strings.
        gloss_vocab: The gloss vocabulary object (needed for special tokens).
    Returns:
        Dictionary containing 'wer'.
    """
    if not predictions or not targets or len(predictions) != len(targets):
         print("Warning: Empty lists or mismatched lengths for WER calculation.")
         return {'wer': float('inf')} # Return dict format

    # --- Word Error Rate (WER) ---
    # Need to ensure these config tokens are from the correct config (pipeline_v2.config)
    # This might require passing v2_config into this function or accessing it globally if safe.
    special_tokens_to_remove = [
        config.PAD_TOKEN, config.SOS_TOKEN, config.EOS_TOKEN,
        config.CTC_BLANK_TOKEN, config.UNK_TOKEN
    ] # TODO: Review if these config tokens should come from v2_config

    try:
        # Convert to uppercase and remove special tokens
        cleaned_preds = []
        for s in predictions:
            s_upper = s.upper()
            for tok in special_tokens_to_remove:
                s_upper = s_upper.replace(tok, '')
            cleaned_preds.append(" ".join(s_upper.split())) # Normalize spaces

        cleaned_tgts = []
        for s in targets:
            s_upper = s.upper()
            for tok in special_tokens_to_remove:
                s_upper = s_upper.replace(tok, '')
            cleaned_tgts.append(" ".join(s_upper.split()))

        # Filter out pairs where either cleaned prediction or target is empty
        valid_indices = [i for i, (p, t) in enumerate(zip(cleaned_preds, cleaned_tgts)) if p.strip() and t.strip()]

        if not valid_indices:
             if len(predictions) > 0 : # Only warn if there were inputs
                  print("Warning: All sentences became empty after cleaning special tokens for WER.")
             wer = float('inf')
        else:
            filtered_preds = [cleaned_preds[i] for i in valid_indices]
            filtered_tgts = [cleaned_tgts[i] for i in valid_indices]
            wer = jiwer.wer(filtered_tgts, filtered_preds)

    except Exception as e:
        print(f"Error during WER calculation: {e}")
        wer = float('inf') # Assign infinite WER on error

    # WER is typically reported as a percentage
    return {'wer': wer * 100}

# --- NEW: CTC Greedy Decoding Function ---
def ctc_decode_greedy(log_probs, input_lengths, gloss_vocab):
    """
    Performs greedy CTC decoding (best path).
    Args:
        log_probs (Tensor): Log probabilities from the model (T, B, C).
        input_lengths (Tensor): Length of each sequence in the batch (B,).
        gloss_vocab (Vocabulary): Gloss vocabulary object.
    Returns:
        list[str]: List of decoded gloss sequences for the batch.
    """
    decoded_batch = []
    batch_size = log_probs.size(1)
    blank_idx = gloss_vocab.blank_idx

    _, predicted_indices = torch.max(log_probs, dim=2)

    for i in range(batch_size):
        seq_len = input_lengths[i].item()
        sequence_indices = predicted_indices[:seq_len, i].cpu().numpy()

        decoded_sequence = []
        last_idx = -1 
        for idx in sequence_indices:
            if idx != last_idx: 
                if idx != blank_idx: 
                    decoded_sequence.append(idx)
            last_idx = idx 

        decoded_str = gloss_vocab.decode(decoded_sequence, remove_special=False) 
        decoded_batch.append(decoded_str)

    return decoded_batch


# --- Save/Load Checkpoints (Adapted for SLRModel) ---
def save_checkpoint(state, is_best, filename='checkpoint.pth', best_filename='best_model.pth'):
    """Saves model and training parameters."""
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    torch.save(state, filename)
    if is_best:
        best_filepath = os.path.join(os.path.dirname(filename), best_filename)
        torch.save(state, best_filepath)
        best_val_wer_display = state.get('best_val_wer', float('inf'))
        try:
            best_val_wer_display_str = f"{float(best_val_wer_display):.2f}"
        except (ValueError, TypeError):
            best_val_wer_display_str = str(best_val_wer_display) # Keep as string if not float-convertible
        print(f"*** Best model saved to {best_filepath} (WER: {best_val_wer_display_str}) ***")


def load_checkpoint(checkpoint_path, model, optimizer=None):
    """Loads model and optimizer state from a checkpoint for SLRModel."""
    if not os.path.exists(checkpoint_path):
        print(f"Warning: Checkpoint '{checkpoint_path}' not found.")
        return None
    try:
        # Assuming config.DEVICE refers to the correct v2_config.DEVICE when called from orchestrator
        # If utils.py is shared, this DEVICE might need to be passed or determined contextually
        device_to_load = config.DEVICE 
        print(f"Attempting to load checkpoint '{checkpoint_path}' to device '{device_to_load}'")
        checkpoint = torch.load(checkpoint_path, map_location=device_to_load)


        saved_vocab_size_from_checkpoint = checkpoint.get('gloss_vocab_size') 

        if hasattr(model, 'gloss_vocab_size'): 
            current_model_slr_gloss_vocab_size = model.gloss_vocab_size
            if saved_vocab_size_from_checkpoint is not None and saved_vocab_size_from_checkpoint != current_model_slr_gloss_vocab_size:
                print(f"ERROR: Vocab size mismatch for SLR-type model! Checkpoint has gloss_vocab_size={saved_vocab_size_from_checkpoint}, Model expects {current_model_slr_gloss_vocab_size}.")
                print("Cannot load checkpoint due to mismatch in output layer size.")
                return None
        
        state_dict = checkpoint['state_dict']
        if next(iter(state_dict)).startswith('module.'):
             from collections import OrderedDict
             new_state_dict = OrderedDict()
             for k, v in state_dict.items():
                 name = k[7:] 
                 new_state_dict[name] = v
             model.load_state_dict(new_state_dict)
        else:
            model.load_state_dict(state_dict)

        if optimizer and 'optimizer' in checkpoint:
            try:
                optimizer.load_state_dict(checkpoint['optimizer'])
            except ValueError as e:
                 print(f"Warning: Could not load optimizer state, possibly due to parameter group mismatch: {e}")
                 print("Continuing without loading optimizer state.")
            except Exception as e:
                 print(f"Warning: An error occurred loading optimizer state: {e}")
                 print("Continuing without loading optimizer state.")

        epoch_display = checkpoint.get('epoch', '?')
        best_val_wer_display = checkpoint.get('best_val_wer', '?')
        
        # MODIFIED PRINT STATEMENT:
        if isinstance(best_val_wer_display, (int, float)):
            print(f"Loaded checkpoint '{checkpoint_path}' (epoch {epoch_display}, best WER {best_val_wer_display:.2f})")
        else:
            print(f"Loaded checkpoint '{checkpoint_path}' (epoch {epoch_display}, best WER {best_val_wer_display})")
            
        return checkpoint 

    except KeyError as e:
        print(f"Error loading checkpoint: Missing key {e}. Checkpoint structure might be incompatible.")
        return None
    except Exception as e:
        print(f"Error loading checkpoint '{checkpoint_path}': {e}")
        import traceback
        traceback.print_exc()
        return None
    
def calculate_translation_metrics(predictions_text, targets_text):
    """
    Calculates BLEU-4, METEOR, ROUGE-L for text translations.
    Args:
        predictions_text: List of predicted sentence strings.
        targets_text: List of target sentence strings (single reference per prediction).
    Returns:
        Dictionary containing 'bleu', 'meteor', 'rouge_l'.
    """
    if not predictions_text or not targets_text or len(predictions_text) != len(targets_text):
        print("Warning: Empty lists or mismatched lengths for translation metrics.")
        return {'bleu': 0.0, 'meteor': 0.0, 'rouge_l': 0.0}

    targets_lol = [[t] for t in targets_text] 

    bleu_scores = []
    meteor_scores = []
    rouge_l_fscores = []
    chencherry = SmoothingFunction()
    r_scorer = rouge_scorer.RougeScorer(['rougeL'], use_stemmer=True) 

    valid_pairs_count = 0
    for pred_str, ref_list_str in zip(predictions_text, targets_lol):
        if not pred_str.strip() or not ref_list_str or not ref_list_str[0].strip():
            bleu_scores.append(0.0)
            meteor_scores.append(0.0)
            rouge_l_fscores.append(0.0)
            continue

        pred_tokens = pred_str.lower().split()
        refs_tokens_list = [r.lower().split() for r in ref_list_str]

        try:
            bleu = sentence_bleu(refs_tokens_list, pred_tokens, smoothing_function=chencherry.method1)
            bleu_scores.append(bleu)
        except Exception: 
            bleu_scores.append(0.0)

        try:
            meteor = meteor_score(ref_list_str, pred_str.lower()) 
            meteor_scores.append(meteor)
        except Exception as e:
            meteor_scores.append(0.0)

        try:
            rouge_s = r_scorer.score(ref_list_str[0].lower(), pred_str.lower()) 
            rouge_l_fscores.append(rouge_s['rougeL'].fmeasure)
        except Exception:
            rouge_l_fscores.append(0.0)
        
        valid_pairs_count +=1

    avg_bleu = np.mean(bleu_scores) * 100 if bleu_scores else 0.0
    avg_meteor = np.mean(meteor_scores) * 100 if meteor_scores else 0.0
    avg_rouge_l = np.mean(rouge_l_fscores) * 100 if rouge_l_fscores else 0.0
    
    if valid_pairs_count < len(predictions_text) * 0.5 and len(predictions_text) > 0: 
        print(f"Warning: Only {valid_pairs_count}/{len(predictions_text)} pairs were valid for metric calculation.")

    return {
        'bleu': avg_bleu,
        'meteor': avg_meteor,
        'rouge_l': avg_rouge_l
    }