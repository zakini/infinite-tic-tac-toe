import { StateCreator } from 'zustand'
import { assertIsBoardState, BoardCondition, BoardState, FilledCellState, SingleLevelBoardState } from '../types'
import { CoreSlice } from './core-slice'
import allPossibleSingleLevelBoardStates from './states.json'

type SliceStateCreator<T, U> = StateCreator<U & T, [], [], T>

const randomElement = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]

const generateSingleLevelBoardForCondition = (condition: BoardCondition): SingleLevelBoardState => {
  const statesForCondition = allPossibleSingleLevelBoardStates[condition]
  const state = randomElement(statesForCondition)
  assertIsBoardState(state)
  return state
}

const nullConditions = [BoardCondition.Empty, BoardCondition.InProgress] as const

const generateBoardForCondition = (condition: BoardCondition, depth: number): BoardState => {
  if (depth < 1) throw new Error('Depth must be 1 or greater')

  const baseBoard = generateSingleLevelBoardForCondition(condition)
  if (depth === 1) return baseBoard

  const board = baseBoard.map((c) => {
    switch (c) {
      case FilledCellState.X:
        return generateBoardForCondition(BoardCondition.WonX, depth - 1)
      case FilledCellState.O:
        return generateBoardForCondition(BoardCondition.WonO, depth - 1)
      case null:
        return generateBoardForCondition(
          condition === BoardCondition.Empty ? condition : randomElement(nullConditions),
          depth - 1,
        )
    }
  })

  assertIsBoardState(board)
  return board
}

export type DevToolsSlice = {
  forceBoardCondition: (condition: BoardCondition, depth: number) => void
}

const createDevToolsSlice: SliceStateCreator<DevToolsSlice, CoreSlice> = set => ({
  forceBoardCondition: (condition: BoardCondition, depth: number) => set({
    boardState: generateBoardForCondition(condition, depth),
  }),
})

export default createDevToolsSlice
