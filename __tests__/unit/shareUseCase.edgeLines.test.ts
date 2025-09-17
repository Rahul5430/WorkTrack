import { jest } from '@jest/globals';

describe('ShareUseCase edge lines', () => {
	it('shareByEmail throws SyncError when user not found (line 43)', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('@react-native-firebase/auth', () => ({
				getAuth: () => ({
					currentUser: { uid: 'u1' },
				}),
			}));
			jest.doMock('../../src/services', () => ({
				getFirestoreInstance: () => ({}),
			}));
			jest.doMock('@react-native-firebase/firestore', () => ({
				collection: jest.fn(),
				query: jest.fn(),
				where: jest.fn(),
				limit: jest.fn(),
				getDocs: jest
					.fn<() => Promise<{ empty: boolean }>>()
					.mockResolvedValue({
						empty: true,
					}),
			}));
			jest.doMock('../../src/errors', () => ({
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
				ShareUseCaseImpl,
			} = require('../../src/use-cases/shareUseCase');
			const useCase = new ShareUseCaseImpl();

			await expect(
				useCase.shareByEmail('test@example.com', 't1', 'read')
			).rejects.toMatchObject({
				name: 'SyncError',
				message: 'User not found with this email address',
			});
		});
	});

	it('shareByEmail throws SyncError when user not authenticated (line 59)', async () => {
		await jest.isolateModules(async () => {
			jest.doMock('@react-native-firebase/auth', () => ({
				getAuth: () => ({
					currentUser: null,
				}),
			}));
			jest.doMock('../../src/errors', () => ({
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
				ShareUseCaseImpl,
			} = require('../../src/use-cases/shareUseCase');
			const useCase = new ShareUseCaseImpl();

			await expect(
				useCase.shareByEmail('test@example.com', 't1', 'read')
			).rejects.toMatchObject({
				name: 'SyncError',
				message: 'User not authenticated',
			});
		});
	});
});
