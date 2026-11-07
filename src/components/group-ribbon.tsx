"use client";
import { useState } from "react";
import { Pause, Play, UsersRound } from "lucide-react";
const groups = [
  "گروه کامپیوتر دانشکده مهندسی",
  "گروه مدیریت دولتی دانشکده مدیریت و حسابداری",
  "گروه صنایع دانشکده مهندسی",
];
export function GroupRibbon() {
  const [paused, setPaused] = useState(false);
  return (
    <section className="group-ribbon" aria-label="گروه‌های مشارکت‌کننده">
      <div className="container ribbon-heading">
        <h2>همراهان باشگاه</h2>
        <button
          className="ribbon-toggle"
          aria-label={paused ? "ادامه حرکت گروه‌ها" : "توقف حرکت گروه‌ها"}
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={17} /> : <Pause size={17} />}
          <span>{paused ? "ادامه حرکت" : "توقف حرکت"}</span>
        </button>
      </div>
      <div className="ribbon-window">
        <div className={`ribbon-track ${paused ? "is-paused" : ""}`}>
          {[0, 1].map((copy) => (
            <div className="ribbon-copy" key={copy} aria-hidden={copy === 1}>
              {groups.map((g) => (
                <span key={g}>
                  <UsersRound size={23} />
                  {g}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="container ribbon-caption">
        گروه‌های مشارکت‌کننده در باشگاه پژوهشیاران دانشکدگان فارابی
      </p>
    </section>
  );
}
