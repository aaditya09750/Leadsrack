const path = require('path');

// lint-staged passes absolute paths. On Windows, `path.posix.relative('Backend', 'C:/.../file')`
// produces `../C:/...` because posix can't resolve drive letters. Resolve cwd to an absolute
// posix path first so the relative computation works cross-platform.
const toRel = (subdir, files) => {
  const cwdAbs = path.posix.join(process.cwd().replace(/\\/g, '/'), subdir);
  return files.map((f) => path.posix.relative(cwdAbs, f.replace(/\\/g, '/'))).join(' ');
};

module.exports = {
  'Frontend/**/*.{ts,tsx,js,jsx}': (files) => {
    const rel = toRel('Frontend', files);
    if (!rel) return [];
    return [`pnpm --dir Frontend exec eslint --fix --max-warnings=0 --no-warn-ignored ${rel}`];
  },
  'Backend/**/*.{ts,js}': (files) => {
    const rel = toRel('Backend', files);
    if (!rel) return [];
    return [`pnpm --dir Backend exec eslint --fix --max-warnings=0 --no-warn-ignored ${rel}`];
  },
  '**/*.{md,json,yaml,yml}': 'prettier --write',
};
