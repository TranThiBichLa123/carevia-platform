# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT

---

## 2.1. Ngôn Ngữ Lập Trình và Công Cụ Sử Dụng

### 2.1.1. Java 17 — Ngôn Ngữ Backend

**Mô tả:**  
Java 17 là phiên bản LTS (Long-Term Support) được sử dụng để xây dựng toàn bộ lớp logic nghiệp vụ và API của hệ thống Carevia, thông qua framework Spring Boot 3.3.5.

**Ưu điểm:**
- Ổn định, được hỗ trợ dài hạn đến năm 2029; phù hợp với ứng dụng thương mại.
- Hệ sinh thái Spring phong phú, hỗ trợ sẵn bảo mật, ORM, gửi email, OAuth2, Swagger, v.v.
- Sealed classes, records (Java 16+), pattern matching cải thiện độ rõ ràng của code và giảm lỗi runtime.
- Hiệu năng JVM ổn định, phù hợp với hệ thống có nhiều luồng xử lý đồng thời.
- Cộng đồng rất lớn, tài liệu đầy đủ.

**Nhược điểm:**
- Verbose hơn so với Python hoặc Kotlin trong một số tình huống.
- Thời gian khởi động Spring Boot lâu hơn so với các framework như FastAPI (Python).
- Cần nhiều cấu hình boilerplate ban đầu.

**Lý do chọn:**  
Hệ thống Carevia yêu cầu tính năng bảo mật phức tạp (JWT, OAuth2, Spring Security), quản lý giao dịch với cơ sở dữ liệu quan hệ (JPA/Hibernate), và tích hợp nhiều bên thứ ba (Cloudinary, Stripe, ZaloPay). Java 17 + Spring Boot là lựa chọn tối ưu để đáp ứng tất cả yêu cầu này trong một hệ sinh thái nhất quán.

---

### 2.1.2. TypeScript — Ngôn Ngữ Frontend

**Mô tả:**  
TypeScript là ngôn ngữ superset của JavaScript, bổ sung kiểu tĩnh tại thời điểm biên dịch. Hệ thống Carevia sử dụng TypeScript cho toàn bộ frontend với framework Next.js 16.

**Ưu điểm:**
- Phát hiện lỗi kiểu dữ liệu ngay tại compile-time, giảm thiểu lỗi runtime.
- IDE hỗ trợ autocomplete và refactoring mạnh mẽ (VS Code, WebStorm).
- Tương thích hoàn toàn với hệ sinh thái JavaScript.
- Đặc biệt phù hợp với các dự án lớn có nhiều module và nhiều lập trình viên.

**Nhược điểm:**
- Đòi hỏi thêm bước cấu hình `tsconfig.json` và type definitions cho thư viện bên thứ ba.
- Tăng thời gian build so với JavaScript thuần.
- Một số thư viện cũ chưa có type definition đầy đủ.

**Lý do chọn:**  
Với giao diện Carevia có nhiều vai trò (Client, Staff, Admin) và nhiều màn hình phức tạp, TypeScript giúp đảm bảo tính nhất quán kiểu dữ liệu giữa frontend và backend API, đặc biệt khi sử dụng các kiểu phức tạp như response gợi ý Fuzzy TOPSIS.

---

### 2.1.3. Next.js 16 — Framework Frontend

**Mô tả:**  
Next.js là framework React hỗ trợ Server-Side Rendering (SSR), Static Site Generation (SSG), và App Router. Carevia sử dụng Next.js 16 với kiến trúc App Router.

**Ưu điểm:**
- Hỗ trợ SSR và SSG giúp cải thiện SEO và tốc độ tải trang.
- App Router cho phép chia nhỏ layout theo vai trò người dùng (public, client, staff, admin).
- Tích hợp sẵn tối ưu hình ảnh, font, và routing.
- Hỗ trợ React Server Components giảm kích thước bundle client.

