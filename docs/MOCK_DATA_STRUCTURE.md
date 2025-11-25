# Mock Data Structure - Purple Glow Social 2.0

## Overview
This document describes the structure and usage of mock data in the Purple Glow Social application. All mock data is centralized in `lib/mock-data.ts` for consistency across components.

---

## Data Models

### MockUser

Represents a user of the platform.

```typescript
interface MockUser {
  id: string;                    // Unique identifier (e.g., "user-1")
  name: string;                  // Full name
  email: string;                 // Email address
  tier: 'free' | 'pro' | 'business';  // Subscription tier
  credits: number;               // Available credits
  image: string;                 // Avatar URL
  joined: Date;                  // Registration date
  lastActive: Date;              // Last activity timestamp
  postsCreated: number;          // Total posts created
  status: 'active' | 'inactive'; // Account status
}
```

**Example:**
```typescript
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
}
```

---

### MockTransaction

Represents a payment transaction.

```typescript
interface MockTransaction {
  id: string;                    // Unique transaction ID
  userId: string;                // Reference to user
  userName: string;              // User's name (denormalized)
  type: 'subscription' | 'credits' | 'refund';  // Transaction type
  amount: number;                // Amount in ZAR
  status: 'completed' | 'pending' | 'failed';   // Transaction status
  date: Date;                    // Transaction date
  description: string;           // Human-readable description
  paymentMethod?: string;        // e.g., "Visa ****4532"
}
```

**Example:**
```typescript
{
  id: 'txn-1',
  userId: 'user-1',
  userName: 'Thabo Nkosi',
  type: 'credits',
  amount: 150,
  status: 'completed',
  date: new Date('2024-03-15'),
  description: '100 Credits Top-up',
  paymentMethod: 'Mastercard ****8821'
}
```

---

### MockInvoice

Represents a billing invoice.

```typescript
interface MockInvoice {
  id: string;                    // Unique invoice ID
  userId: string;                // Reference to user
  date: Date;                    // Invoice date
  plan: string;                  // Plan name
  amount: number;                // Subtotal (ZAR)
  vat: number;                   // VAT amount (15%)
  total: number;                 // Total amount
  status: 'paid' | 'pending' | 'overdue';  // Payment status
  paymentMethod: string;         // Payment method used
  invoiceNumber: string;         // Invoice number (e.g., "PG-202403-1234")
}
```

**Example:**
```typescript
{
  id: 'inv-user-1-0',
  userId: 'user-1',
  date: new Date('2024-03-01'),
  plan: 'Pro Plan',
  amount: 299,
  vat: 44.85,
  total: 343.85,
  status: 'paid',
  paymentMethod: 'Visa ****4532',
  invoiceNumber: 'PG-202403-1234'
}
```

---

### MockScheduledPost

Represents a scheduled social media post.

```typescript
interface MockScheduledPost {
  id: string;                    // Unique post ID
  userId: string;                // Reference to user
  content: string;               // Post content/caption
  imageUrl: string | null;       // Optional image URL
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook';  // Target platform
  scheduledDate: Date;           // When to publish
  status: 'scheduled' | 'posted' | 'failed';  // Post status
  topic: string;                 // Post topic/category
}
```

**Example:**
```typescript
{
  id: 'post-1',
  userId: 'user-1',
  content: 'Start your Monday with energy! 🌅 New week, new opportunities. What are your goals this week? #MondayMotivation #SouthAfrica',
  imageUrl: 'https://picsum.photos/400/400?random=1',
  platform: 'instagram',
  scheduledDate: new Date('2024-01-22T08:00:00'),
  status: 'scheduled',
  topic: 'Morning Motivation'
}
```

---

### MockAutomationRule

Represents an automation rule for content generation.

```typescript
interface MockAutomationRule {
  id: string;                    // Unique rule ID
  userId: string;                // Reference to user
  name: string;                  // Rule name
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';  // How often to run
  coreTopic: string;             // Main topic for content
  platforms: ('instagram' | 'twitter' | 'linkedin' | 'facebook')[];  // Target platforms
  isActive: boolean;             // Whether rule is enabled
  lastRun: Date | null;          // Last execution time
  nextRun: Date;                 // Next scheduled execution
  postsGenerated: number;        // Total posts created by this rule
  createdAt: Date;               // Rule creation date
}
```

