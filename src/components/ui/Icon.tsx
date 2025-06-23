import { StyleProp, ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type IconProps = {
	name: keyof typeof MaterialCommunityIcons.glyphMap;
	size?: number;
	color?: string;
	style?: StyleProp<ViewStyle>;
};

const Icon = ({ name, size = 24, color, style }: IconProps) => {
	return (
		<MaterialCommunityIcons
			name={name}
			size={size}
			color={color}
			style={style}
		/>
	);
};

export default Icon;
