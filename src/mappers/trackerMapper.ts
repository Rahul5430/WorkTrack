import { Timestamp } from '@react-native-firebase/firestore';

import { TrackerType } from '../constants';
import { Tracker } from '../db/watermelon';
import { TrackerDTO } from '../types';

interface TrackerData {
	id: string;
	ownerId: string;
	name: string;
	color: string;
	isDefault: boolean;
	trackerType: string;
	createdAt: Timestamp;
}

/**
 * Converts WatermelonDB Tracker model to TrackerDTO
 */
export function trackerModelToDTO(tracker: Tracker): TrackerDTO {
	return {
		id: tracker.id,
		name: tracker.name,
		color: tracker.color,
		ownerId: tracker.ownerId,
		isDefault: tracker.isDefault,
		trackerType: tracker.trackerType,
	};
}

/**
 * Converts TrackerDTO to WatermelonDB Tracker model data
 */
export function trackerDTOToModelData(dto: TrackerDTO): {
	name: string;
	color: string;
	ownerId: string;
	isDefault: boolean;
	trackerType: TrackerType;
} {
	return {
		name: dto.name,
		color: dto.color,
		ownerId: dto.ownerId,
		isDefault: dto.isDefault,
		trackerType: dto.trackerType as TrackerType,
	};
}

/**
 * Converts Firestore TrackerData to TrackerDTO
 */
export function trackerFirestoreToDTO(trackerData: TrackerData): TrackerDTO {
	// Ensure we have a valid ID
	if (!trackerData.id) {
		throw new Error('Tracker ID is required');
	}

	return {
		id: trackerData.id,
		name: trackerData.name,
		color: trackerData.color,
		ownerId: trackerData.ownerId,
		isDefault: trackerData.isDefault,
		trackerType: trackerData.trackerType,
	};
}

/**
 * Converts TrackerDTO to Firestore TrackerData
 */
export function trackerDTOToFirestore(
	dto: TrackerDTO,
	createdAt: Date = new Date()
): TrackerData {
	return {
		id: dto.id,
		name: dto.name,
		color: dto.color,
		ownerId: dto.ownerId,
		createdAt: Timestamp.fromDate(createdAt),
		isDefault: dto.isDefault,
		trackerType: dto.trackerType as TrackerType, // Type assertion needed due to enum differences
	};
}

/**
 * Converts WatermelonDB Tracker model to Firestore TrackerData
 */
export function trackerModelToFirestore(tracker: Tracker): TrackerData {
	return {
		id: tracker.id,
		name: tracker.name,
		color: tracker.color,
		ownerId: tracker.ownerId,
		createdAt: Timestamp.fromDate(tracker.createdAt),
		isDefault: tracker.isDefault,
		trackerType: tracker.trackerType as TrackerType, // Type assertion needed due to enum differences
	};
}

/**
 * Converts Firestore TrackerData to WatermelonDB Tracker model data
 */
export function trackerFirestoreToModelData(trackerData: TrackerData): {
	name: string;
	color: string;
	ownerId: string;
	isDefault: boolean;
	trackerType: string;
} {
	return {
		name: trackerData.name,
		color: trackerData.color,
		ownerId: trackerData.ownerId,
		isDefault: trackerData.isDefault,
		trackerType: trackerData.trackerType,
	};
}
