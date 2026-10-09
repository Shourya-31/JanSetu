import { FastifyRequest, FastifyReply } from 'fastify';
import { v2 as cloudinary } from 'cloudinary';
import { sendInternalError } from '../utils/httpErrors';

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
    
    // Convert buffer to base64
    const base64Image = `data:${data.mimetype};base64,${buffer.toString('base64')}`;
    
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'jansetu_village_photos',
    });

    return reply.status(200).send({ secure_url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return sendInternalError(req, reply, err, 'Cloudinary upload failed');
  }
}
