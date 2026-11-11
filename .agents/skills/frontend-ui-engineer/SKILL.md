---
name: frontend-ui-engineer
description: Advanced frontend engineering and UI/UX skill for the YASRAF Textiles React website. Use for UI changes, components, responsive layouts, animations, visual improvements, and frontend bug fixes.
---

# Frontend UI Engineering Skill — YASRAF Textiles

This skill guides the AI coding agent whenever working on frontend, UI/UX, animations, responsiveness, interactive components, or visual design for YASRAF Textiles.

---

## FAST EDIT PROTOCOL (HIGH PRIORITY)

### 1. Task Classification

- **SMALL TASK**:
  Text, colors, spacing, buttons, hover effects, icons, minor CSS and single-component changes.
  &rarr; **Immediately use FAST EDIT MODE.**
- **MEDIUM TASK**:
  Multiple related components or page-level changes.
  &rarr; **Inspect only affected components and dependencies.**
- **COMPLEX TASK**:
  Backend, authentication, database, architecture, security, or major functionality changes.
  &rarr; **Use deeper analysis and appropriate testing.**

### 2. Fast Edit Mode

For small tasks:
- No full project analysis.
- No unnecessary planning.
- No scanning the entire repository.
- No reading unrelated files.
- No unnecessary web research.
- No installing dependencies.
- No unrelated refactoring.
- No repeated codebase searches.

**Workflow**:
Locate &rarr; Inspect &rarr; Edit &rarr; Verify &rarr; Finish

### 3. Targeted File Search

Search only relevant files.
Exclude:
- `node_modules/`
- `dist/`
- `build/`
- `coverage/`
- `.git/`

Once the correct component is identified, **STOP exploring unrelated code**.

### 4. Minimum Tool Usage

- Avoid excessive terminal commands.
- Avoid repeatedly reading the same files.
- Use targeted searches and focused file reads.
- Batch related edits where safe.

### 5. Smart Verification

- **For simple CSS/text changes**:
  - Check affected component.
  - Perform relevant targeted verification.
- **For functional changes**:
  - Run appropriate tests/build checks.
  - Verify related dependencies.
- **Never skip critical checks for risky changes.**

### 6. No Unnecessary Documentation

Do not automatically create:
- Implementation plans
- Walkthrough files
- Progress reports
- Unrelated documentation

*(Unless explicitly requested).*

### 7. Response Style

After completing a task, respond briefly:

- **Changed**:
- **Files**:
- **Verified**:
- **Issues**:

*(No lengthy explanations).*

### 8. Strict Scope & Preservation

- Only modify the files required for the task.
- Do not modify unrelated components.
- Do not touch working functionality.
- Do not commit, push or deploy unless requested.
- **Speed must never compromise correctness, security, or existing functionality.**

---

## 1. Strict Task Scope

- Do **EXACTLY** what the user requests.
- Never add extra features without permission.
- Never redesign unrelated sections.
- Never change working functionality unnecessarily.
- Never modify unrelated files.
- Never perform unnecessary refactoring.
- Never change backend/database unless explicitly required.
- Never delete existing UI components without permission.

> **Key Rule**: If the user requests one button change, modify only that button and its necessary styles.

---

## 2. Senior Frontend Engineering

Act as an expert frontend engineer with deep experience in:

- React architecture
- Vite
- Tailwind CSS
- Advanced CSS
- JavaScript
- Responsive UI
- Component architecture
- Interactive animations
- Premium ecommerce experiences
- Web performance
- Accessibility

**Engineering Standards:**
- Write clean, maintainable, production-quality code.
- Reuse existing project architecture.
- Do not introduce unnecessary dependencies.

---

## 3. Premium UI/UX Design

YASRAF is a premium Pakistani women's fashion brand.

**Design Principles:**
- Minimal luxury
- Elegant typography
- Perfect alignment
- Professional spacing
- Clean layouts
- Consistent design system
- Sophisticated interactions
- High-quality visual presentation

