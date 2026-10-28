# Patch notes

All notable changes to AdBlock Island. The game is a single `index.html`, and the version shown on the title card (bottom right) matches the latest entry here.

Format: [Semantic Versioning](https://semver.org/). Dates are YYYY-MM-DD.

## [1.3.0] — 2026-10-29

Aiming, weapons, and paperwork.

### Added

- **The AdBlocker gets a sword.** The mallet is gone; the tank now carries a proper arming sword and shield. Gold trim arrives at level 3, a steel glow at level 6.
- **Short-range auto-attack for the AdBlocker.** The sword swings on its own every 0.85 s at the nearest ad within 64 px, for a small slice of damage. Stand your ground and the crowd in front of you keeps chipping away even when you are busy blocking, dashing, or reading the wall.
- **Aim assist.** Attacks snap onto the nearest ad inside the aim cone (about 24° on desktop, 34° on touch), so shots land where you meant them to instead of where your thumb happened to be.
- **Version display.** The current version sits on the title card and in the help panel.
- **Docs.** A full README and this changelog.

### Changed

- **Desktop aiming is free again.** The mouse no longer locks onto enemies. Point wherever you like — including while walking — and the character aims there. If the mouse sits still for 8 seconds, aim falls back to the direction you are walking, so keyboard-only play still works.
- **Phones aim where you move.** The stick direction is the aim direction, with the leading cursor pip showing it, and attacks pick the nearest ad in that direction.

### Removed

- The enemy-lock reticle from 1.2.0. It was helpful, but it stole the cursor from players who wanted to keep aiming by hand.

## [1.2.0] — 2026-10-29

### Added

- The aim cursor travels with the player: it rides ahead of you while walking, and a mobile pip shows the stick direction.

## [1.1.0] — 2026-10-29

### Added

- **The cast is now chibi MMORPG adventurers**, drawn procedurally on the canvas with class armour, weapons, headgear, and idle flourishes: AdBlocker (plumed helm, kite shield, mallet), Fact-Checker (hood, cupid collar, magnifier staff), Reader-Mode (wizard hat, floating tome, quill wand).
- Gear tiers: gold trim from level 3, weapon glow from level 6.
- Each hero and local rolls their own skin and hair; bots spawn at levels 1–6 with visible weapons.
- Full-body class-select banners and a matching HUD portrait.
- The sitting pose actually sits on the bench instead of standing in front of it.

### Changed

- HUD portraits, cosmetic previews, bots, and the player all share one hero renderer.

## [1.0.0] — 2026-10-29

### Added

- Initial release: three classes (AdBlocker, Fact-Checker, Reader-Mode), four ad-monsters plus The Algorithm boss, Joy and clarity progression, permanent upgrades and cosmetics, roaming locals with chat, the kindness wall, procedural ocean and lo-fi audio, responsive retro-pastel UI, touch controls, and local save data.
- Deployed to GitHub Pages at <https://potaterrr.github.io/adblock-island/>.
