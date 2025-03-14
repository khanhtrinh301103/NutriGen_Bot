import { auth } from "./firebaseConfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export const signInUser = async ({ email, password }) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return { uid: user.uid, email: user.email, displayName: user.displayName };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return { uid: user.uid, email: user.email, displayName: user.displayName };
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};
