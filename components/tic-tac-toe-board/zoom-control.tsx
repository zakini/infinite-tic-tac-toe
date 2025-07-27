import { useShallow } from 'zustand/shallow'
import useGameStore from './store'

export default function ZoomControl() {
  const [zoomPath, zoomOut] = useGameStore(useShallow(state => [state.zoomPath, state.zoomOut]))

  if (zoomPath.length <= 0) return null

  return (
    <div>
      <ol className="flex justify-end gap-1">
        {zoomPath.map((s, i) => (
          <li key={i}>
            &gt; ({s % 3}, {Math.floor(s / 3)})
          </li>
        ))}
      </ol>

      <button onClick={() => zoomOut()}>Zoom Out</button>
    </div>
  )
}
