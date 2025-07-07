import torch
import torch.nn as nn

class BiLSTMEncoder(nn.Module):
    def __init__(self, input_dim: int, lstm_hidden_dim: int, num_layers: int, dropout: float = 0.4):
        """
        Args:
            input_dim (int): Dimension of input features at each time step.
            lstm_hidden_dim (int): Dimension of the hidden state for each LSTM direction.
                       The output dimension will be 2 * lstm_hidden_dim.
            num_layers (int): Number of stacked LSTM layers.
            dropout (float): Dropout rate applied between LSTM layers (if num_layers > 1).
        """
        super().__init__()
        self.input_dim = input_dim
        self.lstm_hidden_dim = lstm_hidden_dim
        self.num_layers = num_layers

        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=lstm_hidden_dim,
            num_layers=num_layers,
            batch_first=True,      
            dropout=dropout if num_layers > 1 else 0,
            bidirectional=True
        )

    def forward(self, x: torch.Tensor, src_key_padding_mask=None) -> torch.Tensor:
        """
        Args:
            x (Tensor): Input tensor de forme (batch_size, seq_len, input_dim).
            src_key_padding_mask : Ignoré par le LSTM de base, mais gardé pour compatibilité d'interface si besoin.

        Returns:
            Tensor: Sortie encodée de forme (batch_size, seq_len, 2 * lstm_hidden_dim)
        """
        output, (h_n, c_n) = self.lstm(x)
        return output

    def get_output_dim(self):
        """Returns the output dimension of this encoder."""
        return 2 * self.lstm_hidden_dim