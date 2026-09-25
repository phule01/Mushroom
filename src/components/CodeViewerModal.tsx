import React from 'react';

export function CodeViewerModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-lg">Mã nguồn Giao diện (React)</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-red-500">Đóng</button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[70vh] bg-slate-950 text-emerald-400 font-mono text-sm">
          // 🚀 Frontend được viết bằng React + Vite + TailwindCSS<br/>
          // Để xem toàn bộ code, bạn có thể kiểm tra kho lưu trữ GitHub.
        </div>
      </div>
    </div>
  );
}
