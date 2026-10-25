export function isFullscreenVocabularyExercise(pathname: string): boolean {
  return (
    pathname.startsWith("/vocabulary/practice/") ||
    pathname.startsWith("/vocabulary/lessons/activities/")
  );
}
