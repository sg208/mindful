/** Encode each path segment individually, preserving the slashes between them.
 *  Normalises backslashes to forward slashes first so the function is safe on
 *  any platform and regardless of how the caller constructed the path. */
export const encodePath = (rawPath) =>
  rawPath.replace(/\\/g, '/').split('/').map(encodeURIComponent).join('/');

/** Every parent directory of the given forward-slash relative file paths,
 *  sorted so parents come before their children (Bunny needs dirs first). */
export const collectDirectories = (relativeFiles) => {
  const dirs = new Set();
  for (const file of relativeFiles) {
    const parts = file.split('/');
    for (let i = 1; i < parts.length; i++) {
      dirs.add(parts.slice(0, i).join('/'));
    }
  }
  return [...dirs].sort();
};
