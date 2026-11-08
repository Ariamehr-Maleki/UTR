"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowUpLeft } from "lucide-react";
const destinations = [
  ["/events", "رویدادها"],
  ["/club", "باشگاه پژوهشیاران"],
  ["/journals", "نشریات"],
  ["/resources", "کتابخانه"],
  ["/opportunities", "فرصت‌های پژوهشی"],
];
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className="masthead">
      <div className="container masthead-inner">
        <Link
          className="masthead-brand"
          href="/"
          onClick={() => setOpen(false)}
          aria-label="UTR، صفحه اصلی"
        >
          <img
            src="/assets/ut-emblem.png"
            alt="نشان دانشگاه تهران"
            width="50"
            height="50"
          />
          <span>
            <b dir="ltr">UTR</b>
            <small>پژوهش و فناوری دانشکدگان فارابی</small>
          </span>
        </Link>
        <nav
          id="public-navigation"
          className={open ? "primary-navigation is-open" : "primary-navigation"}
          aria-label="ناوبری اصلی"
        >
          {destinations.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                pathname === href || pathname.startsWith(href + "/")
                  ? "page"
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link
          className="account-link"
          href={
            pathname.startsWith("/workspace")
              ? "/workspace/profile"
              : "/auth/login"
          }
        >
          {pathname.startsWith("/workspace") ? "حساب من" : "ورود به سامانه"}{" "}
          <ArrowUpLeft size={18} />
        </Link>
        <button
          ref={toggle}
          className="navigation-toggle"
          aria-expanded={open}
          aria-controls="public-navigation"
          aria-label={open ? "بستن فهرست" : "باز کردن فهرست"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
