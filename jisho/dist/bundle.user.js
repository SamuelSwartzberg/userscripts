// ==UserScript==
// @name        jisho
// @namespace   https://samswartzberg.com
// @version     0.0.1
// @description {}
// @author      https://samswartzberg.com
// @match       https://jisho.org/*
// @grant       none
// @updateURL   https://raw.githack.com/SamuelSwartzberg/userscripts/master/jisho/dist/bundle.user.js
// @downloadURL https://raw.githack.com/SamuelSwartzberg/userscripts/master/jisho/dist/bundle.user.js
// ==/UserScript==
/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
(function () {
  "use strict";

  document.querySelectorAll(".concept_light-readings").forEach((item, i) => {
    try {
      let furiganaContainer = item.querySelector(".furigana");
      let content = item.querySelector(".text");
      let word = [];
      let furiganaList = furiganaContainer.querySelectorAll("*");
      if (furiganaList.length === 0) {
        return;
      } else {
        var furiganaListIterator = furiganaList.values();
      }
      for (let childNode of content.childNodes) {
        let currentText = childNode.textContent.trim();
        if (currentText === "") continue;
        let currentFurigana = "";
        for (let character of currentText) {
          currentFurigana += furiganaListIterator
            .next()
            .value.textContent.trim();
        }
        if (childNode.nodeName.includes("#text")) {
          word.push({
            kanji: childNode.textContent.trim(),
            furigana: currentFurigana,
          });
        }
        if (childNode.nodeName.includes("SPAN")) {
          word.push({
            kanji: childNode.textContent.trim(),
          });
        }
      }
      console.log(word);
      let htmlstring = "";
      for (let part of word) {
        if (part.furigana) {
          htmlstring += `　${part.kanji}（${part.furigana}）`;
        } else {
          htmlstring += part.kanji;
        }
      }
      item.onclick = () => window.prompt("Copy ruby text", htmlstring);
    } catch (e) {
      console.log(e);
      return;
    }
  });

  document.querySelectorAll(".concept_light").forEach((item, i) => {
    let linklist = item.querySelector(".f-dropdown");
    let withoutFuriganaString = item
      .querySelector(".concept_light-readings .text")
      .textContent.trim();
    linklist.innerHTML =
      `<li><a onclick="window.prompt('copy plain string', '${withoutFuriganaString}')">Copy plain string</a></li>` +
      linklist.innerHTML;
    linklist.innerHTML =
      `<li><a target="_blank" href="https://www.google.com/search?q=${withoutFuriganaString}&tbm=isch&hl=ja">Search JA google images</a></li>` +
      linklist.innerHTML;
    linklist.innerHTML =
      `<li><a target="_blank" href="https://www.google.com/search?q=${withoutFuriganaString}アニメ&tbm=isch&hl=ja">Search JA google images (anime)</a></li>` +
      linklist.innerHTML;
    linklist.innerHTML =
      `<li><a target="_blank" href="https://en.wiktionary.org/wiki/${withoutFuriganaString}#Japanese">wiktionary</a></li>` +
      linklist.innerHTML;
  });

  // Link to up-to-date wiki articles
  document
    .querySelectorAll("[href]")
    .forEach((item) => (item.href = item.href.replace(/\?oldid=\d+/, "")));
})();

/******/ })()
;