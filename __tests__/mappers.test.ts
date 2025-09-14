import { Timestamp } from '@react-native-firebase/firestore';

import {
	entryDTOToFirestore,
	entryFirestoreToDTO,
} from '../src/mappers/entryMapper';
import { shareDTOToFirestore } from '../src/mappers/shareMapper';

describe('mappers', () => {
	it('entry mapper round-trip (DTO <-> Firestore)', () => {
		const now = Date.now();
		const dto = {
			id: 't1_2025-01-01',
			trackerId: 't1',
			date: '2025-01-01',
			status: 'office',
			isAdvisory: false,
			needsSync: true,
			lastModified: now,
		};
		const fs = entryDTOToFirestore(dto, new Date());
		expect(fs.date).toBe(dto.date);
		const dto2 = entryFirestoreToDTO({
			...fs,
			lastModified: Timestamp.fromMillis(now),
			id: 'test-id',
		});
		expect(dto2.date).toBe(dto.date);
		expect(dto2.status).toBe(dto.status);
	});

	it('share mapper to firestore', () => {
		const fs = shareDTOToFirestore({
			trackerId: 't1',
			sharedWithId: 'u2',
			permission: 'read',
			sharedWithEmail: 'a@b.com',
		});
		expect(fs.sharedWithId).toBe('u2');
		expect(fs.permission).toBe('read');
	});
});
