import { useEffect, useState } from 'react';

interface RateLimitToastProps {
  active: boolean;
  retryAfter: number;
  onDismiss: () => void;
}

export function RateLimitToast({ active, retryAfter, onDismiss }: RateLimitToastProps) {
  const [countdown, setCountdown] = useState(retryAfter);

  useEffect(() => {
    if (!active) return;
    setCountdown(retryAfter);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [active, retryAfter, onDismiss]);

  if (!active) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 rounded-xl shadow-lg text-sm">
        <span className="text-amber-600 dark:text-amber-400 font-medium">
          ⚠ Rate limited — retry in {countdown}s
        </span>
        <button
          onClick={onDismiss}
          className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
