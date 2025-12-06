-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE product_description_history, product_images, watchlist, blocked_bidders,
--     questions, bids, ratings, transactions, upgrade_requests, refresh_tokens,
--     social_accounts, products, categories, users RESTART IDENTITY CASCADE;

-- ============================================
-- USERS (Password: 1)
-- ============================================
INSERT INTO users (email, password, full_name, address, role, email_verified, is_active, positive_ratings,
                   negative_ratings, region, preferred_language, created_at, updated_at)
VALUES ('admin@auction.com', '$2a$10$.jipHZhmnl8fGPxfH4hBCOL5irqrxujGvWv6/f6UOKLiwDV2sAmcK', 'Quản trị viên hệ thống',
        '123 Đường Nguyễn Huệ, Quận 1, TP.HCM', 'ADMIN', true, true, 0, 0, 'US', 'en', NOW(), NOW()),
       ('seller1@auction.com', '$2a$10$.jipHZhmnl8fGPxfH4hBCOL5irqrxujGvWv6/f6UOKLiwDV2sAmcK', 'Nguyễn Văn An',
        '456 Lê Lợi, Quận 1, TP.HCM', 'SELLER', true, true, 15, 1, 'VN', 'vi', NOW(), NOW()),
       ('seller2@auction.com', '$2a$10$.jipHZhmnl8fGPxfH4hBCOL5irqrxujGvWv6/f6UOKLiwDV2sAmcK', 'Trần Thị Bình',
        '789 Trần Hưng Đạo, Quận 5, TP.HCM', 'SELLER', true, true, 23, 2, 'US', 'en', NOW(), NOW()),
       ('seller3@auction.com', '$2a$10$.jipHZhmnl8fGPxfH4hBCOL5irqrxujGvWv6/f6UOKLiwDV2sAmcK', 'Lê Minh Công',
        '321 Hai Bà Trưng, Quận 3, TP.HCM', 'SELLER', true, true, 8, 0, 'VN', 'vi', NOW(), NOW()),
       ('bidder1@auction.com', '$2a$10$.jipHZhmnl8fGPxfH4hBCOL5irqrxujGvWv6/f6UOKLiwDV2sAmcK', 'Phạm Thị Dung',
        '654 Võ Văn Tần, Quận 3, TP.HCM', 'BIDDER', true, true, 12, 0, 'US', 'en', NOW(), NOW()),
       ('bidder2@auction.com', '$2a$10$.jipHZhmnl8fGPxfH4hBCOL5irqrxujGvWv6/f6UOKLiwDV2sAmcK', 'Hoàng Văn Em',
        '987 Nguyễn Thị Minh Khai, Quận 1, TP.HCM', 'BIDDER', true, true, 7, 1, 'VN', 'vi', NOW(), NOW()),
       ('bidder3@auction.com', '$2a$10$.jipHZhmnl8fGPxfH4hBCOL5irqrxujGvWv6/f6UOKLiwDV2sAmcK', 'Đặng Thu Phương',
        '147 Lý Tự Trọng, Quận 1, TP.HCM', 'BIDDER', true, true, 20, 0, 'US', 'en', NOW(), NOW()),
       ('bidder4@auction.com', '$2a$10$.jipHZhmnl8fGPxfH4hBCOL5irqrxujGvWv6/f6UOKLiwDV2sAmcK', 'Vũ Quang Hải',
        '258 Pasteur, Quận 3, TP.HCM', 'BIDDER', true, true, 5, 0, 'VN', 'vi', NOW(), NOW());

-- ============================================
-- SOCIAL ACCOUNTS
-- ============================================
INSERT INTO social_accounts (provider, provider_id, email, name, user_id)
VALUES ('LOCAL', 'admin@auction.com', 'admin@auction.com', 'Quản trị viên hệ thống', 1),
       ('LOCAL', 'seller1@auction.com', 'seller1@auction.com', 'Nguyễn Văn An', 2),
       ('LOCAL', 'seller2@auction.com', 'seller2@auction.com', 'Trần Thị Bình', 3),
       ('LOCAL', 'seller3@auction.com', 'seller3@auction.com', 'Lê Minh Công', 4),
       ('LOCAL', 'bidder1@auction.com', 'bidder1@auction.com', 'Phạm Thị Dung', 5),
       ('LOCAL', 'bidder2@auction.com', 'bidder2@auction.com', 'Hoàng Văn Em', 6),
       ('LOCAL', 'bidder3@auction.com', 'bidder3@auction.com', 'Đặng Thu Phương', 7),
       ('LOCAL', 'bidder4@auction.com', 'bidder4@auction.com', 'Vũ Quang Hải', 8);