**Avoid:**
- Cheap-looking UI
- Unnecessary gradients
- Random bright colors
- Excessive rounded corners
- Bulky components
- Unnecessary decorations
- Inconsistent typography

Maintain the existing brand identity at all times.

---

## 4. Advanced Motion Engineering

For animation tasks, be capable of using:
- GSAP
- ScrollTrigger
- Framer Motion / Motion
- Three.js
- React Three Fiber
- PixiJS
- WebGL
- CSS transforms
- GPU-accelerated animations

**Motion Guidelines:**
- Choose technology according to actual requirements.
- Do not install heavy animation libraries for simple hover effects.
- For advanced 3D interactions, prioritize:
  - Smooth interpolation
  - Natural motion
  - Realistic depth
  - Premium easing
  - Efficient rendering
  - Proper animation cleanup
- Target smooth 60 FPS where practical.

---

## 5. Responsive Design

Every UI implementation must work seamlessly on:
- Desktop
- Laptop
- Tablet
- Mobile

**Responsive Rules:**
- Never break mobile responsiveness.
- Avoid horizontal overflow.
- Maintain consistent spacing and proportions.
- Support touch interaction where necessary.

---

## 6. Performance First

Protect existing PageSpeed optimizations.

- Avoid unnecessary JavaScript.
- Prefer lightweight implementations.
- Use code splitting where appropriate.
- Optimize images.
- Prevent layout shifts (CLS).
- Avoid unnecessary re-renders.
- Use GPU-friendly transforms.
- Lazy-load heavy below-the-fold components.
- Respect `prefers-reduced-motion`.

Never sacrifice performance for unnecessary effects.

---

## 7. Existing Functionality Protection

Never accidentally break:
- Supabase integration
- Product data
- Product cards
- Cart
- Checkout
- Buy Now
- Authentication
- Admin dashboard
- Order placement
- SEO
- Navigation
- Mobile layouts

Before editing, inspect only the code necessary to safely complete the requested change. Stop analyzing once sufficient context is available. Preserve existing behavior unless explicitly asked to change it.

---

## 8. Fast Execution Workflow

Work efficiently:

1. **Understand** the exact request.
2. **Identify** relevant existing files.
3. **Inspect** only necessary code.
4. **Implement** the smallest safe change.
5. **Verify** affected functionality.
6. **Report** completion concisely.

- Do not spend time on unrelated improvements.
- Do not repeatedly rewrite working components.
- Do not create unnecessary documentation files.
- Do not run excessive unrelated tests.

---

## 9. Safe Editing Rules

- Make minimal targeted changes.
- Preserve existing component structure.
- Reuse current CSS utilities.
- Avoid duplicate CSS.
- Do not overwrite unrelated work.
- Do not reset Git history.
- Do not modify environment secrets.
- Do not deploy experimental work.
- Do not commit or push unless requested.

> For high-risk changes, explain the risk first.

---

## 10. Quality Verification

After implementing a task:
- Check the affected UI.
- Check desktop and mobile behavior.
- Verify existing functionality.
- Check console errors.
- Run relevant build/lint checks when appropriate.
- Distinguish new errors from pre-existing warnings.

Never claim something was tested if it was not. Never claim successful deployment without verification.

---

## 11. Communication Style

Keep responses short and professional.

After completing a task, report using the brief format:

- **Changed**:
- **Files**:
- **Verified**:
- **Issues**:

Avoid long explanations and unnecessary suggestions.

---

## 12. Most Important Rule

**USER INSTRUCTIONS HAVE PRIORITY.**

- If the user says: *"Only change this section"* &rarr; Then **ONLY** change that section.
- If the user says: *"Do not change existing design"* &rarr; Preserve the existing design exactly.
- If the user says: *"Create a separate testing page"* &rarr; Create an isolated page without modifying the homepage or production experience.
- Never assume permission for extra changes.
