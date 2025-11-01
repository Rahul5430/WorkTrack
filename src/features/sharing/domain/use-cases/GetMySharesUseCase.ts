import { Share } from '../entities/Share';
import { IShareRepository } from '../ports/IShareRepository';

export class GetMySharesUseCase {
	constructor(private readonly repo: IShareRepository) {}

	async execute(ownerUserId: string): Promise<Share[]> {
		return await this.repo.getMyShares(ownerUserId);
	}
}
