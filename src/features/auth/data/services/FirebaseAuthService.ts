import {
	getAuth,
	GoogleAuthProvider,
	signInWithCredential,
	signOut as firebaseSignOut,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { AuthenticationError } from '@/shared/domain/errors';
import { logger } from '@/shared/utils/logging';

import { AuthSession, User } from '../../domain/entities';
import { IAuthService } from '../../domain/ports';
import { UserMapper } from '../mappers';

/**
 * Firebase Auth Service implementation
 * Handles authentication operations using React Native Firebase Auth
 */
export class FirebaseAuthService implements IAuthService {
	/**
	 * Sign in with Google
	 */
	async signInWithGoogle(): Promise<User> {
		try {
			logger.info('Starting Google sign-in');

			// Check for Play Services
			await GoogleSignin.hasPlayServices({
				showPlayServicesUpdateDialog: true,
			});

			// Sign in with Google
			const signInResult = await GoogleSignin.signIn();
			const idToken = signInResult?.data?.idToken;

			if (!idToken) {
				throw new Error('No ID token found from Google sign-in');
			}

			// Sign in to Firebase with the credential
			const firebaseAuth = getAuth();
			const credential = GoogleAuthProvider.credential(idToken);
			await signInWithCredential(firebaseAuth, credential);

			// Get the Firebase user
			const firebaseUser = firebaseAuth.currentUser;
			if (!firebaseUser) {
				throw new Error('Failed to get Firebase user after sign-in');
			}

			// Convert to domain entity
			const user = UserMapper.fromFirebase({
				uid: firebaseUser.uid,
				email: firebaseUser.email,
				displayName: firebaseUser.displayName,
				photoURL: firebaseUser.photoURL,
			});

			logger.info(`User signed in: ${user.id}`);
			return user;
		} catch (error) {
			logger.error('Google sign-in failed', { error });

			if (error instanceof AuthenticationError) {
				throw error;
			}

			throw AuthenticationError.invalidCredentials({
				originalError: error,
			});
		}
	}

	/**
	 * Sign out the current user
	 */
	async signOut(): Promise<void> {
		try {
			logger.info('Starting sign-out');

			// Sign out from Google
			await GoogleSignin.signOut();

			// Sign out from Firebase
			const firebaseAuth = getAuth();
			await firebaseSignOut(firebaseAuth);

			logger.info('Sign-out successful');
		} catch (error) {
			logger.error('Sign-out failed', { error });
			throw AuthenticationError.invalidCredentials({
				originalError: error,
			});
		}
	}

	/**
	 * Get the current authenticated user
	 */
	async getCurrentUser(): Promise<User | null> {
		try {
			const firebaseAuth = getAuth();
			const firebaseUser = firebaseAuth.currentUser;

			if (!firebaseUser) {
				return null;
			}

			return UserMapper.fromFirebase({
				uid: firebaseUser.uid,
				email: firebaseUser.email,
				displayName: firebaseUser.displayName,
				photoURL: firebaseUser.photoURL,
			});
		} catch (error) {
			logger.error('Failed to get current user', { error });
			return null;
		}
	}

	/**
	 * Get the current session
	 * Note: Firebase Auth doesn't use sessions in the traditional sense
	 * This method returns session information based on the current auth state
	 */
	async getCurrentSession(): Promise<AuthSession | null> {
		try {
			const firebaseAuth = getAuth();
			const firebaseUser = firebaseAuth.currentUser;

			if (!firebaseUser) {
				return null;
			}

			// Firebase doesn't expose token expiration time directly
			// We'll use a default expiration of 1 hour
			const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

			const token = await firebaseUser.getIdToken();

			return new AuthSession(
				firebaseUser.uid,
				firebaseUser.uid,
				token,
				expiresAt,
				true
			);
		} catch (error) {
			logger.error('Failed to get current session', { error });
			return null;
		}
	}

	/**
	 * Check if the user is authenticated
	 */
	async isAuthenticated(): Promise<boolean> {
		try {
			const firebaseAuth = getAuth();
			return firebaseAuth.currentUser !== null;
		} catch (error) {
			logger.error('Failed to check authentication state', { error });
			return false;
		}
	}

	/**
	 * Get the authentication token
	 */
	async getAuthToken(): Promise<string | null> {
		try {
			const firebaseAuth = getAuth();
			const firebaseUser = firebaseAuth.currentUser;

			if (!firebaseUser) {
				return null;
			}

			return await firebaseUser.getIdToken();
		} catch (error) {
			logger.error('Failed to get auth token', { error });
			return null;
		}
	}

	/**
	 * Refresh the authentication token
	 */
	async refreshToken(): Promise<string> {
		try {
			const firebaseAuth = getAuth();
			const firebaseUser = firebaseAuth.currentUser;

			if (!firebaseUser) {
				throw AuthenticationError.missingToken();
			}

			const token = await firebaseUser.getIdToken(true);
			logger.info('Token refreshed successfully');
			return token;
		} catch (error) {
			logger.error('Failed to refresh token', { error });
			throw AuthenticationError.invalidToken({
				originalError: error,
			});
		}
	}
}
