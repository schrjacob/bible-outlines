/*
 * Tier filter: show only Tier 1, Tier 2, or Tier 3 content (see "Study in Tiers" in the Exam Guide).
 *
 * Nothing in the Markdown is tagged. Each page is classified here, by rules keyed on the page's
 * <h1>, and the result is written to data-tier attributes on the rendered HTML. To change which tier
 * something belongs to, edit the rules below (not the pages).
 */
(function () {
  "use strict";

  var STORAGE_KEY = "bible-outlines-tier";
  var TIER_NAMES = {
    1: "Tier 1: know cold",
    2: "Tier 2: second pass",
    3: "Tier 3: if time allows",
  };

  // Outlines: the main divisions are Tier 1 for these books...
  var TIER1_OUTLINES = ["Genesis", "Exodus", "Matthew", "John", "Acts", "Romans"];
  // ...and Tier 2 for these. Every other book is a summary book: its one-line summary is Tier 1,
  // and everything else on its page is Tier 3. Second-level outline detail is always Tier 3.
  var TIER2_OUTLINES = [
    "Leviticus", "Numbers", "Deuteronomy", "Isaiah", "Jeremiah", "Ezekiel", "Daniel",
    "Mark", "Luke", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
    "Philippians", "Colossians", "Hebrews", "Revelation",
  ];

  // Pages made of book sections ("Genesis (50)"), keyed by <h1>. `other` is the tier of the
  // non-book sections on the page (0 = always shown).
  var BOOK_PAGES = {
    "The Pentateuch": { other: 3 },
    "Historical Books": { other: 3 },
    "Poetry & Wisdom": { other: 3 },
    "Major Prophets": { other: 3 },
    "Minor Prophets (The Twelve)": { other: 3 },
    "The Gospels": { other: 2 }, // distinctives of the four Gospels
    "Acts": { other: 2 }, // the sermons of Acts
    "Pauline Epistles": { other: 3 },
    "General Epistles & Revelation": { other: 3 },
  };

  // Reference pages, keyed by <h1>.
  //   tier:  default tier for the page
  //   h2:    [regex, tier] overrides by <h2> text; h3: the same by <h3> text
  //   star:  tier for table rows marked with a star (Chapell's own list); other rows get `rest`
  var REFERENCE_PAGES = {
    "Exam Guide": { tier: 0 }, // the Tier admonitions are matched by title, below
    "Whole Bible": { tier: 1 },
    "Old Testament": { tier: 1, h2: [[/^Hebrew Divisions/, 3]] },
    "New Testament": { tier: 1 },
    "OT Timeline & Covenants": { tier: 1 },
    "OT Key Passages & Events": { tier: "star", star: 1, rest: 3 },
    "OT People & Places": { tier: 3, h2: [[/^Key People/, "star"]], star: 2, rest: 3 },
    "NT People & Places": { tier: 3, h2: [[/^Key People/, "star"]], star: 2, rest: 3 },
    "NT Key Passages": { tier: 1 },
    "NT Key Topics": { tier: 2 },
    "Life of Paul & Missionary Journeys": { tier: 2, h3: [[/^Why the Order Matters/, 3]] },
    "Life of Christ": { tier: 3, h2: [[/Parables|Miracles/, 2]] },
  };

  var BOOK_HEADING = /\(\d+(?: \+ \d+)?\)\s*$/;

  function text(el) {
    return (el.textContent || "").replace(/¶/g, "").trim();
  }

  function outlineTier(book) {
    if (TIER1_OUTLINES.indexOf(book) >= 0) return 1;
    if (TIER2_OUTLINES.indexOf(book) >= 0) return 2;
    return 3;
  }

  // The italic line under a book heading, e.g. "*The Book of Beginnings*".
  function isSubtitle(p) {
    var first = p.firstChild;
    return first && first.nodeType === 1 && first.tagName === "EM";
  }

  function setTier(el, tier) {
    el.setAttribute("data-tier", String(tier));
  }

  // Tier 1 or 2 or 3 for a list item by depth: depth 1 = the book's main divisions.
  function tagList(list, topTier, depth) {
    Array.prototype.forEach.call(list.children, function (li) {
      if (li.tagName !== "LI") return;
      setTier(li, depth === 1 ? topTier : 3);
      Array.prototype.forEach.call(li.children, function (child) {
        if (child.tagName === "UL" || child.tagName === "OL") tagList(child, topTier, depth + 1);
      });
    });
  }

  function tagTable(wrapper, table, tierFor) {
    var rows = table.querySelectorAll("tbody tr");
    Array.prototype.forEach.call(rows, function (tr) {
      setTier(tr, tierFor(tr));
    });
    setTier(wrapper, "table");
  }

  function lookup(rules, str) {
    for (var i = 0; rules && i < rules.length; i++) {
      if (rules[i][0].test(str)) return rules[i][1];
    }
    return null;
  }

  // Walk the article and write data-tier on every unit that can be hidden on its own.
  function classify(article) {
    var h1 = article.querySelector("h1");
    var title = h1 ? text(h1) : "";
    var bookPage = BOOK_PAGES[title];
    var ref = REFERENCE_PAGES[title];
    if (!bookPage && !ref) return false;

    var h2 = "";
    var h3 = "";
    var book = null; // current book section, if any
    var found = false;

    Array.prototype.forEach.call(article.children, function (el) {
      var tag = el.tagName;

      if (tag === "H2" || tag === "H3") {
        var heading = text(el);
        if (tag === "H2") { h2 = heading; h3 = ""; } else { h3 = heading; }
        if (bookPage && BOOK_HEADING.test(heading)) {
          book = heading.replace(/\s*\(.*\)\s*$/, "");
          h3 = "";
        } else if (tag === "H2") {
          book = null;
        }
        return;
      }

      var isWrapped = el.classList && el.classList.contains("md-typeset__scrollwrap");
      var table = tag === "TABLE" ? el : isWrapped ? el.querySelector("table") : null;
      var isList = tag === "UL" || tag === "OL";
      var isAdmonition = el.classList && (el.classList.contains("admonition") || tag === "DETAILS");
      var isBlock = isList || table || isAdmonition || tag === "P";
      if (!isBlock) return;

      var tier;
      if (isAdmonition && title === "Exam Guide") {
        var m = /^Tier ([123])/.exec(text(el.querySelector(".admonition-title, summary") || el));
        tier = m ? Number(m[1]) : 0;
      } else if (book) {
        var inOutline = !h3 || /^Outline/i.test(h3);
        var topTier = outlineTier(book);
        if (isList && inOutline) {
          tagList(el, topTier, 1);
          found = true;
          return;
        }
        tier = tag === "P" && !h3 && isSubtitle(el) ? 1 : 3;
      } else {
        var rules = bookPage ? { tier: bookPage.other } : ref;
        tier = lookup(rules.h3 && h3 ? rules.h3 : null, h3);
        if (tier === null) tier = lookup(rules.h2, h2);
        if (tier === null) tier = rules.tier;
      }

      if (table) {
        // "star": rows marked ★ are Chapell's own list; the rest are follow-ups.
        tagTable(el, table, function (tr) {
          if (tier !== "star") return tier;
          return text(tr).indexOf("★") >= 0 ? ref.star : ref.rest;
        });
      } else if (isList && tier !== 0) {
        Array.prototype.forEach.call(el.querySelectorAll("li"), function (li) { setTier(li, tier); });
      } else {
        setTier(el, tier === "star" ? 3 : tier);
      }
      found = true;
    });

    return found;
  }

  // ---- Filtering ----

  function currentTier() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return v === "1" || v === "2" || v === "3" ? Number(v) : 0;
    } catch (e) {
      return 0;
    }
  }

  function saveTier(tier) {
    try { localStorage.setItem(STORAGE_KEY, String(tier)); } catch (e) { /* private mode */ }
  }

  function clear(article) {
    Array.prototype.forEach.call(article.querySelectorAll(".tier-hidden, .tier-context, .tier-match"), function (el) {
      el.classList.remove("tier-hidden", "tier-context", "tier-match");
    });
    Array.prototype.forEach.call(document.querySelectorAll(".md-nav__item.tier-hidden"), function (el) {
      el.classList.remove("tier-hidden");
    });
    var old = article.querySelector(".tier-banner");
    if (old) old.remove();
  }

  // Is this tiered element shown for tier T? Items outside T stay as dimmed context when
  // something inside them is in T (e.g. a Tier 2 chapter heading above a Tier 3 sub-point).
  function listVisible(li, T) {
    var childLists = Array.prototype.filter.call(li.children, function (c) {
      return c.tagName === "UL" || c.tagName === "OL";
    });
    var anyChild = false;
    childLists.forEach(function (list) {
      Array.prototype.forEach.call(list.children, function (child) {
        if (child.tagName === "LI" && listVisible(child, T)) anyChild = true;
      });
    });
    var tier = Number(li.getAttribute("data-tier"));
    var match = tier === T || tier === 0;
    if (match) li.classList.add("tier-match");
    else if (anyChild) li.classList.add("tier-context");
    else li.classList.add("tier-hidden");
    return match || anyChild;
  }

  function blockVisible(el, T) {
    var kind = el.getAttribute("data-tier");
    if (kind === "table") {
      var rows = el.querySelectorAll("tbody tr");
      var any = false;
      Array.prototype.forEach.call(rows, function (tr) {
        var rowTier = Number(tr.getAttribute("data-tier"));
        var show = rowTier === T || rowTier === 0;
        tr.classList.toggle("tier-hidden", !show);
        if (show) any = true;
      });
      el.classList.toggle("tier-hidden", !any);
      return any;
    }
    if (el.tagName === "UL" || el.tagName === "OL") {
      var anyLi = false;
      Array.prototype.forEach.call(el.children, function (li) {
        if (li.tagName === "LI" && listVisible(li, T)) anyLi = true;
      });
      el.classList.toggle("tier-hidden", !anyLi);
      return anyLi;
    }
    var show = Number(kind) === T || Number(kind) === 0;
    el.classList.toggle("tier-hidden", !show);
    return show;
  }

  function apply() {
    var article = document.querySelector("article.md-content__inner");
    if (!article) return;
    clear(article);

    var T = currentTier();
    var tiered = article.getAttribute("data-tiered") === "1";
    updateControl(T, tiered);
    if (!T || !tiered) return;

    // Show or hide each block, then hide headings with nothing visible beneath them.
    var kids = Array.prototype.filter.call(article.children, function (el) {
      return /^(H[1-6]|P|UL|OL|TABLE|DIV|DETAILS)$/.test(el.tagName);
    });
    var visible = kids.map(function (el) {
      if (/^H[1-6]$/.test(el.tagName)) return null;
      if (!el.hasAttribute("data-tier") && !el.querySelector("[data-tier]")) return true;
      return blockVisible(el, T);
    });

    var shown = 0;
    kids.forEach(function (el, i) {
      var m = /^H([2-6])$/.exec(el.tagName);
      if (!m) {
        if (visible[i] && (el.hasAttribute("data-tier") || el.querySelector("[data-tier]"))) shown++;
        return;
      }
      var level = Number(m[1]);
      var any = false;
      for (var j = i + 1; j < kids.length; j++) {
        var n = /^H([1-6])$/.exec(kids[j].tagName);
        if (n && Number(n[1]) <= level) break;
        if (visible[j] && !n) any = true;
      }
      el.classList.toggle("tier-hidden", !any);
      var link = document.querySelector('.md-sidebar--secondary a.md-nav__link[href$="#' + el.id + '"]');
      if (link && link.parentElement) link.parentElement.classList.toggle("tier-hidden", !any);
    });

    var banner = document.createElement("div");
    banner.className = "tier-banner tier-banner--" + T + (shown ? "" : " tier-banner--empty");
    banner.textContent = shown
      ? "Showing only " + TIER_NAMES[T] + ". Faded lines are context for the items beneath them."
      : "Nothing on this page is " + TIER_NAMES[T].split(":")[0] + ".";
    var h1 = article.querySelector("h1");
    if (h1) h1.insertAdjacentElement("afterend", banner);
  }

  // ---- Control ----

  function buildControl() {
    var bar = document.querySelector(".tier-control");
    if (bar) return bar;
    bar = document.createElement("div");
    bar.className = "tier-control";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Filter by study tier");
    [[0, "All"], [1, "Tier 1"], [2, "Tier 2"], [3, "Tier 3"]].forEach(function (pair) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "tier-control__btn tier-control__btn--" + pair[0];
      b.setAttribute("data-tier-value", String(pair[0]));
      b.textContent = pair[1];
      if (pair[0]) b.title = TIER_NAMES[pair[0]];
      b.addEventListener("click", function () {
        saveTier(pair[0]);
        apply();
      });
      bar.appendChild(b);
    });
    document.body.appendChild(bar);
    return bar;
  }

  function updateControl(T, tiered) {
    var bar = buildControl();
    bar.classList.toggle("tier-control--idle", !tiered);
    Array.prototype.forEach.call(bar.querySelectorAll("button"), function (b) {
      var on = Number(b.getAttribute("data-tier-value")) === T;
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function init() {
    var article = document.querySelector("article.md-content__inner");
    if (!article) return;
    if (!article.hasAttribute("data-tiered")) {
      article.setAttribute("data-tiered", classify(article) ? "1" : "0");
    }
    apply();
  }

  // Material's instant navigation swaps pages without a reload; `document$` fires on each one.
  if (window.document$ && window.document$.subscribe) {
    window.document$.subscribe(init);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
