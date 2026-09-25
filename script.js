/* =========================================================
   SKILLORA - MAIN JAVASCRIPT
   Typing + Study / Notes Platform
   Single index.html + Separate Feature Pages
   Static Hosting Compatible
   ========================================================= */

(() => {
    "use strict";

    /* =========================================================
       APP STATE
    ========================================================= */

    const App = {
        typing: {
            duration: 60,
            mode: "normal",
            prompt: "",
            started: false,
            finished: false,
            startTime: null,
            elapsed: 0,
            timer: null,
            typedCharacters: 0,
            correctCharacters: 0,
            errors: 0,
            currentIndex: 0
        },

        settings: {
            storageKey: "skillora_progress_v1"
        },

        routing: {
            currentPage: "home",
            initialized: false
        },

        data: {
            defaultPrompts: [
                "Learning to type faster takes consistent practice. Focus on accuracy first and speed will improve naturally with time.",
                "Technology is changing the way we learn, work and communicate. Developing strong digital skills can create better opportunities.",
                "Practice every day and concentrate on maintaining a steady rhythm. Avoid looking at the keyboard while typing.",
                "Programming is a skill that improves through repetition. Write clean code, understand the fundamentals and keep learning.",
                "Small improvements made consistently can produce impressive results. Stay focused, practice regularly and track your progress."
            ]
        }
    };


    /* =========================================================
       DOM HELPERS
    ========================================================= */

    const $ = (selector, parent = document) => {
        try {
            return parent.querySelector(selector);
        } catch {
            return null;
        }
    };

    const $$ = (selector, parent = document) => {
        try {
            return Array.from(parent.querySelectorAll(selector));
        } catch {
            return [];
        }
    };

    const byId = id => document.getElementById(id);

    function setText(elementOrSelector, value) {
        const element =
            typeof elementOrSelector === "string"
                ? $(elementOrSelector)
                : elementOrSelector;

        if (element) {
            element.textContent = value;
        }
    }


    function show(elementOrSelector) {
        const element =
            typeof elementOrSelector === "string"
                ? $(elementOrSelector)
                : elementOrSelector;

        if (!element) return;

        element.hidden = false;
        element.classList.remove("hidden");
        element.style.removeProperty("display");
    }


    function hide(elementOrSelector) {
        const element =
            typeof elementOrSelector === "string"
                ? $(elementOrSelector)
                : elementOrSelector;

        if (!element) return;

        element.hidden = true;
        element.classList.add("hidden");
        element.style.display = "none";
    }


    /* =========================================================
       PAGE ROUTING SYSTEM
       =========================================================
       IMPORTANT:

       Ek hi index.html use hoti hai.

       URL examples:

       #home
       #typing
       #progress
       #challenge
       #achievements
       #programming
       #notes
       #custom

       Sirf selected feature page visible hota hai.
    ========================================================= */

    const PAGE_ALIASES = {
        home: "home",

        practice: "practice",

        typing: "typing",
        test: "typing",

        challenge: "challenge",
        challenges: "challenge",
        daily: "challenge",
        "daily-challenge": "challenge",

        custom: "custom",
        "custom-test": "custom",

        progress: "progress",
        history: "progress",

        achievements: "achievements",
        achievement: "achievements",

        programming: "programming",

        notes: "notes",
        study: "notes"
    };


    function normalizePageName(page) {
        const value = String(page || "")
            .trim()
            .toLowerCase()
            .replace(/^#/, "");

        return PAGE_ALIASES[value] || "home";
    }


    function getRoutePages() {
        const pages = $$("[data-route-page]");

        if (pages.length) {
            return pages;
        }

        return $$(
            "[data-page-content], #page-home, #page-practice, #page-test, #page-typing, #page-challenge, #page-custom, #page-progress, #page-achievements, #page-programming, #page-notes"
        );
    }


    function getPageNameFromElement(element) {
        if (!element) {
            return "";
        }

        return normalizePageName(
            element.dataset.routePage ||
            element.dataset.pageContent ||
            element.id.replace(/^page-/, "")
        );
    }


    function updateNavigationState(page) {
        const normalized =
            normalizePageName(page);

        $$("[data-page]").forEach(link => {
            const linkPage =
                normalizePageName(
                    link.dataset.page ||
                    link.getAttribute("href") ||
                    ""
                );

            const active =
                linkPage === normalized;

            link.classList.toggle(
                "active",
                active
            );

            if (active) {
                link.setAttribute(
                    "aria-current",
                    "page"
                );
            } else {
                link.removeAttribute(
                    "aria-current"
                );
            }
        });


        $$("[data-route-link]").forEach(link => {
            const linkPage =
                normalizePageName(
                    link.dataset.routeLink ||
                    link.getAttribute("href") ||
                    ""
                );

            link.classList.toggle(
                "active",
                linkPage === normalized
            );
        });
    }


    function setPageTitle(page) {
        const normalized =
            normalizePageName(page);

        const titles = {
            home:
                "Skillora — Typing & Study Platform",

            practice:
                "Skillora — Practice",

            typing:
                "Skillora — Typing Test",

            challenge:
                "Skillora — Daily Challenge",

            custom:
                "Skillora — Custom Test",

            progress:
                "Skillora — Progress",

            achievements:
                "Skillora — Achievements",

            programming:
                "Skillora — Programming Typing",

            notes:
                "Skillora — Study Notes"
        };

        const pageElement =
            getRoutePages().find(
                element =>
                    getPageNameFromElement(element) ===
                    normalized
            );

        if (
            pageElement &&
            pageElement.dataset.pageTitle
        ) {
            document.title =
                pageElement.dataset.pageTitle;

            return;
        }

        document.title =
            titles[normalized] ||
            titles.home;
    }


    function showPage(page, options = {}) {
        const normalized =
            normalizePageName(page);

        const pages =
            getRoutePages();

        if (!pages.length) {
            return;
        }

        let matched = false;

        pages.forEach(pageElement => {
            const pageName =
                getPageNameFromElement(
                    pageElement
                );

            const isActive =
                pageName === normalized;

            pageElement.classList.toggle(
                "active-page",
                isActive
            );

            pageElement.setAttribute(
                "aria-hidden",
                isActive
                    ? "false"
                    : "true"
            );

            if (isActive) {
                matched = true;
            }
        });


        /*
         * Agar invalid route aaye,
         * to Home page open hoga.
         */
        if (!matched) {
            pages.forEach(pageElement => {
                const isHome =
                    getPageNameFromElement(
                        pageElement
                    ) === "home";

                pageElement.classList.toggle(
                    "active-page",
                    isHome
                );

                pageElement.setAttribute(
                    "aria-hidden",
                    isHome
                        ? "false"
                        : "true"
                );
            });

            App.routing.currentPage =
                "home";
        } else {
            App.routing.currentPage =
                normalized;
        }


        updateNavigationState(
            App.routing.currentPage
        );

        setPageTitle(
            App.routing.currentPage
        );

        closeMobileMenu();


        if (!options.preserveScroll) {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior:
                    options.instant
                        ? "auto"
                        : "smooth"
            });
        }
    }


    function navigateToPage(
        page,
        options = {}
    ) {
        const normalized =
            normalizePageName(page);

        showPage(
            normalized,
            {
                instant:
                    Boolean(options.instant),
                preserveScroll:
                    Boolean(options.preserveScroll)
            }
        );


        if (
            options.updateHash !== false
        ) {
            const nextHash =
                `#${normalized}`;

            if (
                window.location.hash !==
                nextHash
            ) {
                if (options.replace) {
                    history.replaceState(
                        {
                            page:
                                normalized
                        },
                        "",
                        nextHash
                    );
                } else {
                    history.pushState(
                        {
                            page:
                                normalized
                        },
                        "",
                        nextHash
                    );
                }
            }
        }
    }


    function getInitialPage() {
        const hash =
            window.location.hash
                .replace(/^#/, "")
                .trim();

        if (hash) {
            return normalizePageName(
                hash
            );
        }

        const activePage =
            getRoutePages().find(
                page =>
                    page.classList.contains(
                        "active-page"
                    )
            );

        if (activePage) {
            return getPageNameFromElement(
                activePage
            );
        }

        return "home";
    }


    function initFeaturePages() {
        if (
            App.routing.initialized
        ) {
            return;
        }

        const pages =
            getRoutePages();

        if (!pages.length) {
            return;
        }

        App.routing.initialized =
            true;


        /*
         * Special case:
         * Current HTML mein Custom Test
         * typing route ke andar ho sakta hai.
         *
         * Isko automatically separate
         * Custom page bana dete hain.
         */
        const customTest =
            byId("custom-test");

        if (customTest) {
            customTest.dataset.routePage =
                "custom";
        }


        /*
         * Navigation buttons / links
         */
        $$(
            "a[data-page], button[data-page], [data-route-link]"
        ).forEach(control => {

            if (
                control.dataset
                    .skilloraRouteBound ===
                "true"
            ) {
                return;
            }

            control.dataset
                .skilloraRouteBound =
                "true";


            control.addEventListener(
                "click",
                event => {

                    const requestedPage =
                        control.dataset.page ||
                        control.dataset.routeLink ||
                        control.getAttribute(
                            "href"
                        );

                    if (!requestedPage) {
                        return;
                    }

                    const targetPage =
                        normalizePageName(
                            requestedPage
                        );

                    event.preventDefault();

                    navigateToPage(
                        targetPage
                    );
                }
            );
        });


        /*
         * Browser Back / Forward
         */
        window.addEventListener(
            "popstate",
            () => {
                showPage(
                    getInitialPage(),
                    {
                        instant: true
                    }
                );
            }
        );


        /*
         * Direct hash change
         */
        window.addEventListener(
            "hashchange",
            () => {
                showPage(
                    getInitialPage(),
                    {
                        instant: true
                    }
                );
            }
        );


        /*
         * Initial page
         */
        showPage(
            getInitialPage(),
            {
                instant: true,
                preserveScroll: true
            }
        );
    }


    /* =========================================================
       LOADER
    ========================================================= */

    function removeLoader() {
        const selectors = [
            "#page-loader",
            "#app-loader",
            "#loading-screen",
            "#loader",
            ".page-loader",
            ".app-loader",
            ".loading-screen",
            ".loading-overlay",
            ".loader-overlay"
        ];

        selectors.forEach(selector => {
            $$(selector).forEach(loader => {
                loader.classList.add(
                    "loaded"
                );

                loader.classList.add(
                    "hidden"
                );

                loader.setAttribute(
                    "aria-hidden",
                    "true"
                );

                loader.style.opacity =
                    "0";

                loader.style.visibility =
                    "hidden";

                loader.style.pointerEvents =
                    "none";

                loader.style.display =
                    "none";
            });
        });

        document.documentElement
            .classList.add(
                "app-ready"
            );

        if (document.body) {
            document.body.classList.add(
                "app-ready"
            );
        }
    }


    /* =========================================================
       STORAGE
    ========================================================= */

    function getStoredProgress() {
        try {
            const raw =
                localStorage.getItem(
                    App.settings.storageKey
                );

            if (!raw) {
                return {
                    tests: [],
                    bestWpm: 0,
                    totalTests: 0,
                    streak: 0,
                    lastTestDate: null
                };
            }

            const parsed =
                JSON.parse(raw);

            return {
                tests:
                    Array.isArray(
                        parsed.tests
                    )
                        ? parsed.tests
                        : [],

                bestWpm:
                    Number(
                        parsed.bestWpm
                    ) || 0,

                totalTests:
                    Number(
                        parsed.totalTests
                    ) || 0,

                streak:
                    Number(
                        parsed.streak
                    ) || 0,

                lastTestDate:
                    parsed.lastTestDate ||
                    null
            };

        } catch {
            return {
                tests: [],
                bestWpm: 0,
                totalTests: 0,
                streak: 0,
                lastTestDate: null
            };
        }
    }


    function saveProgress(progress) {
        try {
            localStorage.setItem(
                App.settings.storageKey,
                JSON.stringify(progress)
            );
        } catch {
            /*
             * LocalStorage unavailable ho
             * to application crash nahi karegi.
             */
        }
    }


    /* =========================================================
       UTILITY
    ========================================================= */

    function formatTime(seconds) {
        const safeSeconds =
            Math.max(
                0,
                Math.floor(seconds)
            );

        const minutes =
            Math.floor(
                safeSeconds / 60
            );

        const remainingSeconds =
            safeSeconds % 60;

        return (
            `${String(minutes).padStart(2, "0")}:` +
            `${String(remainingSeconds).padStart(2, "0")}`
        );
    }


    function calculateWPM(
        correctCharacters,
        elapsedSeconds
    ) {
        if (
            !elapsedSeconds ||
            elapsedSeconds <= 0
        ) {
            return 0;
        }

        return Math.max(
            0,
            Math.round(
                (
                    correctCharacters / 5
                ) /
                (
                    elapsedSeconds / 60
                )
            )
        );
    }


    function calculateAccuracy(
        correct,
        total
    ) {
        if (!total) {
            return 100;
        }

        return Math.max(
            0,
            Math.min(
                100,
                Math.round(
                    (
                        correct /
                        total
                    ) * 100
                )
            )
        );
    }


    function todayKey() {
        const date =
            new Date();

        return [
            date.getFullYear(),
            String(
                date.getMonth() + 1
            ).padStart(2, "0"),
            String(
                date.getDate()
            ).padStart(2, "0")
        ].join("-");
    }


    function previousDayKey() {
        const date =
            new Date();

        date.setDate(
            date.getDate() - 1
        );

        return [
            date.getFullYear(),
            String(
                date.getMonth() + 1
            ).padStart(2, "0"),
            String(
                date.getDate()
            ).padStart(2, "0")
        ].join("-");
    }


    function randomItem(array) {
        if (
            !Array.isArray(array) ||
            array.length === 0
        ) {
            return "";
        }

        return array[
            Math.floor(
                Math.random() *
                array.length
            )
        ];
    }


    /* =========================================================
       NORMAL ANCHOR NAVIGATION
    ========================================================= */

    function initNavigation() {
        const navLinks =
            $$('a[href^="#"]');

        navLinks.forEach(link => {

            if (
                link.dataset
                    .skilloraRouteBound ===
                "true"
            ) {
                return;
            }


            /*
             * Feature navigation router
             * already handles these.
             */
            if (
                link.dataset.page ||
                link.dataset.routeLink
            ) {
                return;
            }


            link.addEventListener(
                "click",
                event => {

                    const href =
                        link.getAttribute(
                            "href"
                        );

                    if (
                        !href ||
                        href === "#"
                    ) {
                        return;
                    }


                    /*
                     * Agar #typing / #notes etc.
                     * hai to SPA page open karo.
                     */
                    const hashName =
                        href
                            .replace(
                                /^#/,
                                ""
                            )
                            .toLowerCase();

                    if (
                        PAGE_ALIASES[
                            hashName
                        ]
                    ) {
                        event.preventDefault();

                        navigateToPage(
                            hashName
                        );

                        return;
                    }


                    /*
                     * Normal same-page anchor
                     */
                    const target =
                        $(href);

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start"
                    });

                    closeMobileMenu();
                }
            );
        });
    }


    /* =========================================================
       MOBILE MENU
    ========================================================= */

    function getMobileMenuElements() {
        return {
            menu:
                $(
                    "#mobile-menu, .mobile-menu, .nav-menu, .navigation-menu, #mainNavigation"
                ),

            button:
                $(
                    "#mobile-menu-toggle, #menu-toggle, .menu-toggle, .hamburger, #mobileMenuButton"
                )
        };
    }


    function openMobileMenu() {
        const {
            menu,
            button
        } =
            getMobileMenuElements();

        if (!menu) {
            return;
        }

        menu.classList.add(
            "active"
        );

        menu.classList.add(
            "open"
        );

        menu.setAttribute(
            "aria-expanded",
            "true"
        );

        if (button) {
            button.setAttribute(
                "aria-expanded",
                "true"
            );

            button.classList.add(
                "active"
            );
        }

        document.body.classList.add(
            "menu-open"
        );
    }


    function closeMobileMenu() {
        const {
            menu,
            button
        } =
            getMobileMenuElements();

        if (menu) {
            menu.classList.remove(
                "active"
            );

            menu.classList.remove(
                "open"
            );

            menu.setAttribute(
                "aria-expanded",
                "false"
            );
        }

        if (button) {
            button.setAttribute(
                "aria-expanded",
                "false"
            );

            button.classList.remove(
                "active"
            );
        }

        document.body.classList.remove(
            "menu-open"
        );
    }


    function initMobileMenu() {
        const {
            menu,
            button
        } =
            getMobileMenuElements();

        if (button) {
            button.addEventListener(
                "click",
                () => {

                    if (!menu) {
                        return;
                    }

                    const isOpen =
                        menu.classList.contains(
                            "active"
                        ) ||
                        menu.classList.contains(
                            "open"
                        );

                    if (isOpen) {
                        closeMobileMenu();
                    } else {
                        openMobileMenu();
                    }
                }
            );
        }


        window.addEventListener(
            "resize",
            () => {
                if (
                    window.innerWidth >
                    900
                ) {
                    closeMobileMenu();
                }
            }
        );
    }


    /* =========================================================
       TYPING ELEMENTS
    ========================================================= */

    function getTypingElements() {
        return {
            container:
                $(
                    "#typing-test, .typing-test, #typing-section"
                ),

            input:
                $(
                    "#typing-input, #typingInput, textarea.typing-input, input.typing-input"
                ),

            prompt:
                $(
                    "#typing-prompt, #typingPrompt, .typing-prompt, .prompt-text"
                ),

            startButton:
                $(
                    "#start-test-btn, #startTestBtn, .start-test-btn"
                ),

            restartButton:
                $(
                    "#restart-test-btn, #restartTestBtn, .restart-test-btn"
                ),

            resetButton:
                $(
                    "#reset-test-btn, #resetTestBtn, .reset-test-btn"
                ),

            durationButtons:
                $$("[data-duration]"),

            mode:
                $(
                    "#typing-mode, #typingMode, .typing-mode"
                ),

            liveWpm:
                $(
                    "#live-wpm, #liveWPM, .live-wpm"
                ),

            liveAccuracy:
                $(
                    "#live-accuracy, #liveAccuracy, .live-accuracy"
                ),

            liveErrors:
                $(
                    "#live-errors, #liveErrors, .live-errors"
                ),

            liveTimer:
                $(
                    "#live-timer, #liveTimer, .live-timer"
                ),

            resultSection:
                $(
                    "#typing-results, #test-results, #result-section, .typing-results"
                ),

            resultWpm:
                $(
                    "#result-wpm, #final-wpm, #resultWPM"
                ),

            resultAccuracy:
                $(
                    "#result-accuracy, #final-accuracy, #resultAccuracy"
                ),

            resultErrors:
                $(
                    "#result-errors, #final-errors, #resultErrors"
                ),

            resultCharacters:
                $(
                    "#result-characters, #final-characters, #resultCharacters"
                ),

            resultTime:
                $(
                    "#result-time, #final-time, #resultTime"
                ),

            resultBest:
                $(
                    "#result-best, #personal-best, #resultBest"
                )
        };
    }


    /* =========================================================
       TYPING PROMPT
    ========================================================= */

    function setTypingPrompt(prompt) {
        const elements =
            getTypingElements();

        App.typing.prompt =
            prompt ||
            randomItem(
                App.data.defaultPrompts
            );

        if (!elements.prompt) {
            return;
        }

        elements.prompt.innerHTML =
            "";

        const fragment =
            document.createDocumentFragment();

        Array.from(
            App.typing.prompt
        ).forEach(
            (character, index) => {

                const span =
                    document.createElement(
                        "span"
                    );

                span.textContent =
                    character;

                span.dataset.index =
                    String(index);

                if (index === 0) {
                    span.classList.add(
                        "current"
                    );
                }

                fragment.appendChild(
                    span
                );
            }
        );

        elements.prompt.appendChild(
            fragment
        );
    }


    /* =========================================================
       PROMPT COLORS
    ========================================================= */

    function updatePromptCharacterStates() {
        const elements =
            getTypingElements();

        if (
            !elements.prompt ||
            !elements.input
        ) {
            return;
        }

        const typedText =
            elements.input.value;

        const spans =
            $$(
                "span",
                elements.prompt
            );


        spans.forEach(
            (span, index) => {

                span.classList.remove(
                    "correct",
                    "wrong",
                    "current",
                    "typed"
                );


                /*
                 * Typed characters
                 */
                if (
                    index <
                    typedText.length
                ) {
                    span.classList.add(
                        "typed"
                    );


                    /*
                     * Correct character
                     */
                    if (
                        typedText[index] ===
                        App.typing.prompt[index]
                    ) {
                        span.classList.add(
                            "correct"
                        );
                    }


                    /*
                     * Wrong character = RED
                     */
                    else {
                        span.classList.add(
                            "wrong"
                        );
                    }
                }


                /*
                 * Current character
                 */
                if (
                    index ===
                    typedText.length
                ) {
                    span.classList.add(
                        "current"
                    );
                }
            }
        );


        App.typing.currentIndex =
            Math.min(
                typedText.length,
                App.typing.prompt.length
            );
    }


    /* =========================================================
       LIVE TYPING STATS
    ========================================================= */

    function updateLiveStats() {
        const elements =
            getTypingElements();

        const elapsed =
            App.typing.startTime
                ? Math.max(
                    1,
                    App.typing.elapsed
                )
                : 0;

        const typed =
            elements.input
                ? elements.input.value
                : "";

        let correct = 0;
        let errors = 0;


        for (
            let i = 0;
            i < typed.length;
            i++
        ) {
            if (
                typed[i] ===
                App.typing.prompt[i]
            ) {
                correct++;
            } else {
                errors++;
            }
        }


        App.typing.typedCharacters =
            typed.length;

        App.typing.correctCharacters =
            correct;

        App.typing.errors =
            errors;


        const wpm =
            calculateWPM(
                correct,
                elapsed
            );

        const accuracy =
            calculateAccuracy(
                correct,
                typed.length
            );


        setText(
            elements.liveWpm,
            wpm
        );

        setText(
            elements.liveAccuracy,
            `${accuracy}%`
        );

        setText(
            elements.liveErrors,
            errors
        );

        setText(
            elements.liveTimer,
            formatTime(
                App.typing.elapsed
            )
        );
    }


    /* =========================================================
       RESET TYPING
    ========================================================= */

    function resetTypingState() {
        stopTypingTimer();

        App.typing.started =
            false;

        App.typing.finished =
            false;

        App.typing.startTime =
            null;

        App.typing.elapsed =
            0;

        App.typing.typedCharacters =
            0;

        App.typing.correctCharacters =
            0;

        App.typing.errors =
            0;

        App.typing.currentIndex =
            0;


        const elements =
            getTypingElements();


        if (elements.input) {
            elements.input.value =
                "";

            elements.input.disabled =
                true;

            elements.input.classList.remove(
                "typing-active",
                "has-error"
            );
        }


        updateLiveStats();


        setTypingPrompt(
            App.data.defaultPrompts[0]
        );


        if (elements.resultSection) {
            hide(
                elements.resultSection
            );
        }


        if (elements.startButton) {
            show(
                elements.startButton
            );
        }


        if (elements.restartButton) {
            hide(
                elements.restartButton
            );
        }


        if (elements.resetButton) {
            show(
                elements.resetButton
            );
        }


        elements.durationButtons.forEach(
            button => {

                const duration =
                    Number(
                        button.dataset.duration
                    );

                button.classList.toggle(
                    "active",
                    duration ===
                    App.typing.duration
                );
            }
        );
    }


    /* =========================================================
       START TYPING
    ========================================================= */

    function startTypingTest() {
        const elements =
            getTypingElements();

        if (
            !elements.input ||
            !elements.prompt
        ) {
            return;
        }


        resetTypingState();


        App.typing.started =
            true;

        App.typing.finished =
            false;

        App.typing.startTime =
            Date.now();

        App.typing.elapsed =
            0;


        elements.input.disabled =
            false;

        elements.input.value =
            "";

        elements.input.classList.add(
            "typing-active"
        );


        /*
         * New random prompt
         */
        setTypingPrompt(
            randomItem(
                App.data.defaultPrompts
            )
        );


        /*
         * Start typing directly
         */
        elements.input.focus();


        if (elements.startButton) {
            hide(
                elements.startButton
            );
        }


        if (elements.restartButton) {
            show(
                elements.restartButton
            );
        }


        updateLiveStats();


        stopTypingTimer();


        App.typing.timer =
            window.setInterval(
                () => {

                    if (
                        !App.typing.started
                    ) {
                        return;
                    }


                    App.typing.elapsed =
                        Math.floor(
                            (
                                Date.now() -
                                App.typing.startTime
                            ) / 1000
                        );


                    updateLiveStats();


                    if (
                        App.typing.elapsed >=
                        App.typing.duration
                    ) {
                        finishTypingTest();
                    }

                },
                250
            );
    }


    function stopTypingTimer() {
        if (
            App.typing.timer !==
            null
        ) {
            window.clearInterval(
                App.typing.timer
            );

            App.typing.timer =
                null;
        }
    }


    /* =========================================================
       TYPING INPUT
    ========================================================= */

    function handleTypingInput() {
        const elements =
            getTypingElements();

        if (!elements.input) {
            return;
        }

        if (!App.typing.started) {
            return;
        }


        /*
         * Prompt se zyada characters
         * type nahi karne denge.
         */
        if (
            elements.input.value.length >
            App.typing.prompt.length
        ) {
            elements.input.value =
                elements.input.value.slice(
                    0,
                    App.typing.prompt.length
                );
        }


        updatePromptCharacterStates();

        updateLiveStats();


        /*
         * Full prompt complete
         */
        if (
            elements.input.value.length >=
            App.typing.prompt.length
        ) {
            finishTypingTest();
        }
    }


    /* =========================================================
       FINISH TYPING
    ========================================================= */

    function finishTypingTest() {
        if (
            App.typing.finished
        ) {
            return;
        }


        const elements =
            getTypingElements();


        /*
         * FINAL TIME calculate karo
         * started=false karne se pehle.
         */
        if (App.typing.startTime) {

            const measuredElapsed =
                Math.floor(
                    (
                        Date.now() -
                        App.typing.startTime
                    ) / 1000
                );

            App.typing.elapsed =
                Math.min(
                    App.typing.duration,
                    Math.max(
                        1,
                        measuredElapsed
                    )
                );

        } else {

            App.typing.elapsed =
                Math.max(
                    1,
                    App.typing.elapsed
                );
        }


        updatePromptCharacterStates();

        updateLiveStats();


        App.typing.finished =
            true;

        App.typing.started =
            false;


        stopTypingTimer();


        const elapsed =
            Math.max(
                1,
                App.typing.elapsed
            );


        const wpm =
            calculateWPM(
                App.typing.correctCharacters,
                elapsed
            );


        const accuracy =
            calculateAccuracy(
                App.typing.correctCharacters,
                App.typing.typedCharacters
            );


        const result = {
            id:
                Date.now(),

            date:
                new Date().toISOString(),

            wpm,

            accuracy,

            errors:
                App.typing.errors,

            characters:
                App.typing.typedCharacters,

            time:
                elapsed,

            duration:
                App.typing.duration,

            mode:
                App.typing.mode
        };


        saveTestResult(
            result
        );


        setText(
            elements.resultWpm,
            wpm
        );

        setText(
            elements.resultAccuracy,
            `${accuracy}%`
        );

        setText(
            elements.resultErrors,
            result.errors
        );

        setText(
            elements.resultCharacters,
            result.characters
        );

        setText(
            elements.resultTime,
            formatTime(
                result.time
            )
        );


        const progress =
            getStoredProgress();


        setText(
            elements.resultBest,
            `${progress.bestWpm} WPM`
        );


        if (elements.input) {
            elements.input.disabled =
                true;

            elements.input.classList.remove(
                "typing-active"
            );
        }


        if (elements.resultSection) {
            show(
                elements.resultSection
            );
        }


        if (elements.restartButton) {
            show(
                elements.restartButton
            );
        }
    }


    /* =========================================================
       DURATION
    ========================================================= */

    function selectDuration(
        duration
    ) {
        const safeDuration =
            Number(duration);

        if (
            !Number.isFinite(
                safeDuration
            ) ||
            safeDuration <= 0
        ) {
            return;
        }


        if (
            App.typing.started
        ) {
            return;
        }


        App.typing.duration =
            Math.round(
                safeDuration
            );


        const elements =
            getTypingElements();


        elements.durationButtons.forEach(
            button => {

                const value =
                    Number(
                        button.dataset.duration
                    );

                button.classList.toggle(
                    "active",
                    value ===
                    App.typing.duration
                );
            }
        );


        setText(
            "#selected-duration",
            `${App.typing.duration}s`
        );
    }


    /* =========================================================
       TYPING INIT
    ========================================================= */

    function initTypingTest() {
        const elements =
            getTypingElements();

        if (
            !elements.input &&
            !elements.prompt
        ) {
            return;
        }


        elements.durationButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {
                        selectDuration(
                            button.dataset.duration
                        );
                    }
                );
            }
        );


        if (elements.mode) {
            elements.mode.addEventListener(
                "change",
                () => {
                    App.typing.mode =
                        elements.mode.value ||
                        "normal";
                }
            );
        }


        if (elements.startButton) {
            elements.startButton.addEventListener(
                "click",
                startTypingTest
            );
        }


        if (elements.restartButton) {
            elements.restartButton.addEventListener(
                "click",
                startTypingTest
            );
        }


        if (elements.resetButton) {
            elements.resetButton.addEventListener(
                "click",
                resetTypingState
            );
        }


        if (elements.input) {

            elements.input.addEventListener(
                "input",
                handleTypingInput
            );


            /*
             * Paste bhi prompt length se
             * aage nahi ja sakta.
             */
            elements.input.addEventListener(
                "paste",
                () => {
                    window.setTimeout(
                        handleTypingInput,
                        0
                    );
                }
            );
        }


        resetTypingState();
    }


    /* =========================================================
       SAVE TEST RESULT
    ========================================================= */

    function saveTestResult(result) {
        const progress =
            getStoredProgress();


        progress.tests.unshift(
            result
        );


        /*
         * History max 100 records.
         */
        progress.tests =
            progress.tests.slice(
                0,
                100
            );


        /*
         * Total tests ko lifetime count
         * rakha gaya hai.
         */
        progress.totalTests =
            (
                Number(
                    progress.totalTests
                ) || 0
            ) + 1;


        progress.bestWpm =
            Math.max(
                Number(
                    progress.bestWpm
                ) || 0,

                Number(
                    result.wpm
                ) || 0
            );


        updateStreak(
            progress
        );


        saveProgress(
            progress
        );


        updateProgressUI();
        updateHistoryUI();
        updateHomeStats();
        updateAchievementsUI();
    }


    function updateStreak(progress) {
        const today =
            todayKey();

        const yesterday =
            previousDayKey();


        if (
            progress.lastTestDate ===
            today
        ) {
            return;
        }


        if (
            progress.lastTestDate ===
            yesterday
        ) {
            progress.streak =
                Math.max(
                    1,
                    progress.streak + 1
                );
        } else {
            progress.streak =
                1;
        }


        progress.lastTestDate =
            today;
    }


    /* =========================================================
       PROGRESS
    ========================================================= */

    function updateProgressUI() {
        const progress =
            getStoredProgress();

        const latest =
            progress.tests[0] ||
            null;


        const selectors = {
            bestWpm: [
                "#best-wpm",
                "#progress-best-wpm",
                ".best-wpm"
            ],

            totalTests: [
                "#total-tests",
                "#tests-completed",
                ".total-tests"
            ],

            streak: [
                "#day-streak",
                "#current-streak",
                ".day-streak"
            ],

            currentWpm: [
                "#current-wpm",
                "#latest-wpm",
                ".current-wpm"
            ],

            currentAccuracy: [
                "#current-accuracy",
                "#latest-accuracy",
                ".current-accuracy"
            ]
        };


        selectors.bestWpm.forEach(
            selector => {
                setText(
                    selector,
                    progress.bestWpm
                );
            }
        );


        selectors.totalTests.forEach(
            selector => {
                setText(
                    selector,
                    progress.totalTests
                );
            }
        );


        selectors.streak.forEach(
            selector => {
                setText(
                    selector,
                    progress.streak
                );
            }
        );


        if (latest) {

            selectors.currentWpm.forEach(
                selector => {
                    setText(
                        selector,
                        latest.wpm
                    );
                }
            );


            selectors.currentAccuracy.forEach(
                selector => {
                    setText(
                        selector,
                        `${latest.accuracy}%`
                    );
                }
            );
        }
    }


    /* =========================================================
       HISTORY
    ========================================================= */

    function updateHistoryUI() {
        const progress =
            getStoredProgress();

        const containers = [
            byId("history-list"),
            byId("progress-history"),
            byId("typing-history")
        ].filter(Boolean);


        if (!containers.length) {
            return;
        }


        containers.forEach(
            container => {

                container.innerHTML =
                    "";


                if (
                    progress.tests.length ===
                    0
                ) {
                    const empty =
                        document.createElement(
                            "div"
                        );

                    empty.className =
                        "history-empty";

                    empty.textContent =
                        "Complete a typing test to see your progress here.";

                    container.appendChild(
                        empty
                    );

                    return;
                }


                progress.tests
                    .slice(0, 20)
                    .forEach(test => {

                        const item =
                            document.createElement(
                                "div"
                            );

                        item.className =
                            "history-item";


                        const date =
                            new Date(
                                test.date
                            );


                        item.innerHTML = `
                            <div class="history-main">
                                <strong>${escapeHTML(
                                    String(test.wpm)
                                )} WPM</strong>

                                <span>${escapeHTML(
                                    String(test.accuracy)
                                )}% accuracy</span>
                            </div>

                            <div class="history-meta">
                                <span>${escapeHTML(
                                    String(test.errors)
                                )} errors</span>

                                <span>${escapeHTML(
                                    formatTime(test.time)
                                )}</span>

                                <span>${escapeHTML(
                                    date.toLocaleDateString()
                                )}</span>
                            </div>
                        `;


                        container.appendChild(
                            item
                        );
                    });
            }
        );
    }


    function escapeHTML(value) {
        return String(value)
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );
    }


    /* =========================================================
       ACHIEVEMENTS
    ========================================================= */

    function updateAchievementsUI() {
        const progress =
            getStoredProgress();

        const bestWpm =
            Number(
                progress.bestWpm
            ) || 0;

        const totalTests =
            Number(
                progress.totalTests
            ) || 0;

        const tests =
            progress.tests || [];


        const has95Accuracy =
            tests.some(
                test =>
                    Number(
                        test.accuracy
                    ) >= 95
            );


        const achievementState = {
            "speed-60":
                bestWpm >= 60,

            "speed-80":
                bestWpm >= 80,

            "accuracy-95":
                has95Accuracy,

            "tests-10":
                totalTests >= 10
        };


        Object.entries(
            achievementState
        ).forEach(
            ([achievement, unlocked]) => {

                $$(
                    `[data-achievement="${achievement}"]`
                ).forEach(card => {

                    card.classList.toggle(
                        "unlocked",
                        unlocked
                    );


                    const status =
                        $(".achievement-status", card);

                    if (status) {
                        status.textContent =
                            unlocked
                                ? "Unlocked"
                                : "Locked";
                    }
                });
            }
        );
    }


    /* =========================================================
       NOTES DATA
    ========================================================= */

    const notes = [
        {
            title:
                "Computer Networks",
            category:
                "Computer Networks",
            file:
                "COMPUTER NETWORKS.pdf"
        },

        {
            title:
                "CSS",
            category:
                "Web Development",
            file:
                "CSS.pdf"
        },

        {
            title:
                "Data Engineering",
            category:
                "Data Engineering",
            file:
                "Data Engineering.pdf"
        },

        {
            title:
                "Data Structures Through Python",
            category:
                "Data Structures",
            file:
                "DATA STRUCTURES THROUGH PYTHON.pdf"
        },

        {
            title:
                "DBMS",
            category:
                "DBMS",
            file:
                "DBMS.pdf"
        },

        {
            title:
                "HTML Tutorial",
            category:
                "Web Development",
            file:
                "html_tutorial.pdf"
        },

        {
            title:
                "Java Programming",
            category:
                "Java",
            file:
                "Java Programming.pdf"
        },

        {
            title:
                "JavaScript Notes",
            category:
                "Web Development",
            file:
                "JS Notes.pdf"
        },

        {
            title:
                "OOP Using C++",
            category:
                "C / C++",
            file:
                "OOP USING C++.pdf"
        },

        {
            title:
                "Operating Systems",
            category:
                "Operating Systems",
            file:
                "OPERATING SYSTEMS.pdf"
        },

        {
            title:
                "Programming in C",
            category:
                "C / C++",
            file:
                "PROGRAMMING IN C.pdf"
        },

        {
            title:
                "Python Programming Notes",
            category:
                "Python",
            file:
                "PYTHON PROGRAMMING NOTES.pdf"
        },

        {
            title:
                "Software Engineering",
            category:
                "Software Engineering",
            file:
                "SOFTWARE ENGINEERING.pdf"
        },

        {
            title:
                "SQL Manual",
            category:
                "SQL",
            file:
                "SQL-Manual.pdf"
        },

        {
            title:
                "Web Development",
            category:
                "Web Development",
            file:
                "WEB DEVELOPMENT.pdf"
        }
    ];


    /* =========================================================
       NOTES ELEMENTS
    ========================================================= */

    function getNotesElements() {
        return {
            grid:
                $(
                    "#notes-grid, #notes-container, .notes-grid"
                ),

            search:
                $(
                    "#notes-search, #note-search, .notes-search"
                ),

            category:
                $(
                    "#notes-category, #category-filter, .category-filter"
                ),

            empty:
                $(
                    "#notes-empty, .notes-empty"
                ),

            viewer:
                $(
                    "#pdf-viewer, #notes-viewer, .pdf-viewer"
                ),

            frame:
                $(
                    "#pdf-frame, #pdf-viewer-frame, iframe.pdf-frame"
                ),

            viewerTitle:
                $(
                    "#pdf-title, #viewer-title"
                ),

            closeViewer:
                $(
                    "#close-pdf, #close-viewer, .close-pdf"
                ),

            downloadButton:
                $(
                    "#download-pdf, #download-note, .download-pdf"
                )
        };
    }


    function getNotesBasePath() {
        return "assets/notes/";
    }


    /* =========================================================
       NOTE CARD
    ========================================================= */

    function createNoteCard(note) {
        const card =
            document.createElement(
                "article"
            );

        card.className =
            "note-card";


        card.dataset.title =
            note.title.toLowerCase();


        card.dataset.category =
            note.category.toLowerCase();


        card.innerHTML = `
            <div class="note-card-icon" aria-hidden="true">
                <span>PDF</span>
            </div>

            <div class="note-card-content">
                <h3>${escapeHTML(
                    note.title
                )}</h3>

                <p>${escapeHTML(
                    note.category
                )}</p>
            </div>

            <div class="note-card-actions">

                <button
                    type="button"
                    class="note-view-btn"
                    data-note-file="${escapeHTML(
                        note.file
                    )}"
                    data-note-title="${escapeHTML(
                        note.title
                    )}"
                >
                    View
                </button>

                <a
                    class="note-download-btn"
                    href="${getNotesBasePath()}${encodeURIComponent(
                        note.file
                    )}"
                    download
                >
                    Download
                </a>

            </div>
        `;


        return card;
    }


    /* =========================================================
       RENDER NOTES
    ========================================================= */

    function renderNotes(
        list = notes
    ) {
        const elements =
            getNotesElements();

        if (!elements.grid) {
            return;
        }


        elements.grid.innerHTML =
            "";


        if (!list.length) {

            if (elements.empty) {
                show(
                    elements.empty
                );
            }

            return;
        }


        if (elements.empty) {
            hide(
                elements.empty
            );
        }


        const fragment =
            document.createDocumentFragment();


        list.forEach(note => {
            fragment.appendChild(
                createNoteCard(
                    note
                )
            );
        });


        elements.grid.appendChild(
            fragment
        );


        $$(".note-view-btn", elements.grid)
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        openPDF(
                            button.dataset.noteFile,
                            button.dataset.noteTitle
                        );

                    }
                );

            });
    }


    /* =========================================================
       FILTER NOTES
    ========================================================= */

    function filterNotes() {
        const elements =
            getNotesElements();


        const searchTerm =
            elements.search
                ? elements.search.value
                    .trim()
                    .toLowerCase()
                : "";


        const category =
            elements.category
                ? elements.category.value
                    .trim()
                    .toLowerCase()
                : "";


        const filtered =
            notes.filter(note => {

                const matchesSearch =
                    !searchTerm ||
                    note.title
                        .toLowerCase()
                        .includes(
                            searchTerm
                        ) ||
                    note.category
                        .toLowerCase()
                        .includes(
                            searchTerm
                        );


                const matchesCategory =
                    !category ||
                    category === "all" ||
                    note.category
                        .toLowerCase() ===
                    category;


                return (
                    matchesSearch &&
                    matchesCategory
                );
            });


        renderNotes(
            filtered
        );
    }


    function initNotesFilters() {
        const elements =
            getNotesElements();


        if (elements.search) {
            elements.search.addEventListener(
                "input",
                filterNotes
            );
        }


        if (elements.category) {
            elements.category.addEventListener(
                "change",
                filterNotes
            );
        }
    }


    function initNotes() {
        const elements =
            getNotesElements();


        if (elements.grid) {
            renderNotes(
                notes
            );
        }


        initNotesFilters();
    }


    /* =========================================================
       PDF VIEWER
    ========================================================= */

    function openPDF(
        fileName,
        title = "Study Note"
    ) {
        const elements =
            getNotesElements();

        if (!fileName) {
            return;
        }


        const path =
            getNotesBasePath() +
            encodeURIComponent(
                fileName
            );


        if (elements.frame) {
            elements.frame.src =
                path;
        }


        setText(
            elements.viewerTitle,
            title
        );


        if (
            elements.downloadButton
        ) {
            elements.downloadButton.href =
                path;

            elements.downloadButton.setAttribute(
                "download",
                fileName
            );
        }


        if (elements.viewer) {

            elements.viewer.hidden =
                false;

            elements.viewer.classList.add(
                "is-open"
            );

            elements.viewer.classList.remove(
                "hidden"
            );

            elements.viewer.style.display =
                "";

            elements.viewer.setAttribute(
                "aria-hidden",
                "false"
            );

            document.body.classList.add(
                "pdf-viewer-open"
            );
        }
    }


    function closePDF() {
        const elements =
            getNotesElements();


        if (elements.viewer) {

            elements.viewer.hidden =
                true;

            elements.viewer.classList.remove(
                "is-open"
            );

            elements.viewer.classList.add(
                "hidden"
            );

            elements.viewer.style.display =
                "none";

            elements.viewer.setAttribute(
                "aria-hidden",
                "true"
            );
        }


        if (elements.frame) {
            elements.frame.src =
                "about:blank";
        }


        document.body.classList.remove(
            "pdf-viewer-open"
        );
    }


    function initPDFViewer() {
        const elements =
            getNotesElements();


        /*
         * PDF modal initial state.
         */
        if (elements.viewer) {
            closePDF();
        }


        if (elements.closeViewer) {
            elements.closeViewer.addEventListener(
                "click",
                closePDF
            );
        }


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {
                    closePDF();
                }

            }
        );


        if (elements.viewer) {

            elements.viewer.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        elements.viewer
                    ) {
                        closePDF();
                    }

                }
            );

        }
    }


    /* =========================================================
       CATEGORY FILTER
    ========================================================= */

    function populateCategoryFilter() {
        const elements =
            getNotesElements();


        if (!elements.category) {
            return;
        }


        if (
            elements.category.options
                .length <= 1
        ) {

            const categories =
                [
                    ...new Set(
                        notes.map(
                            note =>
                                note.category
                        )
                    )
                ].sort();


            categories.forEach(
                category => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        category;

                    option.textContent =
                        category;

                    elements.category.appendChild(
                        option
                    );
                }
            );
        }
    }


    /* =========================================================
       HOME STATS
    ========================================================= */

    function updateHomeStats() {
        const progress =
            getStoredProgress();


        const homeBest =
            $(
                "#home-best-wpm, #hero-best-wpm, .hero-best-wpm"
            );


        const homeTests =
            $(
                "#home-tests, #hero-tests, .hero-tests"
            );


        const homeStreak =
            $(
                "#home-streak, #hero-streak, .hero-streak"
            );


        setText(
            homeBest,
            progress.bestWpm || 0
        );


        setText(
            homeTests,
            progress.totalTests || 0
        );


        setText(
            homeStreak,
            progress.streak || 0
        );
    }


    /* =========================================================
       BUTTON SAFETY
    ========================================================= */

    function initButtonSafety() {
        $$("button").forEach(
            button => {

                if (
                    !button.hasAttribute(
                        "type"
                    )
                ) {
                    button.setAttribute(
                        "type",
                        "button"
                    );
                }

            }
        );
    }


    /* =========================================================
       VISIBILITY
    ========================================================= */

    function initVisibilityHandling() {
        document.addEventListener(
            "visibilitychange",
            () => {

                if (
                    !document.hidden &&
                    App.typing.started
                ) {
                    updateLiveStats();
                }

            }
        );
    }


    /* =========================================================
       CLEANUP
    ========================================================= */

    function cleanupOnPageExit() {
        window.addEventListener(
            "pagehide",
            () => {
                stopTypingTimer();
            }
        );
    }


    /* =========================================================
       INITIALIZE
    ========================================================= */

    function initializeSkillora() {

        try {
            initFeaturePages();
        } catch (error) {
            console.warn(
                "Skillora routing initialization skipped.",
                error
            );
        }


        try {
            initButtonSafety();
        } catch (error) {
            console.warn(
                "Skillora button initialization skipped.",
                error
            );
        }


        try {
            initNavigation();
        } catch (error) {
            console.warn(
                "Skillora navigation initialization skipped.",
                error
            );
        }


        try {
            initMobileMenu();
        } catch (error) {
            console.warn(
                "Skillora mobile menu initialization skipped.",
                error
            );
        }


        try {
            initTypingTest();
        } catch (error) {
            console.warn(
                "Skillora typing initialization skipped.",
                error
            );
        }


        try {
            updateProgressUI();
            updateHistoryUI();
            updateHomeStats();
            updateAchievementsUI();
        } catch (error) {
            console.warn(
                "Skillora progress initialization skipped.",
                error
            );
        }


        try {
            populateCategoryFilter();
            initNotes();
            initPDFViewer();
        } catch (error) {
            console.warn(
                "Skillora notes initialization skipped.",
                error
            );
        }


        try {
            initVisibilityHandling();
            cleanupOnPageExit();
        } catch (error) {
            console.warn(
                "Skillora lifecycle initialization skipped.",
                error
            );
        }


        removeLoader();
    }


    /* =========================================================
       BOOT
    ========================================================= */

    function boot() {

        try {

            initializeSkillora();

        } catch (error) {

            console.error(
                "Skillora initialization error:",
                error
            );

            removeLoader();
        }
    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            boot,
            {
                once: true
            }
        );

    } else {

        boot();

    }

})();