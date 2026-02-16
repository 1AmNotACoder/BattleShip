import { useState, useCallback } from 'react'
import './App.css'
import { Legend } from './components/Legend'
import { GameStats, createGameStats } from './components/GameStats'
import type { GameStatsData } from './components/GameStats'

const BOARD_SIZE = 10
const SHIPS = [
  { name: 'Carrier', length: 5 },
  { name: 'Battleship', length: 4 },
  { name: 'Cruiser', length: 3 },
  { name: 'Submarine', length: 3 },
  { name: 'Destroyer', length: 2 },
]

type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk'

type Ship = {
  name: string
  length: number
  cells: [number, number][]
  sunk: boolean
}

type Board = CellState[][]

type GamePhase = 'placement' | 'battle' | 'gameover'

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 'empty' as CellState)
  )
}

export function canPlaceShip(
  board: Board,
  row: number,
  col: number,
  length: number,
  horizontal: boolean
): boolean {
  for (let i = 0; i < length; i++) {
    const r = horizontal ? row : row + i
    const c = horizontal ? col + i : col
    if (r >= BOARD_SIZE || c >= BOARD_SIZE) return false
    if (board[r][c] !== 'empty') return false
  }
  return true
}

function placeShipOnBoard(
  board: Board,
  row: number,
  col: number,
  length: number,
  horizontal: boolean
): Board {
  const newBoard = board.map((r) => [...r])
  for (let i = 0; i < length; i++) {
    const r = horizontal ? row : row + i
    const c = horizontal ? col + i : col
    newBoard[r][c] = 'ship'
  }
  return newBoard
}

function getShipCells(
  row: number,
  col: number,
  length: number,
  horizontal: boolean
): [number, number][] {
  const cells: [number, number][] = []
  for (let i = 0; i < length; i++) {
    const r = horizontal ? row : row + i
    const c = horizontal ? col + i : col
    cells.push([r, c])
  }
  return cells
}

function placeShipsRandomly(): { board: Board; ships: Ship[] } {
  const board = createEmptyBoard()
  const ships: Ship[] = []
  for (const shipDef of SHIPS) {
    let placed = false
    while (!placed) {
      const horizontal = Math.random() < 0.5
      const row = Math.floor(Math.random() * BOARD_SIZE)
      const col = Math.floor(Math.random() * BOARD_SIZE)
      if (canPlaceShip(board, row, col, shipDef.length, horizontal)) {
        const cells = getShipCells(row, col, shipDef.length, horizontal)
        for (const [r, c] of cells) {
          board[r][c] = 'ship'
        }
        ships.push({ name: shipDef.name, length: shipDef.length, cells, sunk: false })
        placed = true
      }
    }
  }
  return { board, ships }
}

export function checkShipSunk(ship: Ship, board: Board): boolean {
  return ship.cells.every(([r, c]) => board[r][c] === 'hit')
}

function markSunk(ship: Ship, board: Board): Board {
  const newBoard = board.map((r) => [...r])
  for (const [r, c] of ship.cells) {
    newBoard[r][c] = 'sunk'
  }
  return newBoard
}

function allShipsSunk(ships: Ship[]): boolean {
  return ships.every((s) => s.sunk)
}

type Difficulty = 'easy' | 'normal'

type AIState = {
  mode: 'hunt' | 'target'
  targets: [number, number][]
  hitStack: [number, number][]
}

function createAIState(): AIState {
  return { mode: 'hunt', targets: [], hitStack: [] }
}

function getAdjacentCells(row: number, col: number): [number, number][] {
  const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  return dirs
    .map(([dr, dc]) => [row + dr, col + dc] as [number, number])
    .filter(([r, c]) => r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE)
}

function pickRandomCell(playerBoard: Board): [number, number] {
  const available: [number, number][] = []
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (playerBoard[r][c] === 'empty' || playerBoard[r][c] === 'ship') {
        available.push([r, c])
      }
    }
  }
  const idx = Math.floor(Math.random() * available.length)
  return available[idx]
}

