const AWS = require("aws-sdk");

const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
        region: process.env.AWS_REGION
});

async function uploadToS3(file) {

        const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `picsule/${Date.now()}-${file.originalname}`,
                Body: file.buffer,
                ContentType: file.mimetype
        };

        const data = await s3.upload(params).promise();

        return data.Location;

}

async function deleteFromS3(fileUrl) {

        try {

                const url = new URL(fileUrl);

                let key = decodeURIComponent(url.pathname);

                if (key.startsWith("/")) {
                        key = key.substring(1);
                }

                const params = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: key
                };

                console.log("Deleting from S3:", params);

                return s3.deleteObject(params).promise();

        } catch (err) {

                console.error("S3 delete error:", err);

        }
}

module.exports = { uploadToS3, deleteFromS3 };