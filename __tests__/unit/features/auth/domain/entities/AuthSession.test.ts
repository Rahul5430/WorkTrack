import { AuthSession } from '@/features/auth/domain/entities';

describe('AuthSession', () => {
	const validSessionData = {
		id: 'session-123',
		userId: 'user-123',
		token: 'auth-token-123',
		expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
		isActive: true,
	};

	describe('constructor', () => {
		it('should create a session with valid data', () => {
			const session = new AuthSession(
				validSessionData.id,
				validSessionData.userId,
				validSessionData.token,
				validSessionData.expiresAt,
				validSessionData.isActive
			);

			expect(session.id).toBe(validSessionData.id);
			expect(session.userId).toBe(validSessionData.userId);
			expect(session.token).toBe(validSessionData.token);
			expect(session.expiresAt).toEqual(validSessionData.expiresAt);
			expect(session.isActive).toBe(validSessionData.isActive);
		});

		it('should default isActive to true', () => {
			const session = new AuthSession(
				validSessionData.id,
				validSessionData.userId,
				validSessionData.token,
				validSessionData.expiresAt
			);

			expect(session.isActive).toBe(true);
		});

		it('should throw error if userId is empty', () => {
			expect(() => {
				const session = new AuthSession(
					validSessionData.id,
					'',
					validSessionData.token,
					validSessionData.expiresAt
				);
				return session;
			}).toThrow();
		});

		it('should throw error if token is empty', () => {
			expect(() => {
				const session = new AuthSession(
					validSessionData.id,
					validSessionData.userId,
					'',
					validSessionData.expiresAt
				);
				return session;
			}).toThrow();
		});
	});

	describe('isExpired', () => {
		it('should return false for non-expired session', () => {
			const session = new AuthSession(
				validSessionData.id,
				validSessionData.userId,
				validSessionData.token,
				new Date(Date.now() + 3600000) // 1 hour from now
			);

			expect(session.isExpired()).toBe(false);
		});

		it('should return true for expired session', () => {
			const session = new AuthSession(
				validSessionData.id,
				validSessionData.userId,
				validSessionData.token,
				new Date(Date.now() - 3600000) // 1 hour ago
			);

			expect(session.isExpired()).toBe(true);
		});
	});

	describe('isValid', () => {
		it('should return true for valid active session', () => {
			const session = new AuthSession(
				validSessionData.id,
				validSessionData.userId,
				validSessionData.token,
				new Date(Date.now() + 3600000),
				true
			);

			expect(session.isValid()).toBe(true);
		});

		it('should return false for inactive session', () => {
			const session = new AuthSession(
				validSessionData.id,
				validSessionData.userId,
				validSessionData.token,
				new Date(Date.now() + 3600000),
				false
			);

			expect(session.isValid()).toBe(false);
		});

		it('should return false for expired session', () => {
			const session = new AuthSession(
				validSessionData.id,
				validSessionData.userId,
				validSessionData.token,
				new Date(Date.now() - 3600000),
				true
			);

			expect(session.isValid()).toBe(false);
		});
	});

	describe('getTimeUntilExpiration', () => {
		it('should return time until expiration in milliseconds', () => {
			const futureDate = new Date(Date.now() + 3600000);
			const session = new AuthSession(
				validSessionData.id,
				validSessionData.userId,
				validSessionData.token,
				futureDate
			);

			const timeUntilExpiration = session.getTimeUntilExpiration();
			expect(timeUntilExpiration).toBeGreaterThan(3500000);
			expect(timeUntilExpiration).toBeLessThan(3600000);
		});

		it('should return 0 for expired session', () => {
			const pastDate = new Date(Date.now() - 3600000);
			const session = new AuthSession(
				validSessionData.id,
				validSessionData.userId,
				validSessionData.token,
				pastDate
			);

			expect(session.getTimeUntilExpiration()).toBe(0);
		});
	});

	describe('getTimeUntilExpirationString', () => {
		it('should return formatted time string', () => {
			const futureDate = new Date(Date.now() + 86400000); // 1 day from now
			const session = new AuthSession(
				validSessionData.id,
				validSessionData.userId,
				validSessionData.token,
				futureDate
			);

			const timeString = session.getTimeUntilExpirationString();
			expect(timeString).toContain('day');
		});

		it('should return "Expired" for expired session', () => {
			const pastDate = new Date(Date.now() - 3600000);
			const session = new AuthSession(
				validSessionData.id,
				validSessionData.userId,
				validSessionData.token,
				pastDate
			);

			expect(session.getTimeUntilExpirationString()).toBe('Expired');
		});
	});

	describe('deactivate', () => {
		it('should create inactive session', () => {
			const session = new AuthSession(
				validSessionData.id,
				validSessionData.userId,
				validSessionData.token,
				validSessionData.expiresAt,
				true
			);

			const deactivatedSession = session.deactivate();

			expect(deactivatedSession.isActive).toBe(false);
			expect(deactivatedSession.id).toBe(session.id);
			expect(deactivatedSession.userId).toBe(session.userId);
		});
	});

	describe('fromPlainObject', () => {
		it('should create session from plain object', () => {
			const session = AuthSession.fromPlainObject({
				id: validSessionData.id,
				userId: validSessionData.userId,
				token: validSessionData.token,
				expiresAt: validSessionData.expiresAt.toISOString(),
				isActive: validSessionData.isActive,
			});

			expect(session.id).toBe(validSessionData.id);
			expect(session.userId).toBe(validSessionData.userId);
			expect(session.token).toBe(validSessionData.token);
			expect(session.isActive).toBe(validSessionData.isActive);
		});
	});

	describe('toJSON', () => {
		it('should mask token in JSON output', () => {
			const session = new AuthSession(
				validSessionData.id,
				validSessionData.userId,
				validSessionData.token,
				validSessionData.expiresAt
			);

			const json = session.toJSON();

			expect(json.token).not.toContain(validSessionData.token);
			expect(json.token).toContain('***');
		});
	});
});
