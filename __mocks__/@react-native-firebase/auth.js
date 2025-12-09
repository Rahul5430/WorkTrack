module.exports = {
	getAuth: () => ({
		currentUser: { uid: 'test-user', email: 'test@example.com' },
		onAuthStateChanged: jest.fn((callback) => {
			// Immediately call callback with null to simulate no user
			callback(null);
			// Return unsubscribe function
			return jest.fn();
		}),
		signInWithCredential: jest.fn(),
	}),
	GoogleAuthProvider: {
		credential: jest.fn(),
	},
	signInWithCredential: jest.fn(),
};
