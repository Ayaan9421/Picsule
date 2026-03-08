const { ObjectId } = require("mongodb");
const { getCollection } = require("../config/mongo");

async function createCapsule(data) {

        const collection = getCollection();

        const result = await collection.insertOne(data);

        return result.insertedId;

}

async function getCapsuleById(id) {

        const collection = getCollection();

        return collection.findOne({ _id: new ObjectId(id) });

}

async function deleteCapsule(id) {

        const collection = getCollection();

        return collection.deleteOne({ _id: new ObjectId(id) });

}

async function updateCapsuleMedia(id, mediaUrls) {

        const collection = getCollection();

        return collection.updateOne(
                { _id: new ObjectId(id) },
                { $push: { media: { $each: mediaUrls } } }
        );

}

async function findCapsules(query) {

        const collection = getCollection();

        return collection.find(query).toArray();

}

async function updateCollaborators(id, collaborators) {

        const collection = getCollection();

        return collection.updateOne(
                { _id: new ObjectId(id) },
                {
                        $set: {
                                collaborators,
                                shared: collaborators.length > 0
                        }
                }
        );

}

module.exports = {
        createCapsule,
        getCapsuleById,
        deleteCapsule,
        updateCapsuleMedia,
        findCapsules,
        updateCollaborators
};