import {writeFileSync} from 'node:fs';
const version=JSON.stringify({build:new Date().toISOString()})+'\n';
writeFileSync(new URL('../src/build-version.json',import.meta.url),version);
writeFileSync(new URL('../public/app-version.json',import.meta.url),version);
