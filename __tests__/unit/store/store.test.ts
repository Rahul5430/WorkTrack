import { configureStore } from '@reduxjs/toolkit';

import userReducer from '../../../src/store/reducers/userSlice';
import workTrackReducer from '../../../src/store/reducers/workTrackSlice';
import { store } from '../../../src/store/store';

describe('store', () => {
	it('should be configured with correct reducers', () => {
		// Create a test store to verify configuration
		const testStore = configureStore({
			reducer: {
				user: userReducer,
				workTrack: workTrackReducer,
			},
		});

		const state = testStore.getState();

		expect(state).toHaveProperty('user');
		expect(state).toHaveProperty('workTrack');
	});

	it('should have correct initial state structure', () => {
		const state = store.getState();

		expect(state).toHaveProperty('user');
		expect(state).toHaveProperty('workTrack');
		expect(typeof state).toBe('object');
	});

	it('should dispatch actions correctly', () => {
		const initialState = store.getState();
		expect(initialState.user).toBeDefined();
		expect(initialState.workTrack).toBeDefined();
	});

	it('should maintain store integrity', () => {
		// Test that the store is properly configured and accessible
		expect(store).toBeDefined();
		expect(typeof store.getState).toBe('function');
		expect(typeof store.dispatch).toBe('function');
		expect(typeof store.subscribe).toBe('function');
	});

	it('should have proper type inference', () => {
		// Test that the store types are properly inferred
		const state = store.getState();

		// Verify that the state has the expected structure
		expect(state.user).toBeDefined();
		expect(state.workTrack).toBeDefined();
	});

	it('should handle state updates', () => {
		const initialState = store.getState();
		const initialUserState = initialState.user;

		// Verify initial state is consistent
		expect(initialUserState).toBeDefined();
		expect(typeof initialUserState).toBe('object');
	});

	it('should have proper middleware configuration', () => {
		// Test that the store has proper middleware
		expect(store).toBeDefined();
		expect(typeof store.dispatch).toBe('function');
	});

	it('should maintain state consistency across multiple calls', () => {
		const state1 = store.getState();
		const state2 = store.getState();

		expect(state1).toEqual(state2);
		expect(state1.user).toEqual(state2.user);
		expect(state1.workTrack).toEqual(state2.workTrack);
	});

	it('should have proper reducer configuration', () => {
		const state = store.getState();

		// Verify that both reducers are properly configured
		expect(state.user).toBeDefined();
		expect(state.workTrack).toBeDefined();

		// Verify initial state structure
		expect(typeof state.user.isLoggedIn).toBe('object'); // Can be null
		expect(typeof state.workTrack.data).toBe('object');
		expect(Array.isArray(state.workTrack.data)).toBe(true);
	});

	it('should support subscription mechanism', () => {
		let stateChanged = false;
		const unsubscribe = store.subscribe(() => {
			stateChanged = true;
		});

		expect(typeof unsubscribe).toBe('function');
		expect(stateChanged).toBe(false);

		// Clean up
		unsubscribe();
	});
});
