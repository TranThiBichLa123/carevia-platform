-- =============================================================
-- CAREVIA PLATFORM - SEED FIX
-- Chỉ chứa các bảng bị lỗi từ seed.sql lần đầu
-- Chạy sau seed.sql để hoàn thiện dữ liệu
-- =============================================================

SET session_replication_role = replica;

-- =============================================================
-- FIX 1: ORDERS
-- Lỗi: 'SHIPPING' không nằm trong check constraint
-- Valid status: PENDING_PAYMENT, PAID, PROCESSING, COMPLETED, FAILED, CANCELLED
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
-- FIX 2: ORDER_ITEMS (re-insert phòng trường hợp FK orders thất bại lần trước)
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
-- FIX 3: BOOKING_HISTORY
-- Lỗi: bảng KHÔNG extend BaseEntity → không có created_at/updated_at/created_by/updated_by
-- Lỗi: changed_by là FK (bigint) → không phải chuỗi, phải dùng account.id
-- =============================================================
INSERT INTO booking_history (id, booking_id, old_status, new_status, change_reason, changed_by, changed_at)
VALUES
  (1, 1, 'PENDING_CONFIRM', 'CONFIRMED', NULL, 1, NOW() - INTERVAL '1 day'),
  (2, 3, 'PENDING_CONFIRM', 'CONFIRMED', NULL, 1, NOW() - INTERVAL '2 days'),
  (3, 5, 'PENDING_CONFIRM', 'CONFIRMED', NULL, 1, NOW() - INTERVAL '9 days'),
  (4, 5, 'CONFIRMED',       'COMPLETED', NULL, 2, NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- FIX 4: PAYMENT_TRANSACTIONS
-- Lỗi: bảng KHÔNG extend BaseEntity → không có created_at/updated_at/created_by/updated_by
-- =============================================================
INSERT INTO payment_transactions (id, order_id, external_transaction_id, amount, currency, payment_method, status, provider_response, ip_address, transaction_at, completed_at)
VALUES
  (1, 1, 'ZALO-TXN-20240301-001',   2910000, 'VND', 'E_WALLET',     'SUCCESS', '{"code":"1","message":"Success"}', '127.0.0.1', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  (2, 2, 'STRIPE-TXN-20240405-002', 5530000, 'VND', 'CARD',         'SUCCESS', '{"status":"succeeded"}',           '127.0.0.1', NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days'),
  (3, 3, 'BANK-TXN-20240503-003',   8930000, 'VND', 'BANK_TRANSFER','SUCCESS', '{"ref":"BNK123456"}',              '127.0.0.1', NOW() - INTERVAL '2 days',  NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- FIX 5A: NOTIFICATION (bảng CŨ - singular)
-- notification_recipient có FK đến bảng NÀY, phải insert vào đây trước
-- Bảng cũ KHÔNG có: account_id, status, notification_type
-- =============================================================
-- INSERT INTO notification (id, title, content, type, target_url, reference_type, reference_id, created_at, updated_at, created_by, updated_by)
-- VALUES
--   (1, 'Đơn hàng đã được xác nhận',         'Đơn hàng ORD-2024-001 đã được xác nhận và đang xử lý.',          'ORDER',   '/client/orders/1',   'ORDER',   1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', 'seed', 'seed'),
--   (2, 'Đơn hàng đã hoàn thành',             'Đơn hàng ORD-2024-001 đã được giao thành công. Cảm ơn bạn!',    'ORDER',   '/client/orders/1',   'ORDER',   1, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', 'seed', 'seed'),
--   (3, 'Booking đã được xác nhận',           'Booking BK-2024-005 của bạn đã được xác nhận.',                  'BOOKING', '/client/bookings/5', 'BOOKING', 5, NOW() - INTERVAL '9 days',  NOW() - INTERVAL '9 days',  'seed', 'seed'),
--   (4, 'Nhắc nhở booking sắp đến',           'Bạn có lịch trải nghiệm ngày mai lúc 09:00 tại Carevia Q1.',     'BOOKING', '/client/bookings/1', 'BOOKING', 1, NOW() - INTERVAL '1 day',   NOW() - INTERVAL '1 day',   'seed', 'seed'),
--   (5, 'Ưu đãi đặc biệt dành cho bạn',      'Voucher SKINCARE15 giảm 15% đang chờ bạn sử dụng!',             'PROMO',   '/client/vouchers',   NULL,      NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'seed', 'seed'),
--   (6, 'Bạn có lịch điều trị mới',           'Bạn được phân công điều trị session mới.',                       'SYSTEM',  '/staff/sessions',    NULL,      NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day',  'seed', 'seed')
-- ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- FIX 5B: NOTIFICATIONS (bảng MỚI - plural)
-- Lỗi: status phải là UNREAD/READ/DISABLED (không phải SENT)
-- Lỗi: notification_type là NOT NULL, phải dùng giá trị valid:
--   BOOKING_CREATED, BOOKING_CONFIRMED, BOOKING_CANCELLED, BOOKING_COMPLETED,
--   BOOKING_EXPIRED, ORDER_CREATED, ORDER_PAID, ORDER_PROCESSING, ORDER_COMPLETED,
--   ORDER_CANCELLED, PAYMENT_SUCCESS, PAYMENT_FAILED, ACCOUNT_ACTIVATED, ACCOUNT_SUSPENDED, SYSTEM
-- =============================================================
INSERT INTO notifications (id, account_id, status, title, content, notification_type, type, target_url, reference_type, reference_id, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 4, 'READ',   'Đơn hàng đã được xác nhận',         'Đơn hàng ORD-2024-001 đã được xác nhận.',              'ORDER_PAID',       'ORDER',   '/client/orders/1',   'ORDER',   1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', 'seed', 'seed'),
  (2, 4, 'READ',   'Đơn hàng đã hoàn thành',             'Đơn hàng ORD-2024-001 đã hoàn thành thành công.',      'ORDER_COMPLETED',  'ORDER',   '/client/orders/1',   'ORDER',   1, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', 'seed', 'seed'),
  (3, 5, 'READ',   'Booking đã được xác nhận',           'Booking BK-2024-005 đã được xác nhận.',                'BOOKING_CONFIRMED','BOOKING', '/client/bookings/5', 'BOOKING', 5, NOW() - INTERVAL '9 days',  NOW() - INTERVAL '9 days',  'seed', 'seed'),
  (4, 4, 'UNREAD', 'Nhắc nhở booking sắp đến',           'Bạn có lịch trải nghiệm ngày mai lúc 09:00.',          'SYSTEM',           'BOOKING', '/client/bookings/1', 'BOOKING', 1, NOW() - INTERVAL '1 day',   NOW() - INTERVAL '1 day',   'seed', 'seed'),
  (5, 4, 'UNREAD', 'Ưu đãi đặc biệt dành cho bạn',      'Voucher SKINCARE15 giảm 15% đang chờ bạn!',            'SYSTEM',           'PROMO',   '/client/vouchers',   NULL,      NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'seed', 'seed'),
  (6, 2, 'UNREAD', 'Bạn có lịch điều trị mới',           'Bạn được phân công điều trị session mới.',             'BOOKING_CREATED',  'SYSTEM',  '/staff/sessions',    NULL,      NULL, NOW() - INTERVAL '1 day',  NOW() - INTERVAL '1 day',  'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

INSERT INTO notifications (
    id, account_id, status, title, content, notification_type, 
    type, target_url, reference_type, reference_id, 
    created_at, updated_at, created_by, updated_by
) VALUES 
(7, 1, 'UNREAD', 'Chào mừng thành viên mới', 'Chào mừng bạn đến với Carevia! Hãy khám phá các dịch vụ của chúng tôi.', 'SYSTEM', 'SYSTEM', '/client/profile', NULL, NULL, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', 'seed', 'seed'),
(8, 1, 'READ', 'Xác nhận đơn hàng thành công', 'Đơn hàng máy rửa mặt ORD-999 đã được xác nhận.', 'ORDER_PAID', 'ORDER', '/client/orders/999', 'ORDER', 999, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', 'seed', 'seed'),
(9, 1, 'UNREAD', 'Lịch hẹn sắp bắt đầu', 'Bạn có lịch chăm sóc da chuyên sâu vào 14:00 chiều nay.', 'BOOKING_CONFIRMED', 'BOOKING', '/client/bookings/10', 'BOOKING', 10, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', 'seed', 'seed'),
(10, 1, 'UNREAD', 'Khuyến mãi đặc biệt tháng này', 'Giảm ngay 20% cho tất cả dịch vụ tại chi nhánh Quận 1.', 'SYSTEM', 'PROMO', '/client/vouchers', NULL, NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'seed', 'seed'),
(11, 1, 'READ', 'Đánh giá dịch vụ', 'Cảm ơn bạn đã trải nghiệm dịch vụ. Hãy để lại đánh giá nhé!', 'SYSTEM', 'SYSTEM', '/client/bookings/10/review', 'BOOKING', 10, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- FIX 6: NOTIFICATION_RECIPIENT
-- Lỗi: bảng KHÔNG extend BaseEntity → không có created_at/updated_at/created_by/updated_by
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
-- FIX 7: NOTIFICATION_SETTING
-- Lỗi: bảng KHÔNG extend BaseEntity → chỉ có updated_at (không có created_at/created_by/updated_by)
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
-- FIX 8: RECOMMENDATION_LOG
-- Lỗi: không có updated_at/created_by/updated_by
-- Lỗi: score là INTEGER (không phải DOUBLE) → dùng thang 1-100
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
-- FIX 9: SEARCH_HISTORY
-- Lỗi: bảng KHÔNG extend BaseEntity → chỉ có id, account_id, keyword, searched_at
-- =============================================================
INSERT INTO search_history (id, account_id, keyword, searched_at)
VALUES
  (1, 4, 'máy rửa mặt',       NOW() - INTERVAL '35 days'),
  (2, 4, 'Foreo LUNA',        NOW() - INTERVAL '30 days'),
  (3, 4, 'LED light therapy', NOW() - INTERVAL '10 days'),
  (4, 5, 'NuFace',            NOW() - INTERVAL '15 days'),
  (5, 5, 'nâng cơ mặt',      NOW() - INTERVAL '5 days'),
  (6, 6, 'máy massage mặt',   NOW() - INTERVAL '8 days'),
  (7, 6, 'Panasonic',         NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- FIX 10: EMAIL_VERIFICATION
-- Lỗi: token_type sai → đúng là VERIFY_EMAIL và RESET_PASSWORD (không phải EMAIL_VERIFY/PASSWORD_RESET)
-- =============================================================
INSERT INTO email_verification (id, account_id, token_hash, token_type, expires_at, is_used, created_at, updated_at, created_by, updated_by)
VALUES
  (1, 4, 'hash_email_verify_client1_used',      'VERIFY_EMAIL',   NOW() - INTERVAL '29 days', true,  NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', 'seed', 'seed'),
  (2, 5, 'hash_email_verify_client2_used',      'VERIFY_EMAIL',   NOW() - INTERVAL '29 days', true,  NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', 'seed', 'seed'),
  (3, 6, 'hash_email_verify_client3_used',      'VERIFY_EMAIL',   NOW() - INTERVAL '14 days', true,  NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', 'seed', 'seed'),
  (4, 6, 'hash_password_reset_client3_expired', 'RESET_PASSWORD', NOW() - INTERVAL '1 hour',  false, NOW() - INTERVAL '2 days',  NOW() - INTERVAL '2 days',  'seed', 'seed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- FIX 11: SYSTEM_SETTING
-- Lỗi: bảng KHÔNG extend BaseEntity → chỉ có id, key_name, value_text, description, updated_at
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
-- FIX 12: AUDIT_LOG
-- Lỗi: bảng KHÔNG extend BaseEntity → chỉ có created_at (không có updated_at/created_by/updated_by)
-- =============================================================
INSERT INTO audit_log (id, table_name, record_id, action, changed_data, user_account_id, ip_address, created_at)
VALUES
  (1, 'accounts', '4', 'INSERT', '{"event":"account_created","role":"CLIENT"}',          1, '127.0.0.1', NOW() - INTERVAL '30 days'),
  (2, 'orders',   '1', 'INSERT', '{"event":"order_created","total":2910000}',             4, '127.0.0.1', NOW() - INTERVAL '30 days'),
  (3, 'orders',   '1', 'UPDATE', '{"event":"order_completed","old_status":"PROCESSING"}', 1, '127.0.0.1', NOW() - INTERVAL '25 days'),
  (4, 'bookings', '1', 'UPDATE', '{"event":"booking_confirmed","old_status":"PENDING"}',  1, '127.0.0.1', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- Reset sequences
-- =============================================================
SELECT setval('orders_id_seq',              (SELECT MAX(id) FROM orders));
SELECT setval('order_items_id_seq',         (SELECT MAX(id) FROM order_items));
SELECT setval('booking_history_id_seq',     (SELECT MAX(id) FROM booking_history));
SELECT setval('payment_transactions_id_seq',(SELECT MAX(id) FROM payment_transactions));
SELECT setval('notification_id_seq',        (SELECT MAX(id) FROM notification));
SELECT setval('notifications_id_seq',       (SELECT MAX(id) FROM notifications));
SELECT setval('notification_recipient_id_seq',(SELECT MAX(id) FROM notification_recipient));
SELECT setval('notification_setting_id_seq',(SELECT MAX(id) FROM notification_setting));
SELECT setval('recommendation_log_id_seq',  (SELECT MAX(id) FROM recommendation_log));
SELECT setval('search_history_id_seq',      (SELECT MAX(id) FROM search_history));
SELECT setval('email_verification_id_seq',  (SELECT MAX(id) FROM email_verification));
SELECT setval('system_setting_id_seq',      (SELECT MAX(id) FROM system_setting));
SELECT setval('audit_log_id_seq',           (SELECT MAX(id) FROM audit_log));

SET session_replication_role = DEFAULT;

-- Kiểm tra kết quả
SELECT 'orders'                AS tbl, COUNT(*) AS rows FROM orders
UNION ALL SELECT 'order_items',             COUNT(*) FROM order_items
UNION ALL SELECT 'booking_history',         COUNT(*) FROM booking_history
UNION ALL SELECT 'payment_transactions',    COUNT(*) FROM payment_transactions
UNION ALL SELECT 'notification (old)',      COUNT(*) FROM notification
UNION ALL SELECT 'notifications (new)',     COUNT(*) FROM notifications
UNION ALL SELECT 'notification_recipient',  COUNT(*) FROM notification_recipient
UNION ALL SELECT 'notification_setting',    COUNT(*) FROM notification_setting
UNION ALL SELECT 'recommendation_log',      COUNT(*) FROM recommendation_log
UNION ALL SELECT 'search_history',          COUNT(*) FROM search_history
UNION ALL SELECT 'email_verification',      COUNT(*) FROM email_verification
UNION ALL SELECT 'system_setting',          COUNT(*) FROM system_setting
UNION ALL SELECT 'audit_log',               COUNT(*) FROM audit_log
ORDER BY tbl;
