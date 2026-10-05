/* The JAH Network nav — canonical order. The current site appears ONLY as the
   bottom "YOU ARE HERE" pill (never duplicated in the numbered list). */
(function () {
  "use strict";
  var SITES = [
    [1, "Signature Math", "signature-math"],
    [2, "Signature Universal Paradox Immune Calculator", "jah-calculator"],
    [3, "The Signature Dictionary", "jah-dictionary"],
    [4, "JAH Wiki", "jah-wiki"],
    [5, "JAH-N Wiki Leaks", "jah-n-wiki-leaks"],
    [6, "Signature Llama", "signature-llama"],
    [7, "The Signature AI Phone Book", "jah-ai-models"],
    [8, "Globally Rejustered Patent Catalog", "cyber-patent-catalog"],
    [9, "Signature Spec Catalog Pending Patents", "signature-one-archive"],
    [10, "The Signature PC System Depository", "jah-computer-systems"],
    [11, "The Signature Book Depository", "signature-books"],
    [12, "The Signature Comic Store", "signature-comics"],
    [13, "The Signature Global Newspaper Archive", "signature-newspapers"],
    [14, "The Signature AI Mix and Match Generator", "signature-backend"],
    [15, "The Signature Boundless Generator Archive", "signature-boundless-generators"],
    [16, "The Signature AI Mix Lab", "signature-ai-mixlab"],
    [17, "AI Olympics", "signature-ai-olypics"],
    [18, "The Signature Computer Chip Maker and Archive", "signature-chip-maker"],
    [19, "The Signature App Archive", "signature-app-archive"],
    [20, "The Signature AI Robot Matcher", "signature-ai-robot-matcher"],
    [21, "The Signature Experiment Solver", "signature-experiment-solver"],
    [22, "Signature AI Pixel", "signature-ai-image-video-maker"],
    [23, "Signature Music Studio", "signature-ai-song-maker"],
    [24, "The Signature Mr Fix-It", "signature-fixit"],
    [25, "Signature University", "signature-university"],
    [26, "The Signature Cyber Mega-Mall", "signature-cyber-mega-mall"],
    [27, "The Signature 3D Print Mega Mall", "signature-3d-print"],
    [28, "Signature Earth", "signature-earth"],
    [29, "The Signature Flight School", "signature-flight-school"],
    [31, "The Signature Website Creator", "signature-website-creator"],
    [32, "The Signature Antivirus", "signature-antivirus"],
    [33, "The Signature OS Updater", "signature-os-updater"],
    [34, "Signature Space Mapping", "signature-space-mapping"],
    [35, "The Signature Cookbook", "signature-cookbook"]
  ];
  function url(repo) { return "https://justinahiggins614-cmyk.github.io/" + repo + "/"; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function buildNetNav(el) {
    if (!el) return;
    el.innerHTML = SITES.map(function (s) {
      return '<li><a href="' + url(s[2]) + '">' + s[0] + ". " + esc(s[1]) + "</a></li>";
    }).join("");
  }
  window.JahNet = { sites: SITES, url: url, buildNetNav: buildNetNav };
  if (window.GameCatalog) window.GameCatalog.buildNetNav = buildNetNav; // bridge
})();
