const express = require("express");

const prisma = require("../lib/prisma");
const { getEventStatus } = require("../lib/eventStatus");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET MY REGISTERED EVENTS
router.get("/events", requireAuth, async (req, res) => {
    try {
        const registrations = await prisma.registration.findMany({
            where: {
                userId: req.user.id,
                status: "REGISTERED"
            },
            include: {
                event: {
                    include: {
                        club: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                logoUrl: true
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
                }
            },
            orderBy: {
                registeredAt: "desc"
            }
        });

        const events = registrations.map(registration => ({
            registrationId: registration.id,
            registeredAt: registration.registeredAt,

            event: {
                id: registration.event.id,
                title: registration.event.title,
                slug: registration.event.slug,
                description: registration.event.description,
                category: registration.event.category,

                bannerUrl: registration.event.bannerUrl,
                brochureUrl: registration.event.brochureUrl,

                venue: registration.event.venue,
                eligibility: registration.event.eligibility,
                rules: registration.event.rules,
                prizes: registration.event.prizes,
                timeline: registration.event.timeline,

                registrationStart: registration.event.registrationStart,
                registrationEnd: registration.event.registrationEnd,

                eventStart: registration.event.eventStart,
                eventEnd: registration.event.eventEnd,

                capacity: registration.event.capacity,
                registrationCount:
                    registration.event._count.registrations,

                status: getEventStatus(registration.event),

                club: registration.event.club
            }
        }));

        res.json({
            events
        });
    } catch (error) {
        console.error("Get my events error:", error);

        res.status(500).json({
            message: "Unable to fetch your events"
        });
    }
});

module.exports = router;