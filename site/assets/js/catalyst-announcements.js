const API_BASE_URL =
    "http://localhost:5000/api";

const announcementsList =
    document.getElementById(
        "announcementsList"
    );


function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


function formatDate(dateString) {

    if (!dateString) {
        return "DATE TBA";
    }

    return new Date(
        dateString
    ).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).toUpperCase();
}


async function loadAnnouncements() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/announcements`
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Unable to load announcements"
            );
        }

        renderAnnouncements(
            data.announcements || []
        );

    } catch (error) {

        console.error(
            "Announcements error:",
            error
        );

        announcementsList.innerHTML = `
            <div class="announcement-message">

                <h2>
                    SOMETHING WENT WRONG
                </h2>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </div>
        `;
    }
}


function renderAnnouncements(
    announcements
) {

    if (!announcements.length) {

        announcementsList.innerHTML = `
            <div class="announcement-message">

                <h2>
                    NO ANNOUNCEMENTS
                </h2>

                <p>
                    There are no published announcements
                    right now.
                </p>

            </div>
        `;

        return;
    }


    announcementsList.innerHTML =
        announcements
            .map(
                announcement =>
                    renderAnnouncement(
                        announcement
                    )
            )
            .join("");
}


function renderAnnouncement(
    announcement
) {

    const club =
        announcement.club || {};

    return `
        <article
            class="announcement-card"
        >

            <div class="announcement-top">

                <div class="announcement-club">
                    ${escapeHtml(
                        club.name ||
                        "Catalyst"
                    )}
                </div>

                <div class="announcement-date">
                    ${escapeHtml(
                        formatDate(
                            announcement.createdAt
                        )
                    )}
                </div>

            </div>


            <h2
                class="announcement-title"
            >
                ${escapeHtml(
                    announcement.title
                )}
            </h2>


            <p
                class="announcement-content"
            >
                ${escapeHtml(
                    announcement.content
                )}
            </p>

        </article>
    `;
}


loadAnnouncements();