import path from "path";
import multer from "multer";
import fs from "fs";
import sharp from "sharp";
import AppError from "../utils/appError.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const userId = req.params.id;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${userId}${ext}`);
  },
});

const upload = multer({ storage });

async function uploadImages(req, res, next) {
  const uploader = upload.fields([
    { name: "cover_pic", maxCount: 1 },
    { name: "profile_pic", maxCount: 1 },
  ]);

  uploader(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return next(new AppError("Multer error", 500));
    } else if (err) {
      return next(new AppError("Unknown upload error", 500));
    }

    try {
      req.uploadedImages = {};

      const compressAndOverwrite = async (file, type) => {
        const parsed = path.parse(file.path);
        const outputPath = path.join(parsed.dir, `${parsed.name}.webp`);

        await sharp(file.path)
          .resize(1080, 1080, { fit: "inside" })
          .toFormat("webp")
          .webp({ quality: 70 })
          .toFile(outputPath);

        fs.unlinkSync(file.path);

        req.uploadedImages[type] = outputPath;
      };

      if (req.files?.profile_pic) {
        await compressAndOverwrite(req.files.profile_pic[0], "profile_pic");
      }

      if (req.files?.cover_pic) {
        await compressAndOverwrite(req.files.cover_pic[0], "cover_pic");
      }

      next();
    } catch (error) {
      console.error("Error compressing images:", error);
      next(new AppError("Error during image compression", 500));
    }
  });
}

export default uploadImages;
