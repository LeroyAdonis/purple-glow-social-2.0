'use client';

import React from 'react';

interface TierDistributionProps {
  data: {
    free: number;
    pro: number;
    business: number;
    totalUsers: number;
    revenueEstimate: {
      monthly: number;
      annual: number;
    };
    conversionRates: {
      freeToProPercent: number;
      proToBusinessPercent: number;
    };
    growthTrend: Array<{ date: string; free: number; pro: number; business: number }>;
  };
  isLoading?: boolean;
}

export default function TierDistribution({ data, isLoading }: TierDistributionProps) {
  if (isLoading) {
    return (
      <div className="aerogel-card p-6 rounded-2xl animate-pulse">
        <div className="h-8 bg-white/10 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const tierConfigs = [
    { 
      tier: 'free', 
      count: data.free, 
      color: 'from-gray-500 to-gray-600', 
      icon: 'fa-solid fa-user', 
      borderColor: 'border-gray-500/30',
      price: 0
    },
    { 
      tier: 'pro', 
      count: data.pro, 
      color: 'from-neon-grape to-purple-600', 
      icon: 'fa-solid fa-crown', 
      borderColor: 'border-neon-grape/30',
      price: 299
    },
    { 
      tier: 'business', 
      count: data.business, 
      color: 'from-joburg-teal to-cyan-600', 
      icon: 'fa-solid fa-building', 
      borderColor: 'border-joburg-teal/30',
      price: 999
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tierConfigs.map((tier) => {
          const percentage = data.totalUsers > 0 
            ? ((tier.count / data.totalUsers) * 100).toFixed(1) 
            : '0';
          
          return (
            <div key={tier.tier} className={`aerogel-card p-6 rounded-2xl border ${tier.borderColor}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                  <i className={`${tier.icon} text-xl text-white`}></i>
                </div>
                <div>
                  <h4 className="font-display font-bold capitalize text-lg">{tier.tier}</h4>
                  <p className="text-xs text-gray-400 font-mono">
                    R{tier.price}/month
                  </p>
                </div>
              </div>
              
              <div className="text-center py-4">
                <p className="text-4xl font-display font-bold">{tier.count.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mt-1">users ({percentage}%)</p>
              </div>
              
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${tier.color} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue & Conversion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Estimate */}
        <div className="aerogel-card p-6 rounded-2xl">
          <h3 className="font-display font-bold text-xl mb-6">Revenue Estimate</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-glass-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Monthly Recurring Revenue</span>
                <i className="fa-solid fa-coins text-mzansi-gold"></i>
              </div>
              <p className="text-3xl font-display font-bold text-mzansi-gold">
                R{data.revenueEstimate.monthly.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ({data.pro} Pro × R299) + ({data.business} Business × R999)
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-white/5 border border-glass-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Projected Annual Revenue</span>
                <i className="fa-solid fa-chart-line text-green-400"></i>
              </div>
              <p className="text-2xl font-display font-bold text-green-400">
                R{data.revenueEstimate.annual.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Conversion Rates */}
        <div className="aerogel-card p-6 rounded-2xl">
          <h3 className="font-display font-bold text-xl mb-6">Conversion Rates</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2">
                  <span className="text-gray-400">Free</span>
                  <i className="fa-solid fa-arrow-right text-gray-600"></i>
                  <span className="text-neon-grape">Pro</span>
                </span>
                <span className="font-mono font-bold">{data.conversionRates.freeToProPercent.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gray-500 to-neon-grape rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(data.conversionRates.freeToProPercent * 2, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2">
                  <span className="text-neon-grape">Pro</span>
                  <i className="fa-solid fa-arrow-right text-gray-600"></i>
                  <span className="text-joburg-teal">Business</span>
                </span>
                <span className="font-mono font-bold">{data.conversionRates.proToBusinessPercent.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-grape to-joburg-teal rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(data.conversionRates.proToBusinessPercent * 2, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-3 rounded-xl bg-joburg-teal/10 border border-joburg-teal/20">
            <div className="flex items-center gap-2 text-sm text-joburg-teal">
              <i className="fa-solid fa-lightbulb"></i>
              <span>Industry average is ~5% for free to paid conversion</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Distribution Pie Chart (Visual) */}
      <div className="aerogel-card p-6 rounded-2xl">
        <h3 className="font-display font-bold text-xl mb-6">User Distribution</h3>
        <div className="flex items-center justify-center gap-12">
          {/* Pie Chart Visualization */}
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {tierConfigs.reduce((acc, tier, index) => {
                const percentage = data.totalUsers > 0 ? (tier.count / data.totalUsers) * 100 : 0;
                const offset = acc.offset;
                const dashArray = `${percentage} ${100 - percentage}`;
                
                acc.elements.push(
                  <circle
                    key={tier.tier}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={index === 0 ? '#6B7280' : index === 1 ? '#9D4EDD' : '#14B8A6'}
                    strokeWidth="20"
                    strokeDasharray={dashArray}
                    strokeDashoffset={-offset}
                    className="transition-all duration-500"
                  />
                );
                
                acc.offset += percentage;
                return acc;
              }, { offset: 0, elements: [] as React.ReactNode[] }).elements}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-display font-bold">{data.totalUsers}</span>
              <span className="text-xs text-gray-400">Total Users</span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="space-y-4">
            {tierConfigs.map((tier) => (
              <div key={tier.tier} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded bg-gradient-to-r ${tier.color}`}></div>
                <span className="capitalize font-medium w-20">{tier.tier}</span>
                <span className="font-mono text-gray-400">{tier.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Trend */}
      {data.growthTrend.length > 0 && (
        <div className="aerogel-card p-6 rounded-2xl">
          <h3 className="font-display font-bold text-xl mb-6">User Growth Trend (Last 7 Days)</h3>
          <div className="h-48 flex items-end justify-around gap-2">
            {data.growthTrend.slice(-7).map((day, i) => {
              const total = day.free + day.pro + day.business;
              const maxCount = Math.max(...data.growthTrend.map(d => d.free + d.pro + d.business), 1);
              const height = (total / maxCount) * 100;
              const date = new Date(day.date);
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-gray-400 font-mono">{total}</div>
                  <div
                    className="w-full bg-gradient-to-t from-neon-grape to-joburg-teal rounded-t-lg transition-all hover:opacity-80 cursor-pointer min-h-[4px]"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  ></div>
                  <div className="text-xs text-gray-500 font-mono">
                    {date.toLocaleDateString('en-ZA', { weekday: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
