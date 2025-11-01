import {
	ShareMapper,
	type ShareModelShape,
} from '@/features/sharing/data/mappers/ShareMapper';
import { Share } from '@/features/sharing/domain/entities/Share';

describe('ShareMapper', () => {
	it('toDomain maps model to entity', () => {
		const model: ShareModelShape = {
			id: 's1',
			trackerId: 't1',
			sharedWithUserId: 'u2',
			permission: 'read',
			isActive: true,
			createdByUserId: 'u1',
			createdAt: new Date('2023-01-01'),
			updatedAt: new Date('2023-01-02'),
		};
		const share = ShareMapper.toDomain(model);
		expect(share.id).toBe('s1');
		expect(share.permission.value).toBe('read');
	});

	it('toModel maps entity to model shape', () => {
		const share = new Share('s1', 't1', 'u2', 'write');
		const m = ShareMapper.toModel(share);
		expect(m.trackerId).toBe('t1');
		expect(m.permission).toBe('write');
		expect(m.createdAt).toBeGreaterThan(0);
		expect(m.updatedAt).toBeGreaterThan(0);
	});
});
