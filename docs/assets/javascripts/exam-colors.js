/*
 * Marks <body> with the exam the current page belongs to (data-exam), so the stylesheet can
 * color each exam's pages. The exam is the first path segment that names one of the five tabs.
 */
(function () {
  "use strict";

  var EXAMS = ["bible", "theology", "church-government", "church-history", "sacraments"];

  function mark() {
    var segments = window.location.pathname.split("/");
    var exam = "";
    for (var i = 0; i < segments.length; i++) {
      if (EXAMS.indexOf(segments[i]) >= 0) {
        exam = segments[i];
        break;
      }
    }
    if (exam) document.body.setAttribute("data-exam", exam);
    else document.body.removeAttribute("data-exam");
  }

  // Material's instant navigation swaps pages without a reload; `document$` fires on each one.
  if (window.document$ && window.document$.subscribe) {
    window.document$.subscribe(mark);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mark);
  } else {
    mark();
  }
})();
