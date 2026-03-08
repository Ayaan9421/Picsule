const admin = require("../config/firebase");

async function verifyToken(req, res, next) {

        const authHeader = req.headers.authorization || "";
        const token = authHeader.replace("Bearer ", "");

        if (!token) return res.status(401).send("Unauthorized");

        try {

                const decodedToken = await admin.auth().verifyIdToken(token);
                req.user = decodedToken;
                next();

        } catch (err) {

                res.status(401).send("Invalid Token");

        }
}

module.exports = verifyToken;