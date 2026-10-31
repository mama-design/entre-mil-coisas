export type Birthday={id:string,name:string,birth_month:number,birth_day:number,birth_year:number|null,relationship:string,notes:string};
const key=(y:number,m:number,d:number)=>`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
export function anniversaryInYear(b:Birthday,year:number){const last=new Date(Date.UTC(year,b.birth_month,0)).getUTCDate();return key(year,b.birth_month,Math.min(b.birth_day,last))}
export function birthdayOccurrence(b:Birthday,today:string){let year=Number(today.slice(0,4)),date=anniversaryInYear(b,year);if(date<today)date=anniversaryInYear(b,++year);const diff=(Date.parse(date+'T12:00:00Z')-Date.parse(today+'T12:00:00Z'))/86400000;return {date,days:diff,age:b.birth_year===null?null:year-b.birth_year}}
export function birthdayDate(b:Birthday){return `${String(b.birth_day).padStart(2,'0')}/${String(b.birth_month).padStart(2,'0')}`}
export function birthdayVisible(b:Birthday,selected:string,today:string){return selected===birthdayOccurrence(b,today).date}

export function birthdayOnDate(b:Birthday,date:string){const year=Number(date.slice(0,4));return (b.birth_year===null||year>=b.birth_year)&&anniversaryInYear(b,year)===date}
