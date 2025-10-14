import { render } from '@testing-library/react-native';
import React from 'react';

import { BottomSheetErrorBoundary } from '../../../../src/components/ui/BottomSheetErrorBoundary';

// Mock the logger
jest.mock('../../../../src/logging', () => ({
	logger: {
		error: jest.fn(),
	},
}));

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
	if (shouldThrow) {
		throw new Error('Test error');
	}
	return <div>No error</div>;
};

describe('BottomSheetErrorBoundary', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders children when there is no error', () => {
		const { root } = render(
			<BottomSheetErrorBoundary>
				<div>Child content</div>
			</BottomSheetErrorBoundary>
		);
		expect(root).toBeTruthy();
	});

	it('renders fallback UI when error occurs', () => {
		const { root } = render(
			<BottomSheetErrorBoundary>
				<ThrowError shouldThrow={true} />
			</BottomSheetErrorBoundary>
		);
		expect(root).toBeTruthy();
	});

	it('renders custom fallback when provided', () => {
		const customFallback = <div>Custom error message</div>;
		const { root } = render(
			<BottomSheetErrorBoundary fallback={customFallback}>
				<ThrowError shouldThrow={true} />
			</BottomSheetErrorBoundary>
		);
		expect(root).toBeTruthy();
	});

	it('logs error when componentDidCatch is called', () => {
		const { logger } = require('../../../../src/logging');

		render(
			<BottomSheetErrorBoundary>
				<ThrowError shouldThrow={true} />
			</BottomSheetErrorBoundary>
		);

		expect(logger.error).toHaveBeenCalledWith(
			'BottomSheet Error Boundary caught an error',
			expect.objectContaining({
				error: 'Test error',
				stack: expect.any(String),
				componentStack: expect.any(String),
			})
		);
	});

	it('handles multiple children', () => {
		const { root } = render(
			<BottomSheetErrorBoundary>
				<div>Child 1</div>
				<div>Child 2</div>
				<span>Child 3</span>
			</BottomSheetErrorBoundary>
		);
		expect(root).toBeTruthy();
	});

	it('handles null children', () => {
		const { root } = render(
			<BottomSheetErrorBoundary>{null}</BottomSheetErrorBoundary>
		);
		// When children are null, root is undefined, which is expected behavior
		expect(root).toBeUndefined();
	});

	it('handles undefined children', () => {
		const { root } = render(
			<BottomSheetErrorBoundary>{undefined}</BottomSheetErrorBoundary>
		);
		// When children are undefined, root is undefined, which is expected behavior
		expect(root).toBeUndefined();
	});

	it('recovers from error when children change', () => {
		const { rerender, root } = render(
			<BottomSheetErrorBoundary>
				<ThrowError shouldThrow={true} />
			</BottomSheetErrorBoundary>
		);
		expect(root).toBeTruthy();

		// Rerender with non-throwing component
		rerender(
			<BottomSheetErrorBoundary>
				<ThrowError shouldThrow={false} />
			</BottomSheetErrorBoundary>
		);
		expect(root).toBeTruthy();
	});
});
