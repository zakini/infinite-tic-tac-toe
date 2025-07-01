import classNames from 'classnames'
import { type JSX } from 'react'
import { useShallow } from 'zustand/shallow'
import useGameStore from './store'
import { type BoardState, isBoardState } from './types'
import { findWin, pickNestedBoardState, turnValid } from './utils'

const maxDisplayDepth = 3

type Props = {
  cellPath?: number[]
  disabled?: boolean | null
}

const calcBoardDepth = (board: BoardState): number => isBoardState(board[0])
  ? calcBoardDepth(board[0]) + 1
  : 1

export default function Board({ cellPath = [], disabled = null }: Props) {
  const [fullBoardState, takeTurn, turnPath, zoomPath, zoomIn] = useGameStore(useShallow(
    state => [state.boardState, state.takeTurn, state.turnPath, state.zoomPath, state.zoomIn],
  ))

  const trueCellPath = [...zoomPath, ...cellPath]
  const boardState = pickNestedBoardState(fullBoardState, trueCellPath)

  const displayDepthAdjustment = Math.max(0, calcBoardDepth(fullBoardState) - maxDisplayDepth)
  const boardDepth = calcBoardDepth(boardState)
  const displayDepth = boardDepth - displayDepthAdjustment

  const canZoomIn = cellPath.length === 1 && boardDepth > 1
  const belowZoomTarget = cellPath.length > 1

  const win = findWin(boardState)
  const winCells = win ? win.cells : null

  const showSummary = win !== null && cellPath.length > 0
  const showUnknown = cellPath.length >= maxDisplayDepth

  if (showSummary || showUnknown) {
    return (
      <section
        aria-label={
          showSummary
            ? `sub-board ${win ? `won by ${win.player}` : 'drawn'}`
            : 'sub-board with unknown state'
        }
        className="size-full"
        // Each sub-board adds 1px of 'padding' (via gap)
        // Mimic this for this summary by adding 1px of real padding per level this summarises
        style={{ padding: displayDepth }}
      >
        <div
          className={classNames(
            'size-full',
            showSummary && win ? 'bg-green-500' : 'bg-gray-400',
          )}
        >
          {showSummary ? (win || null)?.player ?? '-' : '?'}
        </div>
      </section>
    )
  }

  // Buttons cannot be nested inside each other. If the user should be able to zoom, then the
  // container should be a button, otherwise the cell should be a button
  // NOTE just adding a click handler to the container works, but it's bad for accessibility and
  // means we have to deal with event bubbling
  const Container = (canZoomIn
    ? 'button'
    : 'section') satisfies keyof JSX.IntrinsicElements
  const Cell = (canZoomIn || belowZoomTarget
    ? 'section'
    : 'button') satisfies keyof JSX.IntrinsicElements

  return (
    <Container
      aria-label={`in-progress ${cellPath.length <= 0 ? 'board' : 'sub-board'}`}
      className={classNames(
        'grid aspect-square w-full grid-cols-3 grid-rows-3 gap-px bg-black p-px',
        {
          'hover:ring hover:ring-red-500 focus:ring focus:ring-red-500':
            Container === 'button',
        },
      )}
      {...(
        Container === 'button'
          ? {
              onClick: () => zoomIn(trueCellPath),
            }
          : {}
      )}
    >
      {boardState.map((cell, i) => {
        const subBoardDisabled = disabled || !turnValid([...trueCellPath, i], turnPath)
        const cellDisabled = disabled || win !== null || cell !== null
        const cellPartOfWin = winCells?.includes(i)

        return isBoardState(cell)
          ? (
              <Board key={i} cellPath={[...cellPath, i]} disabled={subBoardDisabled} />
            )
          : (
              <Cell
                key={i}
                aria-label={cell === null ? 'empty cell' : `cell taken by ${cell}`}
                className={classNames(
                  'relative aspect-square',
                  {
                    'bg-green-500': cellPartOfWin,
                    // Handle disabled styling manually, since disabled won't apply when this isn't
                    // rendering as a button
                    'bg-gray-400': !cellPartOfWin && cellDisabled,
                    'bg-white': !cellPartOfWin && !cellDisabled,
                  },
                )}
                {...(
                  Cell === 'button'
                    ? {
                        disabled: cellDisabled,
                        onClick: () => {
                          // Do nothing and let this event bubble up so we can zoom in instead
                          if (belowZoomTarget) return

                          // This is a bug in Typescript. Use 'as' to override
                          // See: https://github.com/microsoft/TypeScript/issues/60463
                          takeTurn([...trueCellPath, i] as unknown as [number, ...number[]])
                        },
                      }
                    : {}
                )}
              >
                <span className="absolute">{cell}</span>
              </Cell>
            )
      })}
    </Container>
  )
}
