import s3 from '../config/s3';
import { PutObjectCommand, ObjectCannedACL, DeleteObjectCommand } from '@aws-sdk/client-s3';

class ImageService{
    public async uploadImageToS3 (file: Express.Multer.File): Promise<string> {
        try {
          console.log("filename: " + Date.now() + "  " + file.originalname);
          const uniqueKey = Date.now() + file.originalname;
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME || '', // Name of the bucket
            Key: uniqueKey, // Use a unique key for each file, e.g., `${Date.now()}-${file.originalname}`
            Body: file.buffer, // File content
            ContentType: file.mimetype, // File MIME type
            ACL: ObjectCannedACL.public_read, // Make the file publicly accessible
          };
      
          const command = new PutObjectCommand(params);
          await s3.send(command);

          const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;
          console.log('File uploaded successfully:', fileUrl);

          return fileUrl; // Return the file's public URL
        } catch (error) {
          console.error('Error uploading file to S3:', error);
          throw new Error('Error uploading file');
        }
      };
      
    public async deleteImageFromS3 (fileKey: string): Promise<void> {
        try {
            if (typeof fileKey !== "string") {
              console.error("Invalid fileKey type:", fileKey);
              console.log("fileKey value:", fileKey, "type:", typeof fileKey);
              return;
            }

            if (!fileKey.startsWith("https://reflectimages")) return;

            const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME || 'reflectimages2',
            Key: fileKey,
            };

            const command = new DeleteObjectCommand(params);
            await s3.send(command);
        
            //await s3.deleteObject(params).promise();
            console.log(`File ${fileKey} deleted successfully.`);
        } catch (error) {
            console.error('Error deleting file from S3:', error);
            throw new Error('Error deleting file');
        }
    };
}

export default new ImageService();