function aiChooseTarget(
  playerBoard: Board,
  aiState: AIState,
  difficulty: Difficulty
): { row: number; col: number; newAIState: AIState } {
  const newState = { ...aiState, targets: [...aiState.targets], hitStack: [...aiState.hitStack] }

  if (difficulty === 'easy') {
    const [row, col] = pickRandomCell(playerBoard)
    return { row, col, newAIState: newState }
  }

  while (newState.targets.length > 0) {
    const [r, c] = newState.targets.pop()!
    if (playerBoard[r][c] === 'empty' || playerBoard[r][c] === 'ship') {
      return { row: r, col: c, newAIState: newState }
    }
  }

  newState.mode = 'hunt'
  const [row, col] = pickRandomCell(playerBoard)
  return { row, col, newAIState: newState }
}

export function processShot(
  board: Board,
  ships: Ship[],
  row: number,
  col: number
): { newBoard: Board; newShips: Ship[]; result: 'hit' | 'miss' | 'sunk'; sunkShipName?: string } {
  const newBoard = board.map((r) => [...r])
  const newShips = ships.map((s) => ({ ...s, cells: [...s.cells] as [number, number][] }))

  if (newBoard[row][col] === 'ship') {
    newBoard[row][col] = 'hit'
    const hitShip = newShips.find((s) => s.cells.some(([r, c]) => r === row && c === col))
    if (hitShip && checkShipSunk(hitShip, newBoard)) {
      hitShip.sunk = true
      const sunkenBoard = markSunk(hitShip, newBoard)
      return { newBoard: sunkenBoard, newShips, result: 'sunk', sunkShipName: hitShip.name }
    }
    return { newBoard, newShips, result: 'hit' }
  }

  newBoard[row][col] = 'miss'
  return { newBoard, newShips, result: 'miss' }
}

function processAIShot(
  playerBoard: Board,
  playerShips: Ship[],
  aiState: AIState,
  difficulty: Difficulty
): { newBoard: Board; newShips: Ship[]; newAIState: AIState; result: string; shotResult: 'hit' | 'miss' | 'sunk' } {
  const { row, col, newAIState } = aiChooseTarget(playerBoard, aiState, difficulty)
  const { newBoard, newShips, result, sunkShipName } = processShot(playerBoard, playerShips, row, col)

  if (result === 'hit') {
    newAIState.mode = 'target'
    newAIState.hitStack.push([row, col])
    const adjacent = getAdjacentCells(row, col)
    for (const cell of adjacent) {
      newAIState.targets.push(cell)
    }
    return { newBoard, newShips, newAIState, result: `AI hit at ${String.fromCharCode(65 + col)}${row + 1}!`, shotResult: 'hit' }
  }

  if (result === 'sunk') {
    newAIState.hitStack = newAIState.hitStack.filter(
      ([hr, hc]) => {
        const ship = playerShips.find((s) => s.name === sunkShipName)
        return !ship?.cells.some(([sr, sc]) => sr === hr && sc === hc)
      }
    )
    if (newAIState.hitStack.length === 0) {
      newAIState.targets = []
      newAIState.mode = 'hunt'
    }
    return { newBoard, newShips, newAIState, result: `AI sank your ${sunkShipName}!`, shotResult: 'sunk' }
  }

  return { newBoard, newShips, newAIState, result: `AI missed at ${String.fromCharCode(65 + col)}${row + 1}.`, shotResult: 'miss' }
}

const ROW_LABELS = Array.from({ length: BOARD_SIZE }, (_, i) => String(i + 1))
const COL_LABELS = Array.from({ length: BOARD_SIZE }, (_, i) => String.fromCharCode(65 + i))

function getCellColor(cell: CellState, isPlayerBoard: boolean, phase: GamePhase): string {
  switch (cell) {
    case 'hit':
      return 'bg-red-500'
    case 'miss':
      return 'bg-gray-400'
    case 'sunk':
      return 'bg-red-800'
    case 'ship':
      if (isPlayerBoard) return 'bg-blue-500'
      return phase === 'gameover' ? 'bg-blue-300' : 'bg-sky-100 hover:bg-sky-200'
    case 'empty':
      if (!isPlayerBoard && phase === 'battle') return 'bg-sky-100 hover:bg-sky-200'
      return 'bg-sky-100'
    default:
      return 'bg-sky-100'
  }
}

function getCellContent(cell: CellState): React.ReactNode {
  switch (cell) {
    case 'hit':
      return <span className="text-white font-bold text-xs sm:text-sm leading-none">{"\u{1F4A5}"}</span>
    case 'miss':
      return <span className="text-slate-600 font-bold text-xs sm:text-sm leading-none">{"\u2715"}</span>
    case 'sunk':
      return <span className="text-white font-bold text-xs sm:text-sm leading-none">{"\u{1F525}"}</span>
    default:
      return null
  }
}

