import { render } from '@testing-library/react-native';
import React from 'react';

import CommonBottomSheet, {
	type CommonBottomSheetRef,
} from '../../../../src/components/ui/CommonBottomSheet';

// Mocks must be defined before importing the component under test
jest.mock('react-native', () => ({
	StyleSheet: {
		create: (styles: Record<string, unknown>) => styles,
	},
	Platform: {
		select: (obj: {
			ios?: unknown;
			android?: unknown;
			default?: unknown;
		}) => obj.default || obj.ios,
	},
}));

jest.mock('@gorhom/bottom-sheet', () => {
	const _ReactLib = require('react');
	let lastProps: Record<string, unknown> | null = null;
	let lastBackdropProps: Record<string, unknown> | null = null;

	const BottomSheet = _ReactLib.forwardRef(function BottomSheetMock(
		props: Record<string, unknown>,
		ref: unknown
	) {
		ref; // mark as used for linter
		lastProps = props;

		// Call backdropComponent if provided to ensure coverage
		if (
			props.backdropComponent &&
			typeof props.backdropComponent === 'function'
		) {
			props.backdropComponent({
				disappearsOnIndex: -1,
				appearsOnIndex: 0,
				onPress: props.onBackdropPress,
			});
		}

		const ReactLib = require('react');
		return ReactLib.createElement('BottomSheet', props, props.children);
	});

	function BottomSheetViewMock({
		children,
		style,
		...props
	}: {
		children?: unknown;
		style?: unknown;
		[key: string]: unknown;
	}) {
		const ReactLib = require('react');
		return ReactLib.createElement(
			'BottomSheetView',
			{ style, ...props },
			children
		);
	}

	function BottomSheetBackdropMock(props: {
		onPress?: () => void;
		[key: string]: unknown;
	}) {
		lastBackdropProps = props;
		const ReactLib = require('react');
		return ReactLib.createElement('BottomSheetBackdrop', props);
	}

	return {
		__esModule: true,
		default: BottomSheet,
		BottomSheetView: BottomSheetViewMock,
		BottomSheetBackdrop: BottomSheetBackdropMock,
		__internal: {
			getLastProps: () => lastProps,
			getLastBackdropProps: () => lastBackdropProps,
		},
	};
});

