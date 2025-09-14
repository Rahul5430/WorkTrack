import { Timestamp } from '@react-native-firebase/firestore';

import { WorkTrack } from '../db/watermelon';
import { EntryDTO } from '../types';
import { MarkedDayStatus } from '../types/calendar';

interface TrackerEntryData {
	trackerId?: string;
	date: string;
	status: MarkedDayStatus;
	isAdvisory: boolean;
	createdAt: Timestamp;
	lastModified: Timestamp;
}

/**
 * Converts WatermelonDB WorkTrack model to EntryDTO
 */
export function entryModelToDTO(workTrack: WorkTrack): EntryDTO {
	return {
		id: workTrack.id,
		trackerId: workTrack.trackerId,
		date: workTrack.date,
		status: workTrack.status,
		isAdvisory: workTrack.isAdvisory,
		needsSync: workTrack.needsSync,
		lastModified: workTrack.lastModified,
	};
}

/**
 * Converts EntryDTO to WatermelonDB WorkTrack model data
 */
export function entryDTOToModelData(dto: EntryDTO): {
	date: string;
	status: string;
	isAdvisory: boolean;
	lastModified: number;
	trackerId: string;
	needsSync: boolean;
} {
	return {
		date: dto.date,
		status: dto.status,
		isAdvisory: dto.isAdvisory,
		lastModified: dto.lastModified,
		trackerId: dto.trackerId,
		needsSync: dto.needsSync,
	};
}

/**
 * Converts Firestore TrackerEntryData to EntryDTO
 */
export function entryFirestoreToDTO(
	entryData: TrackerEntryData & { id: string }
): EntryDTO {
	return {
		id: entryData.id,
		trackerId: entryData.trackerId || 'unknown',
		date: entryData.date,
		status: entryData.status,
		isAdvisory: entryData.isAdvisory,
		needsSync: false,
		lastModified: entryData.lastModified.toMillis(),
	};
}

/**
 * Converts EntryDTO to Firestore TrackerEntryData
 */
export function entryDTOToFirestore(
	dto: EntryDTO,
	createdAt: Date = new Date()
): TrackerEntryData {
	return {
		trackerId: dto.trackerId,
		date: dto.date,
		status: dto.status as MarkedDayStatus,
		isAdvisory: dto.isAdvisory,
		createdAt: Timestamp.fromDate(createdAt),
		lastModified: Timestamp.fromMillis(dto.lastModified),
	};
}

/**
 * Converts WatermelonDB WorkTrack model to Firestore TrackerEntryData
 */
export function entryModelToFirestore(workTrack: WorkTrack): TrackerEntryData {
	return {
		date: workTrack.date,
		status: workTrack.status,
		isAdvisory: workTrack.isAdvisory,
		createdAt: Timestamp.fromDate(workTrack.createdAt),
		lastModified: Timestamp.fromMillis(workTrack.lastModified),
	};
}

/**
 * Converts Firestore TrackerEntryData to WatermelonDB WorkTrack model data
 */
export function entryFirestoreToModelData(
	entryData: TrackerEntryData,
	trackerId: string
): {
	date: string;
	status: string;
	isAdvisory: boolean;
	lastModified: number;
	trackerId: string;
	needsSync: boolean;
} {
	return {
		date: entryData.date,
		status: entryData.status as MarkedDayStatus,
		isAdvisory: entryData.isAdvisory,
		lastModified: entryData.lastModified.toMillis(),
		trackerId,
		needsSync: false, // Data from server is already synced
	};
}
