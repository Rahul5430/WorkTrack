import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
	BottomSheetProps,
	BottomSheetView,
} from '@gorhom/bottom-sheet';
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import { AppState, AppStateStatus, StyleSheet } from 'react-native';

import { logger } from '../../logging';
import { colors } from '../../themes';
import { BottomSheetErrorBoundary } from './BottomSheetErrorBoundary';

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
		const [isAppActive, setIsAppActive] = useState(true);

		// Handle app state changes to prevent errors when Metro disconnects
		useEffect(() => {
			const handleAppStateChange = (nextAppState: AppStateStatus) => {
				setIsAppActive(nextAppState === 'active');

				// Close bottom sheet when app becomes inactive to prevent gesture handler issues
				if (nextAppState !== 'active' && bottomSheetRef.current) {
					try {
						bottomSheetRef.current.close();
					} catch (error) {
						logger.warn(
							'Error closing bottom sheet on app state change',
							{ error }
						);
					}
				}
			};

			const subscription = AppState.addEventListener(
				'change',
				handleAppStateChange
			);
			return () => subscription?.remove();
		}, []);

		useImperativeHandle(ref, () => ({
			expand: () => {
				if (isAppActive && bottomSheetRef.current) {
					try {
						bottomSheetRef.current.expand();
					} catch (error) {
						logger.warn('Error expanding bottom sheet', { error });
					}
				}
			},
			close: () => {
				if (bottomSheetRef.current) {
					try {
						bottomSheetRef.current.close();
					} catch (error) {
						logger.warn('Error closing bottom sheet', { error });
					}
				}
			},
			snapToIndex: (snapIndex: number) => {
				if (isAppActive && bottomSheetRef.current) {
					try {
						bottomSheetRef.current.snapToIndex(snapIndex);
					} catch (error) {
						logger.warn('Error snapping bottom sheet to index', {
							error,
							snapIndex,
						});
					}
				}
			},
		}));

		const handleSheetChanges = useCallback(
			(sheetIndex: number) => {
				try {
					if (sheetIndex === -1 && onClose) {
						onClose();
					}
					onChange?.(sheetIndex);
				} catch (error) {
					logger.warn('Error in bottom sheet change handler', {
						error,
						sheetIndex,
					});
				}
			},
			[onChange, onClose]
		);

		const renderBackdrop = useCallback(
			(props: BottomSheetBackdropProps) => (
				<BottomSheetBackdrop
					{...props}
					disappearsOnIndex={-1}
					appearsOnIndex={0}
					onPress={onBackdropPress}
				/>
			),
			[onBackdropPress]
		);

		// Don't render bottom sheet if app is not active to prevent gesture handler issues
		if (!isAppActive) {
			return null;
		}

		return (
			<BottomSheetErrorBoundary>
				<BottomSheet
					ref={bottomSheetRef}
					index={index}
					snapPoints={snapPoints}
					enablePanDownToClose
					onChange={handleSheetChanges}
					backdropComponent={renderBackdrop}
					keyboardBehavior='interactive'
					keyboardBlurBehavior='restore'
					android_keyboardInputMode='adjustResize'
					// Add additional props for better stability
					enableOverDrag={false}
					enableContentPanningGesture={isAppActive}
				>
					<BottomSheetView style={styles.container}>
						{children}
					</BottomSheetView>
				</BottomSheet>
			</BottomSheetErrorBoundary>
		);
	}
);

CommonBottomSheet.displayName = 'CommonBottomSheet';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background.primary,
	},
});

export default CommonBottomSheet;
