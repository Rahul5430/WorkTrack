import {
	getAuth,
	GoogleAuthProvider,
	signInWithCredential,
	signOut as firebaseSignOut,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { FirebaseAuthService } from '@/features/auth/data/services/FirebaseAuthService';
import { AuthSession } from '@/features/auth/domain/entities/AuthSession';
import { User } from '@/features/auth/domain/entities/User';
import { AuthenticationError } from '@/shared/domain/errors';

jest.mock('@react-native-google-signin/google-signin', () => ({
	GoogleSignin: {
		hasPlayServices: jest.fn(),
		signIn: jest.fn(),
		signOut: jest.fn(),
	},
}));

jest.mock('@react-native-firebase/auth', () => ({
	getAuth: jest.fn(),
	GoogleAuthProvider: {
		credential: jest.fn(),
	},
	signInWithCredential: jest.fn(),
	signOut: jest.fn(),
}));

describe('FirebaseAuthService', () => {
	let service: FirebaseAuthService;
	let mockFirebaseAuth: {
		currentUser: {
			uid: string;
			email: string | null;
			displayName: string | null;
			photoURL: string | null;
			getIdToken: jest.Mock;
		} | null;
	};

	beforeEach(() => {
		jest.clearAllMocks();
		mockFirebaseAuth = {
			currentUser: {
				uid: 'user-123',
				email: 'test@example.com',
				displayName: 'Test User',
				photoURL: 'https://example.com/photo.jpg',
				getIdToken: jest.fn().mockResolvedValue('mock-token'),
			},
		};

		(getAuth as jest.Mock).mockReturnValue(mockFirebaseAuth);
		service = new FirebaseAuthService();
	});

	describe('signInWithGoogle', () => {
		it('signs in successfully with Google', async () => {
			const mockSignInResult = {
				data: {
					idToken: 'google-id-token',
				},
			};

			(GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
			(GoogleSignin.signIn as jest.Mock).mockResolvedValue(
				mockSignInResult
			);
			(GoogleAuthProvider.credential as jest.Mock).mockReturnValue({
				providerId: 'google.com',
				signInMethod: 'google.com',
			});
			(signInWithCredential as jest.Mock).mockResolvedValue(undefined);

			const result = await service.signInWithGoogle();

			expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
			expect(GoogleSignin.signIn).toHaveBeenCalled();
			expect(signInWithCredential).toHaveBeenCalled();
			expect(result).toBeInstanceOf(User);
			expect(result.id).toBe('user-123');
			expect(result.email.value).toBe('test@example.com');
		});

		it('throws error when no ID token found', async () => {
			const mockSignInResult = {
				data: {},
			};

			(GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
			(GoogleSignin.signIn as jest.Mock).mockResolvedValue(
				mockSignInResult
			);

			// The implementation throws a regular Error which gets caught and converted to AuthenticationError
			await expect(service.signInWithGoogle()).rejects.toThrow(
				AuthenticationError
			);
		});

		it('throws error when Firebase user is null after sign-in', async () => {
			const mockSignInResult = {
				data: {
					idToken: 'google-id-token',
				},
			};

			mockFirebaseAuth.currentUser = null;

			(GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
			(GoogleSignin.signIn as jest.Mock).mockResolvedValue(
				mockSignInResult
			);
			(GoogleAuthProvider.credential as jest.Mock).mockReturnValue({
				providerId: 'google.com',
			});
			(signInWithCredential as jest.Mock).mockResolvedValue(undefined);

			// The implementation throws a regular Error which gets caught and converted to AuthenticationError
			await expect(service.signInWithGoogle()).rejects.toThrow(
				AuthenticationError
			);
		});

		it('converts AuthenticationError correctly', async () => {
			const authError = new AuthenticationError(
				'Invalid credentials',
				'INVALID'
			);
			(GoogleSignin.hasPlayServices as jest.Mock).mockRejectedValue(
				authError
			);

			await expect(service.signInWithGoogle()).rejects.toThrow(
				AuthenticationError
			);
		});

		it('converts generic errors to AuthenticationError', async () => {
			(GoogleSignin.hasPlayServices as jest.Mock).mockRejectedValue(
				new Error('Network error')
			);

			await expect(service.signInWithGoogle()).rejects.toThrow(
				AuthenticationError
			);
		});
	});

	describe('signOut', () => {
		it('signs out successfully', async () => {
			(GoogleSignin.signOut as jest.Mock).mockResolvedValue(undefined);
			(firebaseSignOut as jest.Mock).mockResolvedValue(undefined);

			await service.signOut();

			expect(GoogleSignin.signOut).toHaveBeenCalled();
			expect(firebaseSignOut).toHaveBeenCalled();
		});

		it('throws AuthenticationError on failure', async () => {
			(GoogleSignin.signOut as jest.Mock).mockRejectedValue(
				new Error('Sign out failed')
			);

			await expect(service.signOut()).rejects.toThrow(
				AuthenticationError
			);
		});
	});

	describe('getCurrentUser', () => {
		it('returns user when authenticated', async () => {
			const result = await service.getCurrentUser();

			expect(result).toBeInstanceOf(User);
			expect(result?.id).toBe('user-123');
			expect(result?.email.value).toBe('test@example.com');
		});

		it('returns null when not authenticated', async () => {
			mockFirebaseAuth.currentUser = null;

			const result = await service.getCurrentUser();

			expect(result).toBeNull();
		});

		it('returns null on error', async () => {
			(getAuth as jest.Mock).mockImplementation(() => {
				throw new Error('Auth error');
			});

			const result = await service.getCurrentUser();

			expect(result).toBeNull();
		});

		it('handles null email', async () => {
			mockFirebaseAuth.currentUser = {
				uid: 'user-123',
				email: null,
				displayName: 'Test User',
				photoURL: null,
				getIdToken: jest.fn().mockResolvedValue('mock-token'),
			};

			const result = await service.getCurrentUser();

			expect(result).toBeInstanceOf(User);
			expect(result?.email.value).toBe('');
		});
	});

	describe('getCurrentSession', () => {
		it('returns session when authenticated', async () => {
			const result = await service.getCurrentSession();

			expect(result).toBeInstanceOf(AuthSession);
			expect(result?.userId).toBe('user-123');
			expect(result?.token).toBe('mock-token');
			expect(result?.isValid()).toBe(true);
		});

		it('returns null when not authenticated', async () => {
			mockFirebaseAuth.currentUser = null;

			const result = await service.getCurrentSession();

			expect(result).toBeNull();
		});

		it('returns null on error', async () => {
			(getAuth as jest.Mock).mockImplementation(() => {
				throw new Error('Auth error');
			});

			const result = await service.getCurrentSession();

			expect(result).toBeNull();
		});
	});

	describe('isAuthenticated', () => {
		it('returns true when authenticated', async () => {
			const result = await service.isAuthenticated();

			expect(result).toBe(true);
		});

		it('returns false when not authenticated', async () => {
			mockFirebaseAuth.currentUser = null;

			const result = await service.isAuthenticated();

			expect(result).toBe(false);
		});

		it('returns false on error', async () => {
			(getAuth as jest.Mock).mockImplementation(() => {
				throw new Error('Auth error');
			});

			const result = await service.isAuthenticated();

			expect(result).toBe(false);
		});
	});

	describe('getAuthToken', () => {
		it('returns token when authenticated', async () => {
			const result = await service.getAuthToken();

			expect(result).toBe('mock-token');
			expect(mockFirebaseAuth.currentUser?.getIdToken).toHaveBeenCalled();
		});

		it('returns null when not authenticated', async () => {
			mockFirebaseAuth.currentUser = null;

			const result = await service.getAuthToken();

			expect(result).toBeNull();
		});

		it('returns null on error', async () => {
			mockFirebaseAuth.currentUser = {
				uid: 'user-123',
				email: 'test@example.com',
				displayName: 'Test User',
				photoURL: null,
				getIdToken: jest
					.fn()
					.mockRejectedValue(new Error('Token error')),
			};

			const result = await service.getAuthToken();

			expect(result).toBeNull();
		});
	});

	describe('refreshToken', () => {
		it('refreshes token successfully', async () => {
			mockFirebaseAuth.currentUser = {
				uid: 'user-123',
				email: 'test@example.com',
				displayName: 'Test User',
				photoURL: null,
				getIdToken: jest.fn().mockResolvedValue('new-token'),
			};

			const result = await service.refreshToken();

			expect(result).toBe('new-token');
			expect(
				mockFirebaseAuth.currentUser?.getIdToken
			).toHaveBeenCalledWith(true);
		});

		it('throws error when not authenticated', async () => {
			mockFirebaseAuth.currentUser = null;

			await expect(service.refreshToken()).rejects.toThrow(
				AuthenticationError
			);
		});

		it('throws AuthenticationError on token refresh failure', async () => {
			mockFirebaseAuth.currentUser = {
				uid: 'user-123',
				email: 'test@example.com',
				displayName: 'Test User',
				photoURL: null,
				getIdToken: jest
					.fn()
					.mockRejectedValue(new Error('Token error')),
			};

			await expect(service.refreshToken()).rejects.toThrow(
				AuthenticationError
			);
		});
	});
});
