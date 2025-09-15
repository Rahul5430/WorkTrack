module.exports = {
	Timestamp: {
		fromDate: (d) => ({ toMillis: () => new Date(d).getTime() }),
		fromMillis: (ms) => ({ toMillis: () => ms }),
	},
	getFirestore: () => ({}),
	connectFirestoreEmulator: () => {},
	collection: () => ({}),
	collectionGroup: () => ({}),
	query: () => ({}),
	where: () => ({}),
	getDocs: async () => ({ empty: true, docs: [] }),
	doc: (_db, ...segments) => ({ __path: segments.join('/') }),
	getDoc: async () => ({ exists: () => false, data: () => ({}) }),
	setDoc: async () => {},
};
