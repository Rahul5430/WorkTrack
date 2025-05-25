import { Model } from '@nozbe/watermelondb';
import { date, text } from '@nozbe/watermelondb/decorators';

export default class Sharing extends Model {
	static readonly table = 'sharing';

	@text('owner_id') ownerId!: string;
	@text('shared_with_id') sharedWithId!: string;
	@text('permission') permission!: 'read' | 'write';
	@date('created_at') createdAt!: Date;
	@date('updated_at') updatedAt!: Date;
}