**Nhược điểm:**
- Cấu trúc App Router (Next.js 13+) còn mới, tài liệu đang cập nhật liên tục.
- Phức tạp hơn Create React App trong việc cấu hình và hiểu luồng rendering.
- Một số thư viện client-side không tương thích trực tiếp với Server Components.

**Lý do chọn:**  
Carevia là nền tảng thương mại điện tử/spa cần SEO tốt cho các trang sản phẩm và dịch vụ. Next.js với App Router cho phép tổ chức layout theo từng phân hệ (`/client`, `/staff`, `/admin`) một cách tự nhiên và maintainable.

---

### 2.1.4. PostgreSQL 15 — Hệ Quản Trị Cơ Sở Dữ Liệu

**Mô tả:**  
PostgreSQL là hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở. Carevia sử dụng PostgreSQL 15 qua Docker, kết nối với Spring Data JPA/Hibernate.

**Ưu điểm:**
- Hỗ trợ ACID đầy đủ, phù hợp với dữ liệu thương mại (đơn hàng, thanh toán).
- Hỗ trợ kiểu dữ liệu phong phú: JSON, UUID, ARRAY, timestamp with timezone.
- Hibernate Dialect tối ưu cho PostgreSQL.
- Hỗ trợ row-level security và partial indexes.

**Nhược điểm:**
- Cần quản lý migration schema cẩn thận khi thay đổi cấu trúc bảng.
- Không phù hợp cho dữ liệu phi cấu trúc quy mô lớn (nên dùng MongoDB thay thế).

**Lý do chọn:**  
Dữ liệu của Carevia có quan hệ phức tạp (Account → Booking → ExperienceSession → Staff → Service → Device) với nhiều ràng buộc nghiệp vụ. PostgreSQL với JPA đảm bảo tính toàn vẹn dữ liệu qua foreign key constraint và transaction isolation.

---

### 2.1.5. Các Công Cụ và Thư Viện Chính Khác

| Công cụ / Thư viện | Vai trò | Lý do sử dụng |
|---|---|---|
| Spring Security + JWT (jjwt 0.11.5) | Xác thực và phân quyền | Bảo mật API, stateless token-based auth |
| Spring OAuth2 Resource Server | OAuth2 / SSO | Hỗ trợ đăng nhập bên thứ ba (Google) |
| Spring Data JPA / Hibernate | ORM | Quản lý thực thể và quan hệ dữ liệu |
| Cloudinary | Lưu trữ hình ảnh | CDN toàn cầu, tối ưu ảnh tự động |
| Spring Boot Mail + Thymeleaf | Gửi email | Gửi email xác minh, thông báo đặt lịch |
| Springdoc OpenAPI 2.5.0 | Tài liệu API | Tự động sinh Swagger UI |
| ZaloPay, Stripe | Thanh toán | Tích hợp cổng thanh toán nội địa và quốc tế |
| Docker + Docker Compose | Containerization | Triển khai nhất quán trên mọi môi trường |
| TanStack Query v5 | Data fetching | Caching, revalidation tự động cho API calls |
| Zustand v5 | State management | Quản lý state nhẹ, không boilerplate |
| React Hook Form + Zod | Form validation | Hiệu năng cao, kiểm tra kiểu tại runtime |
| Tailwind CSS v4 + Radix UI | UI/UX | Thiết kế nhất quán, accessibility tốt |
| Framer Motion | Animation | Hiệu ứng chuyển động mượt mà |

---

## 2.2. Mô Hình AI Được Áp Dụng Trong Hệ Thống

Hệ thống Carevia áp dụng thuật toán **Fuzzy TOPSIS** (Fuzzy Technique for Order of Preference by Similarity to Ideal Solution) cho hai bài toán gợi ý:
1. **Gợi ý phiên đặt lịch** (Booking Recommendation): Xếp hạng các phiên trải nghiệm (ExperienceSession) phù hợp nhất với khách hàng.
2. **Gợi ý thiết bị** (Device Recommendation): Xếp hạng các thiết bị làm đẹp phù hợp nhất.

---

### 2.2.1. Thuật Toán Fuzzy TOPSIS

#### 2.2.1.1. Tổng Quan

