#!/bin/bash
echo "========================================================"
echo "       MUSHROOM COUNTER - LOCAL AI TOOL"
echo "========================================================"
echo ""

if [ ! -d "dist" ]; then
    echo "[1/3] Building user interface..."
    npm install
    npm run build
    if [ $? -ne 0 ]; then
        echo "Error building the UI. Make sure Node.js is installed."
        exit 1
    fi
else
    echo "[1/3] User interface already built."
fi

echo ""
echo "[2/3] Starting SAM 3 AI Model..."
echo "NOTE: It may take 15-30 seconds for the model to load into RAM/VRAM."
echo ""
PORT=7860
export PORT

echo "[2.5/3] Checking Python dependencies..."
source "$(conda info --base)/etc/profile.d/conda.sh" 2>/dev/null
conda activate sam3 2>/dev/null
python -c "import gradio, torch, fastapi, uvicorn" >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo ""
    echo "========================================================"
    echo "[ERROR] Python dependencies not found!"
    echo "It seems you haven't activated the 'sam3' Conda environment,"
    echo "or you haven't installed the requirements yet."
    echo ""
    echo "Please open your terminal and run:"
    echo "1. conda activate sam3"
    echo "2. pip install -r requirements.txt"
    echo "3. Run this script again."
    echo "========================================================"
    exit 1
fi

echo ""
echo "[HOW TO STOP]"
echo "To TURN OFF the model and free up RAM, press CTRL+C in this window."
echo "--------------------------------------------------------"
echo ""
python app.py
