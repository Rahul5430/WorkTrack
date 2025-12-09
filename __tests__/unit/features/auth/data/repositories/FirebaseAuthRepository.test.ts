import { Database, Q } from '@nozbe/watermelondb';

import UserModel from '@/features/auth/data/models/UserModel';
import { FirebaseAuthRepository } from '@/features/auth/data/repositories/FirebaseAuthRepository';
import { User } from '@/features/auth/domain/entities/User';

describe('FirebaseAuthRepository', () => {
	let database: jest.Mocked<Database>;
	let repository: FirebaseAuthRepository;
	let collection: jest.Mocked<
		ReturnType<Database['get']> & {
			create: jest.Mock;
			query: jest.Mock;
		}
	>;
	let queryBuilder: {
		fetch: jest.Mock;
	};

	beforeEach(() => {
		queryBuilder = {
			fetch: jest.fn().mockResolvedValue([]),
		};

		collection = {
			create: jest.fn(),
			query: jest.fn().mockReturnValue(queryBuilder),
		} as unknown as jest.Mocked<
			ReturnType<Database['get']> & {
				create: jest.Mock;
				query: jest.Mock;
			}
		>;

		database = {
			get: jest.fn().mockReturnValue(collection),
			write: jest.fn((fn) => fn()),
		} as unknown as jest.Mocked<Database>;

		repository = new FirebaseAuthRepository(database);
	});

	describe('getCurrentUser', () => {
		it('returns first user when users exist', async () => {
			const mockUserModel = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				photoUrl: 'photo-url',
				isActive: true,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			} as unknown as UserModel;

			queryBuilder.fetch.mockResolvedValueOnce([mockUserModel]);

			const result = await repository.getCurrentUser();

			expect(database.get).toHaveBeenCalledWith('users');
			expect(collection.query).toHaveBeenCalled();
			expect(queryBuilder.fetch).toHaveBeenCalled();
			expect(result).toBeInstanceOf(User);
			expect(result?.id).toBe('user-1');
			expect(result?.email.value).toBe('test@example.com');
		});

		it('returns null when no users exist', async () => {
			queryBuilder.fetch.mockResolvedValueOnce([]);

			const result = await repository.getCurrentUser();

			expect(result).toBeNull();
		});

		it('returns null on error', async () => {
			queryBuilder.fetch.mockRejectedValueOnce(
				new Error('Database error')
			);

			const result = await repository.getCurrentUser();

			expect(result).toBeNull();
		});
	});

	describe('createUser', () => {
		it('creates a new user', async () => {
			const user = new User('user-1', 'test@example.com', 'Test User');
			const mockUserModel = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				photoUrl: undefined,
				isActive: true,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			} as unknown as UserModel;

			collection.create.mockImplementation((cb) => {
				cb(mockUserModel);
				return Promise.resolve(mockUserModel);
			});

			const result = await repository.createUser(user);

			expect(database.get).toHaveBeenCalledWith('users');
			expect(collection.create).toHaveBeenCalled();
			expect(result).toBeInstanceOf(User);
			expect(result.id).toBe('user-1');
		});

		it('throws error on database failure', async () => {
			const user = new User('user-1', 'test@example.com', 'Test User');
			collection.create.mockRejectedValueOnce(
				new Error('Database error')
			);

			await expect(repository.createUser(user)).rejects.toThrow(
				'Failed to create user'
			);
		});
	});

	describe('updateUser', () => {
		it('updates existing user', async () => {
			const user = new User(
				'user-1',
				'updated@example.com',
				'Updated User'
			);
			const mockUserModel = {
				id: 'user-1',
				email: 'updated@example.com',
				name: 'Updated User',
				photoUrl: undefined,
				isActive: true,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-03T00:00:00Z'),
				update: jest.fn().mockImplementation((cb) => {
					cb(mockUserModel);
					return Promise.resolve();
				}),
			} as unknown as UserModel & {
				update: (cb: (record: UserModel) => void) => Promise<void>;
			};

			queryBuilder.fetch.mockResolvedValueOnce([mockUserModel]);

			const result = await repository.updateUser(user);

			expect(collection.query).toHaveBeenCalledWith(
				Q.where('id', 'user-1')
			);
			expect(queryBuilder.fetch).toHaveBeenCalled();
			expect(mockUserModel.update).toHaveBeenCalled();
			expect(result).toBeInstanceOf(User);
			expect(result.email.value).toBe('updated@example.com');
		});

		it('creates user if not found during update', async () => {
			const user = new User('user-1', 'test@example.com', 'Test User');
			queryBuilder.fetch.mockResolvedValueOnce([]);

			const mockUserModel = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				photoUrl: undefined,
				isActive: true,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			} as unknown as UserModel;

			collection.create.mockImplementation((cb) => {
				cb(mockUserModel);
				return Promise.resolve(mockUserModel);
			});

			const result = await repository.updateUser(user);

			expect(collection.create).toHaveBeenCalled();
			expect(result).toBeInstanceOf(User);
		});

		it('throws error on database failure', async () => {
			const user = new User('user-1', 'test@example.com', 'Test User');
			queryBuilder.fetch.mockRejectedValueOnce(
				new Error('Database error')
			);

			await expect(repository.updateUser(user)).rejects.toThrow(
				'Failed to update user'
			);
		});
	});

	describe('getUserById', () => {
		it('returns user when found', async () => {
			const mockUserModel = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				photoUrl: 'photo-url',
				isActive: true,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			} as unknown as UserModel;

			queryBuilder.fetch.mockResolvedValueOnce([mockUserModel]);

			const result = await repository.getUserById('user-1');

			expect(collection.query).toHaveBeenCalledWith(
				Q.where('id', 'user-1')
			);
			expect(result).toBeInstanceOf(User);
			expect(result?.id).toBe('user-1');
		});

		it('returns null when user not found', async () => {
			queryBuilder.fetch.mockResolvedValueOnce([]);

			const result = await repository.getUserById('user-1');

			expect(result).toBeNull();
		});

		it('returns null on error', async () => {
			queryBuilder.fetch.mockRejectedValueOnce(
				new Error('Database error')
			);

			const result = await repository.getUserById('user-1');

			expect(result).toBeNull();
		});
	});

	describe('getUserByEmail', () => {
		it('returns user when found', async () => {
			const mockUserModel = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				photoUrl: 'photo-url',
				isActive: true,
				createdAt: new Date('2024-01-01T00:00:00Z'),
				updatedAt: new Date('2024-01-02T00:00:00Z'),
			} as unknown as UserModel;

			queryBuilder.fetch.mockResolvedValueOnce([mockUserModel]);

			const result = await repository.getUserByEmail('test@example.com');

			expect(collection.query).toHaveBeenCalledWith(
				Q.where('email', 'test@example.com')
			);
			expect(result).toBeInstanceOf(User);
			expect(result?.email.value).toBe('test@example.com');
		});

		it('returns null when user not found', async () => {
			queryBuilder.fetch.mockResolvedValueOnce([]);

			const result = await repository.getUserByEmail('test@example.com');

			expect(result).toBeNull();
		});

		it('returns null on error', async () => {
			queryBuilder.fetch.mockRejectedValueOnce(
				new Error('Database error')
			);

			const result = await repository.getUserByEmail('test@example.com');

			expect(result).toBeNull();
		});
	});
});
