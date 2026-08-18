/* ==========================================================
   CROPHEALTH - MULTILINGUAL WIDGET (self-driven translation)
   Include this ONE file on every page:
     <script src="js/gtranslate.js"></script>      (index.html)
     <script src="../js/gtranslate.js"></script>    (pages/*.html)

   It renders a single floating 🌐 icon (bottom-right, same on
   every page) that lets the user pick from English + 19 of the
   22 Scheduled Languages of India (Bodo, Santali and Kashmiri
   are skipped - Google Translate does not yet support them).

   HOW IT WORKS (this is the part that changed):
   Instead of hiding Google's official "Website Translator"
   widget and trying to drive it through a hidden dropdown
   (which many ad-blockers / privacy extensions block outright,
   which is why translation silently did nothing before), this
   version walks the page's own text nodes and translates them
   directly through Google's public translation endpoint. That
   means:
     - No dependency on translate.google.com's widget script
       (the part most commonly blocked).
     - No cookies, no page reload needed to switch languages.
     - Works instantly on repeat visits (translations are
       cached in localStorage per language).
     - Anything you inject dynamically afterwards (scan
       results, history entries, voice answers) can be
       translated on demand by calling
       window.retranslateDynamicContent().
   ========================================================== */

(function () {

    // ----------------------------------------------------------
    // 1. LANGUAGE LIST  (code -> native name)
    //    Codes match Google Translate's own ISO/BCP-47 codes.
    // ----------------------------------------------------------
    const LANGUAGES = [
        { code: "en", name: "English" },
        { code: "hi", name: "हिन्दी (Hindi)" },
        { code: "bn", name: "বাংলা (Bengali)" },
        { code: "te", name: "తెలుగు (Telugu)" },
        { code: "mr", name: "मराठी (Marathi)" },
        { code: "ta", name: "தமிழ் (Tamil)" },
        { code: "gu", name: "ગુજરાતી (Gujarati)" },
        { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
        { code: "ml", name: "മലയാളം (Malayalam)" },
        { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
        { code: "or", name: "ଓଡ଼ିଆ (Odia)" },
        { code: "as", name: "অসমীয়া (Assamese)" },
        { code: "ur", name: "اردو (Urdu)" },
        { code: "sa", name: "संस्कृतम् (Sanskrit)" },
        { code: "mai", name: "मैथिली (Maithili)" },
        { code: "gom", name: "कोंकणी (Konkani)" },
        { code: "doi", name: "डोगरी (Dogri)" },
        { code: "mni-Mtei", name: "মৈতৈলোন্ (Manipuri)" },
        { code: "sd", name: "سنڌي (Sindhi)" },
        { code: "ne", name: "नेपाली (Nepali)" }
    ];

    const STORAGE_KEY = "cropHealthLangCode";
    const CONCURRENCY = 5; // how many translation requests run in parallel

    // Text nodes we've already seen on this page, mapped to their
    // ORIGINAL English text, so we can always translate from the
    // true source text and can restore English instantly.
    const originalTextMap = new Map();

    let currentLang = localStorage.getItem(STORAGE_KEY) || "en";
    let isTranslating = false;

    // ----------------------------------------------------------
    // 2. STYLES + FLOATING ICON / PANEL
    // ----------------------------------------------------------
    function injectStyles() {
        const style = document.createElement("style");
        style.textContent = `
            #ch-lang-fab {
                position: fixed;
                bottom: 22px;
                right: 22px;
                width: 52px;
                height: 52px;
                border-radius: 50%;
                background: #2e7d32;
                color: white;
                font-size: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 14px rgba(0,0,0,0.25);
                z-index: 99999;
                border: none;
                transition: transform 0.2s ease;
            }
            #ch-lang-fab:hover { transform: scale(1.08); }
            #ch-lang-fab.loading { animation: ch-lang-spin 1s linear infinite; }
            @keyframes ch-lang-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            #ch-lang-panel {
                position: fixed;
                bottom: 84px;
                right: 22px;
                width: 240px;
                max-height: 340px;
                overflow-y: auto;
                background: white;
                border-radius: 14px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.25);
                z-index: 99999;
                display: none;
                padding: 8px;
            }
            #ch-lang-panel.open { display: block; }

            .ch-lang-option {
                padding: 10px 12px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                color: #333;
            }
            .ch-lang-option:hover { background: #e8f5e9; }
            .ch-lang-option.active {
                background: #2e7d32;
                color: white;
                font-weight: 600;
            }

            body.dark #ch-lang-panel { background: #232323; }
            body.dark .ch-lang-option { color: white; }
            body.dark .ch-lang-option:hover { background: #1f3b1f; }
        `;
        document.head.appendChild(style);
    }

    function buildUI() {
        const fab = document.createElement("button");
        fab.id = "ch-lang-fab";
        fab.title = "Change language / भाषा बदलें";
        fab.textContent = "🌐";

        const panel = document.createElement("div");
        panel.id = "ch-lang-panel";

        LANGUAGES.forEach((lang) => {
            const opt = document.createElement("div");
            opt.className = "ch-lang-option";
            opt.textContent = lang.name;
            opt.dataset.code = lang.code;
            opt.addEventListener("click", () => {
                selectLanguage(lang.code);
                panel.classList.remove("open");
            });
            panel.appendChild(opt);
        });

        fab.addEventListener("click", () => {
            panel.classList.toggle("open");
        });

        document.addEventListener("click", (e) => {
            if (!panel.contains(e.target) && e.target !== fab) {
                panel.classList.remove("open");
            }
        });

        document.body.appendChild(fab);
        document.body.appendChild(panel);

        highlightActive(currentLang);
    }

    function highlightActive(code) {
        document.querySelectorAll(".ch-lang-option").forEach((el) => {
            el.classList.toggle("active", el.dataset.code === code);
        });
    }

    function setLoading(loading) {
        const fab = document.getElementById("ch-lang-fab");
        if (fab) fab.classList.toggle("loading", loading);
    }

    // ----------------------------------------------------------
    // 3. FIND TRANSLATABLE TEXT NODES
    //    Skips <script>/<style>, our own widget UI, and empty
    //    whitespace-only nodes.
    // ----------------------------------------------------------
    function getTextNodes(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;

                const tag = parent.tagName;
                if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") {
                    return NodeFilter.FILTER_REJECT;
                }
                if (parent.closest("#ch-lang-fab, #ch-lang-panel")) {
                    return NodeFilter.FILTER_REJECT;
                }
                if (!node.nodeValue || !node.nodeValue.trim()) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        const nodes = [];
        let n;
        while ((n = walker.nextNode())) nodes.push(n);
        return nodes;
    }

    // Also grab a few common attributes worth translating.
    function getTranslatableAttributes(root) {
        const els = root.querySelectorAll("[placeholder], [title]:not(#ch-lang-fab)");
        const items = [];
        els.forEach((el) => {
            if (el.closest("#ch-lang-fab, #ch-lang-panel")) return;
            if (el.hasAttribute("placeholder")) {
                items.push({ el, attr: "placeholder" });
            }
            if (el.hasAttribute("title")) {
                items.push({ el, attr: "title" });
            }
        });
        return items;
    }

    const originalAttrMap = new Map(); // key: el|attr -> original string

    // ----------------------------------------------------------
    // 4. TRANSLATE TEXT (with localStorage caching)
    // ----------------------------------------------------------
    function getCache(lang) {
        try {
            return JSON.parse(localStorage.getItem("chTransCache_" + lang) || "{}");
        } catch (e) {
            return {};
        }
    }

    function saveCache(lang, cache) {
        try {
            localStorage.setItem("chTransCache_" + lang, JSON.stringify(cache));
        } catch (e) {
            // localStorage full or unavailable - not fatal, just no caching
        }
    }

    async function translateText(text, targetLang, cache) {
        const trimmed = text.trim();
        if (!trimmed) return text;

        if (cache[trimmed]) return cache[trimmed];

        const url =
            "https://translate.googleapis.com/translate_a/single" +
            "?client=gtx&sl=en&tl=" + encodeURIComponent(targetLang) +
            "&dt=t&q=" + encodeURIComponent(trimmed);

        const res = await fetch(url);
        if (!res.ok) throw new Error("Translate request failed: " + res.status);

        const data = await res.json();
        const translated = data[0].map((chunk) => chunk[0]).join("");

        cache[trimmed] = translated;
        return translated;
    }

    async function runWithConcurrency(items, worker, limit) {
        let index = 0;
        async function next() {
            while (index < items.length) {
                const i = index++;
                await worker(items[i]);
            }
        }
        await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
    }

    // ----------------------------------------------------------
    // 5. APPLY TRANSLATION TO THE WHOLE PAGE
    // ----------------------------------------------------------
    async function translateToLanguage(lang) {
        const cache = getCache(lang);
        let cacheDirty = false;

        // --- text nodes ---
        const nodes = getTextNodes(document.body);
        await runWithConcurrency(nodes, async (node) => {
            if (!originalTextMap.has(node)) {
                originalTextMap.set(node, node.nodeValue);
            }
            const original = originalTextMap.get(node);
            if (!original.trim()) return;
            try {
                const before = cache[original.trim()];
                const translated = await translateText(original, lang, cache);
                if (!before) cacheDirty = true;
                node.nodeValue = translated;
            } catch (e) {
                console.warn("CropHealth translate: failed to translate a text node", e);
            }
        }, CONCURRENCY);

        // --- placeholder / title attributes ---
        const attrItems = getTranslatableAttributes(document.body);
        await runWithConcurrency(attrItems, async ({ el, attr }) => {
            const key = el;
            const mapKey = attr === "placeholder" ? "ph" : "ti";
            if (!originalAttrMap.has(key)) originalAttrMap.set(key, {});
            const record = originalAttrMap.get(key);
            if (!(mapKey in record)) {
                record[mapKey] = el.getAttribute(attr);
            }
            const original = record[mapKey];
            if (!original || !original.trim()) return;
            try {
                const before = cache[original.trim()];
                const translated = await translateText(original, lang, cache);
                if (!before) cacheDirty = true;
                el.setAttribute(attr, translated);
            } catch (e) {
                console.warn("CropHealth translate: failed to translate an attribute", e);
            }
        }, CONCURRENCY);

        if (cacheDirty) saveCache(lang, cache);
    }

    function restoreEnglish() {
        originalTextMap.forEach((original, node) => {
            node.nodeValue = original;
        });
        originalAttrMap.forEach((record, el) => {
            if ("ph" in record) el.setAttribute("placeholder", record.ph);
            if ("ti" in record) el.setAttribute("title", record.ti);
        });
    }

    // ----------------------------------------------------------
    // 6. PUBLIC ENTRY POINTS
    // ----------------------------------------------------------
    async function applyLanguage(lang, { silent } = {}) {
        if (isTranslating) return;
        isTranslating = true;
        if (!silent) setLoading(true);

        try {
            if (lang === "en") {
                restoreEnglish();
            } else {
                await translateToLanguage(lang);
            }
            currentLang = lang;
            localStorage.setItem(STORAGE_KEY, lang);
            highlightActive(lang);
        } catch (e) {
            console.warn("CropHealth translate: translation failed", e);
        } finally {
            isTranslating = false;
            if (!silent) setLoading(false);
        }
    }

    function selectLanguage(code) {
        applyLanguage(code);
    }

    // Call this after injecting dynamic content (scan results,
    // history items, voice answers) so it gets translated too.
    // Safe to call even if nothing changed or language is English.
    window.retranslateDynamicContent = function () {
        if (currentLang && currentLang !== "en") {
            applyLanguage(currentLang, { silent: true });
        }
    };

    // ----------------------------------------------------------
    // INIT
    // ----------------------------------------------------------
    document.addEventListener("DOMContentLoaded", () => {
        injectStyles();
        buildUI();

        if (currentLang && currentLang !== "en") {
            applyLanguage(currentLang);
        }
    });

})();
