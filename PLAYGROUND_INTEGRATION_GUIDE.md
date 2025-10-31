# Hướng dẫn tích hợp OpenAI cho Playground

## Tổng quan
Hệ thống Playground đã được thiết lập hoàn chỉnh với cơ chế cache thông minh:
- Khi 2 elements combine lần đầu → Gọi OpenAI API
- Lần sau có công thức tương tự → Lấy từ database (nhanh hơn)
- Mỗi user có playground riêng, nhưng entities được cache chung

## Cấu trúc Database

### Bảng `entities`
Lưu trữ tất cả entities được tạo ra (cache chung cho tất cả users):
- `id`: ID tự tăng
- `name`: Tên entity (từ OpenAI)
- `icon`: Emoji/icon đại diện (từ OpenAI)
- `formula`: Công thức hóa học nếu có (từ OpenAI)
- `description`: Mô tả chi tiết (từ OpenAI)

### Bảng `entity_combinations`
Lưu công thức combine (cache để không gọi lại OpenAI):
- `element1`: Element/entity thứ nhất (đã sort alphabetically)
- `element2`: Element/entity thứ hai (đã sort alphabetically)
- `resultEntityId`: ID của entity kết quả

### Bảng `user_playground_entities`
Lưu entities mà mỗi user đã discover:
- `userId`: ID của user
- `entityId`: ID của entity
- `discoveredAt`: Thời điểm discover

## Vị trí tích hợp OpenAI

**File**: `src/services/playground.service.js`
**Function**: `combineElements(element1, element2, userId)`
**Dòng**: 79-85

### Code hiện tại (placeholder):

```javascript
// Simulated OpenAI response:
const openAIResult = {
  name: `${element1} + ${element2} Compound`,
  icon: "🧪",
  formula: `${element1}${element2}`,
  description: `A compound formed by combining ${element1} and ${element2}`,
};
```

### Cách tích hợp OpenAI:

```javascript
// TODO: Replace with actual OpenAI API call
// Example:
const openAIResult = await this.callOpenAI(element1, element2);

async callOpenAI(element1, element2) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `You are a chemistry expert. When given two chemical elements or compounds, 
  create a realistic chemical entity that could result from their combination.
  
  Element 1: ${element1}
  Element 2: ${element2}
  
  Respond in JSON format with:
  - name: The name of the resulting compound/entity
  - icon: An appropriate emoji (single emoji only)
  - formula: The chemical formula (if applicable)
  - description: A brief scientific description (max 100 words)
  
  Example response:
  {
    "name": "Water",
    "icon": "💧",
    "formula": "H2O",
    "description": "Water is a transparent, tasteless, odorless chemical compound..."
  }`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const result = JSON.parse(response.choices[0].message.content);
  return result;
}
```

## Cài đặt OpenAI SDK

```bash
cd "D:\VSCODE\react-learning\TYHH BE"
npm install openai
```

## Environment Variables

Thêm vào file `.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Flow hoạt động

1. User kéo thả 2 elements lên canvas và combine
2. Frontend gọi API: `POST /api/playground/combine`
3. Backend kiểm tra trong `entity_combinations`:
   - **Đã có** → Trả về entity từ cache
   - **Chưa có** → Gọi OpenAI → Lưu vào DB → Trả về
4. Thêm entity vào `user_playground_entities` nếu user chưa có
5. Frontend nhận kết quả và hiển thị trên canvas

## Testing

### Test với placeholder (hiện tại):
- Combine bất kỳ 2 elements
- Sẽ nhận được entity với format: "Element1 + Element2 Compound"

### Test sau khi tích hợp OpenAI:
- Combine các elements thực tế: H + O → Nước (H2O)
- Combine lần 2 cùng công thức → Phải nhanh hơn (từ cache)

## API Endpoints

### 1. Get all elements (periodic table)
```
GET /api/playground/elements
Public - không cần authentication
```

### 2. Get user's discovered entities
```
GET /api/playground/entities
Protected - cần authentication
```

### 3. Combine elements
```
POST /api/playground/combine
Protected - cần authentication
Body: { element1: "H", element2: "O" }
Response: { entity: {...}, isNew: true/false }
```

## Frontend Components

### Main Component
**File**: `TYHH MUI/src/pages/Playground.jsx`

Features đã hoàn thiện:
- ✅ Active tabs (Elements/Entity)
- ✅ Drag & Drop với @dnd-kit
- ✅ Canvas vô hạn (pan, zoom)
- ✅ LocalStorage persistence
- ✅ Combine functionality
- ✅ Responsive UI

### API Integration
**File**: `TYHH MUI/src/features/api/playgroundApi.js`

Hooks available:
- `useGetAllElementsQuery()` - Lấy tất cả elements
- `useGetUserEntitiesQuery()` - Lấy entities của user
- `useCombineElementsMutation()` - Combine 2 elements

## Notes

- Elements được sort alphabetically trước khi lưu vào DB để tránh duplicate (H+O = O+H)
- Icon nên là single emoji để hiển thị đẹp trên UI
- Description nên ngắn gọn (max 100 words)
- Cache được share giữa tất cả users → Tiết kiệm OpenAI credits
- Mỗi user track riêng entities họ đã discover

## Checklist để production

- [ ] Cài đặt OpenAI SDK
- [ ] Thêm OPENAI_API_KEY vào .env
- [ ] Thay thế placeholder code bằng OpenAI integration
- [ ] Test với các combinations thực tế
- [ ] Xem xét rate limiting cho OpenAI API
- [ ] Thêm error handling cho OpenAI timeouts
- [ ] Xem xét caching strategy (Redis?) nếu traffic cao
- [ ] Monitor OpenAI usage và costs

