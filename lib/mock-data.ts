// Centralized mock data for Purple Glow Social
// This ensures consistency across all components

export interface MockUser {
  id: string;
  name: string;
  email: string;
  tier: 'free' | 'pro' | 'business';
  credits: number;
  image: string;
  joined: Date;
  lastActive: Date;
  postsCreated: number;
  status: 'active' | 'inactive';
}

export interface MockTransaction {
  id: string;
  userId: string;
  userName: string;
  type: 'subscription' | 'credits' | 'refund';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: Date;
  description: string;
  paymentMethod?: string;
}

export interface MockInvoice {
  id: string;
  userId: string;
  date: Date;
  plan: string;
  amount: number;
  vat: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod: string;
  invoiceNumber: string;
}

export interface MockScheduledPost {
  id: string;
  userId: string;
  content: string;
  imageUrl: string | null;
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook';
  scheduledDate: Date;
  status: 'scheduled' | 'posted' | 'failed';
  topic: string;
}

export interface MockAutomationRule {
  id: string;
  userId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  coreTopic: string;
  platforms: ('instagram' | 'twitter' | 'linkedin' | 'facebook')[];
  isActive: boolean;
  lastRun: Date | null;
  nextRun: Date;
  postsGenerated: number;
  createdAt: Date;
}

// Generate mock users
export const MOCK_USERS: MockUser[] = [
  {
    id: 'user-1',
    name: 'Thabo Nkosi',
    email: 'thabo@purpleglow.co.za',
    tier: 'pro',
    credits: 450,
    image: 'https://ui-avatars.com/api/?name=Thabo+Nkosi&background=9D4EDD&color=fff',
    joined: new Date('2024-01-15'),
    lastActive: new Date('2024-03-20'),
    postsCreated: 127,
    status: 'active'
  },
  {
    id: 'user-2',
    name: 'Zanele Dlamini',
    email: 'zanele@mzansibiz.co.za',
    tier: 'business',
    credits: 1850,
    image: 'https://ui-avatars.com/api/?name=Zanele+Dlamini&background=00E0FF&color=000',
    joined: new Date('2023-11-03'),
    lastActive: new Date('2024-03-21'),
    postsCreated: 342,
    status: 'active'
  },
  {
    id: 'user-3',
    name: 'Pieter van der Merwe',
    email: 'pieter@capetowncreative.co.za',
    tier: 'free',
    credits: 3,
    image: 'https://ui-avatars.com/api/?name=Pieter+van+der+Merwe&background=FFCC00&color=000',
    joined: new Date('2024-03-10'),
    lastActive: new Date('2024-03-18'),
    postsCreated: 5,
    status: 'active'
  },
  {
    id: 'user-4',
    name: 'Lindiwe Khumalo',
    email: 'lindiwe@durbansocial.co.za',
    tier: 'pro',
    credits: 680,
    image: 'https://ui-avatars.com/api/?name=Lindiwe+Khumalo&background=9D4EDD&color=fff',
    joined: new Date('2024-02-01'),
    lastActive: new Date('2024-03-21'),
    postsCreated: 89,
    status: 'active'
  },
  {
    id: 'user-5',
    name: 'Johan Botha',
    email: 'johan@joburgtrade.co.za',
    tier: 'business',
    credits: 2100,
    image: 'https://ui-avatars.com/api/?name=Johan+Botha&background=00E0FF&color=000',
    joined: new Date('2023-09-20'),
    lastActive: new Date('2024-03-20'),
    postsCreated: 456,
    status: 'active'
  },
  {
    id: 'user-6',
    name: 'Nomsa Mthembu',
    email: 'nomsa@sowetostyle.co.za',
    tier: 'free',
    credits: 0,
    image: 'https://ui-avatars.com/api/?name=Nomsa+Mthembu&background=FFCC00&color=000',
    joined: new Date('2024-03-15'),
    lastActive: new Date('2024-03-16'),
    postsCreated: 2,
    status: 'inactive'
  },
  {
    id: 'user-7',
    name: 'Sipho Ndlovu',
    email: 'sipho@pretoriamarketing.co.za',
    tier: 'pro',
    credits: 320,
    image: 'https://ui-avatars.com/api/?name=Sipho+Ndlovu&background=9D4EDD&color=fff',
    joined: new Date('2024-01-28'),
    lastActive: new Date('2024-03-21'),
    postsCreated: 67,
    status: 'active'
  },
  {
    id: 'user-8',
    name: 'Anelisa Venter',
    email: 'anelisa@capetowncafe.co.za',
    tier: 'pro',
    credits: 540,
    image: 'https://ui-avatars.com/api/?name=Anelisa+Venter&background=9D4EDD&color=fff',
    joined: new Date('2023-12-10'),
    lastActive: new Date('2024-03-21'),
    postsCreated: 156,
    status: 'active'
  },
  {
    id: 'user-9',
    name: 'Thandi Mokoena',
    email: 'thandi@bloemtech.co.za',
    tier: 'free',
    credits: 5,
    image: 'https://ui-avatars.com/api/?name=Thandi+Mokoena&background=FFCC00&color=000',
    joined: new Date('2024-03-12'),
    lastActive: new Date('2024-03-19'),
    postsCreated: 4,
    status: 'active'
  },
  {
    id: 'user-10',
    name: 'Francois du Plessis',
    email: 'francois@stellenboschvines.co.za',
    tier: 'business',
    credits: 1450,
    image: 'https://ui-avatars.com/api/?name=Francois+du+Plessis&background=00E0FF&color=000',
    joined: new Date('2023-10-15'),
    lastActive: new Date('2024-03-20'),
    postsCreated: 278,
    status: 'active'
  },
  {
    id: 'user-11',
    name: 'Zinhle Sibiya',
    email: 'zinhle@nelspruitglow.co.za',
    tier: 'pro',
    credits: 780,
    image: 'https://ui-avatars.com/api/?name=Zinhle+Sibiya&background=9D4EDD&color=fff',
    joined: new Date('2024-02-14'),
    lastActive: new Date('2024-03-21'),
    postsCreated: 94,
    status: 'active'
  },
  {
    id: 'user-12',
    name: 'Andries Kruger',
    email: 'andries@georgeroutes.co.za',
    tier: 'free',
    credits: 2,
    image: 'https://ui-avatars.com/api/?name=Andries+Kruger&background=FFCC00&color=000',
    joined: new Date('2024-03-18'),
    lastActive: new Date('2024-03-19'),
    postsCreated: 1,
    status: 'active'
  },
  {
    id: 'user-13',
    name: 'Mbali Cele',
    email: 'mbali@pietermaritzcraft.co.za',
    tier: 'pro',
    credits: 610,
    image: 'https://ui-avatars.com/api/?name=Mbali+Cele&background=9D4EDD&color=fff',
    joined: new Date('2024-01-20'),
    lastActive: new Date('2024-03-21'),
    postsCreated: 103,
    status: 'active'
  },
  {
    id: 'user-14',
    name: 'Willem Jansen',
    email: 'willem@polokwanepro.co.za',
    tier: 'business',
    credits: 1920,
    image: 'https://ui-avatars.com/api/?name=Willem+Jansen&background=00E0FF&color=000',
    joined: new Date('2023-08-25'),
    lastActive: new Date('2024-03-20'),
    postsCreated: 401,
    status: 'active'
  },
  {
    id: 'user-15',
    name: 'Nokuthula Mabaso',
    email: 'nokuthula@empangenidesign.co.za',
    tier: 'free',
    credits: 4,
    image: 'https://ui-avatars.com/api/?name=Nokuthula+Mabaso&background=FFCC00&color=000',
    joined: new Date('2024-03-14'),
    lastActive: new Date('2024-03-17'),
    postsCreated: 3,
    status: 'inactive'
  },
];

