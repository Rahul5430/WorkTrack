import { GOOGLE_SIGN_IN_CLIENT_ID } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	getAuth,
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithCredential,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { AuthStackScreenProps } from '@/app/navigation/types';
import {
	AppDispatch,
	RootState,
	setErrorMessage,
	setLoggedIn,
	setUser,
	setUserLoading as setIsFetching,
} from '@/app/store';
import FocusAwareStatusBar from '@/shared/ui/components/FocusAwareStatusBar';
import { logger } from '@/shared/utils/logging';

// Define GoogleUser type locally - matches User interface
interface GoogleUser {
	id: string;
	name: string;
	email: string;
	photo?: string;
	workTrackId?: string;
	createdAt: string;
	updatedAt: string;
}

GoogleSignin.configure({
	webClientId: GOOGLE_SIGN_IN_CLIENT_ID,
});

const WelcomeScreen: React.FC<AuthStackScreenProps<'WelcomeScreen'>> = () => {
	const { loading: isFetching } = useSelector(
		(state: RootState) => state.user
	);
	const dispatch = useDispatch<AppDispatch>();
	// Manager wiring handled by SyncManager and DI

	useEffect(() => {
		const auth = getAuth();
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				try {
					dispatch(setIsFetching(true));
					const userInfo: GoogleUser = {
						id: firebaseUser.uid,
						name: firebaseUser.displayName ?? 'Unknown',
						email: firebaseUser.email ?? 'Unknown',
						photo: firebaseUser.photoURL ?? '',
						workTrackId: undefined,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					};

					// Firestore/user persistence is handled via repositories elsewhere

					// Only update UI state after sync is complete
					await AsyncStorage.setItem(
						'user',
						JSON.stringify(userInfo)
					);
					dispatch(setUser(userInfo));
					dispatch(setLoggedIn(true));
				} catch (error) {
					logger.error('Error during login sync:', { error });
					dispatch(
						setErrorMessage(
							'Failed to sync data. Please try again.'
						)
					);
				} finally {
					dispatch(setIsFetching(false));
				}
			}
		});

		return unsubscribe;
	}, [dispatch]);

	const signInWithGoogle = async () => {
		try {
			dispatch(setIsFetching(true));

			await GoogleSignin.hasPlayServices({
				showPlayServicesUpdateDialog: true,
			});

			const signInResult = await GoogleSignin.signIn();
			const idToken = signInResult?.data?.idToken;

			if (!idToken) {
				throw new Error('No ID token found');
			}

			const auth = getAuth();
			const credential = GoogleAuthProvider.credential(idToken);
			await signInWithCredential(auth, credential);

			dispatch(setIsFetching(false));
		} catch (error) {
			dispatch(setIsFetching(false));
			dispatch(
				setErrorMessage(
					error instanceof Error
						? error.message
						: 'Google SignIn Error'
				)
			);
		}
	};

	return (
		<View style={styles.screen}>
			<FocusAwareStatusBar
				barStyle='dark-content'
				translucent
				backgroundColor='transparent'
			/>
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
