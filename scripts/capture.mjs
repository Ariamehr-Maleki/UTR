import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'msedge',headless:true});
await fs.mkdir('../../screenshots',{recursive:true});
const errors=[];
for(const width of [390,768,1440]){
 const page=await browser.newPage({viewport:{width,height:1000}});
 page.on('pageerror',e=>errors.push(e.message));
 for(const [route,name] of [['/','home'],['/preview/student','student'],['/preview/instructor','instructor'],['/auth/login','login'],['/events','events'],['/club','club']]){
  await page.goto('http://127.0.0.1:3000'+route);await page.waitForLoadState('networkidle');await page.screenshot({path:`../../screenshots/${name}-${width}.png`,fullPage:true});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)errors.push(`${route} overflows at ${width}`);
  if(await page.locator('h1').count()!==1)errors.push(`${route} missing unique h1`);
 }
 await page.close();
}
await browser.close();console.log(JSON.stringify({errors}));if(errors.length)process.exitCode=1;
