# Ourae Issue Labels and Workflow

This document defines the standard labels and workflow for organizing issues in the Ourae repository.

---

## Labels

### By Category

**ai**
- Issues related to AI/LLM features, reflections, and logic

**security**
- Issues related to security, API key management, encryption

**frontend**
- React Native UI/UX, screens, components, styling

**backend**
- Server-side logic, API routes, Vercel functions

**design**
- Visual design, UX improvements, design systems

**analytics**
- Emotion tracking, trend analysis, data insights

**documentation**
- README, CONTRIBUTING, guides, API docs

### By Type

**bug**
- Something is broken or not working as expected

**enhancement**
- New feature or improvement to existing feature

**priority: high**
- Critical for MVP or demo; blocks other work

**priority: medium**
- Important; should be done soon

**priority: low**
- Nice-to-have; can be deferred

**good first issue**
- Good starting point for new contributors

---

## Workflow Columns (GitHub Project Board)

### 1. **Backlog**
- New issues, not yet prioritized
- No milestone assigned yet
- Awaiting team discussion

### 2. **Todo**
- Ready to start
- Has milestone and priority
- Clear acceptance criteria
- Awaiting assignment or pickup

### 3. **In Progress**
- Currently being worked on
- Assigned to a team member
- Branch created and PR open (if applicable)

### 4. **Review**
- PR submitted for review
- Code review in progress
- Awaiting approval or feedback

### 5. **Done**
- Completed and merged to main
- All acceptance criteria met
- PR approved by Maksat Bairamov

---

## Milestones

### MVP Stabilization
**Goal:** Core stability, security, responsive design

Issues:
- Move AI requests fully server-side
- Improve async request cleanup handling
- Improve responsive mobile layouts
- Refactor shared emotional insight utilities
- Improve project structure and modularization

### UX & AI Improvements
**Goal:** Polish features, improve analytics, enhance AI safety

Issues:
- Improve crisis intent detection system
- Improve AI reflection reliability and fallback handling
- Create weekly emotional reflection system
- Improve emotional trend calculations
- Improve summary screen UX and transitions
- Improve panic support breathing experience

### Final Demo
**Goal:** Documentation, presentation, demo readiness

Issues:
- Improve project documentation and architecture explanation
- Prepare final presentation and demo flow

---

## Issue Checklist

When creating an issue, ensure:

- [ ] **Title** is clear and specific
- [ ] **Milestone** is assigned
- [ ] **Labels** are added (at least category + type + priority)
- [ ] **Description** includes goal, background, tasks, acceptance criteria
- [ ] **Acceptance Criteria** are measurable and testable
- [ ] **Related Issues** are linked if applicable

---

## Definition of Done

An issue is complete when:

- ✅ Feature works correctly and meets all acceptance criteria
- ✅ TypeScript: `npx tsc --noEmit` passes
- ✅ No console errors or warnings
- ✅ Responsive UI on small and large screens
- ✅ Clean code structure (no dead code, meaningful names)
- ✅ Tested locally on device before PR
- ✅ PR has short, descriptive description
- ✅ Approved by Maksat Bairamov
- ✅ Merged to main

---

## Team Responsibilities

| Role | Labels They Own | Responsibilities |
|------|-----------------|------------------|
| **Maksat** (Product Owner) | All | Roadmap, priorities, approvals, architecture |
| **Nizami** (Feature Developer) | frontend, backend, enhancement | Feature implementation, bug fixes |
| **Vitalii** (UI/UX) | frontend, design | Components, styling, animations, UX |
| **Mykhailo** (Backend/Logic) | backend, ai, security | API routes, security, async handling, testing |

---

## Quick Reference

**New Feature?**
- Labels: `enhancement`, relevant category (frontend/backend/ai/analytics)
- Priority: high/medium/low (ask Maksat)
- Milestone: Which sprint?

**Bug Found?**
- Labels: `bug`, relevant category
- Priority: high if blocks demo, medium otherwise
- Milestone: MVP Stabilization (urgent) or next sprint

**Docs Improvement?**
- Labels: `documentation`
- Priority: low/medium
- Milestone: Usually Final Demo

**Good First Issue?**
- Labels: `good first issue`, relevant category
- Priority: medium/low
- New contributors can pick these up

---

## Reference Links

- [GitHub Issues](https://github.com/MaksatBairamov/ourae/issues)
- [GitHub Project](https://github.com/MaksatBairamov/ourae/projects)
- [Contributing Guide](./CONTRIBUTING.md)
- [Development Notes](./DEVELOPMENT.md)
