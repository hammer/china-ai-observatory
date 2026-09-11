import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL??'http://127.0.0.1:4321';
const launch=()=>chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined, args: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? ['--no-sandbox','--disable-dev-shm-usage','--single-process','--use-gl=angle','--use-angle=swiftshader'] : [] });
for(const mobile of [false,true]) {
  const browser=await launch();
  try {
    const page=await browser.newPage({viewport:mobile?{width:375,height:720}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile});
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base,{waitUntil:'networkidle'});
    const total=await page.locator('[data-record-list] [data-record]').count();assert.ok(total>0);
    const first=page.locator('[data-record-list] [data-record]').first();
    const name=(await first.locator('th a').first().textContent())!.trim();
    await page.locator('[data-search-input]').fill(name);
    await page.waitForFunction(()=>![...document.querySelectorAll<HTMLElement>('[data-record-list] [data-record]:not([hidden])')].some(row=>!row.dataset.search?.includes((document.querySelector<HTMLInputElement>('[data-search-input]')!.value).toLowerCase())));
    assert.ok(await page.locator('[data-record-list] [data-record]:visible').count()>0);
    await page.locator('[data-search-input]').fill('no-such-company-unique-fixture');
    assert.equal(await page.locator('[data-record-list] [data-record]:visible').count(),0);assert.ok(await page.locator('[data-empty]').isVisible());
    await page.locator('[data-search-input]').fill('');
    const key=(await first.getAttribute('data-layers'))!.split(',')[0]!;
    await page.locator('[data-dim-key="layer"] .dim-btn').click();
    const panel=page.locator('[data-dim-key="layer"] .dim-panel');assert.ok(await panel.isVisible());
    const bounds=await panel.boundingBox();assert.ok(bounds&&bounds.x>=-1&&bounds.x+bounds.width<=page.viewportSize()!.width+1);
    await panel.locator(`input[type=checkbox][data-slug="${key}"]`).check();
    await page.keyboard.press('Escape');
    assert.equal(new URL(page.url()).searchParams.get('layer'),key);
    const visible=await page.locator('[data-record-list] [data-record]:visible').evaluateAll(rows=>rows.map(r=>(r as HTMLElement).dataset.layers!));
    assert.ok(visible.length>0&&visible.length<=total);assert.ok(visible.every(v=>v.split(',').includes(key)));
    await page.locator('[data-sort]').selectOption('name');
    await page.reload({waitUntil:'networkidle'});
    assert.equal(new URL(page.url()).searchParams.get('layer'),key);assert.equal(await page.locator('[data-sort]').inputValue(),'name');
    await page.locator('.clear-all').click();assert.equal(await page.locator('[data-record-list] [data-record]:visible').count(),total);
    await page.goto(base+'/timeline/?evidence=reported',{waitUntil:'networkidle'});
    const news=await page.locator('[data-record-list] [data-record]:visible').evaluateAll(rows=>rows.map(r=>(r as HTMLElement).dataset.evidence));
    assert.ok(news.length>0&&news.every(v=>v==='reported'));
    assert.deepEqual(errors,[]);await page.close();console.log(`${mobile?'Mobile':'Desktop'} filter interactions passed.`);
  } finally {await browser.close();}
}
