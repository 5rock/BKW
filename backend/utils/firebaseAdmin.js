const admin = require('firebase-admin');

const initFirebaseAdmin = () => {
  if (admin.apps.length) return admin;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (serviceAccountJson) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
    });
    return admin;
  }

  if (projectId) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId,
    });
    return admin;
  }

  return null;
};

const verifyFirebaseToken = async (idToken) => {
  const firebaseAdmin = initFirebaseAdmin();
  if (!firebaseAdmin) {
    const error = new Error('Firebase Admin is not configured on the server');
    error.status = 503;
    throw error;
  }
  return firebaseAdmin.auth().verifyIdToken(idToken);
};

module.exports = { verifyFirebaseToken };
