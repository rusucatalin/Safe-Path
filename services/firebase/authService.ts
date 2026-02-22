import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';
import type { AuthUser, UserProfile } from '@/types/user.types';

export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

export function toAuthUser(u: FirebaseUser | { uid: string; email: string | null; displayName: string | null; photoURL: string | null }): AuthUser {
  return {
    uid: u.uid,
    email: u.email ?? null,
    displayName: u.displayName ?? null,
    photoURL: u.photoURL ?? null,
  };
}

export function onAuthChange(callback: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? toAuthUser(firebaseUser) : null);
  });
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const profile: UserProfile = {
    uid: cred.user.uid,
    email: cred.user.email ?? email,
    displayName: displayName.trim() || (cred.user.displayName ?? 'Utilizator'),
    photoURL: cred.user.photoURL ?? null,
    reportsCount: 0,
    reputation: 0,
  };
  await setDoc(doc(db, 'users', cred.user.uid), profile);
  return cred;
}

export async function loginWithEmail(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Google Sign-In: în Expo folosești expo-auth-session + Google;
 * aici e doar semnătura. Implementare completă când adaugi expo-auth-session.
 */
export async function loginWithGoogle(idToken: string): Promise<UserCredential> {
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}

export async function getOrCreateUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  const firebaseUser = auth.currentUser;
  if (!firebaseUser || firebaseUser.uid !== uid) return null;
  const profile: UserProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName: firebaseUser.displayName ?? 'Utilizator',
    photoURL: firebaseUser.photoURL ?? null,
    reportsCount: 0,
    reputation: 0,
  };
  await setDoc(ref, profile);
  return profile;
}
