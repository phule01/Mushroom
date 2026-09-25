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

export async function detectMushroomsInImage(_img: HTMLImageElement, prompt: string, threshold: number): Promise<{detections: DetectionItem[]}> {
  // MOCK: Giả lập gọi API tới HuggingFace Spaces hoặc backend SAM 3
  return new Promise((resolve) => {
    setTimeout(() => {
      // Trả về vài kết quả giả cho UI render
      resolve({
        detections: [
          { id: 1, score: 0.95, box: [50, 50, 150, 150], label: prompt },
          { id: 2, score: 0.88, box: [200, 100, 280, 220], label: prompt },
          { id: 3, score: 0.72, box: [150, 250, 300, 350], label: prompt }
        ].filter(d => d.score >= threshold) as DetectionItem[]
      });
    }, 1500);
  });
}

export function renderSam3Visualization(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  detections: DetectionItem[],
  options: {
    showMasks?: boolean;
    showBoxes?: boolean;
    showScores?: boolean;
  } = {}
) {
  const { showMasks = true, showBoxes = true, showScores = true } = options;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = image.naturalWidth || image.width || 800;
  const height = image.naturalHeight || image.height || 600;

  canvas.width = width;
  canvas.height = height;

  // 1. Vẽ ảnh gốc
  ctx.drawImage(image, 0, 0, width, height);

  // 2. Vẽ mặt nạ với độ trong suốt (Alpha blend)
  if (showMasks) {
    detections.forEach((item, index) => {
      const color = SAM3_COLORS[index % SAM3_COLORS.length];
      const borderColor = SAM3_BORDER_COLORS[index % SAM3_BORDER_COLORS.length];
      const [x1, y1, x2, y2] = item.box;
      const bw = x2 - x1;
      const bh = y2 - y1;

      ctx.save();
      ctx.fillStyle = color;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;

      ctx.beginPath();
      const rx = bw * 0.45;
      const ry = bh * 0.42;
      const cx = x1 + bw * 0.5;
      const cy = y1 + bh * 0.45;
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      if (bh > bw * 1.1) {
        ctx.beginPath();
        const stemW = bw * 0.25;
        const stemH = bh * 0.45;
        ctx.roundRect(cx - stemW / 2, cy + ry * 0.4, stemW, stemH, [0, 0, 6, 6]);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // 3. Vẽ Bounding box (viền đỏ) và điểm số (chữ lime green) chuẩn SAM 3
  detections.forEach((item, index) => {
    const [x1, y1, x2, y2] = item.box;

    if (showBoxes) {
      ctx.save();
      ctx.strokeStyle = '#ef4444'; // Red outline
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.restore();
    }

    if (showScores) {
      ctx.save();
      const labelText = `#${index + 1} ${item.score.toFixed(2)}`;
      const fontSize = Math.max(14, Math.min(22, Math.floor((x2 - x1) * 0.12)));
      ctx.font = `bold ${fontSize}px monospace, sans-serif`;

      const textMetrics = ctx.measureText(labelText);
      const textW = textMetrics.width + 8;
      const textH = fontSize + 6;
      const labelY = Math.max(textH, y1 - 4);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(x1, labelY - textH, textW, textH);

      // Màu lime green trùng khớp với `fill="lime"` của Meta SAM 3
      ctx.fillStyle = '#22c55e';
      ctx.fillText(labelText, x1 + 4, labelY - 5);
      ctx.restore();
    }
  });
}
