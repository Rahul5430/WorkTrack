import { logger } from '@/shared/utils/logging';

import { IAuthService } from '../ports';

/**
 * Sign-out use case
 * Handles user sign-out
 */
export class SignOutUseCase {
	constructor(private readonly authService: IAuthService) {}

	/**
	 * Execute the sign-out use case
	 * @returns A promise that resolves when sign out is complete
	 */
	async execute(): Promise<void> {
		try {
			logger.info('Starting sign-out process');

			await this.authService.signOut();

			logger.info('User signed out successfully');
		} catch (error) {
			logger.error('Sign-out failed', { error });
			throw error;
		}
	}
}
