const express = require("express");

const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");
const { getEventStatus } = require("../lib/eventStatus");

const router = express.Router();

/*
    ---------------------------------------------------------
    ORGANIZER DASHBOARD
    ---------------------------------------------------------
*/

router.get(
    "/dashboard",
    requireAuth,
    requireRole("ORGANIZER", "ADMIN"),
    async (req, res) => {
        try {
            let clubIds = [];

            /*
                ADMIN can see everything.

                ORGANIZER can only see clubs where they are
                an OWNER or MANAGER.
            */

            if (req.user.role === "ADMIN") {
                const clubs = await prisma.club.findMany({
                    select: {
                        id: true
                    }
                });

                clubIds = clubs.map(club => club.id);
            } else {
                const memberships = await prisma.clubMember.findMany({
                    where: {
                        userId: req.user.id,
                        role: {
                            in: ["OWNER", "MANAGER"]
                        }
                    },
                    select: {
                        clubId: true
                    }
                });

                clubIds = memberships.map(
                    membership => membership.clubId
                );
            }

            const [
                clubs,
                events,
                registrationCount
            ] = await Promise.all([
                prisma.club.findMany({
                    where: {
                        id: {
                            in: clubIds
                        }
                    },
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
                }),

                prisma.event.findMany({
                    where: {
                        clubId: {
                            in: clubIds
                        }
                    },
                    include: {
                        club: {
                            select: {
                                id: true,
                                name: true,
                                slug: true
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
                        createdAt: "desc"
                    },
                    take: 50
                }),

                prisma.registration.count({
                    where: {
                        status: "REGISTERED",
                        event: {
                            clubId: {
                                in: clubIds
                            }
                        }
                    }
                })
            ]);

            const formattedEvents = events.map(event => ({
                id: event.id,
                title: event.title,
                slug: event.slug,
                category: event.category,

                registrationStart: event.registrationStart,
                registrationEnd: event.registrationEnd,

                eventStart: event.eventStart,
                eventEnd: event.eventEnd,

                capacity: event.capacity,

                approvalStatus: event.approvalStatus,

                status:
                    getEventStatus(event),

                registrationCount:
                    event._count.registrations,

                club: event.club,

                createdAt: event.createdAt,
                updatedAt: event.updatedAt
            }));

            const pendingEvents =
                formattedEvents.filter(
                    event =>
                        event.approvalStatus ===
                        "PENDING_APPROVAL"
                ).length;

            const publishedEvents =
                formattedEvents.filter(
                    event =>
                        event.approvalStatus ===
                        "PUBLISHED"
                ).length;

            res.json({
                summary: {
                    clubCount: clubs.length,
                    eventCount: events.length,
                    publishedEventCount: publishedEvents,
                    pendingEventCount: pendingEvents,
                    registrationCount
                },

                clubs: clubs.map(club => ({
                    id: club.id,
                    name: club.name,
                    slug: club.slug,
                    description: club.description,
                    logoUrl: club.logoUrl,
                    contactEmail: club.contactEmail,

                    memberCount:
                        club._count.members,

                    eventCount:
                        club._count.events
                })),

                events: formattedEvents
            });

        } catch (error) {
            console.error(
                "Organizer dashboard error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to load organizer dashboard"
            });
        }
    }
);


/*
    ---------------------------------------------------------
    VIEW REGISTRATIONS FOR AN EVENT
    ---------------------------------------------------------
*/

router.get(
    "/events/:id/registrations",
    requireAuth,
    requireRole("ORGANIZER", "ADMIN"),
    async (req, res) => {
        try {
            const event = await prisma.event.findUnique({
                where: {
                    id: req.params.id
                },
                select: {
                    id: true,
                    title: true,
                    clubId: true
                }
            });

            if (!event) {
                return res.status(404).json({
                    message: "Event not found"
                });
            }

            /*
                ADMIN can access any event.

                ORGANIZER must be an OWNER or MANAGER
                of the event's club.
            */

            if (req.user.role !== "ADMIN") {
                const membership =
                    await prisma.clubMember.findFirst({
                        where: {
                            userId: req.user.id,
                            clubId: event.clubId,
                            role: {
                                in: [
                                    "OWNER",
                                    "MANAGER"
                                ]
                            }
                        }
                    });

                if (!membership) {
                    return res.status(403).json({
                        message:
                            "You do not have permission to view registrations for this event"
                    });
                }
            }

            const registrations =
                await prisma.registration.findMany({
                    where: {
                        eventId: event.id,
                        status: "REGISTERED"
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                course: true,
                                branch: true,
                                year: true
                            }
                        }
                    },
                    orderBy: {
                        registeredAt: "asc"
                    }
                });

            res.json({
                event: {
                    id: event.id,
                    title: event.title
                },

                registrationCount:
                    registrations.length,

                registrations: registrations.map(
                    registration => ({
                        id: registration.id,
                        registeredAt:
                            registration.registeredAt,

                        user:
                            registration.user
                    })
                )
            });

        } catch (error) {
            console.error(
                "Get event registrations error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to fetch event registrations"
            });
        }
    }
);


/*
    ---------------------------------------------------------
    ENDPOINT
    ---------------------------------------------------------
*/

module.exports = router;