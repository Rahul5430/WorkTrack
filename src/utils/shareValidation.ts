import { ValidationError } from '../errors';
import { ShareDTO } from '../types';

/**
 * Utility functions for share validation
 */
export class ShareValidationUtils {
	/**
	 * Validates email format using a comprehensive regex
	 */
	static validateEmailFormat(email: string): void {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new ValidationError('Invalid email format', {
				code: 'validation.invalid_email',
				details: { email },
			});
		}
	}

	/**
	 * Validates that user is not trying to share with themselves
	 */
	static validateNotSelfShare(shareEmail: string, userEmail?: string): void {
		if (userEmail && shareEmail.toLowerCase() === userEmail.toLowerCase()) {
			throw new ValidationError('Cannot share with yourself', {
				code: 'validation.self_share',
				details: { shareEmail, userEmail },
			});
		}
	}

	/**
	 * Validates that tracker is not already shared with the email
	 */
	static validateNotAlreadyShared(
		shareEmail: string,
		existingShares: ShareDTO[]
	): void {
		const normalizedEmail = shareEmail.toLowerCase();
		const existingShare = existingShares.find(
			(share) => share.sharedWithEmail?.toLowerCase() === normalizedEmail
		);

		if (existingShare) {
			throw new ValidationError(
				'Tracker already shared with this email',
				{
					code: 'validation.already_shared',
					details: { shareEmail, existingShare },
				}
			);
		}
	}

	/**
	 * Comprehensive share validation
	 */
	static validateShareRequest(
		shareEmail: string,
		userEmail?: string,
		existingShares: ShareDTO[] = []
	): void {
		this.validateEmailFormat(shareEmail);
		this.validateNotSelfShare(shareEmail, userEmail);
		this.validateNotAlreadyShared(shareEmail, existingShares);
	}
}
