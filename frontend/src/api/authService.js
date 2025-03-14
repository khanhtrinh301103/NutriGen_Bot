import { getAuth, signOut } from "firebase/auth";

/**
 * Đăng xuất người dùng hiện tại
 */
export const signOutUser = async () => {
  const auth = getAuth();
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
};
