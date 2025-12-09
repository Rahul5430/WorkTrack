// Share validator interface
export interface IShareValidator<T> {
	validate(input: T): boolean;
}
