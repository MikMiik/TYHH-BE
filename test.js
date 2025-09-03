const axios = require("axios");
const { City, sequelize } = require("./src/models");

async function fetchAndSaveProvinces() {
  try {
    const res = await axios.get("https://api.vnappmob.com/api/v2/province/");
    const provinces = res.data && res.data.results ? res.data.results : [];
    if (!Array.isArray(provinces)) throw new Error("API response invalid");

    await sequelize.transaction(async (t) => {
      for (const province of provinces) {
        if (province.province_name) {
          await City.findOrCreate({
            where: { name: province.province_name },
            defaults: { name: province.province_name },
            transaction: t,
          });
        }
      }
    });
    console.log("Đã lưu xong danh sách tỉnh/thành phố!");
  } catch (err) {
    console.error("Lỗi:", err.message);
  } finally {
    await sequelize.close();
  }
}

fetchAndSaveProvinces();
