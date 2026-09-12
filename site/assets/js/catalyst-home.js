const CATALYST_API_BASE_URL = "http://localhost:5000/api";

const HOME_EVENT_LIMIT = 6;


function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatDate(value) {
    if (!value) return "Date TBA";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date TBA";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function getStatusLabel(status) {
    const labels = {
        COMING_SOON: "Coming Soon",
        REGISTRATION_OPEN: "Registration Open",
        REGISTRATION_CLOSED: "Registration Closed",
        LIVE: "Live Now",
        COMPLETED: "Completed"
    };

    return labels[status] || "Upcoming";
}


function eventUrl(event) {
    const identifier = event.slug || event.id;
    return `event.html?id=${encodeURIComponent(identifier)}`;
}


function updateHomepageNavigation() {
    const nav = document.querySelector(".vibes-nav");

    if (!nav) return;

    const desktopLinks = nav.querySelectorAll(
        ".vibes-nav-frame-730 a, .vibes-nav-frame-735 a"
    );

    desktopLinks.forEach(link => {
        const text = link.textContent.trim().toLowerCase();
        const href = link.getAttribute("href") || "";

        if (text === "back to b150") {
            link.href = "index.html";
            link.textContent = "CATALYST";
            return;
        }

        if (text === "subscribe" || href.includes("portal")) {
            link.href = "events.html";
            link.textContent = "EVENTS";
        }
    });

    const mobileLinks = nav.querySelectorAll(
        ".vibes-mobile-menu-link"
    );

    mobileLinks.forEach(link => {
        const text = link.textContent.trim().toLowerCase();

        if (text.includes("back to b150")) {
            link.href = "index.html";
            link.textContent = "Catalyst";
        } else if (text === "all articles") {
            link.href = "events.html";
            link.textContent = "Events";
        } else if (text === "podcast") {
            link.href = "clubs.html";
            link.textContent = "Clubs";
        } else if (text === "events") {
            link.href = "announcements.html";
            link.textContent = "Announcements";
        } else if (text === "jobs") {
            link.href = "my-events.html";
            link.textContent = "My Events";
        }
    });

    const existingLogin = Array.from(nav.querySelectorAll("a"))
        .find(link => {
            const text = link.textContent.trim().toLowerCase();
            return text === "login" || text === "sign in";
        });

    if (!existingLogin) {
        const container = nav.querySelector(".vibes-nav-frame-735");

        if (container) {
            const authLink = document.createElement("a");
            authLink.href = "login.html";
            authLink.textContent = "LOGIN";
            authLink.className = "catalyst-home-login";
            container.appendChild(authLink);
        }
    }
}


function buildEventCard(event) {
    const image = event.bannerUrl
        ? `<img class="catalyst-event-image" src="${escapeHtml(event.bannerUrl)}" alt="${escapeHtml(event.title)}" loading="lazy">`
        : `<div class="catalyst-event-placeholder">Catalyst Event</div>`;

    const status = event.status || "COMING_SOON";
    const statusClass = status === "REGISTRATION_OPEN" || status === "LIVE"
        ? "catalyst-status-open"
        : "";

    const clubName = event.club?.name || "Campus Community";

    return `
        <a class="catalyst-event-card" href="${eventUrl(event)}">
            ${image}
            <div class="catalyst-event-meta">
                <span>${escapeHtml(clubName)}</span>
                <span class="catalyst-status ${statusClass}">${escapeHtml(getStatusLabel(status))}</span>
            </div>
            <h3 class="catalyst-event-title">${escapeHtml(event.title)}</h3>
            <div class="catalyst-event-club">${escapeHtml(formatDate(event.eventStart))}</div>
        </a>
    `;
}


function buildEventSection(events) {
    const section = document.createElement("section");
    section.className = "catalyst-home-section gh-outer";

    const inner = document.createElement("div");
    inner.className = "catalyst-home-inner gh-inner";

    const heading = document.createElement("h2");
    heading.className = "catalyst-section-heading";
    heading.textContent = "Upcoming Campus Events";

    const grid = document.createElement("div");
    grid.className = "catalyst-event-grid";

    if (!events.length) {
        grid.innerHTML = `<div class="catalyst-empty">No published events yet. Check back soon.</div>`;
    } else {
        grid.innerHTML = events.map(buildEventCard).join("");
    }

    const actions = document.createElement("div");
    actions.className = "catalyst-home-actions";
    actions.innerHTML = `
        <a class="catalyst-home-action" href="events.html">Browse All Events</a>
        <a class="catalyst-home-action" href="clubs.html">Explore Clubs</a>
    `;

    inner.appendChild(heading);
    inner.appendChild(grid);
    inner.appendChild(actions);
    section.appendChild(inner);

    return section;
}


