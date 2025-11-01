// migrated to V2 structure
import { configureStore } from '@reduxjs/toolkit';

import userReducer from './reducers/userSlice';
import workTrackReducer from './reducers/workTrackSlice';

export const store = configureStore({
	reducer: {
		user: userReducer,
		workTrack: workTrackReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
