import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Token endpoint called');
    
    // Get credentials from environment variables
    const encodedCredentials = process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_BASE64;
    if (!encodedCredentials) {
      console.error('Google Service Account credentials not found in environment');
      return NextResponse.json(
        { error: 'Google Service Account credentials not found' },
        { status: 500 }
      );
    }

    console.log('Credentials found, decoding...');
    // Decode the base64 credentials
    const decodedJson = Buffer.from(encodedCredentials, 'base64').toString('utf8');
    const credentials = JSON.parse(decodedJson);

    console.log('Creating JWT for service account authentication...');

    // Create JWT for service account authentication
    const now = Math.floor(Date.now() / 1000);
    const expiry = now + 3600; // 1 hour

    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: credentials.private_key_id
    };

    const payload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: expiry,
      iat: now
    };

    // Create the JWT
    const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signatureInput = `${headerBase64}.${payloadBase64}`;

    // Import crypto for signing (Node.js environment)
    const crypto = await import('crypto');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signatureInput);
    const signature = sign.sign(credentials.private_key, 'base64url');

    const jwt = `${signatureInput}.${signature}`;

    console.log('JWT created, exchanging for access token...');
    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return NextResponse.json(
        { error: 'Failed to exchange JWT for access token' },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('Access token obtained successfully');

    return NextResponse.json({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
    });

  } catch (error) {
    console.error('Error generating access token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
