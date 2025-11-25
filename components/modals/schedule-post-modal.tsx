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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-joburg-teal to-pretoria-blue text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="fa-regular fa-calendar-check text-2xl"></i>
              <h2 className="text-2xl font-bold">Schedule Post</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          {platform && (
            <p className="text-sm text-white/80 mt-2">Platform: {platform}</p>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* AI Best Times Section */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <i className="fa-solid fa-sparkles text-purple-600"></i>
              <h3 className="font-semibold text-pretoria-blue">AI Pilot Best Times</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Our AI analyzed your audience engagement patterns. These times get the most traction:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {bestTimes.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => handleBestTimeSelect(slot.time)}
                  className="bg-white rounded-lg p-3 border-2 border-transparent hover:border-joburg-teal transition-all hover:shadow-md text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{slot.emoji}</span>
                    <div>
                      <div className="font-semibold text-pretoria-blue">{slot.time}</div>
                      <div className="text-xs text-gray-500">{slot.label}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${slot.engagement === 'Very High' ? 'bg-green-500 w-full' :
                          slot.engagement === 'High' ? 'bg-green-400 w-4/5' :
                            'bg-yellow-400 w-3/5'
                          }`}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{slot.engagement}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Date & Time Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-pretoria-blue flex items-center gap-2">
              <i className="fa-regular fa-clock"></i>
              Or Choose Your Own Time
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-joburg-teal focus:border-transparent"
                />
              </div>

              {/* Time Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <i className="fa-solid fa-globe"></i>
              <span>Timezone: <strong>{timezone}</strong></span>
            </div>
          </div>

          {/* Recurrence Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-pretoria-blue flex items-center gap-2">
              <i className="fa-solid fa-rotate"></i>
              Recurrence (Optional)
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {(['none', 'daily', 'weekly', 'monthly'] as RecurrenceType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setRecurrence(type)}
                  className={`
                    px-4 py-3 rounded-lg border-2 transition-all font-medium
                    ${recurrence === type
                      ? 'border-joburg-teal bg-joburg-teal/10 text-joburg-teal'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-joburg-teal/50'
                    }
                  `}
                >
                  {type === 'none' ? 'No Repeat' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Custom Recurrence Builder */}
            {recurrence === 'weekly' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Repeat on:</p>
                <div className="flex gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleCustomDay(day)}
                      className={`
                        w-12 h-12 rounded-full font-semibold transition-all
                        ${customDays.includes(day)
                          ? 'bg-joburg-teal text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-600 hover:border-joburg-teal'
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <i className="fa-solid fa-info-circle text-blue-600 text-xl"></i>
              <div>
                <p className="text-sm font-medium text-blue-900">Queue Position: #3</p>
                <p className="text-xs text-blue-700">2 posts scheduled before this time</p>
              </div>
            </div>
          )}

          {/* Post Preview (if content provided) */}
          {postContent && (
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Post Preview:</p>
              <p className="text-sm text-gray-600 line-clamp-3">{postContent}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-joburg-teal to-pretoria-blue text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
