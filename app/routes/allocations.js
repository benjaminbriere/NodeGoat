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
