interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export default function LoadingSpinner({ size = 'medium', fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-3 w-3 sm:h-4 sm:w-4',
    medium: 'h-6 w-6 sm:h-8 sm:w-8',
    large: 'h-10 w-10 sm:h-12 sm:w-12'
  };

  const spinner = (
    <div className="flex items-center justify-center">
      <svg
        className={`animate-spin ${sizeClasses[size]} text-blue-600`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50/75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
} 