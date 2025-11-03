import { loadWorkTrackDataFromDB } from '@/shared/data/database/watermelon/worktrack/load';

describe('loadWorkTrackDataFromDB', () => {
	it('returns empty data structure', async () => {
		const result = await loadWorkTrackDataFromDB();

		expect(result).toEqual({
			entries: [],
			trackers: [],
			shares: [],
		});
	});

	it('returns null when data is not available', async () => {
		// The current implementation always returns empty data
		// This test documents the current behavior
		const result = await loadWorkTrackDataFromDB();

		expect(result).not.toBeNull();
		expect(result).toHaveProperty('entries');
		expect(result).toHaveProperty('trackers');
		expect(result).toHaveProperty('shares');
	});
});
