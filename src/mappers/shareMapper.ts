import { Timestamp } from '@react-native-firebase/firestore';

import { SharedTracker } from '../db/watermelon';
import { Permission, ShareDTO } from '../types';

interface TrackerShareData {
	sharedWithId: string;
	permission: Permission;
	sharedWithEmail: string;
	createdAt: Timestamp;
}

/**
 * Converts WatermelonDB SharedTracker model to ShareDTO
 */
export function shareModelToDTO(sharedTracker: SharedTracker): ShareDTO {
	return {
		trackerId: sharedTracker.trackerId,
		sharedWithId: sharedTracker.sharedWith,
		permission: sharedTracker.permission,
		sharedWithEmail: undefined, // Not stored in WatermelonDB
	};
}

/**
 * Converts ShareDTO to WatermelonDB SharedTracker model data
 */
export function shareDTOToModelData(dto: ShareDTO): {
	trackerId: string;
	sharedWith: string;
	permission: Permission;
} {
	return {
		trackerId: dto.trackerId,
		sharedWith: dto.sharedWithId,
		permission: dto.permission,
	};
}

/**
 * Converts Firestore TrackerShareData to ShareDTO
 */
export function shareFirestoreToDTO(
	shareData: TrackerShareData,
	trackerId: string
): ShareDTO {
	return {
		trackerId,
		sharedWithId: shareData.sharedWithId,
		permission: shareData.permission,
		sharedWithEmail: shareData.sharedWithEmail,
	};
}

/**
 * Converts ShareDTO to Firestore TrackerShareData
 */
export function shareDTOToFirestore(
	dto: ShareDTO,
	createdAt: Date = new Date()
): TrackerShareData {
	return {
		sharedWithId: dto.sharedWithId,
		permission: dto.permission,
		sharedWithEmail: dto.sharedWithEmail ?? '',
		createdAt: Timestamp.fromDate(createdAt),
	};
}

/**
 * Converts WatermelonDB SharedTracker model to Firestore TrackerShareData
 */
export function shareModelToFirestore(
	sharedTracker: SharedTracker
): TrackerShareData {
	return {
		sharedWithId: sharedTracker.sharedWith,
		permission: sharedTracker.permission,
		sharedWithEmail: '', // Not stored in WatermelonDB, will be filled by caller
		createdAt: Timestamp.fromDate(sharedTracker.createdAt),
	};
}

/**
 * Converts Firestore TrackerShareData to WatermelonDB SharedTracker model data
 */
export function shareFirestoreToModelData(
	shareData: TrackerShareData,
	trackerId: string
): {
	trackerId: string;
	sharedWith: string;
	permission: Permission;
} {
	return {
		trackerId,
		sharedWith: shareData.sharedWithId,
		permission: shareData.permission,
	};
}
