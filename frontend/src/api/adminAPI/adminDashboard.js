// frontend/src/api/adminAPI/adminDashboard.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const getDashboardStats = async () => {
  console.log("📊 [Admin Dashboard] Fetching dashboard statistics");
  try {
    const usersSnapshot = await getDocs(collection(db, "user"));

    let totalUsers = 0;
    let maleCount = 0;
    let femaleCount = 0;

    // Health goals (5 lựa chọn)
    let healthGoalsCounts = {
      "Weight Loss": 0,
      "Weight Maintenance": 0,
      "Weight Gain": 0,
      "Muscle Gain": 0,
      "Improve Health": 0,
    };

    // Popular Activity Levels (5 lựa chọn)
    let activityLevelsCounts = {
      "Sedentary": 0,
      "Lightly Active": 0,
      "Moderately Active": 0,
      "Very Active": 0,
      "Extremely Active": 0,
    };

    // Tính số lượng Dietary Restrictions
    let dietaryRestrictionsCount = {};

    // Tính số lần xuất hiện của Allergies từ tất cả người dùng
    let allergiesCount = {};

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      totalUsers++;
      const hp = data.healthProfile;
      if (!hp) return; // Nếu không có healthProfile thì bỏ qua

      // --- Gender (lấy từ hp.gender) ---
      const rawGender = hp.gender ? hp.gender.trim().toLowerCase() : "";
      if (rawGender === "male") {
        maleCount++;
      } else if (rawGender === "female") {
        femaleCount++;
      }

      // --- Health Goals (lấy từ hp.goal) ---
      if (hp.goal) {
        const userGoal = hp.goal.trim().toLowerCase();
        if (userGoal === "weight loss") {
          healthGoalsCounts["Weight Loss"]++;
        } else if (userGoal === "weight maintenance") {
          healthGoalsCounts["Weight Maintenance"]++;
        } else if (userGoal === "weight gain") {
          healthGoalsCounts["Weight Gain"]++;
        } else if (userGoal === "muscle gain") {
          healthGoalsCounts["Muscle Gain"]++;
        } else if (userGoal === "improve health") {
          healthGoalsCounts["Improve Health"]++;
        } else {
          console.log(`⚠️ Unrecognized goal: "${hp.goal}"`);
        }
      }

      // --- Activity Level (lấy từ hp.activityLevel) ---
      if (hp.activityLevel) {
        const rawActivity = hp.activityLevel.trim().toLowerCase();
        if (rawActivity === "sedentary") {
          activityLevelsCounts["Sedentary"]++;
        } else if (rawActivity === "lightly active") {
          activityLevelsCounts["Lightly Active"]++;
        } else if (rawActivity === "moderately active") {
          activityLevelsCounts["Moderately Active"]++;
        } else if (rawActivity === "very active") {
          activityLevelsCounts["Very Active"]++;
        } else if (rawActivity === "extremely active") {
          activityLevelsCounts["Extremely Active"]++;
        } else {
          console.log(`⚠️ Unrecognized activity level: "${hp.activityLevel}"`);
        }
      }

      // --- Dietary Restrictions (lấy từ hp.dietaryRestrictions) ---
      if (hp.dietaryRestrictions && Array.isArray(hp.dietaryRestrictions)) {
        hp.dietaryRestrictions.forEach((restriction) => {
          const key = restriction.trim();
          dietaryRestrictionsCount[key] = (dietaryRestrictionsCount[key] || 0) + 1;
        });
      }

      // --- Allergies (lấy từ hp.allergies) ---
      if (hp.allergies && Array.isArray(hp.allergies)) {
        hp.allergies.forEach((alg) => {
          const allergyKey = alg.trim();
          allergiesCount[allergyKey] = (allergiesCount[allergyKey] || 0) + 1;
        });
      }
    });

    // Sắp xếp và lấy top 5 Dietary Restrictions
    let topDietaryRestrictions = Object.entries(dietaryRestrictionsCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Sắp xếp và lấy top 5 Allergies (theo độ phổ biến)
    let topAllergies = Object.entries(allergiesCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Chuẩn bị dữ liệu cho biểu đồ
    const genderRatio = [
      { name: "Male", value: maleCount },
      { name: "Female", value: femaleCount },
    ];

    const healthGoals = Object.entries(healthGoalsCounts).map(([name, value]) => ({
      name,
      value,
    }));

    const activityLevels = Object.entries(activityLevelsCounts).map(([name, value]) => ({
      name,
      value,
    }));

    const dashboardStats = {
      totalUsers,
      genderRatio,
      healthGoals,
      activityLevels,
      topDietaryRestrictions,
      topAllergies,
    };

    console.log("✅ [Admin Dashboard] Stats:", dashboardStats);
    return dashboardStats;
  } catch (error) {
    console.error("❌ [Admin Dashboard] Error fetching stats:", error);
    return {
      totalUsers: 0,
      genderRatio: [],
      healthGoals: [],
      activityLevels: [],
      topDietaryRestrictions: [],
      topAllergies: [],
    };
  }
};
