import { MarkedDay } from '../../../types/calendar';
import { database } from '../index';
import WorkTrack from './model';

export async function loadWorkTrackDataFromDB() {
	const records = await database.collections
		.get('work_tracks')
		.query()
		.fetch();

	return records.map((r) => ({
		date: r.date,
		status: r.status,
	}));
}

export async function addMarkedDay(entry: MarkedDay) {
	const collection = database.get<WorkTrack>('work_tracks');

	await database.write(async () => {
		const existingRecords = await collection.query().fetch();

		const existing = existingRecords.find(
			(record) => record.date === entry.date
		);

		if (existing) {
			await existing.update((record) => {
				record.status = entry.status;
			});
		} else {
			await collection.create((record) => {
				record.date = entry.date;
				record.status = entry.status;
			});
		}
	});
}
