import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

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

// Patterns that indicate a client component
const clientPatterns = [
  'useState',
  'useEffect',
  'useRef',
  'useCallback',
  'useMemo',
  'useReducer',
  'useContext',
  'useRouter',
  'usePathname',
  'useSearchParams',
  'useParams',
  'useUser',
  'useAuth',
  'useProfile',
  'useLanguage',
  'useTextToSpeech',
  'useSpeechRecognition',
  'useExerciseTimer',
  'usePracticeExit',
  'useTheme',
  'onClick',
  'onChange',
  'onSubmit',
  'addEventListener',
  'window.',
  'document.',
  'localStorage',
  'sessionStorage',
];

for (const file of files) {
  // Skip .bak files and node_modules
  if (file.includes('.bak') || file.includes('node_modules')) continue;
  
  let content = readFileSync(file, 'utf-8');
  
  // Skip if already has "use client"
  if (content.startsWith('"use client"') || content.startsWith("'use client'")) continue;
  
  // Skip layout files in app directory (they handle their own directives)
  // Skip if it's a pure server component (no client hooks)
  
  const hasClientCode = clientPatterns.some(pattern => content.includes(pattern));
  
  if (hasClientCode) {
    content = '"use client";\n\n' + content;
    writeFileSync(file, content, 'utf-8');
    fixedCount++;
    console.log(`Added "use client": ${file}`);
  }
}

console.log(`\nDone! Added "use client" to ${fixedCount} files.`);
