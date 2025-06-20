import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';

const execAsync = promisify(exec);

async function findFileByExtension(dir: string, ext: string): Promise<string | null> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const result = await findFileByExtension(fullPath, ext);
      if (result) return result;
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      return fullPath;
    }
  }
  return null;
}

type ExecutionOptions = {
  jobDir: string;
  scriptName: string;
  quality?: '-qm' | '-qh';
};

export async function executeManim({
  jobDir,
  scriptName,
  quality = '-qm',
}: ExecutionOptions): Promise<string> {
  const containerScriptPath = `snippets/${scriptName}`;

  const cmd = [
    'docker run --rm',
    `-v "${path.resolve(jobDir)}:/manim"`,
    '-w /manim',
    process.env.DOCKER_IMAGE,
    'manim render',
    containerScriptPath,
    quality,
  ].join(' ');

  try {
    const { stderr } = await execAsync(cmd);
    if (stderr) {
      console.error('Manim process logs (stderr):\n', stderr);
    }
  } catch (error: any) {
    console.error('Failed to execute Manim Docker command:', error);
    throw new Error(`Manim execution failed. Check Docker logs. Error: ${error.message}`);
  }

  const manimOutputRoot = path.join(jobDir, 'media');

  const finalVideoPath = await findFileByExtension(manimOutputRoot, '.mp4');

  if (!finalVideoPath) {
    throw new Error('Manim ran, but no .mp4 file was produced. Check the Manim logs and the input script.');
  }

  return finalVideoPath;
}