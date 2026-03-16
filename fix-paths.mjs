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

  // 1. Fix relative imports that broke because the file moved to `app/`
  // Anything like `import ... from '../components/...` or `../../components/` or `../../../components`
  // We can just safely replace them with `@/components/` in the new Next.js structure
  
  content = content.replace(/from\s+["'](\.\.\/)+components\//g, 'from "@/components/');
  content = content.replace(/from\s+["'](\.\.\/)+services\//g, 'from "@/services/');
  content = content.replace(/from\s+["'](\.\.\/)+contexts\//g, 'from "@/contexts/');
  content = content.replace(/from\s+["'](\.\.\/)+hooks\//g, 'from "@/hooks/');
  content = content.replace(/from\s+["'](\.\.\/)+utils\//g, 'from "@/utils/');
  content = content.replace(/from\s+["'](\.\.\/)+lib\//g, 'from "@/lib/');
  content = content.replace(/from\s+["'](\.\.\/)+constants\//g, 'from "@/constants/');
  content = content.replace(/from\s+["'](\.\.\/)+assets\//g, 'from "@/assets/');
  
  // 2. Fix @clerk/clerk-react to @clerk/nextjs
  content = content.replace(/@clerk\/clerk-react/g, '@clerk/nextjs');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated paths in ${file}`);
  }
});
