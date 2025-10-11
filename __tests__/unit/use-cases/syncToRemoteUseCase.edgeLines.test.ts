import { jest } from '@jest/globals';

describe('SyncToRemoteUseCase edge lines', () => {
	it('execute throws SyncError when user not authenticated (line 53)', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('@react-native-firebase/auth', () => ({
				getAuth: () => ({
					currentUser: null,
				}),
			}));
			jest.doMock('../../../src/errors', () => ({
				SyncError: class SyncError extends Error {
					context?: Record<string, unknown>;
					constructor(
						message: string,
						context: Record<string, unknown>
					) {
						super(message);
						this.name = 'SyncError';
						this.context = context;
					}
				},
			}));

			const {
				SyncToRemoteUseCaseImpl,
			} = require('../../../src/use-cases/syncToRemoteUseCase');
			const useCase = new SyncToRemoteUseCaseImpl();

			await expect(useCase.execute()).rejects.toMatchObject({
				name: 'SyncError',
			});
		});
	});
});
