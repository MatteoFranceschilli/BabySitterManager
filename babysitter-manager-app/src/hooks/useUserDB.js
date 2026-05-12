import { useState, useEffect } from 'react';
import { db_fs } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SK = "babysitter_db";

export function saveLocal(d) {
  try {
    localStorage.setItem(SK, JSON.stringify(d));
  } catch (e) {}
}

export function loadLocal() {
  try {
    const r = localStorage.getItem(SK);
    return r ? JSON.parse(r) : null;
  } catch (e) {
    return null;
  }
}

export async function saveDB(uid_user, d) {
  saveLocal(d);
  if (db_fs && uid_user) {
    try {
      await setDoc(doc(db_fs, "users", uid_user), { db: JSON.stringify(d) }, { merge: true });
    } catch (e) {
      console.error(e);
    }
  }
}

export async function loadDB_remote(uid_user) {
  if (!db_fs || !uid_user) return null;
  try {
    const userDoc = await getDoc(doc(db_fs, "users", uid_user));
    if (userDoc.exists() && userDoc.data().db) {
      return JSON.parse(userDoc.data().db);
    }
  } catch (e) {}
  return null;
}

export function useUserDB(auth_fb) {
  const [db, setDb] = useState(null);

  useEffect(() => {
    // Basic hook implementation
    const local = loadLocal();
    if(local) setDb(local);
  }, []);

  return { db, setDb, saveDB, loadDB_remote };
}
