const admin = require("../config/firebase");
const { uploadToS3, deleteFromS3 } = require("../config/s3");

const {
        createCapsule,
        getCapsuleById,
        deleteCapsule,
        updateCapsuleMedia,
        findCapsules,
        updateCollaborators
} = require("../services/capsuleServices");

const { enrichCapsulesWithUserInfo } = require("../utils/enrichCapsules");

async function createCapsuleController(req, res) {
        console.log("hi");

        try {

                const files = req.files || [];

                const message = req.body.message || "";

                if (files.length === 0 && !message.trim()) {

                        return res.status(400).json({
                                error: "Capsule must include media or a message."
                        });

                }

                let mediaUrls = [];

                if (files.length > 0) {

                        const uploads = files.map(file => uploadToS3(file));

                        mediaUrls = await Promise.all(uploads);

                }

                const capsule = {

                        ownerId: req.user.uid,
                        collaborators: [],
                        shared: false,
                        privacy: req.body.privacy || "private",
                        media: mediaUrls,
                        message,
                        unlockDate: req.body.unlockDate ? new Date(req.body.unlockDate) : null,
                        theme: req.body.theme || null,
                        createdAt: new Date()
                };

                const id = await createCapsule(capsule);

                res.status(201).json({
                        success: true,
                        capsuleId: id
                });

        } catch (err) {

                console.error("CREATE CAPSULE ERROR:", err);

                res.status(500).json({
                        error: err.message
                });

        }

}

async function updateCapsuleController(req, res) {

        try {

                const { capsuleId } = req.body;

                const capsule = await getCapsuleById(capsuleId);

                if (!capsule)
                        return res.status(404).json({ error: "Capsule not found" });

                if (capsule.ownerId !== req.user.uid)
                        return res.status(403).json({ error: "Not allowed" });

                const uploads = req.files.map(file => uploadToS3(file));

                const mediaUrls = await Promise.all(uploads);

                await updateCapsuleMedia(capsuleId, mediaUrls);

                res.json({ success: true });

        } catch (err) {

                res.status(500).json({ error: "Update failed" });

        }

}

async function deleteCapsuleController(req, res) {

        const { capsuleId } = req.body;

        const capsule = await getCapsuleById(capsuleId);

        if (!capsule)
                return res.status(404).json({ error: "Capsule not found" });

        if (capsule.ownerId !== req.user.uid)
                return res.status(403).json({ error: "Not allowed" });

        // delete media from S3
        if (capsule.media && capsule.media.length > 0) {

                try {
                        await Promise.all(capsule.media.map(url => deleteFromS3(url)));
                        console.log("deleted")
                } catch (err) {
                        console.error("S3 delete failed:", err);
                }

        }

        await deleteCapsule(capsuleId);

        res.json({ success: true });

}

async function getCapsuleController(req, res) {

        const { capsuleId } = req.body;

        const capsule = await getCapsuleById(capsuleId);

        if (!capsule)
                return res.status(404).json({ error: "Not found" });

        const [enriched] = await enrichCapsulesWithUserInfo([capsule]);

        res.json({ capsule: enriched });

}

async function getPrivateCapsules(req, res) {

        const capsules = await findCapsules({
                ownerId: req.user.uid,
                privacy: "private"
        });

        const enriched = await enrichCapsulesWithUserInfo(capsules);

        res.json({ capsules: enriched });

}

async function getAllPublicCapsules(req, res) {

        const capsules = await findCapsules({
                privacy: "public"
        });

        const enriched = await enrichCapsulesWithUserInfo(capsules);

        res.json({ capsules: enriched });

}

async function getSharedCapsules(req, res) {

        const capsules = await findCapsules({
                ownerId: req.user.uid,
                shared: true
        });

        const enriched = await enrichCapsulesWithUserInfo(capsules);

        res.json({ capsules: enriched });

}


async function getUserPublicCapsules(req, res) {

        const capsules = await findCapsules({
                ownerId: req.user.uid,
                privacy: "public"
        });

        const enriched = await enrichCapsulesWithUserInfo(capsules);

        res.json({ capsules: enriched });

}

async function getUserUnlockedCapsules(req, res) {

        const now = new Date();
        const userId = req.user.uid;

        const capsules = await findCapsules({
                $and: [
                        {
                                $or: [
                                        { ownerId: userId },
                                        { collaborators: userId }
                                ]
                        },
                        {
                                $or: [
                                        { unlockDate: { $lte: now } },
                                        { unlockDate: null }
                                ]
                        }
                ]
        });

        const enriched = await enrichCapsulesWithUserInfo(capsules);

        res.json({ capsules: enriched });

}

