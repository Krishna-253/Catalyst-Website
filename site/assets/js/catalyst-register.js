const API_BASE_URL = "http://localhost:5000/api";

const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");
const registerButton = document.getElementById("registerButton");


function showMessage(message, type = "error") {
    registerMessage.textContent = message;

    registerMessage.className =
        `register-message visible ${type}`;
}


function setLoading(isLoading) {
    registerButton.disabled = isLoading;

    registerButton.textContent =
        isLoading
            ? "CREATING ACCOUNT..."
            : "CREATE ACCOUNT →";
}


registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const course =
        document.getElementById("course").value.trim();

    const branch =
        document.getElementById("branch").value.trim();

    const yearValue =
        document.getElementById("year").value;


    if (password !== confirmPassword) {
        showMessage("Passwords do not match.");
        return;
    }


    if (password.length < 8) {
        showMessage(
            "Password must be at least 8 characters long."
        );
        return;
    }


    const payload = {
        name,
        email,
        password
    };


    if (course) {
        payload.course = course;
    }


    if (branch) {
        payload.branch = branch;
    }


    if (yearValue) {
        payload.year = Number(yearValue);
    }


    setLoading(true);
    showMessage("Creating your account...", "success");


    try {
        const response = await fetch(
            `${API_BASE_URL}/auth/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                credentials: "include",

                body: JSON.stringify(payload)
            }
        );


        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.message ||
                "Unable to create account"
            );
        }


        showMessage(
            "Account created successfully. Redirecting...",
            "success"
        );


        setTimeout(() => {
            window.location.href = "events.html";
        }, 500);


    } catch (error) {
        console.error(
            "Registration error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to create account"
        );

        setLoading(false);
    }
});