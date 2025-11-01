import { Database } from '@nozbe/watermelondb';

import { ContainerBuilder } from '@/di/ContainerBuilder';
import { ServiceIdentifiers } from '@/di/registry';
import { logger } from '@/shared/utils/logging';

import { FirebaseAuthRepository } from './data/repositories';
import { FirebaseAuthService } from './data/services';
import type { IAuthRepository, IAuthService } from './domain/ports';
import {
	CheckAuthStateUseCase,
	SignInUseCase,
	SignOutUseCase,
} from './domain/use-cases';

/**
 * Auth feature service identifiers
 */
export const AuthServiceIdentifiers = {
	AUTH_SERVICE: Symbol('AuthService'),
	AUTH_REPOSITORY: Symbol('AuthRepository'),
	SIGN_IN_USE_CASE: Symbol('SignInUseCase'),
	SIGN_OUT_USE_CASE: Symbol('SignOutUseCase'),
	CHECK_AUTH_STATE_USE_CASE: Symbol('CheckAuthStateUseCase'),
} as const;

/**
 * Register auth feature services in the DI container
 */
export function registerAuthServices(
	builder: ContainerBuilder
): ContainerBuilder {
	logger.info('Registering auth services...');

	// Register auth service
	builder.registerSingleton(
		AuthServiceIdentifiers.AUTH_SERVICE,
		() => new FirebaseAuthService()
	);

	// Register auth repository
	builder.registerSingleton(
		AuthServiceIdentifiers.AUTH_REPOSITORY,
		(container) => {
			const database = container.resolve(
				ServiceIdentifiers.WATERMELON_DB
			) as Database;
			return new FirebaseAuthRepository(database);
		}
	);

	// Register use cases
	builder.registerSingleton(
		AuthServiceIdentifiers.SIGN_IN_USE_CASE,
		(container) => {
			const authService = container.resolve(
				AuthServiceIdentifiers.AUTH_SERVICE
			) as IAuthService;
			const authRepository = container.resolve(
				AuthServiceIdentifiers.AUTH_REPOSITORY
			) as IAuthRepository;
			return new SignInUseCase(authService, authRepository);
		}
	);

	builder.registerSingleton(
		AuthServiceIdentifiers.SIGN_OUT_USE_CASE,
		(container) => {
			const authService = container.resolve(
				AuthServiceIdentifiers.AUTH_SERVICE
			) as IAuthService;
			return new SignOutUseCase(authService);
		}
	);

	builder.registerSingleton(
		AuthServiceIdentifiers.CHECK_AUTH_STATE_USE_CASE,
		(container) => {
			const authService = container.resolve(
				AuthServiceIdentifiers.AUTH_SERVICE
			) as IAuthService;
			const authRepository = container.resolve(
				AuthServiceIdentifiers.AUTH_REPOSITORY
			) as IAuthRepository;
			return new CheckAuthStateUseCase(authService, authRepository);
		}
	);

	logger.info('Auth services registered');
	return builder;
}
