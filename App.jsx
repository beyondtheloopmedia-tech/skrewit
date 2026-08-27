import { useEffect, useRef, useState } from "react";

/* ================= SKREWIT — brand tokens ================= */
const LIME = "#B6EE69";
const INK = "#061407";
const PAPER = "#FBFDF4";
const DEEP = "#8FD437";
const TINT = "#DFF5BA";

const WA = "https://wa.me/917416697132?text=Hi%20Skrewit%2C%20I%20need%20supplies%20delivered.";
const PHONE = "tel:+917416697132";

const FONT_DISPLAY = "'Anton', 'Arial Narrow', sans-serif";
const FONT_BODY = "'Archivo', 'Helvetica Neue', sans-serif";
const FONT_MONO = "'Space Mono', monospace";

/* ================= hooks ================= */
function useScroll() {
  const [s, setS] = useState({ y: 0, p: 0 });
  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setS({ y: window.scrollY, p: max > 0 ? window.scrollY / max : 0 });
        raf = null;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return s;
}

function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* per-element scroll progress: 0 when section enters, 1 when it leaves */
function useSectionProgress(scrollY) {
  const ref = useRef(null);
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = r.height + vh;
    const passed = vh - r.top;
    setProg(Math.min(1, Math.max(0, passed / total)));
  }, [scrollY]);
  return [ref, prog];
}

/* ================= atoms ================= */
function ScrewHead({ size = 44, rotation = 0, fg = INK, bg = LIME, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ transform: `rotate(${rotation}deg)`, display: "block", ...style }}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="46" fill={fg} />
      <path
        d="M50 26 L58 42 L74 50 L58 58 L50 74 L42 58 L26 50 L42 42 Z"
        fill={bg}
        transform="rotate(45 50 50)"
      />
      <path d="M14 66 A46 46 0 0 0 50 96 A60 60 0 0 1 14 66 Z" fill={bg} opacity="0.35" />
    </svg>
  );
}

function Reveal({ children, delay = 0, y = 36, style = {} }) {
  const [ref, inView] = useInView(0.15);
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity .9s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .9s cubic-bezier(.16,1,.3,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children, color = INK, line = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
      <span
        style={{
          fontFamily: FONT_MONO,
          fontSize: 13,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color,
          fontWeight: 700,
        }}
      >
        {children}
      </span>
      {line && <span style={{ height: 1, flex: "0 0 64px", background: color, opacity: 0.4 }} />}
    </div>
  );
}

function Pill({ href, children, dark = false, big = false }) {
  const [h, setH] = useState(false);
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: FONT_BODY,
        fontWeight: 700,
        fontSize: big ? 17 : 15,
        letterSpacing: "0.02em",
        padding: big ? "18px 34px" : "12px 24px",
        borderRadius: 999,
        textDecoration: "none",
        background: dark ? (h ? DEEP : LIME) : (h ? "#0F2A10" : INK),
        color: dark ? INK : LIME,
        transform: h ? "translateY(-2px)" : "translateY(0)",
        boxShadow: h ? "0 12px 28px rgba(6,20,7,.25)" : "0 0 0 rgba(0,0,0,0)",
        transition: "all .35s cubic-bezier(.16,1,.3,1)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
      <span style={{ transition: "transform .35s cubic-bezier(.16,1,.3,1)", transform: h ? "translateX(4px)" : "none" }}>→</span>
    </a>
  );
}

