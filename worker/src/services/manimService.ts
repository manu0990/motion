import fse from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export type ManimQuality = 'l' | 'm' | 'h' | 'p' | 'k';

export interface RunManimScriptOptions {
  quality?: ManimQuality;
  timeoutMs?: number;
}

export interface ManimExecutionResult {
  videoFilePath: string;
  tempDirPath: string;
  sceneName: string;
}

export const runManimScript = async (
  manimCode: string,
  options: { quality?: ManimQuality; timeoutMs?: number } = {}
): Promise<ManimExecutionResult> => {
  const { quality = 'm', timeoutMs = 300000 } = options;

  const uniqueId = uuidv4();
  const tempDirPath = path.resolve('./jobs', `manim-job-${uniqueId}`);
  const pythonScriptName = 'scene.py';
  const pythonFilePath = path.join(tempDirPath, pythonScriptName);

  try {
    await fse.ensureDir(tempDirPath);
    await fse.writeFile(pythonFilePath, manimCode);

    // Regex to detect the scene name from the code
    const sceneMatch = manimCode.match(/class\s+(\w+)\s*\(/);
    if (!sceneMatch || !sceneMatch[1]) {
      throw new Error('Could not detect a scene class in the provided code.');
    }
    const sceneName = sceneMatch[1];
    const qualityFlag = `-q${quality}`;

    const command = `cd ${tempDirPath} && manim render ${pythonScriptName} ${sceneName} ${qualityFlag}`;

    console.log(`Executing Manim Job [${uniqueId}]: ${command}`);

    const { stdout, stderr } = await execAsync(command, { timeout: timeoutMs });

    if (stderr) console.warn(`Manim Job [${uniqueId}] Stderr:\n`, stderr);
    if (stdout) console.log(`Manim Job [${uniqueId}] Stdout:\n`, stdout);

    // Find the output file within the temp directory
    const mediaDir = path.join(tempDirPath, 'media', 'videos', pythonScriptName.replace('.py', ''), '720p30'); // <-- as defaulted to -qm so 720p30 works
    const files = await fse.readdir(mediaDir);
    const videoFile = files.find(f => f.endsWith(`${sceneName}.mp4`));

    if (!videoFile) {
      throw new Error('Manim reported success, but the expected output file was not found.');
    }

    const videoFilePath = path.join(mediaDir, videoFile);
    console.log(`Manim Job [${uniqueId}] successful. Video found at: ${videoFilePath}`);

    return {
      videoFilePath: videoFilePath,
      tempDirPath: tempDirPath,
      sceneName: sceneName,
    };
  } catch (error: any) {
    console.error(`Error during Manim Job [${uniqueId}]:`, error);
    await fse.remove(tempDirPath).catch(cleanupError => {
      console.error(`Failed to clean up temp directory ${tempDirPath} for job [${uniqueId}]`, cleanupError);
    });
    throw new Error(`Manim script execution failed for job [${uniqueId}]. Reason: ${error.message}`);
  }
};
