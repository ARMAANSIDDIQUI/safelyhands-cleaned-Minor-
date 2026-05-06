const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for temporary storage
// Use /tmp on Vercel (serverless has read-only filesystem except /tmp)
const os = require('os');

const getUploadPath = () => {
    // Vercel serverless has read-only filesystem except /tmp
    if (process.env.VERCEL) {
        return '/tmp';
    }

    // For local development (even in production mode on Windows) or other environments,
    // use a local uploads directory that we can ensure exists.
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }
    return uploadPath;
};

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, getUploadPath());
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit (for videos)
});

// @desc    Upload file
// @route   POST /api/upload
// @access  Private
router.post('/', (req, res, next) => {
    console.log(`>>> [UPLOAD] Route hit /api/upload | Method: POST`);
    // Run multer manually so its errors enter Express error chain
    // (which sets CORS headers) instead of sending a bare response
    upload.single('image')(req, res, async (multerErr) => {
        if (multerErr) {
            return next(multerErr); // goes to global error handler with CORS headers
        }
        try {
            if (!req.file) {
                console.error('!!! [UPLOAD ERROR] No file object in request');
                return res.status(400).json({ message: 'No file uploaded' });
            }

            console.log(`>>> [UPLOAD] File received: ${req.file.originalname} | Size: ${req.file.size} bytes | Mime: ${req.file.mimetype}`);

            // Upload to Cloudinary - use upload_large for videos to be safe
            const isVideo = req.file.mimetype.startsWith('video/');
            console.log(`>>> [UPLOAD] Sending to Cloudinary | Type: ${isVideo ? 'video' : 'image'} | resource_type: auto...`);

            const uploadOptions = {
                folder: 'safely_hands',
                use_filename: true,
                unique_filename: false,
                resource_type: 'auto',
            };

            let result;
            if (isVideo) {
                // Cloudinary recommend upload_large for videos
                result = await cloudinary.uploader.upload_large(req.file.path, {
                    ...uploadOptions,
                    chunk_size: 6000000, // 6MB chunks
                });
            } else {
                result = await cloudinary.uploader.upload(req.file.path, uploadOptions);
            }

            console.log(`>>> [UPLOAD] Cloudinary success! Resource Type: ${result.resource_type} | URL: ${result.secure_url}`);

            // Remove file from local uploads folder
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error('!!! [UPLOAD] Error cleaning up local file:', err.message);
            }

            res.json({
                url: result.secure_url || result.url,
                imageUrl: result.secure_url || result.url,
                resourceType: result.resource_type,
                message: 'File uploaded successfully'
            });
        } catch (error) {
            console.error('!!! [UPLOAD CLOUDINARY ERROR]:', error);
            // Clean up local file if upload fails
            if (req.file && fs.existsSync(req.file.path)) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (unlinkError) {
                    console.error('Error deleting temp file:', unlinkError);
                }
            }
            next(error); // goes to global error handler with CORS headers
        }
    });
});

module.exports = router;