/* falling hardware doodles (hero parallax) */
function Doodle({ d, x, y, size, speed, scrollY, rot = 0, color = INK, opacity = 0.9 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        transform: `translateY(${scrollY * speed}px) rotate(${rot + scrollY * speed * 0.15}deg)`,
        willChange: "transform",
      }}
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
const D = {
  wrench: "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
  hammer: "M15 12l-8.5 8.5a2.12 2.12 0 11-3-3L12 9 M17.64 15L22 10.64 M20.91 11.7l-1.25-1.25a2 2 0 010-2.83l.7-.7L14 .55l-2.12 2.12 1.06 1.06-4.24 4.24 2.83 2.83 4.24-4.24 1.06 1.06z",
  bolt: "M12 2l2.4 4.2H9.6L12 2z M7 8h10 M8 8l1 12h6l1-12 M9.5 12h5 M9.8 16h4.4",
  roller: "M18 3H6a2 2 0 00-2 2v2a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2z M20 6h1a1 1 0 011 1v3a1 1 0 01-1 1h-8v3 M11 14h2v7h-2z",
  drill: "M4 6h12v6H8l-2 4H4z M16 8h4v2h-4z M6 12v2",
  brush: "M9.06 11.9l8.07-8.06a2.85 2.85 0 114.03 4.03l-8.06 8.08 M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 00-3-3.02z",
};

/* ================= NAV ================= */
function Nav({ scrollY }) {
  const past = scrollY > 60;
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: past ? "14px clamp(20px,4vw,48px)" : "22px clamp(20px,4vw,48px)",
        background: past ? "rgba(182,238,105,.9)" : "transparent",
        backdropFilter: past ? "blur(12px)" : "none",
        WebkitBackdropFilter: past ? "blur(12px)" : "none",
        borderBottom: past ? `1px solid ${INK}22` : "1px solid transparent",
        transition: "all .4s cubic-bezier(.16,1,.3,1)",
      }}
    >
      <a href="#top" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <ScrewHead size={30} rotation={scrollY * 0.25} />
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 26, letterSpacing: "0.01em", color: INK, lineHeight: 1 }}>
          SKREWIT<span style={{ color: INK }}>.</span>
        </span>
      </a>
      <nav className="sk-navlinks" style={{ display: "flex", gap: 28, fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, letterSpacing: "0.14em" }}>
        {[["CATEGORIES", "#categories"], ["HOW IT WORKS", "#how"], ["CONTACT", "#contact"]].map(([t, h]) => (
          <a key={t} href={h} style={{ color: INK, textDecoration: "none", opacity: 0.85 }}>
            {t}
          </a>
        ))}
      </nav>
      <Pill href={WA}>Order now</Pill>
    </header>
  );
}

