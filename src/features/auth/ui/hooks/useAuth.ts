// migrated to V2 structure
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch, RootState } from '@/store';
import { logout, setUser } from '@/store/reducers/userSlice';

export const useAuth = () => {
	const dispatch = useDispatch<AppDispatch>();
	const user = useSelector((state: RootState) => state.user.user);
	const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
	const isLoading = useSelector((state: RootState) => state.user.isFetching);

	const signOut = useCallback(() => {
		dispatch(logout());
	}, [dispatch]);

	const updateUser = useCallback(
		(userData: unknown) => {
			dispatch(setUser(userData));
		},
		[dispatch]
	);

	return {
		user,
		isLoggedIn,
		isLoading,
		signOut,
		updateUser,
	};
};
