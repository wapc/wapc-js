"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_server_1 = require("@jsoverson/test-server");
const find_root_1 = __importDefault(require("find-root"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const __projectroot = find_root_1.default(__dirname);
(async () => {
    const server = await test_server_1.start(__projectroot);
    const browser = await puppeteer_1.default.launch({ headless: true });
    const [page] = await browser.pages();
    await page.goto(server.url('/test/browser/index.html'));
    await page.waitForSelector('#done');
    const [successes, failures] = await page.evaluate(() => {
        const win = window;
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
//# sourceMappingURL=run.js.map