import {
	AppError,
	FirebaseAppError,
	isAppError,
	SyncError,
	ValidationError,
	wrapUnknownError,
} from '../../src/errors';

describe('errors/index', () => {
	it('default retryable flags are set appropriately', () => {
		const v = new ValidationError('bad');
		expect(v.retryable).toBe(false);
		const f = new FirebaseAppError('fb');
		expect(f.retryable).toBe(true);
		const s = new SyncError('sync');
		expect(s.retryable).toBe(true);
	});

	it('isAppError detects AppError', () => {
		const e = new AppError('unknown', 'x');
		expect(isAppError(e)).toBe(true);
		expect(isAppError(new Error('x'))).toBe(false);
	});

	it('wrapUnknownError returns same AppError, wraps Error and primitives', () => {
		const app = new AppError('unknown', 'x');
		expect(wrapUnknownError(app)).toBe(app);
		const errWrapped = wrapUnknownError(new Error('boom'));
		expect(errWrapped).toBeInstanceOf(AppError);
		expect(errWrapped.kind).toBe('unknown');
		const prim = wrapUnknownError(42);
		expect(prim.details?.value).toBe('42');
	});
});
