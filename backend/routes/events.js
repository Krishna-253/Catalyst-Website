const express = require("express");
const { z } = require("zod");

const prisma = require("../lib/prisma");
const { getEventStatus } = require("../lib/eventStatus");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET ALL EVENTS
router.get("/", async (req, res) => {
    try {
        const {
            search,
            category,
            club,
            status,
            page = "1",
            limit = "12"
        } = req.query;

        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.min(
            Math.max(parseInt(limit, 10) || 12, 1),
            50
        );

        const where = {
            approvalStatus: "PUBLISHED"
        };

        if (search) {
            where.OR = [
                {
                    title: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    description: {
                        contains: search,
                        mode: "insensitive"
                    }
                }
            ];
        }

        if (category) {
            where.category = category;
        }

        if (club) {
            where.club = {
                slug: club
            };
        }

        const events = await prisma.event.findMany({
            where,
            include: {
                club: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logoUrl: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        registrations: {
                            where: {
                                status: "REGISTERED"
                            }
                        }
                    }
                }
            },
            orderBy: {
                eventStart: "asc"
            }
        });

        let formattedEvents = events.map(event => ({
            ...event,
            status: getEventStatus(event),
            registrationCount: event._count.registrations,
            _count: undefined
        }));

        if (status) {
            formattedEvents = formattedEvents.filter(
                event => event.status === status.toUpperCase()
            );
        }

        const total = formattedEvents.length;

        const paginatedEvents = formattedEvents.slice(
            (pageNumber - 1) * limitNumber,
            pageNumber * limitNumber
        );

        res.json({
            events: paginatedEvents,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                pages: Math.ceil(total / limitNumber)
            }
        });

    } catch (error) {
        console.error("Get events error:", error);

        res.status(500).json({
            message: "Unable to fetch events"
        });
    }
});

// GET SINGLE EVENT
router.get("/:id", async (req, res) => {
    try {
        const event = await prisma.event.findFirst({
            where: {
                OR: [
                    { id: req.params.id },
                    { slug: req.params.id }
                ],
                approvalStatus: "PUBLISHED"
            },
            include: {
                club: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                        logoUrl: true,
                        contactEmail: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        registrations: {
                            where: {
                                status: "REGISTERED"
                            }
                        }
                    }
                }
            }
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json({
            event: {
                ...event,
                status: getEventStatus(event),
                registrationCount: event._count.registrations,
                _count: undefined
            }
        });

    } catch (error) {
        console.error("Get event error:", error);

        res.status(500).json({
            message: "Unable to fetch event"
        });
    }
});

// CREATE EVENT
router.post(
    "/",
    requireAuth,
    requireRole("ORGANIZER", "ADMIN"),
    async (req, res) => {
        try {
            const eventSchema = z.object({
                title: z.string().trim().min(3).max(200),
                description: z.string().min(10),
                category: z.string().trim().min(2).max(100),
                clubId: z.string().uuid(),

                bannerUrl: z.string().url().optional(),
                brochureUrl: z.string().url().optional(),

                venue: z.string().trim().max(300).optional(),
                eligibility: z.string().max(2000).optional(),
                rules: z.string().max(5000).optional(),
                prizes: z.string().max(5000).optional(),
                timeline: z.string().max(5000).optional(),

                registrationStart: z.coerce.date(),
                registrationEnd: z.coerce.date(),
                eventStart: z.coerce.date(),
                eventEnd: z.coerce.date(),

                capacity: z.number().int().positive().optional()
            });

            const data = eventSchema.parse(req.body);

            if (data.registrationEnd < data.registrationStart) {
                return res.status(400).json({
                    message: "Registration end must be after registration start"
                });
            }

            if (data.eventEnd < data.eventStart) {
                return res.status(400).json({
                    message: "Event end must be after event start"
                });
            }

            if (data.registrationEnd > data.eventStart) {
                return res.status(400).json({
                    message: "Registration must end before the event starts"
                });
            }

            const clubMember = await prisma.clubMember.findFirst({
                where: {
                    clubId: data.clubId,
                    userId: req.user.id,
                    role: {
                        in: ["OWNER", "MANAGER"]
                    }
                }
            });

            if (
                req.user.role !== "ADMIN" &&
                !clubMember
            ) {
                return res.status(403).json({
                    message: "You are not authorized to create events for this club"
                });
            }

            const slug = data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "") +
                "-" +
                Date.now();

            const event = await prisma.event.create({
                data: {
                    ...data,
                    slug,
                    createdById: req.user.id,
                    approvalStatus: "PENDING_APPROVAL"
                }
            });

            res.status(201).json({
                message: "Event submitted for approval",
                event: {
                    ...event,
                    status: getEventStatus(event)
                }
            });

        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Invalid event details",
                    errors: error.issues
                });
            }

            console.error("Create event error:", error);

            res.status(500).json({
                message: "Unable to create event"
            });
        }
    }
);

