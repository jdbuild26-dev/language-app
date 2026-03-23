import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Convert `from "..../SOMETHING"` into absolute mapped `@/SOMETHING`
  
  // A regex to match import starting with from "." or from ".."
  const relativeImportRegex = /from\s+["'](\.[^"']+)["']/g;
  
  content = content.replace(relativeImportRegex, (match, relativePath) => {
    if (relativePath.startsWith('.')) {
      // It's a relative path! We need to resolve it against the containing file's directory.
      const currentDir = path.dirname(file);
      const resolvedPath = path.resolve(currentDir, relativePath);
      
      // Now, get the path relative to the `src` directory to turn it into an `@/` alias
      const srcPath = path.resolve('./src');
      
      if (resolvedPath.startsWith(srcPath)) {
        let aliasPath = resolvedPath.replace(srcPath, '@').replace(/\\/g, '/');
        return `from "${aliasPath}"`;
      }
    }
    return match;
  });

  // 2. Fix useLocation / useParams / useNavigate Ecmascript hook errors in Layout components
  // In Next.js App Router, layout.tsx CANNOT be a client component if it does heavy data fetching
  // However, since it migrated from React Router, let's just force `"use client"` on the layouts
  // that were erroring out.

  if (file.includes('layout.tsx')) {
      if (!content.includes('"use client"')) {
          content = '"use client";\n\n' + content;
      }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated robust paths in ${file}`);
  }
});
