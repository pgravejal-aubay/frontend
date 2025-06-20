# translate_glosses.py
import argparse
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from tqdm import tqdm

TASK_PREFIX = "translate Gloss to German: "

class GlossTranslator:
    """
    A class to hold a pre-loaded Seq2Seq model and tokenizer for translation.
    """
    def __init__(self, model_dir):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"🚀 Initializing GlossTranslator on device: {self.device}")

        # 1. Load Model and Tokenizer
        try:
            self.model = AutoModelForSeq2SeqLM.from_pretrained(model_dir).to(self.device)
            self.tokenizer = AutoTokenizer.from_pretrained(model_dir)
            self.model.eval() # Set the model to evaluation mode
            print(f"✅ Seq2Seq model and tokenizer loaded from {model_dir}")
        except Exception as e:
            print(f"❌ Error loading model or tokenizer from {model_dir}: {e}")
            raise e

    @torch.no_grad()
    def translate(self, gloss_sequence: str, max_length: int = 128, num_beams: int = 5) -> str:
        """
        Translates a single gloss sequence into a natural language sentence.
        Args:
            gloss_sequence (str): The input string of glosses (e.g., "HAUS FRAU NORMAL").
            max_length (int): The maximum length of the generated sentence.
            num_beams (int): The number of beams for beam search.
        Returns:
            str: The translated sentence.
        """
        if not isinstance(gloss_sequence, str) or not gloss_sequence.strip():
            return "" # Return empty string for empty input

        input_text = TASK_PREFIX + gloss_sequence
        
        # Tokenize the input
        inputs = self.tokenizer(input_text, return_tensors="pt",
                                truncation=True, padding=True).to(self.device)

        # Generate the translation
        try:
            output_sequences = self.model.generate(
                input_ids=inputs['input_ids'],
                attention_mask=inputs['attention_mask'],
                max_length=max_length,
                num_beams=num_beams,
                early_stopping=True
            )
            
            # Decode the generated sequence
            generated_text = self.tokenizer.decode(output_sequences[0], skip_special_tokens=True)
            return generated_text

        except Exception as e:
            print(f"\n❌ Error during translation for gloss sequence: '{gloss_sequence[:50]}...'")
            print(f"   Error: {e}")
            return "TRANSLATION_ERROR"


TRANSLATOR_INSTANCE = None

def translate_gloss_to_text(
    gloss_sequence: str,
    model_dir: str = "flan_model",
    max_length: int = 128,
    num_beams: int = 5
) -> str:
    """
    Wrapper function to initialize the translator once and translate a gloss sequence.
    """
    global TRANSLATOR_INSTANCE
    
    # Initialize the translator on the first call
    if TRANSLATOR_INSTANCE is None:
        print("Instantiating GlossTranslator for the first time...")
        TRANSLATOR_INSTANCE = GlossTranslator(model_dir=model_dir)
        
    # Generate and return the translation
    translated_sentence = TRANSLATOR_INSTANCE.translate(
        gloss_sequence, 
        max_length=max_length, 
        num_beams=num_beams
    )
    
    return translated_sentence