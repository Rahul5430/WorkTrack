export interface IConflictResolver<T = unknown> {
	resolve(local: T, remote: T): T;
}
