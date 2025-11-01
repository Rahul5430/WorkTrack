#!/usr/bin/env node
/*
 Lightweight architecture validator enforcing import boundaries from docs:
 - domain/ must not import from data/ or ui/
 - features/* must not import from other features directly
 - shared/ must not import from app/ or features/
This is a static grep-based validator (no extra deps).
*/
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src');
const violations = [];

function walk(dir, cb) {
	for (const entry of fs.readdirSync(dir)) {
		const p = path.join(dir, entry);
		const stat = fs.statSync(p);
		if (stat.isDirectory()) walk(p, cb);
		else if (p.endsWith('.ts') || p.endsWith('.tsx')) cb(p);
	}
}

function checkFile(file) {
	const rel = path.relative(root, file).replace(/\\/g, '/');
	const text = fs.readFileSync(file, 'utf8');
	const imports = [...text.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(
		(m) => m[1]
	);

	const isDomain = /features\/[^/]+\/domain\//.test(rel);
	const isShared = rel.startsWith('shared/');
	const isFeature = /features\/[^/]+\//.test(rel);
	const thisFeature = isFeature ? rel.split('/')[1] : null;

	for (const imp of imports) {
		// Relative only for simple static analysis
		if (imp.startsWith('.')) continue;
		// 1) domain cannot import data or ui
		if (isDomain && /features\/.+\/(data|ui)\//.test(imp)) {
			violations.push(`${rel}: domain imports data/ui -> ${imp}`);
		}
		// 2) shared cannot import from app or features
		if (isShared && (/^app\//.test(imp) || /^features\//.test(imp))) {
			violations.push(`${rel}: shared imports app/features -> ${imp}`);
		}
		// 3) cross-feature direct imports forbidden
		if (isFeature && /^features\//.test(imp)) {
			const other = imp.split('/')[1];
			if (other && other !== thisFeature) {
				violations.push(`${rel}: cross-feature import -> ${imp}`);
			}
		}
	}
}

walk(root, checkFile);
if (violations.length) {
	// eslint-disable-next-line no-console
	console.error('Architecture violations found:\n' + violations.join('\n'));
	process.exit(1);
} else {
	// eslint-disable-next-line no-console
	console.log('Architecture validation passed.');
}
