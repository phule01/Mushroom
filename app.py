import gradio as gr
import torch
import numpy as np
from PIL import Image
import os
import sys

# Import our counting logic
try:
    from sam3_count import load_sam3_model, count_mushrooms, draw_masks
except ImportError:
    print("Cannot import sam3_count. Make sure it is in the same directory.")
    sys.exit(1)

# Global variables to hold model state so it only loads once
print("Starting App and Loading SAM 3 Model (this may take a moment)...")
try:
    processor, device = load_sam3_model()
    print("SAM 3 Model loaded successfully!")
except Exception as e:
    print(f"Failed to load model: {e}")
    sys.exit(1)

def process_image(image, prompt, conf_threshold):
    if image is None:
        return None, "Vui lòng tải lên một bức ảnh.", "{}"
    
    # Run SAM3
    with torch.autocast("cuda", dtype=torch.bfloat16):
        _, masks, boxes, scores = new_count_mushrooms(
            image_path=None, 
            processor=processor, 
            text_prompt=prompt, 
            conf_threshold=conf_threshold,
            image_obj=image
        )
    
    count = len(masks)
    
    if count > 0:
        result_img = draw_masks(image, masks, boxes, scores)
        message = f"🍄 SAM 3 đếm được: {count} cây nấm."
    else:
        result_img = image
        message = f"Không tìm thấy nấm nào với ngưỡng Confidence {conf_threshold}."
        
    # Chuẩn bị dữ liệu JSON cho React Frontend
    import json
    detections = []
    for i, (box, score) in enumerate(zip(boxes, scores)):
        detections.append({
            "id": i + 1,
            "score": float(score),
            "box": [float(x) for x in box],
            "label": prompt
        })
    json_result = json.dumps({"detections": detections})
        
    return result_img, message, json_result

# We need to monkey-patch sam3_count.count_mushrooms to support passing an image directly
# so we don't have to save/load from disk in the web app
import sam3_count
original_count = sam3_count.count_mushrooms

def new_count_mushrooms(image_path, processor, text_prompt="mushroom", conf_threshold=0.65, image_obj=None):
    if image_obj is not None:
        image = image_obj.convert("RGB")
    else:
        image = Image.open(image_path).convert("RGB")
        
    state = processor.set_image(image)
    state = processor.set_confidence_threshold(conf_threshold, state)
    state = processor.set_text_prompt(text_prompt, state)
    
    masks = state["masks"]
    boxes = state["boxes"]
    scores = state["scores"]
    
    masks_np = masks.to(torch.float32).cpu().numpy() if isinstance(masks, torch.Tensor) else masks
    boxes_np = boxes.to(torch.float32).cpu().numpy() if isinstance(boxes, torch.Tensor) else boxes
    scores_np = scores.to(torch.float32).cpu().numpy() if isinstance(scores, torch.Tensor) else scores
    
    return image, masks_np, boxes_np, scores_np

sam3_count.count_mushrooms = new_count_mushrooms

# Build Gradio UI
with gr.Blocks(title="SAM 3 Mushroom Counter", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# 🍄 Nhận Diện và Đếm Nấm Bằng SAM 3 (Zero-Shot)")
    gr.Markdown("Tải ảnh bất kỳ lên, mô hình SAM 3 của Meta sẽ tự động tìm và đếm tổng số nấm có trong ảnh.")
    
    with gr.Row():
        with gr.Column(scale=1):
            input_image = gr.Image(type="pil", label="Tải ảnh nấm của bạn lên")
            prompt_input = gr.Textbox(value="mushroom", label="Từ khóa (Text Prompt)", interactive=True)
            conf_slider = gr.Slider(minimum=0.1, maximum=1.0, value=0.65, step=0.05, label="Ngưỡng độ nhạy (Confidence Threshold)")
            submit_btn = gr.Button("🔍 Đếm Nấm", variant="primary")
            
        with gr.Column(scale=1):
            output_image = gr.Image(type="pil", label="Kết quả")
            result_text = gr.Textbox(label="Tổng kết", interactive=False)
            json_output = gr.Textbox(label="JSON API Output (Dành cho Frontend)", interactive=False)
            
    submit_btn.click(
        fn=process_image,
        inputs=[input_image, prompt_input, conf_slider],
        outputs=[output_image, result_text, json_output],
        api_name="predict"
    )
    
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Gradio app on /api
app = gr.mount_gradio_app(app, demo, path="/api")

# Serve React build (dist folder) on /
dist_path = os.path.join(os.path.dirname(__file__), "dist")
if os.path.exists(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")
else:
    @app.get("/")
    def read_root():
        return RedirectResponse(url="/api")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
