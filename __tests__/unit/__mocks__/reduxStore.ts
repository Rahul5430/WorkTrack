import { Store } from 'redux';

// Create a proper Redux store mock that satisfies the Store interface
export const createMockStore = (state: unknown): Store =>
	({
		getState: () => state,
		dispatch: jest.fn(),
		subscribe: jest.fn(),
		replaceReducer: jest.fn(),
		[Symbol.observable]: jest.fn(),
	}) as Store;
