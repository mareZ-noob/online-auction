-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE product_description_history, product_images, watchlist, blocked_bidders,
--     questions, bids, ratings, transactions, upgrade_requests, refresh_tokens,
--     social_accounts, products, categories, users RESTART IDENTITY CASCADE;

-- Reset sequence
-- TRUNCATE TABLE watchlist, transactions, ratings, questions, product_images,product_description_history,
--     blocked_bidders, bids, products, categories RESTART IDENTITY;

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
VALUES
    -- ID: 1
    ('Electronics', 'Electronic devices and gadgets', NULL, NOW()),
    -- ID: 2
    ('Fashion', 'Clothing and accessories', NULL, NOW()),
    -- ID: 3
    ('Home And Garden', 'Home furniture and appliances', NULL, NOW()),
    -- ID: 4
    ('Sports', 'Sports equipment and apparel', NULL, NOW()),
    -- ID: 5
    ('Books', 'Books and stationery', NULL, NOW()),
    -- ID: 6
    ('Toys', 'Toys and games', NULL, NOW()),
    -- ID: 7
    ('Health And Beauty', 'Health care and beauty products', NULL, NOW()),
    -- ID: 8
    ('Collectibles And Art', 'Rare items, antiques and NFTs', NULL, NOW()),
    -- ID: 9
    ('Vehicles And Parts', 'Cars, motorcycles and parts', NULL, NOW()),
    -- ID: 10
    ('Jewelry And Watches', 'Luxury watches and jewelry', NULL, NOW()),
    -- ID: 11
    ('Real Estate', 'Property and land', NULL, NOW()),
    -- ID: 12
    ('Business And Industrial', 'Professional equipment', NULL, NOW()),
    -- ID: 13
    ('Musical Instruments', 'Guitars, pianos and drums', NULL, NOW()),
    -- ID: 14
    ('Pet Supplies', 'Supplies for dogs, cats and others', NULL, NOW()),
    -- ID: 15
    ('Video Games And Consoles', 'Games, consoles and accessories', NULL, NOW());

-- ============================================
-- CATEGORIES (Child Categories)
-- ============================================
INSERT INTO categories (name, description, parent_id, created_at)
VALUES
    -- 1. Electronics Children
    ('Laptops', 'Gaming laptops and notebooks', 1, NOW()),
    ('Smartphones', 'Mobile phones', 1, NOW()),
    ('Tablets', 'iPads and Android tablets', 1, NOW()),
    ('Headphones', 'Audio equipment', 1, NOW()),
    ('Cameras', 'Digital cameras and accessories', 1, NOW()),

    -- 2. Fashion Children
    ('Mens Fashion', 'Clothing for men', 2, NOW()),
    ('Womens Fashion', 'Clothing for women', 2, NOW()),
    ('Shoes', 'Footwear for all ages', 2, NOW()),
    ('Bags', 'Handbags and wallets', 2, NOW()),
    ('Watches', 'Daily wristwatches', 2, NOW()),

    -- 3. Home And Garden Children
    ('Furniture', 'Tables, chairs and decor', 3, NOW()),
    ('Kitchen', 'Kitchen tools and appliances', 3, NOW()),
    ('Lighting', 'Lamps and lighting', 3, NOW()),

    -- 4. Sports Children
    ('Gym Equipment', 'Workout equipment', 4, NOW()),
    ('Bicycles', 'Bikes and cycling gear', 4, NOW()),

    -- 5. Books Children
    ('Literature', 'Novels and fiction', 5, NOW()),
    ('Self Help', 'Skills and self-development', 5, NOW()),

    -- 8. Collectibles And Art Children
    ('Coins', 'Rare coins and currency', 8, NOW()),
    ('Stamps', 'Collectible stamps', 8, NOW()),
    ('Antiques', 'Vintage items', 8, NOW()),
    ('Digital Art NFTs', 'Non-fungible tokens', 8, NOW()),

    -- 9. Vehicles And Parts Children
    ('Cars', 'Automobiles', 9, NOW()),
    ('Motorcycles', 'Motorbikes and scooters', 9, NOW()),
    ('Parts And Accessories', 'Vehicle parts and tools', 9, NOW()),

    -- 10. Jewelry And Watches Children
    ('Luxury Watches', 'High-end timepieces', 10, NOW()),
    ('Necklaces', 'Gold and silver necklaces', 10, NOW()),
    ('Rings', 'Wedding and fashion rings', 10, NOW()),

    -- 11. Real Estate Children
    ('Land', 'Plots and land', 11, NOW()),
    ('Residential', 'Houses and apartments', 11, NOW()),
    ('Commercial', 'Offices and retail spaces', 11, NOW()),

    -- 12. Business And Industrial Children
    ('Office Equipment', 'Printers and copiers', 12, NOW()),
    ('Heavy Equipment', 'Construction machinery', 12, NOW()),
    ('Restaurant Supplies', 'Kitchen and bar equipment', 12, NOW()),

    -- 13. Musical Instruments Children
    ('Guitars', 'Electric and acoustic guitars', 13, NOW()),
    ('Pianos And Keyboards', 'Pianos and synthesizers', 13, NOW()),
    ('Drums And Percussion', 'Drum kits and percussion', 13, NOW()),

    -- 14. Pet Supplies Children
    ('Dog Supplies', 'Food and toys for dogs', 14, NOW()),
    ('Cat Supplies', 'Food and toys for cats', 14, NOW()),
    ('Fish And Aquariums', 'Tanks and fish food', 14, NOW()),

    -- 15. Video Games And Consoles Children
    ('Video Games', 'Game discs and cartridges', 15, NOW()),
    ('Consoles', 'PlayStation, Xbox, Nintendo', 15, NOW()),
    ('Gaming Accessories', 'Controllers and headsets', 15, NOW());

-- ============================================
-- VERIFICATION
-- ============================================
-- You can run these queries to verify the data:
-- SELECT COUNT(*) FROM users;
-- SELECT COUNT(*) FROM categories;
-- SELECT COUNT(*) FROM products;
-- SELECT * FROM categories WHERE parent_id IS NULL;
-- SELECT p.name, c.name as category, u.full_name as seller FROM products p JOIN categories c ON p.category_id = c.id JOIN users u ON p.seller_id = u.id;