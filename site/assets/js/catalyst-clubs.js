const API_BASE_URL =
    "http://localhost:5000/api";

const clubsGrid =
    document.getElementById("clubsGrid");

const clubCount =
    document.getElementById("clubCount");


function escapeHtml(value) {
    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


async function loadClubs() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/clubs`
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Unable to load clubs"
            );
        }

        renderClubs(
            data.clubs || []
        );

    } catch (error) {

        console.error(
            "Clubs error:",
            error
        );

        clubsGrid.innerHTML = `
            <div class="clubs-message">

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

        clubCount.textContent =
            "ERROR";
    }
}


function renderClubs(clubs) {

    clubCount.textContent =
        `${clubs.length} CLUB${
            clubs.length === 1
                ? ""
                : "S"
        }`;


    if (!clubs.length) {

        clubsGrid.innerHTML = `
            <div class="clubs-message">

                <h2>
                    NO CLUBS YET
                </h2>

                <p>
                    Campus clubs will appear here
                    once they are added.
                </p>

            </div>
        `;

        return;
    }


    clubsGrid.innerHTML =
        clubs
            .map(
                (club, index) =>
                    renderClubCard(
                        club,
                        index
                    )
            )
            .join("");
}


function renderClubCard(
    club,
    index
) {

    return `
        <article class="club-card">

            <div class="club-number">
                ${String(
                    index + 1
                ).padStart(2, "0")}
            </div>


            <h2 class="club-title">
                ${escapeHtml(
                    club.name
                )}
            </h2>


            <p class="club-description">
                ${escapeHtml(
                    club.description ||
                    "A Catalyst campus community."
                )}
            </p>


            <div class="club-meta">

                <span>
                    ${club.memberCount}
                    MEMBERS
                </span>

                <span>
                    ${club.eventCount}
                    EVENTS
                </span>

            </div>


            <a
                href="club.html?id=${encodeURIComponent(
                    club.id
                )}"
                class="club-button"
            >
                View Club →
            </a>

        </article>
    `;
}


loadClubs();