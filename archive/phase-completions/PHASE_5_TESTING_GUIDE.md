# Phase 5 Testing Guide

## Quick Start

The dev server should be running. If not, start it with:

```bash
npm run dev
```

Then navigate to: `http://localhost:3001` (or the port shown in your terminal)

## Testing Flow

### 1. Access the Dashboard
1. Click "Launch Dashboard" on the landing page
2. You should see the main dashboard with a sidebar

### 2. Test Schedule View
1. Click **"Schedule"** in the sidebar navigation
2. Verify you see the Schedule View with:
   - Stats bar showing scheduled posts count
   - View toggle buttons (Calendar / List / Timeline)
   - Platform filter buttons
   - Smart Suggestions sidebar on the right

#### Test Calendar View
1. Ensure **"Calendar"** is selected
2. Verify:
   - ✅ Monthly calendar grid displays
   - ✅ Current date is highlighted
   - ✅ Posts appear on their scheduled dates
   - ✅ Different platform colors show (Instagram gradient, Twitter blue, etc.)
   - ✅ Hover over a post to see the preview tooltip
   - ✅ Navigate months using arrow buttons
   - ✅ "Today" button returns to current month

#### Test List View
1. Click **"List"** view toggle
2. Verify:
   - ✅ Posts grouped by date
   - ✅ Each post shows platform, time, and content
   - ✅ Status badges display correctly
   - ✅ Checkbox for selecting posts
   - ✅ Edit and Delete buttons appear

#### Test Timeline View
1. Click **"Timeline"** view toggle
2. Verify:
   - ✅ Vertical timeline with posts
   - ✅ Time labels on the left
   - ✅ Platform icons and colored dots
   - ✅ Chronological order

#### Test Filters
1. Click platform filter buttons (Instagram, Twitter, LinkedIn, Facebook)
2. Verify:
   - ✅ Only selected platforms show
   - ✅ Stats update accordingly
   - ✅ Works across all view modes

#### Test Bulk Actions
1. In List view, select multiple posts using checkboxes
2. Verify:
   - ✅ Bulk action buttons appear (Schedule, Delete)
   - ✅ Shows count of selected posts
   - ✅ Clicking actions shows confirmation

### 3. Test Schedule Post Modal
1. Click **"Schedule Post"** button in the header
2. Verify the modal opens with:
   - ✅ AI Pilot Best Times section with 4 time slots
   - ✅ Engagement indicators (High, Very High, Medium)
   - ✅ Quick select buttons for best times
   - ✅ Manual date picker (past dates disabled)
   - ✅ Time picker with 15-minute intervals
   - ✅ SAST (UTC+2) timezone display

#### Test Best Times
1. Click on any "Best Time" slot
2. Verify:
   - ✅ Date and time fields auto-populate
   - ✅ Date is set to tomorrow
   - ✅ Time matches the selected slot

#### Test Recurrence
1. Select different recurrence options (Daily, Weekly, Monthly)
2. For Weekly:
   - ✅ Day selection buttons appear
   - ✅ Toggle days on/off
   - ✅ Selected days highlighted

#### Test Scheduling
1. Fill in date and time
2. Click **"Schedule Post"**
3. Verify:
   - ✅ Confirmation alert appears
   - ✅ Modal closes
   - ✅ (In real app: post would appear in calendar)

### 4. Test Smart Suggestions Widget
The widget should be visible in the Schedule view sidebar.

#### Test Each Tab
1. **Best Times Tab**
   - ✅ 4 time slots with engagement percentages
   - ✅ Visual progress bars
   - ✅ Emoji indicators

2. **Best Practices Tab**
   - ✅ Platform-specific tips display
   - ✅ Checkmark icons
   - ✅ Readable advice

3. **Trending Hashtags Tab**
   - ✅ 5 hashtags with post counts
   - ✅ Trend indicators (up/down arrows)
   - ✅ Click interaction ready

4. **Content Type Tab**
   - ✅ 4 content formats with scores
   - ✅ Progress bars showing score
   - ✅ Reason explanations

5. **Tone Tab**
   - ✅ 4 time-based tone suggestions
   - ✅ Emoji indicators
   - ✅ Clear recommendations

### 5. Test Automation View
1. Click **"Automation"** in the sidebar navigation
2. Verify you see:
   - ✅ Header with active rules count
   - ✅ Quick stats (Posts Generated, 24/7 status, Active Automations)
   - ✅ "Create New Automation Rule" button
   - ✅ 3 pre-configured automation rules

#### Test Rule Cards
For each automation rule, verify:
1. ✅ Rule name and description display
2. ✅ Platform tags show (Instagram, Twitter, LinkedIn, Facebook)
3. ✅ Frequency information visible
4. ✅ Active/Inactive toggle switch works
5. ✅ Statistics show (Posts Generated, Last Run, Next Run)
6. ✅ Action buttons present (Run Now, Edit, Delete)

#### Test Rule Actions
1. **Toggle Active/Inactive**
   - Click toggle switch
   - ✅ Switch animates
   - ✅ Status badge updates
   
2. **Run Now**
   - Click "Run Now" button
   - ✅ Alert shows with rule name
   
