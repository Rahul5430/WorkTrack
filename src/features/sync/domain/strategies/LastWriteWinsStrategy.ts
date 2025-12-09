import { IConflictResolver } from '../ports/IConflictResolver';

type HasUpdatedAt = { updatedAt?: Date };

export class LastWriteWinsStrategy<
	T extends HasUpdatedAt,
> implements IConflictResolver<T> {
	resolve(local: T, remote: T): T {
		const localTs = local?.updatedAt?.getTime?.() ?? 0;
		const remoteTs = remote?.updatedAt?.getTime?.() ?? 0;
		return remoteTs >= localTs ? remote : local;
	}
}
