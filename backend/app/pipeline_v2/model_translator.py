# model_translator.py
import torch
import torch.nn as nn
from transformers import AutoModelForSeq2SeqLM, AutoConfig
from . import config
class GlossToTextTranslatorT5(nn.Module):
    def __init__(self, model_name_or_path=config.TRANSLATOR_MODEL_NAME, dropout_rate=0.1):
        super().__init__()
        self.model_name_or_path = model_name_or_path

        # Load model configuration
        t5_config = AutoConfig.from_pretrained(model_name_or_path)
        t5_config.dropout_rate = dropout_rate # Example of overriding a config param
        # t5_config.gradient_checkpointing = True # If memory is an issue during training

        self.t5_model = AutoModelForSeq2SeqLM.from_pretrained(model_name_or_path, config=t5_config)
        print(f"Initialized T5 model ({model_name_or_path}) for translation.")
        print(f"  T5 Model Vocab Size: {self.t5_model.config.vocab_size}")

    def forward(self, input_ids, attention_mask, decoder_input_ids=None, labels=None):
        """
        input_ids: Tokenized gloss sequences (B, S_gloss)
        attention_mask: Attention mask for gloss sequences (B, S_gloss)
        decoder_input_ids: Optional, for teacher forcing if not using labels. (B, S_text)
                           T5 models usually handle decoder_input_ids creation from labels.
        labels: Tokenized text sequences for training (B, S_text).
                These are automatically shifted right and used to create decoder_input_ids by T5.
                Padded values should be -100.
        """
        if labels is not None and decoder_input_ids is not None:
            pass

        outputs = self.t5_model(
            input_ids=input_ids,
            attention_mask=attention_mask,
            decoder_input_ids=decoder_input_ids,
            labels=labels
        )
        return outputs # outputs.loss, outputs.logits, etc.

    def generate(self, input_ids, attention_mask, **kwargs):
        """
        Wrapper for T5's generate method.
        kwargs can include: num_beams, max_length, early_stopping, etc.
        """
        return self.t5_model.generate(
            input_ids=input_ids,
            attention_mask=attention_mask,
            **kwargs
        )

    def resize_token_embeddings(self, new_num_tokens: int):
        self.t5_model.resize_token_embeddings(new_num_tokens)
        print(f"Resized T5 model token embeddings to: {new_num_tokens}")
        print(f"  New T5 Model Vocab Size: {self.t5_model.config.vocab_size}")


if __name__ == '__main__':
    from transformers import AutoTokenizer
    print("Testing GlossToTextTranslatorT5...")
    tokenizer = AutoTokenizer.from_pretrained(config.TRANSLATOR_MODEL_NAME)
    translator = GlossToTextTranslatorT5()

    # Dummy input (simulating tokenized glosses)
    # "translate Gloss to German: ICH MORGEN"
    dummy_gloss_input = tokenizer(
        [config.T5_PREFIX_GLOSS_TO_GERMAN + "ICH MORGEN", config.T5_PREFIX_GLOSS_TO_GERMAN + "DU GESTERN"],
        return_tensors="pt", padding=True, truncation=True, max_length=config.MAX_GLOSS_SEQ_LEN
    )
    # Dummy target (simulating tokenized text)
    # "Ich gehe morgen", "Du warst gestern"
    dummy_text_target = tokenizer(
        ["Ich gehe morgen", "Du warst gestern"],
        return_tensors="pt", padding=True, truncation=True, max_length=config.MAX_TEXT_SEQ_LEN
    )
    labels = dummy_text_target.input_ids
    labels[labels == tokenizer.pad_token_id] = -100 # Ignore padding in loss

    # Test forward pass (training mode)
    outputs = translator(
        input_ids=dummy_gloss_input.input_ids,
        attention_mask=dummy_gloss_input.attention_mask,
        labels=labels
    )
    print("Training mode outputs:")
    print("Loss:", outputs.loss.item())
    print("Logits shape:", outputs.logits.shape) # (B, S_text, VocabSize)

    # Test generation (inference mode)
    generated_ids = translator.generate(
        input_ids=dummy_gloss_input.input_ids,
        attention_mask=dummy_gloss_input.attention_mask,
        max_length=config.MAX_TEXT_SEQ_LEN + 5, # Allow a bit longer for generation
        num_beams=config.TRANSLATOR_BEAM_SIZE,
        early_stopping=True
    )
    print("\nGenerated IDs shape:", generated_ids.shape)
    decoded_preds = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)
    print("Decoded predictions:")
    for pred in decoded_preds:
        print(f"- '{pred}'")