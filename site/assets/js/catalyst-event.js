const API_BASE_URL = "http://localhost:5000/api";

const eventPage = document.getElementById("eventPage");

const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

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

function formatDateTime(dateString) {
    if (!dateString) {
        return "TBA";
    }

    const date = new Date(dateString);

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).toUpperCase();
}

function formatStatus(status) {
    const labels = {
        COMING_SOON: "COMING SOON",
        REGISTRATION_OPEN: "REGISTRATION OPEN",
        REGISTRATION_CLOSED: "REGISTRATION CLOSED",
        LIVE: "LIVE NOW",
        COMPLETED: "COMPLETED",
        UNPUBLISHED: "UNPUBLISHED"
    };

    return labels[status] || status;
}

/*
    ---------------------------------------------------------
    Load event
    ---------------------------------------------------------
*/

async function loadEvent() {
    if (!eventId) {
        showError(
            "Event Not Found",
            "No event ID was provided in the URL."
        );

        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/events/${encodeURIComponent(eventId)}`
        );

        if (!response.ok) {
            throw new Error("Event not found");
        }

        const data = await response.json();

        renderEvent(data.event);

    } catch (error) {
        console.error("Event loading error:", error);

        showError(
            "Event Not Found",
            "This event may have been removed or is not currently published."
        );
    }
}

/*
    ---------------------------------------------------------
    Render event
    ---------------------------------------------------------
*/

function renderEvent(event) {
    document.title = `${event.title} — Catalyst`;

    const clubName =
        event.club?.name || "Catalyst Community";

    const registrationCount =
        event.registrationCount ?? 0;

    const capacityText =
        event.capacity
            ? `${registrationCount} / ${event.capacity} registered`
            : `${registrationCount} registered`;

    const isRegistrationOpen =
        event.status === "REGISTRATION_OPEN";

    const isFull =
        event.capacity !== null &&
        registrationCount >= event.capacity;

    let buttonText = "REGISTER NOW";

    if (!isRegistrationOpen) {
        buttonText = formatStatus(event.status);
    }

    if (isFull && isRegistrationOpen) {
        buttonText = "EVENT FULL";
    }

    eventPage.innerHTML = `
        <!-- NAVIGATION -->

        <nav class="event-nav">

            <div class="event-nav-inner">

                <a href="index.html" class="event-logo">
                    CATALYST
                </a>

                <div class="event-nav-links">

                    <a href="events.html">
                        Events
                    </a>

                    <a href="clubs.html">
                        Clubs
                    </a>

                    <a href="announcements.html">
                        Announcements
                    </a>

                    <a href="login.html" class="event-login">
                        Login
                    </a>

                </div>

            </div>

        </nav>


        <!-- MAIN -->

        <main class="event-container">

            <a href="events.html" class="event-back">
                ← Back to Events
            </a>


            <!-- HERO -->

            <section class="event-hero">

                <div class="event-hero-content">

                    <div>

                        <span class="event-category">
                            ${escapeHtml(event.category)}
                        </span>

                        <span class="event-status">
                            <span class="event-status-dot"></span>
                            ${escapeHtml(formatStatus(event.status))}
                        </span>

                    </div>

                    <h1 class="event-title">
                        ${escapeHtml(event.title)}
                    </h1>

                    <p class="event-short-description">
                        ${escapeHtml(event.description)}
                    </p>

                </div>

                <div
                    class="event-banner"
                    ${event.bannerUrl
                        ? `style="background-image: url('${escapeHtml(event.bannerUrl)}')"`
                        : ""
                    }
                ></div>

            </section>


            <!-- META -->

            <section class="event-meta">

                <div class="event-meta-item">

                    <div class="event-meta-label">
                        EVENT DATE
                    </div>

                    <div class="event-meta-value">
                        ${escapeHtml(formatDate(event.eventStart))}
                        ${event.eventEnd && event.eventEnd !== event.eventStart
                            ? ` — ${escapeHtml(formatDate(event.eventEnd))}`
                            : ""
                        }
                    </div>

                </div>


                <div class="event-meta-item">

                    <div class="event-meta-label">
                        VENUE
                    </div>

                    <div class="event-meta-value">
                        ${escapeHtml(event.venue || "TBA")}
                    </div>

                </div>


                <div class="event-meta-item">

                    <div class="event-meta-label">
                        ORGANIZED BY
                    </div>

                    <div class="event-meta-value">
                        ${escapeHtml(clubName)}
                    </div>

                </div>


                <div class="event-meta-item">

                    <div class="event-meta-label">
                        REGISTRATIONS
                    </div>

                    <div class="event-meta-value">
                        ${escapeHtml(capacityText)}
                    </div>

                </div>

            </section>


            <!-- REGISTER -->

            <section class="event-register-bar">

                <div class="event-register-info">

                    <div class="event-register-heading">
                        ${isRegistrationOpen
                            ? "Ready to participate?"
                            : formatStatus(event.status)
                        }
                    </div>

                    <div class="event-register-subtext">
                        Registration closes
                        ${escapeHtml(formatDate(event.registrationEnd))}
                    </div>

                </div>

                <button
                    id="registerButton"
                    class="event-register-button"
                    ${!isRegistrationOpen || isFull ? "disabled" : ""}
                >
                    ${escapeHtml(buttonText)}
                </button>

            </section>


            <!-- CONTENT -->

            <section class="event-content">

                <div class="event-main-content">

                    ${createContentSection(
                        "ABOUT",
                        event.description
                    )}

                    ${createContentSection(
                        "ELIGIBILITY",
                        event.eligibility
                    )}

                    ${createContentSection(
                        "RULES",
                        event.rules
                    )}

                    ${createContentSection(
                        "PRIZES",
                        event.prizes
                    )}

                    ${createContentSection(
                        "TIMELINE",
                        event.timeline
                    )}

                </div>


                <aside class="event-sidebar">

                    <div class="event-sidebar-box">

                        <div class="event-sidebar-label">
                            REGISTRATION STARTS
                        </div>

                        <div class="event-sidebar-value">
                            ${escapeHtml(
                                formatDateTime(event.registrationStart)
                            )}
                        </div>


                        <div class="event-sidebar-label">
                            REGISTRATION ENDS
                        </div>

                        <div class="event-sidebar-value">
                            ${escapeHtml(
                                formatDateTime(event.registrationEnd)
                            )}
                        </div>


                        <div class="event-sidebar-label">
                            EVENT STARTS
                        </div>

                        <div class="event-sidebar-value">
                            ${escapeHtml(
                                formatDateTime(event.eventStart)
                            )}
                        </div>


                        <div class="event-sidebar-label">
                            CAPACITY
                        </div>

                        <div class="event-sidebar-value">
                            ${event.capacity
                                ? `${registrationCount} / ${event.capacity}`
                                : `${registrationCount} registered`
                            }
                        </div>


                        ${
                            event.brochureUrl
                                ? `
                                    <div class="event-sidebar-label">
                                        EVENT BROCHURE
                                    </div>

                                    <a
                                        class="event-brochure"
                                        href="${escapeHtml(event.brochureUrl)}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        VIEW BROCHURE →
                                    </a>
                                `
                                : ""
                        }

                    </div>

                </aside>

            </section>

        </main>
    `;

    const registerButton =
        document.getElementById("registerButton");

    if (registerButton && isRegistrationOpen && !isFull) {
        registerButton.addEventListener(
            "click",
            registerForEvent
        );
    }
}

/*
    ---------------------------------------------------------
    Content sections
    ---------------------------------------------------------
*/

function createContentSection(title, content) {
    if (!content) {
        return "";
    }

    return `
        <section class="event-section">

            <h2 class="event-section-title">
                ${escapeHtml(title)}
            </h2>

            <p class="event-section-text">
                ${escapeHtml(content)}
            </p>

        </section>
    `;
}

/*
    ---------------------------------------------------------
    Register
    ---------------------------------------------------------
*/

async function registerForEvent() {
    const button =
        document.getElementById("registerButton");

    if (!button) {
        return;
    }

    button.disabled = true;
    button.textContent = "REGISTERING...";

    try {
        const response = await fetch(
            `${API_BASE_URL}/events/${encodeURIComponent(eventId)}/register`,
            {
                method: "POST",
                credentials: "include"
            }
        );

        const data = await response.json();

        if (response.status === 401) {
            alert(
                "Please log in before registering for an event."
            );

            button.disabled = false;
            button.textContent = "REGISTER NOW";

            return;
        }

        if (!response.ok) {
            throw new Error(
                data.message || "Registration failed"
            );
        }

        button.textContent = "REGISTERED ✓";

        button.disabled = true;

        alert(
            "You're registered! See you at the event."
        );

        await loadEvent();

    } catch (error) {
        console.error("Registration error:", error);

        alert(error.message);

        button.disabled = false;
        button.textContent = "REGISTER NOW";
    }
}

/*
    ---------------------------------------------------------
    Error state
    ---------------------------------------------------------
*/

function showError(title, message) {
    eventPage.innerHTML = `
        <nav class="event-nav">

            <div class="event-nav-inner">

                <a href="index.html" class="event-logo">
                    CATALYST
                </a>

                <div class="event-nav-links">

                    <a href="events.html">
                        Events
                    </a>

                    <a href="login.html" class="event-login">
                        Login
                    </a>

                </div>

            </div>

        </nav>

        <main class="event-container">

            <div class="event-error">

                <h1>
                    ${escapeHtml(title)}
                </h1>

                <p>
                    ${escapeHtml(message)}
                </p>

                <a
                    href="events.html"
                    class="event-brochure"
                >
                    ← BACK TO EVENTS
                </a>

            </div>

        </main>
    `;
}

/*
    ---------------------------------------------------------
    Start
    ---------------------------------------------------------
*/

loadEvent();