# AdBlock Island

**v0.9.4 · Boss split ladder** · [Play it](https://potaterrr.github.io/adblock-island/) · [Patch notes](https://potaterrr.github.io/projects/adblock-island/#patch-notes)

A wholesome micro-MMO in a single HTML file, currently in **beta**. The ads took the beach, the locals kept the kettle on. Pick a class, sweep the static, bonk the ad-monsters, and leave a kind note for whoever washes ashore next.

Everything is self-contained: no build step, no CDN, no images, no fonts, no backend, no accounts, no trackers. The island is drawn with the Canvas 2D API, and the ocean, lo-fi chords, and sound effects are synthesized with the Web Audio API.

```
index.html   ← the entire game (≈420 KB, markup + CSS + renderer + audio + logic)
```

## Status: beta

**v0.9.4 is a beta.** The island is playable end to end — nine classes, two companions, the wave ladder, Endless mode with checkpoints, medals, items, the Algorithm, the south-shore dock, a Halloween theme, kindness notes and same-keyboard co-op — but it is not a finished MMORPG. Mania rules are live: death resets the run, and the Algorithm is no longer guaranteed to arrive alone.

Versions count from zero while the game is in beta, so every release is `0.x`; the title card's build tag and the top entry of the patch notes always agree.

Storage keys: `adblock-island.save.v0`, `adblock-island.notes.v0` and `adblock-island.settings.v0`. They are schema tags rather than versions, and they live in `localStorage` only.

Still pending, in short:

- **Achievements.** Medals now cover waves, each class, co-op, the Algorithm boss, spending, cleanup and Endless milestones, with a gallery and unlock toasts in the pause screen. Dated unlock history and account-wide persistence are still to come.
- **Cool items.** Waves give seven small items that are mostly free upgrade ranks. A real inventory, cosmetic drops with an equip screen, rarity tiers and usable items are still to come.
- **MMORPG essentials.** Online multiplayer and rooms, accounts and cross-device saves, moderated chat, parties and guilds, quests and raids, trading, anti-cheat and live ops. These need a backend; a static `index.html` on GitHub Pages cannot provide them. The next planned step is **4-player room-code co-op**: Vercel hosts the game and a tiny signaling API, a free Redis store holds room codes and WebRTC handshakes, and one player hosts the authoritative simulation. It is deliberately not shipped yet.

The full, honest list lives in **[Still pending](CHANGELOG.md#still-pending)** at the top of the patch notes.

## What's new in v0.9.4 — Boss split ladder

A short version of the [patch notes](CHANGELOG.md):

- **Split ladder.** A boss splits at **75% HP** into two smaller bosses; each child can split once again at 75%, so **1 → 2 → 4**. Split bosses shrink to 82%, then 67%.
- **Speed tiers.** One boss is normal, two bosses are **+25%** faster, and three or four are **+50%** faster in movement and attack tempo.
- **RNG bosses.** Beams are 1–2 random casts with random spread, length and wind-up; summons roll random counts, types and positions, with behemoths as a rare roll.
- **Boss fights get their own budget.** While any boss is alive the canvas drops to 1.1× desktop / 1.0× touch, then restores after the last one dies. Multi-boss fights draw fewer ornaments, cache the sponsored cards and boss-bar gradient, and cap nameplates.
- **Boss adds are capped.** Multi-boss fights keep at most 8 live adds, use quieter summon particles, and fire 6-projectile volleys instead of 9. Single-boss fights keep the original numbers.
- **Smoother canvas.** 1.5× DPR cap on desktop and 1.25× on touch, a 60 fps render ceiling, cached gradients and Halloween layers, a cached minimap terrain pass, and a lighter water animation. Touch devices draw fewer overlay effects.
- **Four-boss Mania.** The Algorithm pair chance is still **50%**, and the **Settings → Four-boss Mania** option lets split children split once more at **75% HP**, up to four live. Turn it off to stop the ladder at two.
- **Readable Halloween theme.** Warm parchment surfaces, dark ink, pumpkin-orange accents and a violet-to-peach title sky. Wave banners now use solid paper backing with high-contrast labels, kickers and notes.
- **Two new classes.** **Archivist / support** marks ads and patches the party; **Moderator / crowd control** stuns, knocks back and shuts down crowds. Both have procedural Canvas portraits, distinct silhouettes, their own gear, projectiles, hit effects, HUD icons, class cards and wave-5 medals.
- **The dock is real.** The south shore has a pier, crates, a lantern, a bobbing boat and **Mira** the shopkeeper with her stall and an `F` prompt. The panel is honest: shop, travel and dock quests are the next expansion.
- **Halloween theme.** Default-on, with a Settings toggle: warm autumn dusk, a pumpkin moon, fog, bats, jack-o'-lanterns and a **HALLOWEEN** badge on the title screen. All text stays dark-on-parchment for readability.
- **Companions, no healer.** The two companions are drawn from AdBlocker, Reader-Mode, Archivist and Moderator, and an AI companion never heals the real player. Fact-Checker and Medic are player-only.
- **Mania still applies.** Death resets the run, the boss can arrive as a pair, and bosses split at 75% into the 1 → 2 → 4 ladder.
- **Release zip.** `adblock-island-beta-v0.9.4.zip` is a self-contained build of this single file plus these docs. It runs from `file://`, from GitHub Pages, or from any static host — no CDN, no backend, no network calls.

## Download

**[Download v0.9.4](https://github.com/potaterrr/adblock-island/releases/tag/v0.9.4)** (`adblock-island-beta-v0.9.4.zip`, also at the repo root). It is rebuilt from `index.html`, `README.md` and `CHANGELOG.md`. Unzip it, open `index.html`, and it plays — online or offline.

One honest caveat: **co-op is local, not networked.** "Play with a friend" puts player two on the same keyboard (arrow keys) on the same screen. A single static HTML file cannot do online matchmaking, peer-to-peer play or accounts on its own, so the zip is a complete single-player/co-op game, not an online multiplayer client. The next planned step is **4-player room-code online co-op** — Vercel static hosting plus a tiny signaling API and host-authoritative WebRTC — and the patch notes keep that roadmap honest.

## Screenshots

| The title screen | A wave cleared |
| --- | --- |
| ![AdBlock Island title screen with the beta badge](screenshots/title.png) | ![The wave-cleared card showing an achievement and the next wave preview](screenshots/wave-card.png) |

<p align="center">
  <img src="screenshots/phone.png" width="280" alt="AdBlock Island's title screen on a phone">
</p>

## Backstory

The ads came with the tide.

Nobody on the island remembers the exact morning it happened. One day the shoreline was just shoreline, and the next there were pop-ups half-buried in the sand, banners strung between the palms like festival bunting, and one unskippable video ad that has been loading since before anyone can remember. It plays a little further every year.

The locals did not leave. They put the kettle on, swept what they could with brooms and umbrellas, and kept the plaza lit. They got very good at living around the clutter — stepping over it, apologising to it, naming the worst banners after people they disliked. But the static kept creeping inland, and somewhere past the treeline something big started running ad breaks on a schedule.

You wash ashore with a broom, a class, and nowhere else to be. The islanders saved you a spot by the fire and a patch of sand to clean. That is the whole job: push the static back, keep the plaza kind, and leave a note on the bench for whoever washes ashore next.

It is not a sad story. The ocean is still warm, the kettle still works, and the ads are, in the end, only made of paper.

## How to play

**1. Wash ashore.** Pick a class on the title screen — AdBlocker (shield and slam, tough), Fact-Checker (darts and healing), Reader-Mode (piercing beams, fast and fragile), Engineer (turrets and overclock), Medic (heals and shields), Hacker (exploits and marks), Streamer (wide hype bursts), Archivist (marks and party support), or Moderator (stuns and knockback) — type a name, and press **wash ashore**. Your class can be changed later from the pause menu.

**2. Move and aim.** `WASD` to walk, mouse to aim, `J` or click to attack. On a phone, the left thumb stick moves you and points your aim, and the big **BONK** button attacks. Dashes are `Space` or the dash button. Attacks snap to the ad nearest your aim line, so you never have to pixel-hunt.

**3. Clean the static.** Purple static sits on the ground across the island. Walking over it scrubs a little; hitting it with your weapon clears it much faster and pays **Joy** and **XP**. Joy is spent on upgrades (`U`) — damage, health, speed, cleanse radius, and cozy cosmetics.

**4. Survive the waves.** Every run starts at **Super Easy** and climbs only when you say so. Clear a wave and choose **Upgrade** or **Next wave**; the next wave is always available, and the shop never starts it early. **Next wave** gives you a **10-second countdown** to take a breath or change your mind. Each clear pays bonus Joy and XP and hands you a **medal or a free item**, plus the next chapter of the island's story. Watch the card under your portrait for the wave, the tier, what's left, and (in Endless) the enemy damage pressure.

**5. Reach Super Hard, then Endless.** Wave 10 is the last of the campaign ladder: clear it and the island stops serving ads for good. If you want more, wave 11 opens **Endless mode**: no final wave, enemy damage climbs with depth, and every third wave is a **checkpoint** that pauses the island, pays you Joy (80, 100, 120…), and offers an optional upgrade. Continue is always available. In **Mania**, dying resets the run to wave 1; medals and notes survive, run progress does not.

**6. Wake the Algorithm.** When the island is about 64% clear, the boss wakes at the plaza and starts running ad breaks. Dodge the sponsored beams, break its health thresholds, and finish the fight. In **Mania**, there is a 50% chance it arrives as a pair. At **75% health** a boss is consumed and splits into **two smaller bosses**; each child can split once more at 75%, so one boss becomes **two, then four**. Two live bosses move and attack **25% faster**; three or four move and attack **50% faster**. Beams and summons are randomised. **Four-boss Mania** (Settings, on by default) allows the second-generation split; turn it off to stop at two. Waves pause while bosses are out.

**7. Be a neighbour.** Two companions are already here: they cleanse, chip ads, mark or stun, and chat, and they can be knocked out and carried back to the bench. They never heal the real player — the healer kits belong to the player alone. At the cozy bench (`F`), sit down and pin a note to the kindness wall — it is saved in your browser and read by whoever visits next, including you on a bad day.

**8. Bring a friend (optional).** Choose **play with a friend** on the title screen for same-keyboard co-op: player 2 moves on the arrow keys and attacks automatically, shares Joy and waves, and is a real hero that ads will target.

There is no timer and no score to chase. Play for ten minutes or an hour. In Mania, death resets the run to wave 1. Run progress also resets each visit; medals, notes, settings and lifetime bests save automatically in `localStorage`.

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
| Upgrades | `U` | pause → Upgrades |
| Chat | `C` | chat tool |
| Wave choice | `N` (when a wave is cleared) | tap the wave card |
| Next wave / upgrade | `Enter` takes the next wave, `U` opens the shop while the cleared card is open | tap the buttons in the card |
| Help | `H` | pause → How to play |
| Settings | — | pause → Settings |
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

| Waves | Tier | Crew |
| --- | --- | --- |
| 1–2 | Super Easy | four pop-ups, then three pop-ups and two banners |
| 3–4 | Easy | six ads a wave; the first Clickbait Mimic arrives at wave 4 |
| 5–6 | Normal | eight and nine ads, more mimics, flyers coming faster |
| 7–8 | Hard | nine and eleven ads; behemoths from wave 7, two of them at wave 8 |
| 9–10 | Super Hard | thirteen and fourteen ads, three behemoths, damage ×1.36 and ×1.45 |
| 11+ | Endless | the same shape, growing a fixed amount each wave up to twenty ads, with enemy damage pressure rising every wave |

Every stage is a fixed recipe (`STAGE_CREWS` in the source), so the preview on the cleared-wave card always matches what actually spawns. The card under your portrait names what is left standing — `2 pop-ups · 1 behemoth` — instead of only counting it.

### Upgrade or move on

Clearing a wave never rolls straight into the next one. The island stops and asks, with a card showing the wave you just cleared, the chapter of the island log you unlocked, the reward you earned, and a preview of what's coming:

- **Upgrade** opens the shop. Buying things never starts the next wave — you can sit there as long as you like.
- **The next wave is always available.** Upgrading is optional; the card never replaces **Next wave** with a purchase requirement. Open the shop if you want, or start the countdown immediately.
- **Next wave** starts a **10-second countdown** (shown on the card under your portrait). Open the shop during it and the countdown politely pauses until you close it. Press `N` or tap the wave card to reopen the choice if you closed it.

**Every clear hands you something.** Milestone waves give a medal; the rest give a free item — a spare broom, a wool blanket, a jar of joy, a kettle break — which is a free upgrade rank, a heal, or Joy.

| Medal | Earned at |
| --- | --- |
| First Sweep | clear wave 1 |
| Polite Static | reach Easy (wave 3) |
| They Brought Friends | reach Normal (wave 5) |
| Banner Bane | reach Hard (wave 7) |
| Hold the Line | reach Super Hard (wave 9) |
| Island Saved | clear Super Hard (wave 10) |

Medals and found items live in the pause screen (`Esc`), and carry over between visits. Joy, upgrades, level and island progress reset every run.

### The end of the ladder

Wave 10 is **Super Hard**. Clear it and the island tells you plainly: *you saved this island from serving ads*. The kettle is on, the plaza is quiet, and the story reaches its last chapter. Stay for the sunset, or step into **Endless mode**.

### Endless mode

Wave 11 begins **Endless**. The ads come back, and they hit harder every wave: enemy damage gains a pressure multiplier that starts at ×1.5 on wave 11, reaches ×2.4 by wave 20, and caps at ×2.6 after that. A hero who never buys **Deep Breaths** will not last; the same wave is survivable with vitality ranks and a little care.

Every third endless wave — 11, 14, 17, 20… — is a **checkpoint**:

- The island pauses and pays a checkpoint bundle: **80, 100, 120… Joy** (`60 + 20 × checkpoint`).
- The upgrade shop opens. Buying is optional; **Continue** is always enabled.
- Press `U` to shop, then **Continue** to start the next wave. **Step away** lets you leave the checkpoint and wander; the wave card brings the checkpoint back.

Dying in Endless is a Mania reset: the run returns to wave 1, and Joy, upgrades, level, boss progress and island corruption start over. Your deepest wave is still saved on the pause screen.

Endless medals: **Beyond the Ladder** (enter Endless), **Tea Break** (first checkpoint), **Deep Static** (wave 20), **Kettle On** (five checkpoints), **Ad Infinitum** (wave 30).

The Algorithm still interrupts the schedule when the island is clear enough to wake it; waves pause until that fight is over. The wave banner announces each new tier, the card under your portrait tracks the wave, its difficulty and what's left, and your companions comment in chat.

## Classes

| Class | Role | Weapon & look | Signature |
| --- | --- | --- | --- |
| **AdBlocker** | shield & slam | plumed helm, kite shield, arming sword | Wide shield bash; auto-swings the sword at anything within arm's reach; takes 15% less damage. |
| **Fact-Checker** | heal & mark | hood, magnifier staff, satchel | Citation darts mark ads and heal nearby companions; regenerates 1.6 HP/s. |
| **Reader-Mode** | ranged beams | wizard hat, floating tome, quill wand | Piercing text beams hit every ad in a row; 8% faster, a little fragile. |
| **Engineer** | turrets & overclock | hard hat, wrench, tool belt | Throws heavy wrench bolts, drops auto-firing turrets, and overclocks for a burst of speed and damage. |
| **Medic** | heal & support | cross cap, syringe staff, tabard | Syringe darts patch you on impact, First Aid heals the plaza, and Code Blue adds a shield. Regenerates 2.2 HP/s. |
| **Hacker** | debuff & exploit | hood, visor, handheld terminal | Exploit bolts pierce and mark ads for extra damage; Lag Switch and Zero-Day hit and mark crowds. |
| **Streamer** | AoE hype | headset, mic boom, stage vest | Hype shards pierce crowds, Hype Train dashes through a cone, and Raid bursts everything around you. |
| **Archivist** | support & mark | flat cap, spectacles, stamp staff, apron | Index Darts mark and pierce; Cross-Reference marks and stuns a cone; Public Record heals, shields, marks a ring and cleanses. |
| **Moderator** | crowd control | visor, headset, gavel, dark vest | Ban Hammer knocks and stuns; Lock Thread roots a crowd; Mass Ban is a wide knockback/stun/damage shockwave. Takes 10% less damage. |

Each class has its own power multiplier on every hit: AdBlocker 1.00, Fact-Checker 0.92, Reader-Mode 1.16, Engineer 1.05, Medic 0.85, Hacker 0.90, Streamer 1.20, Archivist 0.90, Moderator 0.95.

Gear picks up gold trim from level 3 and a soft glow from level 6. Every hero and local rolls their own skin, hair, and level.

## Your companions

The island is you plus two companions drawn from **AdBlocker, Reader-Mode, Archivist and Moderator**. They roam, cleanse static, chip ads, mark or stun, and chat in the local log. They are support, not a solution: their damage is exactly **10% of yours**, their chip damage on the Algorithm is capped at two helpers, and a kill is the party's kill so nobody steals your reward.

There is no AI healer. Fact-Checker and Medic remain player-only classes, so a companion can never patch the real player for you.

They can be knocked out. A downed companion sits out 14 seconds and walks back from the bench at 60% health, and the HUD chips show the timer. Keep them standing and they keep the plaza lit.

## What is on the island

- **Wave combat:** escalating crews from Super Easy through Super Hard, then Endless mode with checkpoint pauses, optional upgrades, rising enemy damage pressure, and on-screen wave banners plus a HUD tracker.
- **Four ad-monsters plus a boss:** Pop-Up Imps spawn clickable `[X]` windows, Unskippable Behemoths are invulnerable until their SKIP window, Clickbait Mimics hide as free Joy, and Banner Bats throw flyers. The Algorithm runs ad breaks, sponsored beam attacks, and summons more content at health thresholds. In Mania it has a 50% chance to arrive as a pair, and bosses split at 75% into two smaller bosses; children can split once more into four. Two bosses move and attack 25% faster; four are 50% faster. Beams and summons are randomised.
- **Joy and clarity:** every fully cleansed tile pays Joy and experience. Spend Joy on upgrades or cozy cosmetics.
- **Same-keyboard co-op:** a second hero on the arrow keys, sharing one screen and one wave.
- **A party of three:** two companions fight beside you, cleanse, mark or stun, chat, and can be knocked out and revive at the bench. They never heal you.
- **The dock:** a south-shore pier, a bobbing boat and Mira's stall, with an `F` prompt and a minimap marker.
- **Halloween theme:** default-on autumn-dusk palette with readable parchment surfaces, pumpkin moon, fog, bats, jack-o'-lanterns and a title-screen badge, toggleable in Settings.
- **Four-boss Mania:** a Settings option (on by default) that lets split children split once more at 75% HP, up to four live Algorithms; the pair chance is 50%.
- **The kindness wall:** sit at the cozy bench and pin a note for the next person. Notes are saved locally and read by the locals.
- **Procedural sound:** generated ocean noise, a slow lo-fi chord progression, UI sounds, combat hits, cleansing sparkles, and a boss track that shifts when the fight starts.
- **Retro-pastel UI:** responsive HUD, minimap, floating damage numbers, speech bubbles, screen shake, particles, scanlines (toggleable), and a reduced-motion option.
- **Persistence:** medals, notes, settings, cosmetics and lifetime bests live in `localStorage`; run progress resets every visit.

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

- `adblock-island.save.v0` — name, class, medals, collected items, cosmetics, lifetime stats and bests. Joy, upgrades, level, XP, boss progress and island corruption are intentionally **not** saved.
- `adblock-island.notes.v0` — the local kindness wall
- `adblock-island.settings.v0` — volume, mute, scanlines, particles, numbers, reduced motion, Halloween theme, Four-boss Mania

Clearing site data removes medals, notes, settings and bests. Run progress is never saved. Nothing is sent anywhere.

## Project layout

```
adblock-island/
├── index.html                      # the whole game: markup, styles, canvas renderer, audio, logic
├── CHANGELOG.md                    # version history and patch notes
├── README.md
├── adblock-island-beta-v0.9.4.zip  # self-contained release build
└── .nojekyll                       # keep GitHub Pages from running Jekyll
```

## Performance notes

The renderer targets 60 fps on phones and a calm 30–60 fps on desktop. It is a single canvas with a y-sorted scene, a cached minimap, and throttled floating text. If a machine struggles, the settings panel can turn off particles, screen shake, scanlines, and damage numbers.

On a touch screen the HUD is deliberately thinner than the desktop one: a compact top bar with a level chip instead of an XP bar, a two-line wave card whose second line carries the crew, a clarity ring with no caption, and mute, chat and pause as the only tool buttons (help and settings live in the pause panel). Wave banners shrink to a short pill, the toast tray keeps two messages, and no more than two pop-up windows are open at once. Using a mouse brings the full desktop layout back instantly.

## Patch notes

The full history lives in the **[live patch notes](https://potaterrr.github.io/projects/adblock-island/#patch-notes)** (source: [CHANGELOG.md](CHANGELOG.md)), newest first, and the version on the title card always matches its top entry. **0.9.4** is the boss split ladder: 75% HP splits, 1 → 2 → 4, smaller children, +25%/+50% speed tiers and randomised beams and summons. **0.9.3** is the boss-fight hotfix: lower resolution while bosses are live, fewer ornaments and adds in multi-boss fights, and cached card/bar art. **0.9.2** is the performance pass — 1.5× desktop / 1.25× touch DPR caps, a 60 fps render ceiling, cached gradients, Halloween overlay and minimap terrain — plus 50% boss pairs and the Four-boss Mania option. **0.9.1** is a readability pass on the Halloween theme, with high-contrast wave banners. **0.9.0** adds the Archivist and Moderator classes, the south-shore dock and the Halloween theme. **0.8.0 Mania** is the hard-mode release: death resets the run, the boss can arrive as a pair, and bosses split below 50% health. **0.7.0** is the Endless mode patch: checkpoints, optional upgrades, the damage curve and five new endless medals. If you have played before, **0.6.0** is the balance pass — the two heroes whose classes you did not pick became your party, the ladder became a table of fixed crews, and class power finally applies to every hit — and **0.6.1** is the phone HUD diet, which folds the top of the screen into one quiet bar.

| Version | Date | Headline |
| --- | --- | --- |
| [0.9.4](CHANGELOG.md#094--boss-split-ladder-2026-11-04) | 2026-11-04 | 75% HP split ladder 1→2→4, smaller children, +25%/+50% speed tiers, RNG beams and summons |
| [0.9.3](CHANGELOG.md#093--boss-fight-performance-2026-11-04) | 2026-11-04 | Boss-fight resolution budget, capped adds, fewer ornaments and projectiles with multiple bosses |
| [0.9.2](CHANGELOG.md#092--performance--four-boss-mania-2026-11-04) | 2026-11-04 | 1.5×/1.25× DPR caps, 60 fps render ceiling, cached canvas layers and minimap, 50% boss pairs, Four-boss Mania |
| [0.9.1](CHANGELOG.md#091--halloween-readability-2026-11-04) | 2026-11-04 | Readable autumn-dusk Halloween palette, high-contrast wave banners |
| [0.9.0](CHANGELOG.md#090--archivist-moderator--the-dock-2026-11-04) | 2026-11-04 | Archivist and Moderator classes, the south-shore dock, Halloween theme, no AI healer |
| [0.8.0](CHANGELOG.md#080--mania-2026-11-04) | 2026-11-04 | Mania: death resets the run, 40% double bosses, splitting bosses |
| [0.7.0](CHANGELOG.md#070--2026-11-04) | 2026-11-04 | Endless mode, checkpoints, optional upgrades, run-only progression and a damage curve that punishes no-upgrade runs |
| [0.6.7](CHANGELOG.md#067--2026-11-02) | 2026-11-02 | Class identity pass: unique silhouettes, held gear and real projectiles for every class |
| [0.6.6](CHANGELOG.md#066--2026-11-02) | 2026-11-02 | Achievements + toasts + medal gallery, four new classes, PATCH NOTES button |
| [0.6.5](CHANGELOG.md#065--2026-11-02) | 2026-11-02 | Class-specific projectile visuals |
| [0.6.4](CHANGELOG.md#064--2026-11-02) | 2026-11-02 | Unique class icons (turret, syringe, terminal, broadcast) |
| [0.6.3](CHANGELOG.md#063--2026-11-02) | 2026-11-02 | Four new classes: Engineer, Medic, Hacker, Streamer |
| [0.6.2](CHANGELOG.md#062--2026-11-02) | 2026-11-02 | Engineer class, seven new medals, unlock toasts, medal gallery |
| [0.6.1](CHANGELOG.md#061--2026-10-30) | 2026-10-30 | Quieter phone HUD: one top bar, three tool buttons, calmer banners, toasts and pop-ups |
| [0.6.0](CHANGELOG.md#060--2026-10-30) | 2026-10-30 | Balance pass: two companions replace the locals, harder stage ladder, live class power |
| [0.5.4](CHANGELOG.md#054--2026-10-29) | 2026-10-29 | Beta launch polish: social card, richer previews, screenshots |
| [0.5.3](CHANGELOG.md#053--2026-10-29) | 2026-10-29 | Enter takes the next wave; U opens upgrades from the cleared card |
| [0.5.2](CHANGELOG.md#052--2026-10-29) | 2026-10-29 | Waves keep running after the island victory; clear popup can no longer be lost |
| [0.5.1](CHANGELOG.md#051--2026-10-29) | 2026-10-29 | Beta label and version on the splash screen; "Still pending" notes |
| [0.5.0](CHANGELOG.md#050--2026-10-29) | 2026-10-29 | Upgrade-or-next-wave choice, 10s countdown, medals, items, story chapters |
| [0.4.3](CHANGELOG.md#043--2026-10-29) | 2026-10-29 | Backstory and credits in the help panel, documented README |
| [0.4.2](CHANGELOG.md#042--2026-10-29) | 2026-10-29 | Compact phone class picker; all three classes on one screen |
| [0.4.1](CHANGELOG.md#041--2026-10-29) | 2026-10-29 | Touch controls and HUD scaled to fit phones |
| [0.4.0](CHANGELOG.md#040--2026-10-29) | 2026-10-29 | Escalating waves, wave HUD, same-keyboard co-op |
| [0.3.2](CHANGELOG.md#032--2026-10-29) | 2026-10-29 | Aim follows the player; chibi hero renderer |
| [0.3.1](CHANGELOG.md#031--2026-10-29) | 2026-10-29 | Kindness wall and bench sitting |
| [0.3.0](CHANGELOG.md#030--2026-10-29) | 2026-10-29 | The Algorithm boss fight |
| [0.2.0](CHANGELOG.md#020--2026-10-29) | 2026-10-29 | Upgrade shop, cosmetics, save data |
| [0.1.0](CHANGELOG.md#010--2026-10-29) | 2026-10-29 | Procedural audio, settings, accessibility toggles |
| [0.0.0](CHANGELOG.md#000--2026-10-29) | 2026-10-29 | First build: the island, three classes, static cleansing |

## Disclaimer

AdBlock Island is **my own original work** — written, drawn, composed and play-tested by me, [@potaterrr](https://github.com/potaterrr), as a solo project. Every part of it is hand-written: the Canvas 2D renderer, the character art (drawn procedurally in code, no image files), the Web Audio soundtrack and sound effects, the UI, and the writing.

- **No third-party assets.** No images, sprites, fonts, audio files, libraries, frameworks, CDNs or tracking scripts are used. The single `index.html` is the whole thing.
- **No affiliation.** It is a work of parody and a small non-commercial joke about ad fatigue. It is not affiliated with, endorsed by, or connected to any ad blocker, browser, advertiser, or platform. All ads, brands, and characters in it are fictional.
- **No data collection.** Nothing is uploaded. Medals, notes, settings, cosmetics and lifetime bests are stored only in your browser's `localStorage`; run progress is not saved. Clearing site data removes the saved meta.
- **Licence.** The source is public so it can be read and learned from; please don't republish it as your own. If you want to reuse a piece of it, ask first.

© 2026 potaterrr. Thanks for washing ashore.
