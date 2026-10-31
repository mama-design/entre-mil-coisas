export type AchievementSettings={smoke_started_at:string,pack_price:number,packs_per_day:number,goal_weight:number|null};
export type WeightLog={date:string,weight:number,notes:string};
export const DAY_MS=86400000;
export function smokeProgress(start:string,price:number,packs:number,now:number){
 const elapsed=Math.max(0,now-Date.parse(start));
 const totalDays=elapsed/DAY_MS;
 return {days:Math.floor(totalDays),hours:Math.floor(elapsed/3600000)%24,minutes:Math.floor(elapsed/60000)%60,seconds:Math.floor(elapsed/1000)%60,saved:totalDays*price*packs,packs:totalDays*packs,totalDays};
}
export function brazilToday(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now)}
export function weightSummary(logs:WeightLog[],goal:number|null){const sorted=[...logs].sort((a,b)=>a.date.localeCompare(b.date));const first=sorted[0],latest=sorted.at(-1);const difference=first&&latest?Math.round((Number(latest.weight)-Number(first.weight))*100)/100:null;return {sorted,first,latest,difference,remaining:latest&&goal!==null?Math.round((Number(latest.weight)-goal)*100)/100:null}}
