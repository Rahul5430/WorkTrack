import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthenticatedStackParamList = {
	HomeScreen: undefined;
	ProfileScreen: undefined;
};

export type WelcomeStackParamList = {
	WelcomeScreen: undefined;
};

export type LoadingStackParamList = {
	LoadingScreen: undefined;
};

export type MainStackParamList = {
	AuthenticatedStack: NavigatorScreenParams<AuthenticatedStackParamList>;
	WelcomeStack: NavigatorScreenParams<WelcomeStackParamList>;
	LoadingStack: NavigatorScreenParams<LoadingStackParamList>;
};

export type MainStackScreenProps<T extends keyof MainStackParamList> =
	NativeStackScreenProps<MainStackParamList, T>;

export type AuthenticatedStackScreenProps<
	T extends keyof AuthenticatedStackParamList,
> = NativeStackScreenProps<AuthenticatedStackParamList, T>;

export type WelcomeStackScreenProps<T extends keyof WelcomeStackParamList> =
	NativeStackScreenProps<WelcomeStackParamList, T>;

export type LoadingStackScreenProps<T extends keyof LoadingStackParamList> =
	NativeStackScreenProps<LoadingStackParamList, T>;

declare global {
	namespace ReactNavigation {
		interface MainParamList extends MainStackParamList {}
	}
}
