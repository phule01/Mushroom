import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Search, 
  Download, 
  Layers, 
  Square, 
  Tag, 
  Sparkles,
  Info,
  CheckCircle2,
  Sliders,
  Code2
} from 'lucide-react';
import { DetectionItem, SampleImage } from './types';
import { detectMushroomsInImage, renderSam3Visualization } from './utils/sam3Vision';

export default function App() {
  const [prompt, setPrompt] = useState<string>('mushroom');
  const [confThreshold, setConfThreshold] = useState<number>(0.65);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>('');
  const [selectedSample, setSelectedSample] = useState<SampleImage | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string>('Vui lòng tải ảnh lên để bắt đầu phân tích.');
  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [count, setCount] = useState<number>(0);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

  // Layer display toggles
  const [showMasks, setShowMasks] = useState<boolean>(true);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [showScores, setShowScores] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  // Xử lý và render khi ảnh, prompt hoặc threshold thay đổi
  const runDetection = async (imgSrc: string, currentPrompt: string, threshold: number, sample?: SampleImage | null) => {
    if (!imgSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgSrc;

    img.onload = async () => {
      loadedImageRef.current = img;

      let currentDetections: DetectionItem[] = [];

      if (sample && sample.url === imgSrc && currentPrompt.toLowerCase() === sample.defaultPrompt.toLowerCase()) {
        currentDetections = sample.detections.filter(d => d.score >= threshold);
      } else {
        const result = await detectMushroomsInImage(img, currentPrompt, threshold);
        currentDetections = result.detections;
      }

      setDetections(currentDetections);
      const detectedCount = currentDetections.length;
      setCount(detectedCount);

      if (detectedCount > 0) {
        setResultMessage(`🍄 SAM 3 đếm được: ${detectedCount} cây nấm.`);
      } else {
        setResultMessage(`Không tìm thấy nấm nào với ngưỡng Confidence ${threshold.toFixed(2)}.`);
      }

      if (canvasRef.current) {
        renderSam3Visualization(canvasRef.current, img, currentDetections, {
          showMasks,
          showBoxes,
          showScores,
        });
      }

      setIsProcessing(false);
    };

    img.onerror = () => {
      setIsProcessing(false);
      setResultMessage('Không thể tải bức ảnh này. Vui lòng thử tải lên ảnh khác.');
    };
  };

  useEffect(() => {
    if (canvasRef.current && loadedImageRef.current) {
      renderSam3Visualization(canvasRef.current, loadedImageRef.current, detections, {
        showMasks,
        showBoxes,
        showScores,
      });
    }
  }, [showMasks, showBoxes, showScores, detections]);

  useEffect(() => {
    runDetection(selectedImageSrc, prompt, confThreshold, selectedSample);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        setSelectedImageSrc(src);
        setSelectedSample(null);
        runDetection(src, prompt, confThreshold, null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: SampleImage) => {
    setSelectedSample(sample);
    setSelectedImageSrc(sample.url);
    setPrompt(sample.defaultPrompt);
    runDetection(sample.url, sample.defaultPrompt, confThreshold, sample);
  };

  const handleCountClick = () => {
    runDetection(selectedImageSrc, prompt, confThreshold, selectedSample);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `sam3_mushroom_count_${count}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-200/50 text-slate-900 pb-16">
      {/* Top Banner / Navigation */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-1.5 bg-amber-50 rounded-xl border border-amber-200">🍄</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                SAM 3 Mushroom Counter
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Zero-Shot Vision
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Segment Anything with Concepts (SAM 3) Model Implementation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Removed CodeViewerModal button and Sparkles badge */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            🍄 Nhận Diện và Đếm Nấm Bằng SAM 3 (Zero-Shot)
          </h2>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Tải ảnh bất kỳ lên, mô hình SAM 3 sẽ tự động tìm và đếm tổng số nấm có trong ảnh dựa trên văn bản định danh (prompt).
          </p>
        </div>

        {/* 2 Cột: Bố cục trực quan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* CỘT TRÁI: Nhập liệu */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                Tải ảnh nấm của bạn lên
              </h3>

              {/* Khu vực Upload Kéo thả */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-xl p-6 text-center cursor-pointer transition-colors group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  Nhấp để tải ảnh lên hoặc kéo thả tệp vào đây
                </p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP dung lượng tối đa 20MB</p>
              </div>

              {/* Bộ sưu tập mẫu nấm đã bị xóa theo yêu cầu */}

              {/* Nhập Prompt */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                  <span>Từ khóa (Text Prompt)</span>
                  <span className="text-xs font-normal text-slate-500">Khái niệm nhận diện</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="mushroom, shiitake, fungus..."
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm outline-none transition"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                </div>
              </div>

              {/* Slider Ngưỡng Confidence */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-slate-500" />
                    Ngưỡng độ nhạy (Confidence Threshold)
                  </label>
                  <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
                    {confThreshold.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="1.00"
                  step="0.05"
                  value={confThreshold}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setConfThreshold(val);
                    runDetection(selectedImageSrc, prompt, val, selectedSample);
                  }}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>0.10 (Nhạy nhất)</span>
                  <span>0.65 (Mặc định)</span>
                  <span>1.00 (Chính xác nhất)</span>
                </div>
              </div>

              {/* Nút Thực Thi */}
              <button
                type="button"
                onClick={handleCountClick}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-sm hover:shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang phân tích SAM 3...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>🔍 Đếm Nấm</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Info className="w-4 h-4 text-emerald-600" />
                Về mô hình SAM 3 (Segment Anything with Concepts)
              </div>
              <p>
                SAM 3 kết hợp khả năng phát hiện theo ngôn ngữ tự nhiên (Zero-Shot Text Prompting) và phân đoạn mặt nạ cấp độ pixel, cho phép đếm chính xác ngay cả các cây nấm nhỏ hoặc mọc thành cụm rậm rạp.
              </p>
            </div>
          </div>

          {/* CỘT PHẢI: Kết quả hiển thị */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Kết quả phân đoạn & đếm
                </h3>

                {/* Các nút Bật/Tắt Lớp (Layers) */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowMasks(!showMasks)}
                    className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition cursor-pointer ${
                      showMasks ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Mặt nạ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBoxes(!showBoxes)}
                    className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition cursor-pointer ${
                      showBoxes ? 'bg-white shadow-xs text-red-600' : 'text-slate-500'
                    }`}
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Khung</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowScores(!showScores)}
                    className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition cursor-pointer ${
                      showScores ? 'bg-white shadow-xs text-green-700' : 'text-slate-500'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Điểm số</span>
                  </button>
                </div>
              </div>

              {/* Khung Canvas Viewport */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center min-h-[380px] max-h-[560px]">
                <canvas 
                  ref={canvasRef} 
                  className="max-h-[540px] max-w-full object-contain w-auto h-auto rounded"
                />

                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-3">
                    <div className="w-8 h-8 border-3 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                    <span className="text-sm font-medium">Đang trích xuất mặt nạ phân đoạn SAM 3...</span>
                  </div>
                )}
              </div>

              {/* Tải ảnh kết quả */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  {detections.length} vùng nấm đã phân đoạn
                </span>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={detections.length === 0}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải ảnh kết quả</span>
                </button>
              </div>

              {/* Tổng kết kết quả */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Tổng kết
                </label>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm flex items-center gap-2">
                  <span className="text-lg">🍄</span>
                  <span>{resultMessage}</span>
                </div>
              </div>

              {/* Danh sách từng cá thể */}
              {detections.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Danh sách chi tiết từng cá thể nấm:
                  </div>
                  <div className="max-h-44 overflow-y-auto pr-1 space-y-1.5">
                    {detections.map((item, idx) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between text-xs px-3 py-2 bg-slate-50 rounded-lg border border-slate-200/70"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            #{idx + 1}
                          </span>
                          <span className="font-medium text-slate-800">
                            {item.label || `Cây nấm #${idx + 1}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-slate-400 text-[11px]">
                            Box: [{item.box.join(', ')}]
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                            {(item.score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
