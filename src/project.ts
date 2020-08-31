import findRoot from 'find-root';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * __projectroot: an absolute alternative to __dirname
 *
 * This is useful when referring to static files from generated files.
 */
export const __projectroot = findRoot(__dirname);

/**
 * A promise-based wrapper for readFile that automatically
 * joins __projectroot with the passed src file (or file parts)
 */
export function readProjectFile(...src: string[]): Promise<string> {
  return fs.readFile(path.join(__projectroot, ...src), 'utf-8');
}
