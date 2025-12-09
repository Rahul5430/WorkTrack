import { store } from '@/app/store/store';

describe('store', () => {
	it('should export a configured store', () => {
		expect(store).toBeDefined();
		expect(store.getState).toBeDefined();
		expect(typeof store.getState).toBe('function');
		expect(store.dispatch).toBeDefined();
		expect(typeof store.dispatch).toBe('function');
	});

	it('should have initial state', () => {
		const state = store.getState();
		expect(state).toBeDefined();
		expect(state.user).toBeDefined();
		expect(state.workTrack).toBeDefined();
	});

	it('should have user reducer in state', () => {
		const state = store.getState();
		expect(state.user).toEqual({
			user: null,
			isLoggedIn: null,
			loading: false,
			error: null,
		});
	});

	it('should have workTrack reducer in state', () => {
		const state = store.getState();
		expect(state.workTrack).toEqual({
			loading: false,
			error: null,
			data: null,
		});
	});

	it('should export RootState type', () => {
		// Type check - verify that RootState can be inferred
		const state = store.getState();
		expect(state).toBeDefined();
		// Verify type exists (compile-time check)
		type RootState = ReturnType<typeof store.getState>;

		const _typeCheck: RootState = state;
		expect(_typeCheck).toBeDefined();
	});

	it('should export AppDispatch type', () => {
		// Type check - verify that AppDispatch can be used
		const dispatch = store.dispatch;
		expect(dispatch).toBeDefined();
		// Verify type exists (compile-time check)
		type AppDispatch = typeof store.dispatch;

		const _typeCheck: AppDispatch = dispatch;
		expect(_typeCheck).toBeDefined();
	});
});
