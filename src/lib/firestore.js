
import {
  doc,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";

function getUserId() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Kamu harus login terlebih dahulu.");
  }

  return user.uid;
}

export async function simpanProfil(data) {
  const uid = getUserId();

  await setDoc(
    doc(db, "users", uid, "profile", "data"),
    data,
    { merge: true }
  );
}

export async function ambilProfil() {
  const uid = getUserId();

  const snapshot = await getDoc(
    doc(db, "users", uid, "profile", "data")
  );

  return snapshot.exists() ? snapshot.data() : null;
}

export async function simpanSimulasi(data) {
  const uid = getUserId();

  const hasil = await addDoc(
    collection(db, "users", uid, "simulasi"),
    data
  );

  return hasil.id;
}

export async function ambilSimulasi() {
  const uid = getUserId();

  const snapshot = await getDocs(
    collection(db, "users", uid, "simulasi")
  );

  return snapshot.docs.map((item) => ({
    ...item.data(),
    id: item.id,
  }));
}

export async function hapusSimulasi(id) {
  const uid = getUserId();

  await deleteDoc(
    doc(db, "users", uid, "simulasi", id)
  );
}


export async function simpanTarget(data) {
  const uid = getUserId();

  const hasil = await addDoc(
    collection(db, "users", uid, "target"),
    data
  );

  return hasil.id;
}

export async function ambilTarget() {
  const uid = getUserId();

  const snapshot = await getDocs(
    collection(db, "users", uid, "target")
  );

  return snapshot.docs.map((item) => ({
    ...item.data(),
    id: item.id,
  }));
}



export async function perbaruiTarget(id, data) {
  const uid = getUserId();

  await updateDoc(
    doc(db, "users", uid, "target", id),
    data
  );
}

export async function hapusTarget(id) {
  const uid = getUserId();

  await deleteDoc(
    doc(db, "users", uid, "target", id)
  );
}
