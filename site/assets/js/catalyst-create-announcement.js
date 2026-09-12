const API_BASE = "http://localhost:5000/api";

const form = document.getElementById("announcementForm");
const clubSelect = document.getElementById("club");
const message = document.getElementById("message");
const submitButton = document.getElementById("submitButton");


// ---------------------------------------------------------
// SHOW MESSAGE
// ---------------------------------------------------------

function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}


// ---------------------------------------------------------
// LOAD MY CLUBS
// ---------------------------------------------------------

async function loadClubs() {
    try {
        const response = await fetch(
            `${API_BASE}/clubs/user/my`,
            {
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error("Unable to load clubs");
        }

        const data = await response.json();

        clubSelect.innerHTML = "";

        if (!data.clubs || data.clubs.length === 0) {
            clubSelect.innerHTML =
                `<option value="">No clubs available</option>`;

            showMessage(
                "You are not a manager or owner of any club yet.",
                "error"
            );

            submitButton.disabled = true;

            return;
        }

        const defaultOption = document.createElement("option");

        defaultOption.value = "";
        defaultOption.textContent = "Select a club";

        clubSelect.appendChild(defaultOption);

        data.clubs.forEach(club => {
            const option = document.createElement("option");

            option.value = club.id;
            option.textContent = `${club.name} (${club.role})`;

            clubSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Load clubs error:", error);

        clubSelect.innerHTML =
            `<option value="">Unable to load clubs</option>`;

        showMessage(
            "Unable to load your clubs. Make sure you are logged in as an organizer.",
            "error"
        );
    }
}


// ---------------------------------------------------------
// CREATE ANNOUNCEMENT
// ---------------------------------------------------------

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const clubId = clubSelect.value;
    const title =
        document.getElementById("title").value.trim();

    const content =
        document.getElementById("content").value.trim();

    const published =
        document.getElementById("published").checked;


    if (!clubId) {
        showMessage(
            "Please select a club.",
            "error"
        );

        return;
    }


    if (!title) {
        showMessage(
            "Please enter an announcement title.",
            "error"
        );

        return;
    }


    if (!content) {
        showMessage(
            "Please write the announcement.",
            "error"
        );

        return;
    }


    submitButton.disabled = true;
    submitButton.textContent = "Creating...";

    try {
        const response = await fetch(
            `${API_BASE}/announcements`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    clubId,
                    title,
                    content,
                    published
                })
            }
        );

        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.message ||
                "Unable to create announcement"
            );
        }


        showMessage(
            "Announcement created successfully!",
            "success"
        );


        setTimeout(() => {
            window.location.href =
                "organizer.html";
        }, 1000);


    } catch (error) {
        console.error(
            "Create announcement error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to create announcement.",
            "error"
        );

        submitButton.disabled = false;
        submitButton.textContent =
            "Create Announcement";
    }
});


// ---------------------------------------------------------
// START
// ---------------------------------------------------------

loadClubs();