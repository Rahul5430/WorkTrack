import * as React from 'react';
import { View } from 'react-native';

interface CardProps {
	children?: React.ReactNode;
}

export default function Card({ children }: CardProps) {
	return <View>{children}</View>;
}
