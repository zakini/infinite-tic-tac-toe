import { useShallow } from 'zustand/shallow'
import useGameStore from './store'
import { findWin, pickNestedBoardState } from './utils'
import { isBoardState } from './types'

type Props = {
  parentPath?: number[]
  disabled?: boolean | null
}

export default function Board({ parentPath = [], disabled = null }: Props) {
  const [fullBoardState, takeTurn] = useGameStore(useShallow(
    state => [state.boardState, state.takeTurn],
  ))
  const boardState = pickNestedBoardState(fullBoardState, parentPath)
  const win = findWin(boardState)

  return (
    <div className="grid aspect-square w-full grid-cols-3 gap-px bg-black">
      {boardState.map((cell, i) => isBoardState(cell)
        ? (
            <Board
              key={i}
              parentPath={[...parentPath, i]}
              disabled={disabled || win !== null}
            />
          )
        : (
            <button
              key={i}
              className={`relative aspect-square ${win?.cells?.includes(i) ? 'bg-green-500' : 'bg-white'}`}
              disabled={disabled || cell !== null || win !== null}
              onClick={() => {
                takeTurn([...parentPath, i])
              }}
            >
              <span className="absolute">{cell}</span>
            </button>
          ))}
    </div>
  )
}
