import { Router, Request, Response } from 'express';
import { z } from 'zod';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { executeManim } from '../helpers/generateVideo';
import { uploadToBucket } from '../helpers/upload-to-bucket';

const router = Router();

const createJobSchema = z.object({
  codeContent: z.string().trim().min(1, 'Code content cannot be empty.'),
  quality: z.enum(['-qm', '-qh']).optional(),
});

// @ts-ignore
router.post('/', async (req: Request, res: Response) => {
  const parseResult = createJobSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid request', errors: parseResult.error.format() });
  }
  const { codeContent, quality } = parseResult.data;

  const jobId = uuid();
  const jobDir = path.join(process.cwd(), 'media', jobId);

  try {
    const snippetsDir = path.join(jobDir, 'snippets');
    const mediaDir = path.join(jobDir, 'media');

    await Promise.all([
      fs.ensureDir(snippetsDir),
      fs.ensureDir(mediaDir),
    ]);

    const scriptName = `scene.py`;
    const scriptPath = path.join(snippetsDir, scriptName);
    await fs.writeFile(scriptPath, codeContent);
    
    // Generating video with manim
    const finalVideoPath = await executeManim({
      jobDir,
      scriptName,
      quality,
    });

    const relativeVideoPath = path.relative(process.cwd(), finalVideoPath).replace(/\\/g, '/');
    
    // Uploading to cloud bucket
    const bucketResponse = await uploadToBucket(relativeVideoPath);

    return res.status(200).json({
      message: 'Video created successfully.',
      jobId,
      videoUrl: bucketResponse.secure_url,
    });

  } catch (err: any) {
    console.error(`[Job ID: ${jobId}] Failed to create video:`, err);
    await fs.remove(jobDir);

    return res.status(500).json({ message: err.message || 'An unexpected error occurred.' });
  }
});

export default router;