// REGISTER FOR EVENT
router.post(
    "/:id/register",
    requireAuth,
    async (req, res) => {
        try {
            const event = await prisma.event.findFirst({
                where: {
                    OR: [
                        { id: req.params.id },
                        { slug: req.params.id }
                    ],
                    approvalStatus: "PUBLISHED"
                },
                include: {
                    _count: {
                        select: {
                            registrations: {
                                where: {
                                    status: "REGISTERED"
                                }
                            }
                        }
                    }
                }
            });

            if (!event) {
                return res.status(404).json({
                    message: "Event not found"
                });
            }

            const eventStatus = getEventStatus(event);

            if (eventStatus !== "REGISTRATION_OPEN") {
                return res.status(400).json({
                    message: `Registration is not currently open. Event status: ${eventStatus}`
                });
            }

            const result = await prisma.$transaction(async tx => {
                const existingRegistration =
                    await tx.registration.findUnique({
                        where: {
                            eventId_userId: {
                                eventId: event.id,
                                userId: req.user.id
                            }
                        }
                    });

                if (
                    existingRegistration &&
                    existingRegistration.status === "REGISTERED"
                ) {
                    return {
                        type: "ALREADY_REGISTERED",
                        registration: existingRegistration
                    };
                }

                const registeredCount =
                    await tx.registration.count({
                        where: {
                            eventId: event.id,
                            status: "REGISTERED"
                        }
                    });

                if (
                    event.capacity !== null &&
                    registeredCount >= event.capacity
                ) {
                    return {
                        type: "FULL"
                    };
                }

                if (existingRegistration) {
                    const registration =
                        await tx.registration.update({
                            where: {
                                id: existingRegistration.id
                            },
                            data: {
                                status: "REGISTERED"
                            }
                        });

                    return {
                        type: "REGISTERED",
                        registration
                    };
                }

                const registration =
                    await tx.registration.create({
                        data: {
                            eventId: event.id,
                            userId: req.user.id,
                            status: "REGISTERED"
                        }
                    });

                return {
                    type: "REGISTERED",
                    registration
                };
            });

            if (result.type === "ALREADY_REGISTERED") {
                return res.status(409).json({
                    message: "You are already registered for this event",
                    registration: result.registration
                });
            }

            if (result.type === "FULL") {
                return res.status(409).json({
                    message: "This event is full"
                });
            }

            res.status(201).json({
                message: "Successfully registered for the event",
                registration: result.registration
            });

        } catch (error) {
            console.error("Event registration error:", error);

            res.status(500).json({
                message: "Unable to register for event"
            });
        }
    }
);

// CANCEL EVENT REGISTRATION
router.delete(
    "/:id/register",
    requireAuth,
    async (req, res) => {
        try {
            const event = await prisma.event.findFirst({
                where: {
                    OR: [
                        { id: req.params.id },
                        { slug: req.params.id }
                    ],
                    approvalStatus: "PUBLISHED"
                }
            });

            if (!event) {
                return res.status(404).json({
                    message: "Event not found"
                });
            }

            const registration =
                await prisma.registration.findUnique({
                    where: {
                        eventId_userId: {
                            eventId: event.id,
                            userId: req.user.id
                        }
                    }
                });

            if (
                !registration ||
                registration.status === "CANCELLED"
            ) {
                return res.status(404).json({
                    message: "You are not registered for this event"
                });
            }

            const updatedRegistration =
                await prisma.registration.update({
                    where: {
                        id: registration.id
                    },
                    data: {
                        status: "CANCELLED"
                    }
                });

            res.json({
                message: "Event registration cancelled",
                registration: updatedRegistration
            });

        } catch (error) {
            console.error("Cancel registration error:", error);

            res.status(500).json({
                message: "Unable to cancel registration"
            });
        }
    }
);

module.exports = router;