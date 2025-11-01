import { User } from '@/features/auth/domain/entities';
import { IAuthRepository, IAuthService } from '@/features/auth/domain/ports';
import { SignInUseCase } from '@/features/auth/domain/use-cases';
import { AuthenticationError } from '@/shared/domain/errors';

describe('SignInUseCase', () => {
	let mockAuthService: jest.Mocked<IAuthService>;
	let mockAuthRepository: jest.Mocked<IAuthRepository>;
	let signInUseCase: SignInUseCase;

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

		signInUseCase = new SignInUseCase(mockAuthService, mockAuthRepository);
	});

	describe('execute', () => {
		it('should sign in and create new user', async () => {
			const domainUser = new User(
				'user-123',
				'test@example.com',
				'Test User'
			);

			mockAuthService.signInWithGoogle.mockResolvedValue(domainUser);
			mockAuthRepository.getUserById.mockResolvedValue(null);
			mockAuthRepository.createUser.mockResolvedValue(domainUser);

			const result = await signInUseCase.execute();

			expect(result).toEqual(domainUser);
			expect(mockAuthService.signInWithGoogle).toHaveBeenCalledTimes(1);
			expect(mockAuthRepository.getUserById).toHaveBeenCalledWith(
				'user-123'
			);
			expect(mockAuthRepository.createUser).toHaveBeenCalledWith(
				domainUser
			);
			expect(mockAuthRepository.updateUser).not.toHaveBeenCalled();
		});

		it('should sign in and update existing user', async () => {
			const domainUser = new User(
				'user-123',
				'test@example.com',
				'Test User'
			);
			const existingUser = new User(
				'user-123',
				'test@example.com',
				'Old Name'
			);

			mockAuthService.signInWithGoogle.mockResolvedValue(domainUser);
			mockAuthRepository.getUserById.mockResolvedValue(existingUser);
			mockAuthRepository.updateUser.mockResolvedValue(domainUser);

			const result = await signInUseCase.execute();

			expect(result).toEqual(domainUser);
			expect(mockAuthRepository.getUserById).toHaveBeenCalledWith(
				'user-123'
			);
			expect(mockAuthRepository.updateUser).toHaveBeenCalledWith(
				domainUser
			);
			expect(mockAuthRepository.createUser).not.toHaveBeenCalled();
		});

		it('should throw AuthenticationError on failure', async () => {
			const error = new AuthenticationError(
				'Sign in failed',
				'INVALID_CREDENTIALS'
			);
			mockAuthService.signInWithGoogle.mockRejectedValue(error);

			await expect(signInUseCase.execute()).rejects.toThrow(
				AuthenticationError
			);
		});

		it('should wrap non-AuthenticationError in AuthenticationError', async () => {
			const error = new Error('Network error');
			mockAuthService.signInWithGoogle.mockRejectedValue(error);

			await expect(signInUseCase.execute()).rejects.toThrow(
				AuthenticationError
			);
		});
	});
});
