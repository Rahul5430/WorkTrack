import { User } from '@/features/auth/domain/entities';
import { Email } from '@/shared/domain/value-objects';

describe('User', () => {
	const validUserData = {
		id: 'user-123',
		email: 'test@example.com',
		name: 'Test User',
		photoUrl: 'https://example.com/photo.jpg',
	};

	describe('constructor', () => {
		it('should create a user with valid data', () => {
			const user = new User(
				validUserData.id,
				validUserData.email,
				validUserData.name,
				validUserData.photoUrl
			);

			expect(user.id).toBe(validUserData.id);
			expect(user.email.value).toBe(validUserData.email);
			expect(user.name).toBe(validUserData.name);
			expect(user.photoUrl).toBe(validUserData.photoUrl);
		});

		it('should accept Email value object', () => {
			const email = new Email('test@example.com');
			const user = new User('user-123', email, 'Test User');

			expect(user.email).toBe(email);
		});

		it('should allow empty name', () => {
			expect(() => {
				const user = new User('user-123', 'test@example.com', '');
				return user;
			}).not.toThrow();
		});

		it('should throw error if name is too long', () => {
			const longName = 'a'.repeat(101);
			expect(() => {
				const user = new User('user-123', 'test@example.com', longName);
				return user;
			}).toThrow();
		});

		it('should throw error for invalid email', () => {
			expect(() => {
				const user = new User('user-123', 'invalid-email', 'Test User');
				return user;
			}).toThrow();
		});
	});

	describe('fromPlainObject', () => {
		it('should create user from plain object', () => {
			const user = User.fromPlainObject({
				id: validUserData.id,
				email: validUserData.email,
				name: validUserData.name,
				photoUrl: validUserData.photoUrl,
			});

			expect(user.id).toBe(validUserData.id);
			expect(user.email.value).toBe(validUserData.email);
			expect(user.name).toBe(validUserData.name);
			expect(user.photoUrl).toBe(validUserData.photoUrl);
		});

		it('should handle optional photoUrl', () => {
			const user = User.fromPlainObject({
				id: validUserData.id,
				email: validUserData.email,
				name: validUserData.name,
			});

			expect(user.photoUrl).toBeUndefined();
		});

		it('should handle createdAt and updatedAt', () => {
			const createdAt = new Date('2023-01-01');
			const updatedAt = new Date('2023-01-02');
			const user = User.fromPlainObject({
				id: validUserData.id,
				email: validUserData.email,
				name: validUserData.name,
				createdAt,
				updatedAt,
			});

			expect(user.createdAt).toEqual(createdAt);
			expect(user.updatedAt).toEqual(updatedAt);
		});
	});

	describe('update', () => {
		it('should create updated user', () => {
			const user = new User(
				validUserData.id,
				validUserData.email,
				validUserData.name,
				validUserData.photoUrl
			);

			const updatedUser = user.update({ name: 'Updated Name' });

			expect(updatedUser.id).toBe(user.id);
			expect(updatedUser.name).toBe('Updated Name');
			expect(updatedUser.email).toBe(user.email);
			expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(
				user.updatedAt.getTime()
			);
		});

		it('should update photoUrl', () => {
			const user = new User(
				validUserData.id,
				validUserData.email,
				validUserData.name
			);

			const updatedUser = user.update({
				photoUrl: 'https://example.com/new-photo.jpg',
			});

			expect(updatedUser.photoUrl).toBe(
				'https://example.com/new-photo.jpg'
			);
		});
	});

	describe('hasPhoto', () => {
		it('should return true if user has photoUrl', () => {
			const user = new User(
				validUserData.id,
				validUserData.email,
				validUserData.name,
				validUserData.photoUrl
			);

			expect(user.hasPhoto()).toBe(true);
		});

		it('should return false if user has no photoUrl', () => {
			const user = new User('user-123', 'test@example.com', 'Test User');

			expect(user.hasPhoto()).toBe(false);
		});
	});

	describe('getDisplayName', () => {
		it('should return name if available', () => {
			const user = new User(
				validUserData.id,
				validUserData.email,
				validUserData.name
			);

			expect(user.getDisplayName()).toBe(validUserData.name);
		});

		it('should return email if name is empty', () => {
			const user = new User('user-123', 'test@example.com', '');

			expect(user.getDisplayName()).toBe('test@example.com');
		});
	});

	describe('toJSON', () => {
		it('should serialize user to JSON', () => {
			const user = new User(
				validUserData.id,
				validUserData.email,
				validUserData.name,
				validUserData.photoUrl
			);

			const json = user.toJSON();

			expect(json.id).toBe(validUserData.id);
			expect(json.email).toBe(validUserData.email);
			expect(json.name).toBe(validUserData.name);
			expect(json.photoUrl).toBe(validUserData.photoUrl);
			expect(json.createdAt).toBeDefined();
			expect(json.updatedAt).toBeDefined();
		});
	});

	describe('validation', () => {
		it('should validate user on creation', () => {
			const user = new User(
				validUserData.id,
				validUserData.email,
				validUserData.name
			);

			expect(user.isValid()).toBe(true);
		});

		it('should throw error for empty name', () => {
			expect(() => {
				const user = new User('user-123', 'test@example.com', '   ');
				return user;
			}).toThrow('User name is required');
		});
	});
});
