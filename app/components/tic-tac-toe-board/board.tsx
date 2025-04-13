import { useShallow } from 'zustand/shallow'
import useGameStore from './store'
import { findWin, pickNestedBoardState, turnValid } from './utils'
import { BoardState, isBoardState } from './types'

type Props = {
  parentPath?: number[]
  disabled?: boolean | null
}

const boardDepth = (board: BoardState): number => isBoardState(board[0])
  ? boardDepth(board[0]) + 1
  : 1

export default function Board({ parentPath = [], disabled = null }: Props) {
  const [fullBoardState, takeTurn, turnPath] = useGameStore(useShallow(
    state => [state.boardState, state.takeTurn, state.turnPath],
  ))
  const boardState = pickNestedBoardState(fullBoardState, parentPath)
  const depth = boardDepth(boardState)
  const win = findWin(boardState)
  const winCells = win ? win.cells : null

  return (
    win && parentPath.length > 0
      ? (
          <section
            className="size-full"
            // Each sub-board adds 1px of 'padding' (via gap)
            // Mimic this for this summary by adding 1px of real padding per level this summarises
            style={{ padding: depth }}
            aria-label={`sub-board won by ${win.player}`}
          >
            <div className="size-full bg-green-500">
              {win.player}
            </div>
          </section>
        )
      : (
          <section
            className="grid aspect-square w-full grid-cols-3 grid-rows-3 gap-px bg-black p-px"
            aria-label="in-progress sub-board"
          >
            {boardState.map((cell, i) => isBoardState(cell)
              ? (
                  <Board
                    key={i}
                    parentPath={[...parentPath, i]}
                    disabled={disabled || !turnValid([...parentPath, i], turnPath)}
                  />
                )
              : (
                  <button
                    key={i}
                    className={`relative aspect-square ${winCells?.includes(i)
                      ? 'bg-green-500'
                      : 'bg-white disabled:bg-gray-400'}`}
                    disabled={disabled || win !== null || cell !== null}
                    onClick={() => {
                      // This is a bug in Typescript. Use 'as' to override
                      // See: https://github.com/microsoft/TypeScript/issues/60463
                      takeTurn([...parentPath, i] as unknown as [number, ...number[]])
                    }}
                  >
                    <span className="absolute">{cell}</span>
                  </button>
                ))}
          </section>
        )
  )
}