TOPSIS (Technique for Order Preference by Similarity to Ideal Solution) là phương pháp ra quyết định đa tiêu chí (Multi-Criteria Decision Making – MCDM) được đề xuất bởi Hwang và Yoon (1981). Nguyên lý cơ bản: **phương án tốt nhất là phương án gần nhất với nghiệm lý tưởng dương (Positive Ideal Solution – PIS) và xa nhất với nghiệm lý tưởng âm (Negative Ideal Solution – NIS)**.

Tuy nhiên, trong thực tế đánh giá các tiêu chí phức tạp như chất lượng dịch vụ hoặc mức độ thuận tiện, giá trị tiêu chí thường mang tính **không chắc chắn** và **chủ quan**. Fuzzy TOPSIS mở rộng TOPSIS truyền thống bằng cách biểu diễn các đánh giá dưới dạng **số mờ tam giác** (Triangular Fuzzy Numbers – TFN), cho phép mô hình hóa sự không chắc chắn một cách toán học chính xác.

#### 2.2.1.2. Số Mờ Tam Giác (Triangular Fuzzy Number – TFN)

Một TFN được ký hiệu $\tilde{A} = (l, m, u)$, trong đó:
- $l$ (lower): cận dưới — giá trị thấp nhất có thể
- $m$ (middle): giá trị trung tâm — giá trị có độ thuộc cao nhất (= 1)
- $u$ (upper): cận trên — giá trị cao nhất có thể
- Ràng buộc: $0 \leq l \leq m \leq u$

Hàm thuộc (membership function):

$$
\mu_{\tilde{A}}(x) = \begin{cases}
0 & \text{nếu } x < l \\
\dfrac{x - l}{m - l} & \text{nếu } l \leq x \leq m \\
\dfrac{u - x}{u - m} & \text{nếu } m \leq x \leq u \\
0 & \text{nếu } x > u
\end{cases}
$$

**Ví dụ ánh xạ ngôn ngữ sang TFN trong hệ thống Carevia:**

| Nhãn ngôn ngữ | Ký hiệu | TFN $(l, m, u)$ |
|---|---|---|
| Rất thấp | VERY_LOW | (0.0, 0.0, 0.1) |
| Thấp | LOW | (0.0, 0.1, 0.3) |
| Trung bình thấp | MEDIUM_LOW | (0.1, 0.3, 0.5) |
| Trung bình | MEDIUM | (0.3, 0.5, 0.7) |
| Trung bình cao | MEDIUM_HIGH | (0.5, 0.7, 0.9) |
| Cao | HIGH | (0.7, 0.9, 1.0) |
| Rất cao | VERY_HIGH | (0.9, 1.0, 1.0) |

Bảng ánh xạ này được định nghĩa trong enum `LinguisticTerm` của hệ thống.

#### 2.2.1.3. Các Phép Tính Trên TFN

**Nhân hai TFN:**
$$\tilde{A} \otimes \tilde{B} = (l_A \cdot l_B, \; m_A \cdot m_B, \; u_A \cdot u_B)$$

**Chuẩn hoá tiêu chí lợi ích (Benefit):**  
Chia từng thành phần cho cận trên lớn nhất trong cột:
$$\tilde{r}_{ij} = \left(\frac{l_{ij}}{u_j^*},\; \frac{m_{ij}}{u_j^*},\; \frac{u_{ij}}{u_j^*}\right), \quad u_j^* = \max_i u_{ij}$$

**Chuẩn hoá tiêu chí chi phí (Cost):**  
Lấy nghịch đảo có trọng số, chia cho giá trị tốt nhất (nhỏ nhất):
$$\tilde{r}_{ij} = \left(\frac{l_j^{**}}{u_{ij}},\; \frac{l_j^{**}}{m_{ij}},\; \frac{l_j^{**}}{l_{ij}}\right), \quad l_j^{**} = \min_i l_{ij}$$

