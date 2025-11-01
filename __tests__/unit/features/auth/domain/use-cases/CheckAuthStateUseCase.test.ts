import { User } from '@/features/auth/domain/entities';
import { IAuthRepository, IAuthService } from '@/features/auth/domain/ports';
import { CheckAuthStateUseCase } from '@/features/auth/domain/use-cases';

describe('CheckAuthStateUseCase', () => {
	let mockAuthService: jest.Mocked<IAuthService>;
	let mockAuthRepository: jest.Mocked<IAuthRepository>;
	let checkAuthStateUseCase: CheckAuthStateUseCase;

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

		mockAuthRepository = {
			getCurrentUser: jest.fn(),
			createUser: jest.fn(),
			updateUser: jest.fn(),
			getUserById: jest.fn(),
			getUserByEmail: jest.fn(),
		};

		checkAuthStateUseCase = new CheckAuthStateUseCase(
			mockAuthService,
			mockAuthRepository
		);
	});

	describe('execute', () => {
		it('should return user when authenticated', async () => {
			const domainUser = new User(
				'user-123',
				'test@example.com',
				'Test User'
			);

			mockAuthService.isAuthenticated.mockResolvedValue(true);
			mockAuthRepository.getCurrentUser.mockResolvedValue(domainUser);

			const result = await checkAuthStateUseCase.execute();

			expect(result).toEqual(domainUser);
			expect(mockAuthService.isAuthenticated).toHaveBeenCalledTimes(1);
			expect(mockAuthRepository.getCurrentUser).toHaveBeenCalledTimes(1);
		});

		it('should return null when not authenticated', async () => {
			mockAuthService.isAuthenticated.mockResolvedValue(false);

			const result = await checkAuthStateUseCase.execute();

			expect(result).toBeNull();
			expect(mockAuthService.isAuthenticated).toHaveBeenCalledTimes(1);
			expect(mockAuthRepository.getCurrentUser).not.toHaveBeenCalled();
		});

		it('should return null when auth state check fails', async () => {
			mockAuthService.isAuthenticated.mockRejectedValue(
				new Error('Auth state check failed')
			);

			const result = await checkAuthStateUseCase.execute();

			expect(result).toBeNull();
		});

		it('should return null when user not found despite being authenticated', async () => {
			mockAuthService.isAuthenticated.mockResolvedValue(true);
			mockAuthRepository.getCurrentUser.mockResolvedValue(null);

			const result = await checkAuthStateUseCase.execute();

			expect(result).toBeNull();
		});
	});
});
