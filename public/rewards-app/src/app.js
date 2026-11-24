/* ==========================================================================
   2. State
   ========================================================================== */
// Embedded in the website: the signed-in student comes from the site login (localStorage "ah-rewards-session").
let SESSION = null;
try { SESSION = JSON.parse(localStorage.getItem("ah-rewards-session") || "null"); } catch (e) { /* storage can be blocked */ }
if (SESSION && SESSION.email) document.documentElement.classList.add("embed");
const STORAGE_KEY = "ah-rewards-v1:" + (SESSION && SESSION.email ? SESSION.email.toLowerCase() : "guest");
const toTop = () => { window.scrollTo(0, 0); if (window.parent !== window) parent.postMessage({ type: "ah-rewards-top" }, location.origin); };
// "Today" is the server's date once the saved points have loaded, so every device agrees on when a day starts.
let TODAY = new Date().toDateString();
const todayKey = () => TODAY;
// true once this student's points live on the server (Google sign in + Redis set up). Otherwise points stay in this browser.
let SERVER = false;

const freshState = () => ({
  user: SESSION && SESSION.email ? { name: SESSION.name || SESSION.email.split("@")[0], email: SESSION.email } : null,
  level: null,
  field: null,
  points: 0,
  week: [false, false, false, false, false, false, false], // last 7 days, index 6 is today
  todayPoints: 0,
  day: todayKey(),
  played: {},   // game id -> date key (career: "done")
  vouchers: [],
  view: "hub",
});

/* Invite links: /rewards/login?ref=CODE. The code and the bonus points come from the server (/api/rewards/referral). */
const INVITE = { code: null, friends: 0 };
const inviteLink = () => (INVITE.code ? location.origin + "/rewards/login?ref=" + INVITE.code : "");

function loadState() {
  let s = freshState();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) s = Object.assign(s, JSON.parse(saved));
  } catch (e) { /* storage can be blocked */ }
  if (s.day !== todayKey()) {            // a new day: shift the week, reset the daily cap
    s.day = todayKey();
    s.todayPoints = 0;
    s.week = [...s.week.slice(1), false];
  }
  s.view = s.user ? "hub" : "landing";
  return s;
}

let S = loadState();
const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };

const ui = { modal: null, menuOpen: false, demoOpen: false, bumped: false, sampleAnswered: false };
let game = {};
let timers = [];

/* ==========================================================================
   3. Helpers
   ========================================================================== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const firstName = () => S.user.name.split(" ")[0];
const poolKey = () => (S.level === "c10" ? "x" : S.field || "eng");       // question pool for this student
const bestTier = (points) => TIERS.filter((t) => t.pts <= points).pop() || null;
const clearTimers = () => { timers.forEach(clearInterval); timers = []; };
const gameDone = (id) => (id === "career" ? S.played.career === "done" : S.played[id] === todayKey());

function streakDays() {
  let i = S.week[6] ? 6 : 5, n = 0;
  while (i >= 0 && S.week[i]) { n++; i--; }
  return n;
}

/* Position of a points value on the goal bar. The four tiers are spaced evenly so labels never crowd. */
function goalPosition(points) {
  let prev = 0;
  for (let i = 0; i < TIERS.length; i++) {
    if (points <= TIERS[i].pts) return ((i + (points - prev) / (TIERS[i].pts - prev)) / TIERS.length) * 100;
    prev = TIERS[i].pts;
  }
  return 100;
}

const ICONS = {
  quiz: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h13A2.5 2.5 0 0 1 23 6.5v9a2.5 2.5 0 0 1-2.5 2.5H13l-5 4v-4h-.5A2.5 2.5 0 0 1 5 15.5z"/><path d="M11.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.4"/><path d="M14 15h.01"/></svg>',
  match: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="8" height="6" rx="2"/><rect x="16.5" y="17" width="8" height="6" rx="2"/><path d="M11.5 8h3.5a3 3 0 0 1 3 3v6"/></svg>',
  myth: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="20" height="18" rx="3"/><path d="M14 5v18"/><path d="m7.6 13.4 2.2 2.2 3-3.6"/><path d="m17.6 11.4 4 4m0-4-4 4"/></svg>',
  career: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="14" cy="14" r="10"/><path d="m18.5 9.5-2.2 6.8-6.8 2.2 2.2-6.8z"/></svg>',
  people: '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10" r="4"/><path d="M3.5 23c.6-4 3.4-6.2 7-6.2s6.4 2.2 7 6.2"/><circle cx="20" cy="11" r="3.2"/><path d="M19.5 17c3.2 0 5 1.8 5.5 5"/></svg>',
  arrow: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M4 10h11m-4-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  google: '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>',
};

const GAMES = [
  { id: "quiz",   title: "Daily quiz",            blurb: "5 questions, about 2 minutes", points: 90 },
  { id: "match",  title: "Exam match",            blurb: "Pair each exam with its use",  points: 50 },
  { id: "myth",   title: "Myth or fact",          blurb: "6 quick admission rumours",    points: 30 },
  { id: "career", title: "Which course fits you?", blurb: "6 questions, counts once",     points: 40 },
];

/* ==========================================================================
   4. Views
   ========================================================================== */