**Khoảng cách giữa hai TFN (Vertex Distance):**
$$d(\tilde{A}, \tilde{B}) = \sqrt{\frac{(l_A - l_B)^2 + (m_A - m_B)^2 + (u_A - u_B)^2}{3}}$$

Công thức này được cài đặt trong phương thức `distanceTo()` của class `TriangularFuzzyNumber`.

#### 2.2.1.4. Các Bước Thực Hiện Thuật Toán Fuzzy TOPSIS

**Bước 1: Xây dựng ma trận quyết định mờ**  
Mỗi phương án $i$ được đánh giá theo tiêu chí $j$ bằng một TFN $\tilde{x}_{ij}$. Giá trị có thể nhập dưới dạng:
- Giá trị ngôn ngữ (LinguisticTerm → TFN)
- Số crisp (chuyển thành TFN suy biến: $a = (a, a, a)$)
- TFN tường minh $(l, m, u)$

**Bước 2: Chuẩn hoá trọng số tiêu chí**  
Trọng số thô $\tilde{w}_j$ của mỗi tiêu chí cũng là TFN. Hệ thống chuẩn hoá theo cận trên lớn nhất:
$$\tilde{w}_j^{norm} = \frac{\tilde{w}_j}{u_{max}}, \quad u_{max} = \max_j u_j$$

**Bước 3: Chuẩn hoá ma trận quyết định**  
Áp dụng công thức chuẩn hoá tiêu chí lợi ích hoặc chi phí tuỳ thuộc `CriterionPreference` (BENEFIT / COST) của từng tiêu chí.

$$\tilde{r}_{ij} = \text{normalize}(\tilde{x}_{ij}, \text{preference}_j)$$

**Bước 4: Tính ma trận quyết định mờ có trọng số**  
$$\tilde{v}_{ij} = \tilde{r}_{ij} \otimes \tilde{w}_j^{norm}$$

**Bước 5: Xác định nghiệm lý tưởng**  
- Nghiệm lý tưởng dương (PIS): $A^+ = (1, 1, 1)$
- Nghiệm lý tưởng âm (NIS): $A^- = (0, 0, 0)$

**Bước 6: Tính khoảng cách từ mỗi phương án đến PIS và NIS**  
$$D_i^+ = \sum_{j=1}^{n} d(\tilde{v}_{ij}, A^+), \quad D_i^- = \sum_{j=1}^{n} d(\tilde{v}_{ij}, A^-)$$

**Bước 7: Tính hệ số gần gũi (Closeness Coefficient)**  
$$CC_i = \frac{D_i^-}{D_i^+ + D_i^-}, \quad CC_i \in [0, 1]$$

Phương án có $CC_i$ lớn nhất được xếp hạng cao nhất (được gợi ý).

**Bước 8: Xếp hạng các phương án**  
Sắp xếp giảm dần theo $CC_i$. Phương án đứng đầu được đánh dấu `recommended = true`.

---

### 2.2.2. Bài Toán Áp Dụng Trong Hệ Thống và Ý Nghĩa

#### 2.2.2.1. Bài Toán Gợi Ý Phiên Đặt Lịch (Booking Recommendation)

**Bối cảnh:**  
Khi khách hàng muốn đặt một dịch vụ spa/điều trị da (ví dụ: HIFU Premium), hệ thống cần gợi ý phiên trải nghiệm (ExperienceSession) phù hợp nhất từ nhiều phiên có sẵn tại các chi nhánh khác nhau.

**Ý nghĩa:**  
Mỗi phiên có sự khác biệt về khoảng cách địa lý, giá đặt lịch, số slot trống, chất lượng dịch vụ và mức độ phản hồi hỗ trợ. Việc kết hợp đồng thời các tiêu chí này — với một số tiêu chí mang tính chủ quan (chất lượng, phản hồi) — là điểm mạnh của Fuzzy TOPSIS so với các phương pháp lọc đơn giản.

**Các tiêu chí đánh giá (demo):**

