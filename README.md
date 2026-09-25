# Mushroom Counter - Local AI Tool

This is a professional, purely local AI tool that counts mushrooms (or any objects) using the **SAM 3 (Segment Anything Model 3)**. It is designed to run entirely on your personal machine, offering absolute privacy and leveraging your local hardware (GPU) for instant inference, without the restrictions and costs of cloud deployment.

## Features
- **SAM 3 Core:** Uses the state-of-the-art SAM 3 for zero-shot object detection and segmentation.
- **Dynamic UI:** A beautiful, responsive React frontend.
- **Purely Local:** No data leaves your machine. Models run completely locally.
- **Toggleable Model:** You can turn the AI on only when you need it to free up your computer's RAM/VRAM when not in use.

## Prerequisites
1. **Miniconda / Anaconda**: To manage the Python environment for SAM 3.
2. **Node.js**: To build the React UI (only needed once).
3. **Git**: To clone this repository.

## Installation

### 1. Clone the project
```bash
git clone https://github.com/phule01/Mushroom.git
cd Mushroom
```

### 2. Setup the Python Environment (SAM 3)
Open your terminal (Anaconda Prompt recommended on Windows) and run:
```bash
conda create -n sam3 python=3.10 -y
conda activate sam3
pip install -r requirements.txt
```
*(Note: If you have a dedicated GPU, make sure you install the CUDA-compatible version of PyTorch first according to [PyTorch's official website](https://pytorch.org/get-started/locally/))*

## How to Run the Tool
Once installed, you don't need to manually start multiple servers. We have provided a single launcher script.

1. Open your terminal (Anaconda Prompt) and activate your environment:
   ```bash
   conda activate sam3
   ```
2. Run the launcher script:
   - **Windows:** Double click `run_mushroom_counter.bat` or run `.\run_mushroom_counter.bat` in terminal.
   - **Mac/Linux:** Run `bash run_mushroom_counter.sh`

3. The script will automatically build the UI (if it's the first time) and start the AI engine. Wait for it to say `Uvicorn running on http://0.0.0.0:7860`.
4. Open your web browser and navigate to: **http://localhost:7860**

## How to Turn OFF the Tool (Free up RAM)
Since SAM 3 is a massive neural network, it consumes a significant amount of RAM and GPU VRAM while running in the background to ensure instant responses. 

When you are done counting mushrooms, you should **Turn Off** the model to free up your computer's resources:
- Simply go to the terminal window where the script is running and press `CTRL + C`. 
- Close the terminal. 

The next time you need it, just run the launcher script again!
