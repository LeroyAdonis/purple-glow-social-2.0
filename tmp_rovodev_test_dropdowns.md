# Dropdown Testing Guide - Purple Glow Social 2.0

## Quick Visual Test Steps

### 🎯 Test 1: Admin Dashboard - Transaction Filters (PRIMARY FOCUS)

1. **Navigate to Admin Dashboard**
   - Click on your user avatar
   - Select "Admin Dashboard" from menu
   - Or go directly to `/admin`

2. **Go to Transactions Tab**
   - Click "Transactions" in the sidebar (third option)
   - Should see 3 stats cards at top
   - Should see 2 dropdown filters below stats

3. **Test Type Filter Dropdown**
   ```
   Click: Type filter dropdown
   ✓ Opens with smooth animation
   ✓ Shows 4 options with icons:
     - All Types (filter icon)
     - Subscriptions (repeat icon, purple)
     - Credit Purchases (coins icon, gold)
     - Refunds (rotate-left icon, red)
   ✓ Options have hover effect (lighter background)
   ✓ Selected option has purple background
   ✓ Click outside closes dropdown
   ✓ Press Escape closes dropdown
   ```

4. **Test Status Filter Dropdown**
   ```
   Click: Status filter dropdown
   ✓ Opens with smooth animation
   ✓ Shows 4 options with icons:
     - All Status (circle-dot icon)
     - Completed (check-circle icon, green)
     - Pending (clock icon, yellow)
     - Failed (times-circle icon, red)
   ✓ Same UX behavior as type filter
   ```

5. **Test Filter Functionality**
   ```
   Select: "Subscriptions" from type filter
   ✓ Stats cards update immediately
   ✓ Filtered Results count changes
   ✓ Total Amount updates
   ✓ Table shows only subscription transactions
   ✓ Transaction badges are purple
   
   Select: "Completed" from status filter
   ✓ Stats update again (filtered by type AND status)
   ✓ Table shows only completed subscriptions
   ✓ Status badges are all green
   
   Select: "Failed" from status filter
   ✓ If no failed subscriptions, shows empty state
   ✓ "Clear Filters" button appears
   ✓ Click "Clear Filters" resets both dropdowns
   ```

6. **Test Export Button**
   ```
   With filters applied:
   ✓ Hover over "Export CSV" button
   ✓ Border color changes to teal
   ✓ Text color changes to white
   ✓ Click shows alert with filtered count
   ```

---

### 🎯 Test 2: Admin Dashboard - User Tier Filter

1. **Go to Users Tab**
   - Click "User Management" in sidebar (first option)

2. **Test Tier Filter Dropdown**
   ```
   Click: Tier filter dropdown (right of search box)
   ✓ Opens with smooth animation
   ✓ Shows 4 options with icons:
     - All Tiers (users icon)
     - Free (user icon, gray)
     - Pro (crown icon, purple)
     - Business (building icon, teal)
   ✓ Filter works - table updates
   ✓ User count changes
   ```

3. **Test Inline Tier Dropdowns**
   ```
   In user table, find "Tier" column:
   ✓ Each tier badge is a dropdown
   ✓ Free tier: gray background
   ✓ Pro tier: purple background
   ✓ Business tier: teal background
   ✓ Click opens native select
   ✓ Options have dark background
   ✓ Chevron icon visible
   ✓ Hover brightens the badge
   ✓ Change updates tier immediately
   ```

---

### 🎯 Test 3: Content Generator

1. **Navigate to Dashboard**
   - Go to main dashboard
   - Click "Generate" tab

2. **Test Vibe Dropdown**
   ```
   Find "VIBE CHECK" label:
   ✓ Dropdown has dark background
   ✓ Hover makes it lighter
   ✓ Focus shows teal ring
   ✓ Click opens options:
     - Mzansi Cool 🇿🇦
     - Corporate Pro
     - Cyberpunk Energy
     - Warm Community
   ✓ Options have dark backgrounds
   ✓ Chevron centered vertically
   ```

3. **Test Platform Dropdown**
   ```
   Find "PLATFORM" label:
   ✓ Same styling as Vibe dropdown
   ✓ Options have emojis:
     - 📸 Instagram
     - 🐦 Twitter / X
     - 💼 LinkedIn
     - 👍 Facebook
   ✓ Selection works correctly
   ```

---

### 🎯 Test 4: Settings View

