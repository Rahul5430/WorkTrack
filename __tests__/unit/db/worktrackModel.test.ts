describe('WorkTrack model', () => {
	it('has correct static properties', () => {
		const model =
			require('../../../src/db/watermelon/worktrack/model').default;
		expect(model.table).toBe('work_tracks');
		expect(model.associations).toHaveProperty('trackers');
	});

	it('validate throws on missing fields and invalid status', () => {
		const WorkTrack =
			require('../../../src/db/watermelon/worktrack/model').default;
		interface MinimalWorkTrack {
			date: string;
			status: string;
		}
		const instance = Object.create(WorkTrack.prototype) as MinimalWorkTrack;
		instance.date = '';
		instance.status = '';
		expect(() => WorkTrack.prototype.validate.call(instance)).toThrow(
			'Invalid entry: missing required fields'
		);
		instance.date = '2025-01-01';
		instance.status = 'invalid';
		expect(() => WorkTrack.prototype.validate.call(instance)).toThrow(
			'Invalid status value'
		);
	});
});
