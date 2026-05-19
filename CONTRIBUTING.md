# Contributing to Ourae

Thank you for contributing to Ourae! This guide explains our workflow, standards, and best practices.

---

## Code of Conduct

- Be respectful and collaborative
- Focus on the problem, not the person
- Give constructive feedback
- Keep discussions professional
- Remember: we're building a tool to help people with emotional wellness

---

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- A code editor (VS Code recommended)

### Local Setup

```bash
git clone https://github.com/MaksatBairamov/ourae.git
cd ourae
npm install
npx expo start
```

For a clean cache:

```bash
npx expo start -c
```

To open on iOS/Android:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for web preview

### TypeScript Check

```bash
npx tsc --noEmit
```

---

## Issue Workflow

### Types of Issues

- **Bug** — Something is broken
- **Enhancement** — Add or improve a feature
- **Documentation** — Improve docs or guides
- **Security** — Security vulnerability or improvement
- **Design** — UI/UX polish or new design

### Before You Start

1. Check if the issue already exists
2. Read the issue description and acceptance criteria carefully
3. Ask questions in the issue comments if unclear
4. Request assignment from Maksat Bairamov

### During Development

- Create a feature branch: `git checkout -b feature/issue-number-short-description`
- Commit often with clear messages: `git commit -m "feat: add weekly reflection screen"`
- Push to your branch: `git push origin feature/...`
- Test locally on device before submitting PR

---

## Pull Request Process

### Before Submitting

- [ ] TypeScript check passes: `npx tsc --noEmit`
- [ ] No console errors
- [ ] Feature works on device
- [ ] Responsive layout (test small and large screens)
- [ ] Code is clean (no dead code, meaningful names)
- [ ] Tests pass (if applicable)

### Submitting Your PR

1. Push your feature branch to GitHub
2. Open a Pull Request with:
   - **Title:** Clear, descriptive title
   - **Description:** Explain what you changed and why
   - **Screenshots/GIFs:** If UI changes, include visual proof
   - **Issue Link:** Link to the issue with `Closes #123`

### PR Description Template

```markdown
## What changed
Brief description of the feature or fix.

## Why
Why is this change needed?

## Testing
How did you test this?

## Screenshots
(If applicable)

## Related Issues
Closes #123
```

### Review Process

- Maksat Bairamov or team members will review
- Address feedback and push updates
- Once approved, your PR will be merged
- Celebrate! 🎉

---

## Code Standards

### TypeScript

- Use strict mode
- Avoid `any` without justification
- Use meaningful type names
- Export types for component props

```typescript
// Good
interface CheckInData {
  mood: string;
  energy: number;
  anxiety: number;
}

// Avoid
interface Data {
  m: any;
  e: any;
}
```

### React Native & Components

- Use functional components with hooks
- Keep components small and focused
- Use descriptive component names
- Extract shared logic to utilities

```typescript
// Good
export const EmotionCard: React.FC<{ mood: string }> = ({ mood }) => (
  <View>
    <Text>{mood}</Text>
  </View>
);

// Avoid
const C: React.FC<any> = (props) => <View><Text>{props.m}</Text></View>;
```

### Styling

- Use Flexbox for layouts
- Maintain consistent spacing and colors
- Keep UI calm and minimal
- Test on small and large screens

### Security

- Never commit API keys
- Use `.env` for local secrets (add to `.gitignore`)
- Verify secrets are not in frontend build
- Use server-side endpoints for sensitive API calls

### UI/UX

- Keep language supportive and non-diagnostic
- Test empty states and error cases
- Include loading states
- Provide clear visual feedback
- Follow the existing design language

---

## Testing

### Local Testing Checklist

Before submitting a PR, test:

1. **Feature Works** — Does it do what the issue asks?
2. **TypeScript** — `npx tsc --noEmit` passes
3. **Console Errors** — No errors or warnings
4. **Responsive** — Works on small (iPhone SE) and large (iPad) screens
5. **Empty States** — What happens with no data?
6. **Error Handling** — What happens if network fails?
7. **Performance** — Does it feel fast?

### Manual Test Scenarios

For check-in feature:
- [ ] User can complete a check-in
- [ ] Mood/energy/anxiety values are saved
- [ ] Optional notes are saved
- [ ] Empty notes are handled
- [ ] Navigation after check-in works

For AI reflection:
- [ ] AI response displays correctly
- [ ] Fallback response shows if API fails
- [ ] Safety checks work (panic mode triggered if needed)
- [ ] Loading state displays

---

## Commit Message Format

Use clear, concise commit messages:

```
feat: add weekly emotion summary screen
fix: prevent stale state updates on unmount
docs: improve API documentation
style: adjust panic screen spacing
refactor: extract shared utility functions
```

---

## Deployment

### Staging (Vercel Preview)

- Automatic on every PR
- Preview link in PR comments
- Test on device before merging

### Production (Main)

- Only merged PRs are deployed to main
- Requires Maksat Bairamov approval
- Tagged releases on GitHub Releases

---

## Common Scenarios

### "How do I test on my device?"

```bash
npm install
npx expo start
# Scan QR code with Expo app on your phone
# Or use Expo Go app from App Store/Play Store
```

### "How do I debug?"

- Use React Native Debugger
- Add `console.log()` for quick debugging
- Use VS Code debugger for breakpoints
- Check Expo app output for errors

### "TypeScript error I don't understand?"

1. Read the full error message carefully
2. Google the error type
3. Check TypeScript documentation
4. Ask in the PR or issue comments

### "How do I update dependencies?"

```bash
npm outdated  # Check for updates
npm update    # Update patch versions
npm install package@latest  # Update specific package
```

Always test after updating dependencies.

---

## Questions?

- **GitHub Issues** for bugs/features
- **GitHub Discussions** for ideas
- **Maksat Bairamov** for architecture questions
- **Team channels** for quick questions

---

## Thank You

Every contribution helps make Ourae better for users. We appreciate your effort and dedication! 💙

