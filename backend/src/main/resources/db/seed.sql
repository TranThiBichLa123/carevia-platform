-- =============================================================
-- CAREVIA PLATFORM - SEED DATA
-- Chạy file này để insert dữ liệu mẫu vào toàn bộ các bảng
-- Password mặc định của tất cả accounts: "password123"
-- BCrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu0
-- =============================================================

-- Tắt triggers tạm thời để tránh lỗi FK khi insert
SET session_replication_role = replica;

-- =============================================================
-- 1. BRANDS
-- =============================================================
INSERT INTO brands (id, name, slug, image, is_featured, is_active, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 'Foreo',          'foreo',          'https://placehold.co/200x200?text=Foreo',     true,  true,  NOW(), NOW(), 'seed', 'seed'),
  (2, 'NuFace',         'nuface',         'https://placehold.co/200x200?text=NuFace',    true,  true,  NOW(), NOW(), 'seed', 'seed'),
  (3, 'Philips',        'philips',        'https://placehold.co/200x200?text=Philips',   false, true,  NOW(), NOW(), 'seed', 'seed'),
  (4, 'Panasonic',      'panasonic',      'https://placehold.co/200x200?text=Panasonic', false, true,  NOW(), NOW(), 'seed', 'seed'),
  (5, 'CurrentBody',    'currentbody',    'https://placehold.co/200x200?text=CurrentBody', true, true, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;


-- =============================================================
-- 2. CATEGORIES (device categories)
-- =============================================================
INSERT INTO categories (id, name, slug, image, is_active, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 'Thiết bị làm sạch',    'thiet-bi-lam-sach',    'https://placehold.co/200x200?text=Cleansing',    true, NOW(), NOW(), 'seed', 'seed'),
  (2, 'Thiết bị chống lão hóa','thiet-bi-chong-lao-hoa','https://placehold.co/200x200?text=AntiAging',   true, NOW(), NOW(), 'seed', 'seed'),
  (3, 'Thiết bị trị liệu ánh sáng','thiet-bi-tri-lieu-anh-sang','https://placehold.co/200x200?text=LightTherapy', true, NOW(), NOW(), 'seed', 'seed'),
  (4, 'Thiết bị massage mặt', 'thiet-bi-massage-mat',  'https://placehold.co/200x200?text=Massage',      true, NOW(), NOW(), 'seed', 'seed'),
  (5, 'Thiết bị tẩy tế bào chết','thiet-bi-tay-te-bao-chet','https://placehold.co/200x200?text=Exfoliating', true, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 3. ACCOUNTS (1 admin, 3 staff, 3 client)
-- =============================================================
INSERT INTO accounts (id, username, email, password_hash, role, status, avatar_url, lang_key, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 'admin',       'admin@carevia.vn',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu0', 'ADMIN',  'ACTIVE', NULL, 'vi', NOW(), NOW(), 'seed', 'seed'),
  (2, 'staff_lan',   'staff.lan@carevia.vn',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu0', 'STAFF',  'ACTIVE', NULL, 'vi', NOW(), NOW(), 'seed', 'seed'),
  (3, 'staff_minh',  'staff.minh@carevia.vn',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu0', 'STAFF',  'ACTIVE', NULL, 'vi', NOW(), NOW(), 'seed', 'seed'),
  (8, 'staff_huong', 'staff.huong@carevia.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu0', 'STAFF',  'PENDING_APPROVAL', NULL, 'vi', NOW(), NOW(), 'seed', 'seed'),
  (4, 'client_anh',  'anh.nguyen@gmail.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu0', 'CLIENT', 'ACTIVE', NULL, 'vi', NOW(), NOW(), 'seed', 'seed'),
  (5, 'client_bich', 'bich.tran@gmail.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu0', 'CLIENT', 'ACTIVE', NULL, 'vi', NOW(), NOW(), 'seed', 'seed'),
  (6, 'client_cuong','cuong.le@gmail.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu0', 'CLIENT', 'ACTIVE', NULL, 'vi', NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

UPDATE accounts
SET
    avatar_url = 'https://res.cloudinary.com/dcisx0vss/image/upload/q_auto/f_auto/v1780308622/download_4_ncdqwh.jpg',
    updated_at = NOW()
WHERE id = 6;

UPDATE public.accounts
SET password_hash = '$2a$10$l6ZVK9xpG39mMeViACh1ueV2ZbfD8kihbBE10kuu9DTAaRSPRJvGC', 
    updated_at = NOW(), 
    updated_by = 'admin' 
WHERE email = 'admin@carevia.vn';

UPDATE accounts
SET
    avatar_url = 'https://i.pinimg.com/736x/5a/81/c0/5a81c0616095f150c74367dfb8e1fc91.jpg',
    updated_at = NOW()
WHERE id = 10;
-- mật khẩu của admin là Admin@123


UPDATE public.accounts
SET 
    password_hash = '$2y$10$Nd.TjY1bfkI.hb2zZhGHI.i9uBwNRU0sA.FChj6zH6UBvIkchIQLK',
    updated_at = NOW(),
    updated_by = 'admin'
WHERE id = 2;

-- mật khẩu của lan là Staff@123

-- 1. Thêm Admin (nếu chưa có ID 1) hoặc thêm một Admin thứ hai (ID 7)
INSERT INTO accounts (id, username, email, password_hash, role, status, lang_key, created_at, updated_at, created_by, updated_by)
OVERRIDING SYSTEM VALUE VALUES 
(7, 'platform_admin', 'platform.admin@carevia.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu0', 'ADMIN', 'ACTIVE', 'vi', NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (id) DO UPDATE SET 
  username = EXCLUDED.username,
  email = EXCLUDED.email,
    role = 'ADMIN', 
    status = 'ACTIVE';

-- 2. RESET bộ đếm để khi đăng ký mới không bị trùng ID
SELECT setval(pg_get_serial_sequence('accounts', 'id'), (SELECT MAX(id) FROM accounts));






-- =============================================================
-- 4. STAFFS
-- =============================================================
TRUNCATE TABLE staffs RESTART IDENTITY CASCADE;

-- 1. Ép mã hóa UTF8 cho phiên làm việc này
SET client_encoding = 'UTF8';

INSERT INTO staffs (id, account_id, staff_code, full_name, birth_date, gender, phone, specialty, degree, brand_id, requested_brand_name, requested_brand_description, approved, approved_by, approved_at, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 2, 'ST001', 'Trần Thị Lan',   '1992-05-15', 'FEMALE', '0901234567', 'Da liễu thẩm mỹ', 'Cử nhân Điều dưỡng', 1, 'Foreo', 'Seller seed đang vận hành brand Foreo trên marketplace.', true, 1, NOW(), NOW(), NOW(), 'seed', 'seed'),
  (2, 3, 'ST002', 'Nguyễn Văn Minh','1989-10-20', 'MALE',   '0912345678', 'Vật lý trị liệu',  'Thạc sĩ Y học',      2, 'NuFace', 'Seller seed đang vận hành brand NuFace trên marketplace.', true, 1, NOW(), NOW(), NOW(), 'seed', 'seed'),
  (3, 8, 'ST003', 'Lê Thu Hương',   '1994-08-09', 'FEMALE', '0981234567', 'Seller onboarding', 'Brand Representative', NULL, 'GlowLab Vietnam', 'Brand thiết bị skincare công nghệ cao đang chờ Platform Admin duyệt để mở seller workspace.', false, NULL, NULL, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 5. CLIENTS
-- =============================================================
INSERT INTO clients (id, account_id, client_code, full_name, birth_date, gender, phone, skin_type, skin_concerns, loyalty_points, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 4, 'CL001', 'Nguyễn Thị Ánh',  '1995-03-12', 'FEMALE', '0933111222', 'Da hỗn hợp', 'Mụn, lỗ chân lông to', 150, NOW(), NOW(), 'seed', 'seed'),
  (2, 5, 'CL002', 'Trần Thị Bích',   '1997-07-25', 'FEMALE', '0944222333', 'Da khô',     'Lão hóa, thâm',        320, NOW(), NOW(), 'seed', 'seed'),
  (3, 6, 'CL003', 'Lê Văn Cường',    '1990-11-08', 'MALE',   '0955333444', 'Da dầu',     'Mụn cám, bóng nhờn',   80,  NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 6. CLIENT_ADDRESSES
-- =============================================================
TRUNCATE TABLE client_addresses RESTART IDENTITY CASCADE;

-- 1. Ép mã hóa UTF8 cho phiên làm việc này
SET client_encoding = 'UTF8';


INSERT INTO client_addresses (id, client_id, street, ward, district, city, is_default, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 1, '123 Nguyễn Trãi',     'Phường 3',      'Quận 5',      'TP. Hồ Chí Minh', true,  NOW(), NOW(), 'seed', 'seed'),
  (2, 1, '456 Lê Văn Việt',     'Phường Hiệp Phú','Quận 9',     'TP. Hồ Chí Minh', false, NOW(), NOW(), 'seed', 'seed'),
  (3, 2, '789 Trần Phú',        'Phường 4',      'Quận Hải Châu','Đà Nẵng',         true,  NOW(), NOW(), 'seed', 'seed'),
  (4, 3, '10 Lý Tự Trọng',      'Phường Bến Nghé','Quận 1',     'TP. Hồ Chí Minh', true,  NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 7. DEVICES
-- =============================================================

-- 1. Ép mã hóa UTF8 để hiển thị tiếng Việt chuẩn
SET client_encoding = 'UTF8';

-- 2. Xóa dữ liệu cũ (Nếu bạn muốn nạp lại hoàn toàn mới)
-- TRUNCATE TABLE devices CASCADE; 

INSERT INTO devices (id, name, slug, description, content, price, original_price, discount_percentage, stock, average_rating, image, category_id, brand_id, sku, warranty_period, warranty_policy, origin, device_condition, skin_type, skin_concerns, status, sold, review_count, view_count, is_booking_available, booking_price, video_url, created_at, updated_at, created_by, updated_by)
VALUES
  (1,  'Foreo LUNA 4 - Máy rửa mặt siêu âm',
       'foreo-luna-4',
       'Máy rửa mặt siêu âm thế hệ 4 với 16 chế độ chăm sóc da.',
       '<p>Foreo LUNA 4 sử dụng công nghệ T-Sonic với 8000 rung động/phút...</p>',
       3200000, 3800000, 15.79, 25, 4.7, 'https://placehold.co/600x400?text=Foreo+LUNA+4',
       1, 1, 'FOREO-L4-001', 24, '24 tháng bảo hành chính hãng', 'Thụy Điển', 'new',
       'Da hỗn hợp, Da dầu', 'Mụn, Lỗ chân lông to', 'AVAILABLE', 45, 12, 1250,
       true, 250000, NULL, NOW(), NOW(), 'seed', 'seed'),

  (2,  'NuFace Trinity - Máy nâng cơ mặt vi dòng điện',
       'nuface-trinity',
       'Máy nâng cơ mặt sử dụng công nghệ vi dòng điện (microcurrent).',
       '<p>NuFace Trinity là thiết bị chuyên nghiệp giúp kích thích cơ mặt...</p>',
       5500000, 6500000, 15.38, 18, 4.8, 'https://placehold.co/600x400?text=NuFace+Trinity',
       2, 2, 'NUFACE-TRT-001', 12, '12 tháng bảo hành chính hãng', 'Mỹ', 'new',
       'Mọi loại da', 'Lão hóa, Nếp nhăn, Chảy xệ', 'AVAILABLE', 28, 8, 890,
       true, 400000, NULL, NOW(), NOW(), 'seed', 'seed'),

  (3,  'CurrentBody LED Light Therapy Mask',
       'currentbody-led-mask',
       'Mặt nạ trị liệu ánh sáng đỏ và hồng ngoại gần.',
       '<p>Sử dụng ánh sáng đỏ 633nm và NIR 830nm để kích thích collagen...</p>',
       8900000, 9500000, 6.32, 12, 4.9, 'https://placehold.co/600x400?text=CurrentBody+LED',
       3, 5, 'CB-LED-001', 24, '24 tháng bảo hành chính hãng', 'Anh', 'new',
       'Mọi loại da', 'Lão hóa, Thâm, Đốm nâu', 'AVAILABLE', 15, 5, 650,
       true, 500000, NULL, NOW(), NOW(), 'seed', 'seed'),

  (4,  'Philips VisaPure Advanced - Máy làm sạch da',
       'philips-visapure-advanced',
       'Máy làm sạch da với đầu chổi lông mềm kết hợp sóng âm.',
       '<p>Philips VisaPure Advanced làm sạch sâu gấp 10 lần so với rửa tay...</p>',
       1850000, 2200000, 15.91, 30, 4.5, 'https://placehold.co/600x400?text=Philips+VisaPure',
       1, 3, 'PHILIPS-VP-001', 24, '24 tháng bảo hành chính hãng', 'Hà Lan', 'new',
       'Da thường, Da hỗn hợp', 'Bụi bẩn, Tắc lỗ chân lông', 'AVAILABLE', 62, 18, 2100,
       false, NULL, NULL, NOW(), NOW(), 'seed', 'seed'),

  (5,  'Panasonic EH-XC15 - Máy massage mặt ion',
       'panasonic-eh-xc15',
       'Máy massage mặt với công nghệ ion và rung động siêu âm.',
       '<p>EH-XC15 kết hợp ion âm và rung động để đưa dưỡng chất vào sâu...</p>',
       2400000, 2800000, 14.29, 22, 4.3, 'https://placehold.co/600x400?text=Panasonic+EH-XC15',
       4, 4, 'PAN-XC15-001', 12, '12 tháng bảo hành chính hãng', 'Nhật Bản', 'new',
       'Da khô, Da thường', 'Thâm, Lão hóa nhẹ', 'AVAILABLE', 35, 10, 780,
       false, NULL, NULL, NOW(), NOW(), 'seed', 'seed'),

  (6,  'Foreo LUNA mini 3 - Máy rửa mặt cầm tay',
       'foreo-luna-mini-3',
       'Phiên bản nhỏ gọn của LUNA 4, phù hợp mang theo khi di chuyển.',
       '<p>LUNA mini 3 với kích thước nhỏ gọn, pin dùng 300 lần sạc...</p>',
       1600000, 1900000, 15.79, 40, 4.6, 'https://placehold.co/600x400?text=Foreo+mini+3',
       1, 1, 'FOREO-M3-001', 24, '24 tháng bảo hành chính hãng', 'Thụy Điển', 'new',
       'Mọi loại da', 'Mụn, Làm sạch', 'AVAILABLE', 80, 22, 3400,
       false, NULL, NULL, NOW(), NOW(), 'seed', 'seed'),

  (7,  'NuFace Mini - Máy nâng cơ mặt cầm tay',
       'nuface-mini',
       'Phiên bản nhỏ của Trinity, dễ sử dụng hàng ngày tại nhà.',
       '<p>NuFace Mini giúp nâng cơ mặt chỉ với 5 phút mỗi ngày...</p>',
       3200000, 3800000, 15.79, 20, 4.7, 'https://placehold.co/600x400?text=NuFace+Mini',
       2, 2, 'NUFACE-MINI-001', 12, '12 tháng bảo hành chính hãng', 'Mỹ', 'new',
       'Mọi loại da', 'Lão hóa, Nếp nhăn', 'AVAILABLE', 40, 15, 1800,
       true, 300000, NULL, NOW(), NOW(), 'seed', 'seed'),

  (8,  'CurrentBody Skin Tone Device',
       'currentbody-skin-tone',
       'Thiết bị cải thiện tone da và giảm đốm nâu bằng IPL.',
       '<p>Sử dụng công nghệ IPL để làm đều màu da và giảm các vết thâm...</p>',
       7200000, 8000000, 10.00, 8, 4.4, 'https://placehold.co/600x400?text=CurrentBody+Tone',
       3, 5, 'CB-TONE-001', 24, '24 tháng bảo hành chính hãng', 'Anh', 'new',
       'Da sáng - trung bình', 'Đốm nâu, Không đều màu', 'AVAILABLE', 12, 4, 450,
       false, NULL, NULL, NOW(), NOW(), 'seed', 'seed'),

  (9,  'PMD Personal Microderm Elite - Máy tẩy tế bào chết',
       'pmd-personal-microderm-elite',
       'Máy tẩy tế bào chết chuyên nghiệp tại nhà với đĩa tinh thể.',
       '<p>Công nghệ microdermabrasion giúp loại bỏ tế bào chết, kích thích collagen...</p>',
       2900000, 3500000, 17.14, 15, 4.2, 'https://placehold.co/600x400?text=PMD+Microderm',
       5, 3, 'PMD-ELITE-001', 12, '12 tháng bảo hành', 'Mỹ', 'new',
       'Da thường, Da dầu', 'Tắc lỗ chân lông, Bề mặt da thô ráp', 'AVAILABLE', 25, 7, 620,
       true, 350000, NULL, NOW(), NOW(), 'seed', 'seed'),

  (10, 'Ziip Nano Current Device - Thiết bị nano current',
       'ziip-nano-current',
       'Kết hợp nano và microcurrent để trẻ hóa da từ sâu bên trong.',
       '<p>ZIIP sử dụng AI tính toán tần số phù hợp với từng vùng da...</p>',
       9800000, 11000000, 10.91, 6, 4.8, 'https://placehold.co/600x400?text=ZIIP+Nano',
       2, 2, 'ZIIP-NANO-001', 12, '12 tháng bảo hành chính hãng', 'Mỹ', 'new',
       'Mọi loại da', 'Lão hóa, Nếp nhăn sâu', 'AVAILABLE', 8, 3, 320,
       true, 600000, NULL, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- 3. Bổ sung thêm 30 thiết bị đa dạng cho demo fuzzy TOPSIS
INSERT INTO devices (id, name, slug, description, content, price, original_price, discount_percentage, stock, average_rating, image, category_id, brand_id, sku, warranty_period, warranty_policy, origin, device_condition, skin_type, skin_concerns, status, sold, review_count, view_count, is_booking_available, booking_price, video_url, created_at, updated_at, created_by, updated_by)
VALUES
  (11, 'Foreo BEAR 2 - Máy nâng cơ vi dòng', 'foreo-bear-2', 'Thiết bị vi dòng nâng cơ mặt và cải thiện độ săn chắc.', '<p>Foreo BEAR 2 phù hợp cho nhu cầu nâng cơ nhanh tại nhà và chăm sóc gương mặt hằng ngày.</p>', 7900000, 8900000, 11.24, 12, 4.9, 'https://placehold.co/600x400?text=Foreo+Bear+2', 2, 1, 'FOREO-BEAR2-001', 24, '24 tháng bảo hành chính hãng', 'Thụy Điển', 'new', 'Mọi loại da', 'Chảy xệ, Nếp nhăn', 'AVAILABLE', 34, 11, 980, true, 550000, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (12, 'Philips Lumea Facial Precision IPL', 'philips-lumea-facial-precision', 'Thiết bị IPL hỗ trợ làm đều màu da và cải thiện vùng thâm.', '<p>Philips Lumea Facial Precision IPL nhắm đến nhóm khách hàng muốn cải thiện sắc tố da và bề mặt da.</p>', 6100000, 7200000, 15.28, 10, 4.6, 'https://placehold.co/600x400?text=Philips+Lumea', 3, 3, 'PHILIPS-LUMEA-001', 24, '24 tháng bảo hành chính hãng', 'Hà Lan', 'new', 'Da thường, Da hỗn hợp', 'Thâm mụn, Không đều màu', 'AVAILABLE', 22, 8, 540, true, 420000, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (13, 'Panasonic Nano Facial Steamer EH-SA0B', 'panasonic-nano-facial-steamer-eh-sa0b', 'Máy xông mặt nano hỗ trợ cấp ẩm và làm mềm da trước treatment.', '<p>EH-SA0B phù hợp với làn da khô, nhạy cảm cần tăng độ ẩm và thư giãn.</p>', 4300000, 4900000, 12.24, 16, 4.7, 'https://placehold.co/600x400?text=Panasonic+Steamer', 4, 4, 'PANASONIC-SA0B-001', 12, '12 tháng bảo hành chính hãng', 'Nhật Bản', 'new', 'Da khô, Da nhạy cảm', 'Thiếu ẩm, Xỉn màu', 'AVAILABLE', 19, 7, 410, false, NULL, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (14, 'NuFace FIX Line Smoothing Device', 'nuface-fix-line-smoothing', 'Thiết bị chăm sóc vùng mắt và rãnh cười bằng microcurrent nhẹ.', '<p>NuFace FIX thích hợp cho vùng mắt, trán và rãnh cười với cường độ dịu hơn Trinity.</p>', 4600000, 5200000, 11.54, 14, 4.5, 'https://placehold.co/600x400?text=NuFace+Fix', 2, 2, 'NUFACE-FIX-001', 12, '12 tháng bảo hành chính hãng', 'Mỹ', 'new', 'Da thường, Da hỗn hợp', 'Nếp nhăn vùng mắt, Rãnh cười', 'AVAILABLE', 27, 9, 760, true, 380000, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (15, 'CurrentBody Skin RF Radio Frequency', 'currentbody-skin-rf-radio-frequency', 'Thiết bị RF hỗ trợ săn chắc da và giảm chùng nhão.', '<p>CurrentBody RF là lựa chọn cao cấp cho nhóm khách hàng ưu tiên nâng cơ chuyên sâu tại nhà.</p>', 10500000, 11900000, 11.76, 7, 4.8, 'https://placehold.co/600x400?text=CurrentBody+RF', 2, 5, 'CB-RF-001', 24, '24 tháng bảo hành chính hãng', 'Anh', 'new', 'Mọi loại da', 'Lão hóa, Chùng nhão', 'AVAILABLE', 14, 6, 390, true, 720000, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (16, 'Foreo ESPADA 2 Blue Light', 'foreo-espada-2-blue-light', 'Thiết bị ánh sáng xanh hỗ trợ giảm viêm mụn và gom cồi.', '<p>ESPADA 2 tập trung vào vùng mụn viêm, phù hợp da dầu và da hỗn hợp thiên dầu.</p>', 2900000, 3400000, 14.71, 25, 4.4, 'https://placehold.co/600x400?text=Foreo+Espada+2', 3, 1, 'FOREO-ESPADA2-001', 24, '24 tháng bảo hành chính hãng', 'Thụy Điển', 'new', 'Da dầu, Da hỗn hợp', 'Mụn viêm, Mụn ẩn', 'AVAILABLE', 41, 13, 1180, true, 260000, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (17, 'Philips Sonicare Radiance Cleanse Brush', 'philips-sonicare-radiance-cleanse-brush', 'Máy làm sạch bằng sóng âm cho da dầu và da thường.', '<p>Sonicare Radiance phù hợp làm sạch bụi bẩn hằng ngày và hỗ trợ thông thoáng lỗ chân lông.</p>', 2100000, 2500000, 16.00, 28, 4.3, 'https://placehold.co/600x400?text=Philips+Sonicare', 1, 3, 'PHILIPS-SONICARE-001', 18, '18 tháng bảo hành chính hãng', 'Hà Lan', 'new', 'Da thường, Da dầu', 'Bụi bẩn, Lỗ chân lông to', 'AVAILABLE', 36, 10, 860, false, NULL, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (18, 'Panasonic EH-SC67 Micro-Foaming Cleanser', 'panasonic-eh-sc67-micro-foaming-cleanser', 'Máy tạo bọt siêu mịn hỗ trợ làm sạch sâu và massage nhẹ.', '<p>EH-SC67 kết hợp làm sạch và làm mềm da, phù hợp chu trình chăm sóc da buổi tối.</p>', 3550000, 4050000, 12.35, 18, 4.6, 'https://placehold.co/600x400?text=Panasonic+SC67', 1, 4, 'PANASONIC-SC67-001', 12, '12 tháng bảo hành chính hãng', 'Nhật Bản', 'new', 'Da thường, Da hỗn hợp', 'Làm sạch sâu, Xỉn màu', 'AVAILABLE', 24, 7, 530, false, NULL, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (19, 'PMD Clean Pro Rose Quartz', 'pmd-clean-pro-rose-quartz', 'Thiết bị massage rung và nhiệt nhẹ hỗ trợ thư giãn da mặt.', '<p>PMD Clean Pro Rose Quartz hướng đến trải nghiệm massage dịu nhẹ cho da nhạy cảm.</p>', 2750000, 3200000, 14.06, 20, 4.2, 'https://placehold.co/600x400?text=PMD+Clean+Pro', 4, 3, 'PMD-CLEANPRO-001', 12, '12 tháng bảo hành', 'Mỹ', 'new', 'Da nhạy cảm, Da khô', 'Sưng nhẹ, Cần thư giãn', 'AVAILABLE', 17, 5, 340, false, NULL, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (20, 'NuFace Trinity Plus Smart', 'nuface-trinity-plus-smart', 'Phiên bản thông minh của Trinity với chương trình chăm sóc cá nhân hóa.', '<p>NuFace Trinity Plus Smart phù hợp demo nhóm thiết bị nâng cơ cao cấp.</p>', 6900000, 7900000, 12.66, 11, 4.9, 'https://placehold.co/600x400?text=NuFace+Trinity+Plus', 2, 2, 'NUFACE-TRINITYPLUS-001', 12, '12 tháng bảo hành chính hãng', 'Mỹ', 'new', 'Mọi loại da', 'Chảy xệ, Đường nét kém săn chắc', 'AVAILABLE', 31, 12, 1010, true, 520000, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (21, 'CurrentBody LED Neck and Dec Perfector', 'currentbody-led-neck-and-dec-perfector', 'Thiết bị LED chuyên cho vùng cổ và ngực.', '<p>Sản phẩm phù hợp khách hàng cần treatment riêng cho vùng cổ có dấu hiệu lão hóa.</p>', 7400000, 8400000, 11.90, 9, 4.7, 'https://placehold.co/600x400?text=CurrentBody+Neck+LED', 3, 5, 'CB-NECKLED-001', 24, '24 tháng bảo hành chính hãng', 'Anh', 'new', 'Mọi loại da', 'Nếp nhăn vùng cổ, Xỉn màu', 'AVAILABLE', 16, 6, 470, true, 480000, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (22, 'Foreo UFO 3 Smart Mask Treatment', 'foreo-ufo-3-smart-mask-treatment', 'Thiết bị đẩy tinh chất với nhiệt, lạnh và xung T-Sonic.', '<p>Foreo UFO 3 phù hợp quy trình chăm sóc da nhanh và tăng khả năng hấp thụ dưỡng chất.</p>', 5200000, 5900000, 11.86, 15, 4.5, 'https://placehold.co/600x400?text=Foreo+UFO+3', 4, 1, 'FOREO-UFO3-001', 24, '24 tháng bảo hành chính hãng', 'Thụy Điển', 'new', 'Da khô, Da thường', 'Thiếu ẩm, Cần phục hồi', 'AVAILABLE', 29, 9, 690, false, NULL, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (23, 'Panasonic EH-ST98 Warm Ion Booster', 'panasonic-eh-st98-warm-ion-booster', 'Thiết bị ion ấm hỗ trợ đưa tinh chất vào sâu hơn.', '<p>EH-ST98 phù hợp khách hàng cần kết hợp massage nhẹ và tăng hấp thu serum.</p>', 4950000, 5600000, 11.61, 13, 4.6, 'https://placehold.co/600x400?text=Panasonic+ST98', 4, 4, 'PANASONIC-ST98-001', 12, '12 tháng bảo hành chính hãng', 'Nhật Bản', 'new', 'Da khô, Da hỗn hợp', 'Dưỡng chất khó thẩm thấu, Xỉn màu', 'AVAILABLE', 21, 8, 560, true, 360000, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (24, 'Philips VisaBoost Serum Infuser', 'philips-visaboost-serum-infuser', 'Thiết bị serum infuser hỗ trợ cấp ẩm và làm dịu da.', '<p>VisaBoost Serum Infuser phù hợp routine nhẹ nhàng cho da thiếu nước và nhạy cảm.</p>', 3300000, 3900000, 15.38, 17, 4.4, 'https://placehold.co/600x400?text=Philips+VisaBoost', 4, 3, 'PHILIPS-VISABOOST-001', 18, '18 tháng bảo hành chính hãng', 'Hà Lan', 'new', 'Da khô, Da nhạy cảm', 'Thiếu ẩm, Cần làm dịu', 'AVAILABLE', 18, 6, 430, false, NULL, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (25, 'Foreo LUNA 4 Body Polish', 'foreo-luna-4-body-polish', 'Thiết bị làm sạch body và tẩy da chết vật lý nhẹ.', '<p>LUNA 4 Body Polish tạo thêm lựa chọn phong phú cho nhóm thiết bị chăm sóc cơ thể.</p>', 4100000, 4700000, 12.77, 22, 4.3, 'https://placehold.co/600x400?text=Foreo+Body+Polish', 1, 1, 'FOREO-BODYPOLISH-001', 24, '24 tháng bảo hành chính hãng', 'Thụy Điển', 'new', 'Mọi loại da', 'Da sần, Làm sạch body', 'AVAILABLE', 26, 8, 610, false, NULL, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (26, 'NuFace Mini Plus Starter', 'nuface-mini-plus-starter', 'Máy nâng cơ mini dành cho nhu cầu sử dụng hằng ngày.', '<p>NuFace Mini Plus Starter phù hợp khách hàng mới bắt đầu với microcurrent.</p>', 3900000, 4500000, 13.33, 19, 4.7, 'https://placehold.co/600x400?text=NuFace+Mini+Plus', 2, 2, 'NUFACE-MINIPLUS-001', 12, '12 tháng bảo hành chính hãng', 'Mỹ', 'new', 'Mọi loại da', 'Nâng cơ nhẹ, Săn chắc', 'AVAILABLE', 33, 11, 920, true, 340000, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (27, 'CurrentBody LED Hair Growth Helmet', 'currentbody-led-hair-growth-helmet', 'Thiết bị LED cho da đầu và nang tóc.', '<p>Thiết bị mở rộng danh mục high-tech treatment cho demo recommendation.</p>', 11900000, 13200000, 9.85, 6, 4.5, 'https://placehold.co/600x400?text=CurrentBody+Helmet', 3, 5, 'CB-HAIRLED-001', 24, '24 tháng bảo hành chính hãng', 'Anh', 'new', 'Mọi loại da', 'Da đầu yếu, Tóc thưa', 'AVAILABLE', 9, 4, 250, false, NULL, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (28, 'Panasonic EH-XR10 RF Lift Care', 'panasonic-eh-xr10-rf-lift-care', 'Thiết bị RF kết hợp massage cho da có dấu hiệu lão hóa.', '<p>EH-XR10 là lựa chọn mạnh trong nhóm chăm sóc lão hóa và cải thiện săn chắc.</p>', 8700000, 9700000, 10.31, 8, 4.8, 'https://placehold.co/600x400?text=Panasonic+XR10', 2, 4, 'PANASONIC-XR10-001', 12, '12 tháng bảo hành chính hãng', 'Nhật Bản', 'new', 'Da thường, Da hỗn hợp', 'Lão hóa, Săn chắc da', 'AVAILABLE', 15, 6, 380, true, 650000, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (29, 'Philips Rejuvenate Sonic Dermaplaning', 'philips-rejuvenate-sonic-dermaplaning', 'Thiết bị hỗ trợ tẩy da chết nhẹ và làm mịn bề mặt da.', '<p>Dermaplaning sonic phù hợp nhóm da dầu và da thường cần bề mặt da mịn hơn.</p>', 2500000, 3000000, 16.67, 24, 4.2, 'https://placehold.co/600x400?text=Philips+Dermaplaning', 5, 3, 'PHILIPS-DERMAPLANE-001', 18, '18 tháng bảo hành chính hãng', 'Hà Lan', 'new', 'Da dầu, Da thường', 'Tế bào chết, Da thô ráp', 'AVAILABLE', 23, 7, 500, true, 290000, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (30, 'Foreo IRIS 2 Eye Massager', 'foreo-iris-2-eye-massager', 'Thiết bị massage vùng mắt giảm bọng và quầng thâm.', '<p>IRIS 2 là thiết bị chăm sóc vùng mắt nhẹ nhàng và dễ demo cho khách hàng.</p>', 3600000, 4200000, 14.29, 18, 4.6, 'https://placehold.co/600x400?text=Foreo+Iris+2', 4, 1, 'FOREO-IRIS2-001', 24, '24 tháng bảo hành chính hãng', 'Thụy Điển', 'new', 'Da nhạy cảm, Da thường', 'Bọng mắt, Quầng thâm', 'AVAILABLE', 20, 7, 450, false, NULL, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (31, 'NuFace Trinity Wrinkle Reducer', 'nuface-trinity-wrinkle-reducer', 'Thiết bị chuyên cho vùng nếp nhăn sâu và da kém đàn hồi.', '<p>Trinity Wrinkle Reducer giúp nhóm anti-aging có thêm lựa chọn cao cấp cho fuzzy ranking.</p>', 8300000, 9300000, 10.75, 7, 4.7, 'https://placehold.co/600x400?text=NuFace+Wrinkle', 2, 2, 'NUFACE-WRINKLE-001', 12, '12 tháng bảo hành chính hãng', 'Mỹ', 'new', 'Da thường, Da khô', 'Nếp nhăn sâu, Chảy xệ', 'AVAILABLE', 13, 5, 310, true, 680000, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (32, 'CurrentBody Precision LED Blemish Pen', 'currentbody-precision-led-blemish-pen', 'Thiết bị LED cầm tay cho vùng mụn nhỏ và thâm mới.', '<p>Precision LED Blemish Pen tạo thêm lựa chọn giá tầm trung cho da dầu và da hỗn hợp.</p>', 3150000, 3650000, 13.70, 21, 4.4, 'https://placehold.co/600x400?text=CurrentBody+Blemish+Pen', 3, 5, 'CB-BLEMISHPEN-001', 24, '24 tháng bảo hành chính hãng', 'Anh', 'new', 'Da dầu, Da hỗn hợp', 'Mụn sưng, Vết thâm mới', 'AVAILABLE', 30, 10, 780, true, 240000, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (33, 'Panasonic EH-SA3C Compact Steamer', 'panasonic-eh-sa3c-compact-steamer', 'Máy xông mini cho nhu cầu cấp ẩm nhẹ và thư giãn.', '<p>EH-SA3C phù hợp khách hàng cần thiết bị xông nhỏ gọn, dễ mang theo.</p>', 2600000, 3100000, 16.13, 26, 4.3, 'https://placehold.co/600x400?text=Panasonic+SA3C', 4, 4, 'PANASONIC-SA3C-001', 12, '12 tháng bảo hành chính hãng', 'Nhật Bản', 'new', 'Da khô, Da nhạy cảm', 'Thiếu ẩm, Cần làm dịu', 'AVAILABLE', 27, 9, 640, false, NULL, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (34, 'Philips Daily Deep Pore Cleanser', 'philips-daily-deep-pore-cleanser', 'Máy làm sạch sâu giá dễ tiếp cận cho da dầu và da hỗn hợp.', '<p>Daily Deep Pore Cleanser tạo thêm nhiều lựa chọn giá thấp cho thuật toán fuzzy.</p>', 1750000, 2100000, 16.67, 30, 4.1, 'https://placehold.co/600x400?text=Philips+Pore+Cleanser', 1, 3, 'PHILIPS-PORECLEAN-001', 18, '18 tháng bảo hành chính hãng', 'Hà Lan', 'new', 'Da dầu, Da hỗn hợp', 'Bã nhờn, Lỗ chân lông to', 'AVAILABLE', 42, 12, 1350, false, NULL, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (35, 'Foreo FAQ 202 LED Scalp Massager', 'foreo-faq-202-led-scalp-massager', 'Thiết bị massage da đầu kết hợp ánh sáng LED thư giãn.', '<p>FAQ 202 tạo độ đa dạng về công nghệ và nhu cầu sử dụng trong catalog.</p>', 6800000, 7600000, 10.53, 9, 4.5, 'https://placehold.co/600x400?text=Foreo+FAQ+202', 4, 1, 'FOREO-FAQ202-001', 24, '24 tháng bảo hành chính hãng', 'Thụy Điển', 'new', 'Mọi loại da', 'Thư giãn, Chăm sóc da đầu', 'AVAILABLE', 12, 4, 260, false, NULL, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (36, 'NuFace Sculpt Neck Toning Device', 'nuface-sculpt-neck-toning-device', 'Thiết bị định hình vùng cổ và hàm bằng microcurrent.', '<p>Sculpt Neck Toning Device phù hợp demo nhóm khách hàng có nhu cầu nâng cơ vùng cổ.</p>', 7600000, 8500000, 10.59, 10, 4.8, 'https://placehold.co/600x400?text=NuFace+Neck+Toning', 2, 2, 'NUFACE-NECKTONE-001', 12, '12 tháng bảo hành chính hãng', 'Mỹ', 'new', 'Mọi loại da', 'Chảy xệ vùng cổ, Cằm nọng', 'AVAILABLE', 18, 6, 400, true, 620000, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (37, 'CurrentBody Skin Tone Corrector Pro', 'currentbody-skin-tone-corrector-pro', 'Thiết bị hỗ trợ cải thiện đốm nâu và sắc tố không đều.', '<p>Skin Tone Corrector Pro phù hợp nhóm khách hàng quan tâm sắc tố và bề mặt da.</p>', 6500000, 7300000, 10.96, 11, 4.5, 'https://placehold.co/600x400?text=CurrentBody+Tone+Pro', 3, 5, 'CB-TONEPRO-001', 24, '24 tháng bảo hành chính hãng', 'Anh', 'new', 'Da thường, Da hỗn hợp', 'Đốm nâu, Không đều màu', 'AVAILABLE', 17, 5, 360, false, NULL, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (38, 'Panasonic Smooth Peel Micro Polish', 'panasonic-smooth-peel-micro-polish', 'Thiết bị micro polish hỗ trợ làm mịn bề mặt da tại nhà.', '<p>Thiết bị này mở rộng nhóm exfoliating để fuzzy TOPSIS có nhiều lựa chọn hơn.</p>', 2850000, 3350000, 14.93, 19, 4.3, 'https://placehold.co/600x400?text=Panasonic+Micro+Polish', 5, 4, 'PANASONIC-MICROPOLISH-001', 12, '12 tháng bảo hành chính hãng', 'Nhật Bản', 'new', 'Da thường, Da dầu', 'Tẩy da chết nhẹ, Làm mịn da', 'AVAILABLE', 21, 7, 470, false, NULL, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (39, 'Philips LumiLift Cooling Wand', 'philips-lumilift-cooling-wand', 'Thiết bị massage lạnh hỗ trợ giảm sưng và làm dịu da.', '<p>LumiLift Cooling Wand là lựa chọn phù hợp cho da nhạy cảm sau treatment.</p>', 3050000, 3550000, 14.08, 20, 4.4, 'https://placehold.co/600x400?text=Philips+LumiLift', 4, 3, 'PHILIPS-LUMILIFT-001', 18, '18 tháng bảo hành chính hãng', 'Hà Lan', 'new', 'Da nhạy cảm, Da thường', 'Làm dịu, Giảm sưng', 'AVAILABLE', 25, 8, 520, true, 310000, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (40, 'Foreo KIWI Blackhead Remover 2', 'foreo-kiwi-blackhead-remover-2', 'Thiết bị hút mụn đầu đen và hỗ trợ làm sạch lỗ chân lông.', '<p>KIWI Blackhead Remover 2 là sản phẩm phù hợp cho nhu cầu da dầu, dễ nhìn thấy hiệu quả khi demo.</p>', 3400000, 3950000, 13.92, 17, 4.2, 'https://placehold.co/600x400?text=Foreo+KIWI+2', 5, 1, 'FOREO-KIWI2-001', 24, '24 tháng bảo hành chính hãng', 'Thụy Điển', 'new', 'Da dầu, Da hỗn hợp', 'Đầu đen, Lỗ chân lông to', 'AVAILABLE', 28, 9, 710, true, 280000, NULL, NOW(), NOW(), 'seed-demo', 'seed-demo')
ON CONFLICT (id) DO NOTHING;

UPDATE devices
SET image = 'https://res.cloudinary.com/dcisx0vss/image/upload/q_auto/f_auto/v1779702056/Mat-na-den-LED-tre-hoa-lan-da-den-LED-7-mau-quang-pho-WCL22-4_xknqic.jpg'
WHERE id = 4;
UPDATE devices
SET 
    skin_type = CASE 
        WHEN id IN (1, 4, 9) THEN 'Da dầu'
        WHEN id IN (5)       THEN 'Da khô'
        WHEN id IN (6, 7)    THEN 'Da hỗn hợp'
        WHEN id IN (10)      THEN 'Da nhạy cảm'
        ELSE 'Da thường'
  END
WHERE id BETWEEN 1 AND 10;


-- =============================================================
-- 8. DEVICE_IMAGES (element collection)
-- =============================================================
INSERT INTO device_images (device_id, image_url) VALUES
  (1, 'https://placehold.co/600x400?text=LUNA4-img1'),
  (1, 'https://placehold.co/600x400?text=LUNA4-img2'),
  (2, 'https://placehold.co/600x400?text=NuFace-img1'),
  (2, 'https://placehold.co/600x400?text=NuFace-img2'),
  (3, 'https://placehold.co/600x400?text=LED-img1'),
  (3, 'https://placehold.co/600x400?text=LED-img2'),
  (4, 'https://placehold.co/600x400?text=Philips-img1'),
  (5, 'https://placehold.co/600x400?text=Panasonic-img1'),
  (6, 'https://placehold.co/600x400?text=LUNAmini-img1'),
  (7, 'https://placehold.co/600x400?text=NuFaceMini-img1')
ON CONFLICT DO NOTHING;

UPDATE device_images
SET image_url = 'https://res.cloudinary.com/dcisx0vss/image/upload/q_auto/f_auto/v1776492129/shopping_b5cn7u.webp';

-- =============================================================
-- 9. DEVICE_TAGS (element collection)
-- =============================================================
-- 1. Ép mã hóa UTF8 cho kết nối này
SET client_encoding = 'UTF8';

-- 2. Xóa dữ liệu lỗi cũ của 10 máy
DELETE FROM device_tags WHERE device_id BETWEEN 1 AND 10;

-- 3. Chèn lại dữ liệu chuẩn UTF-8
INSERT INTO device_tags (device_id, tag) VALUES 
(1, 'sạch sâu'), (1, 'sóng âm'), (1, 'an toàn'), (1, 'tiện lợi'), 
(2, 'nâng cơ'), (2, 'săn chắc'), (2, 'thon gọn mặt'), (2, 'công nghệ cao'), 
(3, 'ánh sáng đỏ'), (3, 'LED'), (3, 'collagen'), (3, 'best-seller'), 
(4, 'trẻ hóa'), (4, 'trị mụn'), (4, 'phục hồi'), 
(5, 'massage'), (5, 'tiện lợi'), (5, 'trẻ hóa'), 
(6, 'làm sạch'), (6, 'sóng âm'), (6, 'tiện lợi'), 
(7, 'nâng cơ'), (7, 'trẻ hóa'), (7, 'công nghệ sóng âm'), (7, 'best-seller'), 
(8, 'IPL'), (8, 'tone da'), (8, 'CurrentBody'), 
(9, 'tẩy tế bào chết'), (9, 'sạch sâu'), (9, 'đều màu da'), 
(10,'nano current'), (10,'ZIIP'), (10,'chuyên nghiệp')
ON CONFLICT DO NOTHING;


-- =============================================================
-- 10. DEVICE_SPECIFICATIONS (element collection)
-- =============================================================
-- 1. Ép kiểu mã hóa UTF8 cho phiên làm việc này
SET client_encoding = 'UTF8';

-- 2. Xóa dữ liệu lỗi cũ
DELETE FROM device_specifications WHERE device_id IN (1, 2, 3, 4, 5, 9, 10);

-- 3. Chèn lại dữ liệu chuẩn
INSERT INTO device_specifications (device_id, spec_label, spec_value) VALUES 
(1, 'Tần số rung', '8000 rung/phút'),
(1, 'Chế độ sử dụng', '16 chế độ'),
(1, 'Thời lượng pin', '300 lần sử dụng'),
(1, 'Chất liệu', 'Silicone y tế'),
(2, 'Cường độ dòng điện','335 microamperes'),
(2, 'Tần số', '335Hz'),
(2, 'Đầu điều trị', 'Cầu nối đôi'),
(3, 'Bước sóng đỏ', '633nm'),
(3, 'Bước sóng NIR', '830nm'),
(3, 'Thời gian điều trị','10 phút/lần'),
(4, 'Tốc độ rung', '7600 rung/phút'),
(4, 'Đầu làm sạch', 'Lông mềm siêu nhỏ'),
(5, 'Công nghệ', 'Ion âm + siêu âm'),
(5, 'Chế độ', '2 chế độ ion'),
(9, 'Đĩa tinh thể', '3 cấp độ thô ráp'),
(9, 'Tốc độ hút', '4 mức'),
(10,'Tần số nano', '100-2000Hz'),
(10,'Chế độ AI', '8 chương trình');





-- =============================================================
-- 11. CARTS (1 per client account)
-- =============================================================
INSERT INTO carts (id, account_id, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 4, NOW(), NOW(), 'seed', 'seed'),
  (2, 5, NOW(), NOW(), 'seed', 'seed'),
  (3, 6, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 12. CART_ITEMS
-- =============================================================
INSERT INTO cart_items (id, cart_id, device_id, quantity, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 1, 1, 1, NOW(), NOW(), 'seed', 'seed'),
  (2, 1, 6, 2, NOW(), NOW(), 'seed', 'seed'),
  (3, 2, 2, 1, NOW(), NOW(), 'seed', 'seed'),
  (4, 3, 4, 1, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 13. VOUCHERS
-- =============================================================
INSERT INTO vouchers (id, code, description, voucher_type, discount_value, min_order_value, max_discount, total_quantity, used_quantity, start_date, end_date, status, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 'WELCOME10',  'Giảm 10% cho khách hàng mới',             'PERCENTAGE',    10.00, 500000,  200000, 100, 3,  NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days', 'ACTIVE', NOW(), NOW(), 'seed', 'seed'),
  (2, 'SALE200K',   'Giảm 200.000đ cho đơn từ 2 triệu',        'FIXED_AMOUNT', 200000, 2000000, NULL,   50,  5,  NOW() - INTERVAL '7 days',  NOW() + INTERVAL '30 days', 'ACTIVE', NOW(), NOW(), 'seed', 'seed'),
  (3, 'SKINCARE15', 'Giảm 15% cho thiết bị chăm sóc da',       'PERCENTAGE',    15.00, 1000000, 500000, 200, 0,  NOW() - INTERVAL '1 day',   NOW() + INTERVAL '90 days', 'ACTIVE', NOW(), NOW(), 'seed', 'seed'),
  (4, 'BOOKING50K', 'Giảm 50.000đ cho booking trải nghiệm',    'FIXED_AMOUNT',  50000, 200000,  NULL,   50,  2,  NOW() - INTERVAL '14 days', NOW() + INTERVAL '45 days', 'ACTIVE', NOW(), NOW(), 'seed', 'seed'),
  (5, 'EXPIRE2024', 'Voucher hết hạn (test)',                   'PERCENTAGE',     5.00, 100000,  NULL,   10,  10, NOW() - INTERVAL '90 days', NOW() - INTERVAL '1 day',   'EXPIRED',NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 14. ORDERS
-- =============================================================
INSERT INTO orders (id, order_code, account_id, subtotal, discount_amount, shipping_fee, tax_amount, total_amount, status, payment_status, payment_method, voucher_id, shipping_address, receiver_name, receiver_phone, shipping_city, shipping_country, note, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 'ORD-2024-001', 4, 3200000, 320000, 30000, 0, 2910000, 'COMPLETED',      'SUCCESS',   'E_WALLET',     1,    '123 Nguyễn Trãi, Phường 3, Quận 5',            'Nguyễn Thị Ánh', '0933111222', 'TP. Hồ Chí Minh', 'Việt Nam', NULL,                   NOW() - INTERVAL '30 days', NOW() - INTERVAL '25 days', 'seed', 'seed'),
  (2, 'ORD-2024-002', 5, 5500000, 0,      30000, 0, 5530000, 'PROCESSING',     'SUCCESS',   'CARD',         NULL, '789 Trần Phú, Phường 4, Quận Hải Châu',        'Trần Thị Bích',  '0944222333', 'Đà Nẵng',         'Việt Nam', NULL,                   NOW() - INTERVAL '5 days',  NOW() - INTERVAL '3 days',  'seed', 'seed'),
  (3, 'ORD-2024-003', 4, 8900000, 0,      30000, 0, 8930000, 'PAID',           'SUCCESS',   'BANK_TRANSFER',NULL, '123 Nguyễn Trãi, Phường 3, Quận 5',            'Nguyễn Thị Ánh', '0933111222', 'TP. Hồ Chí Minh', 'Việt Nam', NULL,                   NOW() - INTERVAL '2 days',  NOW() - INTERVAL '1 day',   'seed', 'seed'),
  (4, 'ORD-2024-004', 6, 1850000, 200000, 30000, 0, 1680000, 'PENDING_PAYMENT','INITIATED', 'COD',          2,    '10 Lý Tự Trọng, Phường Bến Nghé, Quận 1',     'Lê Văn Cường',   '0955333444', 'TP. Hồ Chí Minh', 'Việt Nam', 'Giao buổi sáng',      NOW() - INTERVAL '1 day',   NOW(),                      'seed', 'seed'),
  (5, 'ORD-2024-005', 5, 3200000, 0,      30000, 0, 3230000, 'CANCELLED',      'CANCELLED', 'E_WALLET',     NULL, '789 Trần Phú, Phường 4, Quận Hải Châu',        'Trần Thị Bích',  '0944222333', 'Đà Nẵng',         'Việt Nam', 'Hủy do thay đổi ý kiến', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 15. ORDER_ITEMS
-- =============================================================
INSERT INTO order_items (id, order_id, device_id, service_id, quantity, unit_price, discount_price, total_price, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 1, 1, NULL, 1, 3200000, 2880000, 2880000, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', 'seed', 'seed'),
  (2, 2, 2, NULL, 1, 5500000, 5500000, 5500000, NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days',  'seed', 'seed'),
  (3, 3, 3, NULL, 1, 8900000, 8900000, 8900000, NOW() - INTERVAL '2 days',  NOW() - INTERVAL '2 days',  'seed', 'seed'),
  (4, 4, 4, NULL, 1, 1850000, 1850000, 1850000, NOW() - INTERVAL '1 day',   NOW() - INTERVAL '1 day',   'seed', 'seed'),
  (5, 5, 7, NULL, 1, 3200000, 3200000, 3200000, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;


-- =============================================================
-- 16. SERVICE_CATEGORY
-- =============================================================
INSERT INTO service_category (id, name, slug, image_url, description, parent_id, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 'Chăm sóc da mặt',       'cham-soc-da-mat',       'https://placehold.co/200x200?text=FaceCare',    'Các dịch vụ chăm sóc da mặt chuyên sâu',  NULL, NOW(), NOW(), 'seed', 'seed'),
  (2, 'Trị liệu công nghệ cao', 'tri-lieu-cong-nghe-cao','https://placehold.co/200x200?text=HiTech',      'Trị liệu bằng công nghệ hiện đại',        NULL, NOW(), NOW(), 'seed', 'seed'),
  (3, 'Massage & Thư giãn',     'massage-thu-gian',      'https://placehold.co/200x200?text=Massage',     'Dịch vụ massage và thư giãn',             NULL, NOW(), NOW(), 'seed', 'seed'),
  (4, 'Làm sạch & Tẩy tế bào', 'lam-sach-tay-te-bao',  'https://placehold.co/200x200?text=Cleansing',   'Dịch vụ làm sạch sâu và tẩy tế bào chết', 1,    NOW(), NOW(), 'seed', 'seed'),
  (5, 'Trẻ hóa & Chống lão hóa','tre-hoa-chong-lao-hoa','https://placehold.co/200x200?text=AntiAging',   'Dịch vụ trẻ hóa da',                      1,    NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 17. SERVICE
-- =============================================================
INSERT INTO service (id, category_id, name, slug, description, image_url, duration_minutes, base_price, status, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 4, 'Làm sạch da chuyên sâu với Foreo LUNA',       'lam-sach-da-chuyen-sau-foreo-luna',        'Trải nghiệm làm sạch da tối ưu với thiết bị Foreo LUNA 4',         'https://placehold.co/600x400?text=Service1', 60,  350000,  'ACTIVE', NOW(), NOW(), 'seed', 'seed'),
  (2, 5, 'Nâng cơ mặt với NuFace Trinity',              'nang-co-mat-nuface-trinity',               'Điều trị nâng cơ mặt bằng công nghệ microcurrent NuFace Trinity',   'https://placehold.co/600x400?text=Service2', 45,  500000,  'ACTIVE', NOW(), NOW(), 'seed', 'seed'),
  (3, 2, 'Trị liệu ánh sáng đỏ CurrentBody LED',        'tri-lieu-anh-sang-do-currentbody',         'Kích thích collagen và cải thiện kết cấu da bằng ánh sáng LED',     'https://placehold.co/600x400?text=Service3', 30,  450000,  'ACTIVE', NOW(), NOW(), 'seed', 'seed'),
  (4, 3, 'Massage mặt thư giãn với Panasonic EH-XC15',  'massage-mat-thu-gian-panasonic',           'Massage mặt và cổ với thiết bị ion Panasonic',                      'https://placehold.co/600x400?text=Service4', 45,  300000,  'ACTIVE', NOW(), NOW(), 'seed', 'seed'),
  (5, 4, 'Tẩy tế bào chết chuyên nghiệp PMD',           'tay-te-bao-chet-chuyen-nghiep-pmd',       'Tẩy tế bào chết sâu với công nghệ microdermabrasion',               'https://placehold.co/600x400?text=Service5', 60,  400000,  'ACTIVE', NOW(), NOW(), 'seed', 'seed'),
  (6, 5, 'Trẻ hóa nano current với ZIIP',               'tre-hoa-nano-current-ziip',               'Trẻ hóa da từ sâu bên trong với công nghệ nano và microcurrent',     'https://placehold.co/600x400?text=Service6', 60,  700000,  'ACTIVE', NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 18. SERVICE_DEVICE_MAP
-- =============================================================
INSERT INTO service_device_map (service_id, device_id) VALUES
  (1, 1), (1, 6),
  (2, 2), (2, 7),
  (3, 3),
  (4, 5),
  (5, 9),
  (6, 10)
ON CONFLICT DO NOTHING;

-- =============================================================
-- 19. EXPERIENCE_SESSIONS
-- =============================================================
TRUNCATE TABLE experience_sessions CASCADE;

INSERT INTO experience_sessions (id, service_id, device_id, branch_name, location_detail, session_date, start_time, end_time, max_slots, available_slots, booked_slots, status, price_per_slot, created_by_admin_id, staff_id, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 1, 1, 'Carevia Chi nhánh Q1',   'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM', NOW()::DATE + 3, '09:00', '10:00', 5, 3, 2, 'OPEN',   350000, 7, 2, NOW(), NOW(), 'seed', 'seed'),
  (2, 2, 2, 'Carevia Chi nhánh Q1',   'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM', NOW()::DATE + 3, '10:30', '11:15', 5, 4, 1, 'OPEN',   500000, 7, 2, NOW(), NOW(), 'seed', 'seed'),
  (3, 3, 3, 'Carevia Chi nhánh Q3',   'Tầng 2, 88 Võ Văn Tần, Quận 3, TP.HCM', NOW()::DATE + 5, '14:00', '14:30', 8, 5, 3, 'OPEN',   450000, 7, 2, NOW(), NOW(), 'seed', 'seed'),
  (4, 4, 5, 'Carevia Chi nhánh Q7',   'Tầng 1, 45 Nguyễn Thị Thập, Quận 7',    NOW()::DATE + 7, '09:00', '09:45', 6, 6, 0, 'OPEN',   300000, 7, 2, NOW(), NOW(), 'seed', 'seed'),
  (5, 5, 9, 'Carevia Chi nhánh Q1',   'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM', NOW()::DATE + 10,'13:00','14:00', 4, 2, 2, 'OPEN',   400000, 7, 2, NOW(), NOW(), 'seed', 'seed'),
  (6, 6, 10,'Carevia Chi nhánh Q3',   'Tầng 2, 88 Võ Văn Tần, Quận 3, TP.HCM', NOW()::DATE + 14,'15:00','16:00', 3, 3, 0, 'OPEN',   700000, 7, 2, NOW(), NOW(), 'seed', 'seed'),
  (7, 1, 6, 'Carevia Chi nhánh Q7',   'Tầng 1, 45 Nguyễn Thị Thập, Quận 7',    NOW()::DATE + 1, '08:00', '09:00', 5, 5, 0, 'OPEN',   350000, 7, 2, NOW(), NOW(), 'seed', 'seed'),
  (8, 2, 7, 'Carevia Chi nhánh Q1',   'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM', NOW()::DATE - 3, '10:00','10:45', 5, 0, 5, 'FULL',   500000, 7, 2, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- Bước 1: Gỡ bỏ luật bắt buộc nhập (NOT NULL) của cột Admin
ALTER TABLE experience_sessions ALTER COLUMN created_by_admin_id DROP NOT NULL;

-- Bước 2: Gỡ bỏ luật bắt buộc nhập của cột Dịch vụ (Nếu form của bạn không chọn dịch vụ)
ALTER TABLE experience_sessions ALTER COLUMN service_id DROP NOT NULL;


-- Lệnh đồng bộ lại bộ đếm tự sinh của PostgreSQL phiên bản mới
SELECT setval(
    pg_get_serial_sequence('experience_sessions', 'id'), 
    COALESCE(MAX(id), 0) + 1, 
    false
) FROM experience_sessions;

INSERT INTO experience_sessions (id, service_id, device_id, branch_name, location_detail, session_date, start_time, end_time, max_slots, available_slots, booked_slots, status, price_per_slot, created_by_admin_id, staff_id, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 1, 1, 'Carevia Chi nhánh Q1',   'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM', NOW()::DATE + 3, '09:00', '10:00', 5, 3, 2, 'OPEN',   350000, 7, 2, NOW(), NOW(), 'seed', 'seed'),
  (2, 2, 11, 'Carevia Chi nhánh Q1',   'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM', NOW()::DATE + 3, '10:30', '11:15', 5, 4, 1, 'OPEN',   500000, 7, 2, NOW(), NOW(), 'seed', 'seed'),
  (3, 3, 16, 'Carevia Chi nhánh Q3',   'Tầng 2, 88 Võ Văn Tần, Quận 3, TP.HCM', NOW()::DATE + 5, '14:00', '14:30', 8, 5, 3, 'OPEN',   450000, 7, 2, NOW(), NOW(), 'seed', 'seed'),
  (4, 4, 22, 'Carevia Chi nhánh Q7',   'Tầng 1, 45 Nguyễn Thị Thập, Quận 7',    NOW()::DATE + 7, '09:00', '09:45', 6, 6, 0, 'OPEN',   300000, 7, 2, NOW(), NOW(), 'seed', 'seed'),
  (5, 5, 25, 'Carevia Chi nhánh Q1',   'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM', NOW()::DATE + 10,'13:00','14:00', 4, 2, 2, 'OPEN',   400000, 7, 2, NOW(), NOW(), 'seed', 'seed'),
  (6, 6, 30,'Carevia Chi nhánh Q3',   'Tầng 2, 88 Võ Văn Tần, Quận 3, TP.HCM', NOW()::DATE + 14,'15:00','16:00', 3, 3, 0, 'OPEN',   700000, 7, 2, NOW(), NOW(), 'seed', 'seed'),
  (7, 1, 35, 'Carevia Chi nhánh Q7',   'Tầng 1, 45 Nguyễn Thị Thập, Quận 7',    NOW()::DATE + 1, '08:00', '09:00', 5, 5, 0, 'OPEN',   350000, 7, 2, NOW(), NOW(), 'seed', 'seed'),
  (8, 2, 40, 'Carevia Chi nhánh Q1',   'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM', NOW()::DATE - 3, '10:00','10:45', 5, 0, 5, 'FULL',   500000, 7, 2, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 20. BOOKINGS
-- =============================================================
INSERT INTO bookings (id, booking_code, account_id, session_id, device_id, appointment_date, start_time, end_time, status, total_price, discount_amount, voucher_id, customer_note, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 'BK-2024-001', 4, 1, 1, NOW()::DATE + 3, '09:00', '10:00', 'CONFIRMED',      350000, 0,      NULL, 'Vui lòng nhắc tôi 1 tiếng trước',  NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day',  'seed', 'seed'),
  (2, 'BK-2024-002', 5, 2, 2, NOW()::DATE + 3, '10:30', '11:15', 'PENDING_CONFIRM', 500000, 50000, 4,   NULL,                                NOW() - INTERVAL '1 day',  NOW() - INTERVAL '1 day',  'seed', 'seed'),
  (3, 'BK-2024-003', 4, 3, 3, NOW()::DATE + 5, '14:00', '14:30', 'CONFIRMED',       450000, 0,     NULL, NULL,                                NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'seed', 'seed'),
  (4, 'BK-2024-004', 6, 4, 5, NOW()::DATE + 7, '09:00', '09:45', 'PENDING_CONFIRM', 300000, 0,     NULL, 'Lần đầu thử',                      NOW(), NOW(), 'seed', 'seed'),
  (5, 'BK-2024-005', 5, 8, 2, NOW()::DATE - 3, '10:00', '10:45', 'COMPLETED',       500000, 0,     NULL, NULL,                                NOW() - INTERVAL '10 days',NOW() - INTERVAL '3 days', 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 21. BOOKING_HISTORY
-- =============================================================
INSERT INTO booking_history (id, booking_id, old_status, new_status, change_reason, changed_by, changed_at)
VALUES
  (1, 1, 'PENDING_CONFIRM', 'CONFIRMED', NULL, 1, NOW() - INTERVAL '1 day'),
  (2, 3, 'PENDING_CONFIRM', 'CONFIRMED', NULL, 1, NOW() - INTERVAL '2 days'),
  (3, 5, 'PENDING_CONFIRM', 'CONFIRMED', NULL, 1, NOW() - INTERVAL '9 days'),
  (4, 5, 'CONFIRMED',       'COMPLETED', NULL, 2, NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 22. BOOKING_ITEM
-- =============================================================
INSERT INTO booking_item (id, booking_id, device_id, service_id, price, quantity, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 1, 1, 1, 350000, 1, NOW(), NOW(), 'seed', 'seed'),
  (2, 2, 2, 2, 500000, 1, NOW(), NOW(), 'seed', 'seed'),
  (3, 3, 3, 3, 450000, 1, NOW(), NOW(), 'seed', 'seed'),
  (4, 4, 5, 4, 300000, 1, NOW(), NOW(), 'seed', 'seed'),
  (5, 5, 2, 2, 500000, 1, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 23. PAYMENT_TRANSACTIONS
-- =============================================================
INSERT INTO payment_transactions (id, order_id, external_transaction_id, amount, currency, payment_method, status, provider_response, ip_address, transaction_at, completed_at)
VALUES
  (1, 1, 'ZALO-TXN-20240301-001',   2910000, 'VND', 'E_WALLET',     'SUCCESS', '{"code":"1","message":"Success"}', '127.0.0.1', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (2, 2, 'STRIPE-TXN-20240405-002', 5530000, 'VND', 'CARD',         'SUCCESS', '{"status":"succeeded"}',           '127.0.0.1', NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days'),
  (3, 3, 'BANK-TXN-20240503-003',   8930000, 'VND', 'BANK_TRANSFER','SUCCESS', '{"ref":"BNK123456"}',              '127.0.0.1', NOW() - INTERVAL '2 days',  NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 24. NOTIFICATIONS
-- =============================================================
INSERT INTO notifications (id, account_id, status, title, content, type, target_url, reference_type, reference_id, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 1, 'SENT', 'Đơn hàng đã được xác nhận',          'Đơn hàng ORD-2024-001 của bạn đã được xác nhận và đang xử lý.',          'ORDER',   '/client/orders/1',    'ORDER',   1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', 'seed', 'seed'),
  (2, 1, 'SENT', 'Đơn hàng đã giao thành công',         'Đơn hàng ORD-2024-001 đã được giao thành công. Cảm ơn bạn!',             'ORDER',   '/client/orders/1',    'ORDER',   1, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', 'seed', 'seed'),
  (3, 1, 'SENT', 'Booking đã được xác nhận',            'Booking BK-2024-005 của bạn đã được xác nhận.',                          'BOOKING', '/client/bookings/5',  'BOOKING', 5, NOW() - INTERVAL '9 days',  NOW() - INTERVAL '9 days',  'seed', 'seed'),
  (4, 1, 'SENT', 'Nhắc nhở booking sắp đến',            'Bạn có lịch trải nghiệm ngày mai lúc 09:00 tại Carevia Q1.',             'BOOKING', '/client/bookings/1',  'BOOKING', 1, NOW() - INTERVAL '1 day',   NOW() - INTERVAL '1 day',   'seed', 'seed'),
  (5, 1, 'SENT', 'Ưu đãi đặc biệt dành cho bạn',        'Voucher SKINCARE15 giảm 15% đang chờ bạn sử dụng!',                     'PROMO',   '/client/vouchers',    NULL,      NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'seed', 'seed'),
  (6, 1, 'SENT', 'Bạn có lịch điều trị mới',            'Bạn được phân công điều trị cho session ngày ' || (NOW()::DATE + 3)::TEXT, 'SYSTEM', '/staff/sessions',    NULL,      NULL, NOW() - INTERVAL '1 day',  NOW() - INTERVAL '1 day',  'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 25. NOTIFICATION_RECIPIENT
-- =============================================================
INSERT INTO notification_recipient (id, notification_id, account_id, is_read, read_at, is_deleted, sent_via_web, sent_via_email, sent_via_app_push)
VALUES
  (1, 1, 4, true,  NOW() - INTERVAL '29 days', false, true, true,  false),
  (2, 2, 4, true,  NOW() - INTERVAL '24 days', false, true, true,  false),
  (3, 3, 5, true,  NOW() - INTERVAL '8 days',  false, true, false, false),
  (4, 4, 4, false, NULL,                        false, true, false, false),
  (5, 5, 4, false, NULL,                        false, true, false, false),
  (6, 6, 2, false, NULL,                        false, true, true,  false)
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 26. NOTIFICATION_SETTING
-- =============================================================
INSERT INTO notification_setting (id, account_id, noti_type, enable_web, enable_email, enable_app_push, enable_sms, updated_at)
VALUES
  (1, 4, 'ORDER',   true,  true,  false, false, NOW()),
  (2, 4, 'BOOKING', true,  true,  false, false, NOW()),
  (3, 4, 'PROMO',   true,  false, false, false, NOW()),
  (4, 5, 'ORDER',   true,  true,  false, false, NOW()),
  (5, 5, 'BOOKING', true,  true,  false, false, NOW()),
  (6, 6, 'ORDER',   true,  false, false, false, NOW()),
  (7, 2, 'BOOKING', true,  true,  false, false, NOW()),
  (8, 2, 'SYSTEM',  true,  true,  false, false, NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 27. WISHLISTS
-- =============================================================
INSERT INTO wishlists (id, account_id, device_id, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 4, 2,  NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', 'seed', 'seed'),
  (2, 4, 3,  NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', 'seed', 'seed'),
  (3, 5, 1,  NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', 'seed', 'seed'),
  (4, 5, 7,  NOW() - INTERVAL '8 days',  NOW() - INTERVAL '8 days',  'seed', 'seed'),
  (5, 6, 4,  NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days',  'seed', 'seed'),
  (6, 6, 10, NOW() - INTERVAL '2 days',  NOW() - INTERVAL '2 days',  'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 28. REVIEW
-- =============================================================
INSERT INTO review (id, account_id, device_id, service_id, order_id, rating, effectiveness_rating, safety_rating, ergonomics_rating, durability_rating, comment, is_verified_purchase, is_hidden, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 4, 1,    NULL, 1, 5, 5, 5, 4, 5, 'Sản phẩm tuyệt vời! Da tôi sạch hơn hẳn sau 2 tuần sử dụng. Rất đáng tiền.',  true,  false, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', 'seed', 'seed'),
  (2, 5, 2,    NULL, 2, 5, 5, 4, 5, 5, 'NuFace Trinity thực sự hiệu quả. Mặt tôi nâng cơ rõ ràng sau 1 tháng!',         true,  false, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', 'seed', 'seed'),
  (3, 4, NULL, 1,    NULL, 4, 4, 5, 4, 4, 'Dịch vụ tốt, nhân viên chuyên nghiệp. Tuy nhiên không gian hơi nhỏ.',        false, false, NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days',  'seed', 'seed'),
  (4, 6, 7,    NULL, NULL, 5, 5, 4, 5, 4, 'Thiết bị hoạt động tốt, giao hàng nhanh và cảm giác dùng rất ổn định.',     false, false, NOW() - INTERVAL '3 days',  NOW() - INTERVAL '3 days',  'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 29. RECOMMENDATION_LOG
-- =============================================================
INSERT INTO recommendation_log (id, account_id, device_id, rule_code, score, created_at)
VALUES
  (1, 4, 2,  'SKIN_TYPE_MATCH',    92, NOW() - INTERVAL '5 days'),
  (2, 4, 3,  'CATEGORY_COLLAB',    88, NOW() - INTERVAL '5 days'),
  (3, 4, 7,  'PURCHASE_HISTORY',   85, NOW() - INTERVAL '5 days'),
  (4, 5, 1,  'SKIN_TYPE_MATCH',    90, NOW() - INTERVAL '3 days'),
  (5, 5, 6,  'CATEGORY_COLLAB',    82, NOW() - INTERVAL '3 days'),
  (6, 6, 4,  'PURCHASE_HISTORY',   78, NOW() - INTERVAL '1 day'),
  (7, 6, 5,  'SKIN_CONCERN_MATCH', 75, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 30. SEARCH_HISTORY
-- =============================================================
INSERT INTO search_history (id, account_id, keyword, searched_at)
VALUES
  (1, 4, 'máy nâng cơ nuface',             NOW() - INTERVAL '5 days'),
  (2, 4, 'thiết bị led trị liệu da',       NOW() - INTERVAL '4 days'),
  (3, 4, 'booking trải nghiệm foreo',      NOW() - INTERVAL '3 days'),
  (4, 5, 'máy chăm sóc da nhạy cảm',       NOW() - INTERVAL '3 days'),
  (5, 5, 'thiết bị chống lão hóa tại nhà', NOW() - INTERVAL '2 days'),
  (6, 6, 'máy rửa mặt da dầu',             NOW() - INTERVAL '1 day'),
  (7, 6, 'thiết bị giảm thâm mụn',         NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 31. USER_BEHAVIORS
-- =============================================================
INSERT INTO user_behaviors (id, account_id, action_type, target_type, target_id, metadata, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 4, 'VIEW',         'DEVICE',  '1',  '{"duration_sec":45}',                     NOW() - INTERVAL '35 days', NOW(), 'seed', 'seed'),
  (2, 4, 'ADD_TO_CART',  'DEVICE',  '1',  '{"quantity":1}',                          NOW() - INTERVAL '32 days', NOW(), 'seed', 'seed'),
  (3, 4, 'PURCHASE',     'DEVICE',  '1',  '{"order_id":1,"amount":3200000}',         NOW() - INTERVAL '30 days', NOW(), 'seed', 'seed'),
  (4, 4, 'VIEW',         'DEVICE',  '3',  '{"duration_sec":120}',                    NOW() - INTERVAL '12 days', NOW(), 'seed', 'seed'),
  (5, 4, 'ADD_TO_WISHLIST','DEVICE','2',  '{}',                                      NOW() - INTERVAL '20 days', NOW(), 'seed', 'seed'),
  (6, 5, 'VIEW',         'DEVICE',  '2',  '{"duration_sec":90}',                     NOW() - INTERVAL '10 days', NOW(), 'seed', 'seed'),
  (7, 5, 'PURCHASE',     'DEVICE',  '2',  '{"order_id":2,"amount":5500000}',         NOW() - INTERVAL '5 days',  NOW(), 'seed', 'seed'),
  (8, 6, 'VIEW',         'DEVICE',  '4',  '{"duration_sec":60}',                     NOW() - INTERVAL '9 days',  NOW(), 'seed', 'seed'),
  (9, 6, 'ADD_TO_CART',  'DEVICE',  '4',  '{"quantity":1}',                          NOW() - INTERVAL '1 day',   NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 32. EMAIL_VERIFICATION
-- =============================================================
INSERT INTO email_verification (id, account_id, token_hash, token_type, expires_at, is_used, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 4, 'hash_email_verify_client1_used',      'VERIFY_EMAIL',   NOW() - INTERVAL '29 days', true,  NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', 'seed', 'seed'),
  (2, 5, 'hash_email_verify_client2_used',      'VERIFY_EMAIL',   NOW() - INTERVAL '29 days', true,  NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', 'seed', 'seed'),
  (3, 6, 'hash_email_verify_client3_used',      'VERIFY_EMAIL',   NOW() - INTERVAL '14 days', true,  NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', 'seed', 'seed'),
  (4, 6, 'hash_password_reset_client3_expired', 'RESET_PASSWORD', NOW() - INTERVAL '1 hour',  false, NOW() - INTERVAL '2 days',  NOW() - INTERVAL '2 days',  'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 33. SYSTEM_SETTING
-- =============================================================
INSERT INTO system_setting (id, key_name, value_text, description, updated_at)
VALUES
  (1,  'PLATFORM_NAME',             'Carevia',            'Tên thương hiệu của nền tảng',                  NOW()),
  (2,  'SUPPORT_EMAIL',             'support@carevia.vn', 'Email hỗ trợ khách hàng',                       NOW()),
  (3,  'SUPPORT_PHONE',             '1900 1234',          'Số điện thoại hotline hỗ trợ',                  NOW()),
  (4,  'SHIPPING_FEE_DEFAULT',      '30000',              'Phí vận chuyển mặc định (VND)',                  NOW()),
  (5,  'FREE_SHIPPING_THRESHOLD',   '2000000',            'Giá trị đơn hàng được miễn phí ship (VND)',      NOW()),
  (6,  'POINTS_PER_VND',            '0.001',              'Số điểm thưởng trên 1 VND chi tiêu',            NOW()),
  (7,  'BOOKING_CANCEL_HOURS',      '24',                 'Số giờ tối thiểu trước khi có thể hủy booking', NOW()),
  (8,  'MAX_CART_QUANTITY',         '10',                 'Số lượng tối đa 1 sản phẩm trong giỏ hàng',     NOW()),
  (9,  'MAINTENANCE_MODE',          'false',              'Bật/tắt chế độ bảo trì hệ thống',               NOW()),
  (10, 'DEFAULT_LANG',              'vi',                 'Ngôn ngữ mặc định của hệ thống',                 NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 34. AUDIT_LOG
-- =============================================================
INSERT INTO audit_log (id, table_name, record_id, action, changed_data, user_account_id, ip_address, created_at)
VALUES
  (1, 'accounts', '4', 'INSERT', '{"event":"account_created","role":"CLIENT"}',          1, '127.0.0.1', NOW() - INTERVAL '30 days'),
  (2, 'orders',   '1', 'INSERT', '{"event":"order_created","total":2910000}',             4, '127.0.0.1', NOW() - INTERVAL '30 days'),
  (3, 'orders',   '1', 'UPDATE', '{"event":"order_completed","old_status":"PROCESSING"}', 1, '127.0.0.1', NOW() - INTERVAL '25 days'),
  (4, 'bookings', '1', 'UPDATE', '{"event":"booking_confirmed","old_status":"PENDING"}',  1, '127.0.0.1', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- 35. ACCOUNT_ACTION_LOG
-- =============================================================
INSERT INTO account_action_log (id, account_id, action_type, reason, performed_by, old_status, new_status, ip_address, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 2, 'APPROVE', 'Hồ sơ đầy đủ, chuyên môn phù hợp', 1, 'PENDING_APPROVAL', 'ACTIVE', '127.0.0.1', NOW() - INTERVAL '45 days', NOW(), 'seed', 'seed'),
  (2, 3, 'APPROVE', 'Hồ sơ đầy đủ, bằng cấp hợp lệ',    1, 'PENDING_APPROVAL', 'ACTIVE', '127.0.0.1', NOW() - INTERVAL '40 days', NOW(), 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- Reset sequences để auto-increment tiếp tục đúng
-- =============================================================
SELECT setval('brands_id_seq',              (SELECT MAX(id) FROM brands));
SELECT setval('categories_id_seq',          (SELECT MAX(id) FROM categories));
SELECT setval('accounts_id_seq',            (SELECT MAX(id) FROM accounts));
SELECT setval('staffs_id_seq',              (SELECT MAX(id) FROM staffs));
SELECT setval('clients_id_seq',             (SELECT MAX(id) FROM clients));
SELECT setval('client_addresses_id_seq',    (SELECT MAX(id) FROM client_addresses));
SELECT setval('devices_id_seq',             (SELECT MAX(id) FROM devices));
SELECT setval('carts_id_seq',               (SELECT MAX(id) FROM carts));
SELECT setval('cart_items_id_seq',          (SELECT MAX(id) FROM cart_items));
SELECT setval('vouchers_id_seq',            (SELECT MAX(id) FROM vouchers));
SELECT setval('orders_id_seq',              (SELECT MAX(id) FROM orders));
SELECT setval('order_items_id_seq',         (SELECT MAX(id) FROM order_items));
SELECT setval('service_category_id_seq',    (SELECT MAX(id) FROM service_category));
SELECT setval('service_id_seq',             (SELECT MAX(id) FROM service));
SELECT setval('experience_sessions_id_seq', (SELECT MAX(id) FROM experience_sessions));
SELECT setval('bookings_id_seq',            (SELECT MAX(id) FROM bookings));
SELECT setval('booking_history_id_seq',     (SELECT MAX(id) FROM booking_history));
SELECT setval('booking_item_id_seq',        (SELECT MAX(id) FROM booking_item));
SELECT setval('payment_transactions_id_seq',(SELECT MAX(id) FROM payment_transactions));
SELECT setval('notifications_id_seq',       (SELECT MAX(id) FROM notifications));
SELECT setval('notification_recipient_id_seq',(SELECT MAX(id) FROM notification_recipient));
SELECT setval('notification_setting_id_seq',(SELECT MAX(id) FROM notification_setting));
SELECT setval('wishlists_id_seq',           (SELECT MAX(id) FROM wishlists));
SELECT setval('review_id_seq',              (SELECT MAX(id) FROM review));
SELECT setval('recommendation_log_id_seq',  (SELECT MAX(id) FROM recommendation_log));
SELECT setval('search_history_id_seq',      (SELECT MAX(id) FROM search_history));
SELECT setval('user_behaviors_id_seq',      (SELECT MAX(id) FROM user_behaviors));
SELECT setval('email_verification_id_seq',  (SELECT MAX(id) FROM email_verification));
SELECT setval('system_setting_id_seq',      (SELECT MAX(id) FROM system_setting));
SELECT setval('audit_log_id_seq',           (SELECT MAX(id) FROM audit_log));
SELECT setval('account_action_log_id_seq',  (SELECT MAX(id) FROM account_action_log));

-- Bật lại FK constraints
SET session_replication_role = DEFAULT;

-- Thống kê kết quả
SELECT 'brands' AS tbl, COUNT(*) AS rows FROM brands
UNION ALL SELECT 'categories',          COUNT(*) FROM categories
UNION ALL SELECT 'accounts',            COUNT(*) FROM accounts
UNION ALL SELECT 'staffs',              COUNT(*) FROM staffs
UNION ALL SELECT 'clients',             COUNT(*) FROM clients
UNION ALL SELECT 'client_addresses',    COUNT(*) FROM client_addresses
UNION ALL SELECT 'devices',             COUNT(*) FROM devices
UNION ALL SELECT 'device_images',       COUNT(*) FROM device_images
UNION ALL SELECT 'device_tags',         COUNT(*) FROM device_tags
UNION ALL SELECT 'device_specifications',COUNT(*) FROM device_specifications
UNION ALL SELECT 'carts',               COUNT(*) FROM carts
UNION ALL SELECT 'cart_items',          COUNT(*) FROM cart_items
UNION ALL SELECT 'vouchers',            COUNT(*) FROM vouchers
UNION ALL SELECT 'orders',              COUNT(*) FROM orders
UNION ALL SELECT 'order_items',         COUNT(*) FROM order_items
UNION ALL SELECT 'service_category',    COUNT(*) FROM service_category
UNION ALL SELECT 'service',             COUNT(*) FROM service
UNION ALL SELECT 'service_device_map',  COUNT(*) FROM service_device_map
UNION ALL SELECT 'experience_sessions', COUNT(*) FROM experience_sessions
UNION ALL SELECT 'bookings',            COUNT(*) FROM bookings
UNION ALL SELECT 'booking_history',     COUNT(*) FROM booking_history
UNION ALL SELECT 'booking_item',        COUNT(*) FROM booking_item
UNION ALL SELECT 'payment_transactions',COUNT(*) FROM payment_transactions
UNION ALL SELECT 'notifications',       COUNT(*) FROM notifications
UNION ALL SELECT 'notification_recipient',COUNT(*) FROM notification_recipient
UNION ALL SELECT 'notification_setting',COUNT(*) FROM notification_setting
UNION ALL SELECT 'wishlists',           COUNT(*) FROM wishlists
UNION ALL SELECT 'review',              COUNT(*) FROM review
UNION ALL SELECT 'recommendation_log',  COUNT(*) FROM recommendation_log
UNION ALL SELECT 'search_history',      COUNT(*) FROM search_history
UNION ALL SELECT 'user_behaviors',      COUNT(*) FROM user_behaviors
UNION ALL SELECT 'email_verification',  COUNT(*) FROM email_verification
UNION ALL SELECT 'system_setting',      COUNT(*) FROM system_setting
UNION ALL SELECT 'audit_log',           COUNT(*) FROM audit_log
UNION ALL SELECT 'account_action_log',  COUNT(*) FROM account_action_log
ORDER BY tbl;
