import { Email } from '@/shared/domain/value-objects';

import { Share } from '../entities/Share';

interface ValidationOptions {
	userEmail?: string;
	existingShareEmails?: string[];
}

export class ShareValidator {
	static validate(share: Share, options?: ValidationOptions): void {
		if (!share.trackerId) {
			throw new Error('trackerId required');
		}
		if (!share.sharedWithUserId) {
			throw new Error('sharedWithUserId required');
		}

		if (options) {
			this.validateEmailFormat(share.sharedWithUserId);

			if (
				options.userEmail &&
				share.sharedWithUserId.toLowerCase() ===
					options.userEmail.toLowerCase()
			) {
				throw new Error('You cannot share with yourself');
			}

			if (
				options.existingShareEmails &&
				options.existingShareEmails.some(
					(email) =>
						email.toLowerCase() ===
						share.sharedWithUserId.toLowerCase()
				)
			) {
				throw new Error('You have already shared with this user');
			}
		}
	}

	private static validateEmailFormat(email: string): void {
		try {
			Email.fromString(email);
		} catch (error) {
			throw new Error(
				error instanceof Error ? error.message : 'Invalid email format'
			);
		}
	}
}
