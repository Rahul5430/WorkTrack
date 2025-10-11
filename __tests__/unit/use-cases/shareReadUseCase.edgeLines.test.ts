import { jest } from '@jest/globals';

describe('ShareReadUseCase edge lines', () => {
	it('getSharedWithMe throws SyncError when user not authenticated (line 93)', async () => {
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
				ShareReadUseCaseImpl,
			} = require('../../../src/use-cases/shareReadUseCase');
			const useCase = new ShareReadUseCaseImpl();

			await expect(useCase.getSharedWithMe()).rejects.toMatchObject({
				name: 'SyncError',
				message: 'User not authenticated',
			});
		});
	});

	it('getSharedWithMe logs error and throws SyncError on failure (lines 138-139)', async () => {
		await jest.isolateModules(async () => {
			const errorSpy = jest.fn();
			jest.doMock('../../../src/logging', () => ({
				logger: {
					debug: jest.fn(),
					info: jest.fn(),
					warn: jest.fn(),
					error: errorSpy,
				},
			}));
			jest.doMock('@react-native-firebase/auth', () => ({
				getAuth: () => ({
					currentUser: { uid: 'u1' },
				}),
			}));
			jest.doMock('../../../src/services', () => ({
				getFirestoreInstance: () => ({}),
			}));
			jest.doMock('@react-native-firebase/firestore', () => ({
				collection: jest.fn(),
				getDocs: jest
					.fn<() => Promise<never>>()
					.mockRejectedValue(new Error('Firestore error')),
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
				ShareReadUseCaseImpl,
			} = require('../../../src/use-cases/shareReadUseCase');
			const useCase = new ShareReadUseCaseImpl();

			await expect(useCase.getSharedWithMe()).rejects.toMatchObject({
				name: 'SyncError',
				message: 'Failed to get shared with me',
			});

			expect(errorSpy).toHaveBeenCalledWith(
				'Failed to get shared with me',
				{
					error: expect.any(Error),
				}
			);
		});
	});
});
