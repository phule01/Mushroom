"""
Mushroom Counter using SAM 3 (Segment Anything with Concepts)
Zero-shot counting with text prompt "mushroom"
"""
import torch
import numpy as np
from PIL import Image, ImageDraw
import sys
import os
import argparse

def load_sam3_model():
    """Load SAM 3 model with text-prompted segmentation"""
    try:
        from sam3 import build_sam3_image_model
        from sam3.model.sam3_image_processor import Sam3Processor
    except ImportError:
        print("SAM 3 is not installed or not in python path.")
        sys.exit(1)
        
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Device: {device}")
    
    print("Loading SAM 3 Image Model (this may download weights from HF)...")
    # Will auto-download checkpoint from HF
    # Requires HF_TOKEN env var or huggingface-cli login if weights are gated
    model = build_sam3_image_model(compile=False, load_from_HF=True)
    
    print("Initializing Processor...")
    processor = Sam3Processor(model, device=device)
    
    return processor, device

def count_mushrooms(image_path, processor, text_prompt="mushroom", conf_threshold=0.3):
    """Count mushrooms using SAM 3 text-prompted detection"""
    image = Image.open(image_path).convert("RGB")
    
    # 1. Set image
    state = processor.set_image(image)
    
    # 2. Set confidence threshold
    state = processor.set_confidence_threshold(conf_threshold, state)
    
    # 3. Set text prompt and trigger grounding
    state = processor.set_text_prompt(text_prompt, state)
    
    masks = state["masks"]  # (N, H, W)
    boxes = state["boxes"]  # (N, 4) in xyxy format
    scores = state["scores"] # (N,)
    
    # Move to CPU for processing and convert to float32 to avoid NumPy bfloat16 errors
    masks_np = masks.to(torch.float32).cpu().numpy() if isinstance(masks, torch.Tensor) else masks
    boxes_np = boxes.to(torch.float32).cpu().numpy() if isinstance(boxes, torch.Tensor) else boxes
    scores_np = scores.to(torch.float32).cpu().numpy() if isinstance(scores, torch.Tensor) else scores
    
    return image, masks_np, boxes_np, scores_np

def draw_masks(image, masks, boxes, scores):
    """Draw colored masks and boxes on image"""
    img_array = np.array(image).copy()
    
    colors = [
        (0, 255, 0), (255, 0, 0), (0, 0, 255), 
        (255, 255, 0), (0, 255, 255), (255, 0, 255),
        (128, 255, 0), (0, 128, 255), (255, 128, 0),
    ]
    
    for i, mask in enumerate(masks):
        if mask.shape[0] == 1:
            mask = mask[0]  # Remove channel dim if present
            
        color = colors[i % len(colors)]
        mask_overlay = np.zeros_like(img_array)
        mask_overlay[mask > 0] = color
        
        # Apply mask with alpha
        img_array = np.where(mask[..., None] > 0, 
                             (img_array * 0.5 + mask_overlay * 0.5).astype(np.uint8), 
                             img_array)
    
    result = Image.fromarray(img_array)
    draw = ImageDraw.Draw(result)
    
    for i, (box, score) in enumerate(zip(boxes, scores)):
        x1, y1, x2, y2 = box
        draw.rectangle([x1, y1, x2, y2], outline="red", width=2)
        draw.text((x1, max(0, y1 - 15)), f"#{i+1} {score:.2f}", fill="lime")
    
    return result

def main():
    parser = argparse.ArgumentParser(description="Count mushrooms using SAM3")
    parser.add_argument("image_path", help="Path to input image")
    parser.add_argument("--prompt", default="mushroom", help="Text prompt for SAM3")
    parser.add_argument("--conf", type=float, default=0.3, help="Confidence threshold")
    args = parser.parse_args()
    
    if not os.path.exists(args.image_path):
        print(f"Error: {args.image_path} not found")
        sys.exit(1)
        
    try:
        processor, device = load_sam3_model()
    except Exception as e:
        print(f"\nFailed to load SAM3 model: {e}")
        print("Note: SAM3 weights might require a HuggingFace Token.")
        print("Run: huggingface-cli login")
        sys.exit(1)
        
    print(f"Detecting: '{args.prompt}' in {args.image_path}")
    with torch.autocast("cuda", dtype=torch.bfloat16):
        image, masks, boxes, scores = count_mushrooms(args.image_path, processor, args.prompt, args.conf)
    
    count = len(masks)
    print(f"\n{'='*50}")
    print(f"Tong so nam dem duoc: {count}")
    print(f"{'='*50}")
    
    for i, score in enumerate(scores):
        print(f"  Nam #{i+1}: confidence {score:.2f}")
    
    if count > 0:
        result = draw_masks(image, masks, boxes, scores)
        out_path = os.path.splitext(args.image_path)[0] + "_sam3_result.jpg"
        result.save(out_path)
        print(f"\nSaved visualization to: {out_path}")
    else:
        print("No mushrooms found with the current confidence threshold.")

if __name__ == "__main__":
    main()
