import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === 'node_modules' || file === '.next') return;
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

  // The previous migrate-routes.mjs script moved pages into src/app/, 
  // but many files inside src/app/ still try to import from their old sibling locations
  // which are now also in src/app, OR they try to import things from `@/app/...` 
  // because of our fix-all-paths.mjs script which resolved `../` naively.
  
  // Actually, wait: we DO NOT WANT `@/app/components`, we want `@/components`.
  // If `fix-all-paths.mjs` saw `../components` and resolved it relative to `src/app/abc`, 
  // it might have mapped it to `@/app/components` (which doesn't exist, components is at `src/components`).
  
  // Let's replace any `@/app/` imports with just `@/` for specific shared folders:
  content = content.replace(/["']@\/app\/components\//g, '"@/components/');
  content = content.replace(/["']@\/app\/services\//g, '"@/services/');
  content = content.replace(/["']@\/app\/constants\//g, '"@/constants/');
  content = content.replace(/["']@\/app\/utils\//g, '"@/utils/');
  content = content.replace(/["']@\/app\/hooks\//g, '"@/hooks/');
  content = content.replace(/["']@\/app\/contexts\//g, '"@/contexts/');
  content = content.replace(/["']@\/app\/lib\//g, '"@/lib/');
  content = content.replace(/["']@\/app\/assets\//g, '"@/assets/');
  
  // Some could have mapped to something weird like @/auth/... instead of @/features/auth/
  content = content.replace(/["']@\/auth\//g, '"@/features/auth/');

  // We had issues with `@/app/vocabulary/components/...` if components was inside vocabulary?
  // Let's also fallback to checking if it's literally mapping to `@/app/something/components`
  content = content.replace(/["']@\/app\/([^/]+)\/components\//g, (match, p1) => {
     // If they were importing from `../components`, maybe it's the global components!
     // In React Router, `src/features/vocabulary/pages/Page.tsx` importing `../components/X` 
     // would point to `src/features/vocabulary/components/X`. 
     // Now it's mapped to `@/app/vocabulary/components/X`, but the actual code for that component
     // might still be in `src/features/vocabulary/components/X`.
     // So it should map to `@/features/vocabulary/components/X`.
     return `"@/features/${p1}/components/`;
  });

  // Handle `@/app/grammar/components` -> `@/features/grammar/components`
  // Handle `@/app/vocabulary/hooks` -> `@/features/vocabulary/hooks`
  content = content.replace(/["']@\/app\/([^/]+)\/(components|hooks|services|utils)\//g, `"@/features/$1/$2/`);

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Cleaned up imported paths in ${file}`);
  }
});