// Generate mock transactions
export const MOCK_TRANSACTIONS: MockTransaction[] = [
  {
    id: 'txn-1',
    userId: 'user-2',
    userName: 'Zanele Dlamini',
    type: 'subscription',
    amount: 999,
    status: 'completed',
    date: new Date('2024-03-01'),
    description: 'Business Plan - Monthly',
    paymentMethod: 'Visa ****4532'
  },
  {
    id: 'txn-2',
    userId: 'user-1',
    userName: 'Thabo Nkosi',
    type: 'credits',
    amount: 150,
    status: 'completed',
    date: new Date('2024-03-15'),
    description: '100 Credits Top-up',
    paymentMethod: 'Mastercard ****8821'
  },
  {
    id: 'txn-3',
    userId: 'user-5',
    userName: 'Johan Botha',
    type: 'subscription',
    amount: 999,
    status: 'completed',
    date: new Date('2024-03-01'),
    description: 'Business Plan - Monthly',
    paymentMethod: 'Visa ****3421'
  },
  {
    id: 'txn-4',
    userId: 'user-4',
    userName: 'Lindiwe Khumalo',
    type: 'subscription',
    amount: 299,
    status: 'completed',
    date: new Date('2024-03-01'),
    description: 'Pro Plan - Monthly',
    paymentMethod: 'Mastercard ****7654'
  },
  {
    id: 'txn-5',
    userId: 'user-8',
    userName: 'Anelisa Venter',
    type: 'credits',
    amount: 600,
    status: 'completed',
    date: new Date('2024-03-10'),
    description: '500 Credits Top-up',
    paymentMethod: 'Visa ****2109'
  },
  {
    id: 'txn-6',
    userId: 'user-14',
    userName: 'Willem Jansen',
    type: 'subscription',
    amount: 999,
    status: 'completed',
    date: new Date('2024-03-01'),
    description: 'Business Plan - Monthly',
    paymentMethod: 'Amex ****1005'
  },
  {
    id: 'txn-7',
    userId: 'user-7',
    userName: 'Sipho Ndlovu',
    type: 'subscription',
    amount: 299,
    status: 'completed',
    date: new Date('2024-03-01'),
    description: 'Pro Plan - Monthly',
    paymentMethod: 'Visa ****6677'
  },
  {
    id: 'txn-8',
    userId: 'user-11',
    userName: 'Zinhle Sibiya',
    type: 'credits',
    amount: 850,
    status: 'completed',
    date: new Date('2024-03-08'),
    description: 'Video Pack - 50 Videos',
    paymentMethod: 'Mastercard ****9988'
  },
  {
    id: 'txn-9',
    userId: 'user-13',
    userName: 'Mbali Cele',
    type: 'subscription',
    amount: 299,
    status: 'completed',
    date: new Date('2024-03-01'),
    description: 'Pro Plan - Monthly',
    paymentMethod: 'Visa ****4433'
  },
  {
    id: 'txn-10',
    userId: 'user-10',
    userName: 'Francois du Plessis',
    type: 'credits',
    amount: 1000,
    status: 'completed',
    date: new Date('2024-03-12'),
    description: '1000 Credits Top-up',
    paymentMethod: 'Amex ****2234'
  },
];

