import * as React from 'react';
import { Text, View } from 'react-native';

interface ListItemProps {
	title: string;
	subtitle?: string;
}

export default function ListItem({ title, subtitle }: ListItemProps) {
	return (
		<View>
			<Text>{title}</Text>
			{subtitle ? <Text>{subtitle}</Text> : null}
		</View>
	);
}