-- ============================================
-- CATEGORIES (Parent Categories)
-- ============================================
INSERT INTO categories (name, description, parent_id, created_at)
VALUES ('Điện tử', 'Thiết bị và đồ công nghệ điện tử', NULL, NOW()),
       ('Thời trang', 'Quần áo và phụ kiện thời trang', NULL, NOW()),
       ('Gia dụng', 'Đồ dùng trong gia đình', NULL, NOW()),
       ('Thể thao', 'Dụng cụ và trang phục thể thao', NULL, NOW()),
       ('Sách', 'Sách và văn phòng phẩm', NULL, NOW()),
       ('Đồ chơi', 'Đồ chơi và trò chơi', NULL, NOW()),
       ('Sức khỏe', 'Chăm sóc sức khỏe và làm đẹp', NULL, NOW());

-- ============================================
-- CATEGORIES (Child Categories)
-- ============================================
INSERT INTO categories (name, description, parent_id, created_at)
VALUES
    -- Điện tử children (parent_id = 1)
    ('Laptop', 'Máy tính xách tay và gaming laptop', 1, NOW()),
    ('Điện thoại', 'Điện thoại thông minh', 1, NOW()),
    ('Máy tính bảng', 'iPad và tablet Android', 1, NOW()),
    ('Tai nghe', 'Tai nghe và âm thanh', 1, NOW()),
    ('Camera', 'Máy ảnh và phụ kiện', 1, NOW()),

    -- Thời trang children (parent_id = 2)
    ('Thời trang nam', 'Quần áo dành cho nam', 2, NOW()),
    ('Thời trang nữ', 'Quần áo dành cho nữ', 2, NOW()),
    ('Giày dép', 'Giày và dép các loại', 2, NOW()),
    ('Túi xách', 'Túi xách và ví', 2, NOW()),
    ('Đồng hồ', 'Đồng hồ đeo tay', 2, NOW()),

    -- Gia dụng children (parent_id = 3)
    ('Nội thất', 'Bàn ghế và trang trí', 3, NOW()),
    ('Nhà bếp', 'Dụng cụ nhà bếp', 3, NOW()),
    ('Đèn', 'Đèn trang trí và chiếu sáng', 3, NOW()),

    -- Thể thao children (parent_id = 4)
    ('Dụng cụ tập gym', 'Thiết bị tập luyện', 4, NOW()),
    ('Xe đạp', 'Xe đạp và phụ kiện', 4, NOW()),

    -- Sách children (parent_id = 5)
    ('Văn học', 'Sách văn học và tiểu thuyết', 5, NOW()),
    ('Kỹ năng', 'Sách kỹ năng và phát triển bản thân', 5, NOW());

-- ============================================
-- PRODUCTS (20+ products with Vietnamese descriptions)
-- ============================================
INSERT INTO products (name, description, starting_price, current_price, step_price, buy_now_price, category_id,
                      seller_id, current_bidder_id, start_time, end_time, auto_extend, allow_unrated_bidders, status,
                      bid_count, created_at, updated_at)
