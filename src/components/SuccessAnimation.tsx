import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface SuccessAnimationProps {
  message: string;
  onComplete?: () => void;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ message, onComplete }) => {
  const [show, setShow] = useState(true);
  const [checkmark, setCheckmark] = useState(false);

  useEffect(() => {
    // Animate checkmark after a brief delay
    const timer1 = setTimeout(() => {
      setCheckmark(true);
    }, 100);

    // Hide and call onComplete after animation
    const timer2 = setTimeout(() => {
      setShow(false);
      if (onComplete) {
        onComplete();
      }
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16 mb-4">
            <div className={`absolute inset-0 rounded-full border-4 transition-all duration-500 ${
              checkmark ? 'border-green-500' : 'border-gray-300'
            }`} />
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              checkmark ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}>
              <Check className="w-8 h-8 text-green-500" strokeWidth={3} />
            </div>
            {!checkmark && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <h3 className={`text-lg font-semibold text-gray-900 transition-all duration-300 ${
            checkmark ? 'opacity-100' : 'opacity-70'
          }`}>
            {message}
          </h3>
        </div>
      </div>
    </div>
  );
};

