import {dateKey,parse} from './recurrence';
export type Habit={id:string,title:string,days:string,startDate:string,icon:string,color:string,notes:string,archived:number};
export type HabitLog={habitId:string,date:string};
export function weekStart(date:string){const d=parse(date);d.setDate(d.getDate()-((d.getDay()+6)%7));return dateKey(d)}
export function addDays(date:string,n:number){const d=parse(date);d.setDate(d.getDate()+n);return dateKey(d)}
export function scheduled(h:Habit,date:string){return date>=h.startDate&&h.days.split(',').includes(String(parse(date).getDay()))}
export function progress(habits:Habit[],logs:HabitLog[],from:string,to:string,today:string){const end=to<today?to:today,checked=new Set(logs.map(l=>l.habitId+':'+l.date));let done=0,total=0;for(const h of habits){for(let d=from;d<=end;d=addDays(d,1))if(scheduled(h,d)){total++;if(checked.has(h.id+':'+d))done++}}return {done,total,percent:total?Math.round(done/total*100):0}}
