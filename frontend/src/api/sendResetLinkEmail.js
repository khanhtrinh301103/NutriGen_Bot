import { auth, db } from "./firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";

export const sendResetLinkEmail = async (email) => {
  const trimmedEmail = email.trim().toLowerCase();

  try {
    // 🔍 Tìm user trong Firestore
    const q = query(collection(db, "user"), where("email", "==", trimmedEmail));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("📭 Email not found in Firestore:", trimmedEmail);
      return { success: false, error: "This email has not registered yet." };
    }

    const userData = snapshot.docs[0].data();
    console.log("📌 Found user:", userData);

    if (userData.provider === "google") {
      return {
        success: false,
        error: "This account was created with Google. Please use Google Sign-In."
      };
    }

    if (userData.provider === "password") {
      await sendPasswordResetEmail(auth, trimmedEmail);
      return { success: true };
    }

    return {
      success: false,
      error: "Unsupported provider type."
    };
  } catch (error) {
    console.error("❌ Error in sendResetLinkEmail:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again."
    };
  }
};
