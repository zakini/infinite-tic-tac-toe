import { useState } from 'react'
import useGameStore from './store'
import { useShallow } from 'zustand/shallow'
import { findWin } from './utils'

type Props = {
  className?: string
}

export default function Results({ className = 'relative' }: Props) {
  const [conceded, setConceded] = useState(false)
  const [boardState, goDeeper] = useGameStore(useShallow(state => [state.boardState, state.goDeeper]))
  const win = findWin(boardState)

  if (!win) return null

  return (
    <div className={className} role="dialog" aria-labelledby="results-title">
      <div className="absolute inset-0 bg-black opacity-50" />

      <div id="results-title">Game Over: {win.player} wins</div>
      {!conceded && (
        <div className="absolute flex gap-2">
          <button className="bg-white" onClick={() => setConceded(true)}>Concede</button>
          <button className="bg-white" onClick={() => goDeeper()}>Go Deeper</button>
        </div>
      )}
    </div>
  )
}
