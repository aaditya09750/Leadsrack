const path = require('path');

const toRel = (cwd, files) =>
  files.map((f) => path.posix.relative(cwd, f.replace(/\\/g, '/'))).join(' ');

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
