import React, { useCallback, useEffect, useState, createContext, useContext } from 'react';
import { CheckCircleIcon, XCircleIcon, InfoIcon, XIcon } from 'lucide-react';
type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}
interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}
const ToastContext = createContext<ToastContextType | undefined>(undefined);
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
export const ToastProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prevToasts => [...prevToasts, {
      id,
      message,
      type,
      duration
    }]);
  }, []);
  const hideToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);
  return <ToastContext.Provider value={{
    toasts,
    showToast,
    hideToast
  }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>;
};
const ToastContainer: React.FC = () => {
  const {
    toasts,
    hideToast
  } = useToast();
  return <div className="fixed bottom-4 inset-x-0 z-50 flex flex-col items-center space-y-2 pointer-events-none">
      {toasts.map(toast => <ToastItem key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />)}
    </div>;
};
const ToastItem: React.FC<{
  toast: Toast;
  onClose: () => void;
}> = ({
  toast,
  onClose
}) => {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onClose();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onClose]);
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <InfoIcon className="w-5 h-5 text-blue-500" />;
    }
  };
  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };
  return <div className={`flex items-center justify-between px-4 py-3 rounded-2xl shadow-md border ${getBgColor()} max-w-md w-full mx-4 animate-fade-in pointer-events-auto`} role="alert">
      <div className="flex items-center">
        {getIcon()}
        <p className="ml-3 text-sm font-medium text-gray-800">
          {toast.message}
        </p>
      </div>
      <button onClick={onClose} className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        <XIcon className="h-4 w-4" />
      </button>
    </div>;
};

// Simple standalone Toast component for use without provider
export const Toast: React.FC<{
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <InfoIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <div className={`flex items-center justify-between px-4 py-3 rounded-2xl shadow-md border ${getBgColor()} max-w-md w-full mx-4`} role="alert">
        <div className="flex items-center">
          {getIcon()}
          <p className="ml-3 text-sm font-medium text-gray-800">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};