import { create } from 'zustand'
import createCoreSlice, { CoreSlice } from './core-slice'
import createDevToolsSlice, { DevToolsSlice } from './dev-tools-slice'

// We have to specify the type of this store when using the slices pattern
// See: https://github.com/pmndrs/zustand/issues/508#issuecomment-885469427
const useGameStore = create<CoreSlice & DevToolsSlice>((...args) => ({
  ...createCoreSlice(...args),
  // TODO only include dev tools if NODE_ENV === 'development'
  ...createDevToolsSlice(...args),
}))

export default useGameStore
