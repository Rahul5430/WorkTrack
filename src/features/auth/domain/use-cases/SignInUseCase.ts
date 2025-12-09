import { AuthenticationError } from '@/shared/domain/errors';
import { logger } from '@/shared/utils/logging';

import { User } from '../entities';
import { IAuthRepository, IAuthService } from '../ports';

/**
 * Sign-in use case
 * Handles user sign-in through Google authentication
 */
export class SignInUseCase {
	constructor(
		private readonly authService: IAuthService,
		private readonly authRepository: IAuthRepository
	) {}

	/**
	 * Execute the sign-in use case
	 * @returns The authenticated user
	 * @throws AuthenticationError if sign in fails
	 */
	async execute(): Promise<User> {
		try {
			logger.info('Starting sign-in process');

			// Sign in with Google
			const user = await this.authService.signInWithGoogle();
			logger.info(`User signed in: ${user.id}`);

			// Check if user exists in local repository
			const existingUser = await this.authRepository.getUserById(user.id);

			if (existingUser) {
				// Update user if they exist
				logger.info('User exists, updating user information');
				return await this.authRepository.updateUser(user);
			}

			// Create user if they don't exist
			logger.info('User does not exist, creating new user');
			return await this.authRepository.createUser(user);
		} catch (error) {
			logger.error('Sign-in failed', { error });

			if (error instanceof AuthenticationError) {
				throw error;
			}

			throw AuthenticationError.invalidCredentials({
				originalError: error,
			});
		}
	}
}
