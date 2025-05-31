import { MarkedDay } from '../../../types/calendar';
import { database } from '../index';
import WorkTrack from './model';

let isInitialized = false;

const initializeWeekendData = async () => {
	if (isInitialized) return;

	const collection = database.get<WorkTrack>('work_tracks');
	const today = new Date();
	const startDate = new Date(today.getFullYear() - 1, 0, 1); // 1 year ago
	const endDate = new Date(today.getFullYear() + 1, 11, 31); // 1 year ahead

	await database.write(async () => {
		// First, get all existing records
		const existingRecords = await collection.query().fetch();
		const existingDates = new Set(existingRecords.map((r) => r.date));

		let currentDate = new Date(startDate);
		while (currentDate <= endDate) {
			const dateString = currentDate.toISOString().split('T')[0];
			const day = currentDate.getDay();

			// Only create entry if it doesn't exist
			if (!existingDates.has(dateString)) {
				// Only mark Sundays as holiday
				if (day === 0) {
					await collection.create((record) => {
						record.date = dateString;
						record.status = 'holiday';
						record.synced = true;
						record.lastModified = Date.now();
					});
				}
			}

			currentDate.setDate(currentDate.getDate() + 1);
		}
	});

	isInitialized = true;
};

export async function loadWorkTrackDataFromDB() {
	// Initialize weekend data if needed
	await initializeWeekendData();

	const records = await database.collections
		.get<WorkTrack>('work_tracks')
		.query()
		.fetch();

	return records.map((r) => ({
		date: r.date,
		status: r.status,
		isAdvisory: r.isAdvisory,
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
				record.isAdvisory = entry.isAdvisory ?? false;
				record.synced = false;
				record.lastModified = Date.now();
			});
		} else {
			await collection.create((record) => {
				record.date = entry.date;
				record.status = entry.status;
				record.isAdvisory = entry.isAdvisory ?? false;
				record.synced = false;
				record.lastModified = Date.now();
			});
		}
	});
}
