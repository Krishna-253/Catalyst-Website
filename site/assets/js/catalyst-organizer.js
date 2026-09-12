const API_BASE_URL =
    "http://localhost:5000/api";

const organizerPage =
    document.getElementById("organizerPage");


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


function formatApprovalStatus(status) {

    const labels = {

        PUBLISHED:
            "PUBLISHED",

        PENDING_APPROVAL:
            "PENDING APPROVAL",

        DRAFT:
            "DRAFT",

        REJECTED:
            "REJECTED"
    };

    return labels[status] ||
        status;
}


function getStatusClass(status) {

    if (status === "PUBLISHED") {

        return "published";
    }


    if (
        status ===
        "PENDING_APPROVAL"
    ) {

        return "pending";
    }


    return "draft";
}


/*
    ---------------------------------------------------------
    Load dashboard
    ---------------------------------------------------------
*/

async function loadOrganizerDashboard() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/organizer/dashboard`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (response.status === 401) {

            showError(
                "LOGIN REQUIRED",
                "Please log in with an organizer account to access this page."
            );

            return;
        }


        if (response.status === 403) {

            showError(
                "ACCESS DENIED",
                "This account does not have organizer permissions."
            );

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load organizer dashboard"
            );
        }


        await loadAnnouncements(
            data
        );


    } catch (error) {

        console.error(
            "Organizer dashboard error:",
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
    Load announcements
    ---------------------------------------------------------
*/

async function loadAnnouncements(
    dashboardData
) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/announcements/manage`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            const data =
                await response.json();

            throw new Error(
                data.message ||
                "Unable to load announcements"
            );
        }


        const data =
            await response.json();


        renderDashboard(
            dashboardData,
            data.announcements || []
        );

    } catch (error) {

        console.error(
            "Load announcements error:",
            error
        );


        /*
            The dashboard itself should still load
            even if announcements fail.
        */

        renderDashboard(
            dashboardData,
            []
        );
    }
}


/*
    ---------------------------------------------------------
    Render dashboard
    ---------------------------------------------------------
*/

