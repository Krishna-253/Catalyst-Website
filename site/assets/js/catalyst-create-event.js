const API_BASE_URL = "http://localhost:5000/api";

const form =
    document.getElementById("createEventForm");

const clubSelect =
    document.getElementById("clubId");

const submitButton =
    document.getElementById("createSubmit");

const message =
    document.getElementById("createMessage");


/*
    ---------------------------------------------------------
    Helpers
    ---------------------------------------------------------
*/

function showMessage(text, type) {

    message.textContent = text;

    message.className =
        `create-message visible ${type}`;
}


function getOptionalValue(id) {

    const value =
        document.getElementById(id).value.trim();

    return value || undefined;
}


function getDateValue(id) {

    const value =
        document.getElementById(id).value;

    if (!value) {
        return null;
    }

    /*
        datetime-local has no timezone information.

        Adding seconds and treating it as a local browser
        date gives us a valid ISO timestamp for the API.
    */

    return new Date(value).toISOString();
}


/*
    ---------------------------------------------------------
    Load organizer's clubs
    ---------------------------------------------------------
*/

async function loadClubs() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/clubs/user/my`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (response.status === 401) {

            showMessage(
                "Please log in before creating an event.",
                "error"
            );

            clubSelect.innerHTML = `
                <option value="">
                    LOGIN REQUIRED
                </option>
            `;

            return;
        }


        if (response.status === 403) {

            showMessage(
                "This account does not have organizer permissions.",
                "error"
            );

            clubSelect.innerHTML = `
                <option value="">
                    ACCESS DENIED
                </option>
            `;

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load your clubs"
            );
        }


        const clubs =
            data.clubs || [];


        if (clubs.length === 0) {

            clubSelect.innerHTML = `
                <option value="">
                    NO MANAGED CLUBS
                </option>
            `;

            showMessage(
                "You need to manage a club before creating an event.",
                "error"
            );

            return;
        }


        clubSelect.innerHTML = `
            <option value="">
                SELECT CLUB
            </option>
        `;


        clubs.forEach(club => {

            const option =
                document.createElement("option");

            option.value = club.id;

            option.textContent =
                `${club.name} (${club.role})`;

            clubSelect.appendChild(option);

        });


    } catch (error) {

        console.error(
            "Load clubs error:",
            error
        );

        clubSelect.innerHTML = `
            <option value="">
                ERROR LOADING CLUBS
            </option>
        `;

        showMessage(
            error.message,
            "error"
        );
    }
}


/*
    ---------------------------------------------------------
    Submit event
    ---------------------------------------------------------
*/

form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        message.className =
            "create-message";


        /*
            Validate dates before sending.
        */

        const registrationStart =
            getDateValue(
                "registrationStart"
            );

        const registrationEnd =
            getDateValue(
                "registrationEnd"
            );

        const eventStart =
            getDateValue(
                "eventStart"
            );

        const eventEnd =
            getDateValue(
                "eventEnd"
            );


        if (
            !registrationStart ||
            !registrationEnd ||
            !eventStart ||
            !eventEnd
        ) {

            showMessage(
                "Please fill in all required dates.",
                "error"
            );

            return;
        }


        const registrationStartDate =
            new Date(registrationStart);

        const registrationEndDate =
            new Date(registrationEnd);

        const eventStartDate =
            new Date(eventStart);

        const eventEndDate =
            new Date(eventEnd);


        if (
            registrationEndDate <=
            registrationStartDate
        ) {

            showMessage(
                "Registration closing time must be after registration opening time.",
                "error"
            );

            return;
        }


        if (
            eventEndDate <=
            eventStartDate
        ) {

            showMessage(
                "Event end time must be after event start time.",
                "error"
            );

            return;
        }


        if (
            registrationEndDate >
            eventStartDate
        ) {

            showMessage(
                "Registration must close before the event starts.",
                "error"
            );

            return;
        }


        /*
            Build request body.
        */

        const capacityValue =
            document
                .getElementById("capacity")
                .value;


        const body = {

            title:
                document
                    .getElementById("title")
                    .value
                    .trim(),

            description:
                document
                    .getElementById("description")
                    .value
                    .trim(),

            category:
                document
                    .getElementById("category")
                    .value
                    .trim(),

            clubId:
                clubSelect.value,


            venue:
                getOptionalValue("venue"),

            eligibility:
                getOptionalValue("eligibility"),

            rules:
                getOptionalValue("rules"),

            prizes:
                getOptionalValue("prizes"),

            timeline:
                getOptionalValue("timeline"),


            registrationStart,

            registrationEnd,

            eventStart,

            eventEnd,


            capacity:
                capacityValue
                    ? Number(capacityValue)
                    : undefined,


            bannerUrl:
                getOptionalValue("bannerUrl"),

            brochureUrl:
                getOptionalValue("brochureUrl")
        };


        /*
            Basic frontend validation.
        */

        if (
            !body.title ||
            !body.description ||
            !body.category ||
            !body.clubId
        ) {

            showMessage(
                "Please fill in the required fields.",
                "error"
            );

            return;
        }


        submitButton.disabled = true;

        submitButton.textContent =
            "SUBMITTING...";


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/events`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials: "include",

                        body:
                            JSON.stringify(body)
                    }
                );


            const data =
                await response.json();


            if (response.status === 401) {

                throw new Error(
                    "Your login session has expired. Please log in again."
                );
            }


            if (response.status === 403) {

                throw new Error(
                    data.message ||
                    "You do not have permission to create events for this club."
                );
            }


            if (!response.ok) {

                if (
                    data.errors &&
                    Array.isArray(data.errors)
                ) {

                    const firstError =
                        data.errors[0];

                    throw new Error(
                        firstError.message ||
                        "Invalid event details."
                    );
                }

                throw new Error(
                    data.message ||
                    "Unable to create event."
                );
            }


            showMessage(
                "Event submitted successfully. It is now pending approval.",
                "success"
            );


            submitButton.textContent =
                "EVENT SUBMITTED ✓";


            /*
                Give the user time to see the success message,
                then return to the organizer dashboard.
            */

            setTimeout(
                () => {

                    window.location.href =
                        "organizer.html";

                },
                1200
            );


        } catch (error) {

            console.error(
                "Create event error:",
                error
            );


            showMessage(
                error.message,
                "error"
            );


            submitButton.disabled =
                false;

            submitButton.textContent =
                "SUBMIT EVENT →";
        }

    }
);


/*
    ---------------------------------------------------------
    Start
    ---------------------------------------------------------
*/

loadClubs();