3. **Edit**
   - Click "Edit" button
   - ✅ Execution history expands below
   - ✅ Shows last 5 runs
   - ✅ "Hide History" button appears
   
4. **Delete**
   - Click delete button (trash icon)
   - ✅ Confirmation alert appears
   - ✅ Rule removed on confirm

### 6. Test Automation Wizard
1. Click **"Create New Automation Rule"** button
2. Verify the modal opens with 4-step progress indicator

#### Step 1: Template Selection
1. Verify 4 template cards display:
   - ✅ Weekly Product Showcase
   - ✅ Daily Tips & Tricks
   - ✅ Monthly Recap
   - ✅ Custom Automation
2. Click a template to select
3. ✅ Border highlights selected template
4. ✅ Optional name input appears
5. Click **"Next"**

#### Step 2: Frequency Configuration
1. Verify frequency buttons (Daily, Weekly, Monthly)
2. Select **"Weekly"**
   - ✅ Day selector grid appears
   - ✅ Toggle days on/off
3. ✅ Time picker shows
4. ✅ Timezone displays (SAST - UTC+2)
5. ✅ Schedule preview shows at bottom
6. Click **"Next"**

#### Step 3: Content Settings
1. ✅ Topic/Theme input field
2. ✅ Tone selection buttons (5 options)
3. ✅ Platform checkboxes (4 platforms)
4. Fill in fields and click **"Next"**

#### Step 4: Review & Activate
1. Verify all settings display:
   - ✅ Rule name
   - ✅ Template
   - ✅ Frequency
   - ✅ Days (if weekly)
   - ✅ Time and timezone
   - ✅ Tone
   - ✅ Topic
   - ✅ Selected platforms
2. ✅ Green success message at bottom
3. Click **"Activate Rule"**
4. ✅ Confirmation alert appears
5. ✅ Modal closes

#### Test Navigation
1. ✅ "Back" button works on steps 2-4
2. ✅ Progress indicator updates
3. ✅ Step labels show current position
4. ✅ "Next" button disabled until required fields filled

### 7. Test Content Generator Integration
1. Navigate back to **"Dashboard"** tab
2. (Note: Content generator placeholder shown)
3. In a full implementation:
   - Generate a post
   - Click "Schedule Post" button on output
   - ✅ Schedule modal opens with post content pre-filled

### 8. Responsive Design Testing

#### Desktop (1920x1080)
- ✅ All components display full width
- ✅ Sidebar visible and fixed
- ✅ Calendar shows all days clearly
- ✅ Smart Suggestions sidebar visible

#### Tablet (768x1024)
- ✅ Layout adjusts appropriately
- ✅ Calendar remains functional
- ✅ Modals responsive
- ✅ Smart Suggestions may move below on smaller tablets

#### Mobile (375x667)
- ✅ Sidebar collapses (hamburger menu)
- ✅ Calendar grid adjusts
- ✅ View toggles stack or scroll horizontally
- ✅ Modals full-screen
- ✅ Smart Suggestions stacks below

## Known Limitations (Mock Implementation)

These are expected in a Phase 5 demo/mock:

1. **No Data Persistence**: Refreshing the page resets all data
2. **Mock Scheduling**: Posts aren't actually scheduled to publish
3. **Static Data**: Pre-configured posts and rules don't update dynamically
4. **No Backend**: All data is in-memory mock data
5. **Limited Real-Time**: Stats don't update in real-time across tabs
6. **No Actual API Calls**: All automation is simulated

## Performance Expectations

- ✅ Modal animations should be smooth
- ✅ View switching should be instant
- ✅ Calendar navigation responsive
- ✅ No lag when toggling filters
- ✅ Hover tooltips appear immediately

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Internet Explorer not supported

## Common Issues & Solutions

### Issue: Dev server not starting
**Solution**: 
```bash
npm install
npm run dev
```

### Issue: Modals don't open
**Solution**: Check browser console for errors, refresh page

### Issue: Styles look broken
**Solution**: Ensure Tailwind CSS is compiling correctly

### Issue: Components not rendering
**Solution**: Verify all imports are correct, check for TypeScript errors

## Success Criteria

Phase 5 is successfully implemented if:

- ✅ All 3 view modes work (Calendar, List, Timeline)
- ✅ Schedule Post Modal opens and functions
- ✅ Smart Suggestions widget displays all tabs
- ✅ Automation View shows all 3 pre-configured rules
- ✅ Automation Wizard completes all 4 steps
- ✅ Navigation between Dashboard/Schedule/Automation works
- ✅ All interactive elements respond to clicks
- ✅ No console errors during normal usage
- ✅ Mobile view is functional (if tested)

## Next Steps After Testing

If all tests pass:
1. ✅ Mark Phase 5 as complete
2. Move to Phase 6: Integration & Polish
3. Consider:
   - Adding real backend integration
   - Implementing actual scheduling logic
   - Adding more animations and transitions
   - Performance optimization
   - Accessibility improvements
   - Unit and integration tests

---

**Happy Testing! 🎉**

For issues or questions, refer to:
- `PHASE_5_COMPLETION.md` - Implementation details
- `specs/ui-completion-and-features/implementation-plan.md` - Full plan
