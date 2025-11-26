'use client';

import React, { useState } from 'react';
import CustomSelect from '../custom-select';

interface SchedulePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postContent?: string;
  platform?: string;
}

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

const bestTimes = [
  { time: '08:00', label: 'Morning Peak', emoji: '🌅', engagement: 'High' },
  { time: '12:30', label: 'Lunch Hour', emoji: '🍽️', engagement: 'Medium' },
  { time: '18:00', label: 'Evening Rush', emoji: '🌆', engagement: 'Very High' },
  { time: '21:00', label: 'Night Owls', emoji: '🌙', engagement: 'Medium' },
];

export default function SchedulePostModal({
  isOpen,
  onClose,
  postContent = '',
  platform = 'All Platforms'
}: SchedulePostModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timezone] = useState('SAST (UTC+2)');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [customDays, setCustomDays] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    const scheduledDateTime = `${selectedDate} ${selectedTime}`;
    alert(`Post scheduled for ${scheduledDateTime} ${timezone}\n${recurrence !== 'none' ? `Recurrence: ${recurrence}` : ''}`);
    onClose();
  };

  const handleBestTimeSelect = (time: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setSelectedDate(tomorrow.toISOString().split('T')[0]);
    setSelectedTime(time);
  };

  const toggleCustomDay = (day: string) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter(d => d !== day));
    } else {
      setCustomDays([...customDays, day]);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  // Generate time options (15-minute intervals)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        times.push(`${h}:${m}`);
      }
    }
    return times;
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-void border border-glass-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-neon-grape to-joburg-teal text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="fa-regular fa-calendar-check text-2xl"></i>
              <h2 className="text-2xl font-bold font-display">Schedule Post</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          {platform && (
            <p className="text-sm text-white/80 mt-2 font-body">Platform: {platform}</p>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* AI Best Times Section */}
          <div className="bg-gradient-to-br from-neon-grape/10 to-joburg-teal/10 rounded-xl p-4 border border-neon-grape/30">
            <div className="flex items-center gap-2 mb-3">
              <i className="fa-solid fa-sparkles text-neon-grape"></i>
              <h3 className="font-semibold text-white font-body">AI Pilot Best Times</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4 font-body">
              Our AI analyzed your audience engagement patterns. These times get the most traction:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {bestTimes.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => handleBestTimeSelect(slot.time)}
                  className="bg-white/5 rounded-lg p-3 border-2 border-transparent hover:border-joburg-teal transition-all hover:shadow-md hover:bg-white/10 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{slot.emoji}</span>
                    <div>
                      <div className="font-semibold text-white font-body">{slot.time}</div>
                      <div className="text-xs text-gray-400 font-mono">{slot.label}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="flex-1 bg-white/10 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${slot.engagement === 'Very High' ? 'bg-gradient-to-r from-joburg-teal to-green-400 w-full' :
                          slot.engagement === 'High' ? 'bg-gradient-to-r from-neon-grape to-joburg-teal w-4/5' :
                            'bg-gradient-to-r from-mzansi-gold to-yellow-400 w-3/5'
                          }`}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{slot.engagement}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Date & Time Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2 font-body">
              <i className="fa-regular fa-clock"></i>
              Or Choose Your Own Time
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                  Date
                </label>
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-xl text-white font-mono focus:ring-2 focus:ring-joburg-teal focus:border-joburg-teal transition-all hover:bg-white/10 hover:border-neon-grape/50 cursor-pointer
                  [&::-webkit-calendar-picker-indicator]:cursor-pointer
                  [&::-webkit-calendar-picker-indicator]:opacity-70
                  [&::-webkit-calendar-picker-indicator]:hover:opacity-100
                  [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>

              {/* Time Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-body">
                  Time
                </label>
                <div className="relative">
                  <CustomSelect
                    value={selectedTime}
                    onChange={setSelectedTime}
                    options={[
                      { value: "", label: "🕐 Select time" },
                      ...generateTimeOptions().map(time => ({ value: time, label: time }))
                    ]}
                    placeholder="Select time"
                  />
                </div>
              </div>
            </div>

            {/* Timezone Display */}
            <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 p-3 rounded-xl border border-glass-border">
              <i className="fa-solid fa-globe text-joburg-teal"></i>
              <span className="font-body">Timezone: <strong className="text-white font-mono">{timezone}</strong></span>
            </div>
          </div>

          {/* Recurrence Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2 font-body">
              <i className="fa-solid fa-rotate"></i>
              Recurrence (Optional)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {(['none', 'daily', 'weekly', 'monthly'] as RecurrenceType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setRecurrence(type)}
                  className={`
                    px-4 py-3 rounded-xl border-2 transition-all font-medium font-body cursor-pointer
                    ${recurrence === type
                      ? 'border-joburg-teal bg-joburg-teal/20 text-joburg-teal shadow-lg'
                      : 'border-glass-border bg-white/5 text-gray-300 hover:border-joburg-teal/50 hover:bg-white/10'
                    }
                  `}
                >
                  {type === 'none' ? 'No Repeat' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Custom Recurrence Builder */}
            {recurrence === 'weekly' && (
              <div className="bg-white/5 rounded-xl p-4 border border-glass-border">
                <p className="text-sm font-medium text-gray-300 mb-3 font-body">Repeat on:</p>
                <div className="flex gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleCustomDay(day)}
                      className={`
                        w-12 h-12 rounded-full font-semibold transition-all font-mono cursor-pointer
                        ${customDays.includes(day)
                          ? 'bg-gradient-to-br from-neon-grape to-joburg-teal text-white shadow-lg'
                          : 'bg-white/5 border-2 border-glass-border text-gray-300 hover:border-joburg-teal hover:bg-white/10'
                        }
                      `}
                    >
                      {day[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Queue Position Indicator */}
          {selectedDate && selectedTime && (
            <div className="bg-joburg-teal/10 border border-joburg-teal/30 rounded-xl p-4 flex items-center gap-3">
              <i className="fa-solid fa-info-circle text-joburg-teal text-xl"></i>
              <div>
                <p className="text-sm font-medium text-white font-body">Queue Position: #3</p>
                <p className="text-xs text-gray-400 font-mono">2 posts scheduled before this time</p>
              </div>
            </div>
          )}

          {/* Post Preview (if content provided) */}
          {postContent && (
            <div className="border border-glass-border rounded-xl p-4 bg-white/5">
              <p className="text-sm font-medium text-gray-300 mb-2 font-body">Post Preview:</p>
              <p className="text-sm text-gray-400 line-clamp-3 font-body">{postContent}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-void/95 backdrop-blur-sm px-6 py-4 rounded-b-2xl border-t border-glass-border flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-glass-border text-gray-300 font-medium font-body hover:bg-white/10 hover:border-neon-grape/50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-grape to-joburg-teal text-white font-medium font-body hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
            disabled={!selectedDate || !selectedTime}
          >
            <i className="fa-regular fa-calendar-check mr-2"></i>
            Schedule Post
          </button>
        </div>
      </div>
    </div>
  );
}
