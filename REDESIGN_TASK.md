Fetch this design file, read its README if available, and implement the relevant aspects of the design:

https://api.anthropic.com/v1/design/h/Jkhx2yt0-IbZxInDQtqYwQ?open_file=Resta+Production.html

Implement: Resta Production.html

Read before coding:
1. .cursorrules
2. AI_DEVELOPMENT_GUIDELINES.md
3. Resta Production.html

Goal:
Rebuild the current frontend UI according to Resta Production.html, but keep the app production-ready, maintainable, typed, and aligned with the existing architecture.

Do not copy raw HTML/CSS. Use the HTML only as visual and UX reference.

Follow these phases:
1. Audit current project structure, UI primitives, tokens, routes, feature folders.
2. Update design tokens only if needed.
3. Extend existing UI primitives instead of duplicating components.
4. Implement reusable app shells and states.
5. Implement global onboarding.
6. Implement employee flow.
7. Implement restaurant flow.
8. Implement supplier flow.
9. Implement access/payments/paywalls.
10. Implement final states.

Hard rules:
- Use existing primitives: Button, Input, Card, Callout, KpiRow, Drawer, Modal, AlertDialog, Badge, PageSuspense, useToast.
- Feature UI goes to src/features/<feature>/ui.
- Feature logic goes to src/features/<feature>/model.
- No raw hex colors in JSX.
- No arbitrary z-index. Use Z_INDEX.
- No arbitrary text sizes unless allowed.
- Use safe-area utilities.
- Touch targets >= 44px.
- No ad-hoc card/button/input patterns.
- No English UI statuses.
- Payment for shifts is DIRECT between restaurant and worker.
- Reviews are not payouts.
- Contacts are available only by selected candidate / accepted application / PRO / subscription.
- Match score is allowed, but do not call it AI.

Verification:
Run:
- npx tsc -b
- npm run lint
- npm run build

Also check:
- raw hex in JSX
- arbitrary text sizes
- arbitrary z-index
- ad-hoc card patterns
- interactive div without accessibility
- English UI statuses

Output summary using AI_DEVELOPMENT_GUIDELINES.md format.
