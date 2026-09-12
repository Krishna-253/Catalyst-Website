require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");

const prisma = require("./lib/prisma");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const clubRoutes = require("./routes/clubs");
const meRoutes = require("./routes/me");
const organizerRoutes = require("./routes/organizer");
const announcementRoutes = require("./routes/announcements");

const app = express();

const PORT = 5000;


/*
    ---------------------------------------------------------
    SECURITY
    ---------------------------------------------------------
*/

app.use(helmet());


/*
    ---------------------------------------------------------
    CORS
    ---------------------------------------------------------
*/

app.use(
    cors({
        origin: "http://localhost:8000",
        credentials: true
    })
);


/*
    ---------------------------------------------------------
    BODY PARSING
    ---------------------------------------------------------
*/

app.use(express.json());

app.use(cookieParser());


/*
    ---------------------------------------------------------
    API ROUTES
    ---------------------------------------------------------
*/

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/events",
    eventRoutes
);

app.use(
    "/api/clubs",
    clubRoutes
);

app.use(
    "/api/me",
    meRoutes
);

app.use(
    "/api/organizer",
    organizerRoutes
);

app.use(
    "/api/announcements",
    announcementRoutes
);


/*
    ---------------------------------------------------------
    HEALTH CHECK
    ---------------------------------------------------------
*/

app.get(
    "/api/health",
    async (req, res) => {
        try {
            await prisma.$queryRaw`SELECT 1`;

            res.json({
                status: "ok",
                message:
                    "Catalyst backend is running",
                database: "connected"
            });
        } catch (error) {
            console.error(
                "Database connection failed:",
                error
            );

            res.status(500).json({
                status: "error",
                message:
                    "Backend is running, but database connection failed"
            });
        }
    }
);


/*
    ---------------------------------------------------------
    START SERVER
    ---------------------------------------------------------
*/

app.listen(
    PORT,
    () => {
        console.log(
            `Server running on http://localhost:${PORT}`
        );
    }
);