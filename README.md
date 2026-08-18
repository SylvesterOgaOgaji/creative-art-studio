# Creative Art Studio

> A browser-local 3D maker space where children can explore shapes, colour, light, texture, movement, and imaginative challenges.

Creative Art Studio is a React and Three.js learning project created during a collaborative training programme. It is designed as a private-by-default creative experience: no accounts, login, database, public profiles, advertising, or cloud storage are required. Artwork, favourites, sound preferences, badges, and tutorial progress stay in the browser that created them.

## Makers

**Creative lead:** Mr. Sylvester Ogah Ogaji.

**Built in collaboration with student makers:** Simeon Ogaji, Samuel Ogaji, Daniel Ogaji, Michael Ogaji, Bisina, Glenn, and other student makers participating in the training programme.

## What children can do

| Area | Current capabilities |
|---|---|
| Create | Add cubes, spheres, cones, cylinders, and toruses; directly move, rotate, and scale them. |
| Play | Change colour, material, stickers, dots, stripes, checkerboard, glitter, lighting, and environments. |
| Explore | Use optional sound, Surprise Me scenes, first-run guidance, and short creative challenges. |
| Keep | Save browser-local worlds with thumbnails, favourites, badges, PNG export, search, rename, and delete controls. |

## Run locally

```bash
pnpm install
pnpm dev
```

Run the validation and production build with:

```bash
pnpm check
pnpm build
```

## Browser-local data

The project uses LocalStorage for MVP persistence. Clearing browser site data clears saved creations, badges, favourites, settings, and tutorial progress. This is intentional for the current child-safety-focused, no-login version.

## Reuse

This project is released under the MIT License. You may clone, learn from, adapt, and build on it, provided the licence notice is retained. Please preserve the maker credits when sharing substantially derived versions.
