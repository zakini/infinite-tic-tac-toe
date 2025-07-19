import { type FormEventHandler, useState } from 'react'
import useGameStore from './store'
import { assertIsBoardCondition, BoardCondition } from './types'

export default function DevTools() {
  const [boardCondition, setBoardCondition] = useState(BoardCondition.Empty)
  const [depth, setDepth] = useState<number | null>(1)
  const forceBoardCondition = useGameStore(store => store.forceBoardCondition)

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()

    if (depth === null) throw new Error('Depth cannot be null')
    forceBoardCondition(boardCondition, depth)
  }

  return (
    // TODO move into collapsible thing (fixed to bottom corner?)
    <aside>
      <h2>Dev Tools</h2>
      <form onSubmit={onSubmit}>
        <label htmlFor="board-state">Board State</label>
        <select
          name="board-state"
          required
          value={boardCondition}
          onChange={(e) => {
            const key = e.target.value
            assertIsBoardCondition(key)
            setBoardCondition(key)
          }}
        >
          {Object.keys(BoardCondition).filter(n => isNaN(Number(n))).map((k) => {
            assertIsBoardCondition(k)
            return (
              <option key={k} value={k}>{k}</option>
            )
          })}
        </select>

        <label htmlFor="depth">Depth</label>
        <input
          name="depth"
          type="number"
          required
          min={1}
          step={1}
          value={depth ?? ''}
          onChange={(e) => {
            const numberValue = Number(e.target.value)
            if (e.target.value.trim() === '' || isNaN(numberValue)) setDepth(null)
            else setDepth(numberValue)
          }}
        />

        <button type="submit">Apply</button>
      </form>
    </aside>
  )
}
