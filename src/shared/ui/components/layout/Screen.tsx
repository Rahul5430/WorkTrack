import * as React from 'react';
import { StyleSheet, View } from 'react-native';

interface ScreenProps {
	children?: React.ReactNode;
}

export default function Screen({ children }: ScreenProps) {
	return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
