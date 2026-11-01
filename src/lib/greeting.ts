// Explicit Brazilian time, including browsers whose default timezone differs.
const clock=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',hourCycle:'h23'});
export function greeting(date:Date){const hour=Number(clock.format(date));return hour>=5&&hour<12?'Bom dia':hour>=12&&hour<18?'Boa tarde':'Boa noite'}
