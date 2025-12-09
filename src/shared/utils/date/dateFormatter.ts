// Minimal date formatting utilities
export const dateFormatter = {
	ymd: (d: Date): string =>
		`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
};
