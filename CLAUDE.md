# Tappy Math — Project Handoff

## What this is
A mobile math puzzle game for iOS and Android built with **Expo (React Native)**. A target number is shown at the top; the player taps all floating equations that equal that number before the timer runs out. Wrong equations act as distractors. Finding all correct equations advances to the next round. Intended audience: **kids under 10**.

## Running the project
```
cd ~/Documents/repos/tappy-math
npx expo start --clear
```
- iOS Simulator: `npx expo start --ios` (requires Xcode)
- Android Emulator: `npx expo start --android` (requires Android Studio AVD)
- Physical device: scan QR code in **Expo Go** app (App Store / Google Play), same network or use `--tunnel`
- No EAS Build needed for development — all dependencies are Expo SDK managed

## Tech stack
- **Expo SDK 54**, `newArchEnabled: true` in `app.json`
- **React Native** built-in `Animated` API — do NOT use Reanimated (crashes with this Expo config)
- **expo-av** for audio (SFX + background music)
- **@react-native-async-storage/async-storage** for settings persistence
- No network calls — all equations generated locally in `utils/mathEngine.js`
- No navigation library — simple `screen` state string in `App.js`

## File structure
```
App.js                          # Screen state machine (home → game → round-complete → results)
screens/
  HomeScreen.js                 # Difficulty picker, mode selector card, settings modal, floating bg
  GameScreen.js                 # Main game: equation bubbles, timer, score popups, quit modal
  RoundCompleteScreen.js        # Between rounds: scores + found equations chips + Continue
  ResultsScreen.js              # End: total score, stats grid, missed equations, Play Again
components/
  FloatingEquation.js           # Animated floating bubble — loops between two random positions
  FallingEquation.js            # Falling bubble — recycles from top after reaching bottom
constants/
  difficulty.js                 # Easy/Medium/Hard configs (all tunable values live here)
utils/
  mathEngine.js                 # generateTarget() + buildEquationPool() — pure, no side effects
  settingsStorage.js            # AsyncStorage wrapper: { sfxEnabled, musicEnabled }
  audio.js                      # expo-av manager: initAudio, playSound, startMusic, stopMusic, etc.
assets/
  sounds/                       # Countdown.wav, Fail.wav, Go.wav, Hint.wav, Success.wav
  music/                        # Menu.wav (home loop), + 4 game tracks (randomly selected)
```

## Game flow
1. **HomeScreen** — pick difficulty + mode, tap Play
2. **GameScreen** — 3-2-1-Go! countdown, bubbles appear, timer runs, tap correct equations
3. **RoundCompleteScreen** — found all: show round score + running total + equations found, Continue
4. **GameScreen** (next round) — new target number, same timer (resets), repeats until timer hits 0
5. **ResultsScreen** — time's up: total score, stats, missed equations, Play Again / Back to Home

**Survival Mode** — starts at 30s; correct solve adds +20s, each wrong tap costs −5s  
**Falling Equations Mode** — equations fall top-to-bottom and recycle if missed; same timer/scoring

## Difficulty levels
| | Easy | Medium | Hard |
|---|---|---|---|
| Timer | 45s | 30s | 20s |
| Correct eqs shown | 3 | 4 | 5 |
| Distractors shown | 6 | 10 | 14 |
| Bubble speed | 0.6× | 1.0× | 1.6× |
| Target range | 6–20 | 12–50 | 20–100 |
| Operations | +, − | +, −, × | +, −, ×, ÷ |
| Correct pts | +5 | +10 | +15 |
| Wrong penalty | −2 | −5 | −8 |

## Math engine (`utils/mathEngine.js`)
- `generateTarget(config)` — random int in `[targetMin, targetMax]`
- `buildEquationPool(target, config)` → `{ correct[], distractors[] }`
  - Correct: all add (a+b=n), sub (a−b=n for b=1..20), mul (a×b=n, both ≥ 2), div (n×b ÷ b, dividend ≤ 300) — shuffled, take `maxCorrect`
  - Distractors: equations from nearby wrong targets (±1..±20 offset), filtered so none equal `target`
- All operators use Unicode: `−` (U+2212), `×` (U+00D7), `÷` (U+00F7)
- Tested: always produces exact `maxCorrect` + `distractors` count for all targets including primes

## Key technical notes
- **Animated**: Use `Animated.loop` + `Animated.sequence` for float animations. `FloatingEquation` uses two loop anims (x, y independently) with different durations so motion feels organic.
- **Stale closure fix**: `equationsSolvedRef` mirrors `equationsSolved` state so the timer `useEffect` (which depends on `timeLeft`) always reads the current survival count when calling `buildResult`.
- **loadGame is synchronous** — no async/loading state needed unlike tappy-word's API calls. Equations are ready immediately so `setCountdown(3)` fires right after `setEquations`.
- **Screen state declared before useEffects** — `const [screen, setScreen]` in `App.js` must stay above any `useEffect` that references it (Babel hoisting issue).
- Audio files were copied from `tappy-word/assets` at project creation. `audio.js` is identical to tappy-word's except without console.log noise.

## Current aesthetic (to be changed for kids)
- Dark navy/indigo color scheme (`#0f0f2e` bg, `#1a1a40` header, `#3b3b8f` default bubble)
- Adult-oriented music tracks borrowed from tappy-word (Pocket Parade, Tile Tap Loop, etc.)
- No custom app icon yet — still the default Expo icon

## Next session: kids-under-10 redesign
Sam wants a **child-friendly aesthetic** distinct from tappy-word. Planned changes:

**Music & audio**
- Replace all music tracks with upbeat, playful kids music (chiptune / toy-box style)
- Keep the same 5 SFX slots (success, fail, countdown, go, hint) — replace WAV files with more cartoonish sounds
- `audio.js` requires only WAV swaps in `assets/sounds/` and `assets/music/` — no code changes needed

**Visual style**
- Brighter, saturated color palette — think primary colors, not dark navy
- Larger, rounder fonts (consider `fontFamily` if loading a custom font via `expo-font`)
- Bigger bubble hit targets — increase `paddingHorizontal`/`paddingVertical` in `FloatingEquation`/`FallingEquation` styles
- Fun background instead of drifting equations — consider stars, shapes, or cartoon characters
- Friendlier grade messages on ResultsScreen ("Amazing! 🌟" vs "So close!")
- Consider emoji-heavy UI labels (e.g. "⏱ Time" instead of plain "Time")

**Gameplay tuning for young kids**
- Easy mode may need wider target range of 2–10 with only addition
- Timer durations may need to be more generous (e.g. Easy: 60s)
- Score penalty for wrong taps may discourage kids — consider removing or reducing to 0

## Pending: App Store submission
Bundle ID: `com.sammorrison.tappymath`. Steps mirror tappy-word exactly (eas-cli, EAS Build, Transporter). Do after visual redesign is complete.

## Ideas for later
- Achievements + theme selector (same pattern as tappy-word)
- Hint button that briefly highlights one correct equation
- High score persistence (AsyncStorage, straightforward)
- `expo-haptics` for tap feedback
- "Fill in the blank" mode: show `3 + ? = 10`, tap the answer from floating numbers
