// manimService.ts
import fse from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export type ManimQuality = 'l' | 'm' | 'h' | 'p' | 'k';

export interface RunManimScriptOptions {
  quality?: ManimQuality;
  dockerImage?: string;
  timeoutMs?: number;
}

export interface ManimExecutionResult {
  videoFilePath: string;
  tempDirPath: string;
  sceneName: string;
}

/**
 * This function orchestrates the entire rendering process in a secure manner:
 * 1. Creates a unique, isolated temporary directory in the OS's temp folder.
 * 2. Writes the user's Python code to a file within this directory.
 * 3. Constructs and executes a `docker run` command, mounting ONLY the temporary directory.
 *    This prevents the Manim script from accessing any other part of the host filesystem.
 * 4. Enforces a timeout to prevent runaway scripts from consuming server resources.
 * 5. After execution, it searches for the output .mp4 file.
 * 6. Returns the path to the video and the temporary directory for cleanup.
 */
export const runManimScript = async (
  manimCode: string,
  options: RunManimScriptOptions = {}
): Promise<ManimExecutionResult> => {
  const {
    quality = 'm',
    dockerImage = process.env.DOCKER_IMAGE!,
    timeoutMs = 300000,
  } = options;

  if (!dockerImage) {
    throw new Error("DOCKER_IMAGE environment variable is not set.");
  }

  const uniqueId = uuidv4();
  const jobsBaseDir = path.resolve('./jobs');
  const tempDirPath = path.join(jobsBaseDir, `manim-job-${uniqueId}`);
  const pythonScriptName = 'scene.py';
  const finalVideoName = 'output.mp4';

  const pythonFilePathOnHost = path.join(tempDirPath, pythonScriptName);
  const finalVideoPathOnHost = path.join(tempDirPath, finalVideoName);

  const dockerMountPath = '/manim-project';
  const pythonFilePathInContainer = path.posix.join(dockerMountPath, pythonScriptName);
  const finalVideoPathInContainer = path.posix.join(dockerMountPath, finalVideoName);

  try {
    console.log(`Creating temporary job directory: ${tempDirPath}`);
    await fse.ensureDir(tempDirPath);

    console.log(`Writing script to: ${pythonFilePathOnHost}`);
    await fse.writeFile(pythonFilePathOnHost, manimCode);

    const qualityFlag = `-q${quality}`;
    const dockerCommand = [
      'docker run --rm',
      `-v "${path.resolve(tempDirPath)}:${dockerMountPath}"`,
      dockerImage,
      'manim render',
      pythonFilePathInContainer,
      '-o', finalVideoPathInContainer,
      qualityFlag,
    ].join(' ');

    console.log(`Executing Manim Job [${uniqueId}]: ${dockerCommand}`);

    const { stdout, stderr } = await execAsync(dockerCommand, { timeout: timeoutMs });

    if (stderr) console.warn(`Manim Job [${uniqueId}] Stderr:\n`, stderr);
    if (stdout) console.log(`Manim Job [${uniqueId}] Stdout:\n`, stdout);

    try {
      await fse.access(finalVideoPathOnHost);
    } catch {
      throw new Error(
        `Manim reported success, but the expected output file was not found.`
      );
    }

    const renderedMatch = stdout.match(/Rendered (\w+)/);
    const detectedSceneName = renderedMatch && renderedMatch[1] ? renderedMatch[1] : 'UnknownScene';

    console.log(`Manim Job [${uniqueId}] successful. Detected scene "${detectedSceneName}". Video found at: ${finalVideoPathOnHost}`);

    return {
      videoFilePath: finalVideoPathOnHost,
      tempDirPath: tempDirPath,
      sceneName: detectedSceneName,
    };
  } catch (error: any) {
    console.error(`Error during Manim Job [${uniqueId}]:`, error);
    throw new Error(
      `Manim script execution failed for job [${uniqueId}]. Reason: ${error.message}`
    );
  }
};