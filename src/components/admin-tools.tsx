import { OfficialFormUpload } from "./official-form-upload";
import { ActionForm } from "./action-form";
export function AdminTools({
  academic,
  technical,
  catalog,
}: {
  academic: boolean;
  technical: boolean;
  catalog: Record<string, any[]>;
}) {
  const policy = {
    name: "policy_id",
    label: "نسخه سیاست",
    options: (catalog.policies || []).map((p) => ({
      value: p.id,
      label: p.name,
    })),
  };
  const reason = {
    name: "reason",
    label: "دلیل و مرجع تصمیم",
    type: "textarea",
  };
  return (
    <div className="section">
      {technical && (
        <details>
          <summary>حالت نگهداری سامانه</summary>
          <p>در این حالت ثبت‌نام رویداد، ارسال و ارزیابی متوقف می‌شود.</p>
          <ActionForm
            action="maintenance"
            fields={[
              {
                name: "enabled",
                label: "وضعیت",
                options: [
                  { value: "false", label: "فعالیت عادی" },
                  { value: "true", label: "توقف برای نگهداری" },
                ],
              },
              reason,
            ]}
          />
        </details>
      )}
      {academic && (
        <>
          <OfficialFormUpload enabled={!!process.env.UTR_CLAMAV_HOST} />
          <details>
            <summary>اصلاح مستند امتیاز مشارکت</summary>
            <p>
              این تغییر به نمره آموزشی ارتباطی ندارد و تنها پس از تصویب قواعد
              مشارکت مجاز است.
            </p>
            <ActionForm
              action="adjust_points"
              hidden={{ request_id: crypto.randomUUID() }}
              fields={[
                {
                  name: "user_id",
                  label: "دانشجو",
                  options: (catalog.profiles || []).map((p) => ({
                    value: p.id,
                    label: p.display_name || p.id,
                  })),
                },
                {
                  name: "semester_id",
                  label: "نیمسال",
                  options: (catalog.semesters || []).map((p) => ({
                    value: p.id,
                    label: p.title,
                  })),
                },
                {
                  name: "points",
                  label: "مقدار تغییر؛ عدد صحیح مثبت یا منفی",
                  type: "number",
                },
                reason,
              ]}
            />
          </details>
          <details>
            <summary>تمدید استثنایی مهلت یک پرونده</summary>
            <p>
              تاریخ جدید به وقت تهران است. این تصمیم قفل امتیاز مثبت یا سیاست
              تعیین‌نشده ارجاع را باز نمی‌کند.
            </p>
            <ActionForm
              action="extend_deadline"
              fields={[
                { name: "submission_id", label: "شناسه پرونده" },
                {
                  name: "deadline",
                  label: "مهلت جدید به وقت تهران",
                  type: "datetime-local",
                },
                reason,
              ]}
            />
          </details>
          <details>
            <summary>
              تعیین هفته مصوب؛ نیازمند اختیار سراسری اداره پژوهشی
            </summary>
            <p>
              هفتهٔ شنبه تا جمعه با پایان جمعه ساعت ۲۳:۵۹:۵۹ به وقت تهران تصویب
              و در سیاست نسخهٔ دوم ثبت شده است. تغییرات تازه باید در نسخهٔ جدید
              سیاست انجام شوند؛ سیاست رویداد منتشرشده و پروندهٔ قبلی بازنویسی
              نمی‌شود.
            </p>
            <ActionForm
              action="week_policy"
              fields={[
                policy,
                {
                  name: "week_start",
                  label: "روز شروع هفته",
                  options: [
                    { value: "6", label: "شنبه" },
                    { value: "0", label: "یکشنبه" },
                    { value: "1", label: "دوشنبه" },
                    { value: "2", label: "سه‌شنبه" },
                    { value: "3", label: "چهارشنبه" },
                    { value: "4", label: "پنجشنبه" },
                    { value: "5", label: "جمعه" },
                  ],
                },
                {
                  name: "cutoff",
                  label: "زمان پایان روز آخر هفته؛ ساعت:دقیقه:ثانیه",
                  value: "23:59:59",
                },
                reason,
              ]}
            />
          </details>
          <details>
            <summary>شرایط مصوب صدور گواهی</summary>
            <ActionForm
              action="certificate_rule"
              fields={[
                {
                  name: "kind",
                  label: "نوع گواهی",
                  options: [
                    { value: "membership", label: "عضویت" },
                    { value: "attendance", label: "حضور" },
                    { value: "participation", label: "مشارکت" },
                  ],
                },
                policy,
                {
                  name: "minimum",
                  label: "حداقل رویداد برای گواهی مشارکت",
                  type: "number",
                  required: false,
                },
                {
                  name: "approved",
                  label: "وضعیت تصویب",
                  options: [
                    { value: "false", label: "غیرفعال" },
                    { value: "true", label: "مصوب" },
                  ],
                },
                reason,
              ]}
            />
          </details>
          <details>
            <summary>ابطال گواهی</summary>
            <ActionForm
              action="revoke_certificate"
              fields={[{ name: "id", label: "شناسه گواهی" }, reason]}
            />
          </details>
          <details>
            <summary>ارسال اعلان درون سامانه</summary>
            <ActionForm
              action="notify"
              fields={[
                {
                  name: "user_id",
                  label: "گیرنده",
                  options: (catalog.profiles || []).map((p) => ({
                    value: p.id,
                    label: p.display_name || p.id,
                  })),
                },
                { name: "title", label: "عنوان" },
                { name: "body", label: "متن", type: "textarea" },
                reason,
              ]}
            />
          </details>
        </>
      )}
    </div>
  );
}
