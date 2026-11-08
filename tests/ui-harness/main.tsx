import { createRoot } from "react-dom/client";
import "@fontsource/vazirmatn/400.css";
import "@fontsource/vazirmatn/700.css";
import "../../src/app/globals.css";
import "../../src/app/experience.css";
import "../../src/app/workspace.css";
import "../../src/app/refinement.css";
import "../../src/app/landing-refresh.css";
import { UploadFlow } from "../../src/components/upload-flow";
import { AdminConsole } from "../../src/components/admin-console";
import { Assessment } from "../../src/components/assessment";
import { WorkspaceSidebar } from "../../src/components/workspace-sidebar";
const event = "00000000-0000-4000-8000-000000000001",
  offering = "00000000-0000-4000-8000-000000000002",
  attachment = "00000000-0000-4000-8000-000000000003",
  referral = "00000000-0000-4000-8000-000000000004";
const title =
  "عنوان طولانی آزمایشی نشست پژوهشی درباره روش‌های علمی و نگارش گزارش دانشگاهی در دانشکدگان فارابی";
const query = new URLSearchParams(location.search),
  screen = query.get("screen");
const resume = query.has("revision")
  ? {
      id: "00000000-0000-4000-8000-000000000005",
      event_id: event,
      state: "revision_requested",
      referrals: [{ active: true, offering_id: offering }],
    }
  : undefined;
createRoot(document.getElementById("root")!).render(
  <main className="container section">
    <h1>آزمون ایزوله رابط کاربری</h1>
    <p className="notice">
      تمام نام‌ها و اطلاعات این صفحه ساختگی و فقط برای آزمون خودکار هستند. این
      صفحه جزو برنامه منتشرشده نیست.
    </p>
    {screen === "sidebar" ? (
      <div className="workspace workspace-v2">
        <WorkspaceSidebar
          activeRole="student"
          availableRoles={["student"]}
          view=""
          live={true}
        />
        <section>
          <h1>میز دانشجو</h1>
          <p>رویدادها، خلاصه‌ها و نتیجهٔ ارزیابی در این بخش قرار می‌گیرند.</p>
        </section>
      </div>
    ) : screen === "admin" ? (
      <AdminConsole superadmin={false} academic={true} catalog={{}} />
    ) : screen === "assessment" ? (
      <Assessment
        referral={{
          id: referral,
          attachment_id: attachment,
          created_at: "2026-11-01T10:00:00Z",
          offerings: { title: "درس آزمایشی روش تحقیق" },
          attachments: { mime: "image/jpeg", version: 2 },
          context: {
            student_name: "نام دانشجوی آزمایشی با نام خانوادگی طولانی",
            event_title: title,
            attendance: true,
            review_hours: 48,
            history: [
              {
                outcome: "revision",
                feedback: "لطفاً بخش پایانی خواناتر نوشته شود.",
                created_at: "2026-11-01T10:00:00Z",
              },
            ],
          },
        }}
      />
    ) : (
      <UploadFlow
        events={[
          {
            id: event,
            title,
            form_id: "test-form",
            summary_deadline: "2026-11-13T20:29:59Z",
          },
        ]}
        enrollments={[
          {
            offering_id: offering,
            offerings: { title: "درس آزمایشی روش تحقیق" },
            instructor_name: "استاد آزمایشی",
          },
        ]}
        relevance={[{ event_id: event, offering_id: offering }]}
        resume={resume}
      />
    )}
  </main>,
);
