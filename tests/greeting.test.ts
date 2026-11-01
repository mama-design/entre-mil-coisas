import test from 'node:test';
import assert from 'node:assert/strict';
import {greeting} from '../src/lib/greeting.ts';
test('uses Brasilia time at midnight and the exact morning, afternoon and night boundaries',()=>{
 for(const [time,want] of [['2026-11-01T03:07:00Z','Boa noite'],['2026-11-01T07:59:00Z','Boa noite'],['2026-11-01T08:00:00Z','Bom dia'],['2026-11-01T14:59:00Z','Bom dia'],['2026-11-01T15:00:00Z','Boa tarde'],['2026-11-01T20:59:00Z','Boa tarde'],['2026-11-01T21:00:00Z','Boa noite']])assert.equal(greeting(new Date(time)),want);
});
