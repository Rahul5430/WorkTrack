import * as React from 'react';
import { Text, View } from 'react-native';

interface ShareListItemProps {
	title: string;
}

export default function ShareListItem({ title }: ShareListItemProps) {
	return (
		<View>
			<Text>{title}</Text>
		</View>
	);
}
