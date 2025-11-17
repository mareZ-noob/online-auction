-- ==================== CREATE DATABASE ====================
CREATE DATABASE IF NOT EXISTS auction_db
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE auction_db;

-- ==================== DROP EXISTING TABLES ====================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS blocked_bidders;
DROP TABLE IF EXISTS blocked_bidders;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS watchlist;
DROP TABLE IF EXISTS bids;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS product_description_history;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS upgrade_requests;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS otps;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ==================== SAMPLE DATA INSERTION ====================

-- Insert Admin User (password: admin123)
INSERT INTO users (email, password, full_name, role, email_verified, is_active, positive_ratings, negative_ratings, created_at, updated_at)
VALUES ('admin@auction.com', '$2a$10$X5wFWHkbXfLD4cXXL4o.6eYZZZh7f7Q2f4q4z4z4z4z4z4z4z4z4z', 'Admin User', 'ADMIN', true, true, 0, 0, NOW(), NOW());

-- Insert Sample Sellers
INSERT INTO users (email, password, full_name, address, role, email_verified, is_active, positive_ratings, negative_ratings, created_at, updated_at)
VALUES
('seller1@auction.com', '$2a$10$X5wFWHkbXfLD4cXXL4o.6eYZZZh7f7Q2f4q4z4z4z4z4z4z4z4z4z', 'Nguyễn Văn A', '123 Lê Lợi, Q1, HCM', 'SELLER', true, true, 15, 2, NOW(), NOW()),
('seller2@auction.com', '$2a$10$X5wFWHkbXfLD4cXXL4o.6eYZZZh7f7Q2f4q4z4z4z4z4z4z4z4z4z', 'Trần Thị B', '456 Nguyễn Huệ, Q1, HCM', 'SELLER', true, true, 20, 1, NOW(), NOW()),
('seller3@auction.com', '$2a$10$X5wFWHkbXfLD4cXXL4o.6eYZZZh7f7Q2f4q4z4z4z4z4z4z4z4z4z', 'Lê Văn C', '789 Võ Văn Tần, Q3, HCM', 'SELLER', true, true, 18, 3, NOW(), NOW());

-- Insert Sample Bidders
INSERT INTO users (email, password, full_name, address, role, email_verified, is_active, positive_ratings, negative_ratings, created_at, updated_at)
VALUES
('bidder1@auction.com', '$2a$10$X5wFWHkbXfLD4cXXL4o.6eYZZZh7f7Q2f4q4z4z4z4z4z4z4z4z4z', 'Phạm Văn D', '321 Pasteur, Q1, HCM', 'BIDDER', true, true, 10, 1, NOW(), NOW()),
('bidder2@auction.com', '$2a$10$X5wFWHkbXfLD4cXXL4o.6eYZZZh7f7Q2f4q4z4z4z4z4z4z4z4z4z', 'Hoàng Thị E', '654 Lý Tự Trọng, Q1, HCM', 'BIDDER', true, true, 12, 2, NOW(), NOW()),
('bidder3@auction.com', '$2a$10$X5wFWHkbXfLD4cXXL4o.6eYZZZh7f7Q2f4q4z4z4z4z4z4z4z4z4z', 'Võ Văn F', '987 Hai Bà Trưng, Q3, HCM', 'BIDDER', true, true, 8, 1, NOW(), NOW());

-- Insert Root Categories
INSERT INTO categories (name, description, parent_id, created_at)
VALUES
('Điện tử', 'Các sản phẩm điện tử', NULL, NOW()),
('Thời trang', 'Các sản phẩm thời trang', NULL, NOW()),
('Đồ gia dụng', 'Các sản phẩm gia dụng', NULL, NOW()),
('Sách & Văn phòng phẩm', 'Sách và đồ dùng văn phòng', NULL, NOW());

-- Insert Sub-categories
INSERT INTO categories (name, description, parent_id, created_at)
VALUES
('Điện thoại di động', 'Smartphone và phụ kiện', 1, NOW()),
('Máy tính xách tay', 'Laptop và phụ kiện', 1, NOW()),
('Tai nghe', 'Tai nghe và loa', 1, NOW()),
('Giày', 'Giày dép các loại', 2, NOW()),
('Đồng hồ', 'Đồng hồ đeo tay', 2, NOW()),
('Túi xách', 'Túi xách, balo', 2, NOW());

-- Insert Sample Products (Electronics - Phones)
INSERT INTO products (name, description, starting_price, current_price, step_price, buy_now_price, category_id, seller_id, start_time, end_time, auto_extend, allow_unrated_bidders, status, bid_count, created_at, updated_at)
VALUES
('iPhone 13 Pro Max 256GB',
'iPhone 13 Pro Max màu xanh Sierra, bộ nhớ 256GB. Máy đẹp như mới, fullbox, còn bảo hành 6 tháng. Pin 100%, không trầy xước.',
18000000, 20500000, 100000, 25000000, 5, 2, NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), false, true, 'ACTIVE', 8, NOW(), NOW()),

('Samsung Galaxy S22 Ultra',
'Samsung Galaxy S22 Ultra màu đen, bộ nhớ 512GB. Máy mới 99%, fullbox, còn bảo hành chính hãng 10 tháng.',
15000000, 17200000, 100000, 22000000, 5, 3, NOW(), DATE_ADD(NOW(), INTERVAL 2 DAY), true, true, 'ACTIVE', 12, NOW(), NOW()),

('Xiaomi 13 Pro',
'Xiaomi 13 Pro màu trắng, bộ nhớ 256GB. Máy đẹp, không trầy xước, fullbox nguyên seal.',
12000000, 13500000, 100000, 16000000, 5, 2, NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY), false, false, 'ACTIVE', 6, NOW(), NOW());

