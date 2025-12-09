#!/usr/bin/env node
/*
 WatermelonDB migration helper:
 - Prints current schema and migration versions
 - Suggests next steps to add a migration
*/
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(
	__dirname,
	'..',
	'src',
	'shared',
	'data',
	'database',
	'watermelon',
	'schema.ts'
);
const migrationsPath = path.join(
	__dirname,
	'..',
	'src',
	'shared',
	'data',
	'database',
	'watermelon',
	'migrations.ts'
);

function readVersion(file, regex) {
	const text = fs.readFileSync(file, 'utf8');
	const m = text.match(regex);
	return m ? parseInt(m[1], 10) : null;
}

const schemaVersion = readVersion(schemaPath, /version:\s*(\d+)/);
const latestMigration = readVersion(migrationsPath, /toVersion:\s*(\d+)/g);

// eslint-disable-next-line no-console
console.log(`Schema version: ${schemaVersion ?? 'unknown'}`);
// eslint-disable-next-line no-console
console.log(`Latest migration 'toVersion': ${latestMigration ?? 'unknown'}`);
// eslint-disable-next-line no-console
console.log(
	'To add a migration: update schema.ts version and add a step in migrations.ts'
);
