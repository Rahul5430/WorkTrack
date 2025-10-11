describe('db/watermelon adapter error path', () => {
	it('invokes onSetUpError and logs error', async () => {
		await jest.isolateModules(async () => {
			const errorSpy = jest.fn();
			jest.doMock('../../../src/logging', () => ({
				logger: {
					debug: jest.fn(),
					info: jest.fn(),
					warn: jest.fn(),
					error: errorSpy,
				},
				ConsoleLogger: class {},
			}));
			class FakeAdapter {
				constructor(opts: { onSetUpError: (e: unknown) => void }) {
					opts.onSetUpError(new Error('setup'));
				}
			}
			jest.doMock('@nozbe/watermelondb/adapters/sqlite', () => ({
				__esModule: true,
				default: FakeAdapter,
			}));

			const mod = require('../../../src/db/watermelon');
			expect(mod).toBeDefined();
			expect(errorSpy).toHaveBeenCalled();
		});
	});
});
