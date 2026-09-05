/* Language toggle ES (default) / EN — minimal, no dependencies. */
(function () {
  "use strict";

  var body = document.body;
  var btnEs = document.getElementById("btn-es");
  var btnEn = document.getElementById("btn-en");

  function apply(lang) {
    var en = lang === "en";
    body.classList.toggle("en", en);
    document.documentElement.lang = en ? "en" : "es";
    btnEn.classList.toggle("active", en);
    btnEs.classList.toggle("active", !en);
    btnEn.setAttribute("aria-pressed", String(en));
    btnEs.setAttribute("aria-pressed", String(!en));
    try { localStorage.setItem("cv-filo-lang", lang); } catch (e) {}
  }

  function initialLang() {
    var requested = new URLSearchParams(window.location.search).get("lang");
    if (requested === "es" || requested === "en") return requested;
    if (/\/en(\/|$|\.html)/.test(window.location.pathname)) return "en";
    try {
      var saved = localStorage.getItem("cv-filo-lang");
      if (saved === "en" || saved === "es") return saved;
    } catch (e) {}
    return "es";
  }

  btnEs.addEventListener("click", function () { apply("es"); });
  btnEn.addEventListener("click", function () { apply("en"); });

  apply(initialLang());

  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
