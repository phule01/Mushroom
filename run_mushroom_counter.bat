@echo off
echo ========================================================
echo        MUSHROOM COUNTER - LOCAL AI TOOL
echo ========================================================
echo.

IF NOT EXIST "dist\" (
    echo [1/3] Building user interface...
    call npm install
    call npm run build
    if %errorlevel% neq 0 (
        echo Error building the UI. Make sure Node.js is installed.
        pause
        exit /b %errorlevel%
    )
) ELSE (
    echo [1/3] User interface already built.
)

echo.
echo [2/3] Starting SAM 3 AI Model...
echo NOTE: It may take 15-30 seconds for the model to load into RAM/VRAM.
echo.
set PORT=7860

echo.
echo [HOW TO STOP]
echo To TURN OFF the model and free up RAM, press CTRL+C in this window.
echo --------------------------------------------------------
echo.
python app.py

pause
