# Ourae

A lightweight emotional check-in app designed to help users understand their current state without complexity or pressure.

---

## Overview

Ourae provides a simple and calm space for self-reflection.

Instead of long journaling or clinical tracking, the app focuses on quick emotional awareness:
- What do I feel?
- How is my energy?
- How anxious am I?

The goal is not diagnosis, but clarity.

---

## Features

- Quick emotional check-in (mood, energy, anxiety)
- Optional short notes
- AI-generated reflections (non-diagnostic)
- Panic support mode (breathing + grounding)
- History view to observe patterns
- Privacy-first approach (data stored locally)

---

## Tech Stack

- React Native (Expo)
- TypeScript
- SQLite (mobile)
- AsyncStorage (web fallback)
- OpenRouter API (AI layer)
- Vercel (web deployment)

---

## Live Demo

https://ourae.vercel.app

---

## How It Works

1. User completes a short check-in
2. The app processes the input
3. A short AI reflection is generated
4. Data is stored locally on the device
5. Users can review past entries in the history screen

---

## Privacy & Safety

- All check-in data is stored locally on the user's device
- No external database is used in this MVP
- AI responses are supportive reflections, not medical advice

> Ourae is a reflection tool, not a diagnosis.

---

## Running Locally

```bash
npm install
npx expo start
