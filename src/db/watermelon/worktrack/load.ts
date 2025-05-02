import { database } from '../index';

export async function loadWorkTrackDataFromDB() {
	const records = await database.collections.get('worktrack').query().fetch();

	return records.map((r) => ({
		date: r.date,
		status: r.status,
	}));
}
