import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export const pdfUploadConfig = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      const uploadDir = process.env.UPLOAD_DIR ?? './uploads';
      cb(null, join(process.cwd(), uploadDir, 'submissions'));
    },
    filename: (_req, file, cb) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new BadRequestException('Apenas arquivos PDF são aceitos.'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024,
  },
};