| Tiêu chí | ID | Loại | Ví dụ trọng số |
|---|---|---|---|
| Khoảng cách đến chi nhánh (km) | `distanceKm` | COST | Crisp 0.95 |
| Giá đặt lịch | `bookingPrice` | COST | Crisp 0.8 |
| Số slot còn trống | `availableSlots` | BENEFIT | HIGH (0.7, 0.9, 1.0) |
| Chất lượng dịch vụ | `serviceQuality` | BENEFIT | VERY_HIGH (0.9, 1.0, 1.0) |
| Phản hồi hỗ trợ | `supportResponsiveness` | BENEFIT | HIGH (0.7, 0.9, 1.0) |

**Đầu vào API:**
- Danh sách phiên booking (BookingOptionRequest) với điểm đánh giá theo từng tiêu chí.
- Danh sách tiêu chí và trọng số.

**Đầu ra:**  
Danh sách phiên được xếp hạng theo $CC_i$, phiên đứng đầu được đánh dấu `recommended = true`.

#### 2.2.2.2. Bài Toán Gợi Ý Thiết Bị (Device Recommendation)

**Bối cảnh:**  
Khi khách hàng cần chọn thiết bị làm đẹp (da, tóc, v.v.), hệ thống gợi ý thiết bị phù hợp nhất dựa trên đánh giá đa tiêu chí.

**Ý nghĩa:**  
Tương tự bài toán booking, nhưng áp dụng cho domain sản phẩm (Device entity). Tiêu chí có thể bao gồm: giá bán, đánh giá trung bình, số lượng tồn kho, mức độ phù hợp với loại da (skin_type compatibility), số lượt bán.

---

### 2.2.3. Mô Hình Hoá Dữ Liệu Cho Bài Toán

#### 2.2.3.1. Các Thực Thể Liên Quan

```
BookingRecommendationRequest
├── scenarioName: String
├── serviceId: String
├── criteria: List<RecommendationCriterionRequest>
│   ├── id: String
│   ├── name: String
│   ├── preference: CriterionPreference (BENEFIT | COST)
│   └── weight: FuzzyValueInput
└── alternatives: List<BookingOptionRequest>
    ├── optionId: String
    ├── sessionId: String
    ├── branchName: String
    ├── locationDetail: String
    ├── startTime: String
    ├── endTime: String
    └── criteriaScores: Map<criterionId, FuzzyValueInput>
```

```
FuzzyValueInput (đầu vào linh hoạt)
├── value: Double           → Số crisp: (v, v, v)
├── lower, middle, upper    → TFN tường minh
└── linguisticTerm          → Nhãn ngôn ngữ → TFN tự động

TriangularFuzzyNumber (l, m, u)
├── divideBy(denominator)   → Chuẩn hoá benefit
├── normalizeCost(bestCost) → Chuẩn hoá cost
├── multiply(TFN)           → Nhân có trọng số
└── distanceTo(TFN)         → Vertex distance
```

#### 2.2.3.2. Sơ Đồ Quy Trình Tính Toán

```
Input Request
    │
    ▼
[1] Validate + Resolve Criteria
    (parse FuzzyValueInput → TFN, normalize weights)
    │
    ▼
[2] Resolve Alternatives
    (parse criteriaScores → Map<criterionId, TFN>)
    │
    ▼
[3] Compute Denominators
    - Benefit: max(upper) theo cột
    - Cost: min(lower) theo cột
    │
    ▼
[4] Normalize Decision Matrix
    ─ Benefit: rawScore / maxUpper
    ─ Cost: minLower / rawScore (đảo chiều)
    │
    ▼
[5] Apply Weights: normalizedScore ⊗ weight
    │
    ▼
[6] Compute Distances to PIS (1,1,1) and NIS (0,0,0)
    │
    ▼
[7] Compute Closeness Coefficient CC = D⁻ / (D⁺ + D⁻)
    │
    ▼
[8] Sort by CC DESC → Build Ranked Response
```

#### 2.2.3.3. Bảng Cơ Sở Dữ Liệu Liên Quan

