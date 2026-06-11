# GRO-1167: Extract Audio Synth from ui.js → js/audio_chip.js

> **For Hermes/Ned:** Implement task-by-task. Each task has verification.

**Goal:** Remove ~440 lines of Web Audio chiptune/credits synthesizer code from the draw() function in ui.js into a standalone js/audio_chip.js module.

**Architecture:** The `playMenuMusicStep()` and `playCreditsMusicStep()` functions are currently defined as closures inside draw(). They only reference globals (audioCtx, currentScreen, SCREENS, masterVolume, musicVolume). Hoist them to global scope with their state variables, expose start/stop functions. draw() calls the start/stop instead of managing intervals directly.

**Files touched:**
- Create: `js/audio_chip.js`
- Modify: `js/ui.js` (lines 102-212 removed, replaced with 4 calls)
- Modify: `index.html` (add script tag)

---

## Pre-flight: Map the Extraction Boundary

Lines 102-212 in ui.js, all inside the `function draw()` closure:

```
L102: // --- Web Audio Chiptune Synthesizer Loop ---
L103: let musicInterval = null;
L104: let musicStep = 0;
L105: const bassLine = [...];
L106-109: const melody = [...];
L111: function playMenuMusicStep() { ... }
L151: musicInterval = setInterval(playMenuMusicStep, 200);
L155-159: } ... clearInterval if screen changed ...
L161: // --- Web Audio Credits Music Loop ---
L162: let creditsMusicInterval = null;
L163-167: creditsBassLine, creditsMelody arrays
L169: function playCreditsMusicStep() { ... }
L207: creditsMusicInterval = setInterval(playCreditsMusicStep, 250);
L212: clearInterval(creditsMusicInterval);
```

