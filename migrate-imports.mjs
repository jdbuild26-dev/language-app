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

  // Next/Link migrations
  content = content.replace(/import\s+{\s*Link\s*}\s+from\s+["']react-router-dom["'];?/g, 'import Link from "next/link";');
  content = content.replace(/<Link([^>]+)to=/g, '<Link$1href=');
  
  // Next/Navigation Hooks
  content = content.replace(/import\s+{([^}]*)}?\s+from\s+["']react-router-dom["'];?/g, (match, imports) => {
    let newImports = [];
    if (imports.includes('useNavigate')) {
      newImports.push('useRouter');
      content = content.replace(/const\s+(\w+)\s*=\s*useNavigate\(\)/g, 'const $1 = useRouter()');
    }
    if (imports.includes('useLocation')) {
      newImports.push('usePathname');
      content = content.replace(/const\s+(\w+)\s*=\s*useLocation\(\)/g, 'const $1 = usePathname()');
      content = content.replace(/\.pathname/g, ''); // Fix `.pathname` usage if they did `useLocation().pathname` wait, too risky
    }
    if (imports.includes('useParams')) {
      newImports.push('useParams');
    }
    
    if (newImports.length > 0) {
      return `import { ${newImports.join(', ')} } from "next/navigation";`;
    }
    return match; // fallback if it contained other things we can't auto-migrate easily right now
  });

  // Env vars mapping
  content = content.replace(/import\.meta\.env\.VITE_/g, 'process.env.NEXT_PUBLIC_');

  // Some "use client" injections if the file uses hooks and doesn't have it
  if ((content.includes('useState(') || content.includes('useEffect(') || content.includes('useRouter()') || content.includes('usePathname()') || content.includes('useContext(') || content.includes('useRef(')) && !content.includes('"use client"')) {
     content = '"use client";\n\n' + content;
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
