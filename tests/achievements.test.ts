import test from 'node:test';
import assert from 'node:assert/strict';
import {smokeProgress,weightSummary,brazilToday,DAY_MS} from '../src/lib/achievements.ts';
test('elapsed full days follow the exact start hour in Brazil, rather than calendar boundaries',()=>{
 const start='2026-01-01T22:00:00-03:00',t=Date.parse(start);
 assert.equal(smokeProgress(start,15,1,t+DAY_MS-1).days,0);
 assert.equal(smokeProgress(start,15,1,t+DAY_MS).days,1);
 const p=smokeProgress(start,15,1,t+65*DAY_MS+2*3600000+30*60000);
 assert.equal(p.days,65);assert.equal(p.hours,2);assert.equal(p.minutes,30);
 assert.ok(Math.abs(p.saved-(975+1.5625))<.00001);
 assert.equal(smokeProgress(start,15,1,t-1).saved,0);
});
test('a new calendar date before midnight UTC is still the correct date in Brazil',()=>{
 assert.equal(brazilToday(new Date('2026-01-02T01:00:00Z')),'2026-01-01');
});
test('history is sorted by date and compares latest with earliest without requiring a goal',()=>{
 const a={date:'2026-01-01',weight:90,notes:''},b={date:'2026-02-01',weight:89.4,notes:''};
 const s=weightSummary([b,a],null);assert.equal(s.first,a);assert.equal(s.latest,b);assert.equal(s.difference,-.6);assert.equal(s.remaining,null);
 assert.equal(weightSummary([b,a],80).remaining,9.4);
 assert.equal(weightSummary([],80).difference,null);
});
