import { AuthSession, User } from '../entities';

/**
 * Auth service interface for authentication operations
 */
export interface IAuthService {
	/**
	 * Sign in with Google
	 * @returns The authenticated user
	 * @throws AuthenticationError if sign in fails
	 */
	signInWithGoogle(): Promise<User>;

	/**
	 * Sign out the current user
	 * @returns A promise that resolves when sign out is complete
	 */
	signOut(): Promise<void>;

	/**
	 * Get the current authenticated user
	 * @returns The current user or null if not authenticated
	 */
	getCurrentUser(): Promise<User | null>;

	/**
	 * Get the current session
	 * @returns The current session or null if not authenticated
	 */
	getCurrentSession(): Promise<AuthSession | null>;

	/**
	 * Check if the user is authenticated
	 * @returns True if authenticated, false otherwise
	 */
	isAuthenticated(): Promise<boolean>;

	/**
	 * Get the authentication token
	 * @returns The authentication token or null if not authenticated
	 */
	getAuthToken(): Promise<string | null>;

	/**
	 * Refresh the authentication token
	 * @returns The new authentication token
	 * @throws AuthenticationError if refresh fails
	 */
	refreshToken(): Promise<string>;
}
