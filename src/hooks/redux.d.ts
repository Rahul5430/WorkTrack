import { TypedUseSelectorHook } from 'react-redux';

import type { AppDispatch, RootState } from '../store';

declare const useAppDispatch: () => AppDispatch;
declare const useAppSelector: TypedUseSelectorHook<RootState>;

export { useAppDispatch, useAppSelector };