// Calculate revenue metrics
export const calculateRevenueMetrics = () => {
  const now = new Date();
  const thisMonth = MOCK_TRANSACTIONS.filter(t => 
    t.date.getMonth() === now.getMonth() && 
    t.date.getFullYear() === now.getFullYear() &&
    t.status === 'completed'
  );
  
  const monthlyRevenue = thisMonth.reduce((sum, t) => sum + t.amount, 0);
  
  // MRR from subscriptions only
  const subscriptionRevenue = MOCK_USERS
    .filter(u => u.tier !== 'free' && u.status === 'active')
    .reduce((sum, u) => {
      if (u.tier === 'pro') return sum + 299;
      if (u.tier === 'business') return sum + 999;
      return sum;
    }, 0);
  
  const activeUsers = MOCK_USERS.filter(u => u.status === 'active').length;
  const totalRevenue = MOCK_TRANSACTIONS
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    mrr: subscriptionRevenue,
    monthlyRevenue,
    activeUsers,
    totalRevenue,
    totalUsers: MOCK_USERS.length
  };
};

// Tier distribution
export const getTierDistribution = () => {
  const distribution = { free: 0, pro: 0, business: 0 };
  MOCK_USERS.forEach(user => {
    distribution[user.tier]++;
  });
  return distribution;
};

