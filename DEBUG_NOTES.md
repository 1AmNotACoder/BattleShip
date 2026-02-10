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

## Known Considerations

- Ship placement does not enforce spacing between ships (adjacent placement is allowed per standard Battleship rules)
- AI target queue may contain duplicates or already-shot cells; these are filtered at selection time.
- The `processShot` function is pure and does not mutate input arrays.
