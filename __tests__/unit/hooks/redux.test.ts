import { useDispatch, useSelector } from 'react-redux';

import { useAppDispatch, useAppSelector } from '../../../src/hooks/redux';

// Mock react-redux
jest.mock('react-redux', () => ({
	useDispatch: jest.fn(),
	useSelector: jest.fn(),
}));

describe('redux hooks', () => {
	const mockDispatch = jest.fn();
	const mockSelector = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
		(useSelector as unknown as jest.Mock).mockReturnValue(mockSelector);
	});

	describe('useAppDispatch', () => {
		it('should return typed dispatch function', () => {
			const dispatch = useAppDispatch();

			expect(dispatch).toBe(mockDispatch);
			expect(useDispatch).toHaveBeenCalledTimes(1);
		});

		it('should maintain type safety', () => {
			// Test that the hook returns a properly typed dispatch function
			const dispatch = useAppDispatch();

			expect(typeof dispatch).toBe('function');
			expect(useDispatch).toHaveBeenCalledWith();
		});
	});

	describe('useAppSelector', () => {
		it('should return typed selector function', () => {
			const selector = useAppSelector;

			expect(selector).toBe(useSelector);
		});

		it('should maintain type safety for selector', () => {
			// Test that useAppSelector is properly typed
			const selector = (state: {
				user: { isLoggedIn: boolean | null };
				workTrack: unknown;
			}) => state.user.isLoggedIn;

			(useSelector as unknown as jest.Mock).mockReturnValue(true);
			const result = useAppSelector(selector);

			expect(result).toBe(true);
			expect(useSelector).toHaveBeenCalledWith(selector);
		});
	});
});