function buildCommunitySection(clubs, announcements) {
    const section = document.createElement("section");
    section.className = "catalyst-home-section gh-outer";

    const inner = document.createElement("div");
    inner.className = "catalyst-home-inner gh-inner";

    const columns = document.createElement("div");
    columns.className = "catalyst-home-columns";

    const announcementsColumn = document.createElement("div");
    announcementsColumn.innerHTML = `
        <h2 class="catalyst-section-heading">Latest Announcements</h2>
        <div class="catalyst-list" id="catalyst-home-announcements"></div>
    `;

    const clubsColumn = document.createElement("div");
    clubsColumn.innerHTML = `
        <h2 class="catalyst-section-heading">Clubs & Communities</h2>
        <div class="catalyst-list" id="catalyst-home-clubs"></div>
    `;

    const announcementList = announcementsColumn.querySelector(
        "#catalyst-home-announcements"
    );

    if (!announcements.length) {
        announcementList.innerHTML =
            `<div class="catalyst-empty">No announcements yet.</div>`;
    } else {
        announcementList.innerHTML = announcements
            .slice(0, 5)
            .map(item => `
                <a class="catalyst-list-item" href="announcements.html">
                    <h3 class="catalyst-list-title">${escapeHtml(item.title)}</h3>
                    <div class="catalyst-list-meta">
                        ${escapeHtml(item.club?.name || "Campus")} · ${escapeHtml(formatDate(item.createdAt))}
                    </div>
                </a>
            `)
            .join("");
    }

    const clubList = clubsColumn.querySelector(
        "#catalyst-home-clubs"
    );

    if (!clubs.length) {
        clubList.innerHTML =
            `<div class="catalyst-empty">No clubs have been created yet.</div>`;
    } else {
        clubList.innerHTML = clubs
            .slice(0, 5)
            .map(club => `
                <a class="catalyst-list-item" href="club.html?id=${encodeURIComponent(club.slug || club.id)}">
                    <h3 class="catalyst-list-title">${escapeHtml(club.name)}</h3>
                    <div class="catalyst-list-meta">${escapeHtml(club.description || "Campus community")}</div>
                </a>
            `)
            .join("");
    }

    columns.appendChild(announcementsColumn);
    columns.appendChild(clubsColumn);
    inner.appendChild(columns);
    section.appendChild(inner);

    return section;
}


async function fetchJson(url) {
    const response = await fetch(url, {
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
}


async function loadCatalystHomepage() {
    updateHomepageNavigation();

    const originalMain = document.querySelector(
        ".vibes-main-content"
    );

    if (!originalMain) return;

    originalMain.style.display = "none";

    const [eventsResult, clubsResult, announcementsResult] =
        await Promise.allSettled([
            fetchJson(`${CATALYST_API_BASE_URL}/events?limit=${HOME_EVENT_LIMIT}`),
            fetchJson(`${CATALYST_API_BASE_URL}/clubs`),
            fetchJson(`${CATALYST_API_BASE_URL}/announcements`)
        ]);

    const events = eventsResult.status === "fulfilled"
        ? (eventsResult.value.events || [])
        : [];

    const clubs = clubsResult.status === "fulfilled"
        ? (clubsResult.value.clubs || [])
        : [];

    const announcements = announcementsResult.status === "fulfilled"
        ? (announcementsResult.value.announcements || [])
        : [];

    if (eventsResult.status === "rejected") {
        console.error("Homepage events error:", eventsResult.reason);
    }

    if (clubsResult.status === "rejected") {
        console.error("Homepage clubs error:", clubsResult.reason);
    }

    if (announcementsResult.status === "rejected") {
        console.error("Homepage announcements error:", announcementsResult.reason);
    }

    const existingCatalystSections = document.querySelectorAll(
        ".catalyst-home-section"
    );

    existingCatalystSections.forEach(section => section.remove());

    originalMain.insertAdjacentElement(
        "afterend",
        buildCommunitySection(clubs, announcements)
    );

    originalMain.insertAdjacentElement(
        "afterend",
        buildEventSection(events)
    );
}


if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        loadCatalystHomepage
    );
} else {
    loadCatalystHomepage();
}
