// Minimal environment loader compatible with RN and Jest mocks
// Values are provided by @env (babel-plugin-inline-dotenv or react-native-dotenv)
// Tests stub this via jest.setup.js
// We avoid 'any' by asserting unknown to a string map

const raw = ((): Record<string, string | undefined> => {
	try {
		const mod = require('@env') as unknown;
		return (mod ?? {}) as Record<string, string | undefined>;
	} catch {
		return {};
	}
})();

export const ENV = {
	FIRESTORE_EMULATOR_HOST: raw.FIRESTORE_EMULATOR_HOST,
};
