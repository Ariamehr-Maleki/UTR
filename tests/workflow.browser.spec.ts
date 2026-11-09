import { test, expect, Page } from "@playwright/test";
const event = "00000000-0000-4000-8000-000000000001",
  offering = "00000000-0000-4000-8000-000000000002";
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
  "base64",
);
async function image(page: Page, name = "summary.png") {
  await page
    .locator("input[type=file]")
    .setInputFiles({ name, mimeType: "image/png", buffer: png });
}
async function chooseEvent(page: Page) {
  await page.goto("/");
  await page.getByLabel("رویداد با حضور تأییدشده").selectOption(event);
  await page.getByRole("button", { name: "ادامه؛ انتخاب فایل" }).click();
}
test.beforeEach(async ({ page }) => {
  await page.route("**/api/file/**", (r) =>
    r.fulfill({ status: 200, contentType: "image/png", body: png }),
  );
});
test("mobile upload survives failure, retries one attachment and confirms one referral", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const ids: string[] = [];
  let referrals = 0;
  await page.route("**/api/action", async (r) => {
    const data = r.request().postDataJSON();
    if (data.action === "refer") referrals++;
    await r.fulfill({
      json: {
        id:
          data.action === "begin"
            ? "00000000-0000-4000-8000-000000000005"
            : "durable-referral",
      },
    });
  });
  await page.route("**/api/upload", async (r) => {
    ids.push(
      r
        .request()
        .postData()!
        .match(/name="attachment_id"\r?\n\r?\n([^\r\n]+)/)![1],
    );
    if (ids.length === 1) await r.abort("failed");
    else await r.fulfill({ json: { id: ids.at(-1) } });
  });
  await chooseEvent(page);
  await image(page);
  await page.getByRole("button", { name: "ذخیره فایل و ادامه" }).click();
  await expect(
    page.getByText("ارتباط قطع شد. فایل انتخاب‌شده حفظ شده است."),
  ).toBeVisible();
  await expect(page.locator("input[type=file]")).toHaveValue(/summary.png/);
  await page.getByRole("button", { name: "ذخیره فایل و ادامه" }).click();
  await page
    .getByLabel("درس و استاد مرتبط از نیمسال جاری")
    .selectOption(offering);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "تأیید و ارسال نهایی" }).click();
  await expect(page.getByText("DURABLE-", { exact: true })).toBeVisible();
  await page.getByText("شناسهٔ کامل برای پشتیبانی").click();
  await expect(
    page.getByText("durable-referral", { exact: true }),
  ).toBeVisible();
  expect(ids).toHaveLength(2);
  expect(ids[0]).toBe(ids[1]);
  expect(referrals).toBe(1);
});
test("selecting a different file gets a new retry identifier", async ({
  page,
}) => {
  const ids: string[] = [];
  await page.route("**/api/action", (r) =>
    r.fulfill({ json: { id: "00000000-0000-4000-8000-000000000005" } }),
  );
  await page.route("**/api/upload", async (r) => {
    ids.push(
      r
        .request()
        .postData()!
        .match(/name="attachment_id"\r?\n\r?\n([^\r\n]+)/)![1],
    );
    await r.abort("failed");
  });
  await chooseEvent(page);
  await image(page);
  await page.getByRole("button", { name: "ذخیره فایل و ادامه" }).click();
  await expect(page.getByRole("status")).toContainText("ارتباط قطع");
  await image(page, "replacement.png");
  await page.getByRole("button", { name: "ذخیره فایل و ادامه" }).click();
  await expect.poll(() => ids.length).toBe(2);
  expect(ids[0]).not.toBe(ids[1]);
});
test("revision keeps the approved instructor", async ({ page }) => {
  await page.route("**/api/upload", (r) =>
    r.fulfill({ json: { id: "new-version" } }),
  );
  await page.goto("/?revision=1");
  await image(page);
  await page.getByRole("button", { name: "ذخیره فایل و ادامه" }).click();
  await expect(
    page.getByLabel("درس و استاد مرتبط از نیمسال جاری"),
  ).toBeDisabled();
  await expect(page.getByLabel("درس و استاد مرتبط از نیمسال جاری")).toHaveValue(
    offering,
  );
});
test("positive assessment requires confirmation and disables duplicate action", async ({
  page,
}) => {
  const requests: any[] = [];
  await page.route("**/api/action", async (r) => {
    requests.push(r.request().postDataJSON());
    await r.fulfill({
      json: { message: "با موفقیت ثبت شد.", id: "assessment-receipt" },
    });
  });
  await page.goto("/?screen=assessment");
  await page.getByLabel("امتیاز بین صفر و یک").fill("0.25");
  await page.getByLabel("بازخورد کتبی").fill("بازخورد آزمایشی برای نسخه دوم");
  await page.getByRole("button", { name: "ثبت نتیجه بررسی" }).click();
  expect(requests).toHaveLength(0);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "ثبت نتیجه بررسی" }).click();
  await expect(
    page.getByRole("button", { name: "ثبت نتیجه بررسی" }),
  ).toBeDisabled();
  expect(requests).toHaveLength(1);
  expect(requests[0].data.attachment_id).toBe(
    "00000000-0000-4000-8000-000000000003",
  );
  expect(requests[0].data.score).toBe("0.25");
});
for (const width of [390, 768, 1440])
  test(`operational components fit ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    for (const screen of ["upload", "assessment"]) {
      await page.goto("/?screen=" + screen);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: info.outputPath(`${screen}-${width}.png`),
        fullPage: true,
      });
    }
    await page.getByRole("button", { name: "بزرگ‌نمایی", exact: true }).click();
    await page.getByRole("button", { name: "چرخش" }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

test("editorial creation retries keep the same record identity", async ({
  page,
}) => {
  const ids: string[] = [];
  await page.route("**/api/action", async (r) => {
    ids.push(JSON.parse(r.request().postDataJSON().data.payload).id);
    if (ids.length === 1) await r.abort("failed");
    else
      await r.fulfill({ json: { message: "با موفقیت ثبت شد.", id: ids[1] } });
  });
  await page.goto("/?screen=admin");
  await page.getByLabel("بخش مدیریت").selectOption("content");
  await page
    .getByRole("combobox", { name: "نوع محتوا", exact: true })
    .selectOption("news");
  await page.getByLabel("عنوان", { exact: true }).fill("خبر آزمایشی");
  await page.getByLabel("شرح", { exact: true }).fill("متن فقط برای آزمایش");
  await page
    .getByRole("combobox", { name: "وضعیت", exact: true })
    .selectOption("draft");
  await page.getByLabel("دلیل تغییر", { exact: true }).fill("بررسی تلاش مجدد");
  await page.getByRole("button", { name: "ثبت تغییر", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("ارتباط");
  await page.getByRole("button", { name: "ثبت تغییر", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("موفقیت");
  expect(ids).toHaveLength(2);
  expect(ids[0]).toBeTruthy();
  expect(ids[0]).toBe(ids[1]);
});

test("administration can find a pending member and see missing verification fields", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?screen=admin");
  await expect(
    page.getByRole("heading", { name: "درخواست‌های در انتظار بررسی" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /دانشجوی آزمایشی.*مشخصات تحصیلی ناتمام/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "مشخصات برای بررسی عضویت" }),
  ).toBeVisible();
  await expect(
    page.getByText("برای تأیید عضویت دانشجویی", { exact: false }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("pending-membership-390.png"),
    fullPage: true,
  });
});

test("oversized replacement clears the previous file preview", async ({
  page,
}) => {
  await chooseEvent(page);
  await image(page);
  await expect(page.getByAltText("پیش‌نمایش خلاصه دست‌نویس")).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({
    name: "oversized.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(4194305),
  });
  await expect(page.getByRole("status")).toContainText("۴ مگابایت");
  await expect(page.getByAltText("پیش‌نمایش خلاصه دست‌نویس")).toHaveCount(0);
  await page.getByRole("button", { name: "ذخیره فایل و ادامه" }).click();
  await expect(page.getByRole("status")).toContainText("فایل را انتخاب کنید");
});

test("mobile workspace shows the task before its navigation and lets users open the menu", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?screen=sidebar");
  await expect(page.getByRole("heading", { name: "میز دانشجو" })).toBeVisible();
  const toggle = page.getByRole("button", { name: "بخش‌های فضای کار" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("navigation", { name: "بخش‌های فضای کار" }),
  ).toBeHidden();
  await toggle.click();
  await expect(
    page.getByRole("navigation", { name: "بخش‌های فضای کار" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "رویدادها و گزارش‌های من" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "بستن فهرست" }).click();
  await expect(
    page.getByRole("navigation", { name: "بخش‌های فضای کار" }),
  ).toBeHidden();
});
