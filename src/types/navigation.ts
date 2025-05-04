import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type MainStackParamList = {
	AuthenticatedStack: undefined;
	WelcomeStack: undefined;
	LoadingStack: undefined;
};

export type MainStackScreenProps<T extends keyof MainStackParamList> =
	NativeStackScreenProps<MainStackParamList, T>;

export type WelcomeStackParamList = {
	WelcomeScreen: undefined;
};

export type WelcomeStackScreenProps<T extends keyof WelcomeStackParamList> =
	NativeStackScreenProps<WelcomeStackParamList, T>;

export type LoadingStackParamList = {
	LoadingScreen: undefined;
};

export type LoadingStackScreenProps<T extends keyof LoadingStackParamList> =
	NativeStackScreenProps<LoadingStackParamList, T>;

export type AuthenticatedStackParamList = {
	HomeScreen: undefined;
};

export type AuthenticatedStackScreenProps<
	T extends keyof AuthenticatedStackParamList,
> = NativeStackScreenProps<AuthenticatedStackParamList, T>;

declare global {
	namespace ReactNavigation {
		interface MainParamList extends MainStackParamList {}
	}
}
