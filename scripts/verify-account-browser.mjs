import { chromium, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
if (process.env.UTR_AUTH_SMOKE_APPROVED !== "true")
  throw Error("Explicit auth smoke approval required");
const origin = process.env.TEST_BASE_URL;
if (!origin) throw Error("TEST_BASE_URL required");
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
const email = `utr-smoke-${randomUUID()}@example.com`;
const password = randomUUID() + randomUUID();
const browser = await chromium.launch({
  channel: process.platform === "win32" ? "msedge" : undefined,
});
const page = await browser.newPage();
const output = ".impeccable/review/accounts";
await fs.mkdir(output, { recursive: true });
try {
  await page.goto(`${origin}/auth/register`);
  await page.getByLabel("ایمیل", { exact: true }).fill(email);
  await page.getByLabel("رمز عبور", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "درخواست عضویت", exact: true })
    .click();
  await expect(page).toHaveURL(`${origin}/workspace/profile`, {
    timeout: 30000,
  });
  await page.getByLabel("نام و نام خانوادگی").fill("حساب موقت آزمون");
  await page.getByLabel("شماره دانشجویی").fill(`SMOKE-${Date.now()}`);
  await page.locator('select[name="degree"]').selectOption("bachelor");
  await page
    .locator('select[name="department_id"]')
    .selectOption({ label: "گروه کامپیوتر دانشکده مهندسی" });
  await page.getByRole("button", { name: "ذخیره", exact: true }).click();
  await expect(
    page.getByText("با موفقیت ثبت شد.", { exact: true }),
  ).toBeVisible();
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.evaluate(async () => {
      window.scrollTo({ top: 0, behavior: "instant" });
      await document.fonts.ready;
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
    });
    await page.screenshot({
      path: `${output}/profile-${width}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  const academic = await page.request.post(`${origin}/api/action`, {
    headers: { origin },
    data: { action: "begin", data: {} },
  });
  expect(academic.status()).toBe(503);
  await page.getByRole("button", { name: "خروج", exact: true }).click();
  await expect(page).toHaveURL(`${origin}/`);
  await page.goto(`${origin}/workspace/profile`);
  await expect(page).toHaveURL(`${origin}/auth/login`);
  await page.getByLabel("ایمیل", { exact: true }).fill(email);
  await page.getByLabel("رمز عبور", { exact: true }).fill(password);
  await page.getByRole("button", { name: "ورود به حساب", exact: true }).click();
  await expect(page).toHaveURL(`${origin}/workspace/profile`, {
    timeout: 30000,
  });
  await expect(page.getByLabel("نام و نام خانوادگی")).toHaveValue(
    "حساب موقت آزمون",
  );
  await page.getByRole("button", { name: "خروج", exact: true }).click();
  console.log(
    "PASS: deployed browser signup, profile persistence, logout/login, protected redirect, academic gate, 390/768/1440 no overflow",
  );
} finally {
  await browser.close();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw Error("Temporary account lookup failed");
  const user = data.users.find((u) => u.email === email);
  if (user) {
    for (const table of ["roles", "profiles"]) {
      const result = await admin
        .from(table)
        .delete()
        .eq(table === "roles" ? "user_id" : "id", user.id);
      if (result.error) throw Error("Temporary profile cleanup failed");
    }
    if ((await admin.auth.admin.deleteUser(user.id)).error)
      throw Error("Temporary account cleanup failed");
  }
  console.log("Browser probe account removed.");
}
