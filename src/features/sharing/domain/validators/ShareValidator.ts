import { Share } from '../entities/Share';

export class ShareValidator {
	static validate(share: Share): void {
		if (!share.trackerId) throw new Error('trackerId required');
		if (!share.sharedWithUserId)
			throw new Error('sharedWithUserId required');
	}
}
