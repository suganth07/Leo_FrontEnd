// Google Drive API configuration for browser-based access
const DRIVE_API_BASE_URL = 'https://www.googleapis.com/drive/v3';

// This will hold our access token
let accessToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Get a valid access token using service account credentials
 * This handles token refresh automatically
 */
async function getAccessToken(): Promise<string> {
  // Check if we have a valid token that hasn't expired
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    // For browser compatibility, we'll make a request to our backend to get the token
    // This is necessary because we can't sign JWTs with private keys in the browser
    console.log('Requesting access token from backend...');
    const response = await fetch('/api/auth/google-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Token request failed: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Subtract 1 minute for safety

    console.log('Successfully obtained access token');
    return accessToken!; // We know it's not null here
  } catch (error) {
    console.error('Failed to get access token:', error);
    throw error;
  }
}

/**
 * Make authenticated requests to Google Drive API
 */
async function makeAuthenticatedRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  try {
    const token = await getAccessToken();
    
    const url = new URL(`${DRIVE_API_BASE_URL}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    console.log(`Making Drive API request to: ${endpoint}`);
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Drive API request failed: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Drive API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`Drive API request successful for ${endpoint}`);
    return result;
  } catch (error) {
    console.error('Error in makeAuthenticatedRequest:', error);
    throw error;
  }
}

/**
 * List files in a specific Google Drive folder
 * @param folderId - The ID of the folder to list files from
 * @param mimeType - Filter by MIME type (default: images)
 * @returns Array of files with id, name, and webContentLink
 */
export async function listDriveFiles(
  folderId: string, 
  mimeType: string = 'image/'
): Promise<{ id: string; name: string; webContentLink?: string }[]> {
  try {
    const query = `'${folderId}' in parents and mimeType contains '${mimeType}' and trashed=false`;
    
    const response = await makeAuthenticatedRequest('/files', {
      q: query,
      fields: 'files(id, name, webContentLink)',
      pageSize: '1000'
    });

    return response.files || [];
  } catch (error) {
    console.error('Error listing Drive files:', error);
    throw error;
  }
}

/**
 * List folders in a specific Google Drive folder
 * @param parentFolderId - The ID of the parent folder
 * @returns Array of folders with id and name
 */
export async function listDriveFolders(
  parentFolderId: string
): Promise<{ id: string; name: string }[]> {
  try {
    const query = `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    
    const response = await makeAuthenticatedRequest('/files', {
      q: query,
      fields: 'files(id, name)',
      pageSize: '1000'
    });

    return response.files || [];
  } catch (error) {
    console.error('Error listing Drive folders:', error);
    throw error;
  }
}

/**
 * Get file metadata from Google Drive
 * @param fileId - The ID of the file
 * @returns File metadata including name
 */
export async function getFileMetadata(fileId: string): Promise<{ name: string }> {
  try {
    const response = await makeAuthenticatedRequest(`/files/${fileId}`, {
      fields: 'name'
    });

    return { name: response.name };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
}

/**
 * Generate Google Drive view URL for a file
 * @param fileId - The ID of the file
 * @returns Direct view URL for the file
 */
export function getGoogleDriveViewUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/**
 * Generate Google Drive download URL for a file
 * @param fileId - The ID of the file
 * @returns Direct download URL for the file
 */
export function getGoogleDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Batch fetch files with pagination support for large datasets
 * @param folderId - The ID of the folder
 * @param mimeType - Filter by MIME type
 * @param pageSize - Number of files per batch (default: 100)
 * @param onProgress - Callback function to track progress
 * @returns Array of all files
 */
export async function batchFetchFiles(
  folderId: string,
  mimeType: string = 'image/',
  pageSize: number = 100,
  onProgress?: (loaded: number, total?: number) => void
): Promise<{ id: string; name: string; url: string }[]> {
  try {
    const allFiles: { id: string; name: string; url: string }[] = [];
    let nextPageToken: string | undefined = undefined;
    let totalLoaded = 0;

    do {
      const query = `'${folderId}' in parents and mimeType contains '${mimeType}' and trashed=false`;
      
      const params: Record<string, string> = {
        q: query,
        fields: 'files(id, name), nextPageToken',
        pageSize: pageSize.toString()
      };

      if (nextPageToken) {
        params.pageToken = nextPageToken;
      }

      const response = await makeAuthenticatedRequest('/files', params);
      const files = response.files || [];
      
      // Transform files to include view URLs
      const transformedFiles = files.map((file: any) => ({
        id: file.id,
        name: file.name,
        url: getGoogleDriveViewUrl(file.id),
      }));

      allFiles.push(...transformedFiles);
      totalLoaded += files.length;
      
      // Call progress callback if provided
      if (onProgress) {
        onProgress(totalLoaded);
      }

      nextPageToken = response.nextPageToken;
    } while (nextPageToken);

    return allFiles;
  } catch (error) {
    console.error('Error in batch fetch files:', error);
    throw error;
  }
}

/**
 * Check if we can make requests to the Drive API
 * @returns boolean indicating if the client is ready
 */
export function isDriveClientReady(): boolean {
  return true; // Always ready since we use REST API directly
}

/**
 * Simple method to get files count without loading all files
 * Useful for progress indication
 */
export async function getFilesCount(folderId: string, mimeType: string = 'image/'): Promise<number> {
  try {
    const query = `'${folderId}' in parents and mimeType contains '${mimeType}' and trashed=false`;
    
    const response = await makeAuthenticatedRequest('/files', {
      q: query,
      fields: 'files(id)',
      pageSize: '1000'
    });

    return response.files?.length || 0;
  } catch (error) {
    console.error('Error getting files count:', error);
    return 0;
  }
}
