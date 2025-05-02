const Minio = require("minio");

const MINIO_PORT = process.env.MINIO_PORT;
const MINIO_HOST = process.env.MINIO_HOST;

const minioClient = new Minio.Client({
  endPoint: MINIO_HOST,
  port: parseInt(MINIO_PORT),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// Destination bucket
const BUCKET = "gp-bucket";

//Policy for the bucket to allow public access read-only
const policy = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Principal: { AWS: ["*"] },
      Action: ["s3:GetObject"],
      Resource: [`arn:aws:s3:::${BUCKET}/*`],
    },
  ],
};

// Check if the bucket exists
// If it doesn't, create it
const initializeBucket = async () => {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) {
    await minioClient.makeBucket(BUCKET);
    await minioClient.setBucketPolicy(BUCKET, JSON.stringify(policy));
  } else {
    console.info("MinIO bucket already exists.");
  }
};

const uploadAudioToMinIO = async (filename) => {
  try {
    const url = await minioClient.presignedPutObject(BUCKET, filename);
    const fileUrl = `${MINIO_HOST}:${MINIO_PORT}/${BUCKET}/${filename}`;
    return { status: 200, data: { uploadUrl: url, fileUrl } };
  } catch (err) {
    throw new Error("Failed to get presigned URL");
  }
};

module.exports = {
  initializeBucket,
  uploadAudioToMinIO,
};
