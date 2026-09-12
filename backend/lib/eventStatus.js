function getEventStatus(event) {
    const now = new Date();

    const registrationStart = new Date(event.registrationStart);
    const registrationEnd = new Date(event.registrationEnd);
    const eventStart = new Date(event.eventStart);
    const eventEnd = new Date(event.eventEnd);

    // Events that haven't been approved/published
    if (event.approvalStatus !== "PUBLISHED") {
        return "UNPUBLISHED";
    }

    // Event is currently happening
    if (now >= eventStart && now <= eventEnd) {
        return "LIVE";
    }

    // Event has finished
    if (now > eventEnd) {
        return "COMPLETED";
    }

    // Registration hasn't started yet
    if (now < registrationStart) {
        return "COMING_SOON";
    }

    // Registration is currently open
    if (now >= registrationStart && now <= registrationEnd) {
        return "REGISTRATION_OPEN";
    }

    // Registration ended, event hasn't started
    if (now > registrationEnd && now < eventStart) {
        return "REGISTRATION_CLOSED";
    }

    return "COMING_SOON";
}

module.exports = {
    getEventStatus
};