function headerView() {
  const nav = ["Colleges", "Courses", "Exams", "Counselling"].map((n) => `<span>${n}</span>`).join("") + '<span class="is-current">Rewards</span>';
  const account = S.user ? `
      <button class="points-chip ${ui.bumped ? "is-bumped" : ""}" data-go="redeem" aria-label="${S.points} points, open rewards">
        <span class="points-chip__coin" aria-hidden="true">AH</span><span class="num"><span id="points-now">${S.points}</span> pts</span>
      </button>
      <button class="head-rewards" data-go="redeem">Rewards</button>
      <div class="menu-wrap">
        <button class="avatar" id="avatar-btn" aria-label="Account menu" aria-expanded="${ui.menuOpen}">${esc(S.user.name[0].toUpperCase())}</button>
        ${ui.menuOpen ? `<div class="menu" role="menu"><div class="menu__who"><b>${esc(S.user.name)}</b><span>${esc(S.user.email)}</span></div>
          <button data-act="edit-track">Change class and interest</button><button data-act="show-landing">View landing page</button><button data-act="logout">Log out</button></div>` : ""}
      </div>`
    : '<button class="btn btn--dark btn--sm" data-act="login">Sign in</button>';
  return `<header class="site-header full-bleed"><div class="container site-header__row">
    <a class="brand" href="#" data-go="${S.user ? "hub" : "landing"}"><img src="${LOGO}" alt=""><span><b>Admissions</b> <span>House</span></span><small>Rewards</small></a>
    <nav class="site-nav" aria-hidden="true">${nav}</nav><div class="site-header__spacer"></div>${account}
  </div></header>`;
}

function landingView() {
  const options = ["JEE Main", "NEET UG", "CLAT", "CAT"].map((o, i) => `<button class="answer" data-sample="${i}"><span class="answer__key">${"ABCD"[i]}</span>${o}</button>`).join("");
  return `<div class="container landing">
    <section class="hero"><div>
      <h1>Play a little.<br>Pay <span class="highlight">less</span> for counselling.</h1>
      <p class="hero__lead">Quizzes and games for your course. Points turn into money off your counselling fee.</p>
      <button class="btn btn--primary" data-act="login">Start earning points</button>
    </div>
    <div class="sample-q"><span class="sample-q__tag">Try one question</span><h3>Which exam decides MBBS admission in India?</h3>
      <div class="answers" id="sample-answers">${options}</div><p class="sample-q__note" id="sample-note">Pick an answer.</p></div></section>
    <div class="steps"><span>Sign in with email</span><i></i><span>Play a game</span><i></i><span>Redeem on your fee</span></div>
    <p class="footnote">Preview for the Admissions House team. Fee, rates and questions are placeholders.</p>
  </div>`;
}

function homeView() {
  const next = TIERS.find((t) => t.pts > S.points), current = bestTier(S.points);
  const saving = (t) => inr(FEE * t.pct / 100);
  const goalLine = next
    ? `<span><b class="num">${(next.pts - S.points).toLocaleString("en-IN")}</b> points to <b>${saving(next)} off</b></span>`
    : `<span>Top tier reached, <b>${saving(current)} off</b></span>`;
  const ticks = TIERS.map((t, i) => {
    const x = ((i + 1) / TIERS.length) * 100, last = i === TIERS.length - 1;
    return `<span class="goalbar__tick ${S.points >= t.pts ? "is-reached" : ""}" style="left:${x}%"></span><span class="goalbar__label ${last ? "is-last" : ""}" style="left:${x}%">${saving(t)}</span>`;
  }).join("");
  const days = streakDays();
  const dots = S.week.map((played, i) => `<i class="${played ? "is-played" : ""} ${i === 6 ? "is-today" : ""}"></i>`).join("");
  const tiles = GAMES.map((g) => {
    const done = gameDone(g.id);
    return `<button class="game ${done ? "is-done" : ""}" data-go="${g.id}">
      <span class="game__icon">${ICONS[g.id]}</span><span class="game__points">${done ? "Done" : "+" + g.points}</span>
      <span><h3>${g.title}</h3><p>${done ? "Done today. Replays are practice." : g.blurb}</p></span>
      <span class="game__go">${done ? "Practice" : "Play"}${ICONS.arrow}</span></button>`;
  }).join("");
  return `<section class="summary full-bleed"><div class="container summary__row">
      <div class="summary__me"><span class="summary__avatar" aria-hidden="true">${esc(S.user.name[0].toUpperCase())}</span>
        <div><p class="summary__hello">Hi, ${esc(firstName())}</p><h1 class="summary__points"><span class="num" id="points-big">${S.points}</span><small>points</small></h1></div></div>
      <div class="goal"><div class="goal__line">${goalLine}<button class="goal__link" data-go="redeem">Rewards</button></div>
        <div class="goalbar" role="progressbar" aria-label="Progress to the next discount" aria-valuenow="${S.points}" aria-valuemin="0" aria-valuemax="${TIERS[TIERS.length - 1].pts}">
          <i class="goalbar__fill" style="width:${goalPosition(S.points)}%"></i>${ticks}</div></div>
    </div></section>
    <div class="container home">
      <div class="today"><h2>Play today</h2><div class="today__meta"><span>${S.todayPoints} of ${DAILY_CAP} points today</span><span class="streak-dots" aria-hidden="true">${dots}</span><span>${days} day streak</span></div></div>
      <div class="home__grid"><div class="games">${tiles}</div>
        <aside class="invite"><div class="invite__head"><span class="invite__icon">${ICONS.people}</span>Invite a friend</div>
          <div class="invite__body"><b class="invite__amount">+100</b><span class="invite__unit">points for you and for your friend</span><p>Share your link. When your friend signs in, you both get the points.</p></div>
          <div class="invite__action">${inviteLink() ? `<div class="invite__link" id="invite-link">${esc(inviteLink())}</div><button class="btn" data-act="copy-invite">Copy link</button><button class="btn" data-act="share-invite">Share</button>` : `<div class="invite__link" id="invite-link">Sign in with Google to get your invite link</div>`}</div></aside>
      </div></div>`;
}

