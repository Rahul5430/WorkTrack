import { Share } from '../entities/Share';
import { IShareRepository } from '../ports/IShareRepository';

export class GetSharedWithMeUseCase {
	constructor(private readonly repo: IShareRepository) {}

	async execute(userId: string): Promise<Share[]> {
		return await this.repo.getSharedWithMe(userId);
	}
}
