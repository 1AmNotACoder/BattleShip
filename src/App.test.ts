import { describe, it, expect } from 'vitest'
import { createEmptyBoard, canPlaceShip, processShot, checkShipSunk } from './App'

describe('createEmptyBoard', () => {
  it('creates a 10x10 board of empty cells', () => {
    const board = createEmptyBoard()
    expect(board.length).toBe(10)
    for (const row of board) {
      expect(row.length).toBe(10)
      for (const cell of row) {
        expect(cell).toBe('empty')
      }
    }
  })
})

describe('canPlaceShip', () => {
  it('allows placing a ship on an empty board horizontally', () => {
    const board = createEmptyBoard()
    expect(canPlaceShip(board, 0, 0, 5, true)).toBe(true)
  })

  it('allows placing a ship on an empty board vertically', () => {
    const board = createEmptyBoard()
    expect(canPlaceShip(board, 0, 0, 5, false)).toBe(true)
  })

  it('rejects ship that goes off the right edge horizontally', () => {
    const board = createEmptyBoard()
    expect(canPlaceShip(board, 0, 8, 5, true)).toBe(false)
  })

  it('rejects ship that goes off the bottom edge vertically', () => {
    const board = createEmptyBoard()
    expect(canPlaceShip(board, 8, 0, 5, false)).toBe(false)
  })

  it('rejects overlapping ships', () => {
    const board = createEmptyBoard()
    board[0][0] = 'ship'
    board[0][1] = 'ship'
    board[0][2] = 'ship'
    expect(canPlaceShip(board, 0, 0, 3, true)).toBe(false)
  })

  it('allows adjacent non-overlapping placement', () => {
    const board = createEmptyBoard()
    board[0][0] = 'ship'
    board[0][1] = 'ship'
    board[0][2] = 'ship'
    expect(canPlaceShip(board, 1, 0, 3, true)).toBe(true)
  })

  it('allows placing at the exact edge horizontally', () => {
    const board = createEmptyBoard()
    expect(canPlaceShip(board, 0, 5, 5, true)).toBe(true)
  })

  it('allows placing at the exact edge vertically', () => {
    const board = createEmptyBoard()
    expect(canPlaceShip(board, 5, 0, 5, false)).toBe(true)
  })
})

describe('processShot', () => {
  it('registers a miss on empty cell', () => {
    const board = createEmptyBoard()
    const ships = [{ name: 'Destroyer', length: 2, cells: [[0, 0], [0, 1]] as [number, number][], sunk: false }]
    const { newBoard, result } = processShot(board, ships, 5, 5)
    expect(result).toBe('miss')
    expect(newBoard[5][5]).toBe('miss')
  })

  it('registers a hit on a ship cell', () => {
    const board = createEmptyBoard()
    board[0][0] = 'ship'
    board[0][1] = 'ship'
    const ships = [{ name: 'Destroyer', length: 2, cells: [[0, 0], [0, 1]] as [number, number][], sunk: false }]
    const { newBoard, result } = processShot(board, ships, 0, 0)
    expect(result).toBe('hit')
    expect(newBoard[0][0]).toBe('hit')
  })

  it('sinks a ship when all cells are hit', () => {
    const board = createEmptyBoard()
    board[0][0] = 'hit'
    board[0][1] = 'ship'
    const ships = [{ name: 'Destroyer', length: 2, cells: [[0, 0], [0, 1]] as [number, number][], sunk: false }]
    const { newBoard, newShips, result, sunkShipName } = processShot(board, ships, 0, 1)
    expect(result).toBe('sunk')
    expect(sunkShipName).toBe('Destroyer')
    expect(newShips[0].sunk).toBe(true)
    expect(newBoard[0][0]).toBe('sunk')
    expect(newBoard[0][1]).toBe('sunk')
  })

  it('does not mutate original board', () => {
    const board = createEmptyBoard()
    board[0][0] = 'ship'
    const ships = [{ name: 'Destroyer', length: 2, cells: [[0, 0], [0, 1]] as [number, number][], sunk: false }]
    processShot(board, ships, 0, 0)
    expect(board[0][0]).toBe('ship')
  })
})

describe('checkShipSunk', () => {
  it('returns false when not all cells are hit', () => {
    const board = createEmptyBoard()
    board[0][0] = 'hit'
    board[0][1] = 'ship'
    const ship = { name: 'Destroyer', length: 2, cells: [[0, 0], [0, 1]] as [number, number][], sunk: false }
    expect(checkShipSunk(ship, board)).toBe(false)
  })

  it('returns true when all cells are hit', () => {
    const board = createEmptyBoard()
    board[0][0] = 'hit'
    board[0][1] = 'hit'
    const ship = { name: 'Destroyer', length: 2, cells: [[0, 0], [0, 1]] as [number, number][], sunk: false }
    expect(checkShipSunk(ship, board)).toBe(true)
  })
})
