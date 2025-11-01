import { UserMapper } from '@/features/auth/data/mappers';
import UserModel from '@/features/auth/data/models/UserModel';
import { User } from '@/features/auth/domain/entities';

// Mock WatermelonDB model
jest.mock('@/features/auth/data/models/UserModel');

describe('UserMapper', () => {
	describe('toDomain', () => {
		it('should convert UserModel to User domain entity', () => {
			const mockModel = {
				id: 'user-123',
				email: 'test@example.com',
				name: 'Test User',
				photoUrl: 'https://example.com/photo.jpg',
				createdAt: new Date('2023-01-01'),
				updatedAt: new Date('2023-01-02'),
			} as unknown as UserModel;

			const user = UserMapper.toDomain(mockModel);

			expect(user.id).toBe(mockModel.id);
			expect(user.email.value).toBe(mockModel.email);
			expect(user.name).toBe(mockModel.name);
			expect(user.photoUrl).toBe(mockModel.photoUrl);
			expect(user.createdAt).toEqual(mockModel.createdAt);
			expect(user.updatedAt).toEqual(mockModel.updatedAt);
		});

		it('should handle optional photoUrl', () => {
			const mockModel = {
				id: 'user-123',
				email: 'test@example.com',
				name: 'Test User',
				createdAt: new Date('2023-01-01'),
				updatedAt: new Date('2023-01-02'),
			} as unknown as UserModel;

			const user = UserMapper.toDomain(mockModel);

			expect(user.photoUrl).toBeUndefined();
		});
	});

	describe('toModel', () => {
		it('should convert User domain entity to model data', () => {
			const user = new User(
				'user-123',
				'test@example.com',
				'Test User',
				'https://example.com/photo.jpg'
			);

			const modelData = UserMapper.toModel(user);

			expect(modelData.email).toBe('test@example.com');
			expect(modelData.name).toBe('Test User');
			expect(modelData.photoUrl).toBe('https://example.com/photo.jpg');
			expect(modelData.isActive).toBe(true);
			expect(modelData.createdAt).toBeGreaterThan(0);
			expect(modelData.updatedAt).toBeGreaterThan(0);
		});

		it('should handle optional photoUrl', () => {
			const user = new User('user-123', 'test@example.com', 'Test User');

			const modelData = UserMapper.toModel(user);

			expect(modelData.photoUrl).toBeUndefined();
		});

		it('should set isActive to true', () => {
			const user = new User('user-123', 'test@example.com', 'Test User');

			const modelData = UserMapper.toModel(user);

			expect(modelData.isActive).toBe(true);
		});
	});

	describe('fromFirebase', () => {
		it('should convert Firebase user to User domain entity', () => {
			const firebaseUser = {
				uid: 'firebase-123',
				email: 'test@example.com',
				displayName: 'Test User',
				photoURL: 'https://example.com/photo.jpg',
			};

			const user = UserMapper.fromFirebase(firebaseUser);

			expect(user.id).toBe(firebaseUser.uid);
			expect(user.email.value).toBe(firebaseUser.email);
			expect(user.name).toBe(firebaseUser.displayName);
			expect(user.photoUrl).toBe(firebaseUser.photoURL);
		});

		it('should handle null email', () => {
			const firebaseUser = {
				uid: 'firebase-123',
				email: null,
				displayName: 'Test User',
				photoURL: 'https://example.com/photo.jpg',
			};

			const user = UserMapper.fromFirebase(firebaseUser);

			expect(user.email.value).toBe('');
		});

		it('should handle null displayName', () => {
			const firebaseUser = {
				uid: 'firebase-123',
				email: 'test@example.com',
				displayName: null,
				photoURL: 'https://example.com/photo.jpg',
			};

			const user = UserMapper.fromFirebase(firebaseUser);

			expect(user.name).toBe('Unknown');
		});

		it('should handle null photoURL', () => {
			const firebaseUser = {
				uid: 'firebase-123',
				email: 'test@example.com',
				displayName: 'Test User',
				photoURL: null,
			};

			const user = UserMapper.fromFirebase(firebaseUser);

			expect(user.photoUrl).toBeUndefined();
		});
	});

	describe('updateModel', () => {
		it('should update model with user data', () => {
			const mockModel = {
				email: 'old@example.com',
				name: 'Old User',
				photoUrl: 'https://example.com/old.jpg',
				updatedAt: new Date('2023-01-01'),
			} as unknown as UserModel;

			const user = new User(
				'user-123',
				'new@example.com',
				'New User',
				'https://example.com/new.jpg'
			);

			UserMapper.updateModel(mockModel, user);

			expect(mockModel.email).toBe('new@example.com');
			expect(mockModel.name).toBe('New User');
			expect(mockModel.photoUrl).toBe('https://example.com/new.jpg');
			expect(mockModel.updatedAt).toBeInstanceOf(Date);
		});
	});
});
