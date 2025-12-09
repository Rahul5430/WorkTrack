// Minimal date calculation utilities
export const dateCalculator = {
	addDays: (d: Date, days: number): Date =>
		new Date(d.getTime() + days * 24 * 60 * 60 * 1000),
};
