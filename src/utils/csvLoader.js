import Papa from 'papaparse';

/**
 * Loads a CSV file from the public folder and parses it into an array of objects.
 * @param {string} fileName - The name of the CSV file in /public/mock-data/
 * @returns {Promise<Array>} - A promise that resolves to the parsed data.
 */
export const loadMockCSV = async (fileName) => {
    try {
        const response = await fetch(`/mock-data/${fileName}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch CSV: ${fileName}`);
        }
        const csvString = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csvString, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    // Post-process to handle strings that should be arrays or objects
                    const processedData = results.data.map(row => {
                        const newRow = { ...row };
                        for (const key in newRow) {
                            const value = newRow[key];
                            if (typeof value === 'string') {
                                // Check if it's a JSON array or object
                                if ((value.startsWith('[') && value.endsWith(']')) || (value.startsWith('{') && value.endsWith('}'))) {
                                    try {
                                        newRow[key] = JSON.parse(value);
                                    } catch (e) {
                                        // Not valid JSON, leave as string (e.g. might be a comma-separated list)
                                        // If it's a comma-separated list like "a, b, c", we might want to split it
                                        // but we should be careful. Maybe only if we expect it.
                                    }
                                } else if (value.includes(',') && !value.includes(' ')) {
                                    // This is risky, better to rely on JSON format for arrays in CSV cells
                                }
                            }
                        }
                        return newRow;
                    });
                    resolve(processedData);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error(`Error loading CSV ${fileName}:`, error);
        return [];
    }
};
