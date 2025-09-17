describe('WatermelonEntryRepository upsertOne', () => {
	it('creates when not existing and updates when existing', async () => {
		await jest.isolateModules(async () => {
			const writeMock = jest.fn(async (fn: () => Promise<void>) => fn());
			const findMock = jest
				.fn()
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce({
					update: jest.fn().mockResolvedValue(undefined),
				});
			const createMock = jest.fn(
				(
					cb: (
						m: { _raw: Record<string, unknown> } & Record<
							string,
							unknown
						>
					) => void
				) =>
					cb({
						_raw: {},
						date: 0,
						status: 'office',
						isAdvisory: false,
						trackerId: 't1',
						needsSync: true,
						lastModified: 0,
					})
			);
			jest.doMock('../../src/db/watermelon', () => ({
				database: {
					write: writeMock,
					get: jest.fn().mockReturnValue({
						find: findMock,
						create: createMock,
					}),
				},
			}));
			jest.doMock('../../src/mappers/entryMapper', () => ({
				entryDTOToModelData: (e: {
					id: string;
					trackerId: string;
					date: string;
					status: string;
					isAdvisory: boolean;
					needsSync: boolean;
					lastModified: number;
				}) => ({ ...e }),
				entryModelToDTO: (m: unknown) => m,
			}));
			const {
				WatermelonEntryRepository,
			} = require('../../src/repositories/watermelonEntryRepository');
			const repo = new WatermelonEntryRepository();
			await repo.upsertOne({
				id: 'e1',
				trackerId: 't1',
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				needsSync: true,
				lastModified: 1,
			});
			await repo.upsertOne({
				id: 'e1',
				trackerId: 't1',
				date: '2025-01-02',
				status: 'home',
				isAdvisory: false,
				needsSync: true,
				lastModified: 2,
			});
			expect(createMock).toHaveBeenCalled();
			expect(findMock).toHaveBeenCalled();
		});
	});
});
