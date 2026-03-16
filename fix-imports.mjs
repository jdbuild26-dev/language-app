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

// Map of wrong import paths to correct ones
const importFixes = [
  // lesson-learn components
  [/@\/components\/lesson-learn/g, '@/features/vocabulary/components/lesson-learn'],
  // SegmentedInput
  [/@\/components\/ui\/SegmentedInput/g, '@/features/vocabulary/components/ui/SegmentedInput'],
  // AudioPlayer in shared
  [/@\/components\/shared\/AudioPlayer/g, '@/features/vocabulary/components/shared/AudioPlayer'],
  // StoriesLearnContent
  [/@\/components\/StoriesLearnContent/g, '@/features/stories/components/StoriesLearnContent'],
  // ChatsContent
  [/@\/components\/ChatsContent/g, '@/features/ai-practice/components/ChatsContent'],
  // GeneralModeContent
  [/@\/components\/GeneralModeContent/g, '@/features/ai-practice/components/GeneralModeContent'],
  // MissionsContent
  [/@\/components\/MissionsContent/g, '@/features/ai-practice/components/MissionsContent'],
  // ProfessionContent
  [/@\/components\/ProfessionContent/g, '@/features/ai-practice/components/ProfessionContent'],
  // ConversationWarmup
  [/@\/components\/ConversationWarmup/g, '@/features/ai-practice/components/ConversationWarmup'],
  // AnalyzeModal
  [/@\/components\/AnalyzeModal/g, '@/features/ai-practice/components/AnalyzeModal'],
  // LearnContent
  [/@\/components\/LearnContent/g, '@/features/vocabulary/components/LearnContent'],
  // ReviewContent
  [/@\/components\/ReviewContent/g, '@/features/vocabulary/components/ReviewContent'],
  // PracticeContent
  [/@\/components\/PracticeContent/g, '@/features/vocabulary/components/PracticeContent'],
];

for (const file of files) {
  if (file.includes('.bak') || file.includes('node_modules')) continue;
  
  let content = readFileSync(file, 'utf-8');
  let changed = false;
  
  for (const [pattern, replacement] of importFixes) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      changed = true;
    }
  }
  
  if (changed) {
    writeFileSync(file, content, 'utf-8');
    fixedCount++;
    console.log(`Fixed imports: ${file}`);
  }
}

console.log(`\nDone! Fixed imports in ${fixedCount} files.`);