-- Insert Sample Products (Electronics - Laptops)
INSERT INTO products (name, description, starting_price, current_price, step_price, buy_now_price, category_id, seller_id, start_time, end_time, auto_extend, allow_unrated_bidders, status, bid_count, created_at, updated_at)
VALUES
('MacBook Pro 14 inch M2 Pro',
'MacBook Pro 14 inch chip M2 Pro, RAM 16GB, SSD 512GB. Máy mới 99%, fullbox, còn bảo hành Apple 11 tháng.',
40000000, 42500000, 200000, 50000000, 6, 2, NOW(), DATE_ADD(NOW(), INTERVAL 4 DAY), true, true, 'ACTIVE', 5, NOW(), NOW()),

('Dell XPS 15',
'Dell XPS 15 9520, Core i7-12700H, RAM 32GB, SSD 1TB, RTX 3050Ti. Máy đẹp, fullbox.',
28000000, 30200000, 200000, 38000000, 6, 3, NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), false, true, 'ACTIVE', 7, NOW(), NOW());

-- Insert Sample Products (Fashion - Shoes)
INSERT INTO products (name, description, starting_price, current_price, step_price, buy_now_price, category_id, seller_id, start_time, end_time, auto_extend, allow_unrated_bidders, status, bid_count, created_at, updated_at)
VALUES
('Nike Air Jordan 1 High',
'Nike Air Jordan 1 High OG màu Black Toe, size 42. Giày new 100%, fullbox, chưa sử dụng.',
5000000, 5800000, 50000, 7500000, 8, 4, NOW(), DATE_ADD(NOW(), INTERVAL 6 DAY), false, true, 'ACTIVE', 9, NOW(), NOW()),

('Adidas Yeezy Boost 350 V2',
'Adidas Yeezy Boost 350 V2 màu Cream White, size 41. Giày đẹp 99%, fullbox.',
4000000, 4500000, 50000, 6000000, 8, 3, NOW(), DATE_ADD(NOW(), INTERVAL 4 DAY), true, true, 'ACTIVE', 4, NOW(), NOW());

-- Insert Sample Products (Fashion - Watches)
INSERT INTO products (name, description, starting_price, current_price, step_price, buy_now_price, category_id, seller_id, start_time, end_time, auto_extend, allow_unrated_bidders, status, bid_count, created_at, updated_at)
VALUES
('Rolex Submariner Date',
'Rolex Submariner Date 116610LN, máy automatic, mặt đen. Đồng hồ đẹp 98%, fullbox, giấy tờ đầy đủ.',
150000000, 165000000, 1000000, 200000000, 9, 2, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), false, false, 'ACTIVE', 3, NOW(), NOW()),

('Omega Speedmaster Professional',
'Omega Speedmaster Professional Moonwatch, máy manual wind. Đồng hồ đẹp, fullbox, còn bảo hành.',
80000000, 85000000, 500000, 100000000, 9, 4, NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY), true, false, 'ACTIVE', 2, NOW(), NOW());

-- Insert Product Images
INSERT INTO product_images (product_id, image_url)
VALUES
(1, '/uploads/iphone13-1.jpg'),
(1, '/uploads/iphone13-2.jpg'),
(1, '/uploads/iphone13-3.jpg'),
(2, '/uploads/samsung-s22-1.jpg'),
(2, '/uploads/samsung-s22-2.jpg'),
(2, '/uploads/samsung-s22-3.jpg'),
(3, '/uploads/xiaomi13-1.jpg'),
(3, '/uploads/xiaomi13-2.jpg'),
(3, '/uploads/xiaomi13-3.jpg');

-- Insert Sample Bids
INSERT INTO bids (product_id, user_id, amount, max_auto_bid_amount, is_auto_bid, created_at)
VALUES
-- iPhone 13 Pro Max bids
(1, 5, 18500000, NULL, false, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 6, 19000000, NULL, false, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 7, 19500000, NULL, false, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(1, 5, 20000000, NULL, false, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(1, 6, 20500000, NULL, false, DATE_SUB(NOW(), INTERVAL 2 HOUR)),

-- Samsung S22 bids
(2, 5, 15500000, 18000000, true, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 7, 16000000, NULL, false, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(2, 6, 16500000, NULL, false, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(2, 5, 17200000, 18000000, true, DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- Insert Sample Questions
INSERT INTO questions (product_id, user_id, question, answer, answered_at, created_at)
VALUES
(1, 5, 'Máy có bị lỗi gì không ạ?', 'Máy không có lỗi gì, hoạt động tốt ạ.', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 6, 'Pin còn chai không?', 'Pin 100%, còn rất tốt ạ.', DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 7, 'Máy có kèm sạc nhanh không?', 'Có ạ, fullbox kèm sạc nhanh 45W.', DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Insert Sample Watchlist
INSERT INTO watchlist (user_id, product_id, added_at)
VALUES
(5, 2, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 3, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(6, 4, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 5, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ==================== INDEXES FOR PERFORMANCE ====================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Products indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_end_time ON products(end_time);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_current_price ON products(current_price);
CREATE INDEX idx_products_bid_count ON products(bid_count);

-- Bids indexes
CREATE INDEX idx_bids_product ON bids(product_id);
CREATE INDEX idx_bids_user ON bids(user_id);
CREATE INDEX idx_bids_created_at ON bids(created_at);
CREATE INDEX idx_bids_amount ON bids(amount);

-- Full-text search indexes
CREATE FULLTEXT INDEX idx_products_search ON products(name, description);

-- ==================== END ====================

SELECT 'Database initialized successfully!' as message;