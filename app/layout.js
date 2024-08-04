'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { firebaseConfig } from "@/firebase";
import { FirebaseAppProvider, FirestoreProvider } from "reactfire";
import { getFirestore } from 'firebase/firestore';
import { useState } from 'react';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [firestore] = useState(() => getFirestore());

  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <FirestoreProvider sdk={firestore}>
        <html lang="en">
          <body className={inter.className}>{children}</body>
        </html>
      </FirestoreProvider>
    </FirebaseAppProvider>
  );
}
