import { useIsFocused } from '@react-navigation/native';
import { StatusBar, StatusBarProps } from 'react-native';

const FocusAwareStatusBar = (props: StatusBarProps) => {
	const isFocused = useIsFocused();
	return isFocused ? <StatusBar {...props} /> : null;
};

export default FocusAwareStatusBar;
