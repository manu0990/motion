import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { z } from 'zod';
import fs from 'fs-extra';
import { runManimScript, ManimQuality } from './services/manimService';
import { uploadFileToCloud } from './services/uploadService';

const createJobSchema = z.object({
  codeContent: z.string().trim().min(1, 'Code content cannot be empty.'),
  quality: z.enum(['-ql', '-qm', '-qh', '-qp', '-qk']).optional(),
});

const app: Express = express();

app.use(cors({origin: process.env.MOTION_HOST_ORIGIN,}));
app.use(express.json());

// @ts-ignore
app.post('/api/render', async (req: Request, res: Response) => {
  const parseResult = createJobSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      message: 'Invalid request',
      errors: parseResult.error.format(),
    });
  }

  let tempDirPath: string | undefined;

  try {
    const { codeContent, quality: qualityFlag } = parseResult.data;
    const qualityChar = qualityFlag ? (qualityFlag.charAt(2) as ManimQuality) : undefined;

    console.log(`Starting Manim job with flag: ${qualityFlag || 'default'}`);

    const { videoFilePath, tempDirPath: jobTempDir, sceneName: detectedSceneName } = await runManimScript(
      codeContent,
      { quality: qualityChar }
    );

    tempDirPath = jobTempDir;

    console.log(`Manim job successful for scene "${detectedSceneName}". Video at: ${videoFilePath}`);

    const uploadResult = await uploadFileToCloud(
      videoFilePath,
      { sceneName: detectedSceneName }
    );

    return res.status(200).json({
      message: 'Video created and uploaded successfully.',
      s3Key: uploadResult.key,
    });


  } catch (err: any) {
    console.error(`Failed to create video:`, err);
    return res.status(500).json({
      message: err.message || 'An unexpected error occurred during rendering.',
    });
  } finally {
    if (tempDirPath) {
      console.log(`Cleaning up temporary directory: ${tempDirPath}`);
      await fs.remove(tempDirPath);
    }
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Health is OK',
  });
});

export default app;