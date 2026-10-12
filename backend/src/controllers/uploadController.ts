import { FastifyRequest, FastifyReply } from 'fastify';
import { v2 as cloudinary } from 'cloudinary';
import { sendInternalError } from '../utils/httpErrors';
import { AppError, ERROR_CODES } from '../utils/errors';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadImage(req: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await req.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const buffer = await data.toBuffer();
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'jansetu_village_photos', resource_type: 'image' },
        (error, uploaded) => {
          if (error) return reject(error);
          if (!uploaded?.secure_url) {
            return reject(new Error('Cloudinary returned no secure URL'));
          }
          resolve({ secure_url: uploaded.secure_url });
        },
      );
      upload.end(buffer);
    });

    return reply.status(200).send({ secure_url: result.secure_url });
  } catch (err) {
    const cloudinaryStatus =
      typeof err === 'object' && err !== null && 'http_code' in err
        ? Number((err as { http_code?: unknown }).http_code)
        : undefined;

    if (cloudinaryStatus === 403 || cloudinaryStatus === 420 || cloudinaryStatus === 429) {
      req.log.warn({ cloudinaryStatus }, 'Cloudinary rejected village photo upload');
      throw new AppError(
        ERROR_CODES.EXTERNAL_SERVICE_ERROR,
        'Photo upload service is temporarily unavailable. Continue the survey without photos.',
        503,
        { operation: 'photo.upload', stage: 'external_service' },
        { cause: err }
      );
    }

    return sendInternalError(req, reply, err, 'Cloudinary upload failed');
  }
}
