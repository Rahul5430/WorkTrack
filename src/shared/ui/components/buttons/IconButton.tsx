import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface IconButtonProps {
	name: string;
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
			<MaterialCommunityIcons name={name} size={size} color={color} />
		</TouchableOpacity>
	);
}
