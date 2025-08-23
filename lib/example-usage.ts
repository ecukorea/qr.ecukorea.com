/**
 * Example usage of SheetsDataService
 * This demonstrates how to use the service in a real application
 */

import { SheetsDataService } from './sheets-data-service';

// Example function showing how to use the service
export async function exampleUsage() {
  const sheetsService = new SheetsDataService();

  try {
    // Fetch all data from the sheet
    console.log('Fetching data from Google Sheets...');
    const allData = await sheetsService.fetchSheetData();
    console.log(`Found ${allData.length} URL records`);

    // Find a specific URL by ID
    const urlRecord = await sheetsService.findUrlById('abc123');
    if (urlRecord) {
      console.log(`Found URL: ${urlRecord.to} (${urlRecord.description})`);
    } else {
      console.log('URL not found');
    }

    // Example of handling errors
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching data:', error.message);
      
      // Handle specific error types
      if (error.message.includes('Google Sheets fetch failed')) {
        console.log('This might be a network issue or the sheet is not publicly accessible');
      } else if (error.message.includes('Missing required column')) {
        console.log('The sheet format is incorrect - check column headers');
      }
    }
  }
}

// Example of how to integrate with a Next.js API route
export async function handleUrlRedirect(id: string): Promise<string | null> {
  const sheetsService = new SheetsDataService();
  
  try {
    const urlRecord = await sheetsService.findUrlById(id);
    return urlRecord ? urlRecord.to : null;
  } catch (error) {
    console.error('Error during redirect lookup:', error);
    return null;
  }
}