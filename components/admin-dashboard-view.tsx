'use client';

import React, { useState } from 'react';
import { MOCK_USERS, MOCK_TRANSACTIONS, calculateRevenueMetrics, getTierDistribution } from '../lib/mock-data';
import type { MockUser } from '../lib/mock-data';

export default function AdminDashboardView() {
  const [activeTab, setActiveTab] = useState<'users' | 'revenue' | 'transactions'>('users');
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'pro' | 'business'>('all');
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');

  const metrics = calculateRevenueMetrics();
  const tierDist = getTierDistribution();

  // Filter users based on search and tier
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || user.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  // Handle tier change
  const handleTierChange = (userId: string, newTier: 'free' | 'pro' | 'business') => {
    setUsers(users.map(u => u.id === userId ? { ...u, tier: newTier } : u));
  };

  // Handle credit adjustment
  const handleCreditAdjustment = () => {
    if (selectedUser && creditAmount) {
      const amount = parseInt(creditAmount);
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, credits: u.credits + amount } : u
      ));
      setShowCreditModal(false);
      setCreditAmount('');
      setSelectedUser(null);
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'pro': return 'bg-neon-grape/20 text-neon-grape border-neon-grape/30';
      case 'business': return 'bg-joburg-teal/20 text-joburg-teal border-joburg-teal/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="flex min-h-screen bg-void text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-glass-border bg-black/20 hidden lg:flex flex-col p-6 gap-8 fixed h-full backdrop-blur-md z-20">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-neon-grape to-joburg-teal flex items-center justify-center">
            <span className="font-display font-bold">A</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight">Admin Panel</h1>
            <p className="text-xs text-gray-500 font-mono">PURPLE GLOW</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-white/5 border border-glass-border text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fa-solid fa-users"></i> User Management
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'revenue'
                ? 'bg-white/5 border border-glass-border text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fa-solid fa-chart-line"></i> Revenue
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'transactions'
                ? 'bg-white/5 border border-glass-border text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fa-solid fa-receipt"></i> Transactions
          </button>
        </nav>

        <div className="mt-auto p-4 rounded-xl border border-glass-border bg-gradient-to-br from-white/5 to-transparent">
          <p className="text-xs font-mono text-gray-400 mb-2">SYSTEM STATUS</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-bold">OPERATIONAL</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <header className="animate-enter">
            <h2 className="font-display font-bold text-4xl mb-2">Admin Dashboard</h2>
            <p className="text-gray-400">Manage users, monitor revenue, and oversee platform operations</p>
          </header>

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-enter">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="aerogel-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <i className="fa-solid fa-users text-2xl text-gray-500"></i>
                  </div>
                  <p className="text-3xl font-display font-bold">{metrics.totalUsers}</p>
                  <p className="text-sm text-gray-400 mt-1">Total Users</p>
                </div>
                <div className="aerogel-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <i className="fa-solid fa-user-check text-2xl text-green-500"></i>
                  </div>
                  <p className="text-3xl font-display font-bold">{metrics.activeUsers}</p>
                  <p className="text-sm text-gray-400 mt-1">Active Users</p>
                </div>
                <div className="aerogel-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <i className="fa-solid fa-crown text-2xl text-neon-grape"></i>
                  </div>
                  <p className="text-3xl font-display font-bold">{tierDist.pro}</p>
                  <p className="text-sm text-gray-400 mt-1">Pro Users</p>
                </div>
                <div className="aerogel-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <i className="fa-solid fa-building text-2xl text-joburg-teal"></i>
                  </div>
                  <p className="text-3xl font-display font-bold">{tierDist.business}</p>
                  <p className="text-sm text-gray-400 mt-1">Business Users</p>
                </div>
              </div>

              {/* Filters */}
              <div className="aerogel-card p-6 rounded-2xl">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-grape transition-colors"
                    />
                  </div>
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value as any)}
                    className="bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"
                  >
                    <option value="all">All Tiers</option>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="aerogel-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-glass-border">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">User</th>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Tier</th>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Credits</th>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Posts</th>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full border border-glass-border" />
                              <div>
                                <p className="font-bold text-sm">{user.name}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={user.tier}
                              onChange={(e) => handleTierChange(user.id, e.target.value as any)}
                              className={`px-3 py-1 rounded-full text-xs font-bold border ${getTierBadgeColor(user.tier)} bg-transparent focus:outline-none cursor-pointer`}
                            >
                              <option value="free">FREE</option>
                              <option value="pro">PRO</option>
                              <option value="business">BUSINESS</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => { setSelectedUser(user); setShowCreditModal(true); }}
                              className="text-mzansi-gold hover:text-white font-mono font-bold transition-colors"
                            >
                              {user.credits}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-gray-300">{user.postsCreated}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {user.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-gray-400 hover:text-white transition-colors">
                              <i className="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <div className="space-y-6 animate-enter">
              {/* Revenue Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="aerogel-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <i className="fa-solid fa-coins text-2xl text-mzansi-gold"></i>
                  </div>
                  <p className="text-3xl font-display font-bold">R{metrics.mrr.toLocaleString()}</p>
                  <p className="text-sm text-gray-400 mt-1">Monthly Recurring Revenue</p>
                  <div className="mt-4 flex items-center gap-2 text-xs">
                    <span className="text-green-400"><i className="fa-solid fa-arrow-up"></i> 12.5%</span>
                    <span className="text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className="aerogel-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <i className="fa-solid fa-chart-line text-2xl text-neon-grape"></i>
                  </div>
                  <p className="text-3xl font-display font-bold">R{metrics.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-400 mt-1">This Month Revenue</p>
                  <div className="mt-4 flex items-center gap-2 text-xs">
                    <span className="text-green-400"><i className="fa-solid fa-arrow-up"></i> 8.2%</span>
                    <span className="text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className="aerogel-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <i className="fa-solid fa-sack-dollar text-2xl text-joburg-teal"></i>
                  </div>
                  <p className="text-3xl font-display font-bold">R{metrics.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-400 mt-1">Total Revenue (All Time)</p>
                  <div className="mt-4 flex items-center gap-2 text-xs">
                    <span className="text-gray-400">{MOCK_TRANSACTIONS.length} transactions</span>
                  </div>
                </div>
              </div>

              {/* Tier Distribution */}
              <div className="aerogel-card p-6 rounded-2xl">
                <h3 className="font-display font-bold text-xl mb-6">User Tier Distribution</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full border-8 border-gray-500/30 flex items-center justify-center">
                      <span className="text-2xl font-bold">{tierDist.free}</span>
                    </div>
                    <p className="font-bold text-gray-300">Free Tier</p>
                    <p className="text-xs text-gray-500 mt-1">R0/month</p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full border-8 border-neon-grape/50 flex items-center justify-center">
                      <span className="text-2xl font-bold text-neon-grape">{tierDist.pro}</span>
                    </div>
                    <p className="font-bold text-neon-grape">Pro Tier</p>
                    <p className="text-xs text-gray-500 mt-1">R299/month</p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full border-8 border-joburg-teal/50 flex items-center justify-center">
                      <span className="text-2xl font-bold text-joburg-teal">{tierDist.business}</span>
                    </div>
                    <p className="font-bold text-joburg-teal">Business Tier</p>
                    <p className="text-xs text-gray-500 mt-1">R999/month</p>
                  </div>
                </div>
              </div>

              {/* Revenue Chart Placeholder */}
              <div className="aerogel-card p-6 rounded-2xl">
                <h3 className="font-display font-bold text-xl mb-6">Revenue Trend (Last 6 Months)</h3>
                <div className="h-64 flex items-end justify-around gap-4">
                  {[4200, 5100, 4800, 6300, 7200, metrics.monthlyRevenue].map((amount, i) => {
                    const height = (amount / 8000) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="text-xs text-gray-400 font-mono">R{(amount / 1000).toFixed(1)}k</div>
                        <div 
                          className="w-full bg-gradient-to-t from-neon-grape to-joburg-teal rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-xs text-gray-500 font-mono">
                          {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][i]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-6 animate-enter">
              {/* Transaction Filters */}
              <div className="aerogel-card p-6 rounded-2xl">
                <div className="flex flex-col md:flex-row gap-4">
                  <select className="bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors">
                    <option value="all">All Types</option>
                    <option value="subscription">Subscriptions</option>
                    <option value="credits">Credit Purchases</option>
                    <option value="refund">Refunds</option>
                  </select>
                  <select className="bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors">
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                  <button className="px-6 py-3 border border-glass-border rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2">
                    <i className="fa-solid fa-download"></i> Export CSV
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="aerogel-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-glass-border">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">User</th>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Description</th>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="text-left px-6 py-4 text-xs font-mono text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border">
                      {MOCK_TRANSACTIONS.sort((a, b) => b.date.getTime() - a.date.getTime()).map((txn) => (
                        <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {txn.date.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-sm">{txn.userName}</div>
                            <div className="text-xs text-gray-500">{txn.paymentMethod}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              txn.type === 'subscription' ? 'bg-neon-grape/20 text-neon-grape' :
                              txn.type === 'credits' ? 'bg-mzansi-gold/20 text-mzansi-gold' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {txn.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">{txn.description}</td>
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-green-400">R{txn.amount.toFixed(2)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              txn.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              txn.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {txn.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Credit Adjustment Modal */}
      {showCreditModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowCreditModal(false)}></div>
          <div className="aerogel-card p-8 rounded-3xl w-full max-w-md relative z-10 animate-enter">
            <h3 className="font-display font-bold text-2xl mb-4">Adjust Credits</h3>
            <p className="text-gray-400 mb-6">
              Adjusting credits for <span className="text-white font-bold">{selectedUser.name}</span>
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-mono text-gray-400 mb-2 block">CURRENT BALANCE</label>
                <div className="text-3xl font-display font-bold text-mzansi-gold">{selectedUser.credits}</div>
              </div>
              <div>
                <label className="text-xs font-mono text-gray-400 mb-2 block">ADJUSTMENT AMOUNT</label>
                <input
                  type="number"
                  placeholder="Enter amount (use negative to deduct)"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-grape transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => { setShowCreditModal(false); setCreditAmount(''); setSelectedUser(null); }}
                className="flex-1 py-3 border border-glass-border rounded-xl hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreditAdjustment}
                className="flex-1 py-3 bg-neon-grape rounded-xl hover:bg-opacity-90 transition-colors font-bold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
