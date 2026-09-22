import { chromium, type Page } from 'playwright';

export async function launchBrowser() {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch({
    executablePath: executablePath || undefined,
    channel: executablePath ? undefined : process.env.PLAYWRIGHT_CHANNEL || undefined,
    args: executablePath ? ['--no-sandbox', '--disable-dev-shm-usage', '--single-process', '--use-gl=angle', '--use-angle=swiftshader'] : [],
  });
  console.log(`Browser: ${process.env.PLAYWRIGHT_CHANNEL || 'chromium'} ${browser.version()}`);
  return browser;
}

// Navigation's load event waits for the static site's styles and module scripts.
// Wait for fonts and a painted frame as well, rather than a fixed 500ms of idle
// networking on every navigation. This keeps layout checks and screenshots stable.
export async function waitForLayout(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
}
