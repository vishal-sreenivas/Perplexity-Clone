# 🧪 Testing & Verification Guide

## ✅ Complete Feature Checklist

Use this guide to verify all features are working correctly.

---

## 📍 Landing Page Tests (/)

### Visual Verification
- [ ] Page loads without errors
- [ ] Hero section displays centered
- [ ] Headline: "Where knowledge begins"
- [ ] Subtext is visible and centered
- [ ] Search bar has gradient glow effect
- [ ] Search icon appears on the left
- [ ] "Search" button appears on the right
- [ ] Three example questions are displayed
- [ ] Background has subtle gradient

### Functionality Tests
- [ ] Type in search bar - input appears
- [ ] Click "Search" with empty input - button is disabled
- [ ] Type a question and click "Search" - navigates to /chat?question=...
- [ ] Press Enter key - same as clicking "Search"
- [ ] Click an example question - populates the search bar
- [ ] Resize window - layout remains responsive

### URL Test
```
Visit: http://localhost:3000
Expected: Landing page with search interface
```

---

## 💬 Chat Page Tests (/chat)

### Initial Load
- [ ] Page loads without errors
- [ ] "New Chat" button appears (top left)
- [ ] "Perplexity AI" title appears (center)
- [ ] Empty state message: "What would you like to know?"
- [ ] Input bar is sticky at the bottom
- [ ] Input bar has rounded corners
- [ ] Send button (paper plane icon) appears

### URL Parameter Test
```
Visit: http://localhost:3000/chat?question=What is AI?
Expected: Automatically sends "What is AI?" and shows streaming response
```

- [ ] Question is auto-submitted
- [ ] User message appears (right-aligned, blue)
- [ ] Assistant message appears (left-aligned, gray)
- [ ] Streaming starts automatically

---

## 🌊 Streaming Feature Tests

### Plan Steps
- [ ] Plan section appears with "PLAN" header
- [ ] Steps appear one by one
- [ ] Active step has blue color + spinner icon
- [ ] Completed steps have green checkmark
- [ ] Steps have smooth slide-in animation
- [ ] Text updates in real-time

### Sources
- [ ] Sources section appears with "SOURCES" header
- [ ] Source badges appear one by one
- [ ] Crawling status: blue background + spinner
- [ ] Success status: green background + checkmark
- [ ] Error status: red background + X icon
- [ ] Source title or domain is displayed
- [ ] External link icon appears
- [ ] Click source - opens in new tab
- [ ] Sources have fade-in animation

### Answer
- [ ] Answer appears word by word
- [ ] Markdown formatting works:
  - [ ] **Bold text**
  - [ ] *Italic text*
  - [ ] Links are clickable
  - [ ] Lists are formatted
  - [ ] Code blocks are styled
  - [ ] Headings are styled
- [ ] Citations [1], [2] appear as superscript
- [ ] Citations are blue and clickable
- [ ] Typing indicator dots appear during streaming
- [ ] Typing indicator disappears when done
- [ ] Answer has fade-in animation

---

## 🔄 Multi-turn Conversation Tests

### Follow-up Questions
1. Ask first question: "What is quantum computing?"
   - [ ] Response streams correctly
   - [ ] Auto-scrolls to bottom

2. Ask follow-up: "How does it differ from classical computing?"
   - [ ] Previous message remains visible
   - [ ] New user message appears
   - [ ] New assistant response streams
   - [ ] Auto-scrolls to new message

3. Ask 3-5 more questions
   - [ ] All messages remain in view
   - [ ] Scroll area works properly
   - [ ] Each response streams independently
   - [ ] No memory leaks or slowdowns

### New Chat Test
- [ ] Click "New Chat" button
- [ ] All messages are cleared
- [ ] Input is cleared
- [ ] URL changes to /chat (no query params)
- [ ] Can start a fresh conversation

---

## 🎨 UI/UX Tests

### Animations
- [ ] Messages fade in smoothly
- [ ] Plan steps slide in from left
- [ ] Sources fade in with delay
- [ ] Page transitions are smooth
- [ ] No jarring layout shifts

### Responsiveness
Test at these viewport sizes:

#### Mobile (375px)
- [ ] Search bar fits on screen
- [ ] Messages are readable
- [ ] Input bar doesn't overlap content
- [ ] Buttons are clickable

#### Tablet (768px)
- [ ] Layout adapts properly
- [ ] Message widths are appropriate
- [ ] No horizontal scroll

#### Desktop (1920px)
- [ ] Content is centered
- [ ] Max-width containers work
- [ ] Plenty of whitespace

### Loading States
- [ ] Skeleton loaders appear before content
- [ ] Input is disabled during streaming
- [ ] Send button shows spinner during request
- [ ] "New Chat" button remains enabled

