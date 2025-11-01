import { logger } from '@/shared/utils/logging';

import { Share } from '../entities/Share';
import { IShareRepository } from '../ports/IShareRepository';

export class UpdatePermissionUseCase {
	constructor(private readonly repo: IShareRepository) {}

	async execute(
		shareId: string,
		permission: Share['permission']
	): Promise<Share> {
		logger.info('Updating share permission', {
			shareId,
			permission: permission.value,
		});
		return await this.repo.updatePermission(shareId, permission);
	}
}
