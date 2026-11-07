"use client";
export function PrintButton() {
  return (
    <button className="no-print" onClick={() => window.print()}>
      چاپ یا ذخیره گواهی به PDF
    </button>
  );
}
