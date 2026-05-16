# PeerLearn Branding Guide

## Logo & Identity

### Overview
PeerLearn's logo represents the core mission: **peer-to-peer academic learning through video content**.

### Logo Design Elements

The logo incorporates:
- **Two overlapping circles** - Representing two peers/students learning together
- **Center play button** - Symbolizing video content delivery
- **Book pages** - Representing academic knowledge
- **Gradient background** - Indigo to Blue gradient (#6366f1 to #3b82f6) conveying learning, trust, and technology

### Color Palette

```
Primary Gradient:
- Indigo: #6366f1 (rgb(99, 102, 241))
- Blue: #3b82f6 (rgb(59, 130, 246))

Accent (White):
- #FFFFFF (for logo elements on colored backgrounds)
```

### Logo Files

1. **Favicon** - `frontend/public/favicon.svg`
   - Used as the browser tab icon
   - Size: 200x200px viewBox
   - Used in Navbar as 32x32px

2. **Full Logo** - `frontend/public/peerlearn-logo.svg`
   - Horizontal layout with text
   - Size: 300x80px viewBox
   - For future use in marketing materials

### Implementation

#### In HTML (`frontend/index.html`)
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<title>PeerLearn - Peer-to-Peer Academic Learning</title>
```

#### In Navbar (`frontend/src/components/Navbar.jsx`)
```jsx
<img src="/favicon.svg" alt="PeerLearn" className="h-8 w-8" />
<span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
  PeerLearn
</span>
```

---

## Browser Tab

**Title:** `PeerLearn - Peer-to-Peer Academic Learning`

This appears in:
- Browser tab
- Browser history
- Search engine results
- Bookmarks

---

## Design Rationale

### Why These Elements?

1. **Two Circles** - Emphasizes collaboration and peer-learning
2. **Play Button** - Instantly communicates video learning platform
3. **Book Pages** - Academic credibility and knowledge base
4. **Gradient Colors** - Modern, trustworthy, tech-forward feel
5. **White Strokes** - High contrast for visibility at small sizes

### Accessibility

- High contrast ratio (white on gradient)
- Scalable SVG format (works at any size)
- Clear, recognizable at small sizes (favicon)
- No text required in icon-only form

---

## Usage Guidelines

### Do's ✅
- Use the logo on brand-colored backgrounds
- Maintain the gradient colors as designed
- Ensure adequate white space around the logo
- Use SVG format for best quality

### Don'ts ❌
- Don't change the gradient colors
- Don't distort the logo (maintain aspect ratio)
- Don't place on busy backgrounds where contrast is lost
- Don't use non-SVG versions (use SVG for crisp rendering)

---

## Future Updates

If you need to update the logo:

1. Edit `/frontend/public/favicon.svg` for the icon
2. Edit `/frontend/public/peerlearn-logo.svg` for the full logo with text
3. Update the Navbar import if changing dimensions
4. Test in browser tabs and various screen sizes

---

## Summary

Your PeerLearn brand now has:
✅ Professional SVG logo with gradient
✅ Browser favicon (32x32px in navbar)
✅ Full logo with text for marketing
✅ Browser tab title updated
✅ Cohesive visual identity

The branding effectively communicates:
- Peer-to-peer collaboration
- Video learning platform
- Academic credibility
- Modern, trustworthy technology
