# Sensory play and challenge validation

- TypeScript validation (`pnpm check`) passes after the browser-local sound, texture, sticker, and challenge extensions.
- Production build (`pnpm build`) passes. The existing bundle-size advisory remains; it does not prevent building or running the app.
- Studio sounds are opt-in and use short in-browser Web Audio tones only after a direct user action. The setting is stored locally with the artwork state.
- Shape decorations are stored in the scene model (`plain`, `dots`, `stripes`; `none`, `star`, `heart`, `smile`) and are therefore included in local saves, gallery restores, undo/redo snapshots, PNG capture, and Surprise Me scenes.
- Challenge cards are browser-local, offer refresh and dismiss controls, and use simple age-appropriate prompts without collecting any personal information.
