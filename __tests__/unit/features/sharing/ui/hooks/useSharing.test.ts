import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useDI } from '@/app/providers/DIProvider';
import { SharingServiceIdentifiers } from '@/features/sharing/di';
import { Permission } from '@/features/sharing/domain/entities/Permission';
import { Share } from '@/features/sharing/domain/entities/Share';
import { useSharing } from '@/features/sharing/ui/hooks/useSharing';

jest.mock('@/app/providers/DIProvider', () => ({
	useDI: jest.fn(),
}));

jest.mock('@/shared/utils/logging', () => ({
	logger: {
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
		debug: jest.fn(),
	},
}));

describe('useSharing', () => {
	let mockContainer: {
		resolve: jest.Mock;
	};
	let mockShareTrackerUseCase: {
		execute: jest.Mock;
	};
	let mockUpdatePermissionUseCase: {
		execute: jest.Mock;
	};
	let mockUnshareTrackerUseCase: {
		execute: jest.Mock;
	};

	beforeEach(() => {
		jest.clearAllMocks();

		mockShareTrackerUseCase = {
			execute: jest.fn(),
		};

		mockUpdatePermissionUseCase = {
			execute: jest.fn(),
		};

		mockUnshareTrackerUseCase = {
			execute: jest.fn(),
		};

		mockContainer = {
			resolve: jest.fn((identifier) => {
				if (identifier === SharingServiceIdentifiers.SHARE_TRACKER) {
					return mockShareTrackerUseCase;
				}
				if (
					identifier === SharingServiceIdentifiers.UPDATE_PERMISSION
				) {
					return mockUpdatePermissionUseCase;
				}
				if (identifier === SharingServiceIdentifiers.UNSHARE_TRACKER) {
					return mockUnshareTrackerUseCase;
				}
				return null;
			}),
		};

		(useDI as jest.Mock).mockReturnValue(mockContainer);
	});

	it('should return initial state', () => {
		const { result } = renderHook(() => useSharing());

		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBeNull();
		expect(result.current.shareTracker).toBeDefined();
		expect(result.current.updatePermission).toBeDefined();
		expect(result.current.removeShare).toBeDefined();
		expect(result.current.clearError).toBeDefined();
	});

	describe('shareTracker', () => {
		it('should share tracker successfully', async () => {
			const testShare = new Share(
				'share-1',
				'tracker-1',
				'user@example.com',
				new Permission('read')
			);
			mockShareTrackerUseCase.execute.mockResolvedValue(testShare);

			const { result } = renderHook(() => useSharing());

			let returnedShare: Share;
			await act(async () => {
				returnedShare = await result.current.shareTracker({
					trackerId: 'tracker-1',
					email: 'user@example.com',
					permission: 'read',
				});
			});

			expect(returnedShare!).toEqual(testShare);
			expect(result.current.isLoading).toBe(false);
			expect(result.current.error).toBeNull();
		});

		it('should convert email to lowercase', async () => {
			const testShare = new Share(
				'share-1',
				'tracker-1',
				'user@example.com',
				new Permission('read')
			);
			mockShareTrackerUseCase.execute.mockResolvedValue(testShare);

			const { result } = renderHook(() => useSharing());

			await act(async () => {
				await result.current.shareTracker({
					trackerId: 'tracker-1',
					email: 'USER@EXAMPLE.COM',
					permission: 'read',
				});
			});

			const callArgs = mockShareTrackerUseCase.execute.mock.calls[0][0];
			expect(callArgs.sharedWithUserId).toBe('user@example.com');
		});

		it('should set loading state during share', async () => {
			const testShare = new Share(
				'share-1',
				'tracker-1',
				'user@example.com',
				'read'
			);

			let resolvePromise: (value: Share) => void;
			const promise = new Promise<Share>((resolve) => {
				resolvePromise = resolve;
			});

			mockShareTrackerUseCase.execute.mockReturnValue(promise);

			const { result } = renderHook(() => useSharing());

			act(() => {
				result.current.shareTracker({
					trackerId: 'tracker-1',
					email: 'user@example.com',
					permission: 'read',
				});
			});

			await waitFor(() => {
				expect(result.current.isLoading).toBe(true);
			});

			resolvePromise!(testShare);
			mockShareTrackerUseCase.execute.mockResolvedValue(testShare);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});
		});

		it('should handle error when sharing fails', async () => {
			const error = new Error('Sharing failed');
			mockShareTrackerUseCase.execute.mockRejectedValue(error);

			const { result } = renderHook(() => useSharing());

			act(() => {
				result.current
					.shareTracker({
						trackerId: 'tracker-1',
						email: 'user@example.com',
						permission: 'read',
					})
					.catch(() => {
						// Expected to reject
					});
			});

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
				expect(result.current.error).toBe('Sharing failed');
			});
		});

		it('should validate before sharing', async () => {
			const { result } = renderHook(() => useSharing());

			await expect(
				act(async () => {
					await result.current.shareTracker({
						trackerId: 'tracker-1',
						email: 'user@example.com',
						permission: 'read',
						userEmail: 'user@example.com',
					});
				})
			).rejects.toThrow();

			expect(mockShareTrackerUseCase.execute).not.toHaveBeenCalled();
		});

		it('should pass validation options to ShareValidator', async () => {
			const testShare = new Share(
				's1',
				't1',
				'user2@example.com',
				'read'
			);
			mockShareTrackerUseCase.execute.mockResolvedValue(testShare);

			const { result } = renderHook(() => useSharing());

			await act(async () => {
				await result.current.shareTracker({
					trackerId: 'tracker-1',
					email: 'user2@example.com',
					permission: 'read',
					userEmail: 'owner@example.com',
					existingShareEmails: ['user3@example.com'],
				});
			});

			expect(mockShareTrackerUseCase.execute).toHaveBeenCalled();
		});
	});

	describe('updatePermission', () => {
		it('should update permission successfully', async () => {
			const updatedShare = new Share(
				's1',
				't1',
				'user@example.com',
				'write'
			);
			mockUpdatePermissionUseCase.execute.mockResolvedValue(updatedShare);

			const { result } = renderHook(() => useSharing());

			let returnedShare: Share;
			await act(async () => {
				returnedShare = await result.current.updatePermission(
					'share-1',
					'write'
				);
			});

			expect(returnedShare!).toEqual(updatedShare);
			expect(result.current.isLoading).toBe(false);
			expect(result.current.error).toBeNull();
		});

		it('should set loading state during update', async () => {
			const updatedShare = new Share(
				's1',
				't1',
				'user@example.com',
				'write'
			);

			let resolvePromise: (value: Share) => void;
			const promise = new Promise<Share>((resolve) => {
				resolvePromise = resolve;
			});

			mockUpdatePermissionUseCase.execute.mockReturnValue(promise);

			const { result } = renderHook(() => useSharing());

			act(() => {
				result.current.updatePermission('share-1', 'write');
			});

			await waitFor(() => {
				expect(result.current.isLoading).toBe(true);
			});

			resolvePromise!(updatedShare);
			mockUpdatePermissionUseCase.execute.mockResolvedValue(updatedShare);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});
		});

		it('should handle error when updating permission fails', async () => {
			const error = new Error('Update failed');
			mockUpdatePermissionUseCase.execute.mockRejectedValue(error);

			const { result } = renderHook(() => useSharing());

			act(() => {
				result.current
					.updatePermission('share-1', 'write')
					.catch(() => {
						// Expected to reject
					});
			});

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
				expect(result.current.error).toBe('Update failed');
			});
		});
	});

	describe('removeShare', () => {
		it('should remove share successfully', async () => {
			mockUnshareTrackerUseCase.execute.mockResolvedValue(undefined);

			const { result } = renderHook(() => useSharing());

			await act(async () => {
				await result.current.removeShare('share-1');
			});

			expect(result.current.isLoading).toBe(false);
			expect(result.current.error).toBeNull();
		});

		it('should set loading state during remove', async () => {
			let resolvePromise: () => void;
			const promise = new Promise<void>((resolve) => {
				resolvePromise = resolve;
			});

			mockUnshareTrackerUseCase.execute.mockReturnValue(promise);

			const { result } = renderHook(() => useSharing());

			act(() => {
				result.current.removeShare('share-1');
			});

			await waitFor(() => {
				expect(result.current.isLoading).toBe(true);
			});

			resolvePromise!();
			mockUnshareTrackerUseCase.execute.mockResolvedValue(undefined);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});
		});

		it('should handle error when removing share fails', async () => {
			const error = new Error('Remove failed');
			mockUnshareTrackerUseCase.execute.mockRejectedValue(error);

			const { result } = renderHook(() => useSharing());

			act(() => {
				result.current.removeShare('share-1').catch(() => {
					// Expected to reject
				});
			});

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
				expect(result.current.error).toBe('Remove failed');
			});
		});
	});

	it('should clear error', async () => {
		const error = new Error('Error occurred');
		mockShareTrackerUseCase.execute.mockRejectedValue(error);

		const { result } = renderHook(() => useSharing());

		await act(async () => {
			try {
				await result.current.shareTracker({
					trackerId: 'tracker-1',
					email: 'user@example.com',
					permission: 'read',
				});
			} catch {
				// Expected to throw
			}
		});

		expect(result.current.error).toBeDefined();

		act(() => {
			result.current.clearError();
		});

		expect(result.current.error).toBeNull();
	});

	it('should maintain function references across renders', () => {
		const { result, rerender } = renderHook(() => useSharing());

		const firstShareTracker = result.current.shareTracker;
		const firstUpdatePermission = result.current.updatePermission;
		const firstRemoveShare = result.current.removeShare;

		rerender({});

		expect(result.current.shareTracker).toBe(firstShareTracker);
		expect(result.current.updatePermission).toBe(firstUpdatePermission);
		expect(result.current.removeShare).toBe(firstRemoveShare);
	});

	it('should handle non-Error throw in shareTracker', async () => {
		mockShareTrackerUseCase.execute.mockRejectedValue('Non-Error string');

		const { result } = renderHook(() => useSharing());

		act(() => {
			result.current
				.shareTracker({
					trackerId: 'tracker-1',
					email: 'user@example.com',
					permission: 'read',
				})
				.catch(() => {
					// Expected to reject
				});
		});

		await waitFor(() => {
			expect(result.current.error).toBe('Failed to share tracker');
		});
	});

	it('should handle non-Error throw in updatePermission', async () => {
		mockUpdatePermissionUseCase.execute.mockRejectedValue(
			'Non-Error string'
		);

		const { result } = renderHook(() => useSharing());

		act(() => {
			result.current.updatePermission('share-1', 'write').catch(() => {
				// Expected to reject
			});
		});

		await waitFor(() => {
			expect(result.current.error).toBe('Failed to update permission');
		});
	});

	it('should handle non-Error throw in removeShare', async () => {
		mockUnshareTrackerUseCase.execute.mockRejectedValue('Non-Error string');

		const { result } = renderHook(() => useSharing());

		act(() => {
			result.current.removeShare('share-1').catch(() => {
				// Expected to reject
			});
		});

		await waitFor(() => {
			expect(result.current.error).toBe('Failed to remove share');
		});
	});
});
