const API_BASE_URL = "http://localhost:5000/api";

const form =
    document.getElementById("createClubForm");

const submitButton =
    document.getElementById("submitButton");

const message =
    document.getElementById("message");


form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        submitButton.disabled = true;
        submitButton.textContent =
            "Creating...";

        message.classList.add(
            "hidden"
        );

        const payload = {
            name:
                document
                    .getElementById("name")
                    .value
                    .trim(),

            description:
                document
                    .getElementById("description")
                    .value
                    .trim() || undefined,

            logoUrl:
                document
                    .getElementById("logoUrl")
                    .value
                    .trim() || undefined,

            contactEmail:
                document
                    .getElementById("contactEmail")
                    .value
                    .trim() || undefined
        };


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/clubs`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials:
                            "include",

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );


            const data =
                await response.json();


            if (response.status === 401) {

                window.location.href =
                    "login.html";

                return;
            }


            if (!response.ok) {

                const error =
                    new Error(
                        data.message ||
                        "Unable to create club"
                    );

                error.details =
                    data.errors;

                throw error;
            }


            message.textContent =
                "CLUB CREATED SUCCESSFULLY.";

            message.classList.remove(
                "hidden"
            );


            form.reset();


            setTimeout(
                () => {

                    window.location.href =
                        `club.html?id=${encodeURIComponent(
                            data.club.id
                        )}`;

                },
                700
            );


        } catch (error) {

            console.error(
                "Create club error:",
                error
            );


            message.textContent =
                error.message ||
                "Unable to create club.";

            message.classList.remove(
                "hidden"
            );

        } finally {

            submitButton.disabled =
                false;

            submitButton.textContent =
                "Create Club →";
        }
    }
);