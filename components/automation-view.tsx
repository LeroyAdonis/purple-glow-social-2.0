'use client';

import React, { useState, useEffect } from 'react';

interface AutomationRule {
  id: string;
  userId: string;
  frequency: string;
  coreTopic: string | null;
  isActive: boolean | null;
  createdAt: Date | null;
}

interface AutomationViewProps {
  onCreateRule: () => void;
}

const platformIcons: Record<string, string> = {
  instagram: 'fa-brands fa-instagram',
  twitter: 'fa-brands fa-twitter',
  linkedin: 'fa-brands fa-linkedin',
  facebook: 'fa-brands fa-facebook',
};

export default function AutomationView({ onCreateRule }: AutomationViewProps) {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0 });

  // Fetch automation rules from API
  useEffect(() => {
    async function fetchRules() {
      setLoading(true);
      try {
        const response = await fetch('/api/user/automation-rules');
        if (response.ok) {
          const data = await response.json();
          setRules(data.rules || []);
          setStats(data.stats || { total: 0, active: 0 });
        }
      } catch (error) {
        console.error('Failed to fetch automation rules:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRules();
  }, []);

  const toggleRuleActive = async (ruleId: string) => {
    try {
      const response = await fetch('/api/user/automation-rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ruleId, toggle: true }),
      });
      if (response.ok) {
        const data = await response.json();
        setRules(prev =>
          prev.map(rule =>
            rule.id === ruleId ? { ...rule, isActive: data.rule.isActive } : rule
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const runNow = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    alert(`Running automation rule: ${rule?.coreTopic || 'Untitled'}`);
  };

  const deleteRule = async (ruleId: string) => {
    if (confirm('Are you sure you want to delete this automation rule?')) {
      try {
        const response = await fetch(`/api/user/automation-rules?id=${ruleId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setRules(prev => prev.filter(rule => rule.id !== ruleId));
        }
      } catch (error) {
        console.error('Failed to delete rule:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-neon-grape mb-4"></i>
          <p className="text-gray-400">Loading automation rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="aerogel-card rounded-2xl p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
              <i className="fa-solid fa-bolt text-neon-grape"></i>
              Automation Rules
            </h1>
            <p className="text-gray-400">Set it and forget it! Let AI Pilot handle your content schedule automatically.</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-display font-bold text-white">{rules.filter(r => r.isActive).length}</div>
            <div className="text-sm text-gray-400">Active Rules</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="aerogel-card rounded-xl p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <i className="fa-solid fa-robot text-green-400 text-xl"></i>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-white">
                {stats.total}
              </div>
              <div className="text-sm text-gray-400">Total Rules</div>
            </div>
          </div>
        </div>

        <div className="aerogel-card rounded-xl p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <i className="fa-solid fa-clock text-blue-400 text-xl"></i>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-white">24/7</div>
              <div className="text-sm text-gray-400">Working for You</div>
            </div>
          </div>
        </div>

        <div className="aerogel-card rounded-xl p-6 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <i className="fa-solid fa-sparkles text-purple-400 text-xl"></i>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-white">
                {stats.active}
              </div>
              <div className="text-sm text-gray-400">Active Automations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Rule Button */}
      <button
        onClick={onCreateRule}
        className="w-full bg-gradient-to-r from-neon-grape to-joburg-teal text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 cursor-pointer"
      >
        <i className="fa-solid fa-plus-circle text-2xl"></i>
        Create New Automation Rule
      </button>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.length === 0 ? (
          /* Empty State */
          <div className="aerogel-card rounded-2xl p-12 text-center">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-robot text-gray-400 text-4xl"></i>
            </div>
            <h3 className="text-3xl font-display font-bold text-white mb-3">No Automation Rules Yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Get started by creating your first automation rule. Choose from our templates or build your own!
            </p>
            
            {/* Template Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
              <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl p-6 border border-pink-500/30">
                <i className="fa-solid fa-box text-pink-400 text-3xl mb-3"></i>
                <h4 className="font-semibold text-white mb-2">Weekly Product</h4>
                <p className="text-sm text-gray-400">Showcase your products regularly</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/30">
                <i className="fa-solid fa-lightbulb text-blue-400 text-3xl mb-3"></i>
                <h4 className="font-semibold text-white mb-2">Daily Tips</h4>
                <p className="text-sm text-gray-400">Share valuable insights daily</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-xl p-6 border border-green-500/30">
                <i className="fa-solid fa-calendar-check text-green-400 text-3xl mb-3"></i>
                <h4 className="font-semibold text-white mb-2">Monthly Recap</h4>
                <p className="text-sm text-gray-400">Summarize the month's highlights</p>
              </div>
            </div>
          </div>
        ) : (
          rules.map(rule => (
            <div
              key={rule.id}
              className="aerogel-card rounded-2xl border-2 border-transparent hover:border-joburg-teal transition-all overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-2xl font-display font-bold text-white">{rule.coreTopic || 'Untitled Rule'}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          rule.isActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}
                      >
                        {rule.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-4">
                      Runs {rule.frequency || 'weekly'}
                    </p>
                    
                    {/* Schedule Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {rule.createdAt && (
                        <div className="text-gray-400">
                          <i className="fa-solid fa-calendar-day mr-2 text-joburg-teal"></i>
                          Created: {new Date(rule.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleRuleActive(rule.id)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors flex-shrink-0 cursor-pointer ${
                      rule.isActive ? 'bg-joburg-teal' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        rule.isActive ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl border border-glass-border mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-display font-bold text-white">-</div>
                    <div className="text-xs text-gray-400">Posts Generated</div>
                  </div>
                  <div className="text-center border-l border-glass-border">
                    <div className="text-2xl font-display font-bold text-green-400">-</div>
                    <div className="text-xs text-gray-400">Successful</div>
                  </div>
                  <div className="text-center border-l border-glass-border">
                    <div className="text-2xl font-display font-bold text-joburg-teal">{rule.frequency || 'weekly'}</div>
                    <div className="text-xs text-gray-400">Frequency</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => runNow(rule.id)}
                    className="px-4 py-2 bg-gradient-to-r from-neon-grape to-joburg-teal text-white rounded-lg hover:shadow-lg transition-all font-medium cursor-pointer"
                  >
                    <i className="fa-solid fa-play mr-2"></i>
                    Run Now
                  </button>
                  <button
                    onClick={() => setSelectedRule(selectedRule === rule.id ? null : rule.id)}
                    className="px-4 py-2 bg-white/5 border border-glass-border text-gray-300 rounded-lg hover:bg-white/10 transition-colors font-medium cursor-pointer"
                  >
                    <i className="fa-solid fa-history mr-2"></i>
                    {selectedRule === rule.id ? 'Hide History' : 'View History'}
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors font-medium ml-auto cursor-pointer"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>

                {/* Execution History (expandable) */}
                {selectedRule === rule.id && (
                  <div className="mt-4 pt-4 border-t border-glass-border">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-history text-joburg-teal"></i>
                      Recent Executions
                    </h4>
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - i * 7);
                        return (
                          <div key={i} className="flex items-center justify-between text-sm bg-white/5 border border-glass-border p-3 rounded-lg">
                            <span className="text-gray-300">{date.toLocaleDateString()}</span>
                            <span className="flex items-center gap-2">
                              <i className="fa-solid fa-check-circle text-green-400"></i>
                              <span className="text-green-400 font-medium">Success</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
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