Mô hình Fuzzy TOPSIS trong Carevia không yêu cầu lưu trữ ma trận tính toán trong database (tính toán in-memory). Tuy nhiên, các thực thể liên quan trong database phục vụ dữ liệu đầu vào cho thuật toán gồm:

| Bảng | Vai trò |
|---|---|
| `experience_sessions` | Nguồn các phương án booking (sessionId, branchName, price_per_slot, available_slots) |
| `bookings` | Lịch sử đặt lịch, hỗ trợ tính toán mức độ ưa thích của khách hàng |
| `devices` | Nguồn các phương án thiết bị (name, price, average_rating, skin_type, sold) |
| `recommendation_log` | Lưu lại các kết quả gợi ý đã thực hiện (rule_code, score) để phân tích sau |
| `user_behaviors` | Hành vi người dùng (view, click, purchase) làm tiêu chí đánh giá ngầm |

---

### 2.2.4. Quy Trình Áp Dụng Mô Hình AI Trong Hệ Thống

```
Khách hàng truy cập trang gợi ý
        │
        ▼
Frontend gọi API:
POST /api/v1/recommendations/bookings/fuzzy-topsis/rank
hoặc
POST /api/v1/recommendations/devices/fuzzy-topsis/rank
        │
        ▼
BookingRecommendationController / DeviceRecommendationController
        │
        ▼
FuzzyTopsisService.rankBookingOptions() / rankDeviceOptions()
        │
    ┌───────────────────────────────────┐
    │ 1. validateRequest()              │
    │ 2. resolveCriteria()              │
    │ 3. resolveAlternatives()          │
    │ 4. resolveBenefitDenominators()   │
    │ 5. resolveCostDenominators()      │
    │ 6. normalizeScore()               │
    │ 7. multiply() → weightedScore     │
    │ 8. distanceTo(PIS, NIS)           │
    │ 9. compute CC, sort               │
    └───────────────────────────────────┘
        │
        ▼
BookingRecommendationResponse / DeviceRecommendationResponse
(danh sách xếp hạng + chi tiết breakdown từng tiêu chí)
        │
        ▼
Frontend hiển thị kết quả gợi ý
```

Toàn bộ quá trình tính toán diễn ra **in-memory** trong lớp Service, không có mô hình ML nào cần train hay deploy riêng. Thuật toán Fuzzy TOPSIS là **deterministic** — với cùng đầu vào sẽ luôn cho cùng đầu ra, đảm bảo tính minh bạch và giải thích được (explainability).

---

### 2.2.5. Cách Thức Gọi API Mô Hình

#### 2.2.5.1. Endpoint Xếp Hạng Phiên Đặt Lịch

```
POST /api/v1/recommendations/bookings/fuzzy-topsis/rank
Content-Type: application/json
```

**Request Body mẫu:**
```json
{
  "scenarioName": "Gợi ý phiên HIFU Premium cho khách hàng tại TP.HCM",
  "serviceId": "svc-hifu-premium",
  "criteria": [
    {
      "id": "distanceKm",
      "name": "Khoảng cách đến chi nhánh",
      "preference": "COST",
      "weight": { "value": 0.95 }
    },
    {
      "id": "serviceQuality",
      "name": "Chất lượng dịch vụ",
      "preference": "BENEFIT",
      "weight": { "linguisticTerm": "VERY_HIGH" }
    },
    {
      "id": "availableSlots",
      "name": "Số slot còn trống",
      "preference": "BENEFIT",
      "weight": { "linguisticTerm": "HIGH" }
    }
  ],
  "alternatives": [
    {
      "optionId": "booking-option-1",
      "sessionId": "sess-01",
      "branchName": "CareVia Quận 1",
      "locationDetail": "Phòng Trải Nghiệm Tầng 2",
      "startTime": "2026-06-15T09:00:00Z",
      "endTime": "2026-06-15T10:30:00Z",
      "criteriaScores": {
        "distanceKm": { "value": 2.0 },
        "serviceQuality": { "linguisticTerm": "HIGH" },
        "availableSlots": { "value": 4.0 }
      }
    },
    {
      "optionId": "booking-option-2",
      "sessionId": "sess-03",
      "branchName": "CareVia Phú Nhuận",
      "locationDetail": "Studio Skin Lab Phòng 03",
      "startTime": "2026-06-16T10:00:00Z",
      "endTime": "2026-06-16T11:00:00Z",
      "criteriaScores": {
        "distanceKm": { "value": 3.5 },
        "serviceQuality": { "linguisticTerm": "VERY_HIGH" },
        "availableSlots": { "value": 7.0 }
      }
    }
  ]
}
```