function redeemView() {
  const rows = TIERS.map((t, i) => {
    const can = S.points >= t.pts;
    return `<div class="tier"><span class="tier__pct">${t.pct}%</span>
      <div><b>${inr(FEE - FEE * t.pct / 100)} <small>instead of ${inr(FEE)}</small></b><small>${t.pts.toLocaleString("en-IN")} points</small></div>
      ${can ? `<button class="btn btn--primary btn--sm" data-act="redeem" data-tier="${i}">Redeem</button>` : `<span class="tier__need">${(t.pts - S.points).toLocaleString("en-IN")} more</span>`}</div>`;
  }).join("");
  const vouchers = S.vouchers.map((v) => `<div class="voucher"><div class="voucher__main"><b>${v.pct}% off</b><span class="voucher__code">${v.code}</span><small>Valid till ${v.till}</small></div>
    <div class="voucher__side"><button data-act="copy-code" data-code="${v.code}">Copy</button></div></div>`).join("");
  return `<div class="redeem"><button class="back" data-go="hub">← Back to rewards</button><h1>Rewards</h1>
    <p class="redeem__balance"><b class="num">${S.points}</b> points to spend</p><div class="tiers">${rows}</div>
    ${S.vouchers.length ? `<h2>Your vouchers</h2>${vouchers}` : ""}
    <p class="redeem__note">Vouchers do not stack and last 30 days. Your counsellor applies the code to your fee.</p></div>`;
}

const STAGE_TITLES = { quiz: "Daily quiz", match: "Exam match", myth: "Myth or fact", career: "Which course fits you?" };
function stageView(view) {
  const progress = view === "match" ? "" : '<div class="progress"><i style="width:0"></i></div>';
  return `<div class="stage"><div class="stage__inner"><div class="stage__crumb"><button class="back" data-go="hub">← Back to rewards</button><span>${STAGE_TITLES[view]}</span></div>${progress}<div id="stage"></div></div></div>`;
}
const setProgress = (fraction) => { const bar = $(".progress i"); if (bar) bar.style.width = fraction * 100 + "%"; };

/* ==========================================================================
   5. Points
   ========================================================================== */
/* Adds points for a finished game. Only the first round of a game each day earns points; later rounds are practice. */
function award(gameId, base) {
  const once = gameId === "career";
  const firstTime = once ? S.played.career !== "done" : S.played[gameId] !== todayKey();
  const result = { earned: 0, bonus: 0, capped: false, practice: !firstTime };
  if (!firstTime) return result;

  const bonus = S.week[6] ? 0 : Math.min(streakDays() * 5, 25);   // streak bonus on the first game of the day
  let total = base + bonus;
  const room = Math.max(0, DAILY_CAP - S.todayPoints);
  if (total > room) { result.capped = true; total = room; }

  Object.assign(result, { bonus, earned: total });
  S.points += total;
  S.todayPoints += total;
  S.played[gameId] = once ? "done" : todayKey();
  S.week[6] = true;
  ui.bumped = true;
  save();
  if (SERVER) serverAward(gameId, base);
  return result;
}

