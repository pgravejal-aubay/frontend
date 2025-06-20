import json
import pandas as pd
import re
import os

class SimpleTokenizer:
    def __init__(self, vocab_file: str = None):
        self.vocab = {"<blank>": 0, "<pad>": 1, "<unk>": 2}
        self.inv_vocab = {0: "<blank>", 1: "<pad>", 2: "<unk>"}
        self._next_id = 3
        self.blank_token = "<blank>"

        if vocab_file:
            print(f"📥 Loading vocab from {vocab_file}")
            self.load_vocab(vocab_file)

    def get_pad_idx(self):
        return self.vocab["<pad>"]

    def get_blank_idx(self):
        return self.vocab["<blank>"]

    def get_unk_idx(self):
        return self.vocab["<unk>"]

    def encode(self, text, allow_new_tokens=True):
        if not text or not isinstance(text, str):
            print("⚠️ Invalid text input. Must be a non-empty string.")
            return []
        tokens = text.strip().split()
        ids = []
        for token in tokens:
            if token not in self.vocab:
                if allow_new_tokens:
                    self.vocab[token] = self._next_id
                    self.inv_vocab[self._next_id] = token
                    self._next_id += 1
                else:
                    ids.append(self.get_unk_idx())
                    continue
            ids.append(self.vocab[token])
        return ids

    def decode(self, ids):
        return " ".join(self.inv_vocab.get(i, "<unk>") for i in ids)

    def vocab_size(self):
        return len(self.vocab)

    def save_vocab(self, path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.vocab, f, indent=2, ensure_ascii=False)
        print(f"💾 Vocab saved to {path} ({self.vocab_size()} tokens)")

    def load_vocab(self, path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                self.vocab = json.load(f)
            self.inv_vocab = {v: k for k, v in self.vocab.items() if isinstance(v, int)}
            for special in ["<blank>", "<pad>", "<unk>"]:
                if special not in self.vocab:
                    raise ValueError(f"Special token '{special}' missing from vocab file: {path}")
            self._next_id = max(v for v in self.vocab.values() if isinstance(v, int)) + 1
            print(f"✅ Loaded vocab with {self.vocab_size()} tokens from {path}")
        except FileNotFoundError:
            print(f"❌ Vocab file not found at {path}. Starting with base vocab.")
            # Garder le vocabulaire de base initialisé dans __init__
            self.vocab = {"<blank>": 0, "<pad>": 1, "<unk>": 2}
            self.inv_vocab = {0: "<blank>", 1: "<pad>", 2: "<unk>"}
            self._next_id = 3
        except json.JSONDecodeError:
            print(f"❌ Error decoding JSON from vocab file: {path}. Starting with base vocab.")
            self.vocab = {"<blank>": 0, "<pad>": 1, "<unk>": 2}
            self.inv_vocab = {0: "<blank>", 1: "<pad>", 2: "<unk>"}
            self._next_id = 3
        except Exception as e:
             print(f"❌ An unexpected error occurred loading vocab: {e}. Starting with base vocab.")
             self.vocab = {"<blank>": 0, "<pad>": 1, "<unk>": 2}
             self.inv_vocab = {0: "<blank>", 1: "<pad>", 2: "<unk>"}
             self._next_id = 3


    def build_vocab_from_file(self, annotations_file):
        try:
            df = pd.read_csv(annotations_file, sep="|")
            print(f"🏗️ Building vocab from {annotations_file}...")
            count = 0
            for sentence in df["orth"]:
                if isinstance(sentence, str):
                    self.encode(sentence, allow_new_tokens=True)
                    count +=1
                else:
                    print(f"⚠️ Skipping non-string entry in 'orth' column: {sentence}")
            print(f"Processed {count} sentences for vocab building.")
        except FileNotFoundError:
             print(f"❌ Annotation file not found for vocab building: {annotations_file}")
        except KeyError:
             print(f"❌ Column 'orth' not found in annotation file: {annotations_file}")
        except Exception as e:
             print(f"❌ An error occurred during vocab building: {e}")


    def fit(self, dataset):
        for _, text in dataset:
            self.encode(text, allow_new_tokens=True)

    def show_vocab_stats(self, top_n=20):
        print(f"📊 Vocab size: {self.vocab_size()}")
        if self.vocab_size() <= 3: # Only special tokens
             print("   Only special tokens present.")
             return
        sorted_vocab = sorted([item for item in self.vocab.items() if item[1] >= 3], key=lambda x: x[1])
        print("   First few non-special tokens:")
        for token, idx in sorted_vocab[:top_n]:
            print(f"     '{token}' → {idx}")