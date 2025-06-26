# vocabulary.py
# import sentencepiece as spm # Not typically used for glosses
from collections import Counter
import os
from . import config

class Vocabulary:
    """Handles mapping between glosses and indices for SLR."""
    def __init__(self, vocab_file):
        self.vocab_file = vocab_file
        self.word2idx = {}
        self.idx2word = []
        # <<< Ensure CTC_BLANK_TOKEN is the FIRST special token for index 0 >>>
        self.special_tokens = [
            config.CTC_BLANK_TOKEN, # Index 0
            config.PAD_TOKEN,       # Index 1 (or as loaded)
            config.UNK_TOKEN,
            config.SOS_TOKEN,       # Optional for target prep
            config.EOS_TOKEN        # Optional for target prep
        ]

        if os.path.exists(vocab_file):
             print(f"Loading gloss vocab from {vocab_file}")
             self._load_simple_vocab()
             # <<< CRITICAL: Update config indices AFTER loading >>>
             self._update_config_indices()
        else:
            print(f"Gloss vocabulary file not found: {vocab_file}. Build it first.")
            # Set default indices - these should be overridden by building/loading
            self.blank_idx = config.CTC_BLANK_IDX # Usually 0
            self.pad_idx = 1 # Assume PAD is next
            self.unk_idx = 2
            self.sos_idx = 3
            self.eos_idx = 4

    def _load_simple_vocab(self):
        """Loads a simple text file vocab (one gloss per line)."""
        loaded_words = []
        try:
            with open(self.vocab_file, 'r', encoding='utf-8') as f:
                for word in f:
                    word = word.strip()
                    if word: # Avoid empty lines
                        loaded_words.append(word)
        except Exception as e:
            raise IOError(f"Error reading vocab file {self.vocab_file}: {e}")

        # Start fresh, ensuring special tokens are first
        self.word2idx = {}
        self.idx2word = []
        idx_counter = 0

        # Add special tokens first, respecting config.CTC_BLANK_IDX=0
        for token in self.special_tokens:
             if token not in self.word2idx:
                 # Ensure blank is at index 0
                 if token == config.CTC_BLANK_TOKEN and idx_counter != config.CTC_BLANK_IDX:
                      # This case should ideally not happen if special_tokens list is correct
                      # If it does, swap with whatever is currently at blank_idx
                      if config.CTC_BLANK_IDX < len(self.idx2word):
                          existing_token = self.idx2word[config.CTC_BLANK_IDX]
                          self.idx2word[config.CTC_BLANK_IDX] = config.CTC_BLANK_TOKEN
                          self.word2idx[config.CTC_BLANK_TOKEN] = config.CTC_BLANK_IDX
                          # Put the swapped token at the current end
                          self.idx2word.append(existing_token)
                          self.word2idx[existing_token] = idx_counter
                          idx_counter += 1
                      else: # Append blank if list is shorter
                          self.word2idx[config.CTC_BLANK_TOKEN] = idx_counter
                          self.idx2word.append(config.CTC_BLANK_TOKEN)
                          idx_counter += 1
                 elif token not in self.word2idx: # Add other special tokens
                     self.word2idx[token] = idx_counter
                     self.idx2word.append(token)
                     idx_counter += 1

        # Add words from the loaded file
        for word in loaded_words:
            if word not in self.word2idx: # Avoid adding duplicates (e.g., if special tokens were in the file)
                self.word2idx[word] = idx_counter
                self.idx2word.append(word)
                idx_counter += 1

        # Set indices after loading/building everything
        self.blank_idx = self.word2idx.get(config.CTC_BLANK_TOKEN, -1)
        self.pad_idx = self.word2idx.get(config.PAD_TOKEN, -1)
        self.unk_idx = self.word2idx.get(config.UNK_TOKEN, -1)
        self.sos_idx = self.word2idx.get(config.SOS_TOKEN, -1)
        self.eos_idx = self.word2idx.get(config.EOS_TOKEN, -1)

        # Verify critical indices
        if self.blank_idx != config.CTC_BLANK_IDX:
             print(f"WARNING: Loaded blank index ({self.blank_idx}) does not match config.CTC_BLANK_IDX ({config.CTC_BLANK_IDX}). Ensure '{config.CTC_BLANK_TOKEN}' is first in vocab or handle index mapping.")
             # You might force it here, but it's better if the vocab file is structured correctly
             # self.blank_idx = config.CTC_BLANK_IDX
        if self.pad_idx == -1 or self.unk_idx == -1:
             raise ValueError("PAD or UNK token not found in vocabulary after loading.")
        if self.pad_idx == self.blank_idx:
             raise ValueError(f"PAD index ({self.pad_idx}) cannot be the same as CTC Blank index ({self.blank_idx}). Adjust vocab or config.")

    def _update_config_indices(self):
        """Update global config indices based on loaded vocab."""
        if hasattr(self, 'pad_idx'):
            config.PAD_IDX = self.pad_idx
            print(f"Updated config.PAD_IDX to: {config.PAD_IDX}")
        # config.CTC_BLANK_IDX is assumed fixed (usually 0), vocab should match it.

    def build_vocab(self, sentences, vocab_size=3000):
        """Builds simple gloss vocab from a list of sentences (gloss sequences)."""
        print("Building simple gloss vocabulary...")
        os.makedirs(os.path.dirname(self.vocab_file), exist_ok=True)

        gloss_counts = Counter()
        for sentence in sentences:
            # Simple whitespace split for glosses
            glosses = sentence.strip().upper().split() # Often glosses are uppercase
            gloss_counts.update(glosses)

        # Start with special tokens, blank first
        self.word2idx = {}
        self.idx2word = []
        idx_counter = 0
        for token in self.special_tokens:
             if token not in self.word2idx:
                 self.word2idx[token] = idx_counter
                 self.idx2word.append(token)
                 idx_counter += 1

        # Add most frequent glosses
        num_special = len(self.idx2word)
        most_common = gloss_counts.most_common(vocab_size - num_special)
        for gloss, _ in most_common:
            if gloss not in self.word2idx: # Avoid re-adding special tokens if they were in data
                self.word2idx[gloss] = idx_counter
                self.idx2word.append(gloss)
                idx_counter += 1

        # Save the simple vocab (ensure blank is first if building fresh)
        try:
            with open(self.vocab_file, 'w', encoding='utf-8') as f:
                for word in self.idx2word:
                    f.write(word + '\n')
            print(f"Saved gloss vocabulary with {len(self.idx2word)} items to {self.vocab_file}")
        except Exception as e:
             raise IOError(f"Error writing vocab file {self.vocab_file}: {e}")

        # Reload to set indices correctly and update config
        self.__init__(self.vocab_file)


    def encode(self, sentence):
        """Converts a gloss sentence string to a list of indices."""
        # Glosses are often separated by space, convert to uppercase maybe
        tokens = sentence.strip().upper().split()
        # Do NOT add SOS/EOS here for CTC targets usually
        return [self.word2idx.get(token, self.unk_idx) for token in tokens]

    def decode(self, indices, remove_special=True):
        """
        Converts a list of indices back to a gloss sentence string.
        Optionally removes special tokens (PAD, SOS, EOS, BLANK, UNK).
        """
        tokens = []
        special_indices = {self.pad_idx, self.sos_idx, self.eos_idx, self.blank_idx, self.unk_idx}

        for idx in indices:
            if 0 <= idx < len(self.idx2word):
                if remove_special and idx in special_indices:
                    continue # Skip special tokens if requested
                tokens.append(self.idx2word[idx])
            # else: # Optional: handle out-of-bounds indices explicitly
            #     tokens.append(config.UNK_TOKEN)
        return " ".join(tokens)

    def __len__(self):
        return len(self.idx2word)