// Mock invoices for billing history
export const generateMockInvoices = (userId: string): MockInvoice[] => {
  const user = MOCK_USERS.find(u => u.id === userId);
  if (!user || user.tier === 'free') return [];
  
  const invoices: MockInvoice[] = [];
  const planAmount = user.tier === 'pro' ? 299 : 999;
  
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    date.setDate(1);
    
    const vat = planAmount * 0.15;
    const total = planAmount + vat;
    
    invoices.push({
      id: `inv-${userId}-${i}`,
      userId,
      date,
      plan: user.tier === 'pro' ? 'Pro Plan' : 'Business Plan',
      amount: planAmount,
      vat,
      total,
      status: 'paid',
      paymentMethod: 'Visa ****4532',
      invoiceNumber: `PG-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
    });
  }
  
  return invoices;
};

// Mock scheduled posts
export const MOCK_SCHEDULED_POSTS: MockScheduledPost[] = [
  {
    id: 'post-1',
    userId: 'user-1',
    content: 'Start your Monday with energy! 🌅 New week, new opportunities. What are your goals this week? #MondayMotivation #SouthAfrica',
    imageUrl: 'https://picsum.photos/400/400?random=1',
    platform: 'instagram',
    scheduledDate: new Date('2024-01-22T08:00:00'),
    status: 'scheduled',
    topic: 'Morning Motivation'
  },
  {
    id: 'post-2',
    userId: 'user-1',
    content: 'Something exciting is coming... 👀 Stay tuned for our biggest announcement yet! #ComingSoon',
    imageUrl: 'https://picsum.photos/400/400?random=2',
    platform: 'twitter',
    scheduledDate: new Date('2024-01-22T12:30:00'),
    status: 'scheduled',
    topic: 'Product Launch Teaser'
  },
  {
    id: 'post-3',
    userId: 'user-1',
    content: 'The future of digital marketing in South Africa: 3 trends you can\'t ignore. Read our latest insights. #DigitalMarketing #BusinessGrowth',
    imageUrl: null,
    platform: 'linkedin',
    scheduledDate: new Date('2024-01-22T14:00:00'),
    status: 'scheduled',
    topic: 'Industry Insights'
  },
  {
    id: 'post-4',
    userId: 'user-1',
    content: 'We want to hear from you! What\'s your favorite local brand and why? Drop a comment below! 💬 #LocalIsLekker',
    imageUrl: null,
    platform: 'facebook',
    scheduledDate: new Date('2024-01-22T18:00:00'),
    status: 'scheduled',
    topic: 'Evening Engagement'
  },
  {
    id: 'post-5',
    userId: 'user-1',
    content: 'Behind the scenes at our Joburg office! Meet the team that makes the magic happen. ✨ #TeamTuesday',
    imageUrl: 'https://picsum.photos/400/400?random=3',
    platform: 'instagram',
    scheduledDate: new Date('2024-01-23T10:00:00'),
    status: 'scheduled',
    topic: 'Behind the Scenes'
  },
  {
    id: 'post-6',
    userId: 'user-1',
    content: '💡 Pro tip: Engage with your audience within the first hour of posting for maximum reach. #SocialMediaTips',
    imageUrl: null,
    platform: 'twitter',
    scheduledDate: new Date('2024-01-23T12:00:00'),
    status: 'scheduled',
    topic: 'Tip of the Day'
  },
  {
    id: 'post-7',
    userId: 'user-1',
    content: 'Success story: How @CustomerName grew their business by 300% using our platform. Read the full case study. #SuccessStory',
    imageUrl: 'https://picsum.photos/400/400?random=4',
    platform: 'linkedin',
    scheduledDate: new Date('2024-01-24T09:00:00'),
    status: 'scheduled',
    topic: 'Customer Spotlight'
  },
  {
    id: 'post-8',
    userId: 'user-1',
    content: 'Friday feels! 🎉 What are your weekend plans? Share below! #FridayVibes #WeekendReady',
    imageUrl: 'https://picsum.photos/400/400?random=5',
    platform: 'instagram',
    scheduledDate: new Date('2024-01-26T19:00:00'),
    status: 'scheduled',
    topic: 'Weekend Vibes'
  },
];

// Mock automation rules
export const MOCK_AUTOMATION_RULES: MockAutomationRule[] = [
  {
    id: 'rule-1',
    userId: 'user-1',
    name: 'Weekly Product Showcase',
    frequency: 'weekly',
    coreTopic: 'Product Highlights',
    platforms: ['instagram', 'facebook'],
    isActive: true,
    lastRun: new Date('2024-01-15T09:00:00'),
    nextRun: new Date('2024-01-22T09:00:00'),
    postsGenerated: 24,
    createdAt: new Date('2023-10-01T10:00:00')
  },
  {
    id: 'rule-2',
    userId: 'user-1',
    name: 'Daily Tips & Tricks',
    frequency: 'daily',
    coreTopic: 'Social Media Tips',
    platforms: ['twitter', 'linkedin'],
    isActive: true,
    lastRun: new Date('2024-01-20T12:30:00'),
    nextRun: new Date('2024-01-21T12:30:00'),
    postsGenerated: 87,
    createdAt: new Date('2023-11-15T14:00:00')
  },
  {
    id: 'rule-3',
    userId: 'user-1',
    name: 'Monthly Recap',
    frequency: 'monthly',
    coreTopic: 'Monthly Highlights',
    platforms: ['instagram', 'linkedin', 'facebook'],
    isActive: false,
    lastRun: new Date('2023-12-31T18:00:00'),
    nextRun: new Date('2024-01-31T18:00:00'),
    postsGenerated: 3,
    createdAt: new Date('2023-09-01T10:00:00')
  },
];

// Helper functions for data retrieval
export const getUserById = (userId: string): MockUser | undefined => {
  return MOCK_USERS.find(user => user.id === userId);
};

export const getTransactionsByUserId = (userId: string): MockTransaction[] => {
  return MOCK_TRANSACTIONS.filter(txn => txn.userId === userId);
};

export const getScheduledPostsByUserId = (userId: string): MockScheduledPost[] => {
  return MOCK_SCHEDULED_POSTS.filter(post => post.userId === userId);
};

export const getAutomationRulesByUserId = (userId: string): MockAutomationRule[] => {
  return MOCK_AUTOMATION_RULES.filter(rule => rule.userId === userId);
};

// Get current user (for demo purposes, always return user-1)
export const getCurrentUser = (): MockUser => {
  return MOCK_USERS[0]; // Thabo Nkosi
};
