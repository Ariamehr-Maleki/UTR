import { test, expect } from "@playwright/test";
test("research entrance routes each audience and journal to a useful destination", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /پژوهش، از یک پرسش/ }),
  ).toBeVisible();
  for (const role of ["student", "instructor", "admin"])
    await expect(
      page.locator(`.role-entrances a[href="/auth/login?role=${role}"]`),
    ).toBeVisible();
  const journal = page.locator(".publication-strip a").first();
  await expect(journal).toBeVisible();
  expect(await journal.getAttribute("href")).not.toBe("/journals");
  await page.goto("/preview/administration");
  await expect(
    page.getByRole("heading", { name: "این صفحه پیدا نشد" }),
  ).toBeVisible();
});
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
  await expect(
    page.getByRole("alert").filter({ hasText: "منقضی" }),
  ).toContainText("منقضی");
  await expect(page.getByRole("link", { name: "فراموشی رمز" })).toHaveAttribute(
    "href",
    "/auth/reset",
  );
});

test("academic archive preserves year, poster and historical context", async ({
  page,
}) => {
  await page.goto("/events");
  await expect(page.locator(".poster-card")).toHaveCount(10);
  await page.getByRole("button", { name: /۱۴۰۳–۱۴۰۴/ }).click();
  await expect(page.locator(".poster-card")).toHaveCount(9);
  await page.getByLabel("جست‌وجو در آرشیو").fill("هوش مصنوعی");
  await expect(page.locator(".poster-card")).toHaveCount(2);
  await page.locator(".poster-image").first().click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "هوش مصنوعی",
  );
  await expect(page.locator(".archive-detail .notice")).toContainText("آرشیوی");
  await expect
    .poll(
      () =>
        page
          .locator(".archive-detail img")
          .evaluate(
            (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
          ),
      { timeout: 15000, message: "Official poster must finish loading" },
    )
    .toBe(true);
  await page.goto("/events");
  await page.getByRole("button", { name: /۱۴۰۵–۱۴۰۶/ }).click();
  await expect(
    page.getByRole("heading", { name: "فصل تازه پژوهش، به‌زودی" }),
  ).toBeVisible();
  await expect(page.locator(".poster-card")).toHaveCount(0);
});
test("journal and library directories expose sourced services", async ({
  page,
}) => {
  await page.goto("/journals");
  await expect(page.locator(".journal-card")).toHaveCount(9);
  await page.getByLabel("جست‌وجوی نشریه").fill("حقوق");
  await expect(page.locator(".journal-card")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "ورود به سامانه نشریه" }),
  ).toHaveAttribute("href", "https://jolt.ut.ac.ir");
  await page.goto("/resources");
  await expect(page.locator(".library-resources article")).toHaveCount(14);
  await page
    .getByRole("button", { name: "تازه‌های کتاب", exact: true })
    .click();
  await expect(page.locator(".library-resources article")).toHaveCount(3);
});
test("club ribbon can be paused and respects reduced motion", async ({
  page,
}) => {
  await page.goto("/club");
  await page.getByRole("button", { name: "توقف حرکت گروه‌ها" }).click();
  await expect(page.locator(".ribbon-track")).toHaveCSS(
    "animation-play-state",
    "paused",
  );
  await page.getByRole("button", { name: "ادامه حرکت گروه‌ها" }).click();
  await page.locator("h1").click();
  await expect(page.locator(".ribbon-track")).toHaveCSS(
    "animation-play-state",
    "running",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".ribbon-track")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(
    page.getByRole("button", { name: "توقف حرکت گروه‌ها" }),
  ).toBeHidden();
});

test("research finder searches public content and recovers from empty results", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("جست‌وجو در UTR", { exact: true }).fill("هوش مصنوعی");
  await expect(page.locator(".finder-result").first()).toBeVisible();
  await expect(page.locator(".finder-result").first()).toHaveAttribute(
    "href",
    /events\/archive\//,
  );
  await page.getByLabel("نوع محتوا").selectOption("journals");
  await expect(page.locator(".finder-no-results")).toBeVisible();
  await page.getByLabel("جست‌وجو در UTR", { exact: true }).fill("حقوق");
  await expect(page.locator(".finder-result")).toHaveCount(1);
  await expect(page.locator(".finder-result")).toHaveAttribute(
    "target",
    "_blank",
  );
  await page.getByLabel("جست‌وجو در UTR", { exact: true }).press("Escape");
  await expect(page.locator(".finder-results")).toHaveCount(0);
});
test("mobile navigation opens, closes with Escape and follows destinations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "باز کردن فهرست" }).click();
  await expect(
    page.getByRole("navigation", { name: "ناوبری اصلی" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "باز کردن فهرست" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "باز کردن فهرست" }).click();
  await page
    .getByRole("navigation", { name: "ناوبری اصلی" })
    .getByRole("link", { name: "کتابخانه", exact: true })
    .click();
  await expect(page).toHaveURL(/resources/);
  await expect(
    page.getByRole("navigation", { name: "ناوبری اصلی" }),
  ).toBeHidden();
});
test("archive filter and view survive reload and can be shared", async ({
  page,
}) => {
  await page.goto("/events");
  await page.getByRole("button", { name: /۱۴۰۳–۱۴۰۴/ }).click();
  await page.getByLabel("جست‌وجو در آرشیو").fill("هوش مصنوعی");
  await page.getByRole("button", { name: "نمای فهرستی", exact: true }).click();
  await page.reload();
  await expect(page.locator(".poster-card")).toHaveCount(2);
  await expect(
    page.getByRole("button", { name: "نمای فهرستی", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("جست‌وجو در آرشیو")).toHaveValue("هوش مصنوعی");
  await page.getByLabel("جست‌وجو در آرشیو").fill("zzzz");
  await page.getByRole("button", { name: "پاک‌کردن فیلترها" }).click();
  await expect(page.locator(".poster-card")).toHaveCount(9);
});

test("finder makes every category result reachable", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("نوع محتوا").selectOption("resources");
  await expect(page.locator(".finder-result")).toHaveCount(8);
  await page.getByRole("button", { name: "نمایش نتایج بیشتر" }).click();
  await expect(page.locator(".finder-result")).toHaveCount(14);
  await expect(
    page.getByRole("button", { name: "نمایش نتایج بیشتر" }),
  ).toHaveCount(0);
});
