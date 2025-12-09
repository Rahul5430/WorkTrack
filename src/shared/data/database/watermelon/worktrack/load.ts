// migrated to V2 structure

export interface WorkTrackData {
	entries: WorkEntry[];
	trackers: Tracker[];
	shares: Share[];
}

export interface WorkEntry {
	id: string;
	date: string;
	status:
		| 'office'
		| 'wfh'
		| 'holiday'
		| 'leave'
		| 'weekend'
		| 'forecast'
		| 'advisory';
	createdAt: string;
	updatedAt: string;
}

export interface Tracker {
	id: string;
	name: string;
	ownerId: string;
	createdAt: string;
	updatedAt: string;
}

export interface Share {
	id: string;
	trackerId: string;
	sharedWithId: string;
	permission: 'read' | 'write';
	createdAt: string;
	updatedAt: string;
}

export const loadWorkTrackDataFromDB =
	async (): Promise<WorkTrackData | null> => {
		// Minimal shim: return empty data set; replace with real DB reads as needed
		return {
			entries: [],
			trackers: [],
			shares: [],
		};
	};
