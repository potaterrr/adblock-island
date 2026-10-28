# Patch notes

All notable changes to AdBlock Island. The game is a single `index.html`, and the version shown on the title card (bottom right) matches the latest entry here.

Format: [Semantic Versioning](https://semver.org/). Dates are YYYY-MM-DD. Every release since the first build is listed below, newest first.

## Still pending

This is a **beta**. The list below is deliberately not in the build yet. Some of it is a weekend of work; some of it needs a server, accounts and moderation, which a single static `index.html` on GitHub Pages cannot provide on its own. This section stays at the top of the patch notes until each line is either shipped or honestly dropped.

### Achievements

Six wave medals ship today, listed on the pause screen. Still pending:

- A real medal gallery: a collection screen with locked silhouettes, unlock dates, progress bars, and a "new" dot until you have looked at it.
- Achievements for the rest of the game, not just wave milestones: first boss, 100% island clarity, ten kindness notes, a full run without being knocked out, a clear with each class, a co-op clear, wave 20.
- Unlock toasts and a small fanfare when a medal lands, instead of only finding it later in the pause screen.
- Account-wide achievements. Today they live in `localStorage` and vanish when site data is cleared.

### Cool items

Waves currently hand out seven small things — Spare Broom, Wool Blanket, Spare Lens, Worn Sandals, Cool Cloth, Jar of Joy and Kettle Break — and most are quietly a free upgrade rank. Still pending:

- A real inventory: slots, stacking, descriptions, and a "found on wave N" line.
- Cosmetic drops that change how your hero looks — hats, brooms, trails, emotes — plus an equip screen. The class-picker cosmetics are the only cosmetic today.
- Rarity tiers, set bonuses, and a reason to keep an item once its upgrade is maxed.
- Items that change a run: one-use lures, placeable turrets, a kettle you can set down for the locals.
- Trading and gifting between players. That needs accounts and a server first.

### What an MMORPG still needs

The "MMO" in micro-MMO is currently a polite lie: the other players are bots, and co-op is two people on one keyboard. To be an actual MMORPG, the game still needs:

- **Online multiplayer.** Authoritative servers, rooms or shards, lag compensation and state sync. GitHub Pages is static hosting, so this needs a backend — or a peer-to-peer/WebRTC experiment with all of its NAT headaches.
- **Accounts and cross-device saves.** Sign-in, cloud saves and conflict handling. Today progress belongs to one browser's `localStorage`.
- **Moderated chat.** Server-side filtering, reporting, mute/block, rate limits, and a human process behind it. An unmoderated chat is not something to ship.
- **Parties, friends and guilds.** Invites, presence, shared objectives, and a reason to log in together.
- **Quests, raids and world events.** Content beyond the wave ladder, with rewards that respect everyone's time.
- **A player economy.** Trading, currency sinks, and anti-dupe rules. Joy is single-player and is not an economy yet.
- **Anti-cheat and fair play.** Server authority, validation and rate limits. Anything that lives only on the client is a suggestion.
- **Live ops.** Seasons, events, balance patches, and consent-based telemetry so balance changes are informed.
- **Accessibility and localisation.** Remapping, a screen-reader pass, reduced-motion parity, and translated copy.
- **A content pipeline.** The island is one hand-written file; more classes, enemies and stories need tooling that does not exist yet.

Until then, the honest description is: a single-player and local co-op cozy micro-MMO with bots, in beta.

## [1.5.1] — 2026-10-29

Beta, labelled.

### Added

- **A beta badge on the title screen.** A loud `beta · v1.5.1` pill sits next to the "wholesome micro-MMO" kicker, and the build tag in the bottom-right corner now reads `v1.5.1 · beta`. The pill's tooltip and the help panel's "This build" block both say the build is a beta.
- **A "Still pending" section at the top of these patch notes**, covering the achievements and items that are still thin, and the MMORPG essentials — online multiplayer, accounts, moderated chat, parties, quests, economy, anti-cheat, live ops — that a static page cannot provide on its own. Mirrored in the README.

### Changed

- The page `<title>` and `<meta name="description">` now say **beta** and the current version, so link previews and search results match the build.
- The help panel's "This build" block points at the pending list instead of implying the game is finished.

## [1.5.0] — 2026-10-29

Waves become a ladder you climb on purpose.

### Added

- **Upgrade or next wave.** Clearing a wave no longer rolls straight into the next one. A card opens with what you just swept, the story chapter you unlocked, the reward you earned and a preview of the next tier. **Upgrade** opens the shop; buying things never starts the next wave. **Next wave** starts a **10-second countdown** on the card under your portrait. The countdown pauses while the shop or any panel is open, and `N` or tapping the wave card reopens the choice if you dismissed it.
- **Medals.** Six achievements, tracked on the pause screen and kept between visits: First Sweep (wave 1), Polite Static (wave 3), They Brought Friends (wave 5), Banner Bane (wave 7), Hold the Line (wave 9) and Island Saved (wave 10).
- **Free items.** Waves without a medal hand out something instead: Spare Broom, Wool Blanket, Spare Lens, Worn Sandals, Cool Cloth, Jar of Joy or Kettle Break. Most are a free upgrade rank; the rest are Joy or a full heal. Found items are listed on the pause screen.
- **A story chapter per wave.** The island log runs from "the first pop-up bursts like wet paper" to the kettle at the end of the ladder, one short entry per clear, also written into the chat log so you can reread it. Waves 11+ have a small pool of extra entries.
- **An ending for the ladder.** Clearing **Super Hard** (wave 10) shows *"You saved this island from serving ads"*, fires the confetti, awards the Island Saved medal, and unlocks endless **Super Hard+** waves. The victory is remembered in the save.

### Changed

- **Every run starts at Super Easy.** Waves used to resume from `save.wave`; now the ladder always begins at wave 1, while levels, Joy, upgrades, medals, items and the island itself persist. Restarting the climb is the point, not a punishment.
- **The boss no longer eats a wave.** If the Algorithm interrupts the schedule, the wave is marked held and re-spawned properly once it is dealt with, instead of being counted as cleared with no ads on the field.
- The HUD wave card is now a button when a wave is cleared ("cleared · tap to choose") and shows the countdown while one is running.
- The pause screen "current plan" follows the wave state, and the help panel documents the choice, the countdown and the ladder's ending.

## [1.4.3] — 2026-10-29

The island gets its story told.

### Added

- **A backstory in the help panel.** Pressing `H` now opens with "The story so far": the ads came with the tide, the locals kept the kettle on, and you wash ashore with a broom and nowhere else to be. Two short paragraphs above the existing plan, class abilities, controls, ads, waves and co-op blocks.
- **A credit and disclaimer footer.** The bottom of the help panel names it as an original solo project by [@potaterrr](https://github.com/potaterrr), links to the source, and notes that every asset is hand-written — no third-party art, fonts, audio, or libraries — and that the game is a work of parody with no real advertisers involved.
- **README: backstory, how to play, patch notes, disclaimer.** The readme now opens with the island's story, then a seven-step how-to-play that matches the actual game loop (classes, aim, cleansing, waves, the Algorithm, the bench, co-op), then a patch-notes table covering every release from 1.0.0 to 1.4.3, then a plain-language disclaimer: original work by potaterrr, no third-party assets, no affiliation, no data collection.

### Changed

- The "note on the fiction" paragraph moved into the fuller disclaimer at the end of the README, so the affiliation and parody notice sits next to the ownership statement instead of being buried mid-document.

## [1.4.2] — 2026-10-29

The title screen gets the phone treatment too.

### Changed

- **The class picker is compact on phones.** The three full-width portrait cards are now short rows: a cropped portrait on the left, name, role and description on the right, abilities underneath. On a 390×844 phone the title card drops from 1424px to 948px tall and each class card from roughly 450px to 125px, so all three classes fit on one screen instead of one and a bit.
- **Phone-sized class blurbs.** Each class has a two-line description for the compact card, so nothing is cut off with an ellipsis. Desktop and tablet keep the original longer copy.
- Tighter title spacing under 500px (logo, tagline, name field, button, links) so the "wash ashore" button and the whole picker share the first screen.

## [1.4.1] — 2026-10-29

A phone-sized pass over the controls.

### Fixed

- **Touch controls no longer eat the screen.** The thumbstick and the four action buttons scale with the viewport: BONK drops from 82px to 61–67px on phones, the two skills from 60px to 45–49px, and the dash from 50px to 37–41px, while tablets and desktops keep the larger layout. The whole cluster stays inside the safe-area insets.
- **The HUD card fits its content.** Its width is now pinned to the space beside the tool row instead of shrinking to the nickname, so the HP and XP numbers are no longer clipped and the audio/chat/help buttons can't sit on top of it. On very narrow phones the tool buttons compact and the JOY box steps aside.
- **The wave banner** keeps its tier on one line and sits below the top cards instead of on top of them.
- **Short and landscape screens.** The title screen now scrolls from the top instead of centering itself out of reach, so "wash ashore" can't be pushed off-screen, and full-screen layers use `dvh` so a mobile browser's toolbar can't cover the bottom controls.

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
