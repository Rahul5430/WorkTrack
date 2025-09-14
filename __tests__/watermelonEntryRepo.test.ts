import { WatermelonEntryRepository } from '../src/repositories';

// Mock the database module
jest.mock('../src/db/watermelon', () => ({
	database: {
		get: jest.fn(() => ({
			query: jest.fn(() => ({
				fetch: jest.fn().mockResolvedValue([]),
			})),
		})),
		write: jest.fn((callback) => callback()),
	},
	WorkTrack: {},
}));

// Mock the Q module
jest.mock('@nozbe/watermelondb', () => ({
	Q: {
		where: jest.fn((field, value) => ({ field, value })),
		notEq: jest.fn((value) => ({ notEq: value })),
		gte: jest.fn((value) => ({ gte: value })),
	},
}));

describe('WatermelonEntryRepository', () => {
	it('listUnsynced returns array, markSynced callable', async () => {
		const repo = new WatermelonEntryRepository();
		await expect(repo.listUnsynced()).resolves.toEqual([]);
		await expect(repo.markSynced([])).resolves.toBeUndefined();
	});
});
