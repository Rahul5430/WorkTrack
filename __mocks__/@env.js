// Export a mutable object so tests can modify it
const mockEnv = {
	FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
};

module.exports = mockEnv;
