import math
from collections import defaultdict

def log_sum_exp(a, b):
    if a == -float("inf"):
        return b
    if b == -float("inf"):
        return a
    return max(a, b) + math.log1p(math.exp(-abs(a - b)))

def collapse_repeats_and_remove_blanks(seq, blank_idx):
    """
    Collapse repeated tokens and remove blanks
    Args:
        seq (List[int])
    """
    collapsed = []
    prev = None
    for token in seq:
        if token != blank_idx and token != prev:
            collapsed.append(token)
        prev = token
    return collapsed

def ctc_beam_search_decoder(log_probs_batch, input_lengths, beam_width=3, blank_idx=1):
    """
    Beam search CTC decoder with blank filtering and repeat collapsing.

    Args:
        log_probs_batch (Tensor): (B, T, V) log-probs after log-softmax
        input_lengths (Tensor): Lengths for each sequence
        beam_width (int): Beam size
        blank_idx (int): Index of the blank token

    Returns:
        List[List[int]]: Decoded sequences (token indices)
    """
    B, T, V = log_probs_batch.shape
    results = []

    for b in range(B):
        log_probs = log_probs_batch[b][:input_lengths[b]]  # (T_b, V)
        T_b = log_probs.size(0)
        beams = [([], 0.0)] # (sequence, score)

        for t in range(T_b):
            new_beams = defaultdict(lambda: -float("inf"))

            for seq, score in beams:
                for i in range(V):
                    new_seq = list(seq)
                    if i != blank_idx:
                        if len(seq) == 0 or seq[-1] != i:
                            new_seq.append(i)

                    new_score = score + log_probs[t, i].item()
                    new_beams[tuple(new_seq)] = log_sum_exp(new_beams[tuple(new_seq)], new_score)

            beams = sorted(new_beams.items(), key=lambda x: x[1], reverse=True)[:beam_width]

        best_seq, _ = beams[0]
        best_seq = collapse_repeats_and_remove_blanks(list(best_seq), blank_idx)
        results.append(best_seq)

    return results
