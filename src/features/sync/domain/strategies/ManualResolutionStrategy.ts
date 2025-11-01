import { IConflictResolver } from '../ports/IConflictResolver';

export type ManualChoice = 'local' | 'remote';

export class ManualResolutionStrategy<T> implements IConflictResolver<T> {
	constructor(
		private readonly choose: (local: T, remote: T) => ManualChoice
	) {}

	resolve(local: T, remote: T): T {
		return this.choose(local, remote) === 'remote' ? remote : local;
	}
}
