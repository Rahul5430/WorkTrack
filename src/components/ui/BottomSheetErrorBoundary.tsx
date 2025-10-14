import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { logger } from '../../logging';
import { colors } from '../../themes';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class BottomSheetErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log the error for debugging
		logger.error('BottomSheet Error Boundary caught an error', {
			error: error.message,
			stack: error.stack,
			componentStack: errorInfo.componentStack,
		});
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>
						Something went wrong with the bottom sheet
					</Text>
				</View>
			);
		}

		return this.props.children;
	}
}

const styles = StyleSheet.create({
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.background.primary,
		padding: 20,
	},
	errorText: {
		color: colors.text.primary,
		textAlign: 'center',
		fontSize: 16,
	},
});
