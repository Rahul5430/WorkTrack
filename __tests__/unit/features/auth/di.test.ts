import { Database } from '@nozbe/watermelondb';

import { ContainerBuilder } from '@/di/ContainerBuilder';
import { ServiceIdentifiers } from '@/di/registry';
import { FirebaseAuthRepository } from '@/features/auth/data/repositories/FirebaseAuthRepository';
import { FirebaseAuthService } from '@/features/auth/data/services/FirebaseAuthService';
import {
	AuthServiceIdentifiers,
	registerAuthServices,
} from '@/features/auth/di';
import { CheckAuthStateUseCase } from '@/features/auth/domain/use-cases/CheckAuthStateUseCase';
import { SignInUseCase } from '@/features/auth/domain/use-cases/SignInUseCase';
import { SignOutUseCase } from '@/features/auth/domain/use-cases/SignOutUseCase';

jest.mock('@/shared/utils/logging', () => ({
	logger: {
		info: jest.fn(),
	},
}));

describe('registerAuthServices', () => {
	let builder: ContainerBuilder;
	let mockDatabase: jest.Mocked<Database>;

	beforeEach(() => {
		builder = new ContainerBuilder();
		mockDatabase = {} as jest.Mocked<Database>;

		builder.registerSingleton(
			ServiceIdentifiers.WATERMELON_DB,
			() => mockDatabase
		);
	});

	it('registers FirebaseAuthService', () => {
		registerAuthServices(builder);
		const container = builder.build();
		const authService = container.resolve(
			AuthServiceIdentifiers.AUTH_SERVICE
		);

		expect(authService).toBeInstanceOf(FirebaseAuthService);
	});

	it('registers FirebaseAuthRepository with database dependency', () => {
		registerAuthServices(builder);
		const container = builder.build();
		const authRepo = container.resolve(
			AuthServiceIdentifiers.AUTH_REPOSITORY
		);

		expect(authRepo).toBeInstanceOf(FirebaseAuthRepository);
	});

	it('registers SignInUseCase with auth service and repository', () => {
		registerAuthServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			AuthServiceIdentifiers.SIGN_IN_USE_CASE
		);

		expect(useCase).toBeInstanceOf(SignInUseCase);
	});

	it('registers SignOutUseCase with auth service', () => {
		registerAuthServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			AuthServiceIdentifiers.SIGN_OUT_USE_CASE
		);

		expect(useCase).toBeInstanceOf(SignOutUseCase);
	});

	it('registers CheckAuthStateUseCase with auth service and repository', () => {
		registerAuthServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			AuthServiceIdentifiers.CHECK_AUTH_STATE_USE_CASE
		);

		expect(useCase).toBeInstanceOf(CheckAuthStateUseCase);
	});

	it('returns the builder for chaining', () => {
		const result = registerAuthServices(builder);

		expect(result).toBe(builder);
	});
});
