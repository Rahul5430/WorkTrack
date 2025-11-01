import { IConflictResolver } from '../ports/IConflictResolver';

export class ResolveConflictUseCase<T> {
	constructor(private readonly resolver: IConflictResolver<T>) {}

	execute(local: T, remote: T): T {
		return this.resolver.resolve(local, remote);
	}
}
