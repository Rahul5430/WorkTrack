import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GoogleUser {
	id: string;
	name: string;
	email: string;
	photo?: string;
}

export interface UserState {
	user: GoogleUser | null;
	token: string | null;
	isLoggedIn: boolean;
	isFetching: boolean;
	errorMessage: string | null;
}

const initialState: UserState = {
	user: null,
	token: null,
	isLoggedIn: false,
	isFetching: false,
	errorMessage: null,
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setUser(state, action: PayloadAction<GoogleUser>) {
			state.user = action.payload;
		},
		setToken(state, action: PayloadAction<string>) {
			state.token = action.payload;
		},
		setLoggedIn(state, action: PayloadAction<boolean>) {
			state.isLoggedIn = action.payload;
		},
		logout(state) {
			state.user = null;
			state.token = null;
			state.isLoggedIn = false;
		},
		setIsFetching(state, action: PayloadAction<boolean>) {
			state.isFetching = action.payload;
		},
		setErrorMessage(state, action: PayloadAction<string | null>) {
			state.errorMessage = action.payload;
		},
	},
});

export const {
	setUser,
	setToken,
	setLoggedIn,
	logout,
	setIsFetching,
	setErrorMessage,
} = userSlice.actions;

export default userSlice.reducer;
