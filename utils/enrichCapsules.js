const admin = require("../config/firebase");

async function getUserInfo(uid) {

        try {

                const user = await admin.auth().getUser(uid);

                return {
                        uid,
                        displayName: user.displayName || null,
                        email: user.email || null
                };

        } catch (err) {

                return { uid };

        }
}

async function enrichCapsulesWithUserInfo(capsules) {

        const uniqueUids = new Set();

        capsules.forEach(capsule => {

                if (capsule.ownerId) uniqueUids.add(capsule.ownerId);

                (capsule.collaborators || []).forEach(uid => uniqueUids.add(uid));

        });

        const uidToUser = {};

        await Promise.all(
                [...uniqueUids].map(async uid => {
                        uidToUser[uid] = await getUserInfo(uid);
                })
        );

        return capsules.map(capsule => ({
                ...capsule,
                owner: uidToUser[capsule.ownerId] || { uid: capsule.ownerId },
                collaborators: (capsule.collaborators || []).map(
                        uid => uidToUser[uid] || { uid }
                )
        }));

}

module.exports = { enrichCapsulesWithUserInfo };