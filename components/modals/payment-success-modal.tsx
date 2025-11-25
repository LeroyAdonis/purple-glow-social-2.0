'use client';

import React, { useEffect, useState } from 'react';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'credits' | 'subscription';
  amount: number;
  credits?: number;
  plan?: string;
}

export default function PaymentSuccessModal({ isOpen, onClose, type, amount, credits, plan }: PaymentSuccessModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-[fall_3s_linear]"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 2}s`,
                fontSize: '20px'
              }}
            >
              {['🎉', '✨', '🌟', '💜', '⚡'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}
      
      <div className="aerogel-card p-8 rounded-3xl w-full max-w-md relative z-10 animate-enter text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 mx-auto mb-6 flex items-center justify-center animate-[bounce_0.5s_ease-in-out]">
          <i className="fa-solid fa-check text-4xl text-white"></i>
        </div>

        <h2 className="font-display font-bold text-3xl mb-2">Payment Successful!</h2>
        <p className="text-gray-400 mb-8">
          {type === 'credits' 
            ? `${credits} credits have been added to your account` 
            : `You're now subscribed to ${plan}`}
        </p>

        <div className="aerogel-card p-6 rounded-2xl mb-6 bg-white/5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-400">Amount Paid</span>
            <span className="font-mono font-bold text-2xl text-green-400">R{amount.toFixed(2)}</span>
          </div>
          {type === 'credits' && credits && (
            <div className="flex justify-between items-center pt-3 border-t border-glass-border">
              <span className="text-sm text-gray-400">Credits Added</span>
              <span className="font-mono font-bold text-xl text-mzansi-gold">{credits}</span>
            </div>
          )}
        </div>

        <div className="space-y-3 text-sm text-gray-400 mb-6">
          <div className="flex items-center gap-2 justify-center">
            <i className="fa-solid fa-envelope text-joburg-teal"></i>
            <span>Receipt sent to your email</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <i className="fa-solid fa-file-invoice text-joburg-teal"></i>
            <span>View in billing history</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-neon-grape text-white font-bold rounded-xl hover:bg-opacity-90 transition-all"
        >
          Continue to Dashboard
        </button>
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
