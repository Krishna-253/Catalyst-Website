const API_BASE_URL = "http://localhost:5000/api";

const myEventsPage =
    document.getElementById("myEventsPage");


/*
    ---------------------------------------------------------
    Helpers
    ---------------------------------------------------------
*/

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


function formatDate(dateString) {

    if (!dateString) {
        return "TBA";
    }

    return new Date(dateString).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).toUpperCase();
}


function formatStatus(status) {

    const labels = {

        COMING_SOON:
            "Coming Soon",

        REGISTRATION_OPEN:
            "Registration Open",

        REGISTRATION_CLOSED:
            "Registration Closed",

        LIVE:
            "Live Now",

        COMPLETED:
            "Completed",

        UNPUBLISHED:
            "Unavailable"

    };

    return labels[status] || status;
}


/*
    ---------------------------------------------------------
    Load My Events
    ---------------------------------------------------------
*/

async function loadMyEvents() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/me/events`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (response.status === 401) {

            showError(
                "LOGIN REQUIRED",
                "Please log in to see the events you have registered for."
            );

            return;
        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load your events"
            );
        }


        renderMyEvents(
            data.events || []
        );


    } catch (error) {

        console.error(
            "My Events error:",
            error
        );


        showError(
            "SOMETHING WENT WRONG",
            error.message
        );
    }
}


/*
    ---------------------------------------------------------
    Render page
    ---------------------------------------------------------
*/

function renderMyEvents(events) {

    myEventsPage.innerHTML = `

        <nav class="my-events-nav">

            <div class="my-events-nav-inner">

                <a
                    href="index.html"
                    class="my-events-logo"
                >
                    CATALYST
                </a>


                <div class="my-events-nav-links">

                    <a
                        href="events.html"
                        class="my-events-nav-link"
                    >
                        Browse Events
                    </a>


                    <a
                        href="my-events.html"
                        class="my-events-nav-link"
                        aria-current="page"
                    >
                        My Events
                    </a>


                    <a
                        href="clubs.html"
                        class="my-events-nav-link"
                    >
                        Clubs
                    </a>

                </div>

            </div>

        </nav>


        <main class="my-events-container">

            <p class="my-events-eyebrow">
                Catalyst / Your Activity
            </p>


            <h1 class="my-events-title">
                MY EVENTS
            </h1>


            <p class="my-events-subtitle">
                Events you've registered for, all in one place.
            </p>


            ${
                events.length
                    ? `
                        <section class="my-events-grid">

                            ${
                                events
                                    .map(renderEventCard)
                                    .join("")
                            }

                        </section>
                    `
                    : `
                        <section class="empty-state">

                            <h2>
                                No registered events yet.
                            </h2>

                            <p>
                                Discover what's happening around campus and register for an event to see it here.
                            </p>

                            <a
                                href="events.html"
                                class="empty-state-button"
                            >
                                Browse Events →
                            </a>

                        </section>
                    `
            }

        </main>
    `;
}


/*
    ---------------------------------------------------------
    Event card
    ---------------------------------------------------------
*/

function renderEventCard(registration) {

    const event =
        registration.event || {};

    const club =
        event.club || {};


    const image =
        event.bannerUrl
            ? `
                <img
                    src="${escapeHtml(event.bannerUrl)}"
                    alt="${escapeHtml(event.title)}"
                    class="my-event-image"
                >
            `
            : `
                <div class="my-event-image-placeholder">
                    Catalyst Event
                </div>
            `;


    return `

        <article class="my-event-card">


            ${image}


            <div class="my-event-content">

                <div class="my-event-category">
                    ${escapeHtml(event.category)}
                </div>


                <h2 class="my-event-title">
                    ${escapeHtml(event.title)}
                </h2>


                <div class="my-event-club">
                    ${escapeHtml(
                        club.name ||
                        "Catalyst"
                    )}
                </div>


                <div class="my-event-meta">

                    <div>

                        <div class="my-event-meta-label">
                            Event Date
                        </div>

                        <div class="my-event-meta-value">

                            ${escapeHtml(
                                formatDate(
                                    event.eventStart
                                )
                            )}

                            ${
                                event.eventEnd &&
                                event.eventEnd !== event.eventStart
                                    ? `
                                        — ${escapeHtml(
                                            formatDate(
                                                event.eventEnd
                                            )
                                        )}
                                    `
                                    : ""
                            }

                        </div>

                    </div>


                    <div>

                        <div class="my-event-meta-label">
                            Venue
                        </div>

                        <div class="my-event-meta-value">

                            ${escapeHtml(
                                event.venue ||
                                "Venue TBA"
                            )}

                        </div>

                    </div>

                </div>


                <div class="my-event-status">

                    ${escapeHtml(
                        formatStatus(
                            event.status
                        )
                    )}

                </div>

            </div>


            <div class="my-event-actions">

                <a
                    href="event.html?id=${encodeURIComponent(event.id)}"
                    class="my-event-button"
                >
                    View Event →
                </a>


                ${
                    event.brochureUrl
                        ? `
                            <a
                                href="${escapeHtml(event.brochureUrl)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="my-event-button my-event-button-secondary"
                            >
                                Brochure
                            </a>
                        `
                        : ""
                }

            </div>


        </article>
    `;
}


/*
    ---------------------------------------------------------
    Error state
    ---------------------------------------------------------
*/

function showError(title, message) {

    myEventsPage.innerHTML = `

        <nav class="my-events-nav">

            <div class="my-events-nav-inner">

                <a
                    href="index.html"
                    class="my-events-logo"
                >
                    CATALYST
                </a>


                <div class="my-events-nav-links">

                    <a
                        href="events.html"
                        class="my-events-nav-link"
                    >
                        Browse Events
                    </a>


                    <a
                        href="my-events.html"
                        class="my-events-nav-link"
                    >
                        My Events
                    </a>

                </div>

            </div>

        </nav>


        <main class="my-events-container">

            <div class="error-state">

                <h2>
                    ${escapeHtml(title)}
                </h2>


                <p>
                    ${escapeHtml(message)}
                </p>


                <a
                    href="login.html"
                    class="error-state-button"
                >
                    Go To Login →
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

loadMyEvents();