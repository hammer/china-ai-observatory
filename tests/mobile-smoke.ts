import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const base=process.env.TEST_BASE_URL??'http://127.0.0.1:4321';
const browser=await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined, args: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? ['--no-sandbox','--disable-dev-shm-usage','--single-process','--use-gl=angle','--use-angle=swiftshader'] : [] });
try {
  const page=await browser.newPage();
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'networkidle'});
  const company=await page.locator('a[href^="/companies/"]').first().getAttribute('href');
  await page.goto(base+'/briefings/');
  const briefing=await page.locator('h3 a[href^="/briefings/"]').first().getAttribute('href');
  const paths=['/','/stack/','/benchmarks/','/timeline/','/briefings/','/sources/','/whats-new/',company!,briefing!];
  mkdirSync('test-results',{recursive:true});
  for(const width of [375,600,880,1280]) {
    await page.setViewportSize({width,height:width===375?720:800});
    for(const path of paths) {
      const response=await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(response?.status(),200,path);
      const measurements=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelector('h1')?.getBoundingClientRect().width}));
      if(measurements.scroll>measurements.width+1) console.log(await page.evaluate(()=>[...document.querySelectorAll('*')].map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width,overflow:getComputedStyle(e).overflowX})).filter(e=>e.right>innerWidth+1)));
      assert.ok(measurements.scroll<=width+1 && measurements.width<=width+1,`${path} overflows at ${width}: ${JSON.stringify(measurements)}`);
      assert.ok(measurements.h1&&measurements.h1>0);
      if((width===375||width===1280)&&['/','/benchmarks/',company].includes(path)) await page.screenshot({path:`test-results/${path==='/'?'index':path.split('/').filter(Boolean).join('-')}-${width}.png`,fullPage:true});
    }
    console.log(`No document overflow across ${paths.length} routes at ${width}px.`);
  }
  await page.goto(base);await page.setViewportSize({width:1280,height:800});
  assert.ok(await page.locator('.layer-col').first().isVisible());assert.ok(await page.locator('.review-col').first().isVisible());
  assert.deepEqual(errors,[]);
} finally {await browser.close();}
