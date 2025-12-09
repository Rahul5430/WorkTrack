declare module '@env' {
	export const GOOGLE_SIGN_IN_CLIENT_ID: string;
}
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.png';
declare module '*.webp';
declare module '*.svg' {
	import React from 'react';
	import { SvgProps } from 'react-native-svg';

	const content: React.FC<SvgProps>;
	export default content;
}
