'use client'

import { Settings } from 'lucide-react'
import { useState } from 'react'
import useGameStore from '@/components/tic-tac-toe-board/store'
import {
  assertIsBoardCondition, BoardCondition, boardConditionLabel,
} from '@/components/tic-tac-toe-board/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

export default function DevTools() {
  const [open, setOpen] = useState(false)
  const [boardState, setBoardState] = useState(BoardCondition.Empty)
  const [depth, setDepth] = useState<number | null>(1)
  const forceBoardCondition = useGameStore(store => store.forceBoardCondition)

  const handleApply = () => {
    if (depth === null) throw new Error('Depth cannot be null')
    forceBoardCondition(boardState, depth)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className={`
            fixed right-6 bottom-6 h-12 w-12 rounded-full shadow-lg
            transition-shadow
            hover:shadow-xl
          `}
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">Open dev tools</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end" side="top" sideOffset={8}>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Dev Tools</h4>
            <p className="text-sm text-gray-500">Put the board into a specific state</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="board-state">Board State</Label>
              <Select
                required
                value={boardState}
                onValueChange={(value) => {
                  assertIsBoardCondition(value)
                  setBoardState(value)
                }}
              >
                <SelectTrigger name="board-state">
                  <SelectValue placeholder="Select board state" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(BoardCondition).filter(n => isNaN(Number(n))).map((k) => {
                    assertIsBoardCondition(k)
                    return (
                      <SelectItem key={k} value={k}>{boardConditionLabel(k)}</SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="depth">Depth</Label>
              <Input
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
            </div>

            <Button onClick={handleApply} className="w-full" disabled={!boardState || !depth}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
