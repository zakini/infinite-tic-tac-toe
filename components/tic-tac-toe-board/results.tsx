import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import useGameStore from './store'
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
  const inProgress = win === null
  const draw = win === false

  // Ensure conceded is false when a game is in progress
  useEffect(() => {
    if (inProgress) setConceded(false)
  }, [inProgress])

  if (inProgress) return null

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
