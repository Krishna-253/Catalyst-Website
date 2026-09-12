const API_BASE_URL = "http://localhost:5000/api";

const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");


function showMessage(message, type) {

    loginMessage.textContent = message;

    loginMessage.className =
        `login-message visible ${type}`;
}


loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    loginButton.disabled = true;

    loginButton.textContent =
        "LOGGING IN...";


    loginMessage.className =
        "login-message";

    loginMessage.textContent =
        "";


    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to login"
            );
        }


        showMessage(
            `Welcome back, ${data.user.name}! Redirecting...`,
            "success"
        );


        loginButton.textContent =
            "LOGIN SUCCESSFUL ✓";


        /*
            Redirect based on account role.

            ORGANIZER / ADMIN
                → Organizer Dashboard

            STUDENT
                → Events
        */

        setTimeout(() => {

            if (
                data.user.role === "ORGANIZER" ||
                data.user.role === "ADMIN"
            ) {

                window.location.href =
                    "organizer.html";

                return;
            }


            window.location.href =
                "events.html";

        }, 900);


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showMessage(
            error.message,
            "error"
        );


        loginButton.disabled = false;

        loginButton.textContent =
            "LOGIN →";
    }

});