# --- Example Usage (Build gloss vocab if needed) ---
import pandas as pd

# --- Helper function to load annotations ---
def load_phoenix_annotations_for_vocab(annotation_path, split):
    filepath = os.path.join(annotation_path, f"PHOENIX-2014-T.{split}.corpus.csv")
    if not os.path.exists(filepath):
         raise FileNotFoundError(f"Annotation file not found: {filepath}")
    try:
        df = pd.read_csv(filepath, sep='|')
        required_cols = ['name', 'orth', 'translation']
        if not all(col in df.columns for col in required_cols):
            missing = [col for col in required_cols if col not in df.columns]
            found = list(df.columns)
            raise ValueError(f"Missing required columns in {filepath}. Missing: {missing}. Found: {found}. Expected: {required_cols}")
        # Return ONLY the gloss column ('orth') for building the gloss vocab
        return df['orth'].tolist()
    except Exception as e:
        print(f"Error loading or parsing {filepath}: {e}")
        raise

# --- Helper function to load annotations ---
def load_phoenix_annotations_for_data(annotation_path, split): # Renamed for clarity
    filepath = os.path.join(annotation_path, f"PHOENIX-2014-T.{split}.corpus.csv")
    if not os.path.exists(filepath):
         raise FileNotFoundError(f"Annotation file not found: {filepath}")
    try:
        df = pd.read_csv(filepath, sep='|')
        # Need 'name' for video ID, 'orth' for gloss sequence, 'translation' for spoken text
        required_cols = ['name', 'orth', 'translation']
        if not all(col in df.columns for col in required_cols):
            missing = [col for col in required_cols if col not in df.columns]
            found = list(df.columns)
            raise ValueError(f"Missing required columns in {filepath}. Missing: {missing}. Found: {found}. Expected: {required_cols}")
        # Select necessary columns
        df_selected = df[required_cols].copy()
        # Clean potential NaN
        df_selected.dropna(subset=['orth', 'translation'], inplace=True)
        df_selected['orth'] = df_selected['orth'].astype(str)
        df_selected['translation'] = df_selected['translation'].astype(str)
        return df_selected
    except Exception as e:
        print(f"Error loading or parsing {filepath}: {e}")
        raise

