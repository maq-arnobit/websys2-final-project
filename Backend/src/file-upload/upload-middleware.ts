import multer from 'multer';
import path from 'path';
import fs from 'fs';

const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../../uploads/substances'),
    path.join(__dirname, '../../uploads/inventory'),
    path.join(__dirname, '../../uploads/dealers'),
    path.join(__dirname, '../../uploads/customers'),
    path.join(__dirname, '../../uploads/providers')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

createUploadDirs();

const imageFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/temp'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'temp-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const tempDir = path.join(__dirname, '../../uploads/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

export const upload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

export const saveImageWithId = (
  tempPath: string,
  type: 'substance' | 'inventory' | 'dealer' | 'customer' | 'provider',
  id: number
): string => {
  const ext = path.extname(tempPath);
  const filename = `${type}-${id}${ext}`;
  const destDir = path.join(__dirname, `../../uploads/${type === 'substance' ? 'substances' : type === 'inventory' ? 'inventory' : `${type}s`}`);
  const destPath = path.join(destDir, filename);

  deleteImageById(type, id);

  fs.renameSync(tempPath, destPath);
  console.log(`Saved image: ${filename}`);

  return `/uploads/${type === 'substance' ? 'substances' : type === 'inventory' ? 'inventory' : `${type}s`}/${filename}`;
};

export const deleteImageById = (
  type: 'substance' | 'inventory' | 'dealer' | 'customer' | 'provider',
  id: number
) => {
  const dirName = type === 'substance' ? 'substances' : type === 'inventory' ? 'inventory' : `${type}s`;
  const dir = path.join(__dirname, `../../uploads/${dirName}`);
  
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  const pattern = new RegExp(`^${type}-${id}\\.`);

  files.forEach(file => {
    if (pattern.test(file)) {
      const filepath = path.join(dir, file);
      fs.unlinkSync(filepath);
      console.log(`Deleted image: ${file}`);
    }
  });
};

export const getImageUrl = (
  type: 'substance' | 'inventory' | 'dealer' | 'customer' | 'provider',
  id: number
): string | null => {
  const dirName = type === 'substance' ? 'substances' : type === 'inventory' ? 'inventory' : `${type}s`;
  const dir = path.join(__dirname, `../../uploads/${dirName}`);
  
  if (!fs.existsSync(dir)) return null;

  const files = fs.readdirSync(dir);
  const pattern = new RegExp(`^${type}-${id}\\.`);

  const imageFile = files.find(file => pattern.test(file));
  
  return imageFile ? `/uploads/${dirName}/${imageFile}` : null;
};

export const imageExists = (
  type: 'substance' | 'inventory' | 'dealer' | 'customer' | 'provider',
  id: number
): boolean => {
  return getImageUrl(type, id) !== null;
};