#!/usr/bin/env node
/*
 Simple feature scaffolding script matching docs/ARCHITECTURE_STRUCTURE.md
 Usage: node scripts/generate-feature.js <feature-name>
*/
const fs = require('fs');
const path = require('path');

function ensureDir(p) {
	if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeIfMissing(p, content) {
	if (!fs.existsSync(p)) fs.writeFileSync(p, content, 'utf8');
}

function main() {
	const name = process.argv[2];
	if (!name) {
		// eslint-disable-next-line no-console
		console.error('Usage: node scripts/generate-feature.js <feature-name>');
		process.exit(1);
	}
	const base = path.join(__dirname, '..', 'src', 'features', name);
	const dirs = [
		'domain/entities',
		'domain/ports',
		'domain/use-cases',
		'domain/validators',
		'data/repositories',
		'data/services',
		'data/models',
		'data/mappers',
		'ui/screens',
		'ui/components',
		'ui/hooks',
		'store',
	];
	dirs.forEach((d) => ensureDir(path.join(base, d)));

	writeIfMissing(
		path.join(base, 'di.ts'),
		`// ${name} feature DI registration\nexport function register${capitalize(name)}Services(builder: any) {\n  return builder;\n}\n`
	);
	writeIfMissing(path.join(base, 'index.ts'), `// ${name} public API\n`);
	// eslint-disable-next-line no-console
	console.log(`Feature '${name}' scaffolded at ${base}`);
}

function capitalize(s) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

main();
