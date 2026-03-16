import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'fs/promises';
import path from 'path';

// Get all tsx files recursively
async function getAllTsxFiles(dir) {
  const { readdirSync, statSync } = await import('fs');
  const files = [];
  
  function walk(currentDir) {
    const entries = readdirSync(currentDir);
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === '.next') continue;
      const fullPath = path.join(currentDir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

const files = await getAllTsxFiles('./src');
let fixedCount = 0;

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  let changed = false;

  // Skip .bak files
  if (file.endsWith('.bak')) continue;

  // Fix: useNavigate() -> useRouter() (variable rename)
  if (content.includes('useNavigate()')) {
    // Add useRouter import if not present
    if (!content.includes('from "next/navigation"') && !content.includes("from 'next/navigation'")) {
      // Add import after "use client" or at top
      if (content.startsWith('"use client"')) {
        content = content.replace('"use client";\n', '"use client";\n\nimport { useRouter } from "next/navigation";\n');
      } else {
        content = 'import { useRouter } from "next/navigation";\n' + content;
      }
    } else if (!content.includes('useRouter') && content.includes('from "next/navigation"')) {
      // Add useRouter to existing import
      content = content.replace(
        /import \{([^}]+)\} from "next\/navigation"/,
        (match, imports) => `import {${imports}, useRouter } from "next/navigation"`
      );
    }

    // Replace the hook call
    content = content.replace(/const navigate = useNavigate\(\)/g, 'const router = useRouter()');
    
    // Replace navigate calls - handle various patterns
    content = content.replace(/\bnavigate\((-1)\)/g, 'router.back()');
    content = content.replace(/\bnavigate\("([^"]+)"\)/g, 'router.push("$1")');
    content = content.replace(/\bnavigate\('([^']+)'\)/g, "router.push('$1')");
    content = content.replace(/\bnavigate\(`([^`]+)`\)/g, 'router.push(`$1`)');
    // navigate with options object like navigate("/path", { replace: true })
    content = content.replace(/\bnavigate\("([^"]+)",\s*\{[^}]*replace:\s*true[^}]*\}\)/g, 'router.replace("$1")');
    content = content.replace(/\bnavigate\('([^']+)',\s*\{[^}]*replace:\s*true[^}]*\}\)/g, "router.replace('$1')");
    
    changed = true;
  }

  // Fix: useSearchParams from react-router-dom -> next/navigation
  if (content.includes('useSearchParams') && content.includes('react-router-dom')) {
    content = content.replace(/import \{([^}]*useSearchParams[^}]*)\} from "react-router-dom"/, (match, imports) => {
      const otherImports = imports.split(',').map(s => s.trim()).filter(s => s !== 'useSearchParams' && s !== '');
      const result = [];
      if (otherImports.length > 0) {
        result.push(`import { ${otherImports.join(', ')} } from "react-router-dom"`);
      }
      // Add to next/navigation import or create new one
      if (content.includes('from "next/navigation"')) {
        // Will be handled below
        return otherImports.length > 0 ? `import { ${otherImports.join(', ')} } from "react-router-dom"` : '';
      }
      result.push(`import { useSearchParams } from "next/navigation"`);
      return result.join('\n');
    });
    
    // Add useSearchParams to existing next/navigation import
    if (content.includes('from "next/navigation"') && !content.includes('useSearchParams')) {
      content = content.replace(
        /import \{([^}]+)\} from "next\/navigation"/,
        (match, imports) => `import {${imports}, useSearchParams } from "next/navigation"`
      );
    }
    changed = true;
  }

  // Fix: useLocation() -> usePathname()
  if (content.includes('useLocation()') && !content.includes('from "react-router-dom"')) {
    if (!content.includes('usePathname') && content.includes('from "next/navigation"')) {
      content = content.replace(
        /import \{([^}]+)\} from "next\/navigation"/,
        (match, imports) => `import {${imports}, usePathname } from "next/navigation"`
      );
    }
    content = content.replace(/const location = useLocation\(\)/g, 'const pathname = usePathname()');
    content = content.replace(/location\.pathname/g, 'pathname');
    changed = true;
  }

  // Fix: remaining useNavigate import from react-router-dom
  if (content.includes('useNavigate') && content.includes('react-router-dom')) {
    content = content.replace(/import \{([^}]*useNavigate[^}]*)\} from "react-router-dom"/, (match, imports) => {
      const otherImports = imports.split(',').map(s => s.trim()).filter(s => s !== 'useNavigate' && s !== '');
      return otherImports.length > 0 ? `import { ${otherImports.join(', ')} } from "react-router-dom"` : '';
    });
    changed = true;
  }

  if (changed) {
    writeFileSync(file, content, 'utf-8');
    fixedCount++;
    console.log(`Fixed: ${file}`);
  }
}

console.log(`\nDone! Fixed ${fixedCount} files.`);