function renderDashboard(
    data,
    announcements
) {

    const summary =
        data.summary || {};


    const clubs =
        data.clubs || {};


    const events =
        data.events || [];


    organizerPage.innerHTML = `

        <!-- NAVIGATION -->

        <nav class="org-nav">

            <div class="org-nav-inner">

                <a
                    href="index.html"
                    class="org-logo"
                >
                    CATALYST
                </a>


                <div class="org-nav-right">

                    <a
                        href="events.html"
                        class="org-nav-link"
                    >
                        Browse Events
                    </a>


                    <a
                        href="clubs.html"
                        class="org-nav-link"
                    >
                        Clubs
                    </a>


                    <a
                        href="announcements.html"
                        class="org-nav-link"
                    >
                        Announcements
                    </a>


                    <span
                        id="orgUserName"
                        class="org-user"
                    >
                        ORGANIZER
                    </span>


                    <a
                        href="#"
                        class="org-nav-link org-signout"
                        data-catalyst-signout="true"
                    >
                        Sign Out
                    </a>

                </div>

            </div>

        </nav>


        <!-- MAIN -->

        <main class="org-container">


            <!-- HEADER -->

            <header class="org-header">

                <div>

                    <p class="org-eyebrow">
                        Catalyst / Organizer
                    </p>


                    <h1 class="org-title">
                        DASHBOARD
                    </h1>

                </div>


                <div class="org-header-actions">

                    <a
                        href="create-club.html"
                        class="org-create-button org-secondary-button"
                    >
                        + Create Club
                    </a>


                    <a
                        href="create-announcement.html"
                        class="org-create-button org-secondary-button"
                    >
                        + Announcement
                    </a>


                    <a
                        href="create-event.html"
                        id="createEventButton"
                        class="org-create-button"
                    >
                        + Create Event
                    </a>

                </div>

            </header>


            <!-- SUMMARY -->

            <section class="org-summary">


                <div class="org-stat">

                    <div class="org-stat-label">
                        My Clubs
                    </div>


                    <div class="org-stat-number">
                        ${summary.clubCount ?? 0}
                    </div>

                </div>


                <div class="org-stat">

                    <div class="org-stat-label">
                        Total Events
                    </div>


                    <div class="org-stat-number">
                        ${summary.eventCount ?? 0}
                    </div>

                </div>


                <div class="org-stat">

                    <div class="org-stat-label">
                        Published
                    </div>


                    <div class="org-stat-number">
                        ${summary.publishedEventCount ?? 0}
                    </div>

                </div>


                <div class="org-stat">

                    <div class="org-stat-label">
                        Registrations
                    </div>


                    <div class="org-stat-number">
                        ${summary.registrationCount ?? 0}
                    </div>

                </div>


            </section>


            <!-- CLUBS -->

            <section class="org-section">

                <div class="org-section-header">

                    <h2 class="org-section-title">
                        My Clubs
                    </h2>


                    <span class="org-section-count">

                        ${clubs.length}

                        club${clubs.length === 1 ? "" : "s"}

                    </span>

                </div>


                <div class="org-clubs">

                    ${
                        clubs.length

                            ? clubs
                                .map(renderClub)
                                .join("")

                            : `
                                <div class="org-empty">

                                    <p>
                                        You are not managing any clubs yet.
                                    </p>


                                    <a
                                        href="create-club.html"
                                        class="org-view-button"
                                    >
                                        + Create Your First Club
                                    </a>

                                </div>
                            `
                    }

                </div>

            </section>


            <!-- EVENTS -->

            <section class="org-section">

                <div class="org-section-header">

                    <h2 class="org-section-title">
                        My Events
                    </h2>


                    <span class="org-section-count">

                        ${events.length}

                        event${events.length === 1 ? "" : "s"}

                    </span>

                </div>


                <div class="org-events">

                    ${
                        events.length

                            ? events
                                .map(renderEvent)
                                .join("")

                            : `
                                <div class="org-empty">

                                    <p>
                                        No events have been created yet.
                                    </p>


                                    <a
                                        href="create-event.html"
                                        class="org-view-button"
                                    >
                                        + Create Event
                                    </a>

                                </div>
                            `
                    }

                </div>

            </section>


            <!-- ANNOUNCEMENTS -->

            <section class="org-section">

                <div class="org-section-header">

                    <div>

                        <h2 class="org-section-title">
                            Announcements
                        </h2>

                        <p
                            style="
                                margin: 6px 0 0;
                                color: #777;
                                font-size: 14px;
                            "
                        >
                            Manage updates posted by your clubs.
                        </p>

                    </div>


                    <a
                        href="create-announcement.html"
                        class="org-view-button"
                    >
                        + New Announcement
                    </a>

                </div>


                <div class="org-announcements">

                    ${
                        announcements.length

                            ? announcements
                                .map(
                                    renderAnnouncement
                                )
                                .join("")

                            : `
                                <div class="org-empty">

                                    <p>
                                        No announcements have been created yet.
                                    </p>


                                    <a
                                        href="create-announcement.html"
                                        class="org-view-button"
                                    >
                                        + Create Announcement
                                    </a>

                                </div>
                            `
                    }

                </div>

            </section>


            <!-- QUICK ACTIONS -->

            <section class="org-section">

                <div class="org-section-header">

                    <h2 class="org-section-title">
                        Quick Actions
                    </h2>

                </div>


                <div class="org-quick-actions">


                    <a
                        href="create-event.html"
                        class="org-quick-action"
                    >

                        <span>
                            EVENT
                        </span>


                        <strong>
                            Create Event →
                        </strong>

                    </a>


                    <a
                        href="create-club.html"
                        class="org-quick-action"
                    >

                        <span>
                            COMMUNITY
                        </span>


                        <strong>
                            Create Club →
                        </strong>

                    </a>


                    <a
                        href="create-announcement.html"
                        class="org-quick-action"
                    >

                        <span>
                            NOTICE
                        </span>


                        <strong>
                            Post Announcement →
                        </strong>

                    </a>


                </div>

            </section>


        </main>
    `;


    setupOrganizerSignOut();

    setupAnnouncementActions();
}


/*
    ---------------------------------------------------------
    Club card
    ---------------------------------------------------------
*/

function renderClub(club) {

    return `

        <article class="org-club">

            <div>

                <h3 class="org-club-name">

                    ${escapeHtml(
                        club.name
                    )}

                </h3>


                <p class="org-club-description">

                    ${
                        escapeHtml(
                            club.description ||
                            "No club description available."
                        )
                    }

                </p>


                <div class="org-club-meta">

                    <span>
                        ${club.memberCount ?? 0}
                        members
                    </span>


                    <span>
                        ${club.eventCount ?? 0}
                        events
                    </span>

                </div>

            </div>


            <div class="org-club-actions">

                <a
                    href="club.html?id=${encodeURIComponent(
                        club.id
                    )}"
                    class="org-view-button"
                >
                    View Club →
                </a>

            </div>

        </article>
    `;
}


/*
    ---------------------------------------------------------
    Event row
    ---------------------------------------------------------
*/

function renderEvent(event) {

    const approvalClass =
        getStatusClass(
            event.approvalStatus
        );


    return `

        <article class="org-event">


            <div class="org-event-main">

                <h3 class="org-event-title">

                    ${escapeHtml(
                        event.title
                    )}

                </h3>


                <div class="org-event-category">

                    ${escapeHtml(
                        event.category
                    )}

                    ·

                    ${escapeHtml(
                        event.club?.name || ""
                    )}

                </div>

            </div>


            <div class="org-event-info">

                <div class="org-event-label">
                    Event Date
                </div>


                <div class="org-event-value">

                    ${escapeHtml(
                        formatDate(
                            event.eventStart
                        )
                    )}

                </div>

            </div>


            <div class="org-event-info">

                <div class="org-event-label">
                    Registrations
                </div>


                <div class="org-event-value">

                    ${
                        event.capacity

                            ? `${event.registrationCount} / ${event.capacity}`

                            : `${event.registrationCount} registered`
                    }


                    <br>


                    <span
                        class="org-event-status ${approvalClass}"
                    >

                        ${escapeHtml(
                            formatApprovalStatus(
                                event.approvalStatus
                            )
                        )}

                    </span>

                </div>

            </div>


            <div class="org-event-action">

                <a
                    href="event.html?id=${encodeURIComponent(
                        event.id
                    )}"
                    class="org-view-button"
                >
                    View Event →
                </a>


                <a
                    href="registrations.html?id=${encodeURIComponent(
                        event.id
                    )}"
                    class="org-view-button org-view-secondary"
                >
                    Registrations →
                </a>

            </div>


        </article>
    `;
}


