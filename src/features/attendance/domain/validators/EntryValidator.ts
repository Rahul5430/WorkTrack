// Entry validator
import { WorkEntry } from '../entities/WorkEntry';
import { WorkStatus } from '../entities/WorkStatus';

export class EntryValidator {
	static validate(entry: WorkEntry): void {
		if (!entry.userId) throw new Error('userId is required');
		if (!entry.trackerId) throw new Error('trackerId is required');
		// Ensure status is valid
		// Accessing status.value throws if invalid in constructor
		if (entry.status.value) {
			// Status is valid
		}
		// date format checked in entity
	}

	static canTransition(_from: WorkStatus, _to: WorkStatus): boolean {
		// All transitions allowed for now; extend if needed
		return true;
	}
}