/* Saved points: the server is the source of truth. The screen shows the local result at once, then takes the server's numbers. */
function takeServerState(st) {
  Object.assign(S, { points: st.points, todayPoints: st.todayPoints, day: st.day, played: st.played, week: st.week, vouchers: st.vouchers });
  TODAY = st.day; save();
  if (S.view === "hub" || S.view === "redeem") render(); else refreshPoints();
}
async function serverAward(gameId, base) {
  try {
    const r = await fetch("/api/rewards/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "award", game: gameId, base }) });
    const d = await r.json();
    if (d.state) takeServerState(d.state);
  } catch (e) { toast("Could not save points. Check your connection."); }
}
async function syncState() {
  try {
    const r = await fetch("/api/rewards/state", { cache: "no-store" });
    if (!r.ok) return;
    const d = await r.json();
    SERVER = true;
    if (d.state) takeServerState(d.state);
  } catch (e) { /* offline or not set up: points stay in this browser */ }
}

/* ==========================================================================
   6. Results
   ========================================================================== */
function resultView({ title, sub, r, again, ring, marks, stats, review }) {
  const C = +(2 * Math.PI * 52).toFixed(1);
  const frac = ring ? ring.score / ring.total : 0, tone = frac >= 0.8 ? "is-high" : frac >= 0.4 ? "is-mid" : "is-low";
  const ringHtml = ring ? `<div class="ring ${tone}"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="ring__track" cx="60" cy="60" r="52"/>
      <circle class="ring__fill" id="ring-fill" cx="60" cy="60" r="52" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-to="${(C * (1 - frac)).toFixed(1)}"/></svg>
      <div><b>${ring.score}<small>/${ring.total}</small></b></div></div>` : "";
  const marksHtml = marks ? `<div class="marks" aria-label="Answers">${marks.map((ok, i) => `<span class="marks__item"><span class="mark ${ok ? "is-right" : "is-wrong"}">${ok ? "✓" : "✕"}</span><small>${i + 1}</small></span>`).join("")}</div>` : "";
  const bonusNote = !r.practice && r.bonus ? `Includes +${r.bonus} ${streakDays() - 1 > 0 ? "streak" : "first game"} bonus.` : "";
  const capNote = !r.practice && r.capped ? ` Daily limit of ${DAILY_CAP} points reached.` : "";
  const reviewHtml = review ? `<details class="review"><summary>Review answers</summary><ol>${review.map((q, i) => `<li class="${q.ok ? "is-right" : "is-wrong"}"><p>${i + 1}. ${esc(q.q)}</p>
      <small>Your answer: <b>${q.pick ? esc(q.pick) : "No answer, time ran out"}</b></small>${q.ok ? "" : `<small>Correct answer: <b>${esc(q.right)}</b></small>`}</li>`).join("")}</ol></details>` : "";
  if (r.earned > 0 && (!ring || ring.score / ring.total >= 0.5)) setTimeout(confetti, 150);
  return `<div class="result"><div class="result__top">${ringHtml}
      <div class="result__head"><span class="result__tag ${r.practice ? "is-practice" : ""}">${r.practice ? "Practice" : "Round complete"}</span><h2>${title}</h2><p>${sub}</p></div></div>
    ${marksHtml}
    <div class="stats"><div><b>${r.practice ? "0" : "+" + r.earned}</b><span>${r.practice ? "points, practice" : "points earned"}</span></div>${stats.map((s) => `<div><b>${s[0]}</b><span>${s[1]}</span></div>`).join("")}</div>
    ${bonusNote || capNote ? `<p class="result__note">${bonusNote}${capNote}</p>` : ""}${reviewHtml}
    <div class="result__actions"><button class="btn btn--primary" data-go="hub">Back to rewards</button>${again ? `<button class="btn btn--ghost" data-go="${again}">Play again (practice)</button>` : ""}</div></div>`;
}
const animateRing = () => { const ring = $("#ring-fill"); if (ring) setTimeout(() => { ring.style.strokeDashoffset = ring.dataset.to; }, 60); };

/* ==========================================================================
   7. Game: daily quiz
   ========================================================================== */
const QUESTION_SECONDS = 20, TIMER_LENGTH = 144.5;
function startQuiz() {
  const qs = shuffle(QUIZ[poolKey()]).slice(0, 5).map((q) => ({ text: q[0], options: shuffle([[q[1], true], [q[2], false], [q[3], false], [q[4], false]]), why: q[5] }));
  game = { type: "quiz", qs, i: 0, score: 0, locked: false, history: [], startedAt: Date.now() };
  S.view = "quiz"; render(); drawQuestion();
}

function drawQuestion() {
  clearTimers();
  const q = game.qs[game.i], last = game.i === game.qs.length - 1;
  game.locked = false;
  $("#stage").innerHTML = `<div class="q-head"><span class="q-count">Question ${game.i + 1} of ${game.qs.length}</span>
      <div class="timer" role="timer" aria-label="Seconds left"><svg width="54" height="54" aria-hidden="true"><circle cx="27" cy="27" r="23" fill="none" stroke="var(--track)" stroke-width="5"/>
      <circle id="timer-arc" cx="27" cy="27" r="23" fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${TIMER_LENGTH}" stroke-dashoffset="0"/></svg><b id="timer-num">${QUESTION_SECONDS}</b></div></div>
    <h2 class="q-title">${esc(q.text)}</h2>
    <div class="answers">${q.options.map((o, i) => `<button class="answer" data-q="${i}"><span class="answer__key">${i + 1}</span>${esc(o[0])}</button>`).join("")}</div>
    <div class="feedback" id="feedback"><span id="feedback-text"></span><button class="btn btn--dark" id="next-btn">${last ? "See result" : "Next question"}</button></div>`;
  setProgress(game.i / game.qs.length);

  const started = Date.now();
  timers.push(setInterval(() => {
    const left = Math.max(0, QUESTION_SECONDS - (Date.now() - started) / 1000);
    const arc = $("#timer-arc"), num = $("#timer-num");
    if (!arc) return clearTimers();
    arc.style.strokeDashoffset = TIMER_LENGTH * (1 - left / QUESTION_SECONDS);
    num.textContent = Math.ceil(left);
    if (left <= 0 && !game.locked) answerQuestion(-1);
  }, 100));
}

function answerQuestion(index) {              // index -1 means time ran out
  if (game.locked) return;
  game.locked = true; clearTimers();
  const q = game.qs[game.i], correct = q.options.findIndex((o) => o[1]), ok = index === correct;
  $$("[data-q]").forEach((btn, k) => {
    btn.disabled = true;
    if (k === correct) btn.classList.add("is-right"); else if (k === index) btn.classList.add("is-wrong");
  });
  game.history[game.i] = { q: q.text, pick: index < 0 ? null : q.options[index][0], right: q.options[correct][0], ok };
  if (ok) { game.score++; floatPoints("+10"); }
  $("#feedback-text").textContent = (index === -1 ? "Time is up. " : ok ? "Correct. " : "Not quite. ") + q.why;
  $("#feedback").classList.add("is-visible");
  $("#next-btn").focus();
}

function nextQuestion() { if (game.i < game.qs.length - 1) { game.i++; drawQuestion(); } else finishQuiz(); }

function finishQuiz() {
  const total = game.qs.length, perfect = game.score === total;
  const r = award("quiz", game.score * 10 + (perfect ? 20 : 0));
  const titles = ["Tough round", "Keep going", "Getting there", "Solid round", "Great round", "Perfect round"];
  setProgress(1);
  $("#stage").innerHTML = resultView({
    title: titles[game.score], r, again: "quiz",
    sub: r.practice ? "Practice round. Points count on your first round each day." : "Daily quiz complete.",
    ring: { score: game.score, total }, marks: game.history.map((h) => h.ok), review: game.history,
    stats: [[Math.round((game.score / total) * 100) + "%", "correct"], [Math.round((Date.now() - game.startedAt) / 1000) + "s", "total time"]],
  });
  animateRing(); refreshPoints();
}

/* ==========================================================================
   8. Game: exam match
   ========================================================================== */
function startMatch() {
  const pairs = MATCH[poolKey()];
  game = { type: "match", pairs, order: shuffle(pairs.map((p, i) => i)), selected: null, matched: new Set(), misses: 0, startedAt: Date.now() };
  S.view = "match"; render();
  $("#stage").innerHTML = `<h2 class="q-title" style="margin-top:0">Match each one to what it is for.</h2>
    <div class="match-stats"><span>Time <b id="match-time">0s</b></span><span>Mistakes <b id="match-misses">0</b></span></div>
    <div class="pairs"><div class="pairs__col">${pairs.map((p, i) => `<button class="pair" data-left="${i}">${esc(p[0])}</button>`).join("")}</div>
    <div class="pairs__col">${game.order.map((i) => `<button class="pair" data-right="${i}">${esc(pairs[i][1])}</button>`).join("")}</div></div>`;
  timers.push(setInterval(() => {
    const el = $("#match-time"); if (!el) return clearTimers();
    el.textContent = Math.floor((Date.now() - game.startedAt) / 1000) + "s";
  }, 500));
}

function pickLeft(i) {
  if (game.matched.has(i)) return;
  game.selected = i;
  $$("[data-left]").forEach((b) => b.classList.toggle("is-selected", +b.dataset.left === i));
}

function pickRight(i, btn) {
  if (game.selected == null || game.matched.has(i)) return;
  const left = $(`[data-left="${game.selected}"]`);
  if (game.selected === i) {
    game.matched.add(i);
    [left, btn].forEach((b) => { b.classList.remove("is-selected"); b.classList.add("is-matched"); b.disabled = true; });
    game.selected = null; floatPoints("+10", btn);
    if (game.matched.size === game.pairs.length) finishMatch();
  } else {
    game.misses++; $("#match-misses").textContent = game.misses;
    [left, btn].forEach((b) => { b.classList.add("is-miss"); setTimeout(() => b.classList.remove("is-miss"), 400); });
    left.classList.remove("is-selected"); game.selected = null;
  }
}

function finishMatch() {
  clearTimers();
  const secs = Math.floor((Date.now() - game.startedAt) / 1000), misses = game.misses;
  const r = award("match", Math.max(10, 50 - misses * 5));
  setTimeout(() => {
    $("#stage").innerHTML = resultView({
      title: misses === 0 ? "Clean sweep" : "All matched", r, again: "match",
      sub: `${game.pairs.length} pairs matched${misses ? ` with ${misses} mistake${misses === 1 ? "" : "s"}` : " with no mistakes"}.`,
      stats: [[String(misses), misses === 1 ? "mistake" : "mistakes"], [secs + "s", "total time"]],
    });
    refreshPoints();
  }, 700);
}

/* ==========================================================================
   9. Game: myth or fact
   ========================================================================== */
function startMyth() {
  game = { type: "myth", cards: shuffle(MYTHS).slice(0, 6), i: 0, score: 0, locked: false, history: [] };
  S.view = "myth"; render(); drawStatement();
}

function drawStatement() {
  const card = game.cards[game.i], last = game.i === game.cards.length - 1;
  game.locked = false;
  setProgress(game.i / game.cards.length);
  $("#stage").innerHTML = `<div class="q-head"><span class="q-count">Statement ${game.i + 1} of ${game.cards.length}</span></div>
    <div class="statement" style="margin-top:26px"><span class="statement__tag">MYTH OR FACT</span><h2 class="q-title">${esc(card[0])}</h2></div>
    <div class="verdicts"><button class="verdict verdict--myth" data-verdict="0">Myth</button><button class="verdict verdict--fact" data-verdict="1">Fact</button></div>
    <div class="feedback" id="feedback"><span id="feedback-text"></span><button class="btn btn--dark" id="next-btn">${last ? "See result" : "Next"}</button></div>`;
}

function answerStatement(verdict) {           // verdict 1 = "Fact", 0 = "Myth"
  if (game.locked) return;
  game.locked = true;
  const card = game.cards[game.i], isFact = card[1], ok = (verdict === 1) === isFact;
  game.history[game.i] = { q: card[0], pick: verdict === 1 ? "Fact" : "Myth", right: isFact ? "Fact" : "Myth", ok };
  if (ok) { game.score++; floatPoints("+5"); }
  $$("[data-verdict]").forEach((b) => { b.disabled = true; });
  $("#feedback-text").textContent = (ok ? "Right. " : "Not this time. ") + "It is a " + (isFact ? "fact" : "myth") + ". " + card[2];
  $("#feedback").classList.add("is-visible");
  $("#next-btn").focus();
}

function nextStatement() {
  if (game.i < game.cards.length - 1) { game.i++; drawStatement(); return; }
  const total = game.cards.length, r = award("myth", game.score * 5);
  setProgress(1);
  $("#stage").innerHTML = resultView({
    title: `${game.score} of ${total} right`, r, again: "myth",
    sub: game.score >= total - 1 ? "You can spot a rumour from a mile away." : "Rumours are tricky. It is good that you checked.",
    ring: { score: game.score, total }, marks: game.history.map((h) => h.ok), review: game.history,
    stats: [[Math.round((game.score / total) * 100) + "%", "correct"]],
  });
  animateRing(); refreshPoints();
}

/* ==========================================================================
   10. Game: which course fits you
   ========================================================================== */
function startCareer() {
  game = { type: "career", i: 0, scores: { B: 0, H: 0, L: 0, A: 0, M: 0, P: 0 } };
  S.view = "career"; render(); drawCareerQuestion();
}

function drawCareerQuestion() {
  const q = CAREER[game.i];
  setProgress(game.i / CAREER.length);
  $("#stage").innerHTML = `<div class="q-head"><span class="q-count">Question ${game.i + 1} of ${CAREER.length}</span><span class="q-note">No wrong answers</span></div>
    <h2 class="q-title">${esc(q[0])}</h2>
    <div class="answers">${q.slice(1).map((o, i) => `<button class="answer" data-type="${o[1]}"><span class="answer__key">${"ABCD"[i]}</span>${esc(o[0])}</button>`).join("")}</div>`;
}

function answerCareer(type) {
  game.scores[type]++;
  if (game.i < CAREER.length - 1) { game.i++; drawCareerQuestion(); return; }
  const top = Object.entries(game.scores).sort((a, b) => b[1] - a[1])[0][0], info = TYPES[top];
  const r = award("career", 40);
  const bars = Object.entries(TYPES).map(([k, v]) => `<div><span>${v[0].replace("The ", "")}</span><i><b data-width="${(game.scores[k] / CAREER.length) * 100}"></b></i><span class="num">${game.scores[k]}</span></div>`).join("");
  setProgress(1);
  $("#stage").innerHTML = `<div class="result type"><div class="type__label">Your type</div><h2 style="margin-top:6px;font-size:clamp(1.8rem,4vw,2.5rem)">${info[0]}</h2>
    <p style="margin-top:10px;color:var(--ink-2)">${info[2]}</p><div class="type-bars">${bars}</div>
    <div class="stats"><div><b>${r.practice ? "0" : "+" + r.earned}</b><span>${r.practice ? "points, retake" : "points earned"}</span></div></div>
    <div class="result__actions"><button class="btn btn--primary" data-act="set-track" data-field="${info[1]}">Switch my games to ${FIELDS[info[1]]}</button><button class="btn btn--ghost" data-go="hub">Back to rewards</button></div></div>`;
  setTimeout(() => $$("[data-width]").forEach((b) => { b.style.width = b.dataset.width + "%"; }), 50);
  if (r.earned > 0) setTimeout(confetti, 200);
  refreshPoints();
}

/* ==========================================================================
   11. Dialogs and demo tools
   ========================================================================== */
const SAMPLE_STUDENTS = [{ name: "Aanya Sharma", email: "aanya.sharma@example.com" }, { name: "Rohan Mehta", email: "rohan.mehta@example.com" }];

function dialogView() {
  const m = ui.modal;
  if (!m) return "";
  let body = "";
  if (m.type === "login") body = `<h2>Sign in to start earning</h2><p class="dialog__lead">Your points are saved to your email, so you can pick up on any phone or laptop.</p>
    <button class="google-btn" data-act="google">${ICONS.google} Continue with Google</button><div class="divider">or use your email</div>
    <form id="email-form" novalidate><div class="field"><label for="email">Email address</label><input id="email" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com"><div class="field__error" id="email-error"></div></div>
    <button class="btn btn--dark btn--block" type="submit">Email me a sign-in link</button></form>`;
  if (m.type === "google") body = `<h2>Choose a student</h2><p class="dialog__lead">Demo only. In the real site this is the Google account picker.</p>
    ${SAMPLE_STUDENTS.map((s, i) => `<button class="account" data-act="pick-student" data-i="${i}"><span class="avatar">${s.name[0]}</span><span><b>${s.name}</b><small>${s.email}</small></span></button>`).join("")}
    <button class="btn btn--ghost" style="margin-top:10px" data-act="login">Back</button>`;
  if (m.type === "sent") body = `<h2>Check your inbox</h2><p class="dialog__lead">We sent a sign-in link to <b>${esc(m.email)}</b>. It works once and expires in 15 minutes.</p>
    <button class="btn btn--primary btn--block" data-act="open-email">Open the email (demo)</button><button class="btn btn--ghost btn--block" style="margin-top:10px" data-act="login">Use a different email</button>`;
  if (m.type === "inbox") body = `<div class="email-preview"><small>From Admissions House · to ${esc(m.email)}</small><b style="font-size:1.1rem">Your sign-in link</b>
    <span style="color:var(--ink-2)">Tap the button to sign in and start earning points. If you did not ask for this, ignore this email.</span><button class="btn btn--dark" data-act="email-sign-in">Sign in to Rewards</button></div>`;
  if (m.type === "onboard" || m.type === "track") body = `${m.type === "track" ? '<button class="dialog__x" data-act="close-modal" aria-label="Close">✕</button>' : ""}<h2>${m.type === "onboard" ? "Two quick questions" : "Change your track"}</h2><p class="dialog__lead">Your class and course decide which questions you get.</p>
    <div class="field"><label>I am in</label></div><div class="choices">${Object.entries(LEVELS).map(([k, v]) => `<button class="choice ${m.level === k ? "is-on" : ""}" data-level="${k}">${v}</button>`).join("")}</div>
    <div class="field"><label>I want to study</label></div><div class="choices">${Object.entries(FIELDS).map(([k, v]) => `<button class="choice ${m.field === k ? "is-on" : ""}" data-field="${k}">${v}</button>`).join("")}</div>
    <button class="btn btn--primary btn--block" data-act="save-track" ${m.level && m.field ? "" : "disabled"}>${m.type === "onboard" ? "Start playing" : "Save"}</button>`;
  return `<div class="scrim" data-act="close-dialog"><div class="dialog" role="dialog" aria-modal="true" aria-label="Sign in">${body}</div></div>`;
}
const showDialog = (modal) => { ui.modal = modal; $("#dialog-root").innerHTML = dialogView(); };

const PROFILES = [["c12|eng", "Class 12, Engineering"], ["c12|med", "Class 12, Medical"], ["grad|mgt", "Graduate, Management"], ["c12|law", "Class 12, Law"], ["c12|des", "Class 12, Design"], ["c12|com", "Class 12, Commerce"], ["c10|eng", "Class 10, stream basics"]];
function demoToolsView() {
  if (!S.user || SERVER) return "";
  const panel = ui.demoOpen ? `<div class="demo-tools__panel"><div><label for="profile">Preview as</label>
    <select id="profile">${PROFILES.map(([v, t]) => `<option value="${v}" ${v === S.level + "|" + S.field ? "selected" : ""}>${t}</option>`).join("")}</select></div>
    <button data-act="add-points">Add 100 points</button><button data-act="reset-demo">Reset the demo</button></div>` : "";
  return `${panel}<button data-act="toggle-demo">Preview controls</button>`;
}

/* ==========================================================================
   12. Rendering
   ========================================================================== */
function render() {
  clearTimers();
  if (!S.user && S.view !== "landing") S.view = "landing";
  const views = { landing: landingView, hub: homeView, redeem: redeemView };
  const body = views[S.view] ? views[S.view]() : stageView(S.view);
  $("#app").innerHTML = headerView() + body;
  $("#dialog-root").innerHTML = dialogView();
  $("#demo-root").innerHTML = demoToolsView();
  ui.bumped = false;
  // Tell the website whether a game is on screen, so it can hide its footer while the student plays.
  if (window.parent !== window) parent.postMessage({ type: "ah-rewards-playing", playing: !views[S.view] }, location.origin);
  try { if (views[S.view] && location.hash.slice(1) !== S.view) history.replaceState(null, "", "#" + S.view); } catch (e) { /* ignore */ }
  const big = $("#points-big"); if (big) countUp(big);
}

function countUp(el) {
  const to = +el.textContent, start = performance.now();
  if (!to) return;
  (function step(now) {
    const p = Math.min(1, (now - start) / 700);
    el.textContent = Math.round(to * p);
    if (p < 1) requestAnimationFrame(step);
  })(start);
}

function refreshPoints() {
  const chip = $(".points-chip"); if (!chip) return;
  $("#points-now").textContent = S.points;
  chip.classList.remove("is-bumped"); void chip.offsetWidth; chip.classList.add("is-bumped");
}

function go(view) {
  S.view = view; ui.menuOpen = false;
  const starters = { quiz: startQuiz, match: startMatch, myth: startMyth, career: startCareer };
  if (starters[view]) return starters[view]();
  render(); toTop();
}

function toast(message) {
  const el = document.createElement("div");
  el.className = "toast"; el.textContent = message; document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

function floatPoints(text, anchor) {
  const box = (anchor || document.activeElement || document.body).getBoundingClientRect();
  const el = document.createElement("div");
  el.className = "float-points"; el.textContent = text;
  el.style.left = box.left + box.width / 2 - 20 + "px"; el.style.top = Math.max(80, box.top) + "px";
  document.body.appendChild(el); setTimeout(() => el.remove(), 1000);
}

function copyText(text, message) {
  const fail = () => toast("Select the text and copy it");
  try { navigator.clipboard.writeText(text).then(() => toast(message), fail); } catch (e) { fail(); }
}

function confetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = $("#confetti"), ctx = canvas.getContext("2d");
  canvas.width = innerWidth; canvas.height = innerHeight;
  const colours = ["#0a7f76", "#00dfc2", "#bdede6", "#062b29", "#ffffff"];
  const bits = Array.from({ length: 90 }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.45, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4,
    size: Math.random() * 6 + 3, colour: colours[(Math.random() * colours.length) | 0], angle: Math.random() * 6,
  }));
  let frame = 0;
  (function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bits.forEach((b) => {
      b.vy += 0.45; b.x += b.vx; b.y += b.vy; b.angle += 0.2;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.angle); ctx.fillStyle = b.colour; ctx.fillRect(-b.size, -b.size / 2, b.size * 2, b.size); ctx.restore();
    });
    if (++frame < 90) requestAnimationFrame(tick); else ctx.clearRect(0, 0, canvas.width, canvas.height);
  })();
}