1. **Navigate to Settings**
   - Click user avatar
   - Select "Settings"
   - Go to "Preferences" tab

2. **Test Timezone Dropdown**
   ```
   Find "TIMEZONE" label:
   ✓ Dropdown has dark background
   ✓ Hover effect present
   ✓ Focus shows purple ring
   ✓ Options:
     - 🇿🇦 SAST (UTC+2)
     - 🌍 UTC
   ✓ Emojis display correctly
   ✓ Chevron positioned correctly
   ```

3. **Test Language Dropdown**
   ```
   Find "LANGUAGE" label:
   ✓ Same styling as timezone
   ✓ 6 language options:
     - English
     - Afrikaans
     - isiZulu
     - isiXhosa
     - Sesotho sa Leboa
     - Setswana
   ✓ Selection works
   ```

---

## 🎨 Design System Verification

### Color Checks
- [ ] Focus rings are purple (#9D4EDD)
- [ ] Hover effects lighten backgrounds
- [ ] Option backgrounds are dark (#05040A)
- [ ] Icons match their context colors
- [ ] Borders are glass-border (white/10)

### Interaction Checks
- [ ] All dropdowns open smoothly
- [ ] Click outside closes dropdown
- [ ] Escape key closes dropdown
- [ ] Focus states are visible
- [ ] Hover states are smooth (200ms)
- [ ] Selected options highlighted

### Accessibility Checks
- [ ] Tab navigation works
- [ ] Enter/Space opens dropdown
- [ ] Arrow keys navigate options
- [ ] Selected option has checkmark
- [ ] Colors have good contrast

---

## 🐛 Known Issues to Watch For

### Things That Should NOT Happen:
- ❌ White flash when opening dropdown
- ❌ Dropdown remains open when clicking outside
- ❌ Chevron icon off-center
- ❌ Options have white/light background
- ❌ Filters don't update table
- ❌ Stats cards don't update
- ❌ Multiple dropdowns open at once

### Expected Behavior:
- ✅ Smooth open/close animations
- ✅ Dark option backgrounds
- ✅ Instant filter updates
- ✅ Proper icon colors
- ✅ Centered chevrons
- ✅ Only one dropdown open at a time

---

## 📱 Responsive Testing

### Desktop (1920x1080)
- [ ] All dropdowns display full width
- [ ] Stats cards in grid layout
- [ ] Filters side by side

### Tablet (768px)
- [ ] Dropdowns stack vertically
- [ ] Stats cards in 2 columns
- [ ] Filters stack

### Mobile (375px)
- [ ] Dropdowns full width
- [ ] Stats cards stack
- [ ] Filters stack
- [ ] Touch interactions work

---

## 🚀 Performance Checks

- [ ] Dropdowns open in < 100ms
- [ ] Filter updates in < 200ms
- [ ] No layout shift when opening
- [ ] Smooth 60fps animations
- [ ] No console errors

---

## ✅ Completion Checklist

### Transaction Filters
- [ ] Type filter works
- [ ] Status filter works
- [ ] Combined filters work
- [ ] Stats update correctly
- [ ] Empty state appears
- [ ] Clear filters works
- [ ] Export button functional

### Other Dropdowns
- [ ] User tier filter works
- [ ] Inline tier dropdowns work
- [ ] Vibe selector works
- [ ] Platform selector works
- [ ] Timezone selector works
- [ ] Language selector works

### Design System
- [ ] All colors match design system
- [ ] All interactions smooth
- [ ] All states visible
- [ ] All icons correct
- [ ] All spacing consistent

---

## 📸 Screenshots to Capture

1. Admin Dashboard - Transactions tab (filters visible)
2. Transaction type filter opened
3. Transaction status filter opened
4. Empty state with "Clear Filters" button
5. User tier filter opened
6. Content generator dropdowns
7. Settings preferences dropdowns

---

## 🎓 Testing Tips

1. **Use Browser DevTools**: Inspect hover/focus states
2. **Check Console**: Should have no errors
3. **Test Keyboard**: Tab through all dropdowns
4. **Test Mobile**: Use device emulation
5. **Clear Cache**: If styles don't update
6. **Test Edge Cases**: Empty results, all filters combined

---

**Happy Testing! 🧪**

If you find any issues, check:
1. Browser cache cleared?
2. Development server restarted?
3. Correct page/tab opened?
4. Console shows any errors?

The development server is running at: `http://localhost:3003`
