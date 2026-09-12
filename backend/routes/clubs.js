const express = require("express");
const { z } = require("zod");

const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();


// GET ALL CLUBS
// Public endpoint
router.get("/", async (req, res) => {
    try {
        const clubs = await prisma.club.findMany({
            include: {
                _count: {
                    select: {
                        members: true,
                        events: true
                    }
                }
            },
            orderBy: {
                name: "asc"
            }
        });

        res.json({
            clubs: clubs.map(club => ({
                id: club.id,
                name: club.name,
                slug: club.slug,
                description: club.description,
                logoUrl: club.logoUrl,
                contactEmail: club.contactEmail,
                memberCount: club._count.members,
                eventCount: club._count.events
            }))
        });
    } catch (error) {
        console.error("Get clubs error:", error);

        res.status(500).json({
            message: "Unable to fetch clubs"
        });
    }
});


// GET SINGLE CLUB
// Public endpoint
router.get("/:id", async (req, res) => {
    try {
        const club = await prisma.club.findFirst({
            where: {
                OR: [
                    { id: req.params.id },
                    { slug: req.params.id }
                ]
            },
            include: {
                events: {
                    where: {
                        approvalStatus: "PUBLISHED"
                    },
                    orderBy: {
                        eventStart: "asc"
                    },
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        category: true,
                        bannerUrl: true,
                        registrationStart: true,
                        registrationEnd: true,
                        eventStart: true,
                        eventEnd: true,
                        capacity: true
                    }
                },
                _count: {
                    select: {
                        members: true,
                        events: true
                    }
                }
            }
        });

        if (!club) {
            return res.status(404).json({
                message: "Club not found"
            });
        }

        res.json({
            club: {
                id: club.id,
                name: club.name,
                slug: club.slug,
                description: club.description,
                logoUrl: club.logoUrl,
                contactEmail: club.contactEmail,
                memberCount: club._count.members,
                eventCount: club._count.events,
                events: club.events
            }
        });
    } catch (error) {
        console.error("Get club error:", error);

        res.status(500).json({
            message: "Unable to fetch club"
        });
    }
});


// CREATE CLUB
// Organizer/Admin only
router.post(
    "/",
    requireAuth,
    requireRole("ORGANIZER", "ADMIN"),
    async (req, res) => {
        try {
            const clubSchema = z.object({
                name: z.string().trim().min(2).max(100),
                description: z.string().trim().max(2000).optional(),
                logoUrl: z.string().url().optional(),
                contactEmail: z.string().email().optional()
            });

            const data = clubSchema.parse(req.body);

            const slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

            const existingClub = await prisma.club.findFirst({
                where: {
                    OR: [
                        { name: data.name },
                        { slug }
                    ]
                }
            });

            if (existingClub) {
                return res.status(409).json({
                    message: "A club with this name already exists"
                });
            }

            const club = await prisma.club.create({
                data: {
                    name: data.name,
                    slug,
                    description: data.description,
                    logoUrl: data.logoUrl,
                    contactEmail: data.contactEmail,

                    members: {
                        create: {
                            userId: req.user.id,
                            role: "OWNER"
                        }
                    }
                },
                include: {
                    members: {
                        where: {
                            userId: req.user.id
                        },
                        select: {
                            role: true
                        }
                    }
                }
            });

            res.status(201).json({
                message: "Club created successfully",
                club: {
                    id: club.id,
                    name: club.name,
                    slug: club.slug,
                    description: club.description,
                    logoUrl: club.logoUrl,
                    contactEmail: club.contactEmail,
                    yourRole: club.members[0]?.role
                }
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Invalid club details",
                    errors: error.issues
                });
            }

            console.error("Create club error:", error);

            res.status(500).json({
                message: "Unable to create club"
            });
        }
    }
);


// GET MY CLUBS
router.get(
    "/user/my",
    requireAuth,
    async (req, res) => {
        try {
            const memberships = await prisma.clubMember.findMany({
                where: {
                    userId: req.user.id
                },
                include: {
                    club: {
                        include: {
                            _count: {
                                select: {
                                    members: true,
                                    events: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    joinedAt: "desc"
                }
            });

            res.json({
                clubs: memberships.map(membership => ({
                    id: membership.club.id,
                    name: membership.club.name,
                    slug: membership.club.slug,
                    description: membership.club.description,
                    logoUrl: membership.club.logoUrl,
                    role: membership.role,
                    memberCount: membership.club._count.members,
                    eventCount: membership.club._count.events
                }))
            });
        } catch (error) {
            console.error("Get my clubs error:", error);

            res.status(500).json({
                message: "Unable to fetch your clubs"
            });
        }
    }
);


module.exports = router;