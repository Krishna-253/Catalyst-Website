const CATALYST_API_BASE_URL = "http://localhost:5000/api";

let catalystLoggedIn = false;
let catalystAuthCheckFinished = false;
let navigationUpdateRunning = false;
let navigationUpdateTimer = null;
let catalystNavigationObserver = null;


/*
    ---------------------------------------------------------
    Authentication
    ---------------------------------------------------------
*/

async function setupCatalystNavigation() {
    try {
        const response = await fetch(
            `${CATALYST_API_BASE_URL}/auth/me`,
            {
                credentials: "include"
            }
        );

        catalystLoggedIn = response.ok;
        catalystAuthCheckFinished = true;

        updateNavigation(catalystLoggedIn);

    } catch (error) {
        console.error(
            "Navigation auth check failed:",
            error
        );

        catalystLoggedIn = false;
        catalystAuthCheckFinished = true;

        updateNavigation(false);
    }
}


/*
    ---------------------------------------------------------
    Find authentication link
    ---------------------------------------------------------
*/

function findAuthLink(nav) {
    const links = nav.querySelectorAll("a");

    for (const link of links) {
        const text = link.textContent
            .trim()
            .toLowerCase();

        const href =
            link.getAttribute("href") || "";

        if (
            text === "login" ||
            text === "log in" ||
            text === "sign in" ||
            text === "sign out" ||
            href.includes("login.html") ||
            link.dataset.catalystSignout === "true"
        ) {
            return link;
        }
    }

    return null;
}


/*
    ---------------------------------------------------------
    Find navigation links container
    ---------------------------------------------------------
*/

function findNavigationContainer(nav) {
    const selectors = [
        ".catalyst-nav-links",
        ".event-nav-links",
        ".my-events-nav-links",
        ".club-nav-links",
        ".clubs-nav-links",
        ".club-nav-right",
        ".announcements-nav-links",
        ".announcements-nav",
        ".login-nav-links",
        ".register-nav-links",
        ".create-nav-links"
    ];

    for (const selector of selectors) {
        const container =
            nav.querySelector(selector);

        if (container) {
            return container;
        }
    }

    return nav;
}


/*
    ---------------------------------------------------------
    Apply Sign Out
    ---------------------------------------------------------
*/

function makeSignOutLink(link) {
    const alreadySignOut =
        link.dataset.catalystSignout === "true" &&
        link.textContent.trim() === "Sign Out" &&
        link.getAttribute("href") === "#";

    if (!alreadySignOut) {
        link.textContent = "Sign Out";
        link.href = "#";
        link.removeAttribute("target");
        link.dataset.catalystSignout = "true";
    }

    link.onclick = handleSignOut;
}


/*
    ---------------------------------------------------------
    Apply Login
    ---------------------------------------------------------
*/

function makeLoginLink(link) {
    const alreadyLogin =
        !link.dataset.catalystSignout &&
        link.textContent.trim() === "Login" &&
        link.getAttribute("href") === "login.html";

    if (!alreadyLogin) {
        link.textContent = "Login";
        link.href = "login.html";
        link.removeAttribute("target");
        delete link.dataset.catalystSignout;
        link.onclick = null;
    }
}


/*
    ---------------------------------------------------------
    Add Sign Out if needed
    ---------------------------------------------------------
*/

function addSignOutLink(nav) {
    const container =
        findNavigationContainer(nav);

    if (!container) {
        return;
    }

    const existingSignOut =
        container.querySelector(
            '[data-catalyst-signout="true"]'
        );

    if (existingSignOut) {
        return;
    }

    const signOut =
        document.createElement("a");

    signOut.href = "#";
    signOut.textContent = "Sign Out";
    signOut.dataset.catalystSignout = "true";
    signOut.onclick = handleSignOut;

    container.appendChild(signOut);
}


/*
    ---------------------------------------------------------
    Update navigation
    ---------------------------------------------------------
*/

function updateNavigation(loggedIn) {
    if (navigationUpdateRunning) {
        return;
    }

    navigationUpdateRunning = true;

    try {
        const navs =
            document.querySelectorAll("nav");

        navs.forEach(nav => {
            const authLink =
                findAuthLink(nav);

            if (loggedIn) {
                if (authLink) {
                    makeSignOutLink(authLink);
                } else {
                    addSignOutLink(nav);
                }
            } else {
                if (
                    authLink &&
                    authLink.dataset.catalystSignout === "true"
                ) {
                    makeLoginLink(authLink);
                }
            }
        });

    } finally {
        navigationUpdateRunning = false;
    }
}


/*
    ---------------------------------------------------------
    Safely react to dynamically-created navigation
    ---------------------------------------------------------
*/

function scheduleNavigationUpdate() {
    if (!catalystAuthCheckFinished) {
        return;
    }

    if (navigationUpdateTimer) {
        return;
    }

    navigationUpdateTimer =
        setTimeout(() => {
            navigationUpdateTimer = null;

            updateNavigation(
                catalystLoggedIn
            );
        }, 100);
}


function setupNavigationObserver() {
    if (catalystNavigationObserver) {
        return;
    }

    catalystNavigationObserver =
        new MutationObserver(() => {
            scheduleNavigationUpdate();
        });

    catalystNavigationObserver.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );
}


/*
    ---------------------------------------------------------
    Sign Out
    ---------------------------------------------------------
*/

async function handleSignOut(event) {
    event.preventDefault();

    const link =
        event.currentTarget;

    if (!link) {
        return;
    }

    link.textContent =
        "Signing Out...";

    link.style.pointerEvents =
        "none";

    try {
        const response =
            await fetch(
                `${CATALYST_API_BASE_URL}/auth/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Unable to sign out"
            );
        }

        catalystLoggedIn = false;

        window.location.href =
            "login.html";

    } catch (error) {
        console.error(
            "Sign out error:",
            error
        );

        link.textContent =
            "Sign Out";

        link.style.pointerEvents =
            "";

        alert(
            "Unable to sign out. Please try again."
        );
    }
}


/*
    ---------------------------------------------------------
    Start
    ---------------------------------------------------------
*/

function startCatalystNavigation() {
    setupNavigationObserver();
    setupCatalystNavigation();
}


if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        startCatalystNavigation
    );
} else {
    startCatalystNavigation();
}