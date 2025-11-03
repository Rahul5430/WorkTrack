import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';

import { useDI as useContainer } from '@/app/providers/DIProvider';
import { setUser, userSlice } from '@/app/store/reducers/userSlice';
import { AuthServiceIdentifiers } from '@/features/auth/di';
import { User } from '@/features/auth/domain/entities/User';
import { useAuth } from '@/features/auth/ui/hooks/useAuth';

jest.mock('@/app/providers/DIProvider', () => ({
	useDI: jest.fn(),
}));

const useDI = useContainer as jest.MockedFunction<typeof useContainer>;

describe('useAuth', () => {
	let store: ReturnType<typeof configureStore>;
	let mockContainer: {
		resolve: jest.Mock;
	};
	let mockSignInUseCase: {
		execute: jest.Mock;
	};
	let mockSignOutUseCase: {
		execute: jest.Mock;
	};
	let mockCheckAuthStateUseCase: {
		execute: jest.Mock;
	};

	const wrapper = ({ children }: { children: React.ReactNode }) =>
		React.createElement(
			Provider,
			{ store } as React.ComponentProps<typeof Provider>,
			children
		);

	beforeEach(() => {
		jest.clearAllMocks();

		store = configureStore({
			reducer: {
				user: userSlice.reducer,
			},
		});

		mockSignInUseCase = {
			execute: jest.fn(),
		};

		mockSignOutUseCase = {
			execute: jest.fn(),
		};

		mockCheckAuthStateUseCase = {
			execute: jest.fn(),
		};

		mockContainer = {
			resolve: jest.fn((identifier) => {
				if (identifier === AuthServiceIdentifiers.SIGN_IN_USE_CASE) {
					return mockSignInUseCase;
				}
				if (identifier === AuthServiceIdentifiers.SIGN_OUT_USE_CASE) {
					return mockSignOutUseCase;
				}
				if (
					identifier ===
					AuthServiceIdentifiers.CHECK_AUTH_STATE_USE_CASE
				) {
					return mockCheckAuthStateUseCase;
				}
				return null;
			}),
		};

		useDI.mockReturnValue(
			mockContainer as unknown as ReturnType<typeof useContainer>
		);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should return initial state', () => {
		const { result } = renderHook(() => useAuth(), { wrapper });

		expect(result.current.user).toBeNull();
		expect(result.current.isLoggedIn).toBeNull();
		expect(result.current.isLoading).toBe(false);
		expect(result.current.signIn).toBeDefined();
		expect(result.current.signOut).toBeDefined();
		expect(result.current.updateUser).toBeDefined();
		expect(result.current.checkAuthState).toBeDefined();
	});

	it('should select user state from Redux', () => {
		const testUser = {
			id: 'user-1',
			email: 'test@example.com',
			name: 'Test User',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		act(() => {
			store.dispatch(setUser(testUser));
		});

		const { result } = renderHook(() => useAuth(), { wrapper });

		expect(result.current.user).toEqual(testUser);
		expect(result.current.isLoggedIn).toBe(true);
	});

	describe('signIn', () => {
		it('should sign in successfully', async () => {
			const domainUser = new User(
				'user-123',
				'user@example.com',
				'User Name',
				'https://example.com/photo.jpg'
			);

			mockSignInUseCase.execute.mockResolvedValue(domainUser);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				await result.current.signIn();
			});

			expect(mockSignInUseCase.execute).toHaveBeenCalled();
			expect(result.current.isLoading).toBe(false);
			expect(result.current.user).toBeDefined();
			expect(result.current.user?.id).toBe('user-123');
			expect(result.current.user?.email).toBe('user@example.com');
			expect(result.current.user?.name).toBe('User Name');
			expect(result.current.isLoggedIn).toBe(true);
		});

		it('should set loading state during sign in', async () => {
			const domainUser = new User(
				'user-123',
				'user@example.com',
				'User Name'
			);

			mockSignInUseCase.execute.mockResolvedValue(domainUser);

			const { result } = renderHook(() => useAuth(), { wrapper });

			expect(result.current.isLoading).toBe(false);

			await act(async () => {
				await result.current.signIn();
			});

			expect(result.current.isLoading).toBe(false);
		});

		it('should handle sign in errors', async () => {
			const error = new Error('Sign in failed');
			mockSignInUseCase.execute.mockRejectedValue(error);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				try {
					await result.current.signIn();
				} catch {
					// Expected to throw
				}
			});

			expect(mockSignInUseCase.execute).toHaveBeenCalled();
			expect(result.current.isLoading).toBe(false);
			expect(result.current.user).toBeNull();
		});

		it('should convert domain user to app user correctly', async () => {
			const createdAt = new Date('2024-01-01T00:00:00Z');
			const updatedAt = new Date('2024-01-02T00:00:00Z');
			const domainUser = new User(
				'user-123',
				'user@example.com',
				'User Name',
				'https://example.com/photo.jpg',
				createdAt,
				updatedAt
			);

			mockSignInUseCase.execute.mockResolvedValue(domainUser);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				await result.current.signIn();
			});

			expect(result.current.user).toEqual({
				id: 'user-123',
				email: 'user@example.com',
				name: 'User Name',
				photo: 'https://example.com/photo.jpg',
				createdAt: createdAt.toISOString(),
				updatedAt: updatedAt.toISOString(),
			});
		});

		it('should handle user without photoUrl', async () => {
			const domainUser = new User(
				'user-123',
				'user@example.com',
				'User Name',
				undefined
			);

			mockSignInUseCase.execute.mockResolvedValue(domainUser);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				await result.current.signIn();
			});

			expect(result.current.user).toEqual({
				id: 'user-123',
				email: 'user@example.com',
				name: 'User Name',
				photo: undefined,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			});
		});
	});

	describe('signOut', () => {
		it('should sign out successfully', async () => {
			const testUser = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			act(() => {
				store.dispatch(setUser(testUser));
			});

			mockSignOutUseCase.execute.mockResolvedValue(undefined);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				await result.current.signOut();
			});

			expect(mockSignOutUseCase.execute).toHaveBeenCalled();
			expect(result.current.isLoading).toBe(false);
			expect(result.current.user).toBeNull();
			expect(result.current.isLoggedIn).toBe(false);
		});

		it('should set loading state during sign out', async () => {
			const testUser = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			act(() => {
				store.dispatch(setUser(testUser));
			});

			mockSignOutUseCase.execute.mockResolvedValue(undefined);

			const { result } = renderHook(() => useAuth(), { wrapper });

			expect(result.current.isLoading).toBe(false);

			await act(async () => {
				await result.current.signOut();
			});

			expect(result.current.isLoading).toBe(false);
		});

		it('should handle sign out errors', async () => {
			const testUser = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			act(() => {
				store.dispatch(setUser(testUser));
			});

			const error = new Error('Sign out failed');
			mockSignOutUseCase.execute.mockRejectedValue(error);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				try {
					await result.current.signOut();
				} catch {
					// Expected to throw
				}
			});

			expect(mockSignOutUseCase.execute).toHaveBeenCalled();
			expect(result.current.isLoading).toBe(false);
		});
	});

	describe('updateUser', () => {
		it('should update user information', () => {
			const { result } = renderHook(() => useAuth(), { wrapper });

			const testUser = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			act(() => {
				result.current.updateUser(testUser);
			});

			expect(result.current.user).toEqual(testUser);
			expect(result.current.isLoggedIn).toBe(true);
		});

		it('should clear user when null is passed', () => {
			const testUser = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			act(() => {
				store.dispatch(setUser(testUser));
			});

			const { result } = renderHook(() => useAuth(), { wrapper });

			act(() => {
				result.current.updateUser(null);
			});

			expect(result.current.user).toBeNull();
			expect(result.current.isLoggedIn).toBe(false);
		});
	});

	describe('checkAuthState', () => {
		it('should set user when authenticated', async () => {
			const domainUser = new User(
				'user-123',
				'user@example.com',
				'User Name'
			);

			mockCheckAuthStateUseCase.execute.mockResolvedValue(domainUser);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				await result.current.checkAuthState();
			});

			expect(mockCheckAuthStateUseCase.execute).toHaveBeenCalled();
			expect(result.current.user).toBeDefined();
			expect(result.current.user?.id).toBe('user-123');
			expect(result.current.isLoggedIn).toBe(true);
		});

		it('should not set user when not authenticated', async () => {
			mockCheckAuthStateUseCase.execute.mockResolvedValue(null);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				await result.current.checkAuthState();
			});

			expect(mockCheckAuthStateUseCase.execute).toHaveBeenCalled();
			expect(result.current.user).toBeNull();
			expect(result.current.isLoggedIn).toBeNull();
		});

		it('should convert domain user to app user correctly', async () => {
			const createdAt = new Date('2024-01-01T00:00:00Z');
			const updatedAt = new Date('2024-01-02T00:00:00Z');
			const domainUser = new User(
				'user-123',
				'user@example.com',
				'User Name',
				'https://example.com/photo.jpg',
				createdAt,
				updatedAt
			);

			mockCheckAuthStateUseCase.execute.mockResolvedValue(domainUser);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				await result.current.checkAuthState();
			});

			expect(result.current.user).toEqual({
				id: 'user-123',
				email: 'user@example.com',
				name: 'User Name',
				photo: 'https://example.com/photo.jpg',
				createdAt: createdAt.toISOString(),
				updatedAt: updatedAt.toISOString(),
			});
		});
	});

	it('should maintain function references across renders', () => {
		const { result, rerender } = renderHook(() => useAuth(), { wrapper });

		const firstSignIn = result.current.signIn;
		const firstSignOut = result.current.signOut;
		const firstUpdateUser = result.current.updateUser;
		const firstCheckAuthState = result.current.checkAuthState;

		rerender({});

		expect(result.current.signIn).toBe(firstSignIn);
		expect(result.current.signOut).toBe(firstSignOut);
		expect(result.current.updateUser).toBe(firstUpdateUser);
		expect(result.current.checkAuthState).toBe(firstCheckAuthState);
	});
});
