import express, { Request, Response } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
        cb(null, false);    }
  }
});

// Upload photo to Cloudinary
router.post('/', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No photo file provided' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'home-history-photos', // Optional: organize photos in a folder
        transformation: [
          { width: 800, height: 600, crop: 'limit' }, // Resize if needed
          { quality: 'auto' } // Optimize quality
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Failed to upload photo', error: error.message });
        }
        
        res.json({
          success: true,
          photoUrl: result?.secure_url,
          publicId: result?.public_id
        });
      }
    ).end(req.file.buffer);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload photo', error });
  }
});

export default router;
