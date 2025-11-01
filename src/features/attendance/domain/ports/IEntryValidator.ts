// Entry validator interface
export interface IEntryValidator<T> {
	validate(input: T): boolean;
}
