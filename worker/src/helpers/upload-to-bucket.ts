import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import fse from 'fs-extra';

export const uploadToBucket = async (localFilePath: string, folder: string = 'videos'): Promise<UploadApiResponse> => {
  if (!localFilePath) {
    throw new Error('Local file path is required for upload.');
  }

  if (!(await fse.pathExists(localFilePath))) {
    throw new Error(`File not found at path: ${localFilePath}`);
  }
  
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  } catch (error) {
    console.error("Error configuring Cloudinary. Make sure your .env file is set up correctly.");
    process.exit(1);
  }

  try {
    const options = {
      resource_type: 'video' as const,
      folder: folder,
    };

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload(localFilePath, options, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as UploadApiResponse);
        }
      });
    });

    return result;

  } catch (error) {
    console.error('Cloudinary Upload Error:', (error as UploadApiErrorResponse).message);
    throw error;
  }
};
