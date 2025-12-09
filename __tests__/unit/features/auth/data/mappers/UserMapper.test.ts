import { UserMapper } from '@/features/auth/data/mappers/UserMapper';
import UserModel from '@/features/auth/data/models/UserModel';
import { User } from '@/features/auth/domain/entities/User';

describe('UserMapper', () => {
	describe('toDomain', () => {
		it('converts UserModel to User domain entity', () => {
			const model = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				photoUrl: 'https://example.com/photo.jpg',
				isActive: true,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			} as unknown as UserModel;

			const result = UserMapper.toDomain(model);

			expect(result).toBeInstanceOf(User);
			expect(result.id).toBe('user-1');
			expect(result.email.value).toBe('test@example.com');
			expect(result.name).toBe('Test User');
			expect(result.photoUrl).toBe('https://example.com/photo.jpg');
		});

		it('handles undefined photoUrl', () => {
			const model = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				photoUrl: undefined,
				isActive: true,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			} as unknown as UserModel;

			const result = UserMapper.toDomain(model);

			expect(result.photoUrl).toBeUndefined();
		});
	});

	describe('toModel', () => {
		it('converts User domain entity to UserModel shape', () => {
			const createdAt = new Date('2024-01-01T00:00:00Z');
			const updatedAt = new Date('2024-01-02T00:00:00Z');
			const user = new User(
				'user-1',
				'test@example.com',
				'Test User',
				'https://example.com/photo.jpg',
				createdAt,
				updatedAt
			);

			const result = UserMapper.toModel(user);

			expect(result.email).toBe('test@example.com');
			expect(result.name).toBe('Test User');
			expect(result.photoUrl).toBe('https://example.com/photo.jpg');
			expect(result.isActive).toBe(true);
			expect(result.createdAt).toBe(createdAt.getTime());
			expect(result.updatedAt).toBe(updatedAt.getTime());
		});

		it('handles undefined photoUrl in model conversion', () => {
			const createdAt = new Date('2024-01-01T00:00:00Z');
			const updatedAt = new Date('2024-01-02T00:00:00Z');
			const user = new User(
				'user-1',
				'test@example.com',
				'Test User',
				undefined,
				createdAt,
				updatedAt
			);

			const result = UserMapper.toModel(user);

			expect(result.photoUrl).toBeUndefined();
		});
	});

	describe('updateModel', () => {
		it('updates UserModel with data from User domain entity', () => {
			const model = {
				email: 'old@example.com',
				name: 'Old Name',
				photoUrl: 'https://old.com/photo.jpg',
				updatedAt: new Date('2024-01-01T00:00:00Z'),
			} as unknown as UserModel;

			const user = new User(
				'user-1',
				'new@example.com',
				'New Name',
				'https://new.com/photo.jpg'
			);

			UserMapper.updateModel(model, user);

			expect(model.email).toBe('new@example.com');
			expect(model.name).toBe('New Name');
			expect(model.photoUrl).toBe('https://new.com/photo.jpg');
			expect(model.updatedAt).toBeInstanceOf(Date);
			expect(model.updatedAt.getTime()).toBeGreaterThan(
				new Date('2024-01-01T00:00:00Z').getTime()
			);
		});

		it('handles undefined photoUrl in update', () => {
			const model = {
				email: 'old@example.com',
				name: 'Old Name',
				photoUrl: 'https://old.com/photo.jpg',
				updatedAt: new Date('2024-01-01T00:00:00Z'),
			} as unknown as UserModel;

			const user = new User(
				'user-1',
				'new@example.com',
				'New Name',
				undefined
			);

			UserMapper.updateModel(model, user);

			expect(model.email).toBe('new@example.com');
			expect(model.name).toBe('New Name');
			expect(model.photoUrl).toBeUndefined();
			expect(model.updatedAt).toBeInstanceOf(Date);
		});
	});

	describe('fromFirebase', () => {
		it('converts Firebase user to User domain entity', () => {
			const firebaseUser = {
				uid: 'firebase-uid-123',
				email: 'firebase@example.com',
				displayName: 'Firebase User',
				photoURL: 'https://firebase.com/photo.jpg',
			};

			const result = UserMapper.fromFirebase(firebaseUser);

			expect(result).toBeInstanceOf(User);
			expect(result.id).toBe('firebase-uid-123');
			expect(result.email.value).toBe('firebase@example.com');
			expect(result.name).toBe('Firebase User');
			expect(result.photoUrl).toBe('https://firebase.com/photo.jpg');
		});

		it('handles null email from Firebase', () => {
			const firebaseUser = {
				uid: 'firebase-uid-123',
				email: null,
				displayName: 'Firebase User',
				photoURL: null,
			};

			const result = UserMapper.fromFirebase(firebaseUser);

			expect(result.email.value).toBe('');
		});

		it('handles null displayName from Firebase', () => {
			const firebaseUser = {
				uid: 'firebase-uid-123',
				email: 'firebase@example.com',
				displayName: null,
				photoURL: null,
			};

			const result = UserMapper.fromFirebase(firebaseUser);

			expect(result.name).toBe('Unknown');
		});

		it('handles null photoURL from Firebase', () => {
			const firebaseUser = {
				uid: 'firebase-uid-123',
				email: 'firebase@example.com',
				displayName: 'Firebase User',
				photoURL: null,
			};

			const result = UserMapper.fromFirebase(firebaseUser);

			expect(result.photoUrl).toBeUndefined();
		});

		it('handles undefined fields from Firebase', () => {
			const firebaseUser = {
				uid: 'firebase-uid-123',
				email: null,
				displayName: null,
				photoURL: null,
			};

			const result = UserMapper.fromFirebase(firebaseUser);

			expect(result.email.value).toBe('');
			expect(result.name).toBe('Unknown');
			expect(result.photoUrl).toBeUndefined();
		});
	});
});
