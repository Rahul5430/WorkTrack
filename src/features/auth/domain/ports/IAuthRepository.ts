import { User } from '../entities';

/**
 * Auth repository interface for managing user authentication
 */
export interface IAuthRepository {
	/**
	 * Get the current authenticated user
	 * @returns The current user or null if not authenticated
	 */
	getCurrentUser(): Promise<User | null>;

	/**
	 * Create a new user
	 * @param user The user to create
	 * @returns The created user
	 */
	createUser(user: User): Promise<User>;

	/**
	 * Update an existing user
	 * @param user The user to update
	 * @returns The updated user
	 */
	updateUser(user: User): Promise<User>;

	/**
	 * Get a user by ID
	 * @param userId The user ID
	 * @returns The user or null if not found
	 */
	getUserById(userId: string): Promise<User | null>;

	/**
	 * Get a user by email
	 * @param email The user email
	 * @returns The user or null if not found
	 */
	getUserByEmail(email: string): Promise<User | null>;
}
