import type { RequestHandler } from "express";

// For Firebase client-side authentication, we verify tokens differently
// We'll use a simpler approach that doesn't require Admin SDK
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Verify the Firebase ID token by calling Firebase REST API
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID!;
    const apiKey = process.env.VITE_FIREBASE_API_KEY!;
    
    // Verify the token using Firebase's verify endpoint
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    const data = await response.json();
    const user = data.users?.[0];
    
    if (!user) {
      throw new Error('User not found');
    }

    // Extract user info from verified token
    const nameParts = user.displayName?.split(' ') || ['', ''];
    (req as any).user = {
      uid: user.localId,
      email: user.email,
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' '),
      profileImageUrl: user.photoUrl || null,
    };
    
    next();
  } catch (error) {
    console.error("Firebase token verification error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
