import { logger } from '@/shared/utils/logging';

import { User } from '../entities';
import { IAuthRepository, IAuthService } from '../ports';

/**
 * Check auth state use case
 * Checks the current authentication state and returns the user if authenticated
 */
export class CheckAuthStateUseCase {
	constructor(
		private readonly authService: IAuthService,
		private readonly authRepository: IAuthRepository
	) {}

	/**
	 * Execute the check auth state use case
	 * @returns The current user or null if not authenticated
	 */
	async execute(): Promise<User | null> {
		try {
			logger.info('Checking authentication state');

			// Check if user is authenticated
			const isAuthenticated = await this.authService.isAuthenticated();

			if (!isAuthenticated) {
				logger.info('User is not authenticated');
				return null;
			}

			// Get the current user
			const user = await this.authRepository.getCurrentUser();

			if (user) {
				logger.info(`User is authenticated: ${user.id}`);
			} else {
				logger.info('User is authenticated but no user data found');
			}

			return user;
		} catch (error) {
			logger.error('Failed to check authentication state', { error });
			return null;
		}
	}
}
