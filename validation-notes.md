# Creative Art Studio — Validation Notes

## Current visual validation

The desktop studio opens successfully with the intended Playful Atelier workbench composition: maker shelf on the left, 3D stage in the center, inspector on the right, a visible Save action, Gallery access, and a prominent Surprise Me action below the canvas. The empty-state prompt is visible over the 3D stage and informs the user how to start.

The 3D canvas has loaded successfully beneath the generated high-key atelier background. The generated Spark logo asset is still in its asynchronous replacement phase at the time of this note, so the initial placeholder should be re-checked before final delivery.

## Technical validation completed

| Check | Result |
| --- | --- |
| TypeScript (`pnpm check`) | Passed |
| Production build (`pnpm build`) | Passed |
| Development server after dependency installation | Running |

The production build reports a standard Vite bundle-size advisory for the Three.js/R3F client bundle, but no build failure.

## Browser interaction validation

The live browser workflow successfully added a **Cube** from the Maker Shelf. The new mesh appeared in the Three.js stage, was automatically selected, displayed its on-canvas selection badge, enabled the colour and material controls, and populated the Inspector with editable position, rotation, and size values.

Editing the cube's X position in the Inspector visibly moved it across the stage. Choosing the Cobalt pigment visibly recoloured the mesh and updated both the active pigment state and custom-colour value. The browser's native numeric input action appended the typed value visually as `01.8`, while the controlled scene state correctly interpreted it as `1.8`; this ergonomic input behavior should be refined in a future polish pass.

### Material-switching regression and recovery

In the development environment, changing from Matte to Metallic initially raised an R3F `data-loc` property error. The source cause is the development JSX-location plugin attaching a distinct location property to the alternative material JSX branches. The canvas code has been revised to always render one stable `meshStandardMaterial` element and vary only its calculated properties. The error boundary did not perform a hard browser refresh, so a direct navigation refresh is required for the retest.

A direct browser refresh successfully restored the studio and its persisted cube without a canvas error. The saved cube was rendered with the dark metallic finish. The refresh intentionally leaves no active selection, consistent with the first-build persistence scope. A coordinate-based click on the outer application container did not select the mesh; the regular on-canvas click path had already been validated during initial creation.

The browser automation's element-index click targets the canvas center rather than a specific mesh, so it did not select the off-center persisted object. This is a limitation of the automated interaction route, not of the already-confirmed automatic-selection path when adding a shape.

The material-switching correction was validated successfully: a newly added Sphere was selected automatically, then changed from Matte to Metallic without an R3F error. Its Inspector summary changed to `metallic sphere` and the rendered mesh acquired the expected reflective metallic appearance.

The **Surprise Me** control replaced the active scene with a colourful seven-shape abstract arrangement, applied varied types, positions, scales, rotations, colours, and finishes, selected the first generated Torus, and changed the project title to `A surprised little universe`. Pressing **Save** stored the composition in the local gallery and updated the Gallery badge to `1`.

Opening **Gallery** presented the saved local composition with its title, object count, date, colour strip, and an `Open and keep making` restore action. Closing the drawer and pressing `Remove this shape` on the selected Torus removed it from the scene, cleared the selection, and changed the active scene count from seven to six.

At a 375 × 812 touch viewport, the layout becomes a deliberate single-column workbench: the header condenses, the 3D stage stays first and touch-sized, and the maker shelf follows it. The visible first viewport is usable, but the two-action row needs a small spacing refinement to prevent the long Surprise Me control from visually clipping at the right edge.

The independent desktop visual review confirmed that the Playful Atelier workbench layout, warm palette, broad canvas, pigment tools, display type, and persimmon action are coherent. It recommended a decisive, one-pass refinement to strengthen the four-lobed Spark identity, warm the layered paper/clay material language, make the maker stage more theatrical, extend persimmon into selected states, and soften utility copy into a direct maker voice. These recommendations will be implemented before delivery.

The accepted visual refinements are now visible on desktop: a large four-lobed Spark mark leads the header; paper-cut offsets, warm trays, irregular corners, tactile pigment dots, a framed maker stage, persimmon selection accents, and maker-focused utility copy reinforce the visual direction. At 375 × 812, the compact header and prominent touch-sized stage remain clear, and the final two-column action-bar adjustment keeps both `Fresh stage` and `Surprise Me` fully visible without horizontal clipping.
