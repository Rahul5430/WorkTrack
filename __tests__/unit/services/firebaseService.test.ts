jest.mock('@react-native-firebase/app', () => ({ getApp: () => ({}) }));
jest.mock('@env', () => ({ FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080' }));

describe('services/firebase getFirestoreInstance', () => {
	afterEach(() => {
		jest.resetModules();
	});

	it('connects to emulator when host present', () => {
		const firestore = require('@react-native-firebase/firestore');
		const spy = jest
			.spyOn(firestore, 'connectFirestoreEmulator')
			.mockImplementation(() => {});
		const svc = require('../../../src/services/firebase');
		const db = svc.getFirestoreInstance();
		expect(db).toBeTruthy();
		expect(spy).toHaveBeenCalledWith(expect.anything(), '127.0.0.1', 8080);
	});

	it('logs warn when emulator connect throws', () => {
		const firestore = require('@react-native-firebase/firestore');
		jest.spyOn(firestore, 'connectFirestoreEmulator').mockImplementation(
			() => {
				throw new Error('already connected');
			}
		);
		const logging = require('../../../src/logging');
		const warnSpy = jest
			.spyOn(logging.logger, 'warn')
			.mockImplementation(() => {});
		const svc = require('../../../src/services/firebase');
		const db = svc.getFirestoreInstance();
		expect(db).toBeTruthy();
		expect(warnSpy).toHaveBeenCalled();
	});
});