/* ================= HERO ================= */
function Hero({ scrollY }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);
  const lines = ["SKREW", "THE WAIT."];
  return (
    <section
      id="top"
      style={{
        minHeight: "100svh",
        background: LIME,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "120px clamp(20px,4vw,48px) 0",
      }}
    >
      {/* parallax hardware */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden="true">
        <Doodle d={D.wrench} x="6%" y="16%" size={64} speed={0.28} scrollY={scrollY} rot={-20} opacity={0.5} />
        <Doodle d={D.hammer} x="86%" y="12%" size={72} speed={0.42} scrollY={scrollY} rot={16} opacity={0.45} />
        <Doodle d={D.bolt} x="76%" y="58%" size={56} speed={0.6} scrollY={scrollY} rot={8} opacity={0.55} />
        <Doodle d={D.roller} x="12%" y="66%" size={60} speed={0.5} scrollY={scrollY} rot={-10} opacity={0.5} />
        <Doodle d={D.drill} x="55%" y="8%" size={52} speed={0.34} scrollY={scrollY} rot={-6} opacity={0.4} />
        <Doodle d={D.brush} x="38%" y="72%" size={48} speed={0.7} scrollY={scrollY} rot={24} opacity={0.45} />
      </div>

      <div style={{ position: "relative", transform: `translateY(${scrollY * -0.12}px)` }}>
        <div
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 700,
            fontSize: "clamp(12px,1.4vw,15px)",
            letterSpacing: "0.24em",
            color: INK,
            marginBottom: 18,
            opacity: loaded ? 0.8 : 0,
            transform: loaded ? "none" : "translateY(20px)",
            transition: "all 1s cubic-bezier(.16,1,.3,1) .1s",
          }}
        >
          HARDWARE, DELIVERED IN MINUTES — GUNTUR & BEYOND
        </div>

        <h1 style={{ margin: 0, lineHeight: 0.92, userSelect: "none" }}>
          {lines.map((line, i) => (
            <span key={line} style={{ display: "block", overflow: "hidden" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.06em",
                  fontFamily: FONT_DISPLAY,
                  fontSize: "clamp(70px, 16.5vw, 240px)",
                  letterSpacing: "0.005em",
                  color: INK,
                  transform: loaded ? "translateY(0)" : "translateY(110%)",
                  transition: `transform 1.1s cubic-bezier(.16,1,.3,1) ${0.15 + i * 0.12}s`,
                }}
              >
                {i === 1 ? (
                  <>
                    THE&nbsp;WAIT
                    <ScrewHead
                      size="0.62em"
                      rotation={scrollY * 0.6}
                      style={{ width: "0.62em", height: "0.62em", margin: "0 0.04em" }}
                    />
                  </>
                ) : (
                  line
                )}
              </span>
            </span>
          ))}
        </h1>

        <div
          style={{
            marginTop: 30,
            maxWidth: 560,
            fontFamily: FONT_BODY,
            fontSize: "clamp(16px,2vw,20px)",
            lineHeight: 1.55,
            color: INK,
            opacity: loaded ? 1 : 0,
            transform: loaded ? "none" : "translateY(24px)",
            transition: "all 1s cubic-bezier(.16,1,.3,1) .5s",
          }}
        >
          Tools, paint, plumbing, electrical & construction materials — at your site
          before the chai gets cold. <strong>The work shouldn't stop because the supplies did.</strong>
        </div>

        <div
          style={{
            marginTop: 34,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "none" : "translateY(24px)",
            transition: "all 1s cubic-bezier(.16,1,.3,1) .65s",
          }}
        >
          <Pill href={WA} big>
            Order on WhatsApp
          </Pill>
          <Pill href={PHONE} big dark>
            Call us
          </Pill>
        </div>
      </div>

      {/* marquee */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          borderTop: `2px solid ${INK}`,
          background: INK,
          overflow: "hidden",
          padding: "14px 0",
        }}
      >
        <div className="sk-marquee" style={{ display: "flex", width: "max-content" }}>
          {[0, 1].map((k) => (
            <div key={k} style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
              {["HARDWARE", "TOOLS", "PAINT", "PLUMBING", "ELECTRICAL", "CONSTRUCTION", "PLYWOOD", "& MORE"].map((w) => (
                <span key={w + k} style={{ display: "inline-flex", alignItems: "center", gap: 22, margin: "0 22px" }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 20, letterSpacing: "0.06em", color: LIME }}>{w}</span>
                  <ScrewHead size={14} fg={LIME} bg={INK} rotation={scrollY * 0.4} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= PAIN / SCREW THAT ================= */
function Pain({ scrollY }) {
  const pains = [
    ["Your plumber spends half the day", "hunting for materials."],
    ["Your DIY project never starts —", "getting supplies is a chore."],
    ["Cement runs out mid-renovation.", "You ordered extra yesterday."],
  ];
  const [ref, prog] = useSectionProgress(scrollY);
  return (
    <section ref={ref} style={{ background: INK, padding: "clamp(90px,12vh,160px) clamp(20px,4vw,48px)", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal>
          <Eyebrow color={LIME}>SOUND FAMILIAR?</Eyebrow>
        </Reveal>
        <div style={{ display: "grid", gap: "clamp(20px,3vh,34px)" }}>
          {pains.map(([a, b], i) => {
            const hit = prog > 0.22 + i * 0.14;
            return (
              <Reveal key={a} delay={i * 120}>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontWeight: 600,
                    fontSize: "clamp(20px,3.4vw,40px)",
                    lineHeight: 1.25,
                    color: hit ? "#5A7050" : PAPER,
                    position: "relative",
                    display: "inline",
                    transition: "color .6s ease",
                  }}
                >
                  <span style={{ position: "relative" }}>
                    {a} {b}
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "52%",
                        height: "0.14em",
                        width: hit ? "100%" : "0%",
                        background: LIME,
                        transition: "width .7s cubic-bezier(.16,1,.3,1)",
                      }}
                    />
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>
        <div
          style={{
            marginTop: "clamp(44px,7vh,70px)",
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(58px,11vw,160px)",
            lineHeight: 0.95,
            color: LIME,
            transform: prog > 0.62 ? "rotate(-2deg) scale(1)" : "rotate(-2deg) scale(0.7)",
            opacity: prog > 0.62 ? 1 : 0,
            transition: "all .55s cubic-bezier(.2,1.4,.4,1)",
            transformOrigin: "left center",
          }}
        >
          SERIOUSLY,
          <br />
          SCREW THAT.
        </div>
      </div>
    </section>
  );
}

/* ================= STATEMENT (word reveal) ================= */
function Statement({ scrollY }) {
  const words = "The work shouldn't stop because the supplies did.".split(" ");
  const [ref, prog] = useSectionProgress(scrollY);
  return (
    <section ref={ref} style={{ background: LIME, padding: "clamp(100px,16vh,190px) clamp(20px,4vw,48px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow color={INK}>OUR PROMISE</Eyebrow>
        <p style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: "clamp(38px,6.4vw,92px)", lineHeight: 1.06, color: INK }}>
          {words.map((w, i) => {
            const t = Math.min(1, Math.max(0, (prog - 0.18 - i * 0.035) / 0.12));
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  marginRight: "0.28em",
                  opacity: 0.12 + t * 0.88,
                  transform: `translateY(${(1 - t) * 14}px)`,
                  transition: "opacity .2s linear, transform .2s linear",
                }}
              >
                {w}
              </span>
            );
          })}
        </p>
        <Reveal delay={100}>
          <p style={{ marginTop: 34, maxWidth: 640, fontFamily: FONT_BODY, fontSize: "clamp(16px,1.8vw,19px)", lineHeight: 1.6, color: INK }}>
            One WhatsApp message. Real stock, fair prices, and a rider already moving.
            That's the whole pitch.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= DETAILS ================= */
function Details() {
  const items = [
    ["01", "DELIVERED IN MINUTES", "Order to doorstep faster than a trip to the store — the site never idles."],
    ["02", "QUALITY YOU CAN TRUST", "Branded, checked stock. No seconds, no surprises, no 'adjust cheskondi'."],
    ["03", "WIDE RANGE OF MATERIALS", "From a single screw to full construction loads — one supplier, everything."],
    ["04", "BUILT FOR EVERY PROJECT", "Contractors, plumbers, electricians, weekend DIY heroes. All of you."],
  ];
  return (
    <section style={{ background: PAPER, padding: "clamp(90px,12vh,160px) clamp(20px,4vw,48px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal>
          <Eyebrow>WHY SKREWIT</Eyebrow>
          <h2 style={{ margin: "0 0 clamp(40px,6vh,64px)", fontFamily: FONT_DISPLAY, fontSize: "clamp(40px,6vw,84px)", lineHeight: 1, color: INK }}>
            TIGHT WHERE
            <br />
            IT COUNTS.
          </h2>
        </Reveal>
        <div className="sk-grid2">
          {items.map(([n, t, d], i) => (
            <Reveal key={n} delay={i * 90}>
              <div
                className="sk-card"
                style={{
                  border: `2px solid ${INK}`,
                  borderRadius: 20,
                  padding: "clamp(24px,3vw,36px)",
                  background: PAPER,
                  height: "100%",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 42 }}>
                  <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 14, color: INK, opacity: 0.6 }}>{n}</span>
                  <ScrewHead size={22} fg={INK} bg={PAPER} />
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(22px,2.6vw,30px)", color: INK, marginBottom: 12 }}>{t}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 16, lineHeight: 1.6, color: "#3A463A" }}>{d}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= CATEGORIES ================= */
function Categories() {
  const cats = [
    ["PAINT", D.roller],
    ["ELECTRICAL", D.bolt],
    ["PLUMBING", D.wrench],
    ["HARDWARE", D.hammer],
    ["TOOLS", D.drill],
    ["CONSTRUCTION", D.hammer],
    ["PLYWOOD", D.brush],
    ["& MORE", D.bolt],
  ];
  const [hov, setHov] = useState(-1);
  return (
    <section id="categories" style={{ background: INK, padding: "clamp(90px,12vh,160px) clamp(20px,4vw,48px)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal>
          <Eyebrow color={LIME}>CATEGORIES</Eyebrow>
          <h2 style={{ margin: "0 0 clamp(40px,6vh,64px)", fontFamily: FONT_DISPLAY, fontSize: "clamp(40px,6vw,84px)", lineHeight: 1, color: PAPER }}>
            NAME IT.
            <br />
            <span style={{ color: LIME }}>WE'LL RUN IT.</span>
          </h2>
        </Reveal>
        <div className="sk-grid4">
          {cats.map(([c, icon], i) => {
            const on = hov === i;
            return (
              <Reveal key={c} delay={i * 60}>
                <a
                  href={WA}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => setHov(i)}
                  onMouseLeave={() => setHov(-1)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 40,
                    padding: "22px 20px",
                    borderRadius: 18,
                    border: `2px solid ${on ? LIME : "#22331F"}`,
                    background: on ? LIME : "transparent",
                    textDecoration: "none",
                    transform: on ? "translateY(-6px) rotate(-1deg)" : "none",
                    transition: "all .35s cubic-bezier(.16,1,.3,1)",
                    height: "100%",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke={on ? INK : LIME} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon} />
                  </svg>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(19px,2vw,24px)", letterSpacing: "0.03em", color: on ? INK : PAPER }}>
                    {c}
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================= HOW IT WORKS ================= */
function How() {
  const steps = [
    ["01", "TELL US WHAT YOU NEED", "WhatsApp or call. A list, a photo, a voice note — anything works."],
    ["02", "PLACE YOUR ORDER", "Quick. Simple. Done. We confirm price and stock on the spot."],
    ["03", "WE GET IT MOVING", "Your supplies, sorted and at your site in minutes. Back to work."],
  ];
  return (
    <section id="how" style={{ background: PAPER, padding: "clamp(90px,12vh,160px) clamp(20px,4vw,48px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Reveal>
          <Eyebrow>HOW IT WORKS</Eyebrow>
          <h2 style={{ margin: "0 0 clamp(40px,6vh,64px)", fontFamily: FONT_DISPLAY, fontSize: "clamp(40px,6vw,84px)", lineHeight: 1, color: INK }}>
            THREE TURNS.
            <br />
            <span style={{ WebkitTextStroke: `2px ${INK}`, color: "transparent" }}>DONE.</span>
          </h2>
        </Reveal>
        <div style={{ display: "grid", gap: 18 }}>
          {steps.map(([n, t, d], i) => (
            <Reveal key={n} delay={i * 110}>
              <div
                className="sk-step"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(16px,3vw,34px)",
                  border: `2px solid ${INK}`,
                  borderRadius: 999,
                  padding: "clamp(18px,2.6vw,28px) clamp(22px,3.4vw,40px)",
                  background: i === 0 ? LIME : PAPER,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT_MONO,
                    fontWeight: 700,
                    fontSize: 15,
                    color: INK,
                    border: `2px solid ${INK}`,
                    borderRadius: 999,
                    width: 44,
                    height: 44,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {n}
                </span>
                <div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(20px,2.6vw,28px)", color: INK }}>{t}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 16, lineHeight: 1.55, color: "#3A463A", marginTop: 4 }}>{d}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= APP SOON ================= */
function AppSoon() {
  return (
    <section style={{ background: LIME, padding: "clamp(80px,10vh,130px) clamp(20px,4vw,48px)", borderTop: `2px solid ${INK}`, borderBottom: `2px solid ${INK}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 30 }}>
        <Reveal>
          <div>
            <Eyebrow>APP LAUNCHING SOON</Eyebrow>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(32px,5vw,64px)", lineHeight: 1.02, color: INK }}>
              WISH WE HAD AN APP?
              <br />
              US TOO. WE'RE STILL BUILDING IT.
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 14, marginTop: 14, color: INK, opacity: 0.7 }}>(pun intended :p)</div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Pill href={WA} big>
            Order on WhatsApp till then
          </Pill>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= FOOTER ================= */
function Footer() {
  return (
    <footer id="contact" style={{ background: INK, padding: "clamp(90px,14vh,170px) clamp(20px,4vw,48px) 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal>
          <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: "clamp(70px,15vw,220px)", lineHeight: 0.92, color: PAPER }}>
            WE'LL
            <br />
            <span style={{ color: LIME }}>DO IT.</span>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p style={{ fontFamily: FONT_BODY, fontSize: "clamp(17px,2vw,21px)", color: "#B9C7B2", margin: "30px 0 34px" }}>
            Need something? Let's get it sorted.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Pill href={WA} big dark>
              WhatsApp us
            </Pill>
            <Pill href={PHONE} big dark>
              Call +91 74166 97132
            </Pill>
            <Pill href="tel:+919866157510" big dark>
              Call +91 98661 57510
            </Pill>
          </div>
        </Reveal>
        <div
          style={{
            marginTop: "clamp(60px,10vh,110px)",
            paddingTop: 26,
            borderTop: "1px solid #22331F",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            fontFamily: FONT_MONO,
            fontSize: 13,
            letterSpacing: "0.12em",
            color: "#7E8F76",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <ScrewHead size={18} fg={LIME} bg={INK} /> SKREWIT. © {new Date().getFullYear()}
          </span>
          <span>WILL DO IT.</span>
        </div>
      </div>
    </footer>
  );
}

/* ================= scroll-progress screw ================= */
function ProgressScrew({ p }) {
  return (
    <div
      className="sk-progress"
      style={{
        position: "fixed",
        right: 22,
        bottom: 22,
        zIndex: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <div style={{ width: 2, height: 64, background: "#00000022", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: "100%", height: `${p * 100}%`, background: INK, transition: "height .1s linear" }} />
      </div>
      <ScrewHead size={34} rotation={p * 1080} />
    </div>
  );
}

/* ================= APP ================= */
export default function App() {
  const { y, p } = useScroll();
  return (
    <div style={{ background: LIME, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        * { box-sizing: border-box; }
        ::selection { background: ${INK}; color: ${LIME}; }
        a:focus-visible { outline: 3px solid ${DEEP}; outline-offset: 3px; border-radius: 6px; }
        .sk-marquee { animation: sk-scroll 24s linear infinite; }
        @keyframes sk-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .sk-grid2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
        .sk-grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .sk-card { transition: transform .35s cubic-bezier(.16,1,.3,1), box-shadow .35s cubic-bezier(.16,1,.3,1); }
        .sk-card:hover { transform: translateY(-6px); box-shadow: 8px 8px 0 ${INK}; }
        @media (max-width: 900px) {
          .sk-grid4 { grid-template-columns: repeat(2, 1fr); }
          .sk-navlinks { display: none !important; }
        }
        @media (max-width: 640px) {
          .sk-grid2 { grid-template-columns: 1fr; }
          .sk-progress { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .sk-marquee { animation: none; }
          * { transition-duration: .01ms !important; animation-duration: .01ms !important; }
        }
      `}</style>
      <Nav scrollY={y} />
      <Hero scrollY={y} />
      <Pain scrollY={y} />
      <Statement scrollY={y} />
      <Details />
      <Categories />
      <How />
      <AppSoon />
      <Footer />
      <ProgressScrew p={p} />
    </div>
  );
}
