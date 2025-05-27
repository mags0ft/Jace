#!/bin/bash

# --- Downloading Jace ---
echo "Cloning Jace repository..."
git clone https://github.com/mags0ft/Jace.git ./Jace
cd ./Jace

# --- Bootstrap the app ---
echo "Creating venv..."
python3 -m venv .venv
source ./.venv/bin/activate

echo "Installing dependencies..."
pip install -r ./requirements.txt

# --- Downloading models, make sure to have Ollama installed ---
echo "Pulling Ollama models..."
MODELS=(
    "qwen3:8b"
    "llama3.2:3b"
    "gemma3:4b"
    "mistral:7b"
)

for model in "${MODELS[@]}";
do
    echo "Pulling $model..."
    ollama pull $model
done

# --- Start the server ---
echo "Installation complete. Running server."
python3 ./src/server.py
