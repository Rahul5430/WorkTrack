import { Timestamp } from '@react-native-firebase/firestore';

import type { WorkTrack } from '../../../src/db/watermelon';
import { MarkedDayStatus } from '../../../src/types/calendar';

jest.mock('@react-native-firebase/app', () => ({ getApp: () => ({}) }), {
	virtual: true,
});
jest.mock(
	'@react-native-firebase/firestore',
	() => ({
		Timestamp: {
			fromDate: (d: Date) => ({ toMillis: () => d.getTime() }),
			fromMillis: (ms: number) => ({ toMillis: () => ms }),
		},
	}),
	{ virtual: true }
);

// Minimal fakes
const now = new Date('2025-01-01T00:00:00.000Z');

describe('entryMapper', () => {
	it('converts DTO <-> Firestore with proper timestamps', () => {
		const {
			entryDTOToFirestore,
			entryFirestoreToDTO,
		} = require('../../../src/mappers/entryMapper');
		const dto = {
			id: '2025-01-01',
			trackerId: 't1',
			date: '2025-01-01',
			status: 'office',
			isAdvisory: false,
			needsSync: true,
			lastModified: 1735689600000,
		};

		const fsData = entryDTOToFirestore(dto, now);
		expect(fsData.trackerId).toBe('t1');
		expect(fsData.createdAt.toMillis()).toBe(
			Timestamp.fromDate(now).toMillis()
		);
		expect(fsData.lastModified.toMillis()).toBe(dto.lastModified);

		const roundTrip = entryFirestoreToDTO({ id: '2025-01-01', ...fsData });
		expect(roundTrip.needsSync).toBe(false);
		expect(roundTrip.lastModified).toBe(dto.lastModified);
	});

	it('converts DTO <-> model data preserves sync flags', () => {
		const {
			entryDTOToModelData,
		} = require('../../../src/mappers/entryMapper');
		const dto = {
			id: '2025-01-02',
			trackerId: 't2',
			date: '2025-01-02',
			status: 'wfh',
			isAdvisory: true,
			needsSync: true,
			lastModified: Date.now(),
		};
		const modelData = entryDTOToModelData(dto);
		expect(modelData.needsSync).toBe(true);
		expect(modelData.trackerId).toBe('t2');
	});

	it('converts Firestore -> model data sets needsSync=false', () => {
		const {
			entryFirestoreToModelData,
		} = require('../../../src/mappers/entryMapper');
		const fsData = {
			trackerId: 't3',
			date: '2025-01-03',
			status: 'office' as MarkedDayStatus,
			isAdvisory: false,
			createdAt: Timestamp.fromDate(now),
			lastModified: Timestamp.fromMillis(1111),
		};
		const model = entryFirestoreToModelData(fsData, 't3');
		expect(model.needsSync).toBe(false);
		expect(model.lastModified).toBe(1111);
	});

	it('converts model -> DTO and model -> Firestore', () => {
		const {
			entryModelToDTO,
			entryModelToFirestore,
		} = require('../../../src/mappers/entryMapper');
		type StubWorkTrack = {
			id: string;
			trackerId: string;
			date: string;
			status: string;
			isAdvisory: boolean;
			needsSync: boolean;
			lastModified: number;
			createdAt: Date;
		};
		const model: StubWorkTrack = {
			id: '2025-01-04',
			trackerId: 't4',
			date: '2025-01-04',
			status: 'office',
			isAdvisory: false,
			needsSync: true,
			lastModified: 2222,
			createdAt: now,
		};
		const dto = entryModelToDTO(model as unknown as WorkTrack);
		expect(dto.id).toBe('2025-01-04');
		const fs = entryModelToFirestore(model as unknown as WorkTrack);
		expect(fs.lastModified.toMillis()).toBe(2222);
	});
});
