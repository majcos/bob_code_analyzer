/**
 * Load Bob API credentials from JSON file
 */

import fs from 'fs';
import path from 'path';

interface BobCredentials {
  name?: string;
  description?: string;
  createdAt?: string;
  apikey: string;
  teamId?: string;
}

let cachedCredentials: BobCredentials | null = null;

export function loadBobCredentials(): BobCredentials | null {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  try {
    // Try to load from bob-credentials.json in root directory
    const credentialsPath = path.join(process.cwd(), 'bob-credentials.json');
    
    if (fs.existsSync(credentialsPath)) {
      const fileContent = fs.readFileSync(credentialsPath, 'utf-8');
      const credentials = JSON.parse(fileContent) as BobCredentials;
      
      console.log('Loaded Bob credentials from bob-credentials.json');
      cachedCredentials = credentials;
      return credentials;
    }
  } catch (error) {
    console.error('Error loading Bob credentials from JSON:', error);
  }

  return null;
}

export function getBobApiKey(): string {
  // First try environment variable
  if (process.env.BOB_API_KEY) {
    return process.env.BOB_API_KEY;
  }

  // Then try JSON file
  const credentials = loadBobCredentials();
  if (credentials?.apikey) {
    return credentials.apikey;
  }

  // Dev/offline fallback
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  No Bob API key found — running in offline/mock mode');
    return 'mock-key';
  }

  throw new Error(
    'Bob API key not found. Set BOB_API_KEY in your .env or provide bob-credentials.json'
  );
}

export function getBobTeamId(): string {
  // First try environment variable
  if (process.env.BOB_TEAM_ID) {
    return process.env.BOB_TEAM_ID;
  }

  // Then try JSON file
  const credentials = loadBobCredentials();
  if (credentials?.teamId) {
    return credentials.teamId;
  }

  return '';
}

// Made with Bob
