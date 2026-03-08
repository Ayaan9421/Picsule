const express = require("express");
const multer = require("multer");

const verifyToken = require("../middleware/verifyToken");

const controller = require("../controllers/capsuleController");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/create-capsule",
        verifyToken,
        upload.array("media"),
        controller.createCapsuleController
);

router.patch("/update-capsule",
        verifyToken,
        upload.array("media"),
        controller.updateCapsuleController
);

router.delete("/delete-capsule",
        verifyToken,
        controller.deleteCapsuleController
);

router.post("/get-capsule",
        verifyToken,
        controller.getCapsuleController
);

router.get("/get-private-capsules",
        verifyToken,
        controller.getPrivateCapsules
);

router.get("/get-shared-capsules",
        verifyToken,
        controller.getSharedCapsules
);

router.get("/get-user-public-capsules",
        verifyToken,
        controller.getUserPublicCapsules
);

router.get("/get-all-public-capsules",
        controller.getAllPublicCapsules
);

router.get("/get-user-unlocked-capsules",
        verifyToken,
        controller.getUserUnlockedCapsules
);

router.get("/get-user-locked-capsules",
        verifyToken,
        controller.getUserLockedCapsules
);

router.get("/get-all-unlocked-capsules",
        controller.getAllUnlockedCapsules
);

router.get("/get-all-locked-capsules",
        controller.getAllLockedCapsules
);

router.patch("/add-collaborators",
        verifyToken,
        controller.addCollaborators
);

router.patch("/remove-collaborators",
        verifyToken,
        controller.removeCollaborators
);

router.post("/get-collaborators",
        verifyToken,
        controller.getCollaborators
);

module.exports = router;
