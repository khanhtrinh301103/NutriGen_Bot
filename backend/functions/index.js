const admin = require("firebase-admin");
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors"); // Thư viện CORS
const axios = require("axios");

const serviceAccount = require("./enter name of the file here.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nutrigen-bot-dd79d.firebaseio.com"
});

const auth = admin.auth();
const db = admin.firestore();
const app = express();

// ✅ Cấu hình CORS để cho phép frontend gọi API
const corsOptions = {
  origin: "http://localhost:3000", // Chỉ cho phép frontend truy cập
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json()); // Middleware để đọc JSON request

// API kiểm tra trạng thái đăng nhập
app.get("/checkAuth", async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    return res.status(200).json({ uid: decodedToken.uid, authenticated: true });
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

// API đăng nhập
app.post("/login", async (req, res) => {
  try {
    const { email, password, googleToken } = req.body;
    if (googleToken) {
      const decodedToken = await auth.verifyIdToken(googleToken);
      return res.status(200).json({ uid: decodedToken.uid, token: googleToken });
    }

    const userRecord = await auth.getUserByEmail(email);
    const token = await auth.createCustomToken(userRecord.uid);
    return res.status(200).json({ uid: userRecord.uid, token });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// API đăng ký (Sửa lỗi CORS)
app.post("/register", async (req, res) => {
  try {
    console.log("📥 Nhận request đăng ký:", req.body); // ✅ Kiểm tra dữ liệu nhận được

    const { email, password, fullName } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password || !fullName) {
      console.error("❌ Thiếu dữ liệu từ request:", { email, password, fullName });
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userRecord = await auth.createUser({ email, password, displayName: fullName });

    // Lưu thông tin user vào Firestore
    await db.collection("user").doc(userRecord.uid).set({
      email,
      fullName
    });

    const token = await auth.createCustomToken(userRecord.uid);
    console.log("✅ Tạo tài khoản thành công:", { uid: userRecord.uid, email, fullName });

    return res.status(201).json({ uid: userRecord.uid, token });
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    return res.status(400).json({ error: error.message });
  }
});


// API tìm kiếm công thức món ăn
app.get("/getRecipe", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Missing 'query' parameter" });
    }

    const response = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${query}&number=3`
    );

    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.api = functions.https.onRequest(app); // Xuất tất cả API với CORS enabled