#### 2.2.5.2. Endpoint Demo (Không Cần Body)

```
GET /api/v1/recommendations/bookings/fuzzy-topsis/demo
```

Trả về kết quả với 3 phiên booking mẫu (built-in demo trong `FuzzyTopsisService.buildDemoRequest()`), thuận tiện cho kiểm thử nhanh mà không cần chuẩn bị dữ liệu.

#### 2.2.5.3. Cấu Trúc Response

```json
{
  "algorithm": "Fuzzy TOPSIS",
  "scenarioName": "...",
  "serviceId": "...",
  "positiveIdeal": { "lower": 1.0, "middle": 1.0, "upper": 1.0 },
  "negativeIdeal": { "lower": 0.0, "middle": 0.0, "upper": 0.0 },
  "criteriaConfiguration": [ ... ],
  "rankings": [
    {
      "rank": 1,
      "optionId": "booking-option-2",
      "sessionId": "sess-03",
      "branchName": "CareVia Phú Nhuận",
      "closenessCoefficient": 0.734521,
      "distanceToPositiveIdeal": 0.512300,
      "distanceToNegativeIdeal": 1.421000,
      "recommended": true,
      "breakdown": [
        {
          "criterionId": "serviceQuality",
          "criterionName": "Chất lượng dịch vụ",
          "rawScore": { "lower": 0.9, "middle": 1.0, "upper": 1.0 },
          "normalizedScore": { "lower": 0.9, "middle": 1.0, "upper": 1.0 },
          "weightedScore": { "lower": 0.81, "middle": 1.0, "upper": 1.0 }
        }
      ]
    }
  ]
}
```

Response cung cấp `breakdown` chi tiết cho từng tiêu chí, cho phép khách hàng hiểu lý do tại sao phương án được gợi ý.

---

### 2.2.6. Đánh Giá Độ Chính Xác Của Mô Hình AI

#### 2.2.6.1. Tính Chính Xác Toán Học (Unit Testing)

Hệ thống Carevia có bộ kiểm thử đơn vị (`FuzzyTopsisServiceTest`) xác minh tính đúng đắn của thuật toán:

| Test Case | Kết quả Mong Đợi | Trạng Thái |
|---|---|---|
| Demo scenario (3 phiên booking) | Phiên rank 1 được đánh dấu `recommended = true` | PASS |
| $CC_i$ rank 1 ≥ $CC_i$ rank cuối | Thứ tự giảm dần theo hệ số gần gũi | PASS |
| Alternative thiếu điểm tiêu chí | Ném `ResponseStatusException (400)` | PASS |
| Trùng lặp criterionId | Ném `ResponseStatusException (400)` | PASS |
| TFN không hợp lệ ($l > m$ hoặc $m > u$) | Ném `IllegalArgumentException` | PASS |

#### 2.2.6.2. Tính Ổn Định Của Thuật Toán (Determinism)

Vì Fuzzy TOPSIS là thuật toán **xác định hoàn toàn** (deterministic) — không có yếu tố ngẫu nhiên, không có quá trình train/test theo nghĩa Machine Learning truyền thống — mọi lần gọi với cùng đầu vào sẽ luôn cho cùng đầu ra. Điều này đảm bảo:

- **Khả năng tái tạo (Reproducibility):** Kết quả có thể kiểm tra lại bất kỳ lúc nào.
- **Khả năng giải thích (Explainability):** Mỗi bước tính toán được trả về trong field `breakdown`, người dùng có thể xem nguyên nhân xếp hạng.
- **Không cần dataset training:** Không phụ thuộc vào dữ liệu lịch sử để cho kết quả hợp lý.

