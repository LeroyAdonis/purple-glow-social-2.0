'use client';

import React, { useState } from 'react';
import { MOCK_AUTOMATION_RULES, MockAutomationRule } from '../lib/mock-data';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  template: string;
  frequency: string;
  platforms: string[];
  isActive: boolean;
  postsGenerated: number;
  lastRun: string;
  nextRun: string;
}

interface AutomationViewProps {
  onCreateRule?: () => void;
}

// Convert mock data to component format
const convertMockRules = (mockRules: MockAutomationRule[]): AutomationRule[] => {
  return mockRules.map(rule => ({
    id: rule.id,
    name: rule.name,
    description: `Automatically generate content about ${rule.coreTopic}`,
    template: rule.coreTopic,
    frequency: getFrequencyDisplay(rule.frequency),
    platforms: rule.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)),
    isActive: rule.isActive,
    postsGenerated: rule.postsGenerated,
    lastRun: rule.lastRun?.toISOString() || '',
    nextRun: rule.nextRun.toISOString(),
  }));
};

const getFrequencyDisplay = (frequency: string): string => {
  switch (frequency) {
    case 'daily':
      return 'Daily at 12:30';
    case 'weekly':
      return 'Weekly on Mondays at 09:00';
    case 'monthly':
      return 'Monthly on the last day at 18:00';
    default:
      return frequency;
  }
};

const mockRules: AutomationRule[] = convertMockRules(MOCK_AUTOMATION_RULES);

const platformIcons: { [key: string]: string } = {
  Instagram: 'fa-brands fa-instagram',
  Twitter: 'fa-brands fa-twitter',
  LinkedIn: 'fa-brands fa-linkedin',
  Facebook: 'fa-brands fa-facebook',
};

export default function AutomationView({ onCreateRule }: AutomationViewProps) {
  const [rules, setRules] = useState<AutomationRule[]>(mockRules);
  const [selectedRule, setSelectedRule] = useState<string | null>(null);

  const toggleRuleActive = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this automation rule?')) {
      setRules(rules.filter(rule => rule.id !== ruleId));
    }
  };

  const runNow = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      alert(`Running "${rule.name}" now...\n\nGenerating content and scheduling posts! ✨`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-joburg-teal to-pretoria-blue rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Automation Rules</h1>
            <p className="text-white/90">Set it and forget it! Let AI Pilot handle your content schedule.</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{rules.filter(r => r.isActive).length}</div>
            <div className="text-sm text-white/80">Active Rules</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <i className="fa-solid fa-robot text-green-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-pretoria-blue">
                {rules.reduce((sum, rule) => sum + rule.postsGenerated, 0)}
              </div>
              <div className="text-sm text-gray-600">Posts Auto-Generated</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <i className="fa-solid fa-clock text-blue-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-pretoria-blue">24/7</div>
              <div className="text-sm text-gray-600">Working for You</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <i className="fa-solid fa-sparkles text-purple-600 text-xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-pretoria-blue">
                {rules.filter(r => r.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Automations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Rule Button */}
      <button
        onClick={onCreateRule}
        className="w-full bg-gradient-to-r from-joburg-teal to-pretoria-blue text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
      >
        <i className="fa-solid fa-plus-circle text-2xl"></i>
        Create New Automation Rule
      </button>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-robot text-gray-400 text-4xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-pretoria-blue mb-3">No Automation Rules Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by creating your first automation rule. Choose from our templates or build your own!
            </p>
            
            {/* Template Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
                <i className="fa-solid fa-box text-pink-600 text-3xl mb-3"></i>
                <h4 className="font-semibold text-pretoria-blue mb-2">Weekly Product</h4>
                <p className="text-sm text-gray-600">Showcase your products regularly</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <i className="fa-solid fa-lightbulb text-blue-600 text-3xl mb-3"></i>
                <h4 className="font-semibold text-pretoria-blue mb-2">Daily Tips</h4>
                <p className="text-sm text-gray-600">Share valuable insights daily</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
                <i className="fa-solid fa-calendar-check text-green-600 text-3xl mb-3"></i>
                <h4 className="font-semibold text-pretoria-blue mb-2">Monthly Recap</h4>
                <p className="text-sm text-gray-600">Summarize the month's highlights</p>
              </div>
            </div>
          </div>
        ) : (
          rules.map(rule => (
            <div
              key={rule.id}
              className="bg-white rounded-xl shadow-lg border-2 border-transparent hover:border-joburg-teal transition-all overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-pretoria-blue">{rule.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          rule.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{rule.description}</p>
                    
                    {/* Platforms */}
                    <div className="flex items-center gap-2 mb-3">
                      {rule.platforms.map(platform => (
                        <span
                          key={platform}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
                        >
                          <i className={platformIcons[platform]}></i>
                          {platform}
                        </span>
                      ))}
                    </div>

                    {/* Frequency */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="fa-solid fa-rotate"></i>
                      <span>{rule.frequency}</span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleRuleActive(rule.id)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      rule.isActive ? 'bg-joburg-teal' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        rule.isActive ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-2xl font-bold text-joburg-teal">{rule.postsGenerated}</div>
                    <div className="text-xs text-gray-600">Posts Generated</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700">{formatDate(rule.lastRun)}</div>
                    <div className="text-xs text-gray-600">Last Run</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700">{formatDate(rule.nextRun)}</div>
                    <div className="text-xs text-gray-600">Next Run</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => runNow(rule.id)}
                    className="flex-1 px-4 py-2 bg-joburg-teal text-white rounded-lg hover:bg-joburg-teal/90 transition-colors font-medium"
                  >
                    <i className="fa-solid fa-play mr-2"></i>
                    Run Now
                  </button>
                  <button
                    onClick={() => setSelectedRule(rule.id)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    <i className="fa-solid fa-pen mr-2"></i>
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>

                {/* Execution History (expandable) */}
                {selectedRule === rule.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-pretoria-blue mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-history"></i>
                      Recent Executions
                    </h4>
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - i * 7);
                        return (
                          <div key={i} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                            <span className="text-gray-600">{date.toLocaleDateString()}</span>
                            <span className="flex items-center gap-2">
                              <i className="fa-solid fa-check-circle text-green-500"></i>
                              <span className="text-gray-700">Success</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setSelectedRule(null)}
                      className="mt-3 text-sm text-joburg-teal hover:underline"
                    >
                      Hide History
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