function signIn(name, email) {
  S.user = { name, email }; save(); ui.modal = null;
  S.view = "hub";
  if (!S.level) { ui.modal = { type: "onboard", level: null, field: null }; render(); return; }
  render(); toTop(); toast("Signed in as " + name);
}

/* ==========================================================================
   13. Events
   ========================================================================== */
const ACTIONS = {
  login: () => { if (S.user) return go("hub"); showDialog({ type: "login" }); setTimeout(() => { const i = $("#email"); if (i) i.focus(); }, 50); },
  google: () => showDialog({ type: "google" }),
  "pick-student": (el) => { const s = SAMPLE_STUDENTS[+el.dataset.i]; signIn(s.name, s.email); },
  "open-email": () => showDialog({ type: "inbox", email: ui.modal.email }),
  "email-sign-in": () => {
    const email = ui.modal.email;
    signIn(email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), email);
  },
  "close-modal": () => { ui.modal = null; $("#dialog-root").innerHTML = ""; },
  "close-dialog": (el, e) => { if (e.target === el) { ui.modal = null; $("#dialog-root").innerHTML = ""; } },
  "edit-track": () => { ui.menuOpen = false; ui.modal = { type: "track", level: S.level, field: S.field }; render(); },
  "save-track": () => {
    const wasOnboarding = ui.modal.type === "onboard";
    S.level = ui.modal.level; S.field = ui.modal.field; ui.modal = null; save(); S.view = "hub";
    render(); toTop(); toast(wasOnboarding ? "You are in. Your first games are ready." : "Track updated");
  },
  "set-track": (el) => { S.field = el.dataset.field; if (S.level === "c10") S.level = "c12"; save(); toast("Games now follow " + FIELDS[S.field]); go("hub"); },
  // Signing out is done by the website (it clears the session and opens the login page). Outside the website there is no session to clear.
  logout: () => {
    ui.menuOpen = false;
    if (window.parent !== window) parent.postMessage({ type: "ah-rewards-logout" }, location.origin);
    else { try { localStorage.removeItem("ah-rewards-session"); } catch (e) { /* ignore */ } location.reload(); }
  },
  "show-landing": () => { ui.menuOpen = false; S.view = "landing"; render(); toTop(); },
  redeem: async (el) => {
    const idx = +el.dataset.tier, tier = TIERS[idx];
    if (S.points < tier.pts) return;
    if (SERVER) {
      try {
        const r = await fetch("/api/rewards/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "redeem", tier: idx }) });
        const d = await r.json();
        if (d.state) takeServerState(d.state);
        if (d.ok) { confetti(); toast("Voucher ready. Show the code to your counsellor."); } else toast(d.error || "Could not redeem. Try again.");
      } catch (e) { toast("Could not redeem. Check your connection."); }
      return;
    }
    S.points -= tier.pts;
    const code = "AH-" + Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + (10 + Math.floor(Math.random() * 90));
    const till = new Date(Date.now() + 30 * 864e5).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    S.vouchers.unshift({ pct: tier.pct, code, till }); save(); render(); confetti();
    toast("Voucher ready. Show the code to your counsellor.");
  },
  "copy-code": (el) => copyText(el.dataset.code, "Code copied"),
  "copy-invite": () => inviteLink() && copyText(inviteLink(), "Link copied"),
  "share-invite": () => {
    if (!inviteLink()) return;
    const text = "Play quick admission games on Admissions House and earn points towards college fee vouchers. Join with my link: " + inviteLink();
    if (navigator.share) navigator.share({ title: "Admissions House Rewards", text }).catch(() => {});
    else window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
  },
  "toggle-demo": () => { ui.demoOpen = !ui.demoOpen; $("#demo-root").innerHTML = demoToolsView(); },
  "add-points": () => { S.points += 100; save(); render(); },
  "reset-demo": () => { try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ } S = loadState(); ui.modal = null; ui.sampleAnswered = false; render(); toTop(); },
};

