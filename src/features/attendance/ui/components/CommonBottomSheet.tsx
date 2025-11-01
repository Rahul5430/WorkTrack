// Common bottom sheet component
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';

export interface CommonBottomSheetRef {
	open: () => void;
	close: () => void;
	expand: () => void;
}

interface CommonBottomSheetProps {
	children: React.ReactNode;
	snapPoints?: string[];
	onChange?: (index: number) => void;
	onBackdropPress?: () => void;
	onClose?: () => void;
}

export const CommonBottomSheet = forwardRef<
	CommonBottomSheetRef,
	CommonBottomSheetProps
>(function CommonBottomSheet(
	{ children, snapPoints = ['50%'], onChange, onBackdropPress, onClose },
	ref
) {
	const bottomSheetRef = useRef<BottomSheetModal>(null);

	useImperativeHandle(ref, () => ({
		open: () => bottomSheetRef.current?.present(),
		close: () => bottomSheetRef.current?.dismiss(),
		expand: () => bottomSheetRef.current?.present(),
	}));

	return (
		<BottomSheetModal
			ref={bottomSheetRef}
			snapPoints={snapPoints}
			onChange={onChange}
			onDismiss={onClose}
			backdropComponent={onBackdropPress ? () => null : undefined}
		>
			{children}
		</BottomSheetModal>
	);
});
