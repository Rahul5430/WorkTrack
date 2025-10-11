import userReducer, {
	GoogleUser,
	logout,
	setErrorMessage,
	setIsFetching,
	setLoggedIn,
	setToken,
	setUser,
	UserState,
} from '../../../../src/store/reducers/userSlice';

describe('userSlice', () => {
	const initialState: UserState = {
		user: null,
		token: null,
		isLoggedIn: null,
		isFetching: false,
		errorMessage: null,
	};

	it('should return the initial state', () => {
		expect(userReducer(undefined, { type: 'unknown' })).toEqual(
			initialState
		);
	});

	it('should handle setUser', () => {
		const user: GoogleUser = {
			id: '123',
			name: 'John Doe',
			email: 'john@example.com',
			photo: 'photo.jpg',
		};

		const actual = userReducer(initialState, setUser(user));
		expect(actual.user).toEqual(user);
	});

	it('should handle setToken', () => {
		const token = 'test-token-123';
		const actual = userReducer(initialState, setToken(token));
		expect(actual.token).toEqual(token);
	});

	it('should handle setLoggedIn', () => {
		const actual = userReducer(initialState, setLoggedIn(true));
		expect(actual.isLoggedIn).toEqual(true);

		const actualFalse = userReducer(initialState, setLoggedIn(false));
		expect(actualFalse.isLoggedIn).toEqual(false);
	});

	it('should handle logout', () => {
		const stateWithUser: UserState = {
			user: {
				id: '123',
				name: 'John Doe',
				email: 'john@example.com',
			},
			token: 'test-token',
			isLoggedIn: true,
			isFetching: false,
			errorMessage: null,
		};

		const actual = userReducer(stateWithUser, logout());
		expect(actual.user).toBeNull();
		expect(actual.token).toBeNull();
		expect(actual.isLoggedIn).toBe(false);
	});

	it('should handle setIsFetching', () => {
		const actual = userReducer(initialState, setIsFetching(true));
		expect(actual.isFetching).toEqual(true);

		const actualFalse = userReducer(initialState, setIsFetching(false));
		expect(actualFalse.isFetching).toEqual(false);
	});

	it('should handle setErrorMessage', () => {
		const errorMessage = 'Something went wrong';
		const actual = userReducer(initialState, setErrorMessage(errorMessage));
		expect(actual.errorMessage).toEqual(errorMessage);

		const actualNull = userReducer(initialState, setErrorMessage(null));
		expect(actualNull.errorMessage).toBeNull();
	});

	it('should handle multiple actions', () => {
		const user: GoogleUser = {
			id: '123',
			name: 'John Doe',
			email: 'john@example.com',
		};

		let state = userReducer(initialState, setUser(user));
		state = userReducer(state, setToken('test-token'));
		state = userReducer(state, setLoggedIn(true));

		expect(state.user).toEqual(user);
		expect(state.token).toEqual('test-token');
		expect(state.isLoggedIn).toEqual(true);
	});

	it('should handle partial user updates', () => {
		const user: GoogleUser = {
			id: '123',
			name: 'John Doe',
			email: 'john@example.com',
			photo: 'photo.jpg',
		};

		const state = userReducer(initialState, setUser(user));
		expect(state.user).toEqual(user);
		expect(state.user?.photo).toBe('photo.jpg');
	});

	it('should handle empty string token', () => {
		const actual = userReducer(initialState, setToken(''));
		expect(actual.token).toEqual('');
	});

	it('should handle null user', () => {
		const actual = userReducer(
			initialState,
			setUser(null as unknown as GoogleUser)
		);
		expect(actual.user).toBeNull();
	});

	it('should preserve other state properties when updating single property', () => {
		const user: GoogleUser = {
			id: '123',
			name: 'John Doe',
			email: 'john@example.com',
		};

		let state = userReducer(initialState, setUser(user));
		state = userReducer(state, setToken('test-token'));
		state = userReducer(state, setIsFetching(true));

		// Update just the error message
		state = userReducer(state, setErrorMessage('New error'));

		expect(state.user).toEqual(user);
		expect(state.token).toEqual('test-token');
		expect(state.isFetching).toBe(true);
		expect(state.errorMessage).toEqual('New error');
	});

	it('should handle logout from different initial states', () => {
		const stateWithData: UserState = {
			user: {
				id: '456',
				name: 'Jane Doe',
				email: 'jane@example.com',
				photo: 'jane.jpg',
			},
			token: 'jane-token',
			isLoggedIn: true,
			isFetching: true,
			errorMessage: 'Some error',
		};

		const actual = userReducer(stateWithData, logout());
		expect(actual.user).toBeNull();
		expect(actual.token).toBeNull();
		expect(actual.isLoggedIn).toBe(false);
		// logout doesn't reset isFetching and errorMessage
		expect(actual.isFetching).toBe(true);
		expect(actual.errorMessage).toBe('Some error');
	});

	it('should handle unknown action types', () => {
		const unknownAction = { type: 'unknown/action' };
		const actual = userReducer(initialState, unknownAction);
		expect(actual).toEqual(initialState);
	});
});
