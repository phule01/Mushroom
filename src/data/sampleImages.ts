import { SampleImage } from '../types';

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sample-1',
    name: 'Nấm hương (Shiitake)',
    description: 'Ảnh mẫu nấm hương để test đếm',
    url: 'https://images.unsplash.com/photo-1590842247184-7a31201524e9?auto=format&fit=crop&w=400&q=80',
    defaultPrompt: 'mushroom',
    detections: [
      { id: 1, score: 0.98, box: [100, 100, 180, 180], label: 'mushroom' },
      { id: 2, score: 0.85, box: [200, 150, 260, 210], label: 'mushroom' }
    ]
  },
  {
    id: 'sample-2',
    name: 'Nấm đùi gà',
    description: 'Nấm mọc thành cụm',
    url: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&w=400&q=80',
    defaultPrompt: 'mushroom',
    detections: [
      { id: 1, score: 0.95, box: [150, 100, 250, 280], label: 'mushroom' }
    ]
  },
  {
    id: 'sample-3',
    name: 'Nấm mỡ',
    description: 'Nhiều nấm nhỏ trên cỏ',
    url: 'https://images.unsplash.com/photo-1517594422361-5e18d4198c23?auto=format&fit=crop&w=400&q=80',
    defaultPrompt: 'mushroom',
    detections: [
      { id: 1, score: 0.9, box: [50, 200, 100, 250], label: 'mushroom' },
      { id: 2, score: 0.88, box: [120, 210, 170, 260], label: 'mushroom' },
      { id: 3, score: 0.75, box: [200, 230, 240, 280], label: 'mushroom' }
    ]
  }
];
