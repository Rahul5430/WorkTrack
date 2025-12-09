import { IAuthService } from '@/features/auth/domain/ports';
import { SignOutUseCase } from '@/features/auth/domain/use-cases';

describe('SignOutUseCase', () => {
	let mockAuthService: jest.Mocked<IAuthService>;
	let signOutUseCase: SignOutUseCase;

	beforeEach(() => {
		mockAuthService = {
			signInWithGoogle: jest.fn(),
			signOut: jest.fn(),
			getCurrentUser: jest.fn(),
			getCurrentSession: jest.fn(),
			isAuthenticated: jest.fn(),
			getAuthToken: jest.fn(),
			refreshToken: jest.fn(),
		};

		signOutUseCase = new SignOutUseCase(mockAuthService);
	});

	describe('execute', () => {
		it('should sign out successfully', async () => {
			mockAuthService.signOut.mockResolvedValue(undefined);

			await signOutUseCase.execute();

			expect(mockAuthService.signOut).toHaveBeenCalledTimes(1);
		});

		it('should throw error on sign out failure', async () => {
			const error = new Error('Sign out failed');
			mockAuthService.signOut.mockRejectedValue(error);

			await expect(signOutUseCase.execute()).rejects.toThrow(
				'Sign out failed'
			);
		});
	});
});
