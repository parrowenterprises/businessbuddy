import { XMarkIcon } from '@heroicons/react/24/outline';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: '✓'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: '!'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: '⚠'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'i'
    }
  };

  const style = styles[type];

  return (
    <div
      className={`${style.bg} border ${style.border} ${style.text} px-3 sm:px-4 py-2.5 sm:py-3 rounded relative mb-3 sm:mb-4`}
      role="alert"
    >
      <div className="flex items-start sm:items-center">
        <span className="font-bold mr-2 text-base sm:text-lg">{style.icon}</span>
        <span className="block text-sm sm:text-base flex-1 pr-8">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1 hover:bg-white/50 rounded"
            aria-label="Close alert"
          >
            <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}
      </div>
    </div>
  );
} 