import { useShallow } from 'zustand/shallow'
import useGameStore from './store'
import { findWin, pickNestedBoardState, turnValid } from './utils'
import { isBoardState } from './types'

type Props = {
  parentPath?: number[]
  disabled?: boolean | null
}

export default function Board({ parentPath = [], disabled = null }: Props) {
  const [fullBoardState, takeTurn, turnPath] = useGameStore(useShallow(
    state => [state.boardState, state.takeTurn, state.turnPath],
  ))
  const boardState = pickNestedBoardState(fullBoardState, parentPath)
  const win = findWin(boardState)
  const winCells = win ? win.cells : null

  return (
    win && parentPath.length > 0
      ? (
          <section className="size-full bg-green-500" aria-label={`sub-board won by ${win.player}`}>
            {win.player}
          </section>
        )
      : (
          <section
            className="grid aspect-square w-full grid-cols-3 gap-px bg-black p-px"
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
