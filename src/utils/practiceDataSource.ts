/** Bundled Main Practice CSVs are development fixtures, never live content. */
export function allowBundledPracticeCsv(fileName: string, environment: string): boolean {
  return environment !== "production" || !/^practice\/(reading|listening|writing|speaking)\//.test(fileName);
}
