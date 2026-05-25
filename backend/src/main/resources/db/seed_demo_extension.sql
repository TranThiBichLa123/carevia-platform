-- =============================================================
-- CAREVIA PLATFORM - DEMO DATA EXTENSION
-- Bổ sung khách hàng demo, nhiều thiết bị hơn, thêm session/booking
-- và review để demo recommendation Fuzzy TOPSIS.
-- File này chạy sau seed.sql.
-- =============================================================

SET session_replication_role = replica;
SET client_encoding = 'UTF8';

-- =============================================================
-- A. DEMO CLIENT ACCOUNTS
-- =============================================================
INSERT INTO accounts (id, username, email, password_hash, role, status, avatar_url, lang_key, created_at, updated_at, created_by, updated_by)
VALUES
  (9,  'client_dao',   'dao.vo@gmail.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu0', 'CLIENT', 'ACTIVE', NULL, 'vi', NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (10, 'client_em',    'em.pham@gmail.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu0', 'CLIENT', 'ACTIVE', NULL, 'vi', NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (11, 'client_fiona', 'fiona.ngo@gmail.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu0', 'CLIENT', 'ACTIVE', NULL, 'vi', NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (12, 'client_giang', 'giang.do@gmail.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu0', 'CLIENT', 'ACTIVE', NULL, 'vi', NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (13, 'client_hoang', 'hoang.trinh@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu0', 'CLIENT', 'ACTIVE', NULL, 'vi', NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (14, 'client_khanh', 'khanh.bui@gmail.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu0', 'CLIENT', 'ACTIVE', NULL, 'vi', NOW(), NOW(), 'seed-demo', 'seed-demo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO clients (id, account_id, client_code, full_name, birth_date, gender, phone, skin_type, skin_concerns, loyalty_points, created_at, updated_at, created_by, updated_by)
VALUES
  (4, 9,  'CL004', 'Võ Thị Đào',      '1994-01-17', 'FEMALE', '0966111222', 'Da nhạy cảm',  'Đỏ da, Dễ kích ứng',       240, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (5, 10, 'CL005', 'Phạm Mỹ Em',      '1998-09-11', 'FEMALE', '0966222333', 'Da hỗn hợp',   'Lỗ chân lông to, Thâm',    175, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (6, 11, 'CL006', 'Ngô Thùy Fiona',  '1993-06-06', 'FEMALE', '0966333444', 'Da thường',    'Xỉn màu, Thiếu săn chắc',  310, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (7, 12, 'CL007', 'Đỗ Minh Giang',   '1991-12-03', 'MALE',   '0966444555', 'Da dầu',       'Mụn ẩn, Đầu đen',          120, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (8, 13, 'CL008', 'Trịnh Gia Hoàng', '1988-04-22', 'MALE',   '0966555666', 'Da khô',       'Thiếu ẩm, Nếp nhăn',       280, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (9, 14, 'CL009', 'Bùi Ngọc Khánh',  '1996-08-30', 'FEMALE', '0966666777', 'Da hỗn hợp',   'Thâm mụn, Bề mặt sần',     205, NOW(), NOW(), 'seed-demo', 'seed-demo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO client_addresses (id, client_id, street, ward, district, city, is_default, created_at, updated_at, created_by, updated_by)
VALUES
  (5, 4, '22 Nguyễn Gia Trí',    'Phường 25',      'Quận Bình Thạnh', 'TP. Hồ Chí Minh', true,  NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (6, 5, '81 Điện Biên Phủ',     'Phường 15',      'Quận Bình Thạnh', 'TP. Hồ Chí Minh', true,  NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (7, 6, '44 Võ Thị Sáu',        'Phường Tân Định','Quận 1',          'TP. Hồ Chí Minh', true,  NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (8, 7, '16 Nguyễn Văn Cừ',     'Phường 2',       'Quận 5',          'TP. Hồ Chí Minh', true,  NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (9, 8, '102 Trưng Nữ Vương',   'Phường Bình Hiên','Quận Hải Châu',  'Đà Nẵng',         true,  NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (10, 9, '9 Lê Lợi',            'Phường Bến Nghé','Quận 1',          'TP. Hồ Chí Minh', true,  NOW(), NOW(), 'seed-demo', 'seed-demo')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- B. 30 MORE DEVICES FOR RECOMMENDATION DEMO
-- =============================================================
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

-- =============================================================
-- C. SERVICE MAPS FOR BOOKING DEMO DEVICES
-- =============================================================
INSERT INTO service_device_map (service_id, device_id) VALUES
  (2, 11), (3, 12), (2, 14), (6, 15), (3, 16), (6, 20), (3, 21), (4, 23),
  (2, 26), (6, 28), (5, 29), (6, 31), (3, 32), (6, 36), (4, 39), (5, 40)
ON CONFLICT DO NOTHING;

-- =============================================================
-- D. MORE EXPERIENCE SESSIONS FOR BRANCH / SCHEDULE PICKER
-- =============================================================
INSERT INTO experience_sessions (id, service_id, device_id, branch_name, location_detail, session_date, start_time, end_time, max_slots, available_slots, booked_slots, status, price_per_slot, created_by_admin_id, staff_id, created_at, updated_at, created_by, updated_by)
VALUES
  (9,  2, 11, 'Carevia Chi nhánh Q1',        'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM',         NOW()::DATE + 2,  '09:00', '09:45', 6, 4, 2, 'OPEN', 550000, 7, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (10, 2, 11, 'Carevia Chi nhánh Phú Nhuận', '105 Phan Xích Long, Phú Nhuận, TP.HCM',         NOW()::DATE + 4,  '14:00', '14:45', 5, 5, 0, 'OPEN', 550000, 7, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (11, 3, 12, 'Carevia Chi nhánh Q3',        'Tầng 2, 88 Võ Văn Tần, Quận 3, TP.HCM',         NOW()::DATE + 3,  '10:00', '10:30', 6, 5, 1, 'OPEN', 420000, 7, 2, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (12, 2, 14, 'Carevia Chi nhánh Q1',        'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM',         NOW()::DATE + 5,  '15:00', '15:45', 5, 4, 1, 'OPEN', 380000, 7, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (13, 6, 15, 'Carevia Chi nhánh Thủ Đức',   '312 Võ Văn Ngân, Thủ Đức, TP.HCM',              NOW()::DATE + 6,  '09:30', '10:30', 4, 3, 1, 'OPEN', 720000, 7, 3, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (14, 3, 16, 'Carevia Chi nhánh Q7',        'Tầng 1, 45 Nguyễn Thị Thập, Quận 7, TP.HCM',    NOW()::DATE + 2,  '16:00', '16:30', 8, 6, 2, 'OPEN', 260000, 7, 2, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (15, 6, 20, 'Carevia Chi nhánh Q1',        'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM',         NOW()::DATE + 4,  '11:00', '12:00', 5, 3, 2, 'OPEN', 520000, 7, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (16, 3, 21, 'Carevia Chi nhánh Q3',        'Tầng 2, 88 Võ Văn Tần, Quận 3, TP.HCM',         NOW()::DATE + 7,  '13:30', '14:00', 6, 5, 1, 'OPEN', 480000, 7, 2, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (17, 4, 23, 'Carevia Chi nhánh Q7',        'Tầng 1, 45 Nguyễn Thị Thập, Quận 7, TP.HCM',    NOW()::DATE + 3,  '08:30', '09:15', 5, 4, 1, 'OPEN', 360000, 7, 3, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (18, 2, 26, 'Carevia Chi nhánh Phú Nhuận', '105 Phan Xích Long, Phú Nhuận, TP.HCM',         NOW()::DATE + 5,  '17:00', '17:45', 5, 4, 1, 'OPEN', 340000, 7, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (19, 6, 28, 'Carevia Chi nhánh Thủ Đức',   '312 Võ Văn Ngân, Thủ Đức, TP.HCM',              NOW()::DATE + 8,  '10:00', '11:00', 4, 3, 1, 'OPEN', 650000, 7, 3, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (20, 5, 29, 'Carevia Chi nhánh Q1',        'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM',         NOW()::DATE + 4,  '09:00', '10:00', 6, 5, 1, 'OPEN', 290000, 7, 2, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (21, 6, 31, 'Carevia Chi nhánh Q3',        'Tầng 2, 88 Võ Văn Tần, Quận 3, TP.HCM',         NOW()::DATE + 9,  '15:00', '16:00', 4, 4, 0, 'OPEN', 680000, 7, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (22, 3, 32, 'Carevia Chi nhánh Q7',        'Tầng 1, 45 Nguyễn Thị Thập, Quận 7, TP.HCM',    NOW()::DATE + 6,  '10:00', '10:30', 6, 5, 1, 'OPEN', 240000, 7, 2, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (23, 6, 36, 'Carevia Chi nhánh Q1',        'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM',         NOW()::DATE + 10, '14:00', '15:00', 4, 3, 1, 'OPEN', 620000, 7, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (24, 4, 39, 'Carevia Chi nhánh Phú Nhuận', '105 Phan Xích Long, Phú Nhuận, TP.HCM',         NOW()::DATE + 3,  '18:00', '18:45', 5, 5, 0, 'OPEN', 310000, 7, 3, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (25, 2, 11, 'Carevia Chi nhánh Q7',        'Tầng 1, 45 Nguyễn Thị Thập, Quận 7, TP.HCM',    NOW()::DATE + 11, '09:00', '09:45', 5, 5, 0, 'OPEN', 550000, 7, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (26, 3, 12, 'Carevia Chi nhánh Q1',        'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM',         NOW()::DATE + 12, '11:00', '11:30', 6, 6, 0, 'OPEN', 420000, 7, 2, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (27, 6, 20, 'Carevia Chi nhánh Thủ Đức',   '312 Võ Văn Ngân, Thủ Đức, TP.HCM',              NOW()::DATE + 13, '13:00', '14:00', 4, 4, 0, 'OPEN', 520000, 7, 3, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (28, 4, 23, 'Carevia Chi nhánh Q1',        'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM',         NOW()::DATE + 14, '16:00', '16:45', 5, 4, 1, 'OPEN', 360000, 7, 3, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (29, 2, 26, 'Carevia Chi nhánh Q3',        'Tầng 2, 88 Võ Văn Tần, Quận 3, TP.HCM',         NOW()::DATE + 15, '09:30', '10:15', 5, 5, 0, 'OPEN', 340000, 7, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (30, 6, 36, 'Carevia Chi nhánh Thủ Đức',   '312 Võ Văn Ngân, Thủ Đức, TP.HCM',              NOW()::DATE + 16, '11:00', '12:00', 4, 4, 0, 'OPEN', 620000, 7, 3, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (31, 3, 32, 'Carevia Chi nhánh Q1',        'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM',         NOW()::DATE + 17, '15:30', '16:00', 6, 6, 0, 'OPEN', 240000, 7, 2, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (32, 4, 39, 'Carevia Chi nhánh Q7',        'Tầng 1, 45 Nguyễn Thị Thập, Quận 7, TP.HCM',    NOW()::DATE + 18, '08:00', '08:45', 5, 5, 0, 'OPEN', 310000, 7, 3, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (33, 5, 40, 'Carevia Chi nhánh Q1',        'Tầng 3, 25 Nguyễn Huệ, Quận 1, TP.HCM',         NOW()::DATE + 5,  '11:30', '12:15', 6, 5, 1, 'OPEN', 280000, 7, 2, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (34, 3, 21, 'Carevia Chi nhánh Phú Nhuận', '105 Phan Xích Long, Phú Nhuận, TP.HCM',         NOW()::DATE + 12, '14:00', '14:30', 6, 6, 0, 'OPEN', 480000, 7, 2, NOW(), NOW(), 'seed-demo', 'seed-demo')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- E. BOOKINGS / HISTORY / ITEMS FOR DEMO FLOWS
-- =============================================================
INSERT INTO bookings (id, booking_code, account_id, session_id, device_id, appointment_date, start_time, end_time, status, total_price, discount_amount, voucher_id, customer_note, created_at, updated_at, created_by, updated_by)
VALUES
  (6,  'BK-2024-006', 9,  9,  11, NOW()::DATE + 2,  '09:00', '09:45', 'CONFIRMED',       550000, 0,      NULL, 'Muốn tập trung vùng hàm',                      NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'seed-demo', 'seed-demo'),
  (7,  'BK-2024-007', 10, 11, 12, NOW()::DATE + 3,  '10:00', '10:30', 'PENDING_CONFIRM', 420000, 0,      NULL, 'Da có thâm sau mụn',                           NOW() - INTERVAL '1 day',  NOW() - INTERVAL '1 day', 'seed-demo', 'seed-demo'),
  (8,  'BK-2024-008', 11, 12, 14, NOW()::DATE + 5,  '15:00', '15:45', 'CONFIRMED',       330000, 50000, 4,    'Ưu tiên vùng mắt và rãnh cười',                NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'seed-demo', 'seed-demo'),
  (9,  'BK-2024-009', 12, 14, 16, NOW()::DATE + 2,  '16:00', '16:30', 'PENDING_CONFIRM', 260000, 0,      NULL, 'Đang có mụn viêm nhẹ',                         NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours', 'seed-demo', 'seed-demo'),
  (10, 'BK-2024-010', 13, 15, 20, NOW()::DATE + 4,  '11:00', '12:00', 'CONFIRMED',       520000, 0,      NULL, 'Cần nâng cơ rõ nhưng không quá đau',           NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'seed-demo', 'seed-demo'),
  (11, 'BK-2024-011', 14, 17, 23, NOW()::DATE + 3,  '08:30', '09:15', 'PENDING_CONFIRM', 360000, 0,      NULL, 'Muốn đẩy serum để da bớt khô',                 NOW() - INTERVAL '1 day',  NOW() - INTERVAL '1 day', 'seed-demo', 'seed-demo'),
  (12, 'BK-2024-012', 4,  18, 26, NOW()::DATE + 5,  '17:00', '17:45', 'CONFIRMED',       340000, 0,      NULL, 'Tôi đã từng dùng NuFace Mini bản cũ',          NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'seed-demo', 'seed-demo'),
  (13, 'BK-2024-013', 5,  20, 29, NOW()::DATE + 4,  '09:00', '10:00', 'CONFIRMED',       290000, 0,      NULL, 'Muốn làm mịn bề mặt da trước sự kiện',         NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'seed-demo', 'seed-demo'),
  (14, 'BK-2024-014', 6,  22, 32, NOW()::DATE + 6,  '10:00', '10:30', 'PENDING_CONFIRM', 240000, 0,      NULL, 'Có vài nốt mụn viêm mới',                      NOW() - INTERVAL '18 hours', NOW() - INTERVAL '18 hours', 'seed-demo', 'seed-demo'),
  (15, 'BK-2024-015', 9,  23, 36, NOW()::DATE + 10, '14:00', '15:00', 'PENDING_CONFIRM', 620000, 0,      NULL, 'Muốn demo công nghệ cho nhóm bạn đi cùng',     NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours', 'seed-demo', 'seed-demo'),
  (16, 'BK-2024-016', 10, 24, 39, NOW()::DATE + 3,  '18:00', '18:45', 'CONFIRMED',       310000, 0,      NULL, 'Da hơi nhạy cảm sau treatment',                NOW() - INTERVAL '1 day',  NOW() - INTERVAL '20 hours', 'seed-demo', 'seed-demo'),
  (17, 'BK-2024-017', 11, 33, 40, NOW()::DATE + 5,  '11:30', '12:15', 'PENDING_CONFIRM', 230000, 50000, 4,    'Muốn làm sạch đầu đen vùng mũi',               NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours', 'seed-demo', 'seed-demo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO booking_history (id, booking_id, old_status, new_status, change_reason, changed_by, changed_at)
VALUES
  (5,  6,  'PENDING_CONFIRM', 'CONFIRMED', NULL, 1, NOW() - INTERVAL '1 day'),
  (6,  8,  'PENDING_CONFIRM', 'CONFIRMED', NULL, 1, NOW() - INTERVAL '1 day'),
  (7,  10, 'PENDING_CONFIRM', 'CONFIRMED', NULL, 1, NOW() - INTERVAL '2 days'),
  (8,  12, 'PENDING_CONFIRM', 'CONFIRMED', NULL, 2, NOW() - INTERVAL '1 day'),
  (9,  13, 'PENDING_CONFIRM', 'CONFIRMED', NULL, 2, NOW() - INTERVAL '1 day'),
  (10, 16, 'PENDING_CONFIRM', 'CONFIRMED', NULL, 3, NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO booking_item (id, booking_id, device_id, service_id, price, quantity, created_at, updated_at, created_by, updated_by)
VALUES
  (6,  6,  11, 2, 550000, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (7,  7,  12, 3, 420000, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (8,  8,  14, 2, 380000, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (9,  9,  16, 3, 260000, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (10, 10, 20, 6, 520000, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (11, 11, 23, 4, 360000, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (12, 12, 26, 2, 340000, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (13, 13, 29, 5, 290000, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (14, 14, 32, 3, 240000, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (15, 15, 36, 6, 620000, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (16, 16, 39, 4, 310000, 1, NOW(), NOW(), 'seed-demo', 'seed-demo'),
  (17, 17, 40, 5, 280000, 1, NOW(), NOW(), 'seed-demo', 'seed-demo')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- F. REVIEW SIGNALS FOR NEW DEVICES
-- =============================================================
INSERT INTO review (id, account_id, device_id, service_id, order_id, rating, effectiveness_rating, safety_rating, ergonomics_rating, durability_rating, comment, is_verified_purchase, is_hidden, created_at, updated_at, created_by, updated_by)
VALUES
  (5,  9,  11, NULL, NULL, 5, 5, 5, 4, 5, 'BEAR 2 nâng cơ khá rõ sau vài tuần, máy cầm chắc tay và chạy êm.', true,  false, NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days', 'seed-demo', 'seed-demo'),
  (6,  10, 12, NULL, NULL, 4, 4, 4, 4, 4, 'IPL dùng ổn, da đều màu hơn nhưng cần kiên trì.', true,  false, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', 'seed-demo', 'seed-demo'),
  (7,  11, 13, NULL, NULL, 5, 4, 5, 5, 4, 'Máy xông rất dễ chịu, da mềm hơn rõ sau khi dùng serum.', false, false, NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days', 'seed-demo', 'seed-demo'),
  (8,  12, 14, NULL, NULL, 4, 4, 4, 5, 4, 'FIX hợp vùng mắt, thao tác nhanh và khá tiện mỗi sáng.', false, false, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days', 'seed-demo', 'seed-demo'),
  (9,  13, 15, NULL, NULL, 5, 5, 4, 4, 5, 'RF cho cảm giác treatment cao cấp, da săn hơn sau 1 tháng.', true,  false, NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days', 'seed-demo', 'seed-demo'),
  (10, 14, 16, NULL, NULL, 4, 4, 4, 4, 4, 'ESPADA giảm sưng mụn tốt, không bị rát nếu dùng đúng cách.', false, false, NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days', 'seed-demo', 'seed-demo'),
  (11, 4,  17, NULL, NULL, 4, 4, 4, 4, 4, 'Máy làm sạch ổn trong tầm giá, phù hợp da dầu.', true,  false, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', 'seed-demo', 'seed-demo'),
  (12, 5,  18, NULL, NULL, 5, 4, 5, 4, 4, 'Bọt mịn, rửa xong da sạch mà vẫn êm.', true,  false, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days', 'seed-demo', 'seed-demo'),
  (13, 6,  19, NULL, NULL, 4, 3, 5, 4, 4, 'Massage thư giãn tốt, đặc biệt vùng má khá dễ chịu.', false, false, NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days', 'seed-demo', 'seed-demo'),
  (14, 9,  20, NULL, NULL, 5, 5, 4, 5, 5, 'Trinity Plus cho cảm giác nâng cơ tốt và app khá dễ dùng.', true,  false, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days', 'seed-demo', 'seed-demo'),
  (15, 10, 21, NULL, NULL, 5, 4, 5, 4, 4, 'Vùng cổ sáng và đều màu hơn sau vài tuần.', false, false, NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days', 'seed-demo', 'seed-demo'),
  (16, 11, 22, NULL, NULL, 4, 4, 4, 5, 4, 'Đắp mask nhanh, da đủ ẩm và thư giãn hơn.', false, false, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', 'seed-demo', 'seed-demo'),
  (17, 12, 23, NULL, NULL, 5, 4, 5, 5, 4, 'Máy ion ấm giúp serum thấm nhanh, hợp da khô.', true,  false, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days', 'seed-demo', 'seed-demo'),
  (18, 13, 24, NULL, NULL, 4, 4, 5, 4, 4, 'VisaBoost khá dịu da, dùng xong không bị đỏ.', false, false, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', 'seed-demo', 'seed-demo'),
  (19, 14, 25, NULL, NULL, 4, 4, 4, 4, 4, 'Bản body dùng tiện khi tắm, da mịn và sạch hơn.', false, false, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', 'seed-demo', 'seed-demo'),
  (20, 4,  26, NULL, NULL, 5, 5, 4, 5, 4, 'Mini Plus gọn, hợp người mới làm quen với microcurrent.', true,  false, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', 'seed-demo', 'seed-demo'),
  (21, 5,  27, NULL, NULL, 4, 4, 4, 4, 5, 'Mũ LED hoàn thiện tốt, phù hợp demo công nghệ.', false, false, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', 'seed-demo', 'seed-demo'),
  (22, 6,  28, NULL, NULL, 5, 5, 4, 4, 5, 'RF của Panasonic chạy ổn định, da săn rõ sau vài buổi.', true,  false, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', 'seed-demo', 'seed-demo'),
  (23, 9,  29, NULL, NULL, 4, 4, 4, 4, 4, 'Dermaplaning nhẹ nhàng, bề mặt da mượt hơn.', false, false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', 'seed-demo', 'seed-demo'),
  (24, 10, 30, NULL, NULL, 5, 4, 5, 5, 4, 'Máy massage mắt êm, giảm bọng buổi sáng khá tốt.', false, false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', 'seed-demo', 'seed-demo'),
  (25, 11, 31, NULL, NULL, 5, 5, 4, 4, 5, 'Bản wrinkle reducer cho cảm giác treatment mạnh hơn Mini.', true,  false, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 'seed-demo', 'seed-demo'),
  (26, 12, 32, NULL, NULL, 4, 4, 4, 4, 4, 'Blemish Pen gọn, xử lý nốt mụn mới khá nhanh.', false, false, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 'seed-demo', 'seed-demo'),
  (27, 13, 33, NULL, NULL, 4, 3, 5, 4, 4, 'Máy xông mini nhỏ gọn, hợp dùng nhanh cuối ngày.', false, false, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'seed-demo', 'seed-demo'),
  (28, 14, 34, NULL, NULL, 4, 4, 4, 4, 4, 'Máy làm sạch ổn với da dầu, giá dễ tiếp cận.', false, false, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'seed-demo', 'seed-demo'),
  (29, 4,  35, NULL, NULL, 4, 4, 5, 4, 4, 'Thiết bị da đầu độc lạ, cảm giác thư giãn tốt.', false, false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'seed-demo', 'seed-demo'),
  (30, 5,  36, NULL, NULL, 5, 5, 4, 4, 5, 'Thiết bị vùng cổ cho hiệu quả săn chắc rõ hơn mong đợi.', true,  false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'seed-demo', 'seed-demo'),
  (31, 6,  37, NULL, NULL, 4, 4, 4, 4, 4, 'Tone Corrector Pro hợp da có đốm nâu nhẹ.', false, false, NOW() - INTERVAL '36 hours', NOW() - INTERVAL '36 hours', 'seed-demo', 'seed-demo'),
  (32, 9,  38, NULL, NULL, 4, 4, 4, 4, 4, 'Micro polish giúp da mịn hơn mà không quá gắt.', false, false, NOW() - INTERVAL '30 hours', NOW() - INTERVAL '30 hours', 'seed-demo', 'seed-demo'),
  (33, 10, 39, NULL, NULL, 4, 3, 5, 5, 4, 'Thanh massage lạnh rất hợp để làm dịu da sau treatment.', false, false, NOW() - INTERVAL '24 hours', NOW() - INTERVAL '24 hours', 'seed-demo', 'seed-demo'),
  (34, 11, 40, NULL, NULL, 4, 4, 4, 4, 4, 'Hút đầu đen ổn ở vùng mũi nếu dùng lực vừa phải.', false, false, NOW() - INTERVAL '18 hours', NOW() - INTERVAL '18 hours', 'seed-demo', 'seed-demo')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- G. EXTRA SEARCH / RECOMMENDATION SIGNALS
-- =============================================================
INSERT INTO search_history (id, account_id, keyword, searched_at)
VALUES
  (8,  9,  'thiết bị nâng cơ mặt cao cấp',      NOW() - INTERVAL '5 days'),
  (9,  10, 'máy trị thâm sau mụn',              NOW() - INTERVAL '4 days'),
  (10, 11, 'đặt lịch trải nghiệm currentbody',  NOW() - INTERVAL '3 days'),
  (11, 12, 'thiết bị da dầu trị mụn',           NOW() - INTERVAL '2 days'),
  (12, 13, 'máy RF nâng cơ tại nhà',            NOW() - INTERVAL '2 days'),
  (13, 14, 'thiết bị làm sạch đầu đen',         NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO recommendation_log (id, account_id, device_id, rule_code, score, created_at)
VALUES
  (8,  9,  11, 'ANTI_AGING_MATCH',   94, NOW() - INTERVAL '3 days'),
  (9,  10, 12, 'PIGMENTATION_MATCH', 88, NOW() - INTERVAL '3 days'),
  (10, 11, 15, 'PREMIUM_DEVICE',     91, NOW() - INTERVAL '2 days'),
  (11, 12, 16, 'ACNE_CONTROL',       87, NOW() - INTERVAL '2 days'),
  (12, 13, 28, 'RF_PREFERENCE',      90, NOW() - INTERVAL '1 day'),
  (13, 14, 40, 'PORE_CARE',          85, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

SELECT setval('accounts_id_seq',            (SELECT MAX(id) FROM accounts));
SELECT setval('clients_id_seq',             (SELECT MAX(id) FROM clients));
SELECT setval('client_addresses_id_seq',    (SELECT MAX(id) FROM client_addresses));
SELECT setval('devices_id_seq',             (SELECT MAX(id) FROM devices));
SELECT setval('experience_sessions_id_seq', (SELECT MAX(id) FROM experience_sessions));
SELECT setval('bookings_id_seq',            (SELECT MAX(id) FROM bookings));
SELECT setval('booking_history_id_seq',     (SELECT MAX(id) FROM booking_history));
SELECT setval('booking_item_id_seq',        (SELECT MAX(id) FROM booking_item));
SELECT setval('review_id_seq',              (SELECT MAX(id) FROM review));
SELECT setval('recommendation_log_id_seq',  (SELECT MAX(id) FROM recommendation_log));
SELECT setval('search_history_id_seq',      (SELECT MAX(id) FROM search_history));

SET session_replication_role = DEFAULT;