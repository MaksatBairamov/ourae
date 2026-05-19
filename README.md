# Ourae

Ourae is an AI-powered emotional wellness companion built with React Native and Expo.

It helps users make short emotional check-ins, reflect on their current state, receive supportive AI-generated insights, and use grounding tools during moments of stress or emotional overwhelm.

---

## Overview

Many people experience stress, anxiety, burnout, or emotional overload but do not always have access to private and supportive tools for self-reflection.

Ourae provides a calm mobile-first space for emotional awareness and regulation.

The app focuses on three simple questions:

- What am I feeling?
- How is my energy?
- How anxious do I feel?

The goal is not diagnosis or therapy.  
The goal is clarity, reflection, and emotional regulation support.

---

## Core Features

- Quick emotional check-in with mood, energy, anxiety, and optional notes
- AI-generated emotional reflections using OpenRouter
- Emotion summary screen with personalized next steps
- Responsible AI safety layer for emotionally sensitive input
- Guided panic support mode with breathing, grounding, and emergency contacts
- History screen for reviewing recent check-ins
- Emotion analytics with average energy, average anxiety, most frequent mood, and trend labels
- Local-first data handling with SQLite on mobile
- Web fallback storage with AsyncStorage
- Clean, calm, mobile-first UI
- TypeScript-based modular architecture
- Server-side AI requests to avoid exposing API keys in the frontend bundle

---

## Tech Stack

- React Native
- Expo
- Expo Router
- TypeScript
- SQLite
- AsyncStorage
- OpenRouter API
- Vercel

---

## Live Demo

https://ourae.vercel.app

---

## How It Works

1. The user completes a short emotional check-in.
2. The app stores the check-in locally.
3. The app generates a supportive AI reflection.
4. Safety logic checks whether grounding or crisis support may be more appropriate.
5. The user receives a summary, emotional insight, and a small next step.
6. Past check-ins can be reviewed in the history screen with simple analytics.

---

## Privacy & Safety

Ourae is designed with a privacy-first approach.

- Check-in data is stored locally on the user's device.
- No external database is used in this MVP.
- AI responses are supportive reflections, not medical advice.
- Sensitive emotional signals can trigger safety-oriented support flows.
- Crisis-related input is redirected toward real-world support and emergency contacts.
- The app avoids diagnostic language and does not replace professional care.

> Ourae is a reflection and emotional support tool, not a diagnosis or therapy service.

---

## Responsible AI Approach

Ourae uses AI carefully and intentionally.

The AI layer is designed to:

- Generate short, supportive reflections
- Avoid medical or diagnostic claims
- Suggest gentle next steps
- Use fallback responses if the AI request fails
- Prioritize grounding and safety in high-risk situations

---

## Project Scope

Current MVP scope:

- Mobile-first emotional check-in flow
- AI reflection screen
- Local storage
- History and pattern overview
- Panic support mode
- Safety guardrails

Potential future features:

- Voice journaling
- Weekly emotional summaries
- Wearable integrations
- Multi-language support
- Personalized wellness routines
- Gamification and streaks
- Trusted contact support flow

---

## Running Locally

```bash
npm install
npx expo start
```

For a clean Expo cache:

```bash
npx expo start -c
```

TypeScript check:

```bash
npx tsc --noEmit
```

---

## Environment Variables

Create a `.env` file in the project root for local server-side development:

```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

For production, add the same variables in Vercel:

```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

Do not use `EXPO_PUBLIC_` for secret API keys.  
Secrets must stay server-side and should never be exposed in the frontend bundle.

## Do not commit `.env` to GitHub.

---

## Team Structure and Responsibilities

| Role | Owner | Responsibilities |
|------|-------|------------------|
| **Product Owner / Lead Frontend** | Maksat Bairamov | Roadmap, priorities, UI consistency, feature approval, merge approval, architecture direction |
| **Feature Developer** | Nizami | Feature implementation, smaller screens, helper logic, bug fixes |
| **Frontend / UI Support** | Vitalii | Reusable components, styling, responsiveness, animations, UX polish |
| **Backend / Logic / Testing** | Mykhailo | API routes, security improvements, testing, async handling, AI logic improvements |

---

## Development Workflow

### GitHub Project Board

Issues are tracked in the GitHub Project board with the following workflow:

- **Backlog** — New issues, not yet prioritized
- **Todo** — Prioritized, ready to start
- **In Progress** — Currently being worked on
- **Review** — Submitted for review, awaiting approval
- **Done** — Completed and merged

### Definition of Done

Before marking an issue as complete, ensure:

- ✅ Feature works correctly and meets acceptance criteria
- ✅ No TypeScript errors (`npx tsc --noEmit`)
- ✅ No console errors or warnings
- ✅ Responsive UI on mobile and tablet sizes
- ✅ Clean code structure (no dead code, meaningful variable names)
- ✅ Tested locally before submitting PR
- ✅ Short, descriptive PR description included

### Code Quality Standards

- All screens must maintain the calm, minimal aesthetic
- All user-facing text must be emotionally supportive and non-diagnostic
- All AI interactions must include safety fallbacks
- All async operations must clean up properly on unmount
- All new features must pass TypeScript strict mode

---

## Roadmap & Milestones

### Milestone 1: MVP Stabilization
Focus on security, core stability, and responsive design.
- Move AI requests fully server-side
- Improve async cleanup handling
- Improve responsive mobile layouts
- Refactor shared utilities
- Improve project structure

### Milestone 2: UX & AI Improvements
Focus on polish, emotional analytics, and AI reliability.
- Improve crisis intent detection
- Improve AI reflection reliability
- Create weekly emotional reflection system
- Improve emotional trend calculations
- Polish summary screen UX
- Improve panic support experience

### Milestone 3: Final Demo
Focus on documentation and presentation.
- Improve project documentation
- Prepare final presentation and demo flow

---

## Author

Maksat Bairamov  
Junior Software Developer  
Powercoders Switzerland CH26-1

Portfolio: https://maksatbairamov.ch

GitHub: https://github.com/MaksatBairamov
