# Project memory

## Product intent & audience

- Network troubleshooting web app for individuals and small businesses (particuliers et petites entreprises).
- Provides guided diagnostic "parcours" (18 total) covering common network issues.
- Includes an AI conversational assistant (French) that diagnoses problems step-by-step and can route users to relevant parcours.

## Brand personality & voice

- French-language interface throughout.
- Simple, clear, non-technical tone; explanations accessible to non-experts.
- Assistant asks one question at a time, gives concrete Windows CMD commands when useful, politely declines off-topic requests.

## Visual design & UX direction

- Theme: beige frosted glass (verre dépoli) — translucent blurred panels across the app.
- Chat UI: round floating button (bottom-right, all pages) with chat icon; opens an elegant glass-panel chat window.
- Chat bubbles: sage green for user messages, white for assistant messages.
- Chat window includes: conversation area, text input, send button, welcome message, "en train d'écrire…" typing indicator.
- Stack: Vite + React + Tailwind CSS + Lucide React icons. `@/` path alias maps to `src/`.
- No extra UI/icon packages beyond template defaults.

## Decisions, constraints & rationale

- AI calls go through a deployed server function; API key is stored in project Secrets and never appears in browser code.
- System prompt encodes: French only, one-question-at-a-time diagnostics, exact Windows CMD commands (ipconfig, ping, nslookup…), scope limited to networking and basic IT, suggest matching parcours when symptoms align.
- Assistant references the 18 parcours by name and can suggest launching one from the home screen.
- Graceful error handling in chat window when AI service is unavailable.

## Open questions & assumptions

- AI API key not yet configured; user must add it via the database Secrets menu.
- Specific AI provider/model used by the server function not yet documented in project context.
- Full list of 18 parcours names and their trigger symptoms not yet captured — should be stored once available to keep assistant suggestions accurate.