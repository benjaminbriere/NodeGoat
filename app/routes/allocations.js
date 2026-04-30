const AllocationsDAO = require("../data/allocations-dao").AllocationsDAO;
const {
    environmentalScripts
} = require("../../config/config");

const getRequestedUserId = req => {
    /*
    // Fix for A4 Insecure DOR -  take user id from session instead of from URL param
    return req.session.userId;
    */
    return req.params.userId;
};

const getRequestedThreshold = req => {
    return req.query.threshold;
};

const buildAllocationsViewModel = (userId, allocations) => {
    return {
        userId,
        allocations,
        environmentalScripts
    };
};

/**
 * Creates a request handler for allocations and registers a method to render the allocations view.
 *
 * The created handler exposes `displayAllocations(req, res, next)` which extracts the requested
 * user ID and threshold from the request, loads the corresponding allocations, forwards any
 * retrieval error to Express error handling, and renders the "allocations" view with the
 * constructed view model.
 *
 * @constructor
 * @param {Object} db - Database connection or client used to instantiate the AllocationsDAO.
 */
function AllocationsHandler(db) {
    "use strict";

    const allocationsDAO = new AllocationsDAO(db);

    this.displayAllocations = (req, res, next) => {
        const userId = getRequestedUserId(req);
        const threshold = getRequestedThreshold(req);

        allocationsDAO.getByUserIdAndThreshold(userId, threshold, (err, allocations) => {
            if (err) return next(err);

            return res.render("allocations", buildAllocationsViewModel(userId, allocations));
        });
    };
}

module.exports = AllocationsHandler;
