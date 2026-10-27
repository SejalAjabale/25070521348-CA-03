import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 size={18} className="toast-icon-success" />,
    error: <AlertCircle size={18} className="toast-icon-error" />,
    info: <Info size={18} className="toast-icon-info" />
  };

  return (
    <div className={`toast-notification toast-${type}`}>
      <div className="toast-content">
        {icons[type] || icons.info}
        <span className="toast-text">{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="toast-close-btn" aria-label="Close notification">
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export default Toast;
