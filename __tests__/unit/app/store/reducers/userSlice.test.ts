import {
	clearUser,
	setError,
	setErrorMessage,
	setLoading,
	setLoggedIn,
	setUser,
	User,
	userSlice,
} from '@/app/store/reducers/userSlice';

describe('userSlice', () => {
	const initialState = {
		user: null,
		isLoggedIn: null,
		loading: false,
		error: null,
	};

	describe('setUser', () => {
		it('sets user and updates isLoggedIn to true', () => {
			const user: User = {
				id: 'user-1',
				name: 'Test User',
				email: 'test@example.com',
				createdAt: '2024-01-01',
				updatedAt: '2024-01-02',
			};

			const action = setUser(user);
			const state = userSlice.reducer(initialState, action);

			expect(state.user).toEqual(user);
			expect(state.isLoggedIn).toBe(true);
		});

		it('sets user to null and updates isLoggedIn to false', () => {
			const action = setUser(null);
			const state = userSlice.reducer(initialState, action);

			expect(state.user).toBeNull();
			expect(state.isLoggedIn).toBe(false);
		});
	});

	describe('setLoggedIn', () => {
		it('sets isLoggedIn to true', () => {
			const action = setLoggedIn(true);
			const state = userSlice.reducer(initialState, action);

			expect(state.isLoggedIn).toBe(true);
		});

		it('sets isLoggedIn to false', () => {
			const action = setLoggedIn(false);
			const state = userSlice.reducer(initialState, action);

			expect(state.isLoggedIn).toBe(false);
		});
	});

	describe('setLoading', () => {
		it('sets loading to true', () => {
			const action = setLoading(true);
			const state = userSlice.reducer(initialState, action);

			expect(state.loading).toBe(true);
		});

		it('sets loading to false', () => {
			const action = setLoading(false);
			const state = userSlice.reducer(initialState, action);

			expect(state.loading).toBe(false);
		});
	});

	describe('setError', () => {
		it('sets error message', () => {
			const action = setError('Error occurred');
			const state = userSlice.reducer(initialState, action);

			expect(state.error).toBe('Error occurred');
		});

		it('clears error when set to null', () => {
			const stateWithError = userSlice.reducer(
				initialState,
				setError('Error')
			);
			const action = setError(null);
			const state = userSlice.reducer(stateWithError, action);

			expect(state.error).toBeNull();
		});
	});

	describe('setErrorMessage', () => {
		it('sets error message', () => {
			const action = setErrorMessage('New error');
			const state = userSlice.reducer(initialState, action);

			expect(state.error).toBe('New error');
		});
	});

	describe('clearUser', () => {
		it('clears user and sets isLoggedIn to false', () => {
			const user: User = {
				id: 'user-1',
				name: 'Test User',
				email: 'test@example.com',
				createdAt: '2024-01-01',
				updatedAt: '2024-01-02',
			};
			const stateWithUser = userSlice.reducer(
				initialState,
				setUser(user)
			);

			const action = clearUser();
			const state = userSlice.reducer(stateWithUser, action);

			expect(state.user).toBeNull();
			expect(state.isLoggedIn).toBe(false);
		});
	});
});
