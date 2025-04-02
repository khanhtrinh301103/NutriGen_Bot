export const sendSearchRequest = async (searchTerm, cuisine, setResult) => {
  console.log("🚀 [Frontend] Đang gửi yêu cầu tìm kiếm...");
  console.log("🔍 Keyword:", searchTerm);
  console.log("🌍 Cuisine:", cuisine);

  try {
    const res = await fetch("http://localhost:5000/api/searchRecipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchTerm, cuisine }),
    });

    const data = await res.json();
    console.log("✅ [Frontend] Nhận kết quả từ backend:");
    console.table(data); // hiển thị đẹp từng món ăn
    setResult(data);
  } catch (error) {
    console.error("❌ [Frontend] Lỗi khi gọi backend:", error);
  }
};
