/**
 * Script to seed 200 common chemistry combinations to the database
 * Run: node test.js
 */

require('module-alias/register');
const { Entity, EntityCombination, sequelize } = require('@/models');

// 200 common chemistry combinations with diverse and meaningful icons
// Format: [element1, element2, result entity data]
const commonCombinations = [
  // Basic Oxides & Salts (1-20)
  ['H', 'O', { name: 'Nước', icon: '💧', formula: 'H2O', description: 'Nước là hợp chất của hai nguyên tử Hydro và một nguyên tử Oxy, là dung môi phổ biến nhất trên Trái Đất.' }],
  ['Na', 'Cl', { name: 'Natri clorua', icon: '🧂', formula: 'NaCl', description: 'Muối ăn, hợp chất ion được tạo từ Natri và Clo, là gia vị và chất bảo quản thực phẩm quan trọng.' }],
  ['C', 'O', { name: 'Cacbon đioxit', icon: '☁️', formula: 'CO2', description: 'Khí CO2, sản phẩm của sự hô hấp và đốt cháy, là khí nhà kính quan trọng.' }],
  ['Ca', 'O', { name: 'Canxi oxit', icon: '🪨', formula: 'CaO', description: 'Vôi sống, chất rắn màu trắng được dùng trong xây dựng và công nghiệp.' }],
  ['Fe', 'O', { name: 'Sắt oxit', icon: '🟤', formula: 'Fe2O3', description: 'Gỉ sắt, chất rắn màu nâu đỏ, là sản phẩm của quá trình ăn mòn sắt trong không khí ẩm.' }],
  ['Mg', 'O', { name: 'Magie oxit', icon: '🔥', formula: 'MgO', description: 'Chất rắn màu trắng phát sáng rực rỡ khi đốt cháy, được dùng trong y học và công nghiệp.' }],
  ['Al', 'O', { name: 'Nhôm oxit', icon: '💎', formula: 'Al2O3', description: 'Alumina, chất rắn cứng màu trắng, là thành phần chính của quặng nhôm và đá quý.' }],
  ['S', 'O', { name: 'Lưu huỳnh đioxit', icon: '🌫️', formula: 'SO2', description: 'Khí có mùi hắc, sản phẩm của sự đốt cháy lưu huỳnh, gây mưa axit.' }],
  ['N', 'O', { name: 'Nitơ oxit', icon: '💨', formula: 'NO', description: 'Khí không màu, sản phẩm của phản ứng giữa Nitơ và Oxy ở nhiệt độ cao.' }],
  ['P', 'O', { name: 'Photpho pentaoxit', icon: '⚗️', formula: 'P2O5', description: 'Chất hút ẩm mạnh, dùng làm chất khử nước trong phòng thí nghiệm.' }],
  ['K', 'Cl', { name: 'Kali clorua', icon: '🔬', formula: 'KCl', description: 'Muối kali, được dùng làm phân bón và thực phẩm chức năng.' }],
  ['Ca', 'C', { name: 'Canxi cacbua', icon: '⚫', formula: 'CaC2', description: 'Chất rắn màu xám, phản ứng với nước tạo khí axetylen.' }],
  ['Na', 'H', { name: 'Natri hiđrua', icon: '⚡', formula: 'NaH', description: 'Chất khử mạnh, được dùng trong tổng hợp hữu cơ.' }],
  ['Mg', 'Cl', { name: 'Magie clorua', icon: '❄️', formula: 'MgCl2', description: 'Muối tan trong nước, được dùng làm chất chống đông đường và trong công nghiệp.' }],
  ['Cu', 'O', { name: 'Đồng(II) oxit', icon: '⬛', formula: 'CuO', description: 'Chất rắn màu đen, được dùng làm chất xúc tác và sản xuất thủy tinh.' }],
  ['Zn', 'O', { name: 'Kẽm oxit', icon: '⬜', formula: 'ZnO', description: 'Chất rắn màu trắng, được dùng trong kem chống nắng và cao su.' }],
  ['Ag', 'Cl', { name: 'Bạc clorua', icon: '📸', formula: 'AgCl', description: 'Chất rắn màu trắng, không tan trong nước, dùng trong nhiếp ảnh.' }],
  ['Ba', 'S', { name: 'Bari sunfua', icon: '✨', formula: 'BaS', description: 'Chất rắn màu trắng, được dùng làm chất khử và trong sản xuất sơn phát quang.' }],
  ['Pb', 'O', { name: 'Chì oxit', icon: '🟠', formula: 'PbO', description: 'Chất rắn màu đỏ hoặc vàng, được dùng trong sản xuất thủy tinh và gốm sứ.' }],
  ['Sn', 'O', { name: 'Thiếc oxit', icon: '🔲', formula: 'SnO2', description: 'Chất rắn màu trắng, được dùng làm chất mài mòn và trong điện tử.' }],

  // Acids (21-35)
  ['H', 'Cl', { name: 'Axit clohidric', icon: '🧪', formula: 'HCl', description: 'Axit mạnh, dung dịch của khí HCl trong nước, được dùng trong công nghiệp và phòng thí nghiệm.' }],
  ['H', 'S', { name: 'Hydro sunfua', icon: '🦨', formula: 'H2S', description: 'Khí có mùi trứng thối, độc, được tạo ra từ sự phân hủy protein.' }],
  ['H', 'N', { name: 'Amoniac', icon: '🌬️', formula: 'NH3', description: 'Khí có mùi khai, bazơ yếu, được dùng làm phân bón và chất tẩy rửa.' }],
  ['H', 'F', { name: 'Axit flohidric', icon: '⚠️', formula: 'HF', description: 'Axit yếu nhưng ăn mòn mạnh, có thể ăn mòn thủy tinh.' }],
  ['H', 'Br', { name: 'Axit bromhidric', icon: '🟤', formula: 'HBr', description: 'Axit mạnh, dung dịch của khí HBr trong nước.' }],
  ['H', 'I', { name: 'Axit iodhidric', icon: '🟣', formula: 'HI', description: 'Axit mạnh nhất trong các halogen hidric, dễ bị oxy hóa.' }],
  ['N', 'H2O', { name: 'Axit nitric', icon: '💥', formula: 'HNO3', description: 'Axit mạnh, chất oxy hóa mạnh, được dùng trong sản xuất phân bón và thuốc nổ.' }],
  ['S', 'H2O', { name: 'Axit sunfuric', icon: '🔴', formula: 'H2SO4', description: 'Axit mạnh nhất, chất hút ẩm và oxy hóa mạnh, là hóa chất công nghiệp quan trọng.' }],
  ['P', 'H2O', { name: 'Axit photphoric', icon: '🥤', formula: 'H3PO4', description: 'Axit trung bình, được dùng trong sản xuất phân bón và thực phẩm.' }],
  ['C', 'H2O', { name: 'Axit cacbonic', icon: '🫧', formula: 'H2CO3', description: 'Axit yếu, tồn tại trong nước có hòa tan CO2, tạo nước có ga.' }],
  ['Cl', 'H2O', { name: 'Axit hipoclorơ', icon: '🧼', formula: 'HClO', description: 'Axit yếu, chất tẩy trắng và khử trùng mạnh.' }],
  ['C', 'H', { name: 'Metan', icon: '🔥', formula: 'CH4', description: 'Khí hydrocarbon đơn giản nhất, thành phần chính của khí tự nhiên.' }],
  ['C', 'C', { name: 'Etilen', icon: '🌱', formula: 'C2H4', description: 'Hydrocarbon không no, được dùng làm nguyên liệu trong công nghiệp hóa dầu.' }],
  ['Metan', 'Cl', { name: 'Clorometan', icon: '❄️', formula: 'CH3Cl', description: 'Khí không màu, được dùng làm chất làm lạnh và dung môi.' }],
  ['C', 'N', { name: 'Xianua', icon: '☠️', formula: 'HCN', description: 'Chất cực độc, được dùng trong sản xuất chất dẻo và thuốc trừ sâu.' }],

  // Bases (36-45)
  ['Na', 'H2O', { name: 'Natri hidroxit', icon: '🧴', formula: 'NaOH', description: 'Xút ăn da, bazơ mạnh, được dùng trong sản xuất xà phòng và giấy.' }],
  ['K', 'H2O', { name: 'Kali hidroxit', icon: '🧽', formula: 'KOH', description: 'Bazơ mạnh, được dùng làm chất điện phân và sản xuất xà phòng mềm.' }],
  ['Ca', 'H2O', { name: 'Canxi hidroxit', icon: '🏗️', formula: 'Ca(OH)2', description: 'Vôi tôi, được dùng trong xây dựng và xử lý nước.' }],
  ['Mg', 'H2O', { name: 'Magie hidroxit', icon: '💊', formula: 'Mg(OH)2', description: 'Sữa magiê, được dùng làm thuốc kháng axit và nhuận tràng.' }],
  ['Ba', 'H2O', { name: 'Bari hidroxit', icon: '⚗️', formula: 'Ba(OH)2', description: 'Bazơ mạnh, tan tốt trong nước, được dùng trong phân tích hóa học.' }],
  ['Al', 'H2O', { name: 'Nhôm hidroxit', icon: '💊', formula: 'Al(OH)3', description: 'Chất lưỡng tính, được dùng làm thuốc kháng axit và chất chống cháy.' }],
  ['Zn', 'H2O', { name: 'Kẽm hidroxit', icon: '🔬', formula: 'Zn(OH)2', description: 'Chất lưỡng tính, không tan trong nước, tan trong axit và bazơ.' }],
  ['Cu', 'H2O', { name: 'Đồng(II) hidroxit', icon: '🟦', formula: 'Cu(OH)2', description: 'Chất rắn màu xanh, không tan trong nước, bị phân hủy khi đun nóng.' }],
  ['Fe', 'H2O', { name: 'Sắt(III) hidroxit', icon: '🟫', formula: 'Fe(OH)3', description: 'Chất rắn màu nâu đỏ, không tan trong nước, được dùng làm thuốc nhuộm.' }],
  ['Pb', 'H2O', { name: 'Chì(II) hidroxit', icon: '⚠️', formula: 'Pb(OH)2', description: 'Chất rắn màu trắng, lưỡng tính, độc hại.' }],

  // Common Salts (46-70)
  ['Na', 'S', { name: 'Natri sunfat', icon: '💎', formula: 'Na2SO4', description: 'Muối glauber, được dùng trong sản xuất giấy và thủy tinh.' }],
  ['K', 'N', { name: 'Kali nitrat', icon: '💥', formula: 'KNO3', description: 'Diêm tiêu, được dùng làm phân bón và trong sản xuất thuốc súng.' }],
  ['Ca', 'C', { name: 'Canxi cacbonat', icon: '🪨', formula: 'CaCO3', description: 'Đá vôi, thành phần chính của đá vôi, đá cẩm thạch và vỏ sò.' }],
  ['Ca', 'S', { name: 'Canxi sunfat', icon: '🩹', formula: 'CaSO4', description: 'Thạch cao, được dùng trong xây dựng và y học.' }],
  ['Na', 'C', { name: 'Natri cacbonat', icon: '🧼', formula: 'Na2CO3', description: 'Soda, được dùng trong sản xuất thủy tinh và xà phòng.' }],
  ['Na', 'HCO3', { name: 'Natri bicarbonat', icon: '🧁', formula: 'NaHCO3', description: 'Baking soda, được dùng trong nấu ăn và làm thuốc kháng axit.' }],
  ['K', 'C', { name: 'Kali cacbonat', icon: '🔬', formula: 'K2CO3', description: 'Potas, được dùng trong sản xuất thủy tinh và xà phòng.' }],
  ['Mg', 'S', { name: 'Magie sunfat', icon: '🛁', formula: 'MgSO4', description: 'Muối Epsom, được dùng trong y học và nông nghiệp.' }],
  ['Cu', 'S', { name: 'Đồng(II) sunfat', icon: '🔵', formula: 'CuSO4', description: 'Đá sản, được dùng làm thuốc diệt nấm và trong mạ điện.' }],
  ['Fe', 'S', { name: 'Sắt(II) sunfat', icon: '🟢', formula: 'FeSO4', description: 'Phèn xanh, được dùng làm thuốc bổ máu và xử lý nước.' }],
  ['Zn', 'S', { name: 'Kẽm sunfat', icon: '⚪', formula: 'ZnSO4', description: 'Được dùng làm phân bón và trong y học.' }],
  ['Al', 'S', { name: 'Nhôm sunfat', icon: '💧', formula: 'Al2(SO4)3', description: 'Phèn nhôm, được dùng trong xử lý nước và thuộc da.' }],
  ['Ag', 'N', { name: 'Bạc nitrat', icon: '💎', formula: 'AgNO3', description: 'Được dùng làm thuốc sát trùng và trong nhiếp ảnh.' }],
  ['Ba', 'Cl', { name: 'Bari clorua', icon: '🧪', formula: 'BaCl2', description: 'Được dùng trong xử lý nước và sản xuất sơn.' }],
  ['Ca', 'Cl', { name: 'Canxi clorua', icon: '🧊', formula: 'CaCl2', description: 'Được dùng làm chất chống đông đường và làm khô.' }],
  ['NH3', 'HCl', { name: 'Amoni clorua', icon: '🌾', formula: 'NH4Cl', description: 'Được dùng làm phân bón và trong pin khô.' }],
  ['NH3', 'HNO3', { name: 'Amoni nitrat', icon: '💥', formula: 'NH4NO3', description: 'Phân đạm, được dùng làm phân bón và chất nổ.' }],
  ['NH3', 'H2SO4', { name: 'Amoni sunfat', icon: '🌱', formula: '(NH4)2SO4', description: 'Phân đạm, được dùng làm phân bón.' }],
  ['K', 'S', { name: 'Kali sunfat', icon: '🌾', formula: 'K2SO4', description: 'Được dùng làm phân bón kali.' }],
  ['Fe', 'Cl', { name: 'Sắt(III) clorua', icon: '🟤', formula: 'FeCl3', description: 'Được dùng trong xử lý nước và ăn mòn kim loại.' }],
  ['Ni', 'S', { name: 'Niken sunfat', icon: '🔋', formula: 'NiSO4', description: 'Được dùng trong mạ niken và pin.' }],
  ['Co', 'Cl', { name: 'Coban clorua', icon: '🌡️', formula: 'CoCl2', description: 'Chất rắn màu hồng, đổi màu khi hút ẩm, dùng làm chất chỉ thị độ ẩm.' }],
  ['Mn', 'O', { name: 'Mangan đioxit', icon: '🔋', formula: 'MnO2', description: 'Chất rắn màu đen, được dùng làm chất khử phân cực trong pin và chất xúc tác.' }],
  ['Cr', 'O', { name: 'Crom(III) oxit', icon: '🟢', formula: 'Cr2O3', description: 'Chất rắn màu xanh lá, được dùng làm sơn và chất mài mòn.' }],
  ['Ti', 'O', { name: 'Titan đioxit', icon: '⚪', formula: 'TiO2', description: 'Chất rắn màu trắng, được dùng làm sơn và kem chống nắng.' }],

  // Organic Compounds (71-85)
  ['C', 'H', { name: 'Etan', icon: '🔥', formula: 'C2H6', description: 'Khí hydrocarbon no, thành phần của khí tự nhiên.' }],
  ['C', 'H', { name: 'Propan', icon: '🔥', formula: 'C3H8', description: 'Khí hydrocarbon, được dùng làm nhiên liệu và chất làm lạnh.' }],
  ['C', 'H', { name: 'Butan', icon: '🔥', formula: 'C4H10', description: 'Khí hydrocarbon, được dùng làm nhiên liệu.' }],
  ['C', 'H', { name: 'Benzen', icon: '⬡', formula: 'C6H6', description: 'Hydrocarbon thơm, được dùng làm nguyên liệu trong công nghiệp hóa chất.' }],
  ['C', 'O', { name: 'Metanol', icon: '🧪', formula: 'CH3OH', description: 'Rượu đơn giản nhất, độc, được dùng làm dung môi và nhiên liệu.' }],
  ['C', 'O', { name: 'Etanol', icon: '🍺', formula: 'C2H5OH', description: 'Rượu etylic, được dùng trong đồ uống có cồn và làm nhiên liệu sinh học.' }],
  ['C', 'O', { name: 'Axit axetic', icon: '🥗', formula: 'CH3COOH', description: 'Axit hữu cơ yếu, thành phần chính của giấm.' }],
  ['C', 'O', { name: 'Axit formic', icon: '🐜', formula: 'HCOOH', description: 'Axit hữu cơ đơn giản nhất, có trong nọc kiến.' }],
  ['C', 'O', { name: 'Formaldehit', icon: '🏥', formula: 'HCHO', description: 'Andehit đơn giản nhất, được dùng làm chất bảo quản và sản xuất nhựa.' }],
  ['C', 'O', { name: 'Axeton', icon: '💅', formula: 'CH3COCH3', description: 'Xeton đơn giản nhất, được dùng làm dung môi.' }],
  ['C', 'O', { name: 'Glucozơ', icon: '🍬', formula: 'C6H12O6', description: 'Đường đơn, nguồn năng lượng chính của tế bào sống.' }],
  ['C', 'O', { name: 'Saccarozơ', icon: '🧁', formula: 'C12H22O11', description: 'Đường mía, được dùng làm chất tạo ngọt.' }],
  ['C', 'N', { name: 'Urê', icon: '🌾', formula: 'CO(NH2)2', description: 'Hợp chất hữu cơ chứa nitơ, được dùng làm phân bón.' }],
  ['C', 'N', { name: 'Anilin', icon: '🎨', formula: 'C6H5NH2', description: 'Amin thơm, được dùng trong sản xuất thuốc nhuộm và dược phẩm.' }],
  ['C', 'N', { name: 'Glixin', icon: '🧬', formula: 'C2H5NO2', description: 'Axit amin đơn giản nhất, thành phần của protein.' }],

  // Complex Compounds (86-100)
  ['Fe', 'C', { name: 'Sắt(II) cacbonat', icon: '🪨', formula: 'FeCO3', description: 'Khoáng siderit, quặng sắt.' }],
  ['Pb', 'S', { name: 'Chì sunfua', icon: '⚫', formula: 'PbS', description: 'Khoáng galena, quặng chì chính.' }],
  ['Zn', 'C', { name: 'Kẽm cacbonat', icon: '💎', formula: 'ZnCO3', description: 'Khoáng smithsonit, được dùng làm chất màu trắng.' }],
  ['Cu', 'C', { name: 'Đồng(II) cacbonat', icon: '🟩', formula: 'CuCO3', description: 'Thành phần của khoáng malasit, màu xanh lục.' }],
  ['Ca', 'P', { name: 'Canxi photphat', icon: '🦴', formula: 'Ca3(PO4)2', description: 'Thành phần chính của xương và răng.' }],
  ['K', 'Cr', { name: 'Kali dicromat', icon: '🟠', formula: 'K2Cr2O7', description: 'Chất oxy hóa mạnh, màu cam, được dùng trong phân tích hóa học.' }],
  ['K', 'Mn', { name: 'Kali permanganat', icon: '🟣', formula: 'KMnO4', description: 'Chất oxy hóa mạnh, màu tím, được dùng làm thuốc sát trùng.' }],
  ['Na', 'Si', { name: 'Natri silicat', icon: '💧', formula: 'Na2SiO3', description: 'Thủy tinh lỏng, được dùng làm keo dán và chất chống cháy.' }],
  ['Ca', 'Si', { name: 'Canxi silicat', icon: '🪨', formula: 'CaSiO3', description: 'Khoáng wollastonit, được dùng trong gốm sứ và xi măng.' }],
  ['Al', 'Si', { name: 'Nhôm silicat', icon: '🏺', formula: 'Al2SiO5', description: 'Thành phần của khoáng sét và zeolite.' }],
  ['Ba', 'S', { name: 'Bari sunfat', icon: '🏥', formula: 'BaSO4', description: 'Khoáng barit, không tan, được dùng làm chất cản quang trong y học.' }],
  ['Sr', 'S', { name: 'Stronti sunfat', icon: '🎆', formula: 'SrSO4', description: 'Khoáng celestit, được dùng trong pháo hoa.' }],
  ['Li', 'Cl', { name: 'Liti clorua', icon: '🔋', formula: 'LiCl', description: 'Được dùng làm chất hút ẩm và trong pin lithium.' }],
  ['Rb', 'Cl', { name: 'Rubidi clorua', icon: '🔬', formula: 'RbCl', description: 'Muối kim loại kiềm, được dùng trong nghiên cứu.' }],
  ['Cs', 'Cl', { name: 'Xesi clorua', icon: '⏱️', formula: 'CsCl', description: 'Muối kim loại kiềm, có cấu trúc tinh thể đặc biệt.' }],

  // Additional 100 Combinations (101-200)
  // Hydrogen Compounds (101-115)
  ['H', 'Li', { name: 'Liti hiđrua', icon: '🔋', formula: 'LiH', description: 'Chất khử mạnh, được dùng trong tổng hợp hữu cơ và làm chất lưu trữ hydro.' }],
  ['H', 'K', { name: 'Kali hiđrua', icon: '⚡', formula: 'KH', description: 'Chất khử mạnh, dễ phản ứng với nước.' }],
  ['H', 'Ca', { name: 'Canxi hiđrua', icon: '🔋', formula: 'CaH2', description: 'Được dùng làm chất làm khô và nguồn hydro.' }],
  ['H', 'Al', { name: 'Nhôm hiđrua', icon: '⚗️', formula: 'AlH3', description: 'Chất khử mạnh trong hóa học hữu cơ.' }],
  ['H', 'B', { name: 'Boran', icon: '🚀', formula: 'B2H6', description: 'Khí không bền, được dùng làm nhiên liệu tên lửa.' }],
  ['H', 'Si', { name: 'Silan', icon: '💨', formula: 'SiH4', description: 'Khí dễ cháy, được dùng trong công nghiệp bán dẫn.' }],
  ['H', 'P', { name: 'Photphin', icon: '☠️', formula: 'PH3', description: 'Khí độc, dễ cháy, phát ra ánh sáng lạnh.' }],
  ['H', 'As', { name: 'Arsin', icon: '☠️', formula: 'AsH3', description: 'Khí cực độc, được dùng trong công nghiệp bán dẫn.' }],
  ['H', 'Se', { name: 'Hydro selenua', icon: '💨', formula: 'H2Se', description: 'Khí độc, có mùi giống H2S.' }],
  ['H', 'Te', { name: 'Hydro tellua', icon: '💨', formula: 'H2Te', description: 'Khí không bền, có mùi hôi khó chịu.' }],
  ['H', 'Zn', { name: 'Kẽm hiđrua', icon: '⚪', formula: 'ZnH2', description: 'Chất khử, ít bền ở nhiệt độ thường.' }],
  ['H', 'Mg', { name: 'Magie hiđrua', icon: '🔋', formula: 'MgH2', description: 'Được nghiên cứu để lưu trữ hydro.' }],
  ['H', 'Cu', { name: 'Đồng hiđrua', icon: '🟤', formula: 'CuH', description: 'Hợp chất không bền, màu nâu đỏ.' }],
  ['H', 'Ti', { name: 'Titan hiđrua', icon: '⚪', formula: 'TiH2', description: 'Được dùng trong luyện kim và sản xuất bột kim loại.' }],
  ['H', 'Ni', { name: 'Niken hiđrua', icon: '🔋', formula: 'NiH', description: 'Được nghiên cứu cho pin hydro.' }],

  // Metal Oxides (116-130)
  ['Co', 'O', { name: 'Coban(II) oxit', icon: '🔵', formula: 'CoO', description: 'Chất rắn màu xanh đen, được dùng làm chất màu cho gốm sứ.' }],
  ['Ni', 'O', { name: 'Niken(II) oxit', icon: '🟢', formula: 'NiO', description: 'Chất rắn màu xanh lá, được dùng trong pin và gốm sứ.' }],
  ['Cr', 'O', { name: 'Crom(VI) oxit', icon: '🔴', formula: 'CrO3', description: 'Chất oxy hóa mạnh, màu đỏ sẫm, độc.' }],
  ['Mn', 'O', { name: 'Mangan(II) oxit', icon: '🟢', formula: 'MnO', description: 'Chất rắn màu xanh lá, được dùng làm chất màu.' }],
  ['V', 'O', { name: 'Vanadi(V) oxit', icon: '🟠', formula: 'V2O5', description: 'Chất xúc tác quan trọng trong sản xuất axit sunfuric.' }],
  ['Mo', 'O', { name: 'Molipđen oxit', icon: '⚪', formula: 'MoO3', description: 'Được dùng trong luyện kim và chất xúc tác.' }],
  ['W', 'O', { name: 'Vonfram oxit', icon: '🟡', formula: 'WO3', description: 'Màu vàng, được dùng trong sản xuất vonfram kim loại.' }],
  ['Cd', 'O', { name: 'Cadimi oxit', icon: '🟤', formula: 'CdO', description: 'Chất rắn màu nâu, độc, được dùng trong pin.' }],
  ['Hg', 'O', { name: 'Thủy ngân(II) oxit', icon: '🔴', formula: 'HgO', description: 'Chất rắn màu đỏ hoặc vàng, phân hủy khi đun nóng.' }],
  ['Bi', 'O', { name: 'Bitmut oxit', icon: '🟡', formula: 'Bi2O3', description: 'Màu vàng, được dùng trong gốm sứ và thủy tinh.' }],
  ['Sb', 'O', { name: 'Antimon oxit', icon: '⚪', formula: 'Sb2O3', description: 'Được dùng làm chất chống cháy và chất tạo màu mờ.' }],
  ['As', 'O', { name: 'Asen oxit', icon: '⚪', formula: 'As2O3', description: 'Chất độc, từng được dùng làm thuốc diệt chuột.' }],
  ['Ge', 'O', { name: 'Gecmani oxit', icon: '⚪', formula: 'GeO2', description: 'Được dùng trong quang học và bán dẫn.' }],
  ['In', 'O', { name: 'Indi oxit', icon: '🟡', formula: 'In2O3', description: 'Được dùng trong màn hình cảm ứng.' }],
  ['Ga', 'O', { name: 'Gali oxit', icon: '⚪', formula: 'Ga2O3', description: 'Được dùng trong LED và bán dẫn công suất cao.' }],

  // Halides (131-145)
  ['Cu', 'Cl', { name: 'Đồng(II) clorua', icon: '🟢', formula: 'CuCl2', description: 'Chất rắn màu xanh lá, được dùng làm chất xúc tác.' }],
  ['Zn', 'Cl', { name: 'Kẽm clorua', icon: '⚪', formula: 'ZnCl2', description: 'Được dùng làm chất hàn và bảo quản gỗ.' }],
  ['Al', 'Cl', { name: 'Nhôm clorua', icon: '⚪', formula: 'AlCl3', description: 'Chất xúc tác Lewis axit mạnh trong hóa học hữu cơ.' }],
  ['Ti', 'Cl', { name: 'Titan(IV) clorua', icon: '💨', formula: 'TiCl4', description: 'Chất lỏng khói trong không khí ẩm, dùng sản xuất titan.' }],
  ['Si', 'Cl', { name: 'Silicon tetraclorua', icon: '💨', formula: 'SiCl4', description: 'Chất lỏng khói, được dùng sản xuất silicon siêu tinh khiết.' }],
  ['P', 'Cl', { name: 'Photpho pentaclorua', icon: '🟡', formula: 'PCl5', description: 'Chất rắn màu vàng, được dùng làm chất clo hóa.' }],
  ['S', 'Cl', { name: 'Lưu huỳnh điclorua', icon: '🔴', formula: 'SCl2', description: 'Chất lỏng màu đỏ, mùi khó chịu.' }],
  ['Ag', 'Br', { name: 'Bạc bromua', icon: '🟡', formula: 'AgBr', description: 'Nhạy sáng, được dùng trong phim nhiếp ảnh.' }],
  ['Ag', 'I', { name: 'Bạc iodua', icon: '🟡', formula: 'AgI', description: 'Nhạy sáng nhất, được dùng trong nhiếp ảnh và gây mưa nhân tạo.' }],
  ['Hg', 'Cl', { name: 'Thủy ngân(I) clorua', icon: '⚪', formula: 'Hg2Cl2', description: 'Calomel, từng được dùng làm thuốc nhuận tràng.' }],
  ['Sn', 'Cl', { name: 'Thiếc(IV) clorua', icon: '💨', formula: 'SnCl4', description: 'Chất lỏng khói, được dùng làm chất xúc tác.' }],
  ['Sb', 'Cl', { name: 'Antimon(V) clorua', icon: '🟡', formula: 'SbCl5', description: 'Chất lỏng khói, chất xúc tác mạnh.' }],
  ['Cr', 'Cl', { name: 'Crom(III) clorua', icon: '🟣', formula: 'CrCl3', description: 'Chất rắn màu tím, được dùng làm chất xúc tác.' }],
  ['Co', 'Cl', { name: 'Coban(II) clorua', icon: '💜', formula: 'CoCl2', description: 'Màu hồng khi ngậm nước, xanh khi khan.' }],
  ['Ni', 'Cl', { name: 'Niken(II) clorua', icon: '🟢', formula: 'NiCl2', description: 'Màu vàng khi khan, xanh lá khi ngậm nước.' }],

  // Sulfides (146-160)
  ['Zn', 'S', { name: 'Kẽm sunfua', icon: '⚪', formula: 'ZnS', description: 'Khoáng sphaleri, quặng kẽm chính, phát quang.' }],
  ['Cu', 'S', { name: 'Đồng(I) sunfua', icon: '⚫', formula: 'Cu2S', description: 'Khoáng chalcocit, quặng đồng quan trọng.' }],
  ['Fe', 'S', { name: 'Sắt(II) sunfua', icon: '🟡', formula: 'FeS', description: 'Khoáng pyrotin, màu vàng đồng.' }],
  ['Ag', 'S', { name: 'Bạc sunfua', icon: '⚫', formula: 'Ag2S', description: 'Làm bạc bị xám đen, khoáng acantit.' }],
  ['Hg', 'S', { name: 'Thủy ngân(II) sunfua', icon: '🔴', formula: 'HgS', description: 'Khoáng cinnabar, màu đỏ thẫm, quặng thủy ngân chính.' }],
  ['Cd', 'S', { name: 'Cadimi sunfua', icon: '🟡', formula: 'CdS', description: 'Sắc tố màu vàng, được dùng trong sơn.' }],
  ['As', 'S', { name: 'Asen sunfua', icon: '🟡', formula: 'As2S3', description: 'Khoáng orpimen, màu vàng chanh, độc.' }],
  ['Sb', 'S', { name: 'Antimon sunfua', icon: '⚫', formula: 'Sb2S3', description: 'Khoáng stibnit, quặng antimon chính.' }],
  ['Bi', 'S', { name: 'Bitmut sunfua', icon: '⚫', formula: 'Bi2S3', description: 'Khoáng bismutinit, màu xám chì.' }],
  ['Sn', 'S', { name: 'Thiếc(II) sunfua', icon: '🟤', formula: 'SnS', description: 'Được nghiên cứu cho pin mặt trời.' }],
  ['Mo', 'S', { name: 'Molipđen disunfua', icon: '⚫', formula: 'MoS2', description: 'Chất bôi trơn rắn, vật liệu 2D.' }],
  ['W', 'S', { name: 'Vonfram disunfua', icon: '⚫', formula: 'WS2', description: 'Chất bôi trơn, chất bán dẫn.' }],
  ['Co', 'S', { name: 'Coban(II) sunfua', icon: '⚫', formula: 'CoS', description: 'Khoáng màu đen, được dùng làm chất xúc tác.' }],
  ['Ni', 'S', { name: 'Niken sunfua', icon: '🟡', formula: 'NiS', description: 'Khoáng millerit, màu vàng đồng.' }],
  ['Mn', 'S', { name: 'Mangan(II) sunfua', icon: '🟢', formula: 'MnS', description: 'Khoáng alabandit, màu xanh lục.' }],

  // Nitrates & Phosphates (161-175)
  ['Ca', 'N', { name: 'Canxi nitrat', icon: '🌾', formula: 'Ca(NO3)2', description: 'Phân đạm, dễ tan trong nước.' }],
  ['Mg', 'N', { name: 'Magie nitrat', icon: '🌱', formula: 'Mg(NO3)2', description: 'Phân bón, chất oxy hóa.' }],
  ['Cu', 'N', { name: 'Đồng(II) nitrat', icon: '🔵', formula: 'Cu(NO3)2', description: 'Chất rắn màu xanh, được dùng trong phân tích.' }],
  ['Zn', 'N', { name: 'Kẽm nitrat', icon: '⚪', formula: 'Zn(NO3)2', description: 'Dễ tan, được dùng làm chất xúc tác.' }],
  ['Fe', 'N', { name: 'Sắt(III) nitrat', icon: '🟤', formula: 'Fe(NO3)3', description: 'Dung dịch màu nâu, chất ăn mòn.' }],
  ['Ba', 'N', { name: 'Bari nitrat', icon: '⚪', formula: 'Ba(NO3)2', description: 'Được dùng trong pháo hoa màu xanh lá.' }],
  ['Sr', 'N', { name: 'Stronti nitrat', icon: '🔴', formula: 'Sr(NO3)2', description: 'Được dùng trong pháo hoa màu đỏ.' }],
  ['Pb', 'N', { name: 'Chì(II) nitrat', icon: '⚪', formula: 'Pb(NO3)2', description: 'Muối chì tan, độc, được dùng trong phân tích.' }],
  ['Na', 'P', { name: 'Natri photphat', icon: '🧼', formula: 'Na3PO4', description: 'Được dùng trong chất tẩy rửa và xử lý nước.' }],
  ['K', 'P', { name: 'Kali photphat', icon: '🌾', formula: 'K3PO4', description: 'Phân lân, dễ tan trong nước.' }],
  ['Mg', 'P', { name: 'Magie photphat', icon: '⚪', formula: 'Mg3(PO4)2', description: 'Được dùng làm phân bón và chất chống cháy.' }],
  ['Al', 'P', { name: 'Nhôm photphat', icon: '⚪', formula: 'AlPO4', description: 'Được dùng làm chất xúc tác và vật liệu gốm.' }],
  ['Fe', 'P', { name: 'Sắt(III) photphat', icon: '🟡', formula: 'FePO4', description: 'Được dùng trong pin lithium-ion.' }],
  ['Zn', 'P', { name: 'Kẽm photphat', icon: '⚪', formula: 'Zn3(PO4)2', description: 'Được dùng trong chống ăn mòn kim loại.' }],
  ['Ca', 'NH4', { name: 'Canxi amoni photphat', icon: '💎', formula: 'CaNH4PO4', description: 'Được dùng trong phân tích định lượng photphat.' }],

  // Carbonates & Bicarbonates (176-190)
  ['Mg', 'C', { name: 'Magie cacbonat', icon: '⚪', formula: 'MgCO3', description: 'Khoáng magiêzit, được dùng làm thuốc kháng axit.' }],
  ['Ba', 'C', { name: 'Bari cacbonat', icon: '⚪', formula: 'BaCO3', description: 'Khoáng witherit, được dùng trong gốm sứ.' }],
  ['Sr', 'C', { name: 'Stronti cacbonat', icon: '⚪', formula: 'SrCO3', description: 'Khoáng strontianit, được dùng trong pháo hoa.' }],
  ['Mn', 'C', { name: 'Mangan(II) cacbonat', icon: '🟠', formula: 'MnCO3', description: 'Khoáng rhodochrosite, màu hồng.' }],
  ['Ni', 'C', { name: 'Niken cacbonat', icon: '🟢', formula: 'NiCO3', description: 'Khoáng màu xanh lá nhạt.' }],
  ['Co', 'C', { name: 'Coban cacbonat', icon: '💜', formula: 'CoCO3', description: 'Khoáng màu hồng tím.' }],
  ['Cd', 'C', { name: 'Cadimi cacbonat', icon: '⚪', formula: 'CdCO3', description: 'Khoáng otavit, hiếm gặp.' }],
  ['Li', 'C', { name: 'Liti cacbonat', icon: '⚪', formula: 'Li2CO3', description: 'Được dùng làm thuốc điều trị rối loạn lưỡng cực.' }],
  ['K', 'HCO3', { name: 'Kali bicarbonat', icon: '⚪', formula: 'KHCO3', description: 'Được dùng làm chất chữa cháy và điều chỉnh pH.' }],
  ['Ca', 'HCO3', { name: 'Canxi bicarbonat', icon: '💧', formula: 'Ca(HCO3)2', description: 'Gây độ cứng tạm thời của nước.' }],
  ['Mg', 'HCO3', { name: 'Magie bicarbonat', icon: '💧', formula: 'Mg(HCO3)2', description: 'Gây độ cứng tạm thời của nước.' }],
  ['NH4', 'C', { name: 'Amoni cacbonat', icon: '💨', formula: '(NH4)2CO3', description: 'Muối bay hơi, được dùng làm muối nở trong làm bánh.' }],
  ['NH4', 'HCO3', { name: 'Amoni bicarbonat', icon: '🧁', formula: 'NH4HCO3', description: 'Muối nở, bay hơi hoàn toàn khi đun nóng.' }],
  ['Cs', 'C', { name: 'Xesi cacbonat', icon: '⚪', formula: 'Cs2CO3', description: 'Bazơ mạnh, được dùng trong hóa học hữu cơ.' }],
  ['Rb', 'C', { name: 'Rubidi cacbonat', icon: '⚪', formula: 'Rb2CO3', description: 'Muối kim loại kiềm, tan tốt trong nước.' }],

  // Mixed Compounds (191-200)
  ['Cu', 'Fe', { name: 'Đồng sắt sunfua', icon: '🟡', formula: 'CuFeS2', description: 'Khoáng chalcopyrit, quặng đồng quan trọng nhất.' }],
  ['Na', 'Al', { name: 'Natri aluminat', icon: '⚪', formula: 'NaAlO2', description: 'Được dùng trong xử lý nước và sản xuất giấy.' }],
  ['Ca', 'Al', { name: 'Canxi aluminat', icon: '⚪', formula: 'Ca3Al2O6', description: 'Thành phần của xi măng aluminat.' }],
  ['K', 'Al', { name: 'Kali phèn', icon: '💎', formula: 'KAl(SO4)2', description: 'Phèn chua, được dùng trong nhuộm vải và làm nước.' }],
  ['Fe', 'Al', { name: 'Sắt phèn', icon: '💎', formula: 'FeAl(SO4)2', description: 'Được dùng trong xử lý nước và nhuộm vải.' }],
  ['Cr', 'K', { name: 'Crom phèn', icon: '💜', formula: 'KCr(SO4)2', description: 'Phèn tím, được dùng trong thuộc da.' }],
  ['Na', 'H', { name: 'Natri hydroxua', icon: '🔥', formula: 'NaOH', description: 'Xút, bazơ mạnh, được dùng rộng rãi trong công nghiệp.' }],
  ['Ca', 'N2', { name: 'Canxi cianamit', icon: '🌾', formula: 'CaCN2', description: 'Phân đạm, phản ứng với nước tạo amoniac.' }],
  ['Ba', 'Ti', { name: 'Bari titanat', icon: '⚡', formula: 'BaTiO3', description: 'Vật liệu điện môi, được dùng trong tụ điện.' }],
  ['Sr', 'Ti', { name: 'Stronti titanat', icon: '💎', formula: 'SrTiO3', description: 'Vật liệu áp điện và quang học.' }],
];

