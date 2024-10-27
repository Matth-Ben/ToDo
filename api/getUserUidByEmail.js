// api/getUserUidByEmail.js

import admin from 'firebase-admin';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Vérifier que l'utilisateur est authentifié
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  try {
    // Vérifier le jeton Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const requesterUid = decodedToken.uid;

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Adresse e-mail manquante' });
    }

    // Obtenir l'UID de l'utilisateur cible
    const userRecord = await admin.auth().getUserByEmail(email);
    const targetUid = userRecord.uid;

    return res.status(200).json({ uid: targetUid });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'UID :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}
