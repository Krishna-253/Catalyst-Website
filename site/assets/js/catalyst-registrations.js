const API_BASE_URL = "http://localhost:5000/api";

const registrationsPage =
    document.getElementById("registrationsPage");


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

    return new Date(dateString).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).toUpperCase();
}


function formatDateTime(dateString) {
    if (!dateString) {
        return "TBA";
    }

    return new Date(dateString).toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/*
    ---------------------------------------------------------
    Get event ID
    ---------------------------------------------------------
*/

function getEventId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("id");
}


/*
    ---------------------------------------------------------
    Load registrations
    ---------------------------------------------------------
*/

async function loadRegistrations() {

    const eventId = getEventId();

    if (!eventId) {
        showError(
            "NO EVENT SELECTED",
            "Please select an event from the organizer dashboard."
        );

        return;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/organizer/events/${encodeURIComponent(eventId)}/registrations`,
            {
                method: "GET",
                credentials: "include"
            }
        );


        const data = await response.json();


        if (response.status === 401) {

            showError(
                "LOGIN REQUIRED",
                "Please log in with your organizer account."
            );

            return;
        }


        if (response.status === 403) {

            showError(
                "ACCESS DENIED",
                "You do not have permission to view registrations for this event."
            );

            return;
        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load registrations"
            );
        }


        renderRegistrations(data);


    } catch (error) {

        console.error(
            "Registrations error:",
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
    Render registrations
    ---------------------------------------------------------
*/

function renderRegistrations(data) {

    const event = data.event || {};

    const registrations =
        data.registrations || [];


    registrationsPage.innerHTML = `

        <nav class="registrations-nav">

            <div class="registrations-nav-inner">

                <a
                    href="index.html"
                    class="registrations-logo"
                >
                    CATALYST
                </a>


                <div class="registrations-nav-links">

                    <a
                        href="organizer.html"
                        class="registrations-nav-link"
                    >
                        Dashboard
                    </a>

                    <a
                        href="events.html"
                        class="registrations-nav-link"
                    >
                        Browse Events
                    </a>

                </div>

            </div>

        </nav>


        <main class="registrations-container">

            <p class="registrations-eyebrow">
                Catalyst / Organizer / Registrations
            </p>

            <h1 class="registrations-title">
                REGISTRATIONS
            </h1>

            <p class="registrations-subtitle">
                View the students currently registered for this event.
            </p>


            <section class="registration-event-header">

                <h2 class="registration-event-title">
                    ${escapeHtml(event.title)}
                </h2>

                <div class="registration-event-meta">
                    Event registration list
                </div>

                <div class="registration-count">
                    ${registrations.length}
                    registered
                </div>

            </section>


            ${
                registrations.length
                    ? `
                        <div class="registration-table-wrap">

                            <table class="registration-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Course
                                        </th>

                                        <th>
                                            Branch
                                        </th>

                                        <th>
                                            Year
                                        </th>

                                        <th>
                                            Registered At
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    ${
                                        registrations
                                            .map(
                                                renderRegistrationRow
                                            )
                                            .join("")
                                    }

                                </tbody>

                            </table>

                        </div>
                    `
                    : `
                        <div class="empty-state">

                            <h2>
                                No registrations yet
                            </h2>

                            <p>
                                Students who register for this event will appear here.
                            </p>

                        </div>
                    `
            }

        </main>
    `;
}


/*
    ---------------------------------------------------------
    Registration row
    ---------------------------------------------------------
*/

function renderRegistrationRow(registration) {

    const user =
        registration.user || {};


    return `

        <tr>

            <td>

                <div class="student-name">
                    ${escapeHtml(user.name || "Unknown")}
                </div>

                <div class="student-email">
                    ${escapeHtml(user.email || "No email")}
                </div>

            </td>


            <td>
                ${escapeHtml(user.course || "—")}
            </td>


            <td>
                ${escapeHtml(user.branch || "—")}
            </td>


            <td>
                ${user.year ?? "—"}
            </td>


            <td>
                ${escapeHtml(
                    formatDateTime(
                        registration.registeredAt
                    )
                )}
            </td>

        </tr>
    `;
}


/*
    ---------------------------------------------------------
    Error state
    ---------------------------------------------------------
*/

function showError(title, message) {

    registrationsPage.innerHTML = `

        <nav class="registrations-nav">

            <div class="registrations-nav-inner">

                <a
                    href="index.html"
                    class="registrations-logo"
                >
                    CATALYST
                </a>

            </div>

        </nav>


        <main class="registrations-container">

            <div class="error-state">

                <h2>
                    ${escapeHtml(title)}
                </h2>

                <p>
                    ${escapeHtml(message)}
                </p>


                <a
                    href="organizer.html"
                    class="back-button"
                >
                    ← Back To Dashboard
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

loadRegistrations();