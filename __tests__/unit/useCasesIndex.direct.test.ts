describe('use-cases/index.ts direct import', () => {
	it('imports and accesses all exports', () => {
		const useCases = require('../../src/use-cases');

		// Test that all expected exports are available (implementations and factory functions)
		expect(useCases.EntryUseCaseImpl).toBeDefined();
		expect(useCases.createEntryUseCase).toBeDefined();

		expect(useCases.ShareReadUseCaseImpl).toBeDefined();
		expect(useCases.createShareReadUseCase).toBeDefined();

		expect(useCases.ShareUseCaseImpl).toBeDefined();
		expect(useCases.createShareUseCase).toBeDefined();

		expect(useCases.SyncFromRemoteUseCaseImpl).toBeDefined();
		expect(useCases.SyncToRemoteUseCaseImpl).toBeDefined();

		expect(useCases.SyncUseCaseImpl).toBeDefined();
		expect(useCases.createSyncUseCase).toBeDefined();

		expect(useCases.UserManagementUseCaseImpl).toBeDefined();
		expect(useCases.createUserManagementUseCase).toBeDefined();

		// Access properties to ensure coverage
		expect(typeof useCases.EntryUseCaseImpl).toBe('function');
		expect(typeof useCases.createEntryUseCase).toBe('function');
		expect(typeof useCases.ShareReadUseCaseImpl).toBe('function');
		expect(typeof useCases.createShareReadUseCase).toBe('function');
		expect(typeof useCases.ShareUseCaseImpl).toBe('function');
		expect(typeof useCases.createShareUseCase).toBe('function');
		expect(typeof useCases.SyncFromRemoteUseCaseImpl).toBe('function');
		expect(typeof useCases.SyncToRemoteUseCaseImpl).toBe('function');
		expect(typeof useCases.SyncUseCaseImpl).toBe('function');
		expect(typeof useCases.createSyncUseCase).toBe('function');
		expect(typeof useCases.UserManagementUseCaseImpl).toBe('function');
		expect(typeof useCases.createUserManagementUseCase).toBe('function');
	});
});