async function seedCombinations() {
  try {
    console.log('🚀 Starting to seed 200 chemistry combinations...\n');

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      let successCount = 0;
      let skipCount = 0;

      for (let i = 0; i < commonCombinations.length; i++) {
        const [element1, element2, entityData] = commonCombinations[i];
        
        // Sort elements to ensure consistent ordering
        const [sortedElement1, sortedElement2] = element1 < element2 ? [element1, element2] : [element2, element1];

        // Check if combination already exists
        const existing = await EntityCombination.findOne({
          where: {
            element1: sortedElement1,
            element2: sortedElement2,
          },
          transaction,
        });

        if (existing) {
          skipCount++;
          console.log(`⏭️  Skipped (${i + 1}/200): ${element1} + ${element2} → Already exists`);
          continue;
        }

        // Create the entity
        const entity = await Entity.create(
          {
            name: entityData.name,
            icon: entityData.icon,
            formula: entityData.formula,
            description: entityData.description,
          },
          { transaction }
        );

        // Create the combination
        await EntityCombination.create(
          {
            element1: sortedElement1,
            element2: sortedElement2,
            resultEntityId: entity.id,
          },
          { transaction }
        );

        successCount++;
        console.log(`✅ Created (${i + 1}/200): ${element1} + ${element2} → ${entityData.name} (${entityData.formula})`);
      }

      // Commit transaction
      await transaction.commit();

      console.log('\n🎉 Seeding completed!');
      console.log(`✅ Successfully created: ${successCount} combinations`);
      console.log(`⏭️  Skipped (already exists): ${skipCount} combinations`);
      console.log(`📊 Total processed: ${commonCombinations.length} combinations`);

    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('❌ Error seeding combinations:', error);
    throw error;
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the seed function
if (require.main === module) {
  seedCombinations()
    .then(() => {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = seedCombinations;
