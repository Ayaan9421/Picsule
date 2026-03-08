const s3 = require("../config/s3");

async function uploadToS3(file) {

        const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `picsule/${Date.now()}_${file.originalname}`,
                Body: file.buffer,
                ContentType: file.mimetype
        };

        const data = await s3.upload(params).promise();

        return data.Location;
}

module.exports = { uploadToS3 };