import { DetectionItem } from '../types';

export const SAM3_COLORS = [
  'rgba(0, 255, 0, 0.5)',
  'rgba(255, 0, 0, 0.5)',
  'rgba(0, 0, 255, 0.5)',
  'rgba(255, 255, 0, 0.5)',
  'rgba(0, 255, 255, 0.5)',
  'rgba(255, 0, 255, 0.5)',
  'rgba(128, 255, 0, 0.5)',
  'rgba(0, 128, 255, 0.5)',
  'rgba(255, 128, 0, 0.5)',
];

export const SAM3_BORDER_COLORS = [
  '#00ff00', '#ff0000', '#0000ff', '#ffff00', 
  '#00ffff', '#ff00ff', '#80ff00', '#0080ff', '#ff8000'
];

import { Client } from "@gradio/client";

export async function detectMushroomsInImage(img: HTMLImageElement, prompt: string, threshold: number): Promise<{detections: DetectionItem[], outputImageUrl?: string}> {
  try {
    // Kết nối tới server Gradio API (được mount tại /api/)
    const client = await Client.connect(window.location.origin + "/api/");
    
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context failed");
    ctx.drawImage(img, 0, 0);
    
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg'));
    if (!blob) throw new Error("Image conversion failed");

    // Gọi API tới Local Gradio server
    const result = await client.predict("/predict", { 
        image: blob, 
        prompt: prompt, 
        conf_threshold: threshold 
    });
    
    const resultData = result.data as any[];
    let detections: DetectionItem[] = [];
    let outputImageUrl: string | undefined = undefined;

    if (resultData && resultData.length >= 3) {
      if (resultData[0]) {
        outputImageUrl = typeof resultData[0] === 'string' ? resultData[0] : (resultData[0].url || resultData[0].path);
      }
      
      const jsonStr = resultData[2];
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed && parsed.detections) {
          detections = parsed.detections;
        }
      } catch (e) {
        console.error("JSON parse error:", e);
      }
      return { detections, outputImageUrl };
    }
    
    return { detections: [] };
  } catch (error) {
    console.error("Gradio API error:", error);
    return { detections: [] };
  }
}