**Dependencies on globals:**
- `audioCtx` — from audio.js (module #14)
- `currentScreen` — from ui.js (module #15)
- `SCREENS` — from ui.js (#15)
- `musicVolume` — from ui.js (#15, float 0-1)
- `masterVolume` — from audio.js (#14, float 0-1)

All are available at global scope. audio_chip.js loads after audio.js and ui.js.

---

### Task 1: Create js/audio_chip.js — hoisted functions + state

**Objective:** Move the music synth functions and their state to global scope.

**Files:** Create `js/audio_chip.js`

**Step: Write the module**

```javascript
// js/audio_chip.js — Menu chiptune + credits music synth (GRO-1167)
// Extracted from ui.js draw(). Uses globals: audioCtx, currentScreen, SCREENS, musicVolume, masterVolume.
// Loaded after audio.js and ui.js, before ui/dialogue.js.

const ChiptunePlayer = {
    // State
    _menuInterval: null,
    _creditsInterval: null,
    _musicStep: 0,

    // Melody data — constants
    _bassLine: [110, 110, 130, 130, 146, 146, 165, 165],
    _melody: [220, 0, 261, 293, 329, 0, 293, 261, 220, 220, 329, 0, 293, 0, 261, 0],
    _creditsBass: [98, 98, 146, 146, 130, 130, 98, 98],
    _creditsMelody: [392, 0, 493, 587, 784, 0, 739, 587, 493, 493, 587, 0, 440, 0, 392, 0],

    _playMenuStep: function() {
        if (!audioCtx || currentScreen === 'playing' || currentScreen === SCREENS.CINEMATIC || currentScreen === SCREENS.CREDITS) return;
        var now = audioCtx.currentTime;
        var step = this._musicStep;
        var bassFreq = this._bassLine[Math.floor(step / 2) % this._bassLine.length];
        if (step % 2 === 0 && bassFreq > 0) {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(bassFreq, now);
            gain.gain.setValueAtTime(0.015 * masterVolume * musicVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(now); osc.stop(now + 0.35);
        }
        var melFreq = this._melody[step % this._melody.length];
        if (melFreq > 0) {
            var osc2 = audioCtx.createOscillator();
            var gain2 = audioCtx.createGain();
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(melFreq, now);
            gain2.gain.setValueAtTime(0.01 * masterVolume * musicVolume, now);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc2.connect(gain2); gain2.connect(audioCtx.destination);
            osc2.start(now); osc2.stop(now + 0.15);
        }
        this._musicStep++;
    },

    _playCreditsStep: function() {
        if (!audioCtx || currentScreen !== SCREENS.CREDITS) return;
        var now = audioCtx.currentTime;
        var step = this._musicStep;
        var bassFreq = this._creditsBass[Math.floor(step / 2) % this._creditsBass.length];
        if (step % 2 === 0 && bassFreq > 0) {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(bassFreq, now);
            gain.gain.setValueAtTime(0.02 * masterVolume * musicVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(now); osc.stop(now + 0.4);
        }
        var melFreq = this._creditsMelody[step % this._creditsMelody.length];
        if (melFreq > 0) {
            var osc2 = audioCtx.createOscillator();
            var gain2 = audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(melFreq, now);
            gain2.gain.setValueAtTime(0.012 * masterVolume * musicVolume, now);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc2.connect(gain2); gain2.connect(audioCtx.destination);
            osc2.start(now); osc2.stop(now + 0.2);
        }
        this._musicStep++;
    },

    startMenu: function() {
        this.stopAll();
        this._musicStep = 0;
        var self = this;
        this._menuInterval = setInterval(function() { self._playMenuStep(); }, 200);
    },

    startCredits: function() {
        this.stopAll();
        this._musicStep = 0;
        var self = this;
        this._creditsInterval = setInterval(function() { self._playCreditsStep(); }, 250);
    },

    stopAll: function() {
        if (this._menuInterval) { clearInterval(this._menuInterval); this._menuInterval = null; }
        if (this._creditsInterval) { clearInterval(this._creditsInterval); this._creditsInterval = null; }
    }
};
```

**Verify:** `python3 scripts/verify_syntax.py js/audio_chip.js` → OK

---

### Task 2: Remove audio code from ui.js draw()

**Objective:** Strip lines 102-212 (the audio blocks) and replace with calls to ChiptunePlayer.

**Files:** Modify `js/ui.js`

**What to remove:** Everything from `// --- Web Audio Chiptune Synthesizer Loop ---` (L102) through the credits stop line (L212), inclusive. That's lines 102-212 in the current file.

**What to replace it with:**

In the draw() function, where the audio block was, add these calls at the right places:

1. Where `musicInterval = setInterval(playMenuMusicStep, 200)` was (old L151): replace with `ChiptunePlayer.startMenu();`
2. Where `clearInterval(musicInterval)` was (old L155-159): replace the entire if-block with nothing (ChiptunePlayer handles this internally)
3. The entire credits audio section (old L161-212): remove entirely, add a call to start credits music in the CREDITS screen section of draw() — specifically in the credits rendering block:

```javascript
// In the CREDITS screen block of draw():
if (currentScreen === SCREENS.CREDITS && !ChiptunePlayer._creditsInterval) {
    ChiptunePlayer.startCredits();
}
```

**Exact patch instruction:** Replace old lines 102-212 with a single call:

```javascript
        // Music managed by js/audio_chip.js (GRO-1167)
        if (currentScreen !== 'playing' && currentScreen !== SCREENS.CINEMATIC && currentScreen !== SCREENS.CREDITS && !ChiptunePlayer._menuInterval) {
            ChiptunePlayer.startMenu();
        }
        if (currentScreen !== SCREENS.CREDITS && ChiptunePlayer._creditsInterval) {
            ChiptunePlayer.stopAll();
        }
```

**Verify:** `python3 scripts/parse_js_with_esprima.py js/ui.js` → OK

---

### Task 3: Add script tag to index.html

**Objective:** Load audio_chip.js between ui.js and ui/dialogue.js.

**Files:** Modify `index.html`

**Step:** Add after the ui.js script tag:

```html
    <script src="js/audio_chip.js"></script>
```

**Verify:** `python3 scripts/verify_syntax.py index.html` → OK

---

### Task 4: Verify full module chain

**Objective:** Confirm all modules in load order pass syntax.

**Files:** All js/*.js

**Step:**
```bash
for f in js/*.js js/ui/*.js js/levels/*.js; do
  python3 scripts/parse_js_with_esprima.py "$f" 2>&1
done
# Sum: all should show OK
```

**Verify:** All files pass AST validation.

---

### Task 5: Commit and push

```bash
git add js/audio_chip.js js/ui.js index.html
git commit -m "GRO-1167: Extract audio synth from ui.js → js/audio_chip.js

- ChiptunePlayer singleton with startMenu/startCredits/stopAll
- ~440 lines removed from ui.js draw() closure
- Audio synth now loads as module between ui.js and ui/dialogue.js
- ui.js drops from 1870 to ~1480 lines"
git push origin master
```

---

## Summary

| Before | After |
|---|---|
| ui.js: 1870 lines | ui.js: ~1480 lines |
| Audio code in draw() closure | ChiptunePlayer singleton in audio_chip.js |
| 20 modules | 21 modules |
