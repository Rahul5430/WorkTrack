import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetProps,
	BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';

import { colors } from '../themes/colors';

interface Props extends BottomSheetProps {
	children: React.ReactNode;
	snapPoints?: string[];
	onChange?: (index: number) => void;
	onClose?: () => void;
	index?: number;
	onBackdropPress?: () => void;
}

export type CommonBottomSheetRef = {
	expand: () => void;
	close: () => void;
	snapToIndex: (index: number) => void;
};

const CommonBottomSheet = forwardRef<CommonBottomSheetRef, Props>(
	(
		{
			children,
			snapPoints = ['50%'],
			onChange,
			onClose,
			index = -1,
			onBackdropPress,
		},
		ref
	) => {
		const bottomSheetRef = useRef<BottomSheet>(null);

		useImperativeHandle(ref, () => ({
			expand: () => bottomSheetRef.current?.expand(),
			close: () => bottomSheetRef.current?.close(),
			snapToIndex: (index: number) =>
				bottomSheetRef.current?.snapToIndex(index),
		}));

		const handleSheetChanges = useCallback(
			(index: number) => {
				if (index === -1 && onClose) {
					onClose();
				}
				onChange?.(index);
			},
			[onChange, onClose]
		);

		const renderBackdrop = useCallback(
			(props: any) => (
				<BottomSheetBackdrop
					{...props}
					disappearsOnIndex={-1}
					appearsOnIndex={0}
					onPress={onBackdropPress}
				/>
			),
			[]
		);

		return (
			<BottomSheet
				ref={bottomSheetRef}
				index={index}
				snapPoints={snapPoints}
				enablePanDownToClose
				onChange={handleSheetChanges}
				backdropComponent={renderBackdrop}
			>
				<BottomSheetView style={styles.container}>
					{children}
				</BottomSheetView>
			</BottomSheet>
		);
	}
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background.primary,
	},
});

export default CommonBottomSheet;
