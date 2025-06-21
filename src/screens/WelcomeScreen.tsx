import { GOOGLE_SIGN_IN_CLIENT_ID } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp } from '@react-native-firebase/app';
import {
	getAuth,
	GoogleAuthProvider,
	signInWithCredential,
} from '@react-native-firebase/auth';
import {
	doc,
	getDoc,
	getFirestore,
	setDoc,
} from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import SyncService from '../services/sync';
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
		const auth = getAuth(getApp());
		const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
			if (firebaseUser) {
				try {
					const userInfo: GoogleUser = {
						id: firebaseUser.uid,
						name: firebaseUser.displayName ?? 'Unknown',
						email: firebaseUser.email ?? 'Unknown',
						photo: firebaseUser.photoURL ?? '',
					};

					// Create or update user in Firestore
					const db = getFirestore(getApp());
					const userRef = doc(db, 'users', firebaseUser.uid);
					const userSnapshot = await getDoc(userRef);

					const userData: GoogleUser = {
						...userInfo,
						email: userInfo.email.toLowerCase(),
						updatedAt: new Date(),
					};

					if (!userSnapshot.exists()) {
						userData.createdAt = new Date();
					}

					await setDoc(userRef, userData, { merge: true });

					// Trigger initial sync before updating UI state
					const syncService = SyncService.getInstance();
					await syncService.syncFromFirebase();
					syncService.startPeriodicSync();

					// Only update UI state after sync is complete
					await AsyncStorage.setItem(
						'user',
						JSON.stringify(userInfo)
					);
					dispatch(setUser(userInfo));
					dispatch(setLoggedIn(true));
				} catch (error) {
					console.error('Error during login sync:', error);
					dispatch(
						setErrorMessage(
							'Failed to sync data. Please try again.'
						)
					);
				}
			}
		});

		return unsubscribe;
	}, []);

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

			const auth = getAuth(getApp());
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
