import torch.nn as nn
import torch.nn.functional as F

class ResidualBlock1D(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size=3, stride=1, dropout_rate=0.1):
        super().__init__()
        # padding = (kernel_size - 1) // 2 # 'same' padding
        padding = kernel_size // 2 # 'same' padding for odd kernel_size

        self.conv1 = nn.Conv1d(in_channels, out_channels, kernel_size, stride, padding, bias=False)
        self.bn1 = nn.BatchNorm1d(out_channels)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout_rate)
        self.conv2 = nn.Conv1d(out_channels, out_channels, kernel_size, 1, padding, bias=False)
        self.bn2 = nn.BatchNorm1d(out_channels)

        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv1d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm1d(out_channels)
            )

    def forward(self, x):
        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)
        out = self.dropout(out)
        out = self.conv2(out)
        out = self.bn2(out)
        out += self.shortcut(x)
        out = self.relu(out)
        return out

class Temporal1DEncoderV2(nn.Module):
    def __init__(self, input_dim=369, block_dims=[128, 256, 512], out_dim=512, kernel_size=5, num_blocks_per_stage=[2, 2, 2], dropout_rate=0.2):
        super().__init__()
        
        assert len(block_dims) == len(num_blocks_per_stage), "block_dims and num_blocks_per_stage must have the same length"

        self.initial_conv = nn.Sequential(
            nn.Conv1d(input_dim, block_dims[0], kernel_size=kernel_size, padding=kernel_size//2, bias=False),
            nn.BatchNorm1d(block_dims[0]),
            nn.ReLU()
        )
        current_dim = block_dims[0]
        
        stages = []
        for i, stage_dim in enumerate(block_dims):
            stride = 1 
            stage_layers = []
            for j in range(num_blocks_per_stage[i]):
                stage_layers.append(ResidualBlock1D(current_dim, stage_dim, kernel_size, stride if j==0 else 1, dropout_rate))
                current_dim = stage_dim
            stages.append(nn.Sequential(*stage_layers))
            
        self.stages = nn.Sequential(*stages)
        
        self.final_proj = nn.Identity()
        if current_dim != out_dim:
            self.final_proj = nn.Conv1d(current_dim, out_dim, kernel_size=1)


    def forward(self, x):  # x: (B, T, D_in)
        x = x.permute(0, 2, 1)     
        x = self.initial_conv(x)
        x = self.stages(x)
        x = self.final_proj(x)      
        x = x.permute(0, 2, 1)     
        return x