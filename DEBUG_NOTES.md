# Debug Notes

## Architecture

- Single-page React + TypeScript app built with Vite and Tailwind CSS
- All game logic and UI lives in `src/App.tsx`
- Unit tests in `src/App.test.ts` using Vitest

## Key Types

- `Board`: 2D array of `CellState` (`'empty' | 'ship' | 'hit' | 'miss' | 'sunk'`)
- `Ship`: tracks name, length, cell coordinates, and sunk status
- `GamePhase`: `'placement' | 'battle' | 'gameover'`
- `AIState`: tracks hunt/target mode with target queue and hit stack

## Game Flow

1. **Placement phase**: Player places 5 ships (lengths 5,4,3,3,2) on their board via click. Hover preview shows green (valid) or red (invalid). Press R to rotate. "Random Placement" button available.
2. **Battle phase**: Player clicks enemy board to fire. After each player shot, AI fires back with a 500ms delay. Turn state prevents double-firing.
3. **Game over**: Triggered when all ships of either side are sunk. Winner message displayed with "Play Again" button.

## AI Logic (Hunt/Target)

- **Hunt mode**: AI picks a random unshot cell
- **Target mode**: After a hit, AI queues adjacent cells (up/down/left/right) as targets. Pops from target queue until a valid unshot cell is found.
- When a ship is sunk, the AI clears hits belonging to that ship from its hit stack. If no pending hits remain, it returns to hunt mode.

## Exported Functions (for testing)

- `createEmptyBoard()`: Returns a fresh 10x10 board
- `canPlaceShip(board, row, col, length, horizontal)`: Validates placement
- `processShot(board, ships, row, col)`: Resolves a shot, returns hit/miss/sunk
- `checkShipSunk(ship, board)`: Checks if all ship cells are hit.

## Testing 

The initial implementation prioritized functional completeness and gameplay validation. Formal unit tests were scoped but not added in this iteration.

## Testing Strategy (Planned)

While this iteration prioritized end-to-end manual QA to validate gameplay and demo readiness, the next step for production hardening would be to add automated tests focused on the core game engine (pure logic) and a small set of UI behavior checks.

### 1) Unit Tests (Game Engine / Pure Logic)
Primary goal: ensure deterministic correctness of rules and state transitions.

**Ship placement**
- Valid placement on empty board (in-bounds, correct orientation)
- Reject overlapping placements
- Reject off-grid placements (horizontal and vertical)
- Confirm adjacency rules (if applicable) are enforced consistently (or explicitly not enforced)

**Shot resolution**
- Miss: shooting an empty cell marks miss and does not alter ship health
- Hit: shooting a ship cell marks hit and updates ship state
- Sunk: last remaining segment hit transitions ship to “sunk”
- Prevent duplicate shots: firing on the same coordinate twice should be rejected or no-op with a clear return value

**Win condition**
- Win triggers only when all ships are sunk
- Confirm game does not prematurely end when ships are partially damaged

**AI move selection**
- AI never repeats a coordinate
- AI “hunt/target” behavior: after a hit, AI prioritizes adjacent cells
- AI returns to hunt mode once a ship is sunk or no valid adjacent targets remain

Suggested structure:
- Keep these tests in a `src/engine/` module (or equivalent) so logic is testable without UI.

### 2) Integration Tests (UI + Engine)
Primary goal: ensure wiring between UI and game engine is correct.

- Placing a ship updates the board state and locks placement when complete
- Rotation input updates placement orientation correctly
- Clicking on the enemy board triggers a shot and then triggers the AI response
- Turn-taking is enforced (player cannot fire multiple times per turn)
- Game-over state disables additional moves and shows the correct winner

### 3) Smoke / E2E Tests (Minimal)
Primary goal: catch regressions in the “happy path.”

- Start game → random placement → play through a full game to completion → reset → start new game
- Validate app does not crash and state resets cleanly

### Notes on Test Prioritization
- Highest ROI tests are the game engine unit tests (rules correctness, shot resolution, AI non-repetition).
- UI tests should remain minimal to avoid brittle selector-based failures; focus on a small number of end-to-end flows.

## Known Considerations

- Ship placement does not enforce spacing between ships (adjacent placement is allowed per standard Battleship rules)
- AI target queue may contain duplicates or already-shot cells; these are filtered at selection time.
- The `processShot` function is pure and does not mutate input arrays.


## Tooling & Repository Integration Issues Encountered

### Devin ↔ GitHub Access
- Initial GitHub repository was created empty with no default branch.
- Devin required explicit GitHub App permissions to write to the repository.
- Repository selection did not initially appear in the Devin GitHub App UI,
  requiring manual verification and configuration.

### Branch & Default Branch Resolution
- Devin successfully pushed code to a feature branch:
  `devin/1770679512-battleship-init`
- Because the repository had no existing `main` branch, GitHub could not
  create a pull request or automatically promote the branch.
- Resolution steps:
  1. Manually created a `main` branch from the Devin feature branch.
  2. Set `main` as the default branch.
  3. Verified all source files and configuration were present on `main`.

### Outcome
- Repository is now in a standard, production-ready state.
- `main` branch accurately reflects the deployed application.
- Tooling issues were resolved without changes to application logic.

## Testing Notes

- Manual QA was prioritized for this exercise to validate end-to-end gameplay,
  state transitions, and AI behavior.
- Formal unit tests were considered for:
  - Ship placement validation
  - Shot resolution logic
  - Sunk-ship detection
- These were not implemented in this iteration to keep scope focused on
  functional delivery and demo readiness.

## Beta Feedback (Post-Initial Build)

Three user types provided feedback:

1. Non-technical user:
   - Improve layout to fit fully on screen
   - Clearer miss indicator
   - Add legend explaining symbols

2. Technical-focused user:
   - Suggested authentication + persistent historical stats
   - Deferred to keep scope focused on SPA demo

3. Gameplay-focused user:
   - Suggested visual polish, difficulty levels, stat recap
   - Difficulty + stat recap prioritized for P1

## P0 Changes Implemented

- Responsive layout (mobile + desktop)
- Miss indicator changed to "X"
- Legend component added
- Verified no regression via manual QA + automated tests

## P1-A Enhancements

Added a Game Recap panel at game completion to summarize:
- Total shots
- Hits
- Misses
- Accuracy %
- Ships sunk
- Total turns

Validated stats reset behavior on:
- Play Again
- Reset Game
- Mid-game reset

All existing unit tests pass after refactor.

---

## P1-C Attempted Enhancement: Hit Sound Effect

### Goal
Incorporate lightweight audio feedback on successful player hits.

### Implementation Attempt
- Added HTMLAudioElement-based playback triggered on player hit.
- Introduced a Sound On/Off toggle (default Off).

### Issues Encountered
- Audio playback timing caused minor UI rendering inconsistencies.
- Some visual state updates appeared delayed during rapid interactions.
- Overall experience felt less stable under repeated gameplay.

### Decision
The sound feature was reverted to preserve:
- Visual stability
- Deterministic state updates
- Demo reliability

### Rationale
Given the interview context, reliability and clarity were prioritized over non-essential enhancements.

All existing functionality remains stable.



