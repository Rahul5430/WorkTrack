// Minimal mock factories
export const mockFactories = {
	user: (
		overrides: Partial<{ id: string; name: string; email: string }> = {}
	) => ({
		id: overrides.id ?? 'u1',
		name: overrides.name ?? 'User One',
		email: overrides.email ?? 'user@example.com',
	}),
};
