import { Timestamp } from '@react-native-firebase/firestore';

import { WorkTrack } from '../../../src/db/watermelon';
import {
	entryDTOToFirestore,
	entryDTOToModelData,
	entryFirestoreToDTO,
	entryFirestoreToModelData,
	entryModelToDTO,
	entryModelToFirestore,
} from '../../../src/mappers/entryMapper';
import { EntryDTO } from '../../../src/types';

describe('entryMapper - branch coverage', () => {
	const mockWorkTrack = {
		id: 'entry1',
		trackerId: 'tracker1',
		date: '2025-01-01',
		status: 'office',
		isAdvisory: false,
		needsSync: true,
		lastModified: 1700000000000,
		createdAt: new Date('2025-01-01'),
	} as WorkTrack;

	const mockEntryDTO: EntryDTO = {
		id: 'entry1',
		trackerId: 'tracker1',
		date: '2025-01-01',
		status: 'office',
		isAdvisory: false,
		needsSync: true,
		lastModified: 1700000000000,
	};

	describe('entryModelToDTO', () => {
		it('converts WorkTrack to EntryDTO', () => {
			const result = entryModelToDTO(mockWorkTrack);
			expect(result).toEqual({
				id: 'entry1',
				trackerId: 'tracker1',
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				needsSync: true,
				lastModified: 1700000000000,
			});
		});
	});

	describe('entryDTOToModelData', () => {
		it('converts EntryDTO to model data', () => {
			const result = entryDTOToModelData(mockEntryDTO);
			expect(result).toEqual({
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				lastModified: 1700000000000,
				trackerId: 'tracker1',
				needsSync: true,
			});
		});
	});

	describe('entryFirestoreToDTO', () => {
		it('converts Firestore data to EntryDTO with trackerId', () => {
			const mockFirestoreData = {
				id: 'entry1',
				trackerId: 'tracker1',
				date: '2025-01-01',
				status: 'office' as const,
				isAdvisory: false,
				createdAt: Timestamp.fromDate(new Date('2025-01-01')),
				lastModified: Timestamp.fromDate(new Date('2025-01-01')),
			};

			const result = entryFirestoreToDTO(mockFirestoreData);
			expect(result).toEqual({
				id: 'entry1',
				trackerId: 'tracker1',
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				needsSync: false,
				lastModified: expect.any(Number),
			});
		});

		it('converts Firestore data to EntryDTO without trackerId (uses unknown)', () => {
			const mockFirestoreData = {
				id: 'entry1',
				trackerId: undefined,
				date: '2025-01-01',
				status: 'office' as const,
				isAdvisory: false,
				createdAt: Timestamp.fromDate(new Date('2025-01-01')),
				lastModified: Timestamp.fromDate(new Date('2025-01-01')),
			};

			const result = entryFirestoreToDTO(mockFirestoreData);
			expect(result).toEqual({
				id: 'entry1',
				trackerId: 'unknown',
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				needsSync: false,
				lastModified: expect.any(Number),
			});
		});
	});

	describe('entryDTOToFirestore', () => {
		it('converts EntryDTO to Firestore data with default createdAt', () => {
			const result = entryDTOToFirestore(mockEntryDTO);
			expect(result).toEqual({
				trackerId: 'tracker1',
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				createdAt: expect.any(Object),
				lastModified: expect.any(Object),
			});
			expect(result.createdAt).toBeDefined();
			expect(result.lastModified).toBeDefined();
		});

		it('converts EntryDTO to Firestore data with custom createdAt', () => {
			const customDate = new Date('2025-01-02');
			const result = entryDTOToFirestore(mockEntryDTO, customDate);
			expect(result).toEqual({
				trackerId: 'tracker1',
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				createdAt: expect.any(Object),
				lastModified: expect.any(Object),
			});
			expect(result.createdAt).toBeDefined();
			expect(result.lastModified).toBeDefined();
		});
	});

	describe('entryModelToFirestore', () => {
		it('converts WorkTrack to Firestore data', () => {
			const result = entryModelToFirestore(mockWorkTrack);
			expect(result).toEqual({
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				createdAt: expect.any(Object),
				lastModified: expect.any(Object),
			});
			expect(result.createdAt).toBeDefined();
			expect(result.lastModified).toBeDefined();
		});
	});

	describe('entryFirestoreToModelData', () => {
		it('converts Firestore data to WorkTrack model data', () => {
			const mockFirestoreData = {
				trackerId: 'tracker1',
				date: '2025-01-01',
				status: 'office' as const,
				isAdvisory: false,
				createdAt: Timestamp.fromDate(new Date('2025-01-01')),
				lastModified: Timestamp.fromDate(new Date('2025-01-01')),
			};

			const result = entryFirestoreToModelData(
				mockFirestoreData,
				'tracker1'
			);
			expect(result).toEqual({
				date: '2025-01-01',
				status: 'office',
				isAdvisory: false,
				lastModified: expect.any(Number),
				trackerId: 'tracker1',
				needsSync: false,
			});
		});
	});
});