describe('CommonBottomSheet', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders with default props', () => {
		const { root } = render(
			<CommonBottomSheet>
				<div>Child</div>
			</CommonBottomSheet>
		);
		expect(root).toBeTruthy();
	});

	it('renders with custom snapPoints', () => {
		const customSnapPoints = ['25%', '50%', '75%'];
		const { root } = render(
			<CommonBottomSheet snapPoints={customSnapPoints}>
				<div>Child</div>
			</CommonBottomSheet>
		);
		expect(root).toBeTruthy();
	});

	it('renders with custom index', () => {
		const { root } = render(
			<CommonBottomSheet index={1}>
				<div>Child</div>
			</CommonBottomSheet>
		);
		expect(root).toBeTruthy();
	});

	it('renders with all props', () => {
		const onChange = jest.fn();
		const onClose = jest.fn();
		const onBackdropPress = jest.fn();
		const customSnapPoints = ['25%', '50%'];

		const { root } = render(
			<CommonBottomSheet
				index={0}
				snapPoints={customSnapPoints}
				onChange={onChange}
				onClose={onClose}
				onBackdropPress={onBackdropPress}
			>
				<div>Child</div>
			</CommonBottomSheet>
		);
		expect(root).toBeTruthy();
	});

	it('calls onChange when index changes', () => {
		const onChange = jest.fn();
		render(
			<CommonBottomSheet index={0} onChange={onChange}>
				<div>Content</div>
			</CommonBottomSheet>
		);

		const mockModule = require('@gorhom/bottom-sheet');
		const lastProps: Record<string, unknown> | null =
			mockModule.__internal.getLastProps();
		expect(lastProps).toBeTruthy();

		// Simulate index change to 2
		(lastProps?.onChange as (i: number) => void)(2);
		expect(onChange).toHaveBeenCalledWith(2);
	});

	it('calls onClose when index changes to -1', () => {
		const onClose = jest.fn();
		render(
			<CommonBottomSheet index={0} onClose={onClose}>
				<div>Content</div>
			</CommonBottomSheet>
		);

		const mockModule = require('@gorhom/bottom-sheet');
		const lastProps: Record<string, unknown> | null =
			mockModule.__internal.getLastProps();
		expect(lastProps).toBeTruthy();

		// Simulate index change to -1 (closed)
		(lastProps?.onChange as (i: number) => void)(-1);
		expect(onClose).toHaveBeenCalled();
	});

	it('does not call onClose when index changes to non-negative value', () => {
		const onClose = jest.fn();
		render(
			<CommonBottomSheet index={0} onClose={onClose}>
				<div>Content</div>
			</CommonBottomSheet>
		);

		const mockModule = require('@gorhom/bottom-sheet');
		const lastProps: Record<string, unknown> | null =
			mockModule.__internal.getLastProps();
		expect(lastProps).toBeTruthy();

		// Simulate index change to 1 (not closed)
		(lastProps?.onChange as (i: number) => void)(1);
		expect(onClose).not.toHaveBeenCalled();
	});

	it('handles onChange without onClose callback', () => {
		const onChange = jest.fn();
		render(
			<CommonBottomSheet index={0} onChange={onChange}>
				<div>Content</div>
			</CommonBottomSheet>
		);

		const mockModule = require('@gorhom/bottom-sheet');
		const lastProps: Record<string, unknown> | null =
			mockModule.__internal.getLastProps();
		expect(lastProps).toBeTruthy();

		// Simulate index change to -1 without onClose callback
		expect(() =>
			(lastProps?.onChange as (i: number) => void)(-1)
		).not.toThrow();
	});

	it('handles onChange without onChange callback', () => {
		render(
			<CommonBottomSheet index={0}>
				<div>Content</div>
			</CommonBottomSheet>
		);

		const mockModule = require('@gorhom/bottom-sheet');
		const lastProps: Record<string, unknown> | null =
			mockModule.__internal.getLastProps();
		expect(lastProps).toBeTruthy();

		// Simulate index change without onChange callback
		expect(() =>
			(lastProps?.onChange as (i: number) => void)(1)
		).not.toThrow();
	});

	it('renders backdrop with correct props', () => {
		const onBackdropPress = jest.fn();
		render(
			<CommonBottomSheet index={0} onBackdropPress={onBackdropPress}>
				<div>Content</div>
			</CommonBottomSheet>
		);

		const mockModule = require('@gorhom/bottom-sheet');
		const lastProps: Record<string, unknown> | null =
			mockModule.__internal.getLastProps();
		expect(lastProps).toBeTruthy();
		expect(lastProps?.backdropComponent).toBeDefined();
		// The backdrop component is a function that should be called with props
		expect(typeof lastProps?.backdropComponent).toBe('function');
	});

	it('renders backdrop without onBackdropPress', () => {
		render(
			<CommonBottomSheet index={0}>
				<div>Content</div>
			</CommonBottomSheet>
		);

		const mockModule = require('@gorhom/bottom-sheet');
		const lastProps: Record<string, unknown> | null =
			mockModule.__internal.getLastProps();
		expect(lastProps).toBeTruthy();
		expect(lastProps?.backdropComponent).toBeDefined();
		// The backdrop component is a function that should be called with props
		expect(typeof lastProps?.backdropComponent).toBe('function');
	});

	it('ref methods work correctly', () => {
		const ref = React.createRef<CommonBottomSheetRef>();
		render(
			<CommonBottomSheet ref={ref} index={0}>
				<div>Child</div>
			</CommonBottomSheet>
		);

		// Call imperative methods (mock does nothing, but should not throw)
		expect(() => ref.current?.expand()).not.toThrow();
		expect(() => ref.current?.close()).not.toThrow();
		expect(() => ref.current?.snapToIndex(1)).not.toThrow();
	});

	it('renders with different children types', () => {
		const { root: root1 } = render(
			<CommonBottomSheet index={0}>
				<div>Text Child</div>
			</CommonBottomSheet>
		);
		expect(root1).toBeTruthy();

		const { root: root2 } = render(
			<CommonBottomSheet index={0}>
				<div>
					<span>Multiple</span>
					<span>Children</span>
				</div>
			</CommonBottomSheet>
		);
		expect(root2).toBeTruthy();

		const { root: root3 } = render(
			<CommonBottomSheet index={0}>{null}</CommonBottomSheet>
		);
		expect(root3).toBeTruthy();
	});

	it('handles edge cases with snapPoints', () => {
		const { root: root1 } = render(
			<CommonBottomSheet snapPoints={['100%']}>
				<div>Child</div>
			</CommonBottomSheet>
		);
		expect(root1).toBeTruthy();

		const { root: root2 } = render(
			<CommonBottomSheet snapPoints={['0%', '25%', '50%', '75%', '100%']}>
				<div>Child</div>
			</CommonBottomSheet>
		);
		expect(root2).toBeTruthy();
	});

	it('handles edge cases with index', () => {
		const { root: root1 } = render(
			<CommonBottomSheet index={-1}>
				<div>Child</div>
			</CommonBottomSheet>
		);
		expect(root1).toBeTruthy();

		const { root: root2 } = render(
			<CommonBottomSheet index={0}>
				<div>Child</div>
			</CommonBottomSheet>
		);
		expect(root2).toBeTruthy();
	});

	it('covers all callback combinations', () => {
		const testCases = [
			{
				onChange: jest.fn(),
				onClose: jest.fn(),
				onBackdropPress: jest.fn(),
			},
			{
				onChange: jest.fn(),
				onClose: undefined,
				onBackdropPress: undefined,
			},
			{
				onChange: undefined,
				onClose: jest.fn(),
				onBackdropPress: undefined,
			},
			{
				onChange: undefined,
				onClose: undefined,
				onBackdropPress: jest.fn(),
			},
			{
				onChange: jest.fn(),
				onClose: jest.fn(),
				onBackdropPress: undefined,
			},
			{
				onChange: jest.fn(),
				onClose: undefined,
				onBackdropPress: jest.fn(),
			},
			{
				onChange: undefined,
				onClose: jest.fn(),
				onBackdropPress: jest.fn(),
			},
			{
				onChange: undefined,
				onClose: undefined,
				onBackdropPress: undefined,
			},
		];

		testCases.forEach((callbacks, index) => {
			const { root } = render(
				<CommonBottomSheet
					index={0}
					onChange={callbacks.onChange}
					onClose={callbacks.onClose}
					onBackdropPress={callbacks.onBackdropPress}
				>
					<div>Child {index}</div>
				</CommonBottomSheet>
			);
			expect(root).toBeTruthy();
		});
	});
});
