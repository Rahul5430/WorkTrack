import { schemas } from '@/shared/utils/validation/schemas';

describe('schemas', () => {
	describe('email', () => {
		it('has required field set to true', () => {
			expect(schemas.email.required).toBe(true);
		});

		it('has type set to email', () => {
			expect(schemas.email.type).toBe('email');
		});
	});
});
