/* ==========================================================================
   TechWrite — shared behaviour
   1 config fill · 2 navigation · 3 lecture TOC · 4 ABC filter · 5 quizzes
   6 contact form · 7 back-to-top
   Every feature degrades gracefully: the pages read fine without JavaScript.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const CFG = window.SITE_CONFIG || {};
  const isPlaceholder = (v) => typeof v !== "string" || v.trim() === "" || /^\[.*\]$/.test(v.trim());

  /* 1 · config fill ------------------------------------------------------ */
  function fillConfig() {
    $$("[data-fill]").forEach((el) => {
      const val = CFG[el.dataset.fill];
      if (typeof val === "string" && val.trim()) {
        el.textContent = val;
        el.classList.toggle("ph", isPlaceholder(val));
      }
    });
    $$("[data-fill-mailto]").forEach((a) => {
      const val = CFG.email;
      if (!isPlaceholder(val)) a.href = "mailto:" + val;
      else a.removeAttribute("href");
    });
    const photo = $("#profile-photo");
    if (photo && CFG.photo) photo.src = CFG.photo;
    const yr = $("#year");
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* 2 · navigation ------------------------------------------------------- */
  function initNav() {
    const btn = $(".nav-toggle");
    const nav = $("#site-nav");
    if (!btn || !nav) return;
    const set = (open) => {
      nav.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    };
    btn.addEventListener("click", () => set(!nav.classList.contains("open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    window.addEventListener("resize", () => { if (window.innerWidth > 760) set(false); });
  }

  /* 3 · lecture table of contents + scroll-spy --------------------------- */
  function initToc() {
    const toc = $("#toc");
    if (!toc || !("IntersectionObserver" in window)) return;
    const links = $$("a[href^='#']", toc);
    const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const targets = links.map((a) => document.getElementById(a.getAttribute("href").slice(1))).filter(Boolean);
    let current = null;

    function activate(id) {
      if (id === current) return;
      current = id;
      links.forEach((a) => a.classList.remove("active"));
      $$("li.open", toc).forEach((li) => li.classList.remove("open"));
      const link = byId.get(id);
      if (!link) return;
      link.classList.add("active");
      let li = link.closest("li");
      while (li) { li.classList.add("open"); li = li.parentElement.closest("li"); }
    }

    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) activate(visible[0].target.id);
    }, { rootMargin: "-80px 0px -65% 0px", threshold: 0 });
    targets.forEach((t) => io.observe(t));
    if (location.hash && byId.has(location.hash.slice(1))) activate(location.hash.slice(1));
    else if (targets[0]) activate(targets[0].id);
  }

  /* 4 · ABC filter ------------------------------------------------------- */
  function initAbcFilter() {
    const input = $("#abc-search");
    const cards = $$(".abc-card");
    const out = $("#abc-count");
    if (!input || !cards.length) return;
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach((c) => {
        const hit = !q || c.textContent.toLowerCase().includes(q);
        c.classList.toggle("hide", !hit);
        if (hit) shown++;
      });
      if (out) out.textContent = shown === cards.length ? "Showing all 26 letters" : `Showing ${shown} of 26`;
    });
  }

  /* 5 · self-check quizzes ---------------------------------------------- */
  const QUIZZES = {
    l1: [
      { q: "Which set of qualities best describes technical writing?", o: ["Emotional, humorous, imaginative", "Impartial, objective, accurate, concise, unemotional", "Persuasive, decorative, subjective", "Long, detailed, opinionated"], a: 1, e: "Technical writing is impartial, objective, accurate, concise and unemotional." },
      { q: "“The report explains how the new system works so staff can use it.” Which purpose is this?", o: ["To inform", "To persuade and influence", "To entertain", "To analyze events"], a: 0, e: "Explaining how something works so readers can use it is writing to inform." },
      { q: "A writer replaces “restart the machine, or maybe consider clicking Retry” with “If an error appears, click Retry. If it persists, restart the machine.” Which factor was improved?", o: ["Actionable content", "Cultural considerations", "Time constraints", "Legal compliance"], a: 0, e: "Clear, direct steps make the content actionable." }
    ],
    l2: [
      { q: "Which ABC means “citing your sources”?", o: ["Accuracy", "Honesty", "Judgment", "Zest"], a: 1, e: "Honesty means acknowledging sources and avoiding plagiarism." },
      { q: "Checking statements, spelling and punctuation before submitting matches which ABC?", o: ["Revision", "Brevity", "Viewpoint", "Unity"], a: 0, e: "Revision is the final check of statements, spelling, punctuation and more." },
      { q: "Charts, graphs and diagrams that make a report easier to understand are examples of…", o: ["Dignity", "Illustration", "Qualification", "Logic"], a: 1, e: "Illustration is the use of visual aids." }
    ],
    l3: [
      { q: "In a formal alphanumeric outline, what comes right after the Roman numeral level (I, II, III)?", o: ["Arabic numbers (1, 2, 3)", "Capital letters (A, B, C)", "Lowercase letters (a, b, c)", "Parenthetical numbers"], a: 1, e: "The order is I → A → 1 → a → (1) → (a)." },
      { q: "A sentence outline is best used when…", o: ["The paper has complex details", "You only need a quick list of keywords", "You are writing a memo", "There is no audience"], a: 0, e: "Sentence outlines suit complex details; topic outlines use short phrases." },
      { q: "“A thermometer is an instrument that measures temperature.” The phrase “that measures temperature” is the…", o: ["Species", "Genus", "Differentia", "Amplification"], a: 2, e: "The differentia is the characteristic that separates the term from others in its class." }
    ],
    l4: [
      { q: "Which parts belong in the header of a memorandum?", o: ["TO, FROM, DATE, SUBJECT", "Title fly, abstract, appendix", "Salutation and closing", "Bibliography"], a: 0, e: "A memo header has TO, FROM, DATE and SUBJECT lines." },
      { q: "Which report is written in business-letter format for an external reader?", o: ["Memorandum report", "Letter report", "Abstract", "Laboratory report"], a: 1, e: "A letter report uses business-letter format and goes outside the organization." },
      { q: "A short standalone summary that helps readers decide whether to read the full document is a(n)…", o: ["Proposal", "Appendix", "Abstract", "Brochure"], a: 2, e: "That is the purpose of an abstract." }
    ],
    l5: [
      { q: "Which sentence is parallel?", o: ["I enjoy reading, to swim, and hiking.", "I enjoy reading, swimming, and hiking.", "I enjoy to read, swimming, and hike.", "I enjoy reading, swim, and hikes."], a: 1, e: "All three items use the -ing form." },
      { q: "Which is a sentence fragment?", o: ["The hospital is full of patients.", "Because she forgot her umbrella.", "There are twenty boxes.", "She loves skiing, but he does not."], a: 1, e: "“Because…” starts a dependent clause that does not express a complete thought." },
      { q: "Which is correct under the number rules for technical writing?", o: ["Thirty students joined the survey.", "30 students joined the survey.", "Thirty-students joined the survey.", "Thirty student joined the survey."], a: 0, e: "Do not start a sentence with a numeral; spell it out." }
    ],
    l6: [
      { q: "Which letter part contains the recipient’s name and address?", o: ["Letterhead", "Inside address", "Signature block", "Enclosure line"], a: 1, e: "The inside address identifies the person or organization you are writing to." },
      { q: "Which closing is appropriate when you wrote “Dear Mr. Santos:”?", o: ["Later!", "Sincerely,", "Cheers,", "Your buddy,"], a: 1, e: "Use a formal complimentary close such as “Sincerely,” or “Respectfully,”." },
      { q: "In full block format, where do all parts begin?", o: ["Centered", "At the right margin", "At the left margin", "Indented five spaces"], a: 2, e: "Full block places every part flush with the left margin." }
    ],
    l7: [
      { q: "Which graphic aid best shows a trend over time?", o: ["Pie chart", "Line graph", "Pictograph", "Table"], a: 1, e: "Line graphs show continuous change such as time series." },
      { q: "What does the whole circle of a pie chart represent?", o: ["The largest category", "The average", "100% of the data set", "The time period"], a: 2, e: "Each slice is a share of the whole, which equals 100%." },
      { q: "Which label is complete for a visual aid?", o: ["Chart", "Figure 2. Monthly website visitors, January–June", "Look at this!", "Visitors"], a: 1, e: "A proper label has a type, a number and a descriptive caption." }
    ]
  };

  function initQuizzes() {
    $$(".quiz[data-quiz]").forEach((box) => {
      const set = QUIZZES[box.dataset.quiz];
      if (!set) return;
      box.innerHTML = "";
      const h = document.createElement("h3");
      h.textContent = "Check yourself";
      const sub = document.createElement("p");
      sub.className = "muted";
      sub.textContent = "Three quick questions. Pick an answer to see the explanation.";
      box.append(h, sub);
      let answered = 0, correct = 0;
      const score = document.createElement("p");
      score.className = "score";
      score.setAttribute("aria-live", "polite");

      set.forEach((item, qi) => {
        const wrap = document.createElement("div");
        wrap.className = "q";
        const p = document.createElement("p");
        p.textContent = `${qi + 1}. ${item.q}`;
        const opts = document.createElement("div");
        opts.className = "opts";
        const fb = document.createElement("p");
        fb.className = "fb";
        fb.setAttribute("aria-live", "polite");
        item.o.forEach((text, oi) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "opt";
          b.textContent = text;
          b.addEventListener("click", () => {
            $$("button", opts).forEach((x, xi) => {
              x.disabled = true;
              if (xi === item.a) x.classList.add("right");
            });
            const ok = oi === item.a;
            if (!ok) b.classList.add("wrong");
            fb.textContent = (ok ? "Correct. " : "Not quite. ") + item.e;
            answered++;
            if (ok) correct++;
            if (answered === set.length) score.textContent = `Your score: ${correct} / ${set.length}`;
          });
          opts.append(b);
        });
        wrap.append(p, opts, fb);
        box.append(wrap);
      });
      box.append(score);
    });
  }

  /* 6 · contact form ----------------------------------------------------- */
  function initContactForm() {
    const form = $("#contact-form");
    if (!form) return;
    const status = $("#form-status");
    const msg = $("#message");
    const counter = $("#msg-count");
    const MIN = 20, MAX = 800;

    const rules = {
      name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name (at least 2 characters)."),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address, such as name@example.com."),
      subject: (v) => (v ? "" : "Please choose a subject."),
      message: (v) => (v.trim().length < MIN ? `Your message needs at least ${MIN} characters.` : v.length > MAX ? `Please keep your message under ${MAX} characters.` : "")
    };

    function validateField(input) {
      const field = input.closest(".field");
      const err = rules[input.name] ? rules[input.name](input.value) : "";
      field.classList.toggle("invalid", !!err);
      input.setAttribute("aria-invalid", err ? "true" : "false");
      const p = $(".err", field);
      if (p) p.textContent = err;
      return !err;
    }

    $$("input[name], select[name], textarea[name]", form).forEach((el) => {
      if (!rules[el.name]) return;
      el.addEventListener("blur", () => validateField(el));
      el.addEventListener("input", () => { if (el.closest(".field").classList.contains("invalid")) validateField(el); });
    });
    msg.addEventListener("input", () => { counter.textContent = `${msg.value.length} / ${MAX}`; });

    function show(kind, html) {
      status.className = "form-status show " + kind;
      status.innerHTML = html;
      status.focus();
    }
    const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if ($("#website", form).value) return; // honeypot
      const fields = $$("input[name], select[name], textarea[name]", form).filter((el) => rules[el.name]);
      const results = fields.map(validateField);
      if (results.includes(false)) {
        const first = fields[results.indexOf(false)];
        show("bad", "<p><strong>Please fix the highlighted fields</strong> and try again.</p>");
        first.focus();
        return;
      }
      const data = { name: form.name.value.trim(), email: form.email.value.trim(), subject: form.subject.value, message: form.message.value.trim() };

      if (CFG.formEndpoint) {
        try {
          const res = await fetch(CFG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
          if (!res.ok) throw new Error(res.status);
          show("ok", `<p><strong>Thank you, ${esc(data.name)}!</strong> Your message was sent.</p>`);
          form.reset(); counter.textContent = `0 / ${MAX}`;
        } catch (err) {
          show("bad", "<p><strong>Sorry, the message could not be sent.</strong> Please check your connection and try again.</p>");
        }
        return;
      }

      // No backend: open the visitor's email app with the message filled in.
      const to = isPlaceholder(CFG.email) ? "" : CFG.email;
      const body = `${data.message}\n\n— ${data.name} (${data.email})`;
      const href = `mailto:${to}?subject=${encodeURIComponent("[" + data.subject + "] Technical Writing website")}&body=${encodeURIComponent(body)}`;
      show("ok",
        `<p><strong>Thank you, ${esc(data.name)}. Your message is ready.</strong></p>` +
        `<p>This website has no mail server, so nothing has been sent yet. Choose an option below to send it.</p>` +
        `<p class="btn-row" style="margin-top:.6rem">` +
        `<a class="btn btn-primary btn-small" id="mailto-go" href="${href}">Open in my email app</a>` +
        `<button type="button" class="btn btn-ghost btn-small" id="copy-msg">Copy message</button></p>` +
        (to ? "" : `<p class="hint">The recipient address is still a placeholder. Set <code>email</code> in <code>js/config.js</code>.</p>`));
      const copy = $("#copy-msg");
      copy.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(body); copy.textContent = "Copied!"; }
        catch (_) { copy.textContent = "Copy failed — select the text manually"; }
      });
    });
  }

  /* 7 · back-to-top ------------------------------------------------------ */
  function initToTop() {
    const b = $(".to-top");
    if (!b) return;
    window.addEventListener("scroll", () => b.classList.toggle("show", window.scrollY > 700), { passive: true });
    b.addEventListener("click", () => window.scrollTo({ top: 0 }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    fillConfig(); initNav(); initToc(); initAbcFilter(); initQuizzes(); initContactForm(); initToTop();
  });
})();
