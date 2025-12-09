// migrated to V2 structure
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
	id: string;
	name: string;
	email: string;
	photo?: string;
	workTrackId?: string;
	createdAt: string;
	updatedAt: string;
}

export interface UserState {
	user: User | null;
	isLoggedIn: boolean | null;
	loading: boolean;
	error: string | null;
}

const initialState: UserState = {
	user: null,
	isLoggedIn: null,
	loading: false,
	error: null,
};

export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<User | null>) => {
			state.user = action.payload;
			state.isLoggedIn = action.payload !== null;
		},
		setLoggedIn: (state, action: PayloadAction<boolean>) => {
			state.isLoggedIn = action.payload;
		},
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
		setErrorMessage: (state, action: PayloadAction<string>) => {
			state.error = action.payload;
		},
		clearUser: (state) => {
			state.user = null;
			state.isLoggedIn = false;
		},
	},
});

export const {
	setUser,
	setLoggedIn,
	setLoading,
	setError,
	setErrorMessage,
	clearUser,
} = userSlice.actions;

export default userSlice.reducer;
