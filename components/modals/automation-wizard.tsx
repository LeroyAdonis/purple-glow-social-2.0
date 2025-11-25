'use client';

import React, { useState } from 'react';

interface AutomationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (rule: any) => void;
}

type WizardStep = 1 | 2 | 3 | 4;

const templates = [
  {
    id: 'weekly-product',
    name: 'Weekly Product Showcase',
    description: 'Highlight your products every week with AI-generated content',
    icon: 'fa-solid fa-box',
    color: 'from-pink-500 to-purple-500',
    frequency: 'Weekly',
  },
  {
    id: 'daily-tips',
    name: 'Daily Tips & Tricks',
    description: 'Share valuable insights and tips with your audience daily',
    icon: 'fa-solid fa-lightbulb',
    color: 'from-blue-500 to-cyan-500',
    frequency: 'Daily',
  },
  {
    id: 'monthly-recap',
    name: 'Monthly Recap',
    description: 'Summarize the month with highlights and achievements',
    icon: 'fa-solid fa-calendar-check',
    color: 'from-green-500 to-teal-500',
    frequency: 'Monthly',
  },
  {
    id: 'custom',
    name: 'Custom Automation',
    description: 'Build your own automation from scratch',
    icon: 'fa-solid fa-wand-magic-sparkles',
    color: 'from-orange-500 to-red-500',
    frequency: 'Custom',
  },
];