VALUES
    -- Electronics - Laptops
    ('MacBook Pro M3 2024', 'Mới 100%, nguyên seal. Chip M3, RAM 16GB, SSD 512GB. Màn hình Retina 14 inch tuyệt đẹp.',
     25000000, 25000000, 500000, 32000000, 8, 2, NULL, NOW(), NOW() + INTERVAL '7 days', true, true, 'ACTIVE', 0, NOW(),
     NOW()),
    ('Dell XPS 15', 'Máy đẹp như mới, dùng 3 tháng. Core i7, RAM 32GB, RTX 3050. Bảo hành còn 2 năm.', 20000000,
     20000000, 400000, 25000000, 8, 3, NULL, NOW(), NOW() + INTERVAL '5 days', false, false, 'ACTIVE', 0, NOW(), NOW()),
    ('Asus ROG Strix G15', 'Laptop gaming khủng. Ryzen 9, RTX 4060, RAM 16GB. Chơi game siêu mượt.', 28000000, 28000000,
     600000, 35000000, 8, 2, NULL, NOW(), NOW() + INTERVAL '10 days', true, true, 'ACTIVE', 0, NOW(), NOW()),
    ('Lenovo ThinkPad X1', 'Laptop văn phòng cao cấp. Core i7 Gen 12, RAM 16GB. Pin trâu 12 tiếng.', 18000000, 18000000,
     350000, 23000000, 8, 4, NULL, NOW(), NOW() + INTERVAL '4 days', true, true, 'ACTIVE', 0, NOW(), NOW()),

    -- Electronics - Phones
    ('iPhone 15 Pro Max', 'Mới nguyên seal chưa kích hoạt. 256GB màu Titan tự nhiên. Fullbox đầy đủ.', 28000000,
     28000000, 500000, 33000000, 9, 2, NULL, NOW(), NOW() + INTERVAL '3 days', true, true, 'ACTIVE', 0, NOW(), NOW()),
    ('Samsung Galaxy S24 Ultra', 'Máy Hàn Quốc 512GB. Bút S-Pen, màn hình 120Hz cực đẹp. Mới 99%.', 22000000, 22000000,
     400000, 27000000, 9, 3, NULL, NOW(), NOW() + INTERVAL '6 days', false, true, 'ACTIVE', 0, NOW(), NOW()),
    ('iPhone 14 Pro', 'Máy đã qua sử dụng 6 tháng. 256GB màu tím. Pin 92%, không trầy xước.', 18000000, 18000000,
     300000, 22000000, 9, 2, NULL, NOW(), NOW() + INTERVAL '2 days', true, false, 'ACTIVE', 0, NOW(), NOW()),
    ('Xiaomi 14 Pro', 'Máy mới 100%. Chip Snapdragon 8 Gen 3, RAM 12GB, 256GB. Camera Leica tuyệt đỉnh.', 15000000,
     15000000, 250000, 18000000, 9, 4, NULL, NOW(), NOW() + INTERVAL '8 days', true, true, 'ACTIVE', 0, NOW(), NOW()),

    -- Electronics - Tablets
    ('iPad Pro M2 11 inch', 'Mới 100% chưa kích hoạt. WiFi 256GB, màu bạc. Kèm Apple Pencil Gen 2.', 20000000, 20000000,
     400000, 25000000, 10, 2, NULL, NOW(), NOW() + INTERVAL '5 days', false, true, 'ACTIVE', 0, NOW(), NOW()),
    ('Samsung Galaxy Tab S9', 'Máy mới 99%. 256GB, màn hình 120Hz. Kèm bàn phím và bút S-Pen.', 12000000, 12000000,
     200000, 15000000, 10, 3, NULL, NOW(), NOW() + INTERVAL '4 days', true, true, 'ACTIVE', 0, NOW(), NOW()),

    -- Electronics - Headphones
    ('AirPods Pro Gen 2', 'Nguyên seal chưa mở hộp. USB-C, chống ồn cực tốt. Bảo hành Apple 1 năm.', 5500000, 5500000,
     100000, 6500000, 11, 2, NULL, NOW(), NOW() + INTERVAL '3 days', true, true, 'ACTIVE', 0, NOW(), NOW()),
    ('Sony WH-1000XM5', 'Tai nghe chống ồn hàng đầu. Mới 100%, màu đen. Âm thanh Hi-Res tuyệt vời.', 7000000, 7000000,
     150000, 8500000, 11, 4, NULL, NOW(), NOW() + INTERVAL '6 days', false, true, 'ACTIVE', 0, NOW(), NOW()),

    -- Fashion - Men
    ('Áo khoác da nam cao cấp', 'Da thật 100%, size L. Phong cách vintage Hàn Quốc. Mặc rất ấm và sang trọng.', 2000000,
     2000000, 50000, 2800000, 13, 3, NULL, NOW(), NOW() + INTERVAL '4 days', true, true, 'ACTIVE', 0, NOW(), NOW()),
    ('Quần jean Levi 511', 'Hàng chính hãng Mỹ. Size 32, màu xanh đậm. Mới 95%, ít dùng.', 800000, 800000, 20000,
     1200000, 13, 2, NULL, NOW(), NOW() + INTERVAL '3 days', false, false, 'ACTIVE', 0, NOW(), NOW()),
    ('Áo sơ mi Oxford', 'Cotton 100% cao cấp. Nhiều size và màu. Phù hợp đi làm, đi chơi.', 400000, 400000, 10000,
     600000, 13, 4, NULL, NOW(), NOW() + INTERVAL '5 days', true, true, 'ACTIVE', 0,
     NOW(), NOW()),

    -- Fashion - Women
    ('Váy dạ hội sang trọng', 'Váy dài qua gối, màu đỏ rượu. Chất liệu lụa cao cấp. Size M. Mặc 1 lần.', 1500000,
     1500000, 30000, 2200000, 14, 3, NULL, NOW(),
     NOW() + INTERVAL '7 days', true, true, 'ACTIVE', 0, NOW(), NOW()),
    ('Túi xách Gucci', 'Hàng authentic 100%. Màu be, size medium. Có hóa đơn và thẻ bảo hành.', 18000000, 18000000,
     300000, 22000000, 16, 2, NULL, NOW(),
     NOW() + INTERVAL '6 days', false, false, 'ACTIVE', 0, NOW(), NOW()),

    -- Fashion - Shoes
    ('Giày Nike Air Force 1', 'Hàng chính hãng US. Size 42, màu trắng full. Mới 100% nguyên box.', 2500000, 2500000,
     50000, 3200000, 15, 4, NULL, NOW(),
     NOW() + INTERVAL '4 days', true, true, 'ACTIVE', 0, NOW(), NOW()),
    ('Giày Adidas Ultraboost', 'Size 41, màu đen. Đế boost êm ái. Đi 2-3 lần, còn rất mới.', 1800000, 1800000, 40000,
     2500000, 15, 2, NULL, NOW(), NOW() + INTERVAL '5 days', true, true,
     'ACTIVE', 0, NOW(), NOW()),

    -- Fashion - Watches
    ('Đồng hồ Rolex Submariner', 'Hàng authentic có giấy tờ đầy đủ. Nam tính, sang trọng. Đeo ít lần.', 150000000,
     150000000, 2000000, 180000000, 17, 3, NULL, NOW(), NOW() + INTERVAL '10 days',
     false, false, 'ACTIVE', 0, NOW(), NOW()),
    ('Apple Watch Series 9', 'Mới 100% chưa kích hoạt. 45mm GPS + Cellular. Màu Midnight.', 10000000, 10000000, 200000,
     12000000, 17, 2, NULL, NOW(), NOW() + INTERVAL '3 days', true, true, 'ACTIVE', 0, NOW(), NOW()),

    -- Home & Living
    ('Bàn làm việc gỗ óc chó', 'Gỗ tự nhiên 100%. Kích thước 1.2m x 0.6m. Thiết kế hiện đại, chắc chắn.', 3500000,
     3500000, 70000, 4500000, 18, 4, NULL, NOW(), NOW() + INTERVAL '7 days', true, true, 'ACTIVE',
     0, NOW(), NOW()),
    ('Ghế gaming DXRacer', 'Như mới, dùng 2 tháng. Ngả 180 độ, tựa đầu và lưng. Màu đen đỏ thể thao.', 4000000, 4000000,
     80000, 5200000, 18, 3, NULL, NOW(),
     NOW() + INTERVAL '5 days', false, true, 'ACTIVE', 0, NOW(), NOW()),
    ('Nồi cơm điện Cuckoo', 'Nồi áp suất cao cấp Hàn Quốc. 1.8L, nấu cơm siêu ngon. Bảo hành 2 năm.', 3000000, 3000000,
     60000, 3800000, 19, 2, NULL, NOW(),
     NOW() + INTERVAL '4 days', true, true, 'ACTIVE', 0, NOW(), NOW()),

    -- Sports
    ('Xe đạp Giant road bike', 'Xe đạp đua cao cấp. Khung nhôm nhẹ, 21 số. Mới 90%, bảo dưỡng định kỳ.', 8000000,
     8000000, 150000, 10000000, 22, 4, NULL, NOW(), NOW() + INTERVAL '6 days', true,
     false, 'ACTIVE', 0, NOW(), NOW()),
    ('Tạ đơn 20kg bộ', 'Bộ tạ đơn tập gym tại nhà. Tổng 40kg, có thể tháo lắp. Rất mới.', 1500000, 1500000, 30000,
     2000000, 21, 3, NULL, NOW(), NOW() + INTERVAL '3 days', true,
     true, 'ACTIVE', 0, NOW(), NOW());

