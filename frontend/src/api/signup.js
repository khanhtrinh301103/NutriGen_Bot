import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const registerUser = async ({ email, password, displayName }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName });
    await setDoc(doc(db, "user", user.uid), { email, fullName: displayName });
    return { uid: user.uid, email, displayName };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const signUpWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await setDoc(doc(db, "user", user.uid), { email: user.email, fullName: user.displayName }, { merge: true });
    return { uid: user.uid, email: user.email, displayName: user.displayName };
  } catch (error) {
    console.error("Google sign-up error:", error);
    throw error;
  }
};
