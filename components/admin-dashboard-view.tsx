'use client';

import React, { useState, useEffect } from 'react';
import CustomSelect from './custom-select';
import CreditsAnalytics from './admin/credits-analytics';
import GenerationStats from './admin/generation-stats';
import PublishingStats from './admin/publishing-stats';
import TierDistribution from './admin/tier-distribution';
import JobMonitor from './admin/job-monitor';
import JobDetailModal from './admin/job-detail-modal';
import GenerationErrors from './admin/generation-errors';
import PublishingErrors from './admin/publishing-errors';
import AutomationOverview from './admin/automation-overview';

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  tier: 'free' | 'pro' | 'business' | null;
  credits: number;
  image: string | null;
  createdAt: Date | null;
  postsCreated: number;
}

interface AdminTransaction {
  id: string;
  userId: string;
  userName: string;
  type: 'subscription' | 'credit_purchase' | 'refund';
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  createdAt: Date;
  description: string;
}

interface Job {
  id: string;
  inngestEventId: string | null;
  functionName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  payload: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminDashboardViewProps {
  onBackToLanding?: () => void;
}

export default function AdminDashboardView({ onBackToLanding }: AdminDashboardViewProps = {}) {
  const [activeTab, setActiveTab] = useState<'users' | 'revenue' | 'transactions' | 'analytics' | 'jobs' | 'errors' | 'automation'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'pro' | 'business'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transaction filters
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'all' | 'subscription' | 'credits' | 'refund'>('all');
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  // Stats state
  const [metrics, setMetrics] = useState({
    mrr: 0,
    monthlyRevenue: 0,
    activeUsers: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });
  const [tierDist, setTierDist] = useState({ free: 0, pro: 0, business: 0 });

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobStats, setJobStats] = useState({ total: 0, pending: 0, running: 0, completed: 0, failed: 0, cancelled: 0, averageRetries: 0 });
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Errors state
  const [generationErrors, setGenerationErrors] = useState<any[]>([]);
  const [publishingErrors, setPublishingErrors] = useState<any[]>([]);
  const [errorsLoading, setErrorsLoading] = useState(false);

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch users and stats in parallel
        const [usersRes, statsRes, transactionsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/stats'),
          fetch('/api/admin/transactions'),
        ]);

        if (!usersRes.ok || !statsRes.ok || !transactionsRes.ok) {
          throw new Error('Failed to fetch admin data');
        }

        const usersData = await usersRes.json();
        const statsData = await statsRes.json();
        const transactionsData = await transactionsRes.json();

        setUsers(usersData.users || []);
        setTransactions(transactionsData.transactions || []);
        setMetrics({
          mrr: statsData.revenue?.mrr || 0,
          monthlyRevenue: statsData.revenue?.monthlyRevenue || 0,
          activeUsers: statsData.users?.active || 0,
          totalRevenue: statsData.revenue?.totalRevenue || 0,
          totalUsers: statsData.users?.total || 0,
        });
        setTierDist(statsData.users?.tierDistribution || { free: 0, pro: 0, business: 0 });
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        console.error('Admin data fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Fetch analytics data when tab changes
  useEffect(() => {
    if (activeTab === 'analytics' && !analyticsData) {
      fetchAnalytics();
    }
    if (activeTab === 'jobs') {
      fetchJobs();
    }
    if (activeTab === 'errors') {
      fetchErrors();
    }
  }, [activeTab]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const res = await fetch('/api/admin/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setJobStats(data.stats || { total: 0, pending: 0, running: 0, completed: 0, failed: 0, cancelled: 0, averageRetries: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchErrors = async () => {
    setErrorsLoading(true);
    try {
      const res = await fetch('/api/admin/errors');
      if (res.ok) {
        const data = await res.json();
        setGenerationErrors(data.generationErrors || []);
        setPublishingErrors(data.publishingErrors || []);
      }
    } catch (err) {
      console.error('Failed to fetch errors:', err);
    } finally {
      setErrorsLoading(false);
    }
  };

  const handleJobRetry = async (jobId: string) => {
    try {
      const res = await fetch('/api/admin/jobs/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        fetchJobs(); // Refresh jobs list
      }
    } catch (err) {
      console.error('Failed to retry job:', err);
    }
  };

  // Filter users based on search and tier
  const filteredUsers = users.filter(user => {
    const userName = user.name || '';
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || user.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  // Filter transactions based on type and status
  const filteredTransactions = transactions.filter(txn => {
    const txnType = txn.type === 'credit_purchase' ? 'credits' : txn.type;
    const matchesType = transactionTypeFilter === 'all' || txnType === transactionTypeFilter;
    const matchesStatus = transactionStatusFilter === 'all' || txn.status === transactionStatusFilter;
    return matchesType && matchesStatus;
  });

  // Handle tier change
  const handleTierChange = async (userId: string, newTier: 'free' | 'pro' | 'business') => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tier: newTier }),
      });
      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, tier: newTier } : u));
      }
    } catch (error) {
      console.error('Failed to update tier:', error);
    }
  };

  // Handle credit adjustment
  const handleCreditAdjustment = async () => {
    if (selectedUser && creditAmount) {
      const amount = parseInt(creditAmount);
      try {
        const response = await fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: selectedUser.id, creditAdjustment: amount }),
        });
        if (response.ok) {
          setUsers(users.map(u =>
            u.id === selectedUser.id ? { ...u, credits: u.credits + amount } : u
          ));
        }
      } catch (error) {
        console.error('Failed to adjust credits:', error);
      }
      setShowCreditModal(false);
      setCreditAmount('');
      setSelectedUser(null);
    }
  };

  const getTierBadgeColor = (tier: string | null) => {
    switch (tier) {
      case 'free': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'pro': return 'bg-neon-grape/20 text-neon-grape border-neon-grape/30';
      case 'business': return 'bg-joburg-teal/20 text-joburg-teal border-joburg-teal/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-void text-white items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-neon-grape mb-4"></i>
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-void text-white items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-neon-grape rounded-lg hover:bg-opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-glass-border"
            >
              <i className="fa-solid fa-arrow-left"></i> Back to Landing
            </button>
          )}
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'users'
                ? 'bg-white/5 border border-glass-border text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <i className="fa-solid fa-users"></i> User Management
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'revenue'
                ? 'bg-white/5 border border-glass-border text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <i className="fa-solid fa-chart-line"></i> Revenue
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'transactions'
                ? 'bg-white/5 border border-glass-border text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <i className="fa-solid fa-receipt"></i> Transactions
          </button>
          
          <div className="h-px bg-glass-border my-2"></div>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'analytics'
                ? 'bg-white/5 border border-glass-border text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <i className="fa-solid fa-chart-pie"></i> Analytics
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'jobs'
                ? 'bg-white/5 border border-glass-border text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <i className="fa-solid fa-gears"></i> Job Monitor
            {jobStats.failed > 0 && (
              <span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs">
                {jobStats.failed}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'errors'
                ? 'bg-white/5 border border-glass-border text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <i className="fa-solid fa-triangle-exclamation"></i> Errors
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'automation'
                ? 'bg-white/5 border border-glass-border text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <i className="fa-solid fa-robot"></i> Automation
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
                  <CustomSelect
                    value={tierFilter}
                    onChange={(value) => setTierFilter(value as any)}
                    options={[
                      { value: 'all', label: 'All Tiers', icon: 'fa-solid fa-users' },
                      { value: 'free', label: 'Free', icon: 'fa-solid fa-user', color: 'text-gray-400' },
                      { value: 'pro', label: 'Pro', icon: 'fa-solid fa-crown', color: 'text-neon-grape' },
                      { value: 'business', label: 'Business', icon: 'fa-solid fa-building', color: 'text-joburg-teal' }
                    ]}
                    placeholder="Filter by tier"
                  />
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
                      {filteredUsers.map((user) => {
                        const userName = user.name || user.email.split('@')[0];
                        const userImage = user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=9D4EDD&color=fff`;
                        return (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={userImage} alt={userName} className="w-10 h-10 rounded-full border border-glass-border" />
                              <div>
                                <p className="font-bold text-sm">{userName}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-32">
                              <CustomSelect
                                value={user.tier || 'free'}
                                onChange={(value) => handleTierChange(user.id, value as any)}
                                options={[
                                  { value: "free", label: "FREE" },
                                  { value: "pro", label: "PRO" },
                                  { value: "business", label: "BUSINESS" }
                                ]}
                                variant="compact"
                                buttonClassName={`
                                  rounded-full font-bold border
                                  ${getTierBadgeColor(user.tier)}
                                  hover:brightness-110
                                `}
                                placeholder="Select tier"
                              />
                            </div>
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
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
                              ACTIVE
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-gray-400 hover:text-white transition-colors">
                              <i className="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                          </td>
                        </tr>
                      );
                      })}
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
                    <span className="text-gray-400">{transactions.length} transactions</span>
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
              {/* Transaction Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="aerogel-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <i className="fa-solid fa-filter text-2xl text-gray-500"></i>
                  </div>
                  <p className="text-3xl font-display font-bold">{filteredTransactions.length}</p>
                  <p className="text-sm text-gray-400 mt-1">Filtered Results</p>
                </div>
                <div className="aerogel-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <i className="fa-solid fa-coins text-2xl text-mzansi-gold"></i>
                  </div>
                  <p className="text-3xl font-display font-bold">
                    R{filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Total Amount</p>
                </div>
                <div className="aerogel-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <i className="fa-solid fa-check-circle text-2xl text-green-500"></i>
                  </div>
                  <p className="text-3xl font-display font-bold">
                    {filteredTransactions.filter(t => t.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Completed</p>
                </div>
              </div>

              {/* Transaction Filters */}
              <div className="aerogel-card p-6 rounded-2xl">
                <div className="flex flex-col md:flex-row gap-4">
                  <CustomSelect
                    value={transactionTypeFilter}
                    onChange={(value) => setTransactionTypeFilter(value as any)}
                    options={[
                      { value: 'all', label: 'All Types', icon: 'fa-solid fa-filter' },
                      { value: 'subscription', label: 'Subscriptions', icon: 'fa-solid fa-repeat', color: 'text-neon-grape' },
                      { value: 'credits', label: 'Credit Purchases', icon: 'fa-solid fa-coins', color: 'text-mzansi-gold' },
                      { value: 'refund', label: 'Refunds', icon: 'fa-solid fa-rotate-left', color: 'text-red-400' }
                    ]}
                    placeholder="Filter by type"
                    className="flex-1"
                  />
                  <CustomSelect
                    value={transactionStatusFilter}
                    onChange={(value) => setTransactionStatusFilter(value as any)}
                    options={[
                      { value: 'all', label: 'All Status', icon: 'fa-solid fa-circle-dot' },
                      { value: 'completed', label: 'Completed', icon: 'fa-solid fa-check-circle', color: 'text-green-400' },
                      { value: 'pending', label: 'Pending', icon: 'fa-solid fa-clock', color: 'text-yellow-400' },
                      { value: 'failed', label: 'Failed', icon: 'fa-solid fa-times-circle', color: 'text-red-400' }
                    ]}
                    placeholder="Filter by status"
                    className="flex-1"
                  />
                  <button
                    onClick={() => {
                      // Export functionality (UI only for now)
                      alert(`Exporting ${filteredTransactions.length} transactions to CSV...`);
                    }}
                    className="px-6 py-3 border border-glass-border rounded-xl hover:bg-white/5 hover:border-joburg-teal/50 transition-colors flex items-center gap-2 text-gray-300 hover:text-white font-medium"
                  >
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
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <i className="fa-solid fa-inbox text-4xl text-gray-600"></i>
                              <p className="text-gray-400">No transactions match your filters</p>
                              <button
                                onClick={() => {
                                  setTransactionTypeFilter('all');
                                  setTransactionStatusFilter('all');
                                }}
                                className="mt-2 px-4 py-2 text-sm text-neon-grape hover:text-white transition-colors"
                              >
                                Clear Filters
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((txn) => {
                          const txnDate = new Date(txn.createdAt);
                          const displayType = txn.type === 'credit_purchase' ? 'CREDITS' : txn.type.toUpperCase();
                          const typeClass = txn.type === 'subscription' ? 'bg-neon-grape/20 text-neon-grape' :
                            txn.type === 'credit_purchase' ? 'bg-mzansi-gold/20 text-mzansi-gold' :
                            'bg-red-500/20 text-red-400';
                          return (
                          <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {txnDate.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-sm">{txn.userName}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${typeClass}`}>
                                {displayType}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">{txn.description}</td>
                            <td className="px-6 py-4">
                              <span className="font-mono font-bold text-green-400">R{(txn.amount / 100).toFixed(2)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${txn.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                  txn.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                }`}>
                                {txn.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-enter">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-2xl">Platform Analytics</h3>
                <button
                  onClick={fetchAnalytics}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-glass-border hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-refresh"></i> Refresh
                </button>
              </div>

              {/* Sub-tabs for analytics */}
              <div className="flex gap-2 border-b border-glass-border pb-4">
                <button className="px-4 py-2 rounded-lg bg-neon-grape text-white font-medium">
                  Credits
                </button>
                <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white">
                  Generation
                </button>
                <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white">
                  Publishing
                </button>
                <button className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white">
                  Tiers
                </button>
              </div>

              {analyticsData?.credits && (
                <CreditsAnalytics data={analyticsData.credits} isLoading={analyticsLoading} />
              )}
              
              {analyticsData?.generation && (
                <GenerationStats 
                  data={{
                    ...analyticsData.generation,
                    topTopics: [],
                    errorsByType: {},
                  }} 
                  isLoading={analyticsLoading} 
                />
              )}
              
              {analyticsData?.publishing && (
                <PublishingStats data={analyticsData.publishing} isLoading={analyticsLoading} />
              )}
              
              {analyticsData?.tiers && (
                <TierDistribution data={analyticsData.tiers} isLoading={analyticsLoading} />
              )}
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="space-y-6 animate-enter">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-2xl">Job Monitor</h3>
                <button
                  onClick={fetchJobs}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-glass-border hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-refresh"></i> Refresh
                </button>
              </div>

              <JobMonitor
                jobs={jobs}
                stats={jobStats}
                onRetry={handleJobRetry}
                onViewDetails={(job) => setSelectedJob(job)}
                isLoading={jobsLoading}
              />
            </div>
          )}

          {/* Errors Tab */}
          {activeTab === 'errors' && (
            <div className="space-y-8 animate-enter">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-2xl">Error Tracking</h3>
                <button
                  onClick={fetchErrors}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-glass-border hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-refresh"></i> Refresh
                </button>
              </div>

              <div className="space-y-6">
                <h4 className="font-display font-bold text-xl text-red-400">
                  <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                  AI Generation Errors
                </h4>
                <GenerationErrors
                  errors={generationErrors}
                  isLoading={errorsLoading}
                  onRefresh={fetchErrors}
                />
              </div>

              <div className="space-y-6">
                <h4 className="font-display font-bold text-xl text-red-400">
                  <i className="fa-solid fa-paper-plane mr-2"></i>
                  Publishing Errors
                </h4>
                <PublishingErrors
                  errors={publishingErrors}
                  isLoading={errorsLoading}
                  onRefresh={fetchErrors}
                />
              </div>
            </div>
          )}

          {/* Automation Tab */}
          {activeTab === 'automation' && (
            <div className="space-y-6 animate-enter">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-2xl">Automation Overview</h3>
              </div>

              <AutomationOverview
                rules={analyticsData?.automation?.rules || []}
                stats={analyticsData?.automation?.stats || { totalRules: 0, activeRules: 0, totalCreditsConsumed: 0, totalPostsGenerated: 0 }}
                isLoading={analyticsLoading}
              />
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
              Adjusting credits for <span className="text-white font-bold">{selectedUser.name || selectedUser.email}</span>
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

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onRetry={async () => {
            await handleJobRetry(selectedJob.id);
            setSelectedJob(null);
          }}
        />
      )}
    </div>
  );
}