/*
    ---------------------------------------------------------
    Announcement row
    ---------------------------------------------------------
*/

function renderAnnouncement(
    announcement
) {

    const statusClass =
        announcement.published
            ? "published"
            : "draft";


    const statusText =
        announcement.published
            ? "PUBLISHED"
            : "UNPUBLISHED";


    const actionText =
        announcement.published
            ? "Unpublish"
            : "Publish";


    return `

        <article
            class="org-event org-announcement"
        >


            <div class="org-event-main">

                <h3 class="org-event-title">

                    ${escapeHtml(
                        announcement.title
                    )}

                </h3>


                <div class="org-event-category">

                    ${escapeHtml(
                        announcement.club?.name || ""
                    )}

                    ·

                    ${escapeHtml(
                        announcement.createdBy?.name || ""
                    )}

                </div>

            </div>


            <div class="org-event-info">

                <div class="org-event-label">
                    Created
                </div>


                <div class="org-event-value">

                    ${escapeHtml(
                        formatDate(
                            announcement.createdAt
                        )
                    )}

                </div>

            </div>


            <div class="org-event-info">

                <div class="org-event-label">
                    Status
                </div>


                <div class="org-event-value">

                    <span
                        class="org-event-status ${statusClass}"
                    >
                        ${statusText}
                    </span>

                </div>

            </div>


            <div class="org-event-action">

                <a
                    href="announcements.html"
                    class="org-view-button org-view-secondary"
                >
                    View →
                </a>


                <button
                    type="button"
                    class="org-view-button announcement-toggle-button"
                    data-announcement-id="${escapeHtml(
                        announcement.id
                    )}"
                    data-published="${announcement.published}"
                >
                    ${actionText}
                </button>

            </div>


        </article>
    `;
}


/*
    ---------------------------------------------------------
    Publish / Unpublish buttons
    ---------------------------------------------------------
*/

function setupAnnouncementActions() {

    const buttons =
        document.querySelectorAll(
            ".announcement-toggle-button"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                const announcementId =
                    button.dataset.announcementId;


                const currentlyPublished =
                    button.dataset.published === "true";


                const newPublishedStatus =
                    !currentlyPublished;


                const originalText =
                    button.textContent;


                button.disabled = true;

                button.textContent =
                    newPublishedStatus
                        ? "Publishing..."
                        : "Unpublishing...";


                try {

                    const response =
                        await fetch(

                            `${API_BASE_URL}/announcements/${encodeURIComponent(
                                announcementId
                            )}/publish`,

                            {
                                method: "PATCH",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                credentials: "include",

                                body:
                                    JSON.stringify({
                                        published:
                                            newPublishedStatus
                                    })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Unable to update announcement"
                        );
                    }


                    /*
                        Reload the dashboard so the
                        new state is reflected everywhere.
                    */

                    await loadOrganizerDashboard();


                } catch (error) {

                    console.error(
                        "Announcement update error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Unable to update announcement."
                    );


                    button.disabled =
                        false;

                    button.textContent =
                        originalText;
                }
            }
        );

    });
}


/*
    ---------------------------------------------------------
    Organizer sign out
    ---------------------------------------------------------
*/

function setupOrganizerSignOut() {

    const signOut =
        document.querySelector(
            "[data-catalyst-signout]"
        );


    if (!signOut) {
        return;
    }


    signOut.addEventListener(
        "click",
        async event => {

            event.preventDefault();


            signOut.textContent =
                "Signing Out...";


            signOut.style.pointerEvents =
                "none";


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/auth/logout`,
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


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Sign out error:",
                    error
                );


                signOut.textContent =
                    "Sign Out";


                signOut.style.pointerEvents =
                    "";


                alert(
                    "Unable to sign out. Please try again."
                );
            }
        }
    );
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

    organizerPage.innerHTML = `

        <nav class="org-nav">

            <div class="org-nav-inner">

                <a
                    href="index.html"
                    class="org-logo"
                >
                    CATALYST
                </a>

            </div>

        </nav>


        <main class="org-container">

            <div class="org-error">

                <h1 class="org-error-title">

                    ${escapeHtml(
                        title
                    )}

                </h1>


                <p class="org-error-message">

                    ${escapeHtml(
                        message
                    )}

                </p>


                <br>


                <a
                    href="login.html"
                    class="org-create-button"
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

loadOrganizerDashboard();