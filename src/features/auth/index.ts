/**
 * Auth feature public API
 * Export only what other features should access
 */

// Domain exports
export { AuthSession, User } from './domain/entities';

// Use cases (for UI layer)
export {
	CheckAuthStateUseCase,
	SignInUseCase,
	SignOutUseCase,
} from './domain/use-cases';

// Ports (for implementations)
export type { IAuthRepository, IAuthService } from './domain/ports';

// UI hooks
export { useAuth } from './ui/hooks';

// DI identifiers
export { AuthServiceIdentifiers } from './di';
