const UserDAO = require("./user-dao").UserDAO;

const THRESHOLD_MIN = 0;
const THRESHOLD_MAX = 99;

const hasThreshold = threshold => {
    return threshold !== undefined && threshold !== null && threshold !== "";
};

const parseNumericValue = (value, fieldName) => {
    if (!/^\d+$/.test(String(value))) {
        throw new Error(`The user supplied ${fieldName}: ${value} was not valid.`);
    }

    return parseInt(value, 10);
};

const parseUserId = userId => {
    return parseNumericValue(userId, "userId");
};

const parseThreshold = threshold => {
    const parsedThreshold = parseNumericValue(threshold, "threshold");

    if (parsedThreshold < THRESHOLD_MIN || parsedThreshold > THRESHOLD_MAX) {
        throw new Error(`The user supplied threshold: ${threshold} was not valid.`);
    }

    return parsedThreshold;
};

const buildAllocationsDocument = (userId, stocks, funds, bonds) => {
    return {
        userId: parseUserId(userId),
        stocks,
        funds,
        bonds
    };
};

const buildAllocationsCriteria = (userId, threshold) => {
    const parsedUserId = parseUserId(userId);
    const criteria = {
        userId: parsedUserId
    };

    if (hasThreshold(threshold)) {
        criteria.stocks = {
            $gte: parseThreshold(threshold)
        };
    }

    return criteria;
};

const addUserDetails = (allocation, user) => {
    allocation.userName = user.userName;
    allocation.firstName = user.firstName;
    allocation.lastName = user.lastName;

    return allocation;
};

/* The AllocationsDAO must be constructed with a connected database object */
const AllocationsDAO = function(db){

    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof AllocationsDAO)) {
        console.log("Warning: AllocationsDAO constructor called without 'new' operator");
        return new AllocationsDAO(db);
    }

    const allocationsCol = db.collection("allocations");
    const userDAO = new UserDAO(db);

    this.update = (userId, stocks, funds, bonds, callback) => {
        let allocations;

        try {
            allocations = buildAllocationsDocument(userId, stocks, funds, bonds);
        } catch (e) {
            return callback(e, null);
        }

        allocationsCol.update({
            userId: allocations.userId
        }, allocations, {
            upsert: true
        }, err => {
            if (err) return callback(err, null);

            console.log("Updated allocations");

            userDAO.getUserById(allocations.userId, (err, user) => {
                if (err) return callback(err, null);

                return callback(null, addUserDetails(allocations, user));
            });
        });
    };

    this.getByUserIdAndThreshold = (userId, threshold, callback) => {
        let criteria;

        try {
            criteria = buildAllocationsCriteria(userId, threshold);
        } catch (e) {
            return callback(e, null);
        }

        allocationsCol.find(criteria).toArray((err, allocations) => {
            if (err) return callback(err, null);
            if (!allocations.length) return callback("ERROR: No allocations found for the user", null);

            let doneCounter = 0;
            const userAllocations = [];

            allocations.forEach(allocation => {
                userDAO.getUserById(allocation.userId, (err, user) => {
                    if (err) return callback(err, null);

                    doneCounter += 1;
                    userAllocations.push(addUserDetails(allocation, user));

                    if (doneCounter === allocations.length) {
                        callback(null, userAllocations);
                    }
                });
            });
        });
    };

};

module.exports.AllocationsDAO = AllocationsDAO;
