import { NetworkClient } from '@/shared/data/network/NetworkClient';

describe('NetworkClient', () => {
	let client: NetworkClient;

	beforeEach(() => {
		client = new NetworkClient();
	});

	describe('get', () => {
		it('returns empty object', async () => {
			const result = await client.get('https://example.com/api');

			expect(result).toEqual({});
		});
	});
});