if __name__ == "__main__":
    print("Building/Loading Gloss Vocabulary for SLR...")
    try:
        # Ensure parent directory exists
        os.makedirs(os.path.dirname(config.VOCAB_PATH_GLOSS), exist_ok=True)

        # Check if vocab file exists
        if not os.path.exists(config.VOCAB_PATH_GLOSS):
            print(f"Gloss vocab file '{config.VOCAB_PATH_GLOSS}' not found. Building...")
            # Load sentences (glosses) from train split
            train_glosses = load_phoenix_annotations_for_vocab(config.ANNOTATION_PATH, "train")
            # Build the gloss vocab
            gloss_vocab = Vocabulary(config.VOCAB_PATH_GLOSS) # Create instance first
            gloss_vocab.build_vocab(train_glosses, vocab_size=3000) # Adjust size as needed
        else:
            print(f"Gloss vocab file found. Loading...")
            gloss_vocab = Vocabulary(config.VOCAB_PATH_GLOSS)

        print(f"Gloss Vocab Size: {len(gloss_vocab)}")
        print(f"  Blank index ({config.CTC_BLANK_TOKEN}): {gloss_vocab.blank_idx}")
        print(f"  Pad index ({config.PAD_TOKEN}): {gloss_vocab.pad_idx}")
        print(f"  Unk index ({config.UNK_TOKEN}): {gloss_vocab.unk_idx}")
        print("Gloss Vocabulary ready.")

        # Test encoding/decoding
        test_gloss_seq = "ICH MORGEN ZU HAUS BLEIBEN"
        encoded = gloss_vocab.encode(test_gloss_seq)
        print(f"Test encode: '{test_gloss_seq}' -> {encoded}")
        decoded = gloss_vocab.decode(encoded)
        print(f"Test decode: {encoded} -> '{decoded}'")
        # Test decoding with special tokens
        encoded_with_special = [gloss_vocab.sos_idx] + encoded + [gloss_vocab.eos_idx, gloss_vocab.pad_idx, gloss_vocab.blank_idx]
        decoded_raw = gloss_vocab.decode(encoded_with_special, remove_special=False)
        decoded_clean = gloss_vocab.decode(encoded_with_special, remove_special=True)
        print(f"Decode special (raw): {encoded_with_special} -> '{decoded_raw}'")
        print(f"Decode special (clean): {encoded_with_special} -> '{decoded_clean}'")


    except FileNotFoundError as e:
        print(f"\nError building/loading vocabulary: {e}")
        print("Please ensure ANNOTATION_PATH in config.py is correct and the training annotation file exists.")
    except ValueError as e:
        print(f"\nError building/loading vocabulary: {e}")
    except Exception as e:
         print(f"\nAn unexpected error occurred during vocabulary processing: {e}")
         import traceback
         traceback.print_exc()