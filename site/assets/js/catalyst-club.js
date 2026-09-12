const API_BASE_URL =
    "http://localhost:5000/api";


const clubPage =
    document.getElementById("clubPage");


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

    return new Date(dateString)
        .toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        )
        .toUpperCase();
}


function getClubInitial(clubName) {

    if (!clubName) {
        return "C";
    }

    return clubName
        .trim()
        .charAt(0)
        .toUpperCase();
}


function getEventDateLabel(event) {

    const start =
        formatDate(event.eventStart);

    const end =
        formatDate(event.eventEnd);


    if (
        !event.eventEnd ||
        start === end
    ) {

        return start;
    }


    return `${start} — ${end}`;
}


/*
    ---------------------------------------------------------
    Get club ID from URL
    ---------------------------------------------------------
*/

function getClubId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get("id");
}


/*
    ---------------------------------------------------------
    Load club
    ---------------------------------------------------------
*/

async function loadClub() {

    const clubId =
        getClubId();


    if (!clubId) {

        showError(
            "CLUB NOT FOUND",
            "No club was specified."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/clubs/${encodeURIComponent(
                    clubId
                )}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load club"
            );
        }


        renderClub(
            data.club
        );


    } catch (error) {

        console.error(
            "Load club error:",
            error
        );


        showError(
            "UNABLE TO LOAD CLUB",
            error.message
        );
    }
}


/*
    ---------------------------------------------------------
    Render club
    ---------------------------------------------------------
*/

function renderClub(club) {

    document.title =
        `${club.name} — Catalyst`;


    const events =
        club.events || [];


    const now =
        new Date();


    const upcomingEvents =
        events.filter(
            event =>
                new Date(
                    event.eventEnd
                ) >= now
        );


    const pastEvents =
        events.filter(
            event =>
                new Date(
                    event.eventEnd
                ) < now
        );


    clubPage.innerHTML = `

        <!-- CLUB HERO -->

        <section class="club-hero">


            <div class="club-logo-box">

                ${
                    club.logoUrl

                        ? `
                            <img
                                src="${escapeHtml(
                                    club.logoUrl
                                )}"
                                alt="${escapeHtml(
                                    club.name
                                )} logo"
                            >
                        `

                        : `
                            <div
                                class="club-logo-placeholder"
                            >
                                ${escapeHtml(
                                    getClubInitial(
                                        club.name
                                    )
                                )}
                            </div>
                        `
                }

            </div>


            <div>

                <p class="club-eyebrow">
                    Catalyst / Club
                </p>


                <h1 class="club-title">

                    ${escapeHtml(
                        club.name
                    )}

                </h1>


                <p class="club-description">

                    ${escapeHtml(
                        club.description ||
                        "This club has not added a description yet."
                    )}

                </p>


                <div class="club-stats">

                    <div>

                        <div class="club-stat-label">
                            Members
                        </div>

                        <div class="club-stat-number">
                            ${club.memberCount ?? 0}
                        </div>

                    </div>


                    <div>

                        <div class="club-stat-label">
                            Events
                        </div>

                        <div class="club-stat-number">
                            ${club.eventCount ?? 0}
                        </div>

                    </div>

                </div>


                ${
                    club.contactEmail

                        ? `
                            <div class="club-contact">

                                Contact:

                                <a
                                    href="mailto:${escapeHtml(
                                        club.contactEmail
                                    )}"
                                >
                                    ${escapeHtml(
                                        club.contactEmail
                                    )}
                                </a>

                            </div>
                        `

                        : ""
                }

            </div>


        </section>


        <!-- UPCOMING EVENTS -->

        <section class="club-section">

            <div class="club-section-header">

                <h2 class="club-section-title">
                    Upcoming Events
                </h2>


                <span class="club-section-count">

                    ${upcomingEvents.length}

                    event${
                        upcomingEvents.length === 1
                            ? ""
                            : "s"
                    }

                </span>

            </div>


            <div class="club-events">

                ${
                    upcomingEvents.length

                        ? upcomingEvents
                            .map(renderEvent)
                            .join("")

                        : `
                            <div class="club-empty">

                                <strong>
                                    No upcoming events
                                </strong>

                                This club doesn't have
                                any upcoming events right now.

                            </div>
                        `
                }

            </div>

        </section>


        <!-- PAST EVENTS -->

        <section class="club-section">

            <div class="club-section-header">

                <h2 class="club-section-title">
                    Past Events
                </h2>


                <span class="club-section-count">

                    ${pastEvents.length}

                    event${
                        pastEvents.length === 1
                            ? ""
                            : "s"
                    }

                </span>

            </div>


            <div class="club-events">

                ${
                    pastEvents.length

                        ? pastEvents
                            .reverse()
                            .map(renderEvent)
                            .join("")

                        : `
                            <div class="club-empty">

                                <strong>
                                    No past events
                                </strong>

                                Events hosted by this club
                                will appear here.

                            </div>
                        `
                }

            </div>

        </section>

    `;
}


/*
    ---------------------------------------------------------
    Render event
    ---------------------------------------------------------
*/

function renderEvent(event) {

    return `

        <article class="club-event">


            <div class="club-event-image">

                ${
                    event.bannerUrl

                        ? `
                            <img
                                src="${escapeHtml(
                                    event.bannerUrl
                                )}"
                                alt="${escapeHtml(
                                    event.title
                                )}"
                            >
                        `

                        : ""
                }

            </div>


            <div class="club-event-content">


                <div class="club-event-category">

                    ${escapeHtml(
                        event.category
                    )}

                </div>


                <h3 class="club-event-title">

                    ${escapeHtml(
                        event.title
                    )}

                </h3>


                <div class="club-event-date">

                    ${escapeHtml(
                        getEventDateLabel(
                            event
                        )
                    )}

                </div>


                ${
                    event.venue

                        ? `
                            <div class="club-event-venue">

                                ${escapeHtml(
                                    event.venue
                                )}

                            </div>
                        `

                        : ""
                }


                <a
                    href="event.html?id=${encodeURIComponent(
                        event.id
                    )}"
                    class="club-event-button"
                >
                    View Event →
                </a>


            </div>

        </article>

    `;
}


/*
    ---------------------------------------------------------
    Error state
    ---------------------------------------------------------
*/

function showError(
    title,
    message
) {

    clubPage.innerHTML = `

        <div class="club-error">

            <h1>

                ${escapeHtml(
                    title
                )}

            </h1>


            <p>

                ${escapeHtml(
                    message
                )}

            </p>


            <a
                href="clubs.html"
                class="club-back"
            >
                ← Back to Clubs
            </a>

        </div>

    `;
}


/*
    ---------------------------------------------------------
    Start
    ---------------------------------------------------------
*/

loadClub();