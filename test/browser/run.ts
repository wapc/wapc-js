import { start } from '@jsoverson/test-server';
import findRoot from 'find-root';
import puppeteer from 'puppeteer';

const __projectroot = findRoot(__dirname);

(async () => {
  const server = await start(__projectroot);
  const browser = await puppeteer.launch({ headless: true });
  const [page] = await browser.pages();
  await page.goto(server.url('/test/browser/index.html'));
  await page.waitForSelector('#done');
  const [successes, failures]: string[][] = await page.evaluate(() => {
    const win = (window as unknown) as { successes: string[]; failures: string[] };
    return [win.successes, win.failures];
  });
  console.log(`${successes.length} successes`);
  if (failures.length > 0) {
    console.log(`${failures.length} failures`);
    console.log(failures.map(f => `- ${f}`).join('\n'));
  }
  await browser.close();
  await server.stop();
  process.exit(failures.length);
})();