function answerSample(el) {                    // the one free question on the landing page
  if (ui.sampleAnswered) return;
  ui.sampleAnswered = true;
  const picked = +el.dataset.sample, right = 1;
  $$("[data-sample]").forEach((b, k) => { b.disabled = true; if (k === right) b.classList.add("is-right"); else if (k === picked) b.classList.add("is-wrong"); });
  $("#sample-note").textContent = picked === right ? "Correct. That is +10 points, if you were signed in." : "Not quite. NEET UG is the entrance for MBBS. Sign in to play for real.";
  if (picked === right) floatPoints("+10", el);
}

document.addEventListener("click", (e) => {
  const on = (sel) => e.target.closest(sel);
  let el;
  if ((el = on("[data-go]")))     { e.preventDefault(); return go(el.dataset.go); }
  if ((el = on("[data-sample]"))) return answerSample(el);
  if ((el = on("[data-q]")))      return answerQuestion(+el.dataset.q);
  if (on("#next-btn"))            return game.type === "quiz" ? nextQuestion() : nextStatement();
  if ((el = on("[data-left]")))   return pickLeft(+el.dataset.left);
  if ((el = on("[data-right]")))  return pickRight(+el.dataset.right, el);
  if ((el = on("[data-verdict]"))) return answerStatement(+el.dataset.verdict);
  if ((el = on("[data-type]")))   return answerCareer(el.dataset.type);
  if ((el = on("[data-level]")))  { ui.modal.level = el.dataset.level; $("#dialog-root").innerHTML = dialogView(); return; }
  if ((el = on("[data-field]")) && ui.modal) { ui.modal.field = el.dataset.field; $("#dialog-root").innerHTML = dialogView(); return; }
  if (on("#avatar-btn"))          { ui.menuOpen = !ui.menuOpen; return render(); }
  if ((el = on("[data-act]")))    { const action = ACTIONS[el.dataset.act]; if (action) action(el, e); return; }
  if (ui.menuOpen)                { ui.menuOpen = false; render(); }
});

