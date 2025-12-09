import { User } from '../../domain/entities';
import UserModel from '../models/UserModel';

/**
 * Mapper for converting between User domain entities and UserModel
 */
export class UserMapper {
	/**
	 * Convert a UserModel to a User domain entity
	 */
	static toDomain(model: UserModel): User {
		return new User(
			model.id,
			model.email,
			model.name,
			model.photoUrl,
			model.createdAt,
			model.updatedAt
		);
	}

	/**
	 * Convert a User domain entity to a plain object for WatermelonDB
	 */
	static toModel(user: User): {
		email: string;
		name: string;
		photoUrl?: string;
		isActive: boolean;
		createdAt: number;
		updatedAt: number;
	} {
		return {
			email: user.email.value,
			name: user.name,
			photoUrl: user.photoUrl,
			isActive: true,
			createdAt: user.createdAt.getTime(),
			updatedAt: user.updatedAt.getTime(),
		};
	}

	/**
	 * Convert a Firebase User to a User domain entity
	 */
	static fromFirebase(firebaseUser: {
		uid: string;
		email: string | null;
		displayName: string | null;
		photoURL: string | null;
	}): User {
		return new User(
			firebaseUser.uid,
			firebaseUser.email || '',
			firebaseUser.displayName || 'Unknown',
			firebaseUser.photoURL || undefined
		);
	}

	/**
	 * Update a UserModel with data from a User domain entity
	 */
	static updateModel(model: UserModel, user: User): void {
		model.email = user.email.value;
		model.name = user.name;
		model.photoUrl = user.photoUrl;
		model.updatedAt = new Date();
	}
}
