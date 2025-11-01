// Label component
import React from 'react';
import { Text, TextProps } from 'react-native';

interface LabelProps extends TextProps {
	children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({ children, ...props }) => {
	return <Text {...props}>{children}</Text>;
};
