#!/usr/bin/env bash
set -euo pipefail

# AL2023 使用 dnf
sudo dnf update -y
sudo dnf install -y gcc-c++ make python3 libstdc++-devel sqlite sqlite-devel
# 若還缺少：sudo dnf groupinstall -y "Development Tools"
