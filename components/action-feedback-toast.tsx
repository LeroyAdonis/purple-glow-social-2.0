'use client';

/**
 * Action Feedback Toast Component
 * 
 * Provides success/error feedback for credit operations and limit-related actions.
 * Displays animated toasts with South African context.
 */

import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ActionFeedbackToastProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

// Hook for managing toasts
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        dismissToast(id);
      }, toast.duration || 5000);
    }

    return id;
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  // Convenience methods for credit operations
  const showCreditSuccess = (credits: number, action: 'deducted' | 'reserved' | 'released') => {
    const messages = {
      deducted: `Sharp sharp! ${credits} credit${credits !== 1 ? 's' : ''} deducted successfully.`,
      reserved: `Lekker! ${credits} credit${credits !== 1 ? 's' : ''} reserved for your scheduled post.`,
      released: `${credits} credit${credits !== 1 ? 's' : ''} released back to your account.`,
    };
    addToast({
      type: 'success',
      title: 'Credits Updated',
      message: messages[action],
    });
  };

  const showCreditError = (message: string) => {
    addToast({
      type: 'error',
      title: 'Credit Error',
      message: message || 'Eish! Something went wrong with your credits.',
    });
  };

  const showLimitWarning = (limitType: string, onUpgrade?: () => void) => {
    addToast({
      type: 'warning',
      title: 'Limit Reached',
      message: `You've reached your ${limitType} limit. Upgrade for more capacity.`,
      action: onUpgrade ? { label: 'Upgrade', onClick: onUpgrade } : undefined,
      duration: 10000,
    });
  };

  const showPublishSuccess = (platform: string) => {
    addToast({
      type: 'success',
      title: 'Post Published! 🎉',
      message: `Ayoba! Your post is now live on ${platform}.`,
    });
  };

  const showScheduleSuccess = (dateTime: string) => {
    addToast({
      type: 'success',
      title: 'Post Scheduled! 📅',
      message: `Sorted! Your post will go live on ${dateTime}.`,
    });
  };

  return {
    toasts,
    addToast,
    dismissToast,
    clearAll,
    showCreditSuccess,
    showCreditError,
    showLimitWarning,
    showPublishSuccess,
    showScheduleSuccess,
  };
}

export default function ActionFeedbackToast({ toasts, onDismiss }: ActionFeedbackToastProps) {
  if (toasts.length === 0) return null;

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500/10 border-green-500/30',
          icon: 'fa-solid fa-check-circle text-green-400',
          titleColor: 'text-green-400',
        };
      case 'error':
        return {
          bg: 'bg-red-500/10 border-red-500/30',
          icon: 'fa-solid fa-circle-exclamation text-red-400',
          titleColor: 'text-red-400',
        };
      case 'warning':
        return {
          bg: 'bg-mzansi-gold/10 border-mzansi-gold/30',
          icon: 'fa-solid fa-triangle-exclamation text-mzansi-gold',
          titleColor: 'text-mzansi-gold',
        };
      case 'info':
      default:
        return {
          bg: 'bg-joburg-teal/10 border-joburg-teal/30',
          icon: 'fa-solid fa-info-circle text-joburg-teal',
          titleColor: 'text-joburg-teal',
        };
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const styles = getToastStyles(toast.type);
        
        return (
          <div
            key={toast.id}
            className={`${styles.bg} border rounded-xl p-4 shadow-2xl animate-slide-in-right backdrop-blur-md`}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <i className={`${styles.icon} text-lg flex-shrink-0 mt-0.5`}></i>
              
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-bold ${styles.titleColor}`}>
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-sm text-gray-300 mt-1">
                    {toast.message}
                  </p>
                )}
                {toast.action && (
                  <button
                    onClick={toast.action.onClick}
                    className="mt-2 px-3 py-1 text-xs bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
                aria-label="Dismiss"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
