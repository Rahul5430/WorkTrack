import * as React from 'react';
import { forwardRef } from 'react';
import { View } from 'react-native';

interface CommonBottomSheetProps {
	visible?: boolean;
	children?: React.ReactNode;
	onChange?: (index: number) => void;
	snapPoints?: string[];
	onBackdropPress?: () => void;
	onClose?: () => void;
}

const CommonBottomSheet = forwardRef<View, CommonBottomSheetProps>(
	({ visible = true, children }, _ref) => {
		if (!visible) return null;
		return <View>{children}</View>;
	}
);

CommonBottomSheet.displayName = 'CommonBottomSheet';

export default CommonBottomSheet;
