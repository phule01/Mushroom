export interface DetectionItem {
  id: number;
  score: number;
  box: [number, number, number, number]; // [x1, y1, x2, y2]
  maskPolygon?: [number, number][];
  maskRle?: string;
  label?: string;
}

export interface SampleImage {
  id: string;
  name: string;
  description: string;
  url: string;
  defaultPrompt: string;
  detections: DetectionItem[];
}