document.addEventListener("change", (e) => {
  if (e.target.id !== "profile") return;
  const [level, field] = e.target.value.split("|");
  S.level = level; S.field = field; save(); S.view = "hub"; render();
  toast("Previewing " + LEVELS[level] + ", " + FIELDS[field]);
});

document.addEventListener("submit", (e) => {
  if (e.target.id !== "email-form") return;
  e.preventDefault();
  const email = $("#email").value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { $("#email-error").textContent = "Enter a full email address, like name@example.com."; return; }
  showDialog({ type: "sent", email });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && ui.modal) { ui.modal = null; $("#dialog-root").innerHTML = ""; return; }
  if (S.view === "quiz" && game.qs && /^[1-4]$/.test(e.key) && !game.locked) answerQuestion(+e.key - 1);
  if (S.view === "myth" && game.cards) {
    if (e.key === "ArrowLeft") answerStatement(0);
    if (e.key === "ArrowRight") answerStatement(1);
    if (e.key === "Enter" && game.locked) nextStatement();
  }
});

window.addEventListener("hashchange", () => {
  const view = location.hash.slice(1);
  if (["landing", "hub", "redeem"].includes(view) && view !== S.view && (S.user || view === "landing")) { S.view = view; render(); }
});

render();

// Invites: register a friend's code if we arrived through a link, then add any waiting points. The server hands each point out once.
async function syncInvites() {
  if (!S.user) return;
  try {
    let ref = null;
    try { ref = localStorage.getItem("ah-rewards-ref"); } catch (e) { /* ignore */ }
    if (ref) {
      const r = await fetch("/api/rewards/referral", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref }) });
      if (r.ok || r.status === 400) { try { localStorage.removeItem("ah-rewards-ref"); } catch (e) { /* ignore */ } }
    }
    const res = await fetch("/api/rewards/referral", { cache: "no-store" });
    if (!res.ok) return;
    const d = await res.json();
    INVITE.code = d.code; INVITE.friends = d.friends;
    if (S.view === "hub") render();
  } catch (e) { /* offline or not set up: the games still work */ }
}
syncInvites().then(syncState);