#### 2.2.6.3. Đánh Giá Chất Lượng Quyết Định (Decision Quality)

Do Fuzzy TOPSIS là mô hình MCDM (không phải mô hình học máy dự đoán), việc đánh giá "độ chính xác" được thực hiện qua:

**a) Kiểm định tính nhất quán thứ hạng:**  
Với cùng bộ tiêu chí, khi thay đổi một tiêu chí nhỏ (ví dụ tăng điểm chất lượng của phương án A), thứ hạng của A phải tăng hoặc giữ nguyên — không bao giờ giảm (monotonicity property). Thuật toán trong hệ thống đảm bảo tính chất này.

**b) Kiểm tra biên (Boundary Validation):**  
- Khi tất cả phương án có điểm bằng nhau → $CC_i$ xấp xỉ nhau → thứ hạng là ngẫu nhiên (expected behavior).
- Khi một phương án đạt điểm tối đa trên tất cả tiêu chí lợi ích và tối thiểu trên tất cả tiêu chí chi phí → $CC_i \to 1$ (best case).

**c) Khả năng mở rộng tiêu chí:**  
Mô hình hỗ trợ thêm/bớt tiêu chí mà không thay đổi thuật toán lõi, nhờ kiến trúc tham số hoá hoàn toàn (`List<RecommendationCriterionRequest>`). Điều này cho phép người quản trị hệ thống điều chỉnh bộ tiêu chí theo nghiệp vụ thực tế mà không cần lập trình lại.

**d) Validation dữ liệu đầu vào:**  
Lớp `FuzzyValueInput` và `TriangularFuzzyNumber` thực hiện strict validation:
- Tất cả giá trị phải không âm ($l, m, u \geq 0$).
- Phải thoả mãn $l \leq m \leq u$.
- Mỗi phương án phải có điểm cho tất cả tiêu chí đã khai báo.
- Không được có tiêu chí trùng ID hoặc phương án trùng ID.

#### 2.2.6.4. Hạn Chế và Hướng Cải Thiện

| Hạn chế | Hướng Cải Thiện |
|---|---|
| Trọng số tiêu chí do người dùng/hệ thống cấu hình tĩnh | Học trọng số từ hành vi người dùng (AHP + Machine Learning) |
| Điểm tiêu chí nhập thủ công | Tự động trích xuất từ dữ liệu database (đánh giá, lịch sử booking) |
| Không cá nhân hoá theo profile người dùng | Tích hợp UserBehavior và RecommendationLog để điều chỉnh trọng số theo cá nhân |
| Chưa xử lý tiêu chí tương quan | Áp dụng phương pháp DEMATEL để phân tích quan hệ giữa tiêu chí |

---

## 2.3. Tóm Tắt

Chương 2 đã trình bày:

1. **Công nghệ sử dụng:** Java 17 + Spring Boot 3.3.5 (backend), TypeScript + Next.js 16 (frontend), PostgreSQL 15 (database), cùng các thư viện hỗ trợ quan trọng. Mỗi lựa chọn có căn cứ rõ ràng dựa trên yêu cầu nghiệp vụ của hệ thống Carevia.

2. **Mô hình AI — Fuzzy TOPSIS:** Thuật toán ra quyết định đa tiêu chí với khả năng xử lý thông tin không chắc chắn qua số mờ tam giác. Được áp dụng cho bài toán gợi ý phiên đặt lịch và gợi ý thiết bị — hai bài toán cốt lõi của hệ thống.

3. **Cài đặt và tích hợp:** Thuật toán được triển khai hoàn toàn in-memory bằng Java, không phụ thuộc thư viện ML bên ngoài, đảm bảo tính minh bạch, khả năng giải thích và dễ kiểm thử. API RESTful cho phép frontend gọi gợi ý theo thời gian thực với đầu vào linh hoạt (ngôn ngữ mờ, số crisp hoặc TFN tường minh).
