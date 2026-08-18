# Creative Art Studio — Design Directions

## Three initial approaches

### 1. Playful Atelier

**Very Brief Intro:** A warm, tactile digital maker table where colourful clay-like forms sit against a quiet studio backdrop. It feels inviting, exploratory, and equally comfortable for young children and older makers.

**Probability:** 0.07

### 2. Cosmic Craft Lab

**Very Brief Intro:** A high-energy dark space for making impossible miniature worlds, led by luminous colour and dramatic light. It balances curiosity with a science-lab sense of discovery.

**Probability:** 0.04

### 3. Paper Garden Studio

**Very Brief Intro:** A soft editorial creative space with cut-paper silhouettes, botanical colours, and calm interactions. It foregrounds imagination and reflection rather than technical complexity.

**Probability:** 0.09

---

## Chosen direction: Playful Atelier

### Design Movement

**Contemporary children’s museum meets tactile product design.** The interface has the calm, high-quality structure of a creative-workshop tool, softened by friendly organic forms and carefully placed colour.

### Core Principles

1. **Make first, read second:** Controls are clear, visual, and discoverable without demanding long instructions.
2. **Tactility through restraint:** Soft edges, paper-like surfaces, and small physical responses make actions feel tangible without becoming toy-like.
3. **The canvas is the hero:** Panels stay disciplined and quiet so the 3D art remains the visual focus.
4. **Visible creative momentum:** Selection states, colourful object chips, and the Surprise Me action make experimentation feel rewarding.

### Color Philosophy

The primary surface is a warm parchment-white to make the studio feel open and trustworthy. Charcoal ink provides strong accessible contrast, while a clear **persimmon orange** becomes the ownable energy signal for primary creation actions. Cobalt, sea-glass green, sunny yellow, berry, and sky blue appear as expressive art pigments rather than an overwhelming all-over rainbow.

### Layout Paradigm

An **atelier workbench** layout: a compact header sets the scene; the lower area is a broad central canvas framed by a left tool shelf and a right inspection tray. On touch devices, these trays collapse into reachable horizontal drawers, leaving the 3D workspace dominant.

### Signature Elements

1. A layered **paper-cut arch** behind the scene that frames the 3D world without competing with it.
2. **Pigment dots** and irregular colour swatches for material/colour selection.
3. The **Spark mark**: a bold four-pointed abstract star assembled from rounded geometric lobes.

### Interaction Philosophy

Every action should respond quickly and clearly: added objects become selected, transform fields update the scene immediately, and the active material reads as a labelled surface chip. The Surprise Me action produces a noticeable but short celebratory state, then returns control directly to the maker.

### Animation

Use 120–220ms `cubic-bezier(0.23, 1, 0.32, 1)` transitions for state and control feedback. Tool cards lift by 1–2px on hover; selection rings softly pulse only when a new object is created. The Surprise Me button receives a short, non-looping sparkle sweep. Respect `prefers-reduced-motion` by removing nonessential motion.

### Typography System

**Fraunces** is the expressive display face for the studio name and the creative prompt, using semibold and italic sparingly. **DM Sans** is the highly legible workhorse for controls, numeric values, and all supporting copy. Large workspace labels are purposeful rather than decorative; control labels remain sentence case and compact.

### Brand Essence

**A hands-on 3D art workbench for young makers who learn through bold visual experimentation.**

Personality: **curious, capable, warm**.

### Brand Voice

Headlines are encouraging, direct, and action-oriented; microcopy explains only what helps the next creative move. Avoid generic welcomes and over-technical language.

Example lines:

> “Make a tiny world with a big imagination.”

> “Try a new shape, then make it yours.”

### Wordmark & Logo

The wordmark pairs the high-contrast Fraunces title with a compact, tilted **Spark mark** made from four rounded, overlapping colour lobes. The mark works alone as the favicon and at a visibly useful size in the header; no generated typography is required for the logo.

### Signature Brand Color

**Persimmon Spark — #FF6B4A**. Used for the Surprise Me action, active highlights, and the heart of the Spark mark.

## Style Decisions

