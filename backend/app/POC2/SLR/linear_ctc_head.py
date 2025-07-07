import torch.nn as nn

class LinearCTCHead(nn.Module):
    def __init__(self, model_dim, vocab_size, blank_idx=0):
        super().__init__()
        self.linear = nn.Linear(model_dim, vocab_size)
        self.blank_idx = blank_idx
        self.reset_parameters()

    def reset_parameters(self):
        nn.init.xavier_uniform_(self.linear.weight)
        nn.init.zeros_(self.linear.bias)
        # self.linear.bias.data[self.blank_idx] = -5.0

    def forward(self, x):
        return self.linear(x)