const platforms = ['Instagram', 'Twitter', 'LinkedIn', 'Facebook'];
const tones = ['Professional', 'Casual', 'Funny', 'Inspiring', 'Educational'];
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AutomationWizard({ isOpen, onClose, onComplete }: AutomationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [ruleName, setRuleName] = useState('');
  
  // Step 2: Frequency
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [time, setTime] = useState('09:00');
  const [timezone] = useState('SAST (UTC+2)');
  
  // Step 3: Content Settings
  const [topic, setTopic] = useState('');
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  if (!isOpen) return null;

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as WizardStep);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const handleComplete = () => {
    const rule = {
      name: ruleName || templates.find(t => t.id === selectedTemplate)?.name,
      template: selectedTemplate,
      frequency,
      days: selectedDays,
      time,
      timezone,
      topic,
      tone: selectedTone,
      platforms: selectedPlatforms,
    };
    
    alert(`Automation rule created! 🎉\n\nName: ${rule.name}\nFrequency: ${rule.frequency}\nPlatforms: ${rule.platforms.join(', ')}`);
    
    if (onComplete) {
      onComplete(rule);
    }
    
    onClose();
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const togglePlatform = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedTemplate !== '';
      case 2:
        return frequency === 'daily' || (frequency === 'weekly' && selectedDays.length > 0) || frequency === 'monthly';
      case 3:
        return topic !== '' && selectedPlatforms.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-joburg-teal to-pretoria-blue text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-wand-magic-sparkles text-2xl"></i>
              <h2 className="text-2xl font-bold">Create Automation Rule</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep >= step
                      ? 'bg-white text-joburg-teal'
                      : 'bg-white/30 text-white'
                  }`}
                >
                  {currentStep > step ? <i className="fa-solid fa-check"></i> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-all ${
                      currentStep > step ? 'bg-white' : 'bg-white/30'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-sm mt-2">
            <span className="flex-1 text-center">Template</span>
            <span className="flex-1 text-center">Frequency</span>
            <span className="flex-1 text-center">Content</span>
            <span className="flex-1 text-center">Review</span>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Template Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-pretoria-blue mb-2">Choose a Template</h3>
                <p className="text-gray-600">Select a starting point for your automation</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`text-left p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                      selectedTemplate === template.id
                        ? 'border-joburg-teal bg-joburg-teal/5'
                        : 'border-gray-200 hover:border-joburg-teal/50'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${template.color} flex items-center justify-center text-white text-2xl mb-4`}>
                      <i className={template.icon}></i>
                    </div>
                    <h4 className="text-lg font-bold text-pretoria-blue mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-joburg-teal">
                      <i className="fa-solid fa-rotate"></i>
                      {template.frequency}
                    </span>
                  </button>
                ))}
              </div>

              {selectedTemplate && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rule Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder={templates.find(t => t.id === selectedTemplate)?.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-joburg-teal focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Frequency Configuration */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-pretoria-blue mb-2">Set Frequency</h3>
                <p className="text-gray-600">When should this automation run?</p>
              </div>

              {/* Frequency Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Frequency</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setFrequency(freq)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all font-medium capitalize ${
                        frequency === freq
                          ? 'border-joburg-teal bg-joburg-teal/10 text-joburg-teal'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-joburg-teal/50'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly: Day Selection */}
              {frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Days</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {weekDays.map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                          selectedDays.includes(day)
                            ? 'border-joburg-teal bg-joburg-teal/10 text-joburg-teal'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-joburg-teal/50'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-joburg-teal focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <input
                    type="text"
                    value={timezone}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-info-circle"></i>
                  Schedule Preview
                </h4>
                <p className="text-sm text-blue-800">
                  {frequency === 'daily' && `Posts will be generated daily at ${time}`}
                  {frequency === 'weekly' && selectedDays.length > 0 && 
                    `Posts will be generated every ${selectedDays.join(', ')} at ${time}`}
                  {frequency === 'monthly' && `Posts will be generated on the last day of each month at ${time}`}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Content Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-pretoria-blue mb-2">Content Settings</h3>
                <p className="text-gray-600">Configure what type of content to generate</p>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic / Theme
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Product highlights, Industry tips, Behind the scenes"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-joburg-teal focus:border-transparent"
                />
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tone & Style</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {tones.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                        selectedTone === tone
                          ? 'border-joburg-teal bg-joburg-teal/10 text-joburg-teal'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-joburg-teal/50'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Target Platforms</label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all font-medium flex items-center gap-2 ${
                        selectedPlatforms.includes(platform)
                          ? 'border-joburg-teal bg-joburg-teal/10 text-joburg-teal'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-joburg-teal/50'
                      }`}
                    >
                      <i className={`fa-brands fa-${platform.toLowerCase()}`}></i>
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-pretoria-blue mb-2">Review & Activate</h3>
                <p className="text-gray-600">Check your automation rule details</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">Rule Name</h4>
                  <p className="text-lg font-bold text-pretoria-blue">
                    {ruleName || templates.find(t => t.id === selectedTemplate)?.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Template</h4>
                    <p className="text-pretoria-blue">{templates.find(t => t.id === selectedTemplate)?.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Frequency</h4>
                    <p className="text-pretoria-blue capitalize">{frequency}</p>
                  </div>
                </div>

                {frequency === 'weekly' && selectedDays.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Days</h4>
                    <p className="text-pretoria-blue">{selectedDays.join(', ')}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Time</h4>
                    <p className="text-pretoria-blue">{time} {timezone}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Tone</h4>
                    <p className="text-pretoria-blue">{selectedTone}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">Topic</h4>
                  <p className="text-pretoria-blue">{topic}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">Platforms</h4>
                  <div className="flex gap-2">
                    {selectedPlatforms.map((platform) => (
                      <span
                        key={platform}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm"
                      >
                        <i className={`fa-brands fa-${platform.toLowerCase()}`}></i>
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-check-circle text-green-600 text-2xl mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Ready to Activate!</h4>
                    <p className="text-sm text-green-800">
                      Your automation rule will start working immediately. You can always pause or edit it later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={currentStep === 1 ? onClose : previousStep}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <div className="text-sm text-gray-600">
            Step {currentStep} of 4
          </div>

          <button
            onClick={currentStep === 4 ? handleComplete : nextStep}
            disabled={!canProceed()}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-joburg-teal to-pretoria-blue text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === 4 ? (
              <>
                <i className="fa-solid fa-check mr-2"></i>
                Activate Rule
              </>
            ) : (
              <>
                Next
                <i className="fa-solid fa-arrow-right ml-2"></i>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
