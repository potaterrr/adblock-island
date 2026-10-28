# AdBlock Island

A wholesome micro-MMO in a single HTML file. The ads took the beach, the locals kept the kettle on. Pick a class, sweep the static, bonk the ad-monsters, and leave a kind note on the wall.

Everything is self-contained: no build step, no CDN, no images, no fonts, no backend. The island is drawn with the Canvas 2D API and the ocean, lo-fi chords, and sound effects are synthesized with the Web Audio API.

## Play it

Open `index.html` directly, or serve the folder:

```bash
cd adblock-island
python3 -m http.server 8000
# then visit http://localhost:8000
```

Audio starts after the first click, as browsers require.

## Controls

| Action | Keyboard / mouse | Touch |
| --- | --- | --- |
| Move | `WASD` / arrow keys | left joystick |
| Attack | `J` or click / hold | BONK button |
| Skill one | `Q` | SKILL button |
| Skill two | `E` | SKILL button |
| Dash | `Space` | dash button |
| Sit / leave a note | `F` near the bench | sit button near the bench |
| Upgrades | `U` | upgrades tool |
| Chat | `C` | chat tool |
| Help | `H` | help tool |
| Pause | `Esc` | pause tool |
| Mute | `M` | speaker tool |

## What is on the island

- **Three chibi adventurer classes**, each hand-drawn on the canvas with its own armour, weapon, headgear, and idle flourishes: AdBlocker (plumed helm, kite shield, mallet), Fact-Checker (hood and magnifier staff), Reader-Mode (wizard hat, floating tome, quill wand). Gear picks up gold trim from level 3 and a glow from level 6, and every local rolls a slightly different face.
- **Four ad-monsters plus a boss:** Pop-Up Imps spawn clickable `[X]` windows, Unskippable Behemoths are invulnerable until their SKIP window, Clickbait Mimics hide as free Joy, and Banner Bats throw flyers. The Algorithm runs ad breaks, sponsored beam attacks, and summons more content at health thresholds.
- **Joy and clarity:** every fully cleansed tile pays Joy and experience. Spend Joy on permanent upgrades or cozy cosmetics.
- **A living island:** locals roam, fight, cleanse, sit on the bench, and chat in a local log. They react to your messages.
- **The kindness wall:** sit at the cozy bench and pin a note for the next person. Notes are saved locally and read by the locals.
- **Procedural sound:** generated ocean noise, a slow lo-fi chord progression, UI sounds, combat hits, cleansing sparkles, and a boss track that shifts when the fight starts.
- **Retro-pastel UI:** responsive HUD, minimap, floating damage numbers, speech bubbles, screen shake, particles, scanlines (toggleable), and a reduced-motion option.
- **Persistence:** progress, notes, settings, and cosmetics live in `localStorage`.

## Deploying to GitHub Pages

There is no build step. Any static host will do.

**As a standalone site**

1. Put `index.html` at the root of a repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your branch and `/ (root)`, then save.

Your game is at `https://<username>.github.io/<repo>/`.

**As a subfolder of an existing Pages site**

Keep the folder as `adblock-island/` and visit `https://<username>.github.io/<repo>/adblock-island/`. The file is relative-path free, so it works from any subpath.

If you use Jekyll and want the file served untouched, add an empty `.nojekyll` file at the root of the deployed branch.

## Save data

The game stores three keys in `localStorage`:

- `adblock-island.save.v1` — name, class, level, Joy, upgrades, cosmetics, stats, boss progress, corruption map
- `adblock-island.notes.v1` — the local kindness wall
- `adblock-island.settings.v1` — volume, mute, scanlines, particles, numbers, reduced motion

Clearing site data resets the island. Nothing is sent anywhere.

## File layout

```
adblock-island/
├── index.html   # the whole game: markup, styles, canvas renderer, audio, logic
├── .nojekyll    # optional, for GitHub Pages
└── README.md
```

## A note on the fiction

AdBlock Island is a small, non-commercial joke about ad fatigue. It is not affiliated with any ad blocker, browser, or platform. The ads are fictional and the only thing they want is for you to sit down for a minute.