**Example:**
```typescript
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
}
```

---

## Available Data Collections

### MOCK_USERS
Array of 15 mock users representing different subscription tiers and usage patterns.

**Usage:**
```typescript
import { MOCK_USERS } from './lib/mock-data';

const allUsers = MOCK_USERS;
const proUsers = MOCK_USERS.filter(u => u.tier === 'pro');
```

---

### MOCK_TRANSACTIONS
Array of transaction history for various users.

**Usage:**
```typescript
import { MOCK_TRANSACTIONS } from './lib/mock-data';

const recentTransactions = MOCK_TRANSACTIONS
  .sort((a, b) => b.date.getTime() - a.date.getTime())
  .slice(0, 10);
```

---

### MOCK_SCHEDULED_POSTS
Array of 8 scheduled posts for demonstration.

**Usage:**
```typescript
import { MOCK_SCHEDULED_POSTS } from './lib/mock-data';

const instagramPosts = MOCK_SCHEDULED_POSTS.filter(
  post => post.platform === 'instagram'
);
```

---

### MOCK_AUTOMATION_RULES
Array of 3 automation rules with different configurations.

**Usage:**
```typescript
import { MOCK_AUTOMATION_RULES } from './lib/mock-data';

const activeRules = MOCK_AUTOMATION_RULES.filter(rule => rule.isActive);
```

---

## Helper Functions

### getUserById
Get a specific user by ID.

```typescript
getUserById(userId: string): MockUser | undefined
```

**Example:**
```typescript
import { getUserById } from './lib/mock-data';

const user = getUserById('user-1');
if (user) {
  console.log(user.name); // "Thabo Nkosi"
}
```

---

### getTransactionsByUserId
Get all transactions for a specific user.

```typescript
getTransactionsByUserId(userId: string): MockTransaction[]
```

**Example:**
```typescript
import { getTransactionsByUserId } from './lib/mock-data';

const transactions = getTransactionsByUserId('user-1');
console.log(`User has ${transactions.length} transactions`);
```

---

### getScheduledPostsByUserId
Get all scheduled posts for a specific user.

```typescript
getScheduledPostsByUserId(userId: string): MockScheduledPost[]
```

**Example:**
```typescript
import { getScheduledPostsByUserId } from './lib/mock-data';

const posts = getScheduledPostsByUserId('user-1');
const upcoming = posts.filter(p => new Date(p.scheduledDate) > new Date());
```

---

### getAutomationRulesByUserId
Get all automation rules for a specific user.

```typescript
getAutomationRulesByUserId(userId: string): MockAutomationRule[]
```

**Example:**
```typescript
import { getAutomationRulesByUserId } from './lib/mock-data';

const rules = getAutomationRulesByUserId('user-1');
const activeCount = rules.filter(r => r.isActive).length;
```

---

### getCurrentUser
Get the current logged-in user (always returns user-1 for demo).

```typescript
getCurrentUser(): MockUser
```

**Example:**
```typescript
import { getCurrentUser } from './lib/mock-data';

const currentUser = getCurrentUser();
console.log(`Welcome back, ${currentUser.name}!`);
```

---

### generateMockInvoices
Generate invoice history for a user.

```typescript
generateMockInvoices(userId: string): MockInvoice[]
```

**Example:**
```typescript
import { generateMockInvoices } from './lib/mock-data';

const invoices = generateMockInvoices('user-1');
// Returns last 6 months of invoices
```

---

## Data Relationships

```
MockUser (1) ─────── (*) MockTransaction
    │
    ├─────── (*) MockScheduledPost
    │
    ├─────── (*) MockAutomationRule
    │
    └─────── (*) MockInvoice
```

All data entities reference users via `userId` field for consistency.

---

## South African Context

