# Development Notes

## Overview

This file contains internal development guidelines and decision logs for the Ourae team.

---

## Product Direction

### Core Principles

1. **Calm & Minimal** — Keep the UI clean, uncluttered, emotionally safe
2. **Mobile-First** — Design for phones; scale up responsibly
3. **Privacy-First** — Data stays local; no unnecessary external storage
4. **Responsible AI** — Supportive reflections, never diagnostic claims
5. **No Over-Engineering** — Build features that solve real problems

### What We Avoid

- Medical or diagnostic language
- Unnecessary complexity
- Exposing secrets in frontend code
- Large external dependencies without clear need

---

## Architecture Notes

### Server-Side AI Requests

**Reason:** Prevent API key exposure in Expo bundles.

**Implementation:**
- OpenRouter API key stored only in Vercel environment variables
- Frontend calls `/api/reflect` on Vercel backend
- Backend validates request and calls OpenRouter API
- Response sent back to frontend

**Security Checklist:**
- ✅ No `EXPO_PUBLIC_OPENROUTER_API_KEY`
- ✅ No API key in `.env.local`
- ✅ No API key in frontend source code
- ✅ Vercel environment variables used for production

### Local Storage

**Reason:** User data privacy and offline support.

**Implementation:**
- Mobile: SQLite (React Native)
- Web: AsyncStorage (fallback)
- All data stored locally; synced only when user permits

**Future Consideration:**
- User can opt-in to cloud backup (not MVP)
- If implemented, use end-to-end encryption

### Async Cleanup

**Reason:** Prevent stale state updates and memory leaks.

**Pattern:**
```typescript
useEffect(() => {
  const controller = new AbortController();
  
  const fetchData = async () => {
    try {
      const res = await fetch(url, { signal: controller.signal });
      setState(await res.json());
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Cleanup on unmount, not an error
      } else {
        // Handle real errors
      }
    }
  };
  
  fetchData();
  
  return () => controller.abort();
}, []);
```

---

## Emotional Safety

### Crisis Detection

- Hardcoded keywords are a **fallback only**
- Planned improvement: lightweight intent classification
- Always err on the side of caution
- Default response: suggest grounding or emergency support

### Supportive Language

Examples of supportive vs. diagnostic:

**Good:** "It sounds like you're feeling overwhelmed. Let's try a breathing exercise."

**Bad:** "You appear to have symptoms of anxiety disorder."

### Fallback Responses

All AI requests must have safe fallbacks:

```typescript
if (!reflection || !reflection.text) {
  return {
    text: "Take a moment to breathe. You're doing your best.",
    nextStep: "Try a grounding exercise"
  };
}
```

---

## Testing Strategy

### Unit Tests (Future)

Target high-risk logic:
- Crisis detection
- Trend calculations
- Async error handling

### Manual Testing Before PR

1. Run on physical device or emulator
2. Test all screens in the feature
3. Test empty states and error cases
4. Check responsive design (small/large screens)
5. Run TypeScript check: `npx tsc --noEmit`
6. Check browser console for errors

---

## Common Issues & Solutions

### Issue: TypeScript strict mode errors

**Solution:** Enable strict mode in `tsconfig.json` and fix type issues. No `any` without justification.

### Issue: Async warnings on unmount

**Solution:** Add AbortController cleanup to useEffect. Check other screens for similar patterns.

### Issue: UI looks different on small screens

**Solution:** Test on small device (iPhone SE). Review Flexbox layout and padding. Use responsive units where needed.

### Issue: API key exposed in build

**Solution:** Remove from `EXPO_PUBLIC_*`. Move to Vercel environment variables. Verify production build doesn't include secrets.

---

## Release Checklist

Before marking an issue as "Done":

- [ ] Feature works correctly (meets acceptance criteria)
- [ ] TypeScript: `npx tsc --noEmit` passes
- [ ] No console errors
- [ ] Responsive on small and large screens
- [ ] Code is clean and readable
- [ ] Tested locally before PR
- [ ] PR has short description
- [ ] Approved by Maksat Bairamov
- [ ] Merged to main

---

## Performance Considerations

- Avoid unnecessary re-renders (useMemo, useCallback for complex components)
- Lazy load screens if possible
- Minimize bundle size (important for mobile)
- Cache check-in data locally to reduce DB queries

---

## Future Improvements (Post-MVP)

- Voice journaling
- Weekly email summaries
- Wearable integrations
- Multi-language support
- Streaks and gamification
- Trusted contact support flow
- Push notifications for check-in reminders
- Personalized wellness routines

---

## Resources

- [React Native Documentation](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [OpenRouter API](https://openrouter.ai/docs)

---

## Questions?

Contact the team via:
- GitHub Issues for features/bugs
- GitHub Discussions for ideas
- Maksat Bairamov for architecture/priorities
