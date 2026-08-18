# Workbench Layout Correction Notes

The reported wide, short viewport exposed competing desktop height rules from several visual-refinement stylesheets. Earlier `min-height` rules allowed the 3D stage to exceed the available viewport, leaving its action area below the fold. Decorative tray underlayers and filters also made the maker shelf and inspector appear visually muted.

The correction loads last in the studio style order. It bounds the stage height using viewport-relative clamps, gives side trays independent scrolling on desktop, removes tray filters and decorative pseudo-layers at the affected breakpoint, and provides a DOM-level empty-stage prompt that stays visible even when the Three.js scene has no objects.