async function getUserLockedCapsules(req, res) {

        const now = new Date();
        const userId = req.user.uid;

        const capsules = await findCapsules({
                $and: [
                        {
                                $or: [
                                        { ownerId: userId },
                                        { collaborators: userId }
                                ]
                        },
                        {
                                unlockDate: { $gt: now }
                        }
                ]
        });

        const enriched = await enrichCapsulesWithUserInfo(capsules);

        res.json({ capsules: enriched });

}

async function getUserLockedCapsules(req, res) {

        const now = new Date();
        const userId = req.user.uid;

        const capsules = await findCapsules({
                $and: [
                        {
                                $or: [
                                        { ownerId: userId },
                                        { collaborators: userId }
                                ]
                        },
                        {
                                unlockDate: { $gt: now }
                        }
                ]
        });

        const enriched = await enrichCapsulesWithUserInfo(capsules);

        res.json({ capsules: enriched });

}


async function getAllUnlockedCapsules(req, res) {

        const now = new Date();

        const capsules = await findCapsules({
                $and: [
                        { shared: true },
                        {
                                $or: [
                                        { unlockDate: { $lte: now } },
                                        { unlockDate: null }
                                ]
                        }
                ]
        });

        const enriched = await enrichCapsulesWithUserInfo(capsules);

        res.json({ capsules: enriched });

}


async function getAllLockedCapsules(req, res) {

        const now = new Date();

        const capsules = await findCapsules({
                $and: [
                        { shared: true },
                        { unlockDate: { $gt: now } }
                ]
        });

        const enriched = await enrichCapsulesWithUserInfo(capsules);

        res.json({ capsules: enriched });

}

async function addCollaborators(req, res) {

        const { capsuleId, collaborators } = req.body;

        if (!capsuleId || !Array.isArray(collaborators))
                return res.status(400).json({ error: "capsuleId and collaborators required" });

        try {

                const newUIDs = [];

                for (const email of collaborators) {

                        const user = await admin.auth().getUserByEmail(email.trim());
                        newUIDs.push(user.uid);

                }

                const capsule = await getCapsuleById(capsuleId);

                if (!capsule)
                        return res.status(404).json({ error: "Capsule not found" });

                if (capsule.ownerId !== req.user.uid)
                        return res.status(403).json({ error: "Only owner can add collaborators" });

                const existing = capsule.collaborators || [];

                const updated = [...new Set([...existing, ...newUIDs])];

                await updateCollaborators(capsuleId, updated);

                res.json({
                        success: true,
                        message: "Collaborators added"
                });

        } catch (err) {

                res.status(500).json({ error: "Failed to add collaborators" });

        }

}


async function removeCollaborators(req, res) {

        const { capsuleId, collaborators } = req.body;

        try {

                const uids = [];

                for (const email of collaborators) {

                        const user = await admin.auth().getUserByEmail(email.trim());
                        uids.push(user.uid);

                }

                const capsule = await getCapsuleById(capsuleId);

                const updated = (capsule.collaborators || [])
                        .filter(uid => !uids.includes(uid));

                await updateCollaborators(capsuleId, updated);

                res.json({
                        success: true,
                        message: "Collaborators removed"
                });

        } catch (err) {

                res.status(500).json({
                        error: "Failed removing collaborators"
                });

        }

}


async function getCollaborators(req, res) {

        const { capsuleId } = req.body;

        const capsule = await getCapsuleById(capsuleId);

        if (!capsule)
                return res.status(404).json({ error: "Capsule not found" });

        if (capsule.ownerId !== req.user.uid)
                return res.status(403).json({ error: "Only owner can view collaborators" });

        const collaborators = capsule.collaborators || [];

        const details = await Promise.all(
                collaborators.map(async uid => {

                        try {

                                const user = await admin.auth().getUser(uid);

                                return {
                                        uid: user.uid,
                                        email: user.email
                                };

                        } catch {

                                return null;

                        }

                })
        );

        res.json({
                collaborators: details.filter(Boolean)
        });

}

module.exports = {
        createCapsuleController,
        updateCapsuleController,
        deleteCapsuleController,
        getCapsuleController,
        getPrivateCapsules,
        getAllPublicCapsules,
        getSharedCapsules,
        getUserPublicCapsules,
        getUserUnlockedCapsules,
        getUserLockedCapsules,
        getAllLockedCapsules,
        getAllUnlockedCapsules,
        addCollaborators,
        removeCollaborators,
        getCollaborators
};