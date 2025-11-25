'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  color?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  variant?: 'default' | 'compact';
  disabled?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
  buttonClassName = '',
  variant = 'default',
  disabled = false
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  // Calculate dropdown position
  const updatePosition = () => {
    if (dropdownRef.current && typeof window !== 'undefined') {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen) {
        updatePosition();
      }
      setIsOpen(!isOpen);
    }
  };

  // Update position on scroll/resize when open
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Check if click is inside the portal dropdown
        const portalDropdown = document.getElementById(dropdownId);
        if (portalDropdown && portalDropdown.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, dropdownId]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const dropdownContent = (
    <div
      id={dropdownId}
      className="fixed aerogel-card rounded-xl shadow-2xl z-[9999] max-h-64 overflow-y-auto animate-enter"
      role="listbox"
      style={{
        top: `${dropdownPosition.top - (typeof window !== 'undefined' ? window.scrollY : 0)}px`,
        left: `${dropdownPosition.left - (typeof window !== 'undefined' ? window.scrollX : 0)}px`,
        width: `${dropdownPosition.width}px`
      }}
    >
      <div className="p-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg
              transition-colors text-left
              ${value === option.value
                ? 'bg-neon-grape/20 text-white border border-neon-grape/30'
                : 'text-gray-300 hover:bg-white/5'
              }
            `}
            role="option"
            aria-selected={value === option.value}
          >
            {option.icon && (
              <i className={`${option.icon} ${option.color || 'text-gray-400'}`}></i>
            )}
            <span className="flex-1">{option.label}</span>
            {value === option.value && (
              <i className="fa-solid fa-check text-neon-grape text-sm"></i>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-3
          bg-white/5 border border-white/10 rounded-xl
          text-white text-left
          transition-all duration-200
          ${variant === 'compact' ? 'px-3 py-2 text-sm' : 'px-4 py-3'}
          ${disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-white/10 hover:border-neon-grape/50 focus:outline-none focus:border-neon-grape focus:ring-2 focus:ring-neon-grape/20'
          }
          ${buttonClassName}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 flex-1">
          {selectedOption?.icon && (
            <i className={`${selectedOption.icon} ${selectedOption.color || 'text-gray-400'}`}></i>
          )}
          <span className={selectedOption ? 'text-white' : 'text-gray-500'}>
            {selectedOption?.label || placeholder}
          </span>
        </span>
        <i className={`fa-solid fa-chevron-down text-xs text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && mounted && createPortal(dropdownContent, document.body)}
    </div>
  );
}
