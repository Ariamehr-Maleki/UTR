import { test, expect } from "@playwright/test";
test("public navigation, disabled activation, private route and calendar", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.getByRole("link", { name: "تقویم رویدادها", exact: true }).click();
  await page
    .getByRole("combobox", { name: "نمای تقویم" })
    .selectOption("month");
  expect([28, 35, 42]).toContain(await page.locator(".calendar-day").count());
  await page.getByRole("button", { name: "ماه بعد" }).click();
  await expect(page.locator(".calendar-day").first()).toBeVisible();
  await page.goto("/auth/register");
  await expect(
    page.getByRole("button", { name: "درخواست عضویت" }),
  ).toBeDisabled();
  await page.goto("/workspace");
  await expect(
    page.getByText("راه‌اندازی محیط عملیاتی", { exact: false }),
  ).toBeVisible();
});
for (const width of [390, 768, 1440])
  test(`responsive layout at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/events",
      "/club",
      "/auth/login",
      "/preview/student",
      "/preview/instructor",
    ]) {
      await page.goto(route);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "رفتن به محتوای اصلی" }),
    ).toBeFocused();
  });
test("private endpoints reject unauthenticated requests", async ({
  request,
}) => {
  const r = await request.get("/api/file/00000000-0000-0000-0000-000000000001");
  expect(r.status()).toBe(401);
  const a = await request.post("/api/action", {
    data: { action: "admin", data: {} },
  });
  expect(a.status()).toBe(403);
});

test("expired authentication links explain recovery", async ({ page }) => {
  await page.goto("/auth/login?error=expired");
  await expect(page.getByRole("alert")).toContainText("منقضی");
  await expect(page.getByRole("link", { name: "فراموشی رمز" })).toHaveAttribute(
    "href",
    "/auth/reset",
  );
});
