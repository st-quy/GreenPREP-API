const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: "LKIdxNj8k7Fu7gUQJzTy",
  secretKey: "f0muapFM4uY4ArGVlNO9nzFAvUKIDVuMwOtC49Kr",
});

// Destination bucket
const bucket = "gp-bucket";

//Policy for the bucket to allow public access read-only
const policy = {
  Version: "2012-10-17",
  Statement: [
    {
      Effect: "Allow",
      Principal: { AWS: ["*"] },
      Action: ["s3:GetObject"],
      Resource: [`arn:aws:s3:::${bucket}/*`],
    },
  ],
};

// Check if the bucket exists
// If it doesn't, create it
const initializeBucket = async () => {
  const exists = await minioClient.bucketExists(bucket);
  if (!exists) {
    await minioClient.makeBucket(bucket);
    await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
  } else {
    console.info("ℹ️ MinIO bucket already exists.");
  }
};

const uploadAudioToMinIO = async (filename) => {
  try {
    const url = await minioClient.presignedPutObject(bucket, filename);
    const fileUrl = `http://localhost:9000/${bucket}/${filename}`;
    return { status: 200, data: { uploadUrl: url, fileUrl } };
  } catch (err) {
    throw new Error("Failed to get presigned URL");
  }
};

module.exports = {
  initializeBucket,
  uploadAudioToMinIO,
};
