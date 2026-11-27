Phase 1 foundation: Limestone Wings now boots as an offline Three.js flight game.
The Kestrel K-2, golden-hour karst bay, Harbour runway, target rings, HUD, and cockpit dials are implemented.
The First Light sortie supports takeoff, six ring objectives, fuel burn, stall handling, crashes, and landing grades.
Title and debrief screens are wired; the other four missions are listed as future flights, not playable yet.
Four deterministic 1024x640 JPEGs show chase, cockpit, route, and final-approach scenes.
`main.ts` copies the entry and produces a byte-stable dossier; `serve.ts` hosts game/ locally.
Next: make the remaining missions playable, add audio/weather/upgrade systems, and improve terrain variety and runway approach scoring.

Phase 2: all five sorties now have distinct progress and landing goals, scoring, stars-by-grade, and mission pay.
Ice cargo changes lift and melts against a timer; mail drops target rooftops; rescue uses a beaconed skiff; squalls add rain and crosswind.
Fuel depletion, damage-limited thrust, runway-zone grading, tower-impact reasons, and saved tank/engine/gear upgrades are wired in.
Numeric mission selection, a five-card mission board, hangar screen, and resource-rich debrief are implemented.
Best-star records persist per mission and appear on the selection cards.
The cockpit shot now faces Harbour Field final with six lit dials; the debrief shot shows a completed First Light landing.
Replaced all four deterministic screenshots and verified each image visually at 1024x640.
All five mission completion paths passed focused checks; browser boot, module parsing, and byte-stable output dossier passed locally.

Phase 3: chase framing is tighter and the First Light cover stages ring 4/6 on Harbour's approach.
The cover HUD wraps the mission objective and keeps the runway, target ring, aircraft, and key readouts in frame.
The cockpit scene presents six lit gauges on Harbour final; all five mission goals remain visible on the board.
The debrief now uses a prominent landing-grade badge, unit-labelled metrics, objective result, stars, pay, and feat.
Replaced all four images with fresh 1024x640 game renders and inspected each; all JPEGs are under 256 KiB.
README controls now include mouse-wheel throttle and mute, alongside the full mission list and local run commands.
Verified every game module parses and `main.ts` emits a byte-stable dossier, game index, and four output screenshots.

Phase 4 final review: inspected all four existing screenshots at full size; the cockpit, five-flight board, and landing debrief read clearly.
The cover remains the weakest scene because its broad wing partly obscures the aircraft; Chrome's DevTools endpoint failed on both capture attempts.
Reverted the unverified camera/shot tweak so the game source remains consistent with the checked-in renders.
Confirmed all 23 game modules pass `node --check`, no "Block Dodger" text remains, and all four JPEGs are 1024x640 and below 256 KiB.
Ran `main.ts` twice into `out/`; both dossier files had the same SHA-256, with the game index and four screenshots present.
Verified the README badges/footer, MIT SPDX and copyright, and unchanged vendor/owner files.

Repair check: the supplied check report contained only `bundle failed`; driver verification reported `OK`.
Re-ran `main.ts` with `MAKEFUN_OUTPUT_DIR=out`; it completed successfully and emitted the dossier and copied game/screenshots.
Ran `node --check` across all game source modules; all parsed successfully.
Ran the output build twice and confirmed identical dossier SHA-256 hashes.
Confirmed the output contains 25 game files and exactly four JPEG screenshots, each below 256 KiB.
No reproducible packaging defect was found, so game source and generated screenshots were left unchanged.

V2 phase 1: replaced smooth columns with 30 seeded irregular limestone towers and a matching collision height profile.
Tower crowns now use clustered low-poly foliage, with ledges and shaded rock bands.
Terrain adds faceted height colors, seeded instanced groves, and a blue-violet low-poly mountain horizon.
The bay water now blends deeper emerald with broad turquoise shallows, tower foam, ripples, and restrained sun glints.
The sky stages 30 low-poly cloud clusters around a low golden sun.
The stilt village now has a denser orange-red roof cluster and two white triangular sails on each boat.
Harbour threshold keys, runway numerals, centerline dashes, edge lights, and PAPI cues are larger.
Rendered and inspected the 1024x640 cover after each world milestone; changed source modules parse successfully.

V2 phase 2: reshaped the Kestrel K-2 with a tapered fuselage, red cowling and cheat lines, tinted glazing, registration, thick high wing, struts, control surfaces, tundra wheels, and nav lights.
The propeller now has animated blades and a translucent disc; the chase camera eases, pulls back with speed, clears terrain, and responds to buffet.
Added deterministic particle effects for prop wash, high-bank vapour, low-pass spray, landing dust, crash smoke/fire, and squall rain.
Added lazy-start synthesized engine, wind, stall, ring, touchdown, and crash audio with the existing M mute control.
Landing and crash events now show timed grade/reason banners, crash effects detach a wing, and stall alerts flash with camera shake.
Changed modules pass Node syntax checks, `git diff --check`, and the local dossier/output copy check.
The screenshot helper failed twice before rendering because its Chrome DevTools endpoint was unreachable; checked-in screenshots therefore remain the prior phase renders.

V2 phase 3: replaced faceted cloud rocks with soft warm-white and lavender sprite puffs, higher and fewer so they stay brighter than the sky.
The main island mesh now shows sand, grass, jungle and paddy bands, with denser trees, and the distant ridges no longer set flatShading on a basic material.
The Kestrel wing is a thick cambered airfoil with a dark underside, red tip caps and a red stripe; the prop keeps a visible disc when the shot is frozen.
Chase HUD is a slim edge glass stack (HDG, KTS, ALT, THR/FUEL/DMG, mission, minimap). Brake and engine-rough no longer share a line, and the cockpit view drops the extra systems slab.
Cockpit view is a 3D glare shield, pillars, lit six-pack and yoke on short final to Harbour 36, with the runway and PAPI through the glass.
Shots are four live 1280x720 moments: First Light ring, Harbour final, mail drop over the stilt village at 30% fuel, and a grade-A touchdown on the 36. Old menu shots were removed.

Phase 4 final review: recaptured all four shots at 1280x720 from the current build and judged each frame.
Limestone pinnacles are cooler grey with faceted sides, cave mouths, and greener crowns; bay water keeps its teal instead of washing out.
The Harbour 36 reads upright on short final. The cockpit six-pack now has a lit attitude ball beside airspeed, altitude, heading, fuel, and vertical speed.
The mail-drop card matches the sortie (2/3 sacks, $420) with 30% fuel, and the touchdown frame keeps wheels on the numbers under a small grade-A overlay.
Title boot showed all five missions and no console errors. Every game module parses. main.ts produced byte-identical dossiers on two runs; vendor files are unchanged.

V2 repair: the kit check failed thinking_reproduces because main.ts had no authored line (4 absent).
Rewrote main.ts by hand as a readable packer: it mirrors game/ and screenshots/ into MAKEFUN_OUTPUT_DIR or /output, then writes dossier.json with the starter caps.
Ran the packer twice into out/. Both dossier SHA-256 hashes matched (A21F6C463292030EE2DC500D8944C3434C3001ABB4E504B02DC3FDABC023183A).
out/game/index.html, out/dossier.json, and exactly four JPEGs were present; vendor/makefun-game.ts and .makefun/owner.json were not edited.