1. The visible header brand signal is a four-lobed **Spark mark** in persimmon, cobalt, sea-glass, and sunny yellow; the supplied mark remains incorporated as a subtle internal texture rather than a dark app-tile treatment.
2. The maker shelf, inspector tray, canvas rim, pigment dots, and empty-state invitation use **layered paper and soft studio-object cues**: warm off-whites, slight irregularity, cut-paper edges, and tactile offset shadows take precedence over generic dashboard cards.
3. **Persimmon** links the Spark mark, selected-object signal, active pigment state, and creation prompts into a single recognizable energy system.
4. Utility copy adopts a short **maker voice**: action-oriented, encouraging, and clear without administrative phrasing.
5. **Persimmon Spark leads every maker moment.** Saving and exporting are warm creative actions; dark navy remains a quiet structural colour.
6. Every major surface includes a **tactile cue**—a layered paper edge, offset workshop shadow, organic outline, pigment chip, or studio-object detail.
7. The art stage is the visual hero: it has the strongest paper-cut frame and more vertical presence than either supporting tray.
8. Empty stages use an encouraging maker prompt with a small physical studio cue; the Spark mark and Fraunces wordmark form one compact, persimmon-anchored studio lockup.
9. First-run guidance appears as a **pinned paper studio note**, with a dashed edge and folded corner; it guides attention without blurring or visually eclipsing the canvas.
10. The empty 3D stage carries a small **maker-table cue**—a hand-cut frame and simple form marks—so the invitation feels ready for play rather than vacant.
11. The 3D canvas remains the **highest-weight maker object**: surrounding shelves, challenge prompts, and guidance notes use quieter paper-tool surfaces rather than competing dashboard cards.
12. The header now treats the Spark mark, Fraunces studio title, and **Persimmon Spark** as one compact, layered-paper lockup; persimmon remains reserved for active making, selected states, and celebration.
13. Major workbench surfaces use offset shadows, irregular paper contours, and pigment-adjacent colour accents to reinforce the tactile atelier rather than generic rounded-panel styling.
14. Makers, educator, and classroom-starter content behaves like a **studio field journal**: a broad paper page, a compact Spark lockup, off-centre pinned notes, and a return path to the workbench rather than a generic marketing subsite.
15. Student names appear only as the approved developer roster. Artwork is opt-in and browser-local: a teacher or maker chooses a saved world to feature and assigns a display name; no artwork is published or shared by default.
16. Educator guidance uses practical short-format lesson cards, age-mode comparisons, and privacy-first setup notes. The classroom starter is a set of three ready-to-make scene recipes rather than an instructional dashboard.
17. The four-lobed pigment **Spark** and Fraunces wordmark are the single visual identity on studio and field-journal routes; “Field journal” remains a secondary descriptor.
18. **Persimmon Spark `#FF6B4A`** signals making, starting, saving, selection, and celebration. Cobalt is a secondary pigment accent rather than a primary action colour.
19. Every field-journal section carries a small tactile studio signal: a pinned edge, paper tape, pigment strip, paper-cut shape, or folded surface.
20. On wide, tall screens, the **3D art stage** is wider, taller, and more physically framed than any surrounding shelf; challenge, badge, guide, and reflection surfaces are intentionally quieter downstream notes.
21. Empty stages show a **double paper-cut arch** with three simple pigment primitives behind the first-making prompt, making the maker table recognizable before an object is added.
22. Field-journal section headings use one short, content-adjacent pigment strip and retain **Persimmon Spark** for making, starting, saving, and print actions; decorative colour appears as a material cue, not a competing action signal.
23. Below-canvas guidance behaves as **quiet field-journal material**: one tactile cue per section, subdued pigment use, and no downstream card may visually outweigh the main art stage.
24. **Persimmon Spark `#FF6B4A`** is reserved for primary maker actions, selected or active states, saving/exporting, and celebration; secondary notes use parchment, charcoal, sea-glass, cobalt, and softer pigment accents.
25. The Spark + Fraunces “Make a tiny world” lockup is the compact identity anchor; it reads as one ownable maker mark rather than a decorated application header.
26. Reflection is a calm **field-journal pause** with parchment surfaces and muted studio pigments; its only persimmon action is the functional save control.
