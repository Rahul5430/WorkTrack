import { Share } from '../entities/Share';

export interface IShareRepository {
	shareTracker(share: Share): Promise<Share>;
	updatePermission(
		shareId: string,
		permission: Share['permission']
	): Promise<Share>;
	unshare(shareId: string): Promise<void>;
	getMyShares(ownerUserId: string): Promise<Share[]>;
	getSharedWithMe(userId: string): Promise<Share[]>;
}
