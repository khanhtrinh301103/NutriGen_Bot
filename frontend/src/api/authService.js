const API_BASE_URL = "http://127.0.0.1:5001/nutrigen-bot-dd79d/us-central1/api";

// API đăng ký người dùng mới (Sửa lỗi displayName → fullName)
export const registerUser = async (userData) => {
  try {
    // ✅ Chuyển đổi displayName thành fullName trước khi gửi request
    const formattedUserData = {
      email: userData.email,
      password: userData.password,
      fullName: userData.displayName, // ✅ Đổi key `displayName` → `fullName`
    };

    console.log("📤 Gửi request đăng ký:", formattedUserData);

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formattedUserData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Server trả về lỗi:", errorData);
      throw new Error(errorData.error || "Registration failed");
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Registration error:", error);
    throw error;
  }
};

// API đăng nhập
export const signIn = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Sign in failed");
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Sign in error:", error);
    throw error;
  }
};

// API kiểm tra xác thực
export const checkAuth = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/checkAuth`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Authentication check failed");
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Auth check error:", error);
    throw error;
  }
};
