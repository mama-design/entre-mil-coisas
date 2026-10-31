import test from 'node:test';
import assert from 'node:assert/strict';
import {birthdayOccurrence,birthdayVisible} from '../src/lib/birthdays.ts';
const b={id:'test',name:'Pessoa',birth_month:6,birth_day:15,birth_year:2020,relationship:'',notes:''};
test('birthday age advances automatically every year and is omitted without a birth year',()=>{
 assert.equal(birthdayOccurrence(b,'2026-06-15').age,6);
 assert.equal(birthdayOccurrence(b,'2027-06-15').age,7);
 assert.equal(birthdayOccurrence({...b,birth_year:null},'2026-06-15').age,null);
});
test('birthdays appear on their own day without advance reminders',()=>{
 assert.equal(birthdayVisible(b,'2026-06-14','2026-06-14'),false);
 assert.equal(birthdayVisible(b,'2026-06-15','2026-06-15'),true);
 assert.equal(birthdayVisible(b,'2026-06-16','2026-06-16'),false);
 assert.equal(birthdayVisible(b,'2026-06-15','2026-06-14'),true);
});
test('next anniversary crosses year boundary correctly and Feb 29 uses Feb 28 in non-leap years',()=>{
 assert.equal(birthdayOccurrence(b,'2026-12-31').date,'2027-06-15');
 const leap={...b,birth_day:29,birth_month:2,birth_year:2020};
 assert.equal(birthdayOccurrence(leap,'2027-01-01').date,'2027-02-28');
 assert.equal(birthdayOccurrence(leap,'2028-01-01').date,'2028-02-29');
});
