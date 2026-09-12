const express = require("express");
const { z } = require("zod");

const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();


/*
    ---------------------------------------------------------
    GET ALL PUBLISHED ANNOUNCEMENTS
    ---------------------------------------------------------
*/

router.get("/", async (req, res) => {
    try {
        const announcements =
            await prisma.announcement.findMany({
                where: {
                    published: true
                },

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
                    }
                },

                orderBy: {
                    createdAt: "desc"
                }
            });

        res.json({
            announcements
        });

    } catch (error) {

        console.error(
            "Get announcements error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to fetch announcements"
        });
    }
});


/*
    ---------------------------------------------------------
    GET ALL ANNOUNCEMENTS FOR ORGANIZER DASHBOARD
    ---------------------------------------------------------
*/

router.get(
    "/manage",
    requireAuth,
    requireRole("ORGANIZER", "ADMIN"),
    async (req, res) => {

        try {

            let where = {};

            /*
                ADMIN can manage every announcement.
            */

            if (req.user.role === "ADMIN") {

                where = {};

            } else {

                /*
                    Organizers can only manage announcements
                    belonging to clubs they manage.
                */

                const memberships =
                    await prisma.clubMember.findMany({
                        where: {
                            userId: req.user.id,

                            role: {
                                in: [
                                    "OWNER",
                                    "MANAGER"
                                ]
                            }
                        },

                        select: {
                            clubId: true
                        }
                    });

                const clubIds =
                    memberships.map(
                        membership =>
                            membership.clubId
                    );

                where = {
                    clubId: {
                        in: clubIds
                    }
                };
            }


            const announcements =
                await prisma.announcement.findMany({

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
                        }
                    },

                    orderBy: {
                        createdAt: "desc"
                    }
                });


            res.json({
                announcements
            });

        } catch (error) {

            console.error(
                "Get manageable announcements error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to fetch organizer announcements"
            });
        }
    }
);


/*
    ---------------------------------------------------------
    GET SINGLE PUBLISHED ANNOUNCEMENT
    ---------------------------------------------------------
*/

router.get("/:id", async (req, res) => {

    try {

        const announcement =
            await prisma.announcement.findFirst({

                where: {
                    id: req.params.id,

                    published: true
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
                    }
                }
            });


        if (!announcement) {

            return res.status(404).json({
                message:
                    "Announcement not found"
            });
        }


        res.json({
            announcement
        });

    } catch (error) {

        console.error(
            "Get announcement error:",
            error
        );

        res.status(500).json({
            message:
                "Unable to fetch announcement"
        });
    }
});


/*
    ---------------------------------------------------------
    CREATE ANNOUNCEMENT
    ---------------------------------------------------------
*/

router.post(
    "/",
    requireAuth,
    requireRole("ORGANIZER", "ADMIN"),

    async (req, res) => {

        try {

            const announcementSchema =
                z.object({

                    title:
                        z.string()
                            .trim()
                            .min(3)
                            .max(200),

                    content:
                        z.string()
                            .trim()
                            .min(5)
                            .max(10000),

                    clubId:
                        z.string()
                            .uuid(),

                    published:
                        z.boolean()
                            .optional()
                });


            const data =
                announcementSchema.parse(
                    req.body
                );


            /*
                Check organizer permission
            */

            if (req.user.role !== "ADMIN") {

                const membership =
                    await prisma.clubMember.findFirst({

                        where: {

                            userId:
                                req.user.id,

                            clubId:
                                data.clubId,

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
                            "You do not have permission to create announcements for this club"
                    });
                }
            }


            const announcement =
                await prisma.announcement.create({

                    data: {

                        title:
                            data.title,

                        content:
                            data.content,

                        clubId:
                            data.clubId,

                        createdById:
                            req.user.id,

                        published:
                            data.published ?? true
                    },

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
                        }
                    }
                });


            res.status(201).json({

                message:
                    "Announcement created successfully",

                announcement
            });

        } catch (error) {

            if (
                error instanceof z.ZodError
            ) {

                return res.status(400).json({

                    message:
                        "Invalid announcement details",

                    errors:
                        error.issues
                });
            }


            console.error(
                "Create announcement error:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to create announcement"
            });
        }
    }
);


/*
    ---------------------------------------------------------
    PUBLISH / UNPUBLISH ANNOUNCEMENT
    ---------------------------------------------------------
*/

router.patch(
    "/:id/publish",

    requireAuth,

    requireRole(
        "ORGANIZER",
        "ADMIN"
    ),

    async (req, res) => {

        try {

            const schema =
                z.object({
                    published:
                        z.boolean()
                });


            const data =
                schema.parse(
                    req.body
                );


            const announcement =
                await prisma.announcement.findUnique({

                    where: {
                        id: req.params.id
                    },

                    select: {

                        id: true,

                        title: true,

                        clubId: true,

                        published: true
                    }
                });


            if (!announcement) {

                return res.status(404).json({

                    message:
                        "Announcement not found"
                });
            }


            /*
                ADMIN can manage everything.
                ORGANIZER must manage the club.
            */

            if (
                req.user.role !== "ADMIN"
            ) {

                const membership =
                    await prisma.clubMember.findFirst({

                        where: {

                            userId:
                                req.user.id,

                            clubId:
                                announcement.clubId,

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
                            "You do not have permission to manage this announcement"
                    });
                }
            }


            const updatedAnnouncement =
                await prisma.announcement.update({

                    where: {
                        id:
                            announcement.id
                    },

                    data: {

                        published:
                            data.published
                    },

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
                        }
                    }
                });


            res.json({

                message:
                    data.published
                        ? "Announcement published successfully"
                        : "Announcement unpublished successfully",

                announcement:
                    updatedAnnouncement
            });

        } catch (error) {

            if (
                error instanceof z.ZodError
            ) {

                return res.status(400).json({

                    message:
                        "Invalid publish status"
                });
            }


            console.error(
                "Publish announcement error:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to update announcement"
            });
        }
    }
);


module.exports = router;