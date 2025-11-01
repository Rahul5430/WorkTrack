// Minimal validation utilities
export const validators = {
	required: (v: unknown): boolean =>
		v !== null && v !== undefined && `${v}`.trim().length > 0,
	isEmail: (v: string): boolean => /.+@.+\..+/.test(v),
};
