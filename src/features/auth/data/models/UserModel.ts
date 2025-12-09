// migrated to V2 structure
import { Model } from '@nozbe/watermelondb';
import { date, field } from '@nozbe/watermelondb/decorators';

export default class UserModel extends Model {
	static table = 'users';

	@field('email') email!: string;
	@field('name') name!: string;
	@field('photo_url') photoUrl?: string;
	@field('is_active') isActive!: boolean;
	@date('created_at') createdAt!: Date;
	@date('updated_at') updatedAt!: Date;
}
