# Patch notes

All notable changes to AdBlock Island. The game is a single `index.html`, and the version shown on the title card (bottom right) matches the latest entry here.

Format: [Semantic Versioning](https://semver.org/). Dates are YYYY-MM-DD.

## [1.4.0] — 2026-10-29

Waves, a friend on the arrow keys, and aim that stops guessing.

### Added

- **Waves.** Ads now arrive in crews instead of trickling in. Difficulty climbs from **Super Easy** through **Easy**, **Normal**, **Hard**, **Super Hard**, into endless **Super Hard+**, with more ads, more health, more damage, and faster movement each step. Clearing a crew pays bonus Joy and XP, then the island takes a 4–5 second breath.
- **Wave notifications.** A banner announces every wave and every clear, a HUD card under your portrait tracks the current wave, tier, and remaining ads (or the countdown to the next one), and the locals comment in chat. The boss interrupts the schedule, and the card says so.
- **Same-keyboard co-op.** Turn on "play with a friend" on the title screen for a second hero on the arrow keys. They move with arrows, auto-swing at whatever they face, take real damage, and share the camera, the wave, and the Joy. The camera holds both heroes and leashes player 2 to one screen.

### Changed

- **Aim no longer depends on device detection at all.** If the mouse moved or clicked recently, the mouse is aiming — no media query, no pointer-kind flag. Touch input simply clears the flag. Moving a mouse on a touchscreen laptop also flips the HUD back to the desktop layout, so the mode is always visible.

### Fixed

- The AdBlocker's auto-sword could still draw attention to the wrong direction; it now has its own arc colour and never modifies the aim.

## [1.3.2] — 2026-10-29

Attacks now go where you point.

### Fixed

- **Aim assist was pulling swings sideways.** It picked the ad nearest to the *player* inside the aim cone, so a closer ad could steal a swing from the one you were actually pointing at. It now picks the ad nearest to your **aim line**, and large bodies get a much smaller amount of extra grace, so a boss standing next to you can no longer drag your attack 30–50° off target.
- **The AdBlocker's auto-sword was hijacking the aim.** It reused the normal attack direction and swept a full 360°, so every 0.85 s the visible swing snapped to whichever ad was closest — including ones behind you — while your buffered mouse aim appeared to be ignored. The sword now has its own animation, swings only in the forward arc, and never touches the direction you aimed.

### Changed

- The auto-swing draws its own small gold arc, separate from the shield bash, so you can tell the two apart.

## [1.3.1] — 2026-10-29

The mouse works everywhere now.

### Fixed

- **Mouse aim on hybrid devices.** The game used to pick touch mode purely from the `(pointer: coarse)` media query, so a touchscreen laptop, a tablet with a trackpad, or a Chromebook treated the mouse as if it did not exist. Aim now follows whichever device was used last: move the mouse and it takes over instantly, tap the screen and the thumbstick takes over again.
- **Aim keeps updating over the HUD.** Pointer moves were only tracked on the canvas, so the aim froze while the cursor crossed the minimap, chat, or top bar. They are tracked window-wide now.
- **Mouse aim is instant.** The hero used to ease toward the cursor with a short smoothing delay, which read as an unresponsive aim. It now points at the cursor exactly.

### Added

- Two faint pips in front of the hero show the aim direction at a glance.

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