---

## 🔧 Edge Cases & Error Handling

### API Errors
1. Disconnect from internet or block the API
   - [ ] Error message appears
   - [ ] UI doesn't crash
   - [ ] Can try again

### Empty Input
- [ ] Can't submit empty message
- [ ] Button is disabled
- [ ] No error thrown

### Very Long Messages
1. Type 500+ characters
   - [ ] Input accepts all text
   - [ ] Message displays correctly
   - [ ] Layout doesn't break

### Rapid Submissions
1. Ask multiple questions quickly
   - [ ] Each gets its own message pair
   - [ ] Streaming doesn't interfere
   - [ ] State remains consistent

### Special Characters
Try these questions:
- "What is <script>alert('test')</script>?"
- "Explain `code` and **markdown**"
- "What about [links](https://example.com)?"

Expected:
- [ ] Special characters are escaped
- [ ] No XSS vulnerabilities
- [ ] Markdown renders safely

---

## 🚀 Performance Tests

### Speed
- [ ] Landing page loads in < 2 seconds
- [ ] Chat page loads in < 2 seconds
- [ ] Streaming starts within 1 second
- [ ] Auto-scroll is smooth (no lag)

### Memory
1. Have 10+ message exchanges
   - [ ] Page remains responsive
   - [ ] No significant memory increase
   - [ ] Scroll remains smooth

### Network
Check Network tab in DevTools:
- [ ] API request is sent
- [ ] Response is streamed (not blocked)
- [ ] No unnecessary requests
- [ ] Assets are cached

---

## 🎯 Accessibility Tests

### Keyboard Navigation
- [ ] Tab through landing page elements
- [ ] Can submit with Enter key
- [ ] Can focus input in chat
- [ ] Can tab to "New Chat" button

### Screen Reader (Optional)
- [ ] Headers are announced
- [ ] Messages are announced
- [ ] Buttons have labels

---

## 📱 Cross-Browser Tests

Test in these browsers:

### Chrome/Edge
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] Streaming works
- [ ] Layout correct

### Safari (if available)
- [ ] All features work
- [ ] Fetch API works
- [ ] Animations work

---

## 🧪 Sample Test Scenarios

### Scenario 1: New User Flow
1. Visit http://localhost:3000
2. Read hero text
3. Click example question "What is quantum computing?"
4. Watch streaming response
5. Ask follow-up: "Give me an example"
6. Click "New Chat"
7. Start new conversation

**Expected**: Smooth, bug-free experience

### Scenario 2: Power User
1. Visit http://localhost:3000/chat?question=Explain AI
2. Wait for response
3. Immediately ask 5 more questions rapidly
4. Scroll up to first message
5. Scroll down to latest
6. Click "New Chat"

**Expected**: No lag, crashes, or errors

### Scenario 3: Mobile User
1. Open in mobile viewport (375px)
2. Type question on touch keyboard
3. Watch streaming on small screen
4. Scroll through messages
5. Tap "New Chat"

**Expected**: Fully functional on mobile

---

## ✅ Final Verification Checklist

### Code Quality
- [ ] No TypeScript errors (check Problems panel)
- [ ] No console errors in browser
- [ ] No console warnings
- [ ] Clean terminal output

### Features
- [ ] Landing page works ✓
- [ ] Chat page works ✓
- [ ] Streaming works ✓
- [ ] Multi-turn works ✓
- [ ] New Chat works ✓
- [ ] Animations work ✓
- [ ] Responsive works ✓

### Production Ready
- [ ] Can build successfully: `.\build.ps1`
- [ ] Production server runs: `.\start-prod.ps1`
- [ ] No build warnings
- [ ] Bundle size is reasonable

---

## 🎉 Success Criteria

If all checkboxes above are marked, your application is:

✅ **Production Ready**  
✅ **Fully Functional**  
✅ **Bug Free**  
✅ **Performant**  
✅ **Accessible**  

---

## 📊 Metrics to Track

### Performance Metrics
- **Time to First Byte**: < 500ms
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90

### User Experience Metrics
- **Streaming Delay**: < 1s
- **Auto-scroll Lag**: < 100ms
- **Animation Frame Rate**: 60fps
- **Memory Usage**: < 100MB

---

## 🐛 Bug Report Template

If you find issues, use this template:

```markdown
**Bug Description**:
[Clear description]

**Steps to Reproduce**:
1. Go to...
2. Click on...
3. See error...

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Environment**:
- Browser: [e.g., Chrome 120]
- Screen Size: [e.g., 1920x1080]
- OS: [e.g., Windows 11]

**Console Errors**:
[Paste any errors]

**Screenshots**:
[If applicable]
```

---

**Happy Testing!** 🧪✨
