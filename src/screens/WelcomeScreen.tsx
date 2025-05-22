import { GOOGLE_SIGN_IN_CLIENT_ID } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import {
	GoogleUser,
	setErrorMessage,
	setIsFetching,
	setLoggedIn,
	setUser,
} from '../store/reducers/userSlice';
import { AppDispatch, RootState } from '../store/store';
import { WelcomeStackScreenProps } from '../types/navigation';

GoogleSignin.configure({
	webClientId: GOOGLE_SIGN_IN_CLIENT_ID,
});

const WelcomeScreen: React.FC<
	WelcomeStackScreenProps<'WelcomeScreen'>
> = () => {
	const { isFetching } = useSelector((state: RootState) => state.user);
	const dispatch = useDispatch<AppDispatch>();

	// Handle Firebase auth state change
	useEffect(() => {
		const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
			console.log('Firebase User', firebaseUser);
			if (firebaseUser) {
				// You can optionally reload the user or read fresh token if needed
				const userInfo: GoogleUser = {
					id: firebaseUser.uid,
					name: firebaseUser.displayName ?? 'Unknown',
					email: firebaseUser.email ?? 'Unknown',
					photo: firebaseUser.photoURL ?? '',
				};

				console.log('User Info', userInfo);

				await AsyncStorage.setItem('user', JSON.stringify(userInfo));
				dispatch(setUser(userInfo));
				dispatch(setLoggedIn(true));
			}
		});

		return unsubscribe;
	}, []);

	const signInWithGoogle = async () => {
		try {
			dispatch(setIsFetching(true));

			// Check if your device supports Google Play
			await GoogleSignin.hasPlayServices({
				showPlayServicesUpdateDialog: true,
			});

			// Sign in and get token
			const signInResult = await GoogleSignin.signIn();
			const idToken = signInResult?.data?.idToken;

			if (!idToken) {
				throw new Error('No ID token found');
			}

			// Authenticate with Firebase
			const googleCredential =
				auth.GoogleAuthProvider.credential(idToken);
			await auth().signInWithCredential(googleCredential);

			dispatch(setIsFetching(false));
		} catch (error) {
			dispatch(setIsFetching(false));
			dispatch(setErrorMessage('Google SignIn Error'));
			console.log('### Google SignIn Error: ', error);
		}
	};

	return (
		<View style={styles.screen}>
			<Text>Welcome Screen</Text>
			<Button
				mode='contained'
				loading={isFetching}
				onPress={signInWithGoogle}
			>
				Sign In With Google
			</Button>
		</View>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default WelcomeScreen;
