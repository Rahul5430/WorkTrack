import * as React from 'react';
import { Text, View } from 'react-native';

interface SharedWithMeListItemProps {
	title: string;
}

export default function SharedWithMeListItem({
	title,
}: SharedWithMeListItemProps) {
	return (
		<View>
			<Text>{title}</Text>
		</View>
	);
}
