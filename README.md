# AdBlock Island

**v1.3.0** · [Play it](https://potaterrr.github.io/adblock-island/) · [Patch notes](CHANGELOG.md)

A wholesome micro-MMO in a single HTML file. The ads took the beach, the locals kept the kettle on. Pick a class, sweep the static, bonk the ad-monsters, and leave a kind note for whoever washes ashore next.

Everything is self-contained: no build step, no CDN, no images, no fonts, no backend, no accounts, no trackers. The island is drawn with the Canvas 2D API, and the ocean, lo-fi chords, and sound effects are synthesized with the Web Audio API.

```
index.html   ← the entire game (≈300 KB, markup + CSS + renderer + audio + logic)
```

## Play it

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Audio starts after the first click, as browsers require.

## Controls

| Action | Keyboard / mouse | Touch |
| --- | --- | --- |
| Move | `WASD` / arrow keys | left thumb stick |
| Aim | mouse cursor (free aim, even while walking) | aims where the stick points |
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

Attacks snap onto the nearest ad inside the aim cone, so you rarely have to pixel-hunt — especially on a phone, where the stick direction is the aim.

## Classes

| Class | Role | Weapon & look | Signature |
| --- | --- | --- | --- |
| **AdBlocker** | shield & slam | plumed helm, kite shield, arming sword | Wide shield bash; auto-swings the sword at anything within arm's reach; takes 15% less damage. |
| **Fact-Checker** | heal & mark | hood, magnifier staff, satchel | Citation darts mark ads and heal nearby locals; regenerates 1.6 HP/s. |
| **Reader-Mode** | ranged beams | wizard hat, floating tome, quill wand | Piercing text beams hit every ad in a row; 8% faster, a little fragile. |

Gear picks up gold trim from level 3 and a soft glow from level 6. Every hero and local rolls their own skin, hair, and level.

## What is on the island

- **Four ad-monsters plus a boss:** Pop-Up Imps spawn clickable `[X]` windows, Unskippable Behemoths are invulnerable until their SKIP window, Clickbait Mimics hide as free Joy, and Banner Bats throw flyers. The Algorithm runs ad breaks, sponsored beam attacks, and summons more content at health thresholds.
- **Joy and clarity:** every fully cleansed tile pays Joy and experience. Spend Joy on permanent upgrades or cozy cosmetics.
- **A living island:** locals roam, fight, cleanse, sit on the bench, and chat in a local log. They react to your messages.
- **The kindness wall:** sit at the cozy bench and pin a note for the next person. Notes are saved locally and read by the locals.
- **Procedural sound:** generated ocean noise, a slow lo-fi chord progression, UI sounds, combat hits, cleansing sparkles, and a boss track that shifts when the fight starts.
- **Retro-pastel UI:** responsive HUD, minimap, floating damage numbers, speech bubbles, screen shake, particles, scanlines (toggleable), and a reduced-motion option.
- **Persistence:** progress, notes, settings, and cosmetics live in `localStorage`.

## Deploying to GitHub Pages

There is no build step. Any static host will do.

1. Put `index.html` (and `.nojekyll`) at the root of a repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your branch and `/ (root)`, then save.

The game lands at `https://<username>.github.io/<repo>/`. It also works from a subfolder — the file uses relative paths only.

If you use Jekyll and want the file served untouched, keep the empty `.nojekyll` file at the root of the deployed branch.

## Save data

The game stores three keys in `localStorage`:

- `adblock-island.save.v1` — name, class, level, Joy, upgrades, cosmetics, stats, boss progress, corruption map
- `adblock-island.notes.v1` — the local kindness wall
- `adblock-island.settings.v1` — volume, mute, scanlines, particles, numbers, reduced motion

Clearing site data resets the island. Nothing is sent anywhere.

## Project layout

```
adblock-island/
├── index.html     # the whole game: markup, styles, canvas renderer, audio, logic
├── CHANGELOG.md   # version history and patch notes
├── README.md
└── .nojekyll      # keep GitHub Pages from running Jekyll
```

## Performance notes

The renderer targets 60 fps on phones and a calm 30–60 fps on desktop. It is a single canvas with a y-sorted scene, a cached minimap, and throttled floating text. If a machine struggles, the settings panel can turn off particles, screen shake, scanlines, and damage numbers.

## A note on the fiction

AdBlock Island is a small, non-commercial joke about ad fatigue. It is not affiliated with any ad blocker, browser, or platform. The ads are fictional, and the only thing they want is for you to sit down for a minute.
