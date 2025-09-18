import { Timestamp } from '@react-native-firebase/firestore';

import { SharedTracker } from '../../src/db/watermelon';
import {
	shareDTOToFirestore,
	shareDTOToModelData,
	shareFirestoreToDTO,
	shareFirestoreToModelData,
	shareModelToDTO,
	shareModelToFirestore,
} from '../../src/mappers/shareMapper';
import { Permission, ShareDTO } from '../../src/types';

describe('shareMapper - branch coverage', () => {
	const mockSharedTracker = {
		trackerId: 'tracker1',
		sharedWith: 'user1',
		permission: 'read' as Permission,
		createdAt: new Date('2025-01-01'),
	} as SharedTracker;

	const mockTrackerShareData = {
		sharedWithId: 'user1',
		permission: 'write' as Permission,
		sharedWithEmail: 'user1@example.com',
		createdAt: Timestamp.fromDate(new Date('2025-01-01')),
	};

	const mockShareDTO: ShareDTO = {
		trackerId: 'tracker1',
		sharedWithId: 'user1',
		permission: 'read' as Permission,
		sharedWithEmail: 'user1@example.com',
	};

	describe('shareModelToDTO', () => {
		it('converts SharedTracker to ShareDTO with undefined email', () => {
			const result = shareModelToDTO(mockSharedTracker);
			expect(result).toEqual({
				trackerId: 'tracker1',
				sharedWithId: 'user1',
				permission: 'read',
				sharedWithEmail: undefined,
			});
		});
	});

	describe('shareDTOToModelData', () => {
		it('converts ShareDTO to model data', () => {
			const result = shareDTOToModelData(mockShareDTO);
			expect(result).toEqual({
				trackerId: 'tracker1',
				sharedWith: 'user1',
				permission: 'read',
			});
		});
	});

	describe('shareFirestoreToDTO', () => {
		it('converts Firestore data to ShareDTO with email', () => {
			const result = shareFirestoreToDTO(
				mockTrackerShareData,
				'tracker1'
			);
			expect(result).toEqual({
				trackerId: 'tracker1',
				sharedWithId: 'user1',
				permission: 'write',
				sharedWithEmail: 'user1@example.com',
			});
		});
	});

	describe('shareDTOToFirestore', () => {
		it('converts ShareDTO to Firestore data with provided date', () => {
			const customDate = new Date('2025-02-01');
			const result = shareDTOToFirestore(mockShareDTO, customDate);
			expect(result.sharedWithId).toBe('user1');
			expect(result.permission).toBe('read');
			expect(result.sharedWithEmail).toBe('user1@example.com');
			expect(result.createdAt).toBeDefined();
			expect(typeof result.createdAt.toMillis).toBe('function');
		});

		it('converts ShareDTO to Firestore data with default date', () => {
			const result = shareDTOToFirestore(mockShareDTO);
			expect(result.sharedWithId).toBe('user1');
			expect(result.permission).toBe('read');
			expect(result.sharedWithEmail).toBe('user1@example.com');
			expect(result.createdAt).toBeDefined();
			expect(typeof result.createdAt.toMillis).toBe('function');
		});

		it('handles undefined sharedWithEmail', () => {
			const dtoWithoutEmail: ShareDTO = {
				trackerId: 'tracker1',
				sharedWithId: 'user1',
				permission: 'read',
			};
			const result = shareDTOToFirestore(dtoWithoutEmail);
			expect(result.sharedWithEmail).toBe('');
		});
	});

	describe('shareModelToFirestore', () => {
		it('converts SharedTracker to Firestore data with empty email', () => {
			const result = shareModelToFirestore(mockSharedTracker);
			expect(result.sharedWithId).toBe('user1');
			expect(result.permission).toBe('read');
			expect(result.sharedWithEmail).toBe('');
			expect(result.createdAt).toBeDefined();
			expect(typeof result.createdAt.toMillis).toBe('function');
		});
	});

	describe('shareFirestoreToModelData', () => {
		it('converts Firestore data to model data', () => {
			const result = shareFirestoreToModelData(
				mockTrackerShareData,
				'tracker1'
			);
			expect(result).toEqual({
				trackerId: 'tracker1',
				sharedWith: 'user1',
				permission: 'write',
			});
		});
	});
});
