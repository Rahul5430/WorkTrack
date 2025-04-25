declare module '@env' {}
declare module 'eslint-plugin-import' {
	const value: Record<string, any>;
	export = value;
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
