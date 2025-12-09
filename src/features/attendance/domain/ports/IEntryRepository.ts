import { DateRange } from '../entities/DateRange';
import { WorkEntry } from '../entities/WorkEntry';

// Entry repository interface
export interface IEntryRepository {
	create(entry: WorkEntry): Promise<WorkEntry>;
	update(entry: WorkEntry): Promise<WorkEntry>;
	delete(entryId: string): Promise<void>;
	getById(entryId: string): Promise<WorkEntry | null>;
	getForTracker(trackerId: string): Promise<WorkEntry[]>;
	getForPeriod(
		userId: string,
		range: DateRange,
		trackerId?: string
	): Promise<WorkEntry[]>;
}
