import React from 'react';
import { CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react';

const ToastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  OFFLINE: 'offline',
  ONLINE: 'online'
};

const FeedbackToast = ({ type, message, visible, onClose }) => {
  const icons = {
    [ToastTypes.SUCCESS]: CheckCircle,
    [ToastTypes.ERROR]: XCircle,
    [ToastTypes.OFFLINE]: WifiOff,
    [ToastTypes.ONLINE]: Wifi,
  };

  const Icon = icons[type];

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
        {Icon && <Icon className="w-5 h-5" />}
        <span>{message}</span>
      </div>
    </div>
  );
};

export default FeedbackToast;