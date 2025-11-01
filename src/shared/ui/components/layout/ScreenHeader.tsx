import * as React from 'react';
import { Text, View } from 'react-native';

interface ScreenHeaderProps {
	title: string;
}

export default function ScreenHeader({ title }: ScreenHeaderProps) {
	return (
		<View>
			<Text>{title}</Text>
		</View>
	);
}
