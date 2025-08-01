import { S3Client, PutObjectCommand, S3ClientConfig } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const AWS_REGION = process.env.AWS_REGION!;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME!;

const S3_ENDPOINT = process.env.S3_ENDPOINT;

if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !S3_BUCKET_NAME) {
  throw new Error(
    'Missing critical AWS S3 environment variables. Please set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET_NAME.'
  );
}

const s3ClientConfig: S3ClientConfig = {
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
};

if (S3_ENDPOINT) {
  s3ClientConfig.endpoint = S3_ENDPOINT;
  s3ClientConfig.forcePathStyle = true;
}

const s3Client = new S3Client(s3ClientConfig);

export interface CloudUploadResult {
  key: string;
  s3Uri: string;
}
export interface UploadOptions {
  sceneName: string;
}

export const uploadFileToCloud = async (
  localFilePath: string,
  options: UploadOptions
): Promise<CloudUploadResult> => {
  try {
    await fs.promises.access(localFilePath);
  } catch {
    throw new Error(`File not found at path: ${localFilePath}`);
  }

  const fileExtension = path.extname(localFilePath);
  const sanitizedSceneName = options.sceneName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const s3Key = `videos/${uuidv4()}/${sanitizedSceneName}${fileExtension}`;

  try {
    const fileStream = fs.createReadStream(localFilePath);
    const putCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME!,
      Key: s3Key,
      Body: fileStream,
      ContentType: 'video/mp4',
    });

    console.log(`Uploading file to S3 with key: ${s3Key}`);
    await s3Client.send(putCommand);
    console.log(`Successfully uploaded file.`);

    return {
      key: s3Key,
      s3Uri: `s3://${S3_BUCKET_NAME}/${s3Key}`,
    };
  } catch (error: any) {
    console.error('S3 operation failed:', error);
    throw new Error(`Failed to upload file to cloud storage. Reason: ${error.message}`);
  }
};