### Currency
All amounts are in **South African Rand (ZAR)**.
- VAT rate: 15%
- Pricing tiers:
  - Free: R 0/month
  - Pro: R 299/month
  - Business: R 999/month

### User Names
Mock users have South African names representing the diverse population:
- Thabo Nkosi
- Zanele Dlamini
- Pieter van der Merwe
- Lindiwe Khumalo
- Johan Botha
- And more...

### Locations
Email addresses and business names reference South African cities:
- Johannesburg (Joburg)
- Cape Town
- Durban
- Pretoria
- Port Elizabeth
- And more...

### Hashtags
Mock posts use SA-relevant hashtags:
- #LocalIsLekker
- #MzansiMagic
- #SouthAfrica
- #Joburg
- #CapeTown

---

## Best Practices

### Consistency
Always use helper functions to retrieve data instead of filtering arrays directly:

✅ **Good:**
```typescript
const user = getCurrentUser();
const posts = getScheduledPostsByUserId(user.id);
```

❌ **Avoid:**
```typescript
const user = MOCK_USERS[0];
const posts = MOCK_SCHEDULED_POSTS.filter(p => p.userId === user.id);
```

### Type Safety
Import types alongside data:

```typescript
import { 
  MOCK_USERS, 
  MockUser, 
  getCurrentUser 
} from './lib/mock-data';

const user: MockUser = getCurrentUser();
```

### Data Immutability
Don't modify mock data directly. Create copies when needed:

```typescript
const usersCopy = [...MOCK_USERS];
const updatedUser = { ...getCurrentUser(), credits: 500 };
```

### Testing
Mock data is designed for testing and demonstration. For production:
1. Replace with actual API calls
2. Implement proper authentication
3. Add real database integration
4. Handle async operations properly

---

## Extending Mock Data

### Adding New Users

```typescript
const newUser: MockUser = {
  id: 'user-16',
  name: 'Your Name',
  email: 'your.email@example.co.za',
  tier: 'pro',
  credits: 300,
  image: 'https://ui-avatars.com/api/?name=Your+Name',
  joined: new Date(),
  lastActive: new Date(),
  postsCreated: 0,
  status: 'active'
};

MOCK_USERS.push(newUser);
```

### Adding New Posts

```typescript
const newPost: MockScheduledPost = {
  id: 'post-9',
  userId: 'user-1',
  content: 'Your post content here',
  imageUrl: null,
  platform: 'instagram',
  scheduledDate: new Date('2024-01-30T10:00:00'),
  status: 'scheduled',
  topic: 'New Topic'
};

MOCK_SCHEDULED_POSTS.push(newPost);
```

---

## Migration Path

When moving from mock to real data:

1. **Replace imports:**
   ```typescript
   // Before
   import { getCurrentUser } from './lib/mock-data';
   
   // After
   import { getCurrentUser } from './lib/api/users';
   ```

2. **Add async/await:**
   ```typescript
   // Before
   const user = getCurrentUser();
   
   // After
   const user = await getCurrentUser();
   ```

3. **Handle loading states:**
   ```typescript
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   
   useEffect(() => {
     getCurrentUser().then(setUser).finally(() => setLoading(false));
   }, []);
   ```

4. **Add error handling:**
   ```typescript
   try {
     const user = await getCurrentUser();
     setUser(user);
   } catch (error) {
     console.error('Failed to load user:', error);
     setError(error);
   }
   ```

---

## FAQ

**Q: Can I modify mock data at runtime?**
A: Yes, but changes won't persist across page refreshes. For persistent changes, implement localStorage or a state management solution.

**Q: How do I add more posts to the calendar?**
A: Add new objects to the `MOCK_SCHEDULED_POSTS` array with appropriate dates.

**Q: Are dates timezone-aware?**
A: All dates use the system timezone. For production, use proper timezone handling (e.g., date-fns-tz).

**Q: Can I use this in production?**
A: No, mock data is for development and demonstration only. Implement proper backend integration for production.

---

**Last Updated:** Phase 6 Completion
**Maintainer:** Purple Glow Social Team
