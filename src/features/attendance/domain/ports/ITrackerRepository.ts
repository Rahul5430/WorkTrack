import { Tracker } from '../entities/Tracker';

// Tracker repository interface
export interface ITrackerRepository {
	create(tracker: Tracker, userId: string): Promise<Tracker>;
	update(tracker: Tracker): Promise<Tracker>;
	delete(trackerId: string): Promise<void>;
	getById(trackerId: string): Promise<Tracker | null>;
	getAllForUser(userId: string): Promise<Tracker[]>;
}
