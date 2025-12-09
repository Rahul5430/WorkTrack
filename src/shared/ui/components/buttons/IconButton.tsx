import MaterialDesignIcons, {
	type MaterialDesignIconsIconName,
} from '@react-native-vector-icons/material-design-icons';
import * as React from 'react';
import { TouchableOpacity } from 'react-native';

interface IconButtonProps {
	name: MaterialDesignIconsIconName;
	size?: number;
	color?: string;
	onPress: () => void;
}

export default function IconButton({
	name,
	size = 24,
	color = '#000',
	onPress,
}: IconButtonProps) {
	return (
		<TouchableOpacity onPress={onPress} accessibilityRole='button'>
			<MaterialDesignIcons name={name} size={size} color={color} />
		</TouchableOpacity>
	);
}
