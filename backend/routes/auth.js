const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const registerSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email(),
    password: z.string().min(8).max(100),
    course: z.string().trim().max(100).optional(),
    branch: z.string().trim().max(100).optional(),
    year: z.number().int().min(1).max(6).optional()
});

const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1)
});

function createToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

function setAuthCookie(res, token) {
    res.cookie("catalyst_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
}

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const data = registerSchema.parse(req.body);

        const email = data.email.toLowerCase();

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }

        const passwordHash = await bcrypt.hash(data.password, 12);

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email,
                passwordHash,
                course: data.course,
                branch: data.branch,
                year: data.year
            },
            select: {
                id: true,
                name: true,
                email: true,
                course: true,
                branch: true,
                year: true,
                role: true
            }
        });

        const token = createToken(user.id);

        setAuthCookie(res, token);

        res.status(201).json({
            message: "Account created successfully",
            user
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Invalid registration details",
                errors: error.issues
            });
        }

        console.error("Registration error:", error);

        res.status(500).json({
            message: "Unable to create account"
        });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const data = loginSchema.parse(req.body);

        const email = data.email.toLowerCase();

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatches = await bcrypt.compare(
            data.password,
            user.passwordHash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = createToken(user.id);

        setAuthCookie(res, token);

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                course: user.course,
                branch: user.branch,
                year: user.year,
                role: user.role
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: "Invalid login details"
            });
        }

        console.error("Login error:", error);

        res.status(500).json({
            message: "Unable to login"
        });
    }
});

// LOGOUT
router.post("/logout", (req, res) => {
    res.clearCookie("catalyst_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    res.json({
        message: "Logged out successfully"
    });
});
// CURRENT USER
router.get("/me", requireAuth, (req, res) => {
    res.json({
        user: req.user
    });
});

module.exports = router;