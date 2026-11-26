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