// First visit of a new student: ask class and course so the games match.
if (S.user && !S.level) { ui.modal = { type: "onboard", level: null, field: null }; render(); }

// Tell the website how tall the games are, so the page can size the frame without an inner scrollbar.
if (window.parent !== window) {
  const tell = () => parent.postMessage({ type: "ah-rewards-height", height: Math.ceil(document.body.getBoundingClientRect().height) }, location.origin);
  new ResizeObserver(tell).observe(document.body);
  tell();
  // The website tells us how much window height is free, so the home screen can fill it and tighten up when it is short.
  window.addEventListener("message", (e) => {
    if (e.origin !== location.origin || !e.data || e.data.type !== "ah-rewards-avail") return;
    const h = Math.round(e.data.h), root = document.documentElement;
    root.style.setProperty("--avail", h + "px");
    root.classList.toggle("h-short", h < 780);
    root.classList.toggle("h-tiny", h < 640);
  });
  parent.postMessage({ type: "ah-rewards-ready" }, location.origin);
  // Pointer movement and clicks do not reach the page behind this frame, so pass them on for the background glow and ripples.
  let queued = null;
  const sendPointer = () => { if (queued) { parent.postMessage(queued, location.origin); queued = null; } };
  document.addEventListener("mousemove", (e) => { if (!queued) requestAnimationFrame(sendPointer); queued = { type: "ah-rewards-pointer", x: e.clientX, y: e.clientY }; });
  document.addEventListener("click", (e) => parent.postMessage({ type: "ah-rewards-pointer", x: e.clientX, y: e.clientY, click: true }, location.origin));
}