function BoardGrid({
  board,
  isPlayerBoard,
  phase,
  onCellClick,
  previewCells,
  previewValid,
  onCellHover,
  onBoardLeave,
  label,
}: {
  board: Board
  isPlayerBoard: boolean
  phase: GamePhase
  onCellClick?: (row: number, col: number) => void
  previewCells?: [number, number][]
  previewValid?: boolean
  onCellHover?: (row: number, col: number) => void
  onBoardLeave?: () => void
  label: string
}) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-sm sm:text-lg font-bold mb-1 sm:mb-2 text-slate-700">{label}</h2>
      <div className="inline-block" onMouseLeave={onBoardLeave}>
        <div className="flex">
          <div className="w-6 h-6 sm:w-8 sm:h-8" />
          {COL_LABELS.map((l) => (
            <div
              key={l}
              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-slate-500"
            >
              {l}
            </div>
          ))}
        </div>
        {board.map((row, ri) => (
          <div key={ri} className="flex">
            <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-slate-500">
              {ROW_LABELS[ri]}
            </div>
            {row.map((cell, ci) => {
              const isPreview = previewCells?.some(([pr, pc]) => pr === ri && pc === ci)
              let bgClass = getCellColor(cell, isPlayerBoard, phase)
              if (isPreview) {
                bgClass = previewValid ? 'bg-green-300' : 'bg-red-300'
              }
              const clickable =
                (!isPlayerBoard && phase === 'battle' && (cell === 'empty' || cell === 'ship')) ||
                (isPlayerBoard && phase === 'placement')
              return (
                <div
                  key={ci}
                  className={`w-6 h-6 sm:w-8 sm:h-8 border border-slate-300 flex items-center justify-center ${bgClass} ${
                    clickable ? 'cursor-pointer' : ''
                  } transition-colors duration-100`}
                  onClick={() => clickable && onCellClick?.(ri, ci)}
                  onMouseEnter={() => onCellHover?.(ri, ci)}
                >
                  {getCellContent(cell)}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function ShipList({ ships, title }: { ships: Ship[]; title: string }) {
  return (
    <div className="mt-2">
      <h3 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1">{title}</h3>
      <div className="flex flex-col gap-0.5">
        {ships.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs sm:text-sm">
            <span className={s.sunk ? 'line-through text-red-500' : 'text-slate-700'}>
              {s.name}
            </span>
            <span className="text-slate-400">
              {'\u25A0'.repeat(s.length)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}


function App() {
  const [phase, setPhase] = useState<GamePhase>('placement')
  const [playerBoard, setPlayerBoard] = useState<Board>(createEmptyBoard)
  const [playerShips, setPlayerShips] = useState<Ship[]>([])
  const [aiBoard, setAiBoard] = useState<Board>(createEmptyBoard)
  const [aiShips, setAiShips] = useState<Ship[]>([])
  const [currentShipIndex, setCurrentShipIndex] = useState(0)
  const [horizontal, setHorizontal] = useState(true)
  const [previewCells, setPreviewCells] = useState<[number, number][]>([])
  const [previewValid, setPreviewValid] = useState(false)
  const [aiState, setAiState] = useState<AIState>(createAIState)
  const [message, setMessage] = useState('Place your Carrier (5 cells). Press R to rotate.')
  const [winner, setWinner] = useState<string | null>(null)
  const [playerTurn, setPlayerTurn] = useState(true)
  const [stats, setStats] = useState<GameStatsData>(createGameStats)
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')

  const handlePlacementHover = useCallback(
    (row: number, col: number) => {
      if (phase !== 'placement' || currentShipIndex >= SHIPS.length) return
      const ship = SHIPS[currentShipIndex]
      const cells = getShipCells(row, col, ship.length, horizontal)
      const valid = canPlaceShip(playerBoard, row, col, ship.length, horizontal)
      setPreviewCells(cells.filter(([r, c]) => r < BOARD_SIZE && c < BOARD_SIZE))
      setPreviewValid(valid)
    },
    [phase, currentShipIndex, horizontal, playerBoard]
  )

  const handlePlacementClick = useCallback(
    (row: number, col: number) => {
      if (phase !== 'placement' || currentShipIndex >= SHIPS.length) return
      const ship = SHIPS[currentShipIndex]
      if (!canPlaceShip(playerBoard, row, col, ship.length, horizontal)) return

      const cells = getShipCells(row, col, ship.length, horizontal)
      const newBoard = placeShipOnBoard(playerBoard, row, col, ship.length, horizontal)
      const newShip: Ship = { name: ship.name, length: ship.length, cells, sunk: false }

      setPlayerBoard(newBoard)
      setPlayerShips((prev) => [...prev, newShip])
      setPreviewCells([])

      const nextIndex = currentShipIndex + 1
      setCurrentShipIndex(nextIndex)

      if (nextIndex >= SHIPS.length) {
        const { board: aiBd, ships: aiSh } = placeShipsRandomly()
        setAiBoard(aiBd)
        setAiShips(aiSh)
        setPhase('battle')
        setMessage('All ships placed! Click the AI board to fire.')
      } else {
        setMessage(
          `Place your ${SHIPS[nextIndex].name} (${SHIPS[nextIndex].length} cells). Press R to rotate.`
        )
      }
    },
    [phase, currentShipIndex, horizontal, playerBoard]
  )

  const handlePlayerShot = useCallback(
    (row: number, col: number) => {
      if (phase !== 'battle' || !playerTurn) return
      if (aiBoard[row][col] === 'hit' || aiBoard[row][col] === 'miss' || aiBoard[row][col] === 'sunk') return

      const { newBoard: newAiBoard, newShips: newAiShips, result, sunkShipName } = processShot(aiBoard, aiShips, row, col)

      if (result === 'sunk') {
        setMessage(`You sank the AI's ${sunkShipName}!`)
        setStats(prev => ({ ...prev, playerShots: prev.playerShots + 1, playerHits: prev.playerHits + 1, playerShipsSunk: prev.playerShipsSunk + 1, turns: prev.turns + 1 }))
      } else if (result === 'hit') {
        setMessage(`Hit at ${String.fromCharCode(65 + col)}${row + 1}!`)
        setStats(prev => ({ ...prev, playerShots: prev.playerShots + 1, playerHits: prev.playerHits + 1, turns: prev.turns + 1 }))
      } else {
        setMessage(`Miss at ${String.fromCharCode(65 + col)}${row + 1}.`)
        setStats(prev => ({ ...prev, playerShots: prev.playerShots + 1, playerMisses: prev.playerMisses + 1, turns: prev.turns + 1 }))
      }

      setAiBoard(newAiBoard)
      setAiShips(newAiShips)

      if (allShipsSunk(newAiShips)) {
        setPhase('gameover')
        setWinner('Player')
        setMessage('You win! All enemy ships sunk!')
        return
      }

      setPlayerTurn(false)

      setTimeout(() => {
        const {
          newBoard: updatedPlayerBoard,
          newShips: updatedPlayerShips,
          newAIState,
          result: aiResult,
          shotResult,
        } = processAIShot(playerBoard, playerShips, aiState, difficulty)

        setPlayerBoard(updatedPlayerBoard)
        setPlayerShips(updatedPlayerShips)
        setAiState(newAIState)
        setMessage(aiResult)

        if (shotResult === 'sunk') {
          setStats(prev => ({ ...prev, aiShots: prev.aiShots + 1, aiHits: prev.aiHits + 1, aiShipsSunk: prev.aiShipsSunk + 1 }))
        } else if (shotResult === 'hit') {
          setStats(prev => ({ ...prev, aiShots: prev.aiShots + 1, aiHits: prev.aiHits + 1 }))
        } else {
          setStats(prev => ({ ...prev, aiShots: prev.aiShots + 1, aiMisses: prev.aiMisses + 1 }))
        }

        if (allShipsSunk(updatedPlayerShips)) {
          setPhase('gameover')
          setWinner('AI')
          setMessage('AI wins! All your ships are sunk!')
        } else {
          setPlayerTurn(true)
        }
      }, 500)
    },
    [phase, playerTurn, aiBoard, aiShips, playerBoard, playerShips, aiState, difficulty]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        setHorizontal((prev) => !prev)
        setPreviewCells([])
      }
    },
    []
  )

  const resetGame = useCallback(() => {
    setPhase('placement')
    setPlayerBoard(createEmptyBoard())
    setPlayerShips([])
    setAiBoard(createEmptyBoard())
    setAiShips([])
    setCurrentShipIndex(0)
    setHorizontal(true)
    setPreviewCells([])
    setPreviewValid(false)
    setAiState(createAIState())
    setMessage('Place your Carrier (5 cells). Press R to rotate.')
    setWinner(null)
    setPlayerTurn(true)
    setStats(createGameStats())
  }, [])

  const randomPlacement = useCallback(() => {
    if (phase !== 'placement') return
    const { board, ships } = placeShipsRandomly()
    setPlayerBoard(board)
    setPlayerShips(ships)
    setCurrentShipIndex(SHIPS.length)
    setPreviewCells([])

    const { board: aiBd, ships: aiSh } = placeShipsRandomly()
    setAiBoard(aiBd)
    setAiShips(aiSh)
    setPhase('battle')
    setMessage('Ships randomly placed! Click the AI board to fire.')
  }, [phase])

  return (
    <div
      className="min-h-screen ocean-bg px-2 py-3 sm:p-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl sm:text-3xl font-bold text-center text-slate-800 mb-1">
          Battleship
        </h1>

        <div className="flex justify-center mb-2">
          <select
            className="px-2 py-1 rounded text-xs sm:text-sm border border-slate-300 bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            disabled={phase !== 'placement'}
          >
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
          </select>
        </div>

        <div className="text-center mb-2 sm:mb-4">
          <div
            className={`inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium ${
              winner === 'Player'
                ? 'bg-green-100 text-green-800'
                : winner === 'AI'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {message}
          </div>
        </div>

        {phase === 'placement' && (
          <div className="text-center mb-2 sm:mb-3 flex items-center justify-center gap-2 sm:gap-3">
            <button
              className="px-2 py-1 sm:px-3 sm:py-1.5 bg-slate-700 text-white rounded text-xs sm:text-sm hover:bg-slate-600 transition-colors"
              onClick={() => setHorizontal((prev) => !prev)}
            >
              {horizontal ? 'Horizontal' : 'Vertical'}
            </button>
            <button
              className="px-2 py-1 sm:px-3 sm:py-1.5 bg-indigo-600 text-white rounded text-xs sm:text-sm hover:bg-indigo-500 transition-colors"
              onClick={randomPlacement}
            >
              Random Placement
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:justify-center md:items-start gap-4 sm:gap-6 lg:gap-12">
          <div className="flex flex-col items-center">
            <BoardGrid
              board={playerBoard}
              isPlayerBoard={true}
              phase={phase}
              onCellClick={phase === 'placement' ? handlePlacementClick : undefined}
              previewCells={phase === 'placement' ? previewCells : undefined}
              previewValid={phase === 'placement' ? previewValid : undefined}
              onCellHover={phase === 'placement' ? handlePlacementHover : undefined}
              onBoardLeave={() => setPreviewCells([])}
              label="Your Fleet"
            />
            <ShipList ships={playerShips} title="Your Ships" />
          </div>

          <div className="flex flex-col items-center">
            <BoardGrid
              board={aiBoard}
              isPlayerBoard={false}
              phase={phase}
              onCellClick={phase === 'battle' ? handlePlayerShot : undefined}
              label="Enemy Waters"
            />
            <ShipList ships={aiShips.map((s) => ({ ...s, cells: s.cells }))} title="Enemy Ships" />
          </div>
        </div>

        <div className="flex justify-center mt-4 sm:mt-6">
          <Legend />
        </div>

        {phase === 'gameover' && winner && (
          <>
            <GameStats stats={stats} winner={winner} />
            <div className="text-center mt-4 sm:mt-6">
              <button
                className="px-5 py-2 sm:px-6 sm:py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500 transition-colors text-base sm:text-lg"
                onClick={resetGame}
              >
                Play Again
              </button>
            </div>
          </>
        )}

        <div className="text-center mt-3 sm:mt-6 text-[10px] sm:text-xs text-slate-400">
          {phase === 'placement' && 'Click cells on your board to place ships. Press R to rotate.'}
          {phase === 'battle' && (playerTurn ? 'Your turn \u2014 click enemy waters to fire.' : 'AI is thinking...')}
          {phase === 'gameover' && `Game over \u2014 ${winner} wins!`}
        </div>

        <div className="text-center mt-3 sm:mt-4">
          <button
            className="px-3 py-1 text-slate-400 border border-slate-300 rounded text-xs hover:bg-slate-100 transition-colors"
            onClick={resetGame}
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
