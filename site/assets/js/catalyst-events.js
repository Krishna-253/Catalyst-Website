const API_BASE_URL = "http://localhost:5000/api";

const eventsGrid = document.getElementById("eventsGrid");
const eventCount = document.getElementById("eventCount");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");

let allEvents = [];

/*
    ---------------------------------------------------------
    Helpers
    ---------------------------------------------------------
*/

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) {
        return "TBA";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).toUpperCase();
}

function formatStatus(status) {
    const statusLabels = {
        COMING_SOON: "COMING SOON",
        REGISTRATION_OPEN: "REGISTRATION OPEN",
        REGISTRATION_CLOSED: "REGISTRATION CLOSED",
        LIVE: "LIVE NOW",
        COMPLETED: "COMPLETED",
        UNPUBLISHED: "UNPUBLISHED"
    };

    return statusLabels[status] || status;
}

/*
    ---------------------------------------------------------
    Fetch events from our backend
    ---------------------------------------------------------
*/

async function fetchEvents() {
    try {
        eventsGrid.innerHTML = `
            <div class="catalyst-loading">
                Loading events...
            </div>
        `;

        const response = await fetch(`${API_BASE_URL}/events`);

        if (!response.ok) {
            throw new Error("Unable to fetch events");
        }

        const data = await response.json();

        allEvents = data.events || [];

        populateCategories(allEvents);
        renderEvents();

    } catch (error) {
        console.error("Events loading error:", error);

        eventCount.textContent = "ERROR";

        eventsGrid.innerHTML = `
            <div class="catalyst-message">
                <h2 class="catalyst-message-title">
                    Could Not Load Events
                </h2>

                <p class="catalyst-message-text">
                    Make sure the Catalyst backend is running on
                    localhost:5000 and try refreshing this page.
                </p>
            </div>
        `;
    }
}

/*
    ---------------------------------------------------------
    Category dropdown
    ---------------------------------------------------------
*/

function populateCategories(events) {
    const categories = [
        ...new Set(
            events
                .map(event => event.category)
                .filter(Boolean)
        )
    ].sort();

    categoryFilter.innerHTML = `
        <option value="">ALL CATEGORIES</option>
    `;

    categories.forEach(category => {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category.toUpperCase();

        categoryFilter.appendChild(option);
    });
}

/*
    ---------------------------------------------------------
    Filtering
    ---------------------------------------------------------
*/

function getFilteredEvents() {
    const searchTerm =
        searchInput.value.trim().toLowerCase();

    const selectedCategory =
        categoryFilter.value;

    const selectedStatus =
        statusFilter.value;

    return allEvents.filter(event => {

        const matchesSearch =
            !searchTerm ||
            event.title.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            event.category.toLowerCase().includes(searchTerm) ||
            event.club?.name?.toLowerCase().includes(searchTerm);

        const matchesCategory =
            !selectedCategory ||
            event.category === selectedCategory;

        const matchesStatus =
            !selectedStatus ||
            event.status === selectedStatus;

        return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
        );
    });
}

/*
    ---------------------------------------------------------
    Render events
    ---------------------------------------------------------
*/

function renderEvents() {
    const filteredEvents = getFilteredEvents();

    eventCount.textContent =
        `${filteredEvents.length} EVENT${filteredEvents.length === 1 ? "" : "S"}`;

    if (filteredEvents.length === 0) {
        eventsGrid.innerHTML = `
            <div class="catalyst-message">
                <h2 class="catalyst-message-title">
                    No Events Found
                </h2>

                <p class="catalyst-message-text">
                    Try changing your search or filters.
                </p>
            </div>
        `;

        return;
    }

    eventsGrid.innerHTML = filteredEvents
        .map(event => createEventCard(event))
        .join("");
}

/*
    ---------------------------------------------------------
    Event card
    ---------------------------------------------------------
*/

function createEventCard(event) {
    const clubName =
        event.club?.name || "Catalyst Community";

    const registrationCount =
        event.registrationCount ?? 0;

    const capacityText =
        event.capacity
            ? `${registrationCount} / ${event.capacity} registered`
            : `${registrationCount} registered`;

    const statusClass =
        event.status === "REGISTRATION_OPEN"
            ? "is-open"
            : "";

    return `
        <article class="catalyst-event-card ${statusClass}">

            <div class="catalyst-event-top">

                <span class="catalyst-event-category">
                    ${escapeHtml(event.category)}
                </span>

                <span class="catalyst-event-status">
                    <span class="catalyst-status-dot"></span>
                    ${escapeHtml(formatStatus(event.status))}
                </span>

            </div>

            <h2 class="catalyst-event-title">
                ${escapeHtml(event.title)}
            </h2>

            <p class="catalyst-event-description">
                ${escapeHtml(event.description)}
            </p>

            <div class="catalyst-event-meta">

                <div>
                    <div class="catalyst-meta-label">
                        DATE
                    </div>

                    <div class="catalyst-meta-value">
                        ${escapeHtml(formatDate(event.eventStart))}
                    </div>
                </div>

                <div>
                    <div class="catalyst-meta-label">
                        ORGANIZED BY
                    </div>

                    <div class="catalyst-meta-value">
                        ${escapeHtml(clubName)}
                    </div>
                </div>

                <div>
                    <div class="catalyst-meta-label">
                        VENUE
                    </div>

                    <div class="catalyst-meta-value">
                        ${escapeHtml(event.venue || "TBA")}
                    </div>
                </div>

                <div>
                    <div class="catalyst-meta-label">
                        REGISTRATION
                    </div>

                    <div class="catalyst-meta-value">
                        Until ${escapeHtml(formatDate(event.registrationEnd))}
                    </div>
                </div>

            </div>

            <div class="catalyst-event-footer">

                <span class="catalyst-registration-count">
                    ${escapeHtml(capacityText)}
                </span>

                <a
                    class="catalyst-view-button"
                    href="event.html?id=${encodeURIComponent(event.id)}"
                >
                    VIEW EVENT →
                </a>

            </div>

        </article>
    `;
}

/*
    ---------------------------------------------------------
    Filter listeners
    ---------------------------------------------------------
*/

searchInput.addEventListener("input", renderEvents);

categoryFilter.addEventListener("change", renderEvents);

statusFilter.addEventListener("change", renderEvents);

/*
    ---------------------------------------------------------
    Start
    ---------------------------------------------------------
*/

fetchEvents();