// Common bottom sheet component
import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
	BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import { AppState, AppStateStatus, StyleSheet } from 'react-native';

import ErrorBoundary from '@/shared/ui/components/feedback/ErrorBoundary';
import { colors } from '@/shared/ui/theme';
import { logger } from '@/shared/utils/logging';

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
	index?: number;
}

export const CommonBottomSheet = forwardRef<
	CommonBottomSheetRef,
	CommonBottomSheetProps
>(function CommonBottomSheet(
	{
		children,
		snapPoints = ['50%'],
		onChange,
		onClose,
		index = -1,
		onBackdropPress,
	},
	ref
) {
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
						{
							error,
						}
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

	useImperativeHandle(
		ref,
		() => ({
			open: () => {
				if (isAppActive && bottomSheetRef.current) {
					try {
						bottomSheetRef.current.expand();
					} catch (error) {
						logger.warn('Error opening bottom sheet', { error });
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
			expand: () => {
				if (isAppActive && bottomSheetRef.current) {
					try {
						bottomSheetRef.current.expand();
					} catch (error) {
						logger.warn('Error expanding bottom sheet', { error });
					}
				}
			},
		}),
		[isAppActive]
	);

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
		<ErrorBoundary>
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
				enableOverDrag={false}
				enableContentPanningGesture={isAppActive}
			>
				<BottomSheetView style={styles.container}>
					{children}
				</BottomSheetView>
			</BottomSheet>
		</ErrorBoundary>
	);
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background.primary,
	},
});
