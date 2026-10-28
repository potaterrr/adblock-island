# AdBlock Island

**v1.4.3** · [Play it](https://potaterrr.github.io/adblock-island/) · [Patch notes](CHANGELOG.md)

A wholesome micro-MMO in a single HTML file. The ads took the beach, the locals kept the kettle on. Pick a class, sweep the static, bonk the ad-monsters, and leave a kind note for whoever washes ashore next.

Everything is self-contained: no build step, no CDN, no images, no fonts, no backend, no accounts, no trackers. The island is drawn with the Canvas 2D API, and the ocean, lo-fi chords, and sound effects are synthesized with the Web Audio API.

```
index.html   ← the entire game (≈300 KB, markup + CSS + renderer + audio + logic)
```

## Backstory

The ads came with the tide.

Nobody on the island remembers the exact morning it happened. One day the shoreline was just shoreline, and the next there were pop-ups half-buried in the sand, banners strung between the palms like festival bunting, and one unskippable video ad that has been loading since before anyone can remember. It plays a little further every year.

The locals did not leave. They put the kettle on, swept what they could with brooms and umbrellas, and kept the plaza lit. They got very good at living around the clutter — stepping over it, apologising to it, naming the worst banners after people they disliked. But the static kept creeping inland, and somewhere past the treeline something big started running ad breaks on a schedule.

You wash ashore with a broom, a class, and nowhere else to be. The islanders saved you a spot by the fire and a patch of sand to clean. That is the whole job: push the static back, keep the plaza kind, and leave a note on the bench for whoever washes ashore next.

It is not a sad story. The ocean is still warm, the kettle still works, and the ads are, in the end, only made of paper.

## How to play

**1. Wash ashore.** Pick a class on the title screen — AdBlocker (shield and slam, tough), Fact-Checker (darts and healing), or Reader-Mode (piercing beams, fast and fragile) — type a name, and press **wash ashore**. Your class can be changed later from the pause menu.

**2. Move and aim.** `WASD` to walk, mouse to aim, `J` or click to attack. On a phone, the left thumb stick moves you and points your aim, and the big **BONK** button attacks. Dashes are `Space` or the dash button. Attacks snap to the ad nearest your aim line, so you never have to pixel-hunt.

**3. Clean the static.** Purple static sits on the ground across the island. Walking over it scrubs a little; hitting it with your weapon clears it much faster and pays **Joy** and **XP**. Joy is spent on permanent upgrades (`U`) — damage, health, speed, cleanse radius, and cozy cosmetics.

**4. Survive the waves.** Ads arrive in fixed waves that climb from **Super Easy** to **Super Hard+**. Each wave clears with bonus Joy and XP, then the island takes a four-second breath. Watch the card under your portrait for the wave number, tier, and how many ads are left.

**5. Wake the Algorithm.** When the island is about 64% clear, the boss wakes at the plaza and starts running ad breaks. Dodge the sponsored beams, break its health thresholds, and finish the fight. Waves pause while it is out.

**6. Be a neighbour.** Locals roam, fight beside you, and chat. At the cozy bench (`F`), sit down and pin a note to the kindness wall — it is saved in your browser and read by whoever visits next, including you on a bad day.

**7. Bring a friend (optional).** Choose **play with a friend** on the title screen for same-keyboard co-op: player 2 moves on the arrow keys and attacks automatically, shares Joy and waves, and is a real hero that ads will target.

There is no fail state that erases progress, no timer, and no score to chase. Play for ten minutes or an hour. Progress, notes, and settings save automatically in `localStorage`.

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
| Move | `WASD` (arrows drive player 2 in co-op) | left thumb stick |
| Aim | mouse cursor — free aim, even while walking, and device detection cannot get in the way | aims where the stick points |
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

Attacks snap onto the ad closest to your aim line, so you rarely have to pixel-hunt — especially on a phone, where the stick direction is the aim. The AdBlocker's auto-sword never changes the direction you aimed: it swings in its own forward arc.

### Player 2 (same keyboard)

Turn on **play with a friend** on the title screen.

| Action | Player 2 |
| --- | --- |
| Move | arrow keys |
| Attack | automatic, at whatever they face |
| Everything else | automatic (regen, knockback, shared Joy and waves) |

The camera frames both heroes and gently leashes player 2 to within one screen of player 1. The partner is a real hero: ads target and damage them, the Fact-Checker variant marks ads, and they count for wave clears.

## Waves

Ads arrive in waves instead of trickling in at random. Each wave has a fixed crew, and the tiers climb:

| Waves | Tier | Feel |
| --- | --- | --- |
| 1–2 | Super Easy | a handful of slow pop-ups with paper-thin health |
| 3–4 | Easy | banners and mimics join in |
| 5–6 | Normal | more of everything, and they hit harder |
| 7–8 | Hard | behemoths, faster ads, bigger crews |
| 9–10 | Super Hard | 11–12 ads at a time, roughly double health |
| 11+ | Super Hard+ | keeps scaling; the label stops being polite |

Clearing a wave pays bonus Joy and XP, then the island takes a 4–5 second breath. The wave banner announces each new tier, the HUD card under your portrait shows the wave, its difficulty and how many ads are left, and the locals comment in chat. The Algorithm still interrupts the schedule when the island is clear enough to wake it; waves pause until that fight is over.

## Classes

| Class | Role | Weapon & look | Signature |
| --- | --- | --- | --- |
| **AdBlocker** | shield & slam | plumed helm, kite shield, arming sword | Wide shield bash; auto-swings the sword at anything within arm's reach; takes 15% less damage. |
| **Fact-Checker** | heal & mark | hood, magnifier staff, satchel | Citation darts mark ads and heal nearby locals; regenerates 1.6 HP/s. |
| **Reader-Mode** | ranged beams | wizard hat, floating tome, quill wand | Piercing text beams hit every ad in a row; 8% faster, a little fragile. |

Gear picks up gold trim from level 3 and a soft glow from level 6. Every hero and local rolls their own skin, hair, and level.

## What is on the island

- **Wave combat:** escalating crews from Super Easy to Super Hard+, with on-screen wave banners and a HUD tracker.
- **Four ad-monsters plus a boss:** Pop-Up Imps spawn clickable `[X]` windows, Unskippable Behemoths are invulnerable until their SKIP window, Clickbait Mimics hide as free Joy, and Banner Bats throw flyers. The Algorithm runs ad breaks, sponsored beam attacks, and summons more content at health thresholds.
- **Joy and clarity:** every fully cleansed tile pays Joy and experience. Spend Joy on permanent upgrades or cozy cosmetics.
- **Same-keyboard co-op:** a second hero on the arrow keys, sharing one screen and one wave.
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

## Patch notes

The full history lives in **[CHANGELOG.md](CHANGELOG.md)**, newest first, and the version on the title card always matches its top entry.

| Version | Date | Headline |
| --- | --- | --- |
| [1.4.3](CHANGELOG.md#143--2026-10-29) | 2026-10-29 | Backstory and credits in the help panel, documented README |
| [1.4.2](CHANGELOG.md#142--2026-10-29) | 2026-10-29 | Compact phone class picker; all three classes on one screen |
| [1.4.1](CHANGELOG.md#141--2026-10-29) | 2026-10-29 | Touch controls and HUD scaled to fit phones |
| [1.4.0](CHANGELOG.md#140--2026-10-29) | 2026-10-29 | Escalating waves, wave HUD, same-keyboard co-op |
| [1.3.2](CHANGELOG.md#132--2026-10-29) | 2026-10-29 | Aim follows the player; chibi hero renderer |
| [1.3.1](CHANGELOG.md#131--2026-10-29) | 2026-10-29 | Kindness wall and bench sitting |
| [1.3.0](CHANGELOG.md#130--2026-10-29) | 2026-10-29 | The Algorithm boss fight |
| [1.2.0](CHANGELOG.md#120--2026-10-29) | 2026-10-29 | Upgrade shop, cosmetics, save data |
| [1.1.0](CHANGELOG.md#110--2026-10-29) | 2026-10-29 | Procedural audio, settings, accessibility toggles |
| [1.0.0](CHANGELOG.md#100--2026-10-29) | 2026-10-29 | First build: the island, three classes, static cleansing |

## Disclaimer

AdBlock Island is **my own original work** — written, drawn, composed and play-tested by me, [@potaterrr](https://github.com/potaterrr), as a solo project. Every part of it is hand-written: the Canvas 2D renderer, the character art (drawn procedurally in code, no image files), the Web Audio soundtrack and sound effects, the UI, and the writing.

- **No third-party assets.** No images, sprites, fonts, audio files, libraries, frameworks, CDNs or tracking scripts are used. The single `index.html` is the whole thing.
- **No affiliation.** It is a work of parody and a small non-commercial joke about ad fatigue. It is not affiliated with, endorsed by, or connected to any ad blocker, browser, advertiser, or platform. All ads, brands, and characters in it are fictional.
- **No data collection.** Nothing is uploaded. Progress, notes, and settings are stored only in your browser's `localStorage` and clearing site data removes them.
- **Licence.** The source is public so it can be read and learned from; please don't republish it as your own. If you want to reuse a piece of it, ask first.

© 2026 potaterrr. Thanks for washing ashore.