-- ============================================
-- PRODUCT IMAGES
-- ============================================
INSERT INTO product_images (product_id, image_url)
VALUES
    -- MacBook Pro images
    (1, 'https://example.com/macbook-pro-m3-1.jpg'),
    (1, 'https://example.com/macbook-pro-m3-2.jpg'),
    (1, 'https://example.com/macbook-pro-m3-3.jpg'),

    -- Dell XPS images
    (2, 'https://example.com/dell-xps-15-1.jpg'),
    (2, 'https://example.com/dell-xps-15-2.jpg'),

    -- Asus ROG images
    (3, 'https://example.com/asus-rog-g15-1.jpg'),
    (3, 'https://example.com/asus-rog-g15-2.jpg'),
    (3, 'https://example.com/asus-rog-g15-3.jpg'),

    -- iPhone 15 Pro Max images
    (5, 'https://example.com/iphone-15-pro-max-1.jpg'),
    (5, 'https://example.com/iphone-15-pro-max-2.jpg'),
    (5, 'https://example.com/iphone-15-pro-max-3.jpg'),

    -- Samsung S24 Ultra images
    (6, 'https://example.com/samsung-s24-ultra-1.jpg'),
    (6, 'https://example.com/samsung-s24-ultra-2.jpg'),

    -- Add more images for other products as needed
    (7, 'https://example.com/iphone-14-pro-1.jpg'),
    (8, 'https://example.com/xiaomi-14-pro-1.jpg'),
    (9, 'https://example.com/ipad-pro-m2-1.jpg'),
    (10, 'https://example.com/galaxy-tab-s9-1.jpg'),
    (11, 'https://example.com/airpods-pro-2-1.jpg'),
    (12, 'https://example.com/sony-wh1000xm5-1.jpg'),
    (13, 'https://example.com/leather-jacket-1.jpg'),
    (14, 'https://example.com/levis-511-1.jpg'),
    (15, 'https://example.com/oxford-shirt-1.jpg'),
    (16, 'https://example.com/evening-dress-1.jpg'),
    (17, 'https://example.com/gucci-bag-1.jpg'),
    (18, 'https://example.com/nike-air-force-1.jpg'),
    (19, 'https://example.com/adidas-ultraboost-1.jpg'),
    (20, 'https://example.com/rolex-submariner-1.jpg'),
    (21, 'https://example.com/apple-watch-9-1.jpg'),
    (22, 'https://example.com/wooden-desk-1.jpg'),
    (23, 'https://example.com/gaming-chair-1.jpg'),
    (24, 'https://example.com/rice-cooker-1.jpg'),
    (25, 'https://example.com/giant-bike-1.jpg'),
    (26, 'https://example.com/dumbbell-set-1.jpg')

-- ============================================
-- VERIFICATION
-- ============================================
-- You can run these queries to verify the data:
-- SELECT COUNT(*) FROM users;
-- SELECT COUNT(*) FROM categories;
-- SELECT COUNT(*) FROM products;
-- SELECT * FROM categories WHERE parent_id IS NULL;
-- SELECT p.name, c.name as category, u.full_name as seller FROM products p JOIN categories c ON p.category_id = c.id JOIN users u ON p.seller_id = u.id;