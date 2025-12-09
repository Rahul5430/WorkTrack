// migrated to V2 structure
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '../../../../shared/ui/theme/colors';

interface AuthLoadingIndicatorProps {
	size?: 'small' | 'large';
	color?: string;
}

const AuthLoadingIndicator: React.FC<AuthLoadingIndicatorProps> = ({
	size = 'large',
	color = colors.office,
}) => {
	// const { RFValue } = useResponsiveLayout();

	return (
		<View style={styles.container}>
			<ActivityIndicator size={size} color={color} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default AuthLoadingIndicator;
