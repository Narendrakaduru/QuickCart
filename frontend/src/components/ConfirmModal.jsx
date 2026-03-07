import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel', type = 'danger' }) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: <AlertTriangle size={32} className="text-red-500" />,
      confirmBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: <AlertTriangle size={32} className="text-yellow-500" />,
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
    }
  };

  const currentType = typeConfig[type] || typeConfig.danger;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-1 flex justify-end">
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="px-6 pb-6 pt-2 flex flex-col items-center text-center">
          <div className="mb-4 bg-gray-50 p-4 rounded-full">
            {currentType.icon}
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
          <p className="text-gray-500 mb-8">{message}</p>
          
          <div className="w-full flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-gray-700 font-bold hover:bg-gray-100 rounded-sm transition uppercase text-xs tracking-wider"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 ${currentType.confirmBg} text-white font-bold rounded-sm shadow-md transition uppercase text-xs tracking-wider`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
