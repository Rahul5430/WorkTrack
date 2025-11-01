import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useDI as useContainer } from '@/app/providers/DIProvider';
import {
	AppDispatch,
	clearUser as logout,
	RootState,
	setUser,
	type User as AppUser,
} from '@/app/store';
import { AuthServiceIdentifiers } from '@/features/auth/di';
import {
	CheckAuthStateUseCase,
	SignInUseCase,
	SignOutUseCase,
} from '@/features/auth/domain/use-cases';

/**
 * Custom hook for authentication
 * Provides auth state and actions
 */
export const useAuth = () => {
	const dispatch = useDispatch<AppDispatch>();
	const container = useContainer();

	const user = useSelector((state: RootState) => state.user.user);
	const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
	const isLoading = useSelector((state: RootState) => state.user.loading);

	const [isSigningIn, setIsSigningIn] = useState(false);
	const [isSigningOut, setIsSigningOut] = useState(false);

	/**
	 * Sign in with Google
	 */
	const signIn = useCallback(async () => {
		try {
			setIsSigningIn(true);

			const signInUseCase = container.resolve<SignInUseCase>(
				AuthServiceIdentifiers.SIGN_IN_USE_CASE
			);

			const domainUser = await signInUseCase.execute();

			// Convert domain user to app user
			const appUser: AppUser = {
				id: domainUser.id,
				name: domainUser.name,
				email: domainUser.email.value,
				photo: domainUser.photoUrl,
				createdAt: domainUser.createdAt.toISOString(),
				updatedAt: domainUser.updatedAt.toISOString(),
			};

			dispatch(setUser(appUser));
		} catch (error) {
			// Error handling
			throw error;
		} finally {
			setIsSigningIn(false);
		}
	}, [container, dispatch]);

	/**
	 * Sign out
	 */
	const signOut = useCallback(async () => {
		try {
			setIsSigningOut(true);

			const signOutUseCase = container.resolve<SignOutUseCase>(
				AuthServiceIdentifiers.SIGN_OUT_USE_CASE
			);

			await signOutUseCase.execute();

			dispatch(logout());
		} catch (error) {
			// Error handling
			throw error;
		} finally {
			setIsSigningOut(false);
		}
	}, [container, dispatch]);

	/**
	 * Update user information
	 */
	const updateUser = useCallback(
		(userData: AppUser | null) => {
			dispatch(setUser(userData));
		},
		[dispatch]
	);

	/**
	 * Check authentication state
	 */
	const checkAuthState = useCallback(async () => {
		const checkAuthStateUseCase = container.resolve<CheckAuthStateUseCase>(
			AuthServiceIdentifiers.CHECK_AUTH_STATE_USE_CASE
		);

		const domainUser = await checkAuthStateUseCase.execute();

		if (domainUser) {
			const appUser: AppUser = {
				id: domainUser.id,
				name: domainUser.name,
				email: domainUser.email.value,
				photo: domainUser.photoUrl,
				createdAt: domainUser.createdAt.toISOString(),
				updatedAt: domainUser.updatedAt.toISOString(),
			};

			dispatch(setUser(appUser));
		}
	}, [container, dispatch]);

	return {
		user,
		isLoggedIn,
		isLoading: isLoading || isSigningIn || isSigningOut,
		signIn,
		signOut,
		updateUser,
		checkAuthState,
	};
};
