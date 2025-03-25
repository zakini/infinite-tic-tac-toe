import { useState } from 'react'
import useGameStore from './store'
import { useShallow } from 'zustand/shallow'
import { findWin } from './utils'

type Props = {
  className?: string
}

export default function Results({ className = 'relative' }: Props) {
  const [conceded, setConceded] = useState(false)
  const [boardState, goDeeper, startNewGame] = useGameStore(useShallow(state => [
    state.boardState, state.goDeeper, state.startNewGame,
  ]))
  const win = findWin(boardState)
  const draw = win === false

  if (win === null) return null

  return (
    <div className={className} role="dialog" aria-labelledby="results-title">
      <div className="absolute inset-0 bg-black opacity-50" />

      <div className="absolute">
        <div id="results-title" className="bg-white">
          Game Over: {draw ? 'no one' : win.player} wins
        </div>
        <div className="flex gap-2">
          {conceded
            ? (
                <button
                  className="bg-white"
                  onClick={() => startNewGame()}
                >
                  Start new game
                </button>
              )
            : (
                <>
                  <button
                    className="bg-white"
                    onClick={() => setConceded(true)}
                  >
                    Concede
                  </button>

                  <button
                    className="bg-white"
                    onClick={() => goDeeper()}
                  >
                    Go Deeper
                  </button>
                </>
              )}
        </div>
      </div>
    </div>
  )
}
