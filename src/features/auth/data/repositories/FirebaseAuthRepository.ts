import { Database, Q } from '@nozbe/watermelondb';

import { logger } from '@/shared/utils/logging';

import { User } from '../../domain/entities';
import { IAuthRepository } from '../../domain/ports';
import { UserMapper } from '../mappers';
import UserModel from '../models/UserModel';

/**
 * Firebase Auth Repository implementation using WatermelonDB
 * Handles user data persistence
 */
export class FirebaseAuthRepository implements IAuthRepository {
	constructor(private readonly database: Database) {}

	/**
	 * Get the current authenticated user
	 */
	async getCurrentUser(): Promise<User | null> {
		try {
			const usersCollection = this.database.get('users');
			const users = await usersCollection.query().fetch();

			if (users.length === 0) {
				return null;
			}

			// Return the first user (assuming single user per device)
			return UserMapper.toDomain(users[0] as UserModel);
		} catch (error) {
			logger.error('Failed to get current user', { error });
			return null;
		}
	}

	/**
	 * Create a new user
	 */
	async createUser(user: User): Promise<User> {
		try {
			const usersCollection = this.database.get('users');
			const userModelData = UserMapper.toModel(user);

			const createdUser = await usersCollection.create((userModel) => {
				const record = userModel as UserModel;
				record.email = userModelData.email;
				record.name = userModelData.name;
				record.photoUrl = userModelData.photoUrl;
				record.isActive = userModelData.isActive;
				record.createdAt = new Date(userModelData.createdAt);
				record.updatedAt = new Date(userModelData.updatedAt);
			});

			logger.info(`User created: ${user.id}`);
			return UserMapper.toDomain(createdUser as UserModel);
		} catch (error) {
			logger.error('Failed to create user', { error });
			throw new Error('Failed to create user');
		}
	}

	/**
	 * Update an existing user
	 */
	async updateUser(user: User): Promise<User> {
		try {
			const usersCollection = this.database.get('users');
			const existingUsers = await usersCollection
				.query(Q.where('id', user.id))
				.fetch();

			if (existingUsers.length === 0) {
				// If user doesn't exist, create them
				return this.createUser(user);
			}

			const userModel = existingUsers[0] as UserModel;
			const userModelData = UserMapper.toModel(user);

			await userModel.update((record) => {
				record.email = userModelData.email;
				record.name = userModelData.name;
				record.photoUrl = userModelData.photoUrl;
				record.updatedAt = new Date(userModelData.updatedAt);
			});

			logger.info(`User updated: ${user.id}`);
			return UserMapper.toDomain(userModel);
		} catch (error) {
			logger.error('Failed to update user', { error });
			throw new Error('Failed to update user');
		}
	}

	/**
	 * Get a user by ID
	 */
	async getUserById(userId: string): Promise<User | null> {
		try {
			const usersCollection = this.database.get('users');
			const users = await usersCollection
				.query(Q.where('id', userId))
				.fetch();

			if (users.length === 0) {
				return null;
			}

			return UserMapper.toDomain(users[0] as UserModel);
		} catch (error) {
			logger.error('Failed to get user by ID', { error, userId });
			return null;
		}
	}

	/**
	 * Get a user by email
	 */
	async getUserByEmail(email: string): Promise<User | null> {
		try {
			const usersCollection = this.database.get('users');
			const users = await usersCollection
				.query(Q.where('email', email))
				.fetch();

			if (users.length === 0) {
				return null;
			}

			return UserMapper.toDomain(users[0] as UserModel);
		} catch (error) {
			logger.error('Failed to get user by email', { error, email });
			return null;
		}
	}
}
