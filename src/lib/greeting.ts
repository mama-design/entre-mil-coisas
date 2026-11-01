// Use the clock of the device where Martina opens the app.
export function greeting(date:Date){const hour=date.getHours();return hour>=5&&hour<12?'Bom dia':hour>=12&&hour<18?'Boa tarde':'Boa noite'}
