// ==UserScript==
// @name        wik
// @namespace   https://samswartzberg.com
// @version     0.0.1
// @description userscripts that work on mediawiki and similar sites
// @author      https://samswartzberg.com
// @match       https://*.wikipedia.org/wiki/*
// @match       https://*.wiktionary.org/wiki/*
// @match       https://*.glottopedia.org/*
// @grant       none
// @updateURL   https://raw.githack.com/SamuelSwartzberg/userscripts/master/wik/dist/bundle.user.js
// @downloadURL https://raw.githack.com/SamuelSwartzberg/userscripts/master/wik/dist/bundle.user.js
// ==/UserScript==
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
let wordClassList = [
  "Noun",
  "Adjective",
  "Verb",
  "Counter",
  "Suffix",
  "Particle",
];
let wordInfoList = [
  "Synonyms",
  "Antonyms",
  "Derived_terms",
  "Related_terms",
  "Translations",
];
let wordParallelList = [
  "Etymology",
  "Pronunciation",
  "Further_reading",
  "Anagrams",
];

window.pViewHtml = document.querySelector("#p-views").innerHTML;
function restorePViewsFromWikiScriptDeletion() {
  window.setTimeout(
    () => (document.querySelector("#p-views").innerHTML = window.pViewHtml),
    1000
  );
}

function getCollisionNodeOrHigher(colisionNode) {
  console.log(colisionNode);
  let selector = "";
  for (let i = 1; i <= colisionNode; i++) selector = selector + "h" + i + ",";
  return selector.slice(0, -1);
}
function isAcceptableLanguage(lang) {
  let accLangArr = ["German", "English", "Japanese"];
  return accLangArr.includes(lang);
}
function supercedeWithSection(item) {
  let colisionNode = getCollisionNodeOrHigher(item.nodeName.slice(1, 2));
  console.log(item);
  let id;
  if (
    item.childNodes[1] &&
    item.childNodes[1].nodeName === "SPAN" &&
    item.childNodes[1].classList.contains("mw-headline")
  )
    id = item.childNodes[1].id;
  else id = item.firstElementChild.id;
  let isH2Parent = false;
  let currentItem = item;
  let itemArrayUntlNextHeading = [];

  do {
    itemArrayUntlNextHeading.push(currentItem);
    if (!currentItem.nextElementSibling) break;
    currentItem = currentItem.nextElementSibling;
    if (currentItem.nodeName === "H2") isH2Parent = true;
  } while (!currentItem.matches(colisionNode));
  console.log(itemArrayUntlNextHeading);
  let section = document.createElement("SECTION");
  section.id = id;
  if (wordClassList.some((wordClass) => id.includes(wordClass)))
    section.classList.add("word-container");
  if (wordInfoList.some((wordInfo) => id.includes(wordInfo)))
    section.classList.add("word-info");
  if (wordParallelList.some((wordParallel) => id.includes(wordParallel)))
    section.classList.add("word-parallel");
  if (isH2Parent) section.classList.add("language-container");
  if (
    document.domain.includes("wikt") &&
    item.nodeName.slice(1, 2) == 2 &&
    !isAcceptableLanguage(id)
  ) {
    console.log("yo");
    section.classList.add("hide-default");
  }
  itemArrayUntlNextHeading.forEach((element) =>
    section.append(element.cloneNode(true))
  );
  item.after(section);
  itemArrayUntlNextHeading.forEach((element) => element.remove());
}

function sectionify() {
  document.querySelectorAll("#bodyContent h5").forEach(supercedeWithSection);
  document.querySelectorAll("#bodyContent h4").forEach(supercedeWithSection);
  document.querySelectorAll("#bodyContent h3").forEach(supercedeWithSection);
  document
    .querySelectorAll("#bodyContent h2:not(#mw-toc-heading)")
    .forEach(supercedeWithSection);
}

(function () {
  "use strict";
  restorePViewsFromWikiScriptDeletion();
  window.setInterval(restorePViewsFromWikiScriptDeletion, 3000);
  sectionify();

  // hide transcriptions
  /* document.querySelectorAll(".mention-gloss-paren.annotation-paren").forEach(node => {
    if (node.innerText === "(" &&
      node.nextElementSibling.querySelector(".mention-tr")) {
      if (node.nextElementSibling.nextElementSibling.innerText === ")") {
        node.style.display = "none";
        node.nextElementSibling.nextElementSibling.style.display = "none";
      }
      if (node.nextElementSibling.nextSibling.textContent.includes(",")) {
        node.nextElementSibling.nextSibling.textContent = "";
      }
    }
  })*/
  if (document.location.search.includes("iframe=true")) {
    console.log("In iframe");
    document
      .querySelectorAll("[href]")
      .forEach((link) => (link.href += "?iframe=true"));
  }
  // make ruby copypastable
  document.querySelectorAll(".Jpan.headword").forEach((item) => {
    let rubytext = "";
    for (let node of item.childNodes) {
      if (node.nodeName.includes("#text")) rubytext += node.textContent;
      if (node.nodeName.includes("RUBY")) {
        let rtchild = node.querySelector("rt");
        rtchild.innerHTML = rtchild.textContent;
        rubytext += node.innerHTML;
      }
    }
    item.onclick = (e) => {
      window.prompt("Copy ruby text", item.innerHTML);
    };
  });

  // propagate heading on scroll

  const sections = document.querySelectorAll("section");
  let lastTime;
  document.addEventListener("scroll", (e) => {
    if (Date.now() - lastTime < 50) {
      return;
    } else {
      lastTime = Date.now();
    }
    for (let sect of sections) {
      const rect = sect.getBoundingClientRect();
      if (rect.top > 0 && rect.top < 250) {
        const location = window.location.toString().split("#")[0];
        history.replaceState(null, null, location + "#" + sect.id);
        document
          .querySelectorAll("#toc a")
          .forEach((anchor) =>
            anchor.parentNode.classList.remove("currently-in-view")
          );
        document
          .querySelector(`#toc a[href="#${sect.id}"]`)
          .parentNode.classList.add("currently-in-view");

        break;
      }
    }
  });

  // insert Kanjidamage and jisho if necessary

  function addSection(name, url) {
    let section = document.createElement("SECTION");
    let h2 = document.createElement("H2");
    let iframe = document.createElement("IFRAME");
    h2.textContent = name;
    h2.classList.add("h-n");
    iframe.src = url;
    section.classList.add("language-container", "hide-default");
    section.appendChild(h2);
    section.appendChild(iframe);
    document
      .querySelector(".mw-parser-output")
      .insertBefore(section, document.querySelector("section[id*=Japanese]"));
  }

  if (document.querySelector("[id*=Japanese]")) {
    try {
      let query = document.querySelector("h1").innerText;
      addSection(
        "Jisho",
        "https://jisho.org/search/" + encodeURIComponent(query)
      );
      addSection(
        "Kanjidamage",
        "https://www.kanjidamage.com/kanji/search?utf8=✓&q=" +
          encodeURIComponent(query)
      );
    } catch (e) {
      console.log(e);
    }
  }
})();

/******/ })()
;