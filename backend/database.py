import pandas as pd
import json
import random
from datetime import datetime, timedelta
import requests
import os
from faker import Faker
import re
from difflib import SequenceMatcher
from collections import Counter

fake = Faker()

class IntelligentCategoryDetector:
    """Advanced category detection with multiple methods"""
    
    def __init__(self, existing_categories):
        self.existing_categories = existing_categories
        self.all_category_names = {
            cat_id: cat_info['name'].lower() 
            for cat_id, cat_info in existing_categories.items()
        }
    
    def method1_string_similarity(self, unknown_category, threshold=0.75):
        """String similarity matching"""
        best_match = None
        best_score = 0
        unknown_lower = unknown_category.lower()
        
        for cat_id, cat_name in self.all_category_names.items():
            similarity = SequenceMatcher(None, unknown_lower, cat_name).ratio()
            if similarity > best_score:
                best_score = similarity
                best_match = (cat_id, cat_name, similarity)
        
        if best_match and best_score >= threshold:
            return best_match[0], best_match[2]
        return None, 0
    
    def method2_keyword_extraction(self, text):
        """Keyword extraction and matching"""
        category_keywords = {
            # Electronics
            16: ['laptop', 'notebook', 'macbook', 'thinkpad', 'chromebook', 'ultrabook', 'gaming laptop'],
            17: ['phone', 'mobile', 'smartphone', 'iphone', 'samsung', 'xiaomi', 'oppo', 'pixel'],
            18: ['tablet', 'ipad', 'kindle', 'android tablet'],
            19: ['headphone', 'earphone', 'airpods', 'earbuds', 'headset', 'neckband', 'tws'],
            20: ['camera', 'dslr', 'lens', 'canon', 'nikon', 'gopro', 'mirrorless'],
            
            # Fashion
            21: ['men shirt', 'men tshirt', 'mens', "men's", 'boys', 'male', 'gents'],
            22: ['women dress', 'womens', "women's", 'dress', 'saree', 'kurti', 'girls', 'ladies'],
            23: ['shoes', 'sneakers', 'boots', 'sandals', 'footwear', 'loafers', 'heels'],
            24: ['bag', 'purse', 'handbag', 'backpack', 'wallet', 'clutch', 'sling'],
            25: ['watch', 'smartwatch', 'wristwatch', 'timepiece'],
            
            # Home And Garden
            26: ['furniture', 'desk', 'chair', 'table', 'sofa', 'bed', 'cabinet'],
            27: ['kitchen', 'cooker', 'pan', 'cookware', 'utensil', 'blender', 'mixer'],
            28: ['lamp', 'light', 'led', 'bulb', 'chandelier', 'lighting'],
            
            # Sports
            29: ['gym', 'fitness', 'dumbbell', 'yoga', 'exercise', 'weight', 'training'],
            30: ['bicycle', 'bike', 'cycle', 'cycling', 'mountain bike'],
            
            # Books
            31: ['book', 'novel', 'fiction', 'literature', 'poetry', 'autobiography'],
            32: ['self help', 'guide', 'tutorial', 'learn', 'course', 'skill'],
            
            # Collectibles And Art
            33: ['coin', 'currency', 'rare coin', 'numismatic'],
            34: ['stamp', 'collectible stamp', 'philately'],
            35: ['antique', 'vintage', 'rare', 'retro'],
            36: ['nft', 'digital art', 'crypto', 'blockchain'],
            
            # Vehicles
            37: ['car', 'automobile', 'sedan', 'suv', 'vehicle'],
            38: ['motorcycle', 'motorbike', 'scooter', 'bike'],
            39: ['auto parts', 'car parts', 'accessories', 'tools'],
            
            # Jewelry And Watches
            40: ['luxury watch', 'rolex', 'omega', 'patek', 'high-end watch'],
            41: ['necklace', 'gold necklace', 'silver necklace', 'pendant'],
            42: ['ring', 'wedding ring', 'engagement ring', 'diamond ring'],
            
            # Real Estate
            43: ['land', 'plot', 'property', 'acre'],
            44: ['house', 'apartment', 'residential', 'villa', 'flat'],
            45: ['office', 'commercial', 'retail', 'shop space'],
            
            # Business And Industrial
            46: ['printer', 'copier', 'office equipment', 'scanner'],
            47: ['heavy equipment', 'machinery', 'construction', 'excavator'],
            48: ['restaurant', 'kitchen equipment', 'bar', 'commercial kitchen'],
            
            # Musical Instruments
            49: ['guitar', 'acoustic guitar', 'electric guitar'],
            50: ['piano', 'keyboard', 'synthesizer', 'organ'],
            51: ['drum', 'percussion', 'drum kit', 'tambourine'],
            
            # Pet Supplies
            52: ['dog', 'puppy', 'canine', 'dog food'],
            53: ['cat', 'kitten', 'feline', 'cat food'],
            54: ['fish', 'aquarium', 'tank', 'aquatic'],
            
            # Video Games
            55: ['video game', 'game disc', 'cartridge', 'playstation', 'xbox'],
            56: ['console', 'gaming console', 'nintendo', 'playstation', 'xbox'],
            57: ['controller', 'joystick', 'gaming headset', 'gaming accessory'],
        }
        
        text_lower = text.lower()
        match_scores = {}
        
        for cat_id, keywords in category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                match_scores[cat_id] = score
        
        if match_scores:
            best_cat = max(match_scores, key=match_scores.get)
            return best_cat, match_scores[best_cat]
        return None, 0
    
    def method3_contextual_analysis(self, product_name, description=""):
        """Contextual analysis with weighted patterns"""
        text = (product_name + " " + description).lower()
        
        context_patterns = {
            # Parent categories
            1: {'strong': ['electronic', 'digital', 'tech', 'gadget', 'device', 'smart'],
                'moderate': ['portable', 'wireless']},
            2: {'strong': ['clothing', 'apparel', 'fashion', 'wear', 'outfit', 'style'],
                'moderate': ['size', 'color', 'fit']},
            3: {'strong': ['home', 'house', 'living', 'decor', 'furnish', 'interior'],
                'moderate': ['space', 'room']},
            4: {'strong': ['sport', 'fitness', 'exercise', 'athletic', 'training', 'outdoor'],
                'moderate': ['strength', 'endurance']},
            5: {'strong': ['book', 'read', 'novel', 'story', 'author', 'publication'],
                'moderate': ['knowledge', 'learn']},
            6: {'strong': ['toy', 'play', 'game', 'kids', 'children', 'fun'],
                'moderate': ['colorful', 'safe']},
            7: {'strong': ['health', 'beauty', 'cosmetic', 'skincare', 'wellness'],
                'moderate': ['natural', 'organic']},
            8: {'strong': ['collectible', 'rare', 'antique', 'vintage', 'nft', 'digital art'],
                'moderate': ['value', 'historic']},
            9: {'strong': ['car', 'vehicle', 'motorcycle', 'auto', 'motor', 'parts'],
                'moderate': ['engine', 'wheel']},
            10: {'strong': ['jewelry', 'watch', 'luxury', 'precious', 'gold', 'silver'],
                'moderate': ['diamond', 'gem']},
            11: {'strong': ['real estate', 'property', 'land', 'house', 'apartment', 'plot'],
                'moderate': ['construction', 'building']},
            12: {'strong': ['industrial', 'equipment', 'business', 'commercial', 'professional'],
                'moderate': ['machinery', 'office']},
            13: {'strong': ['music', 'instrument', 'guitar', 'piano', 'drum', 'percussion'],
                'moderate': ['sound', 'audio']},
            14: {'strong': ['pet', 'dog', 'cat', 'animal', 'aquatic', 'fish'],
                'moderate': ['food', 'toy']},
            15: {'strong': ['game', 'gaming', 'console', 'video game', 'playstation', 'xbox'],
                'moderate': ['controller', 'digital']},
        }
        
        scores = {}
        for cat_id, patterns in context_patterns.items():
            score = sum(2 for word in patterns['strong'] if word in text)
            score += sum(1 for word in patterns['moderate'] if word in text)
            if score > 0:
                scores[cat_id] = score
        
        if scores:
            best_cat = max(scores, key=scores.get)
            return best_cat, scores[best_cat]
        return None, 0
    
    def method4_word_frequency_analysis(self, text):
        """Word frequency analysis"""
        stopwords = {'the', 'a', 'an', 'and', 'or', 'is', 'it', 'in', 'to', 'of', 'for', 'with'}
        words = re.findall(r'\b\w+\b', text.lower())
        meaningful_words = [w for w in words if len(w) > 3 and w not in stopwords]
        word_freq = Counter(meaningful_words)
        
        category_word_map = {
            1: ['phone', 'laptop', 'camera', 'tablet', 'electronic'],
            2: ['dress', 'shirt', 'fashion', 'clothing', 'shoes'],
            3: ['furniture', 'chair', 'table', 'kitchen', 'light'],
            4: ['fitness', 'sport', 'yoga', 'exercise', 'gym'],
            5: ['book', 'novel', 'literature', 'reading'],
            6: ['toy', 'game', 'play', 'kids'],
            7: ['beauty', 'cosmetic', 'skincare', 'health'],
            8: ['antique', 'vintage', 'rare', 'collectible', 'nft'],
            9: ['car', 'motorcycle', 'vehicle', 'auto'],
            10: ['jewelry', 'watch', 'luxury', 'gold'],
            11: ['property', 'house', 'land', 'real estate'],
            12: ['equipment', 'industrial', 'commercial', 'machinery'],
            13: ['music', 'guitar', 'piano', 'instrument'],
            14: ['pet', 'dog', 'cat', 'animal'],
            15: ['game', 'console', 'gaming', 'playstation'],
        }
        
        best_cat = None
        best_count = 0
        
        for cat_id, category_words in category_word_map.items():
            count = sum(word_freq.get(w, 0) for w in category_words)
            if count > best_count:
                best_count = count
                best_cat = cat_id
        
        return best_cat, best_count
    
    def detect_intelligent(self, product_name, description="", raw_category=None):
        """Combined intelligent detection using voting system"""
        results = {}
        
        if raw_category and not pd.isna(raw_category):
            cat_id, score = self.method1_string_similarity(str(raw_category), threshold=0.7)
            if cat_id:
                results['similarity'] = (cat_id, score)
        
        text = (product_name + " " + description)
        cat_id, score = self.method2_keyword_extraction(text)
        if cat_id:
            results['keyword'] = (cat_id, score)
        
        cat_id, score = self.method3_contextual_analysis(product_name, description)
        if cat_id:
            results['context'] = (cat_id, score)
        
        cat_id, score = self.method4_word_frequency_analysis(text)
        if cat_id:
            results['frequency'] = (cat_id, score)
        
        if results:
            category_votes = {}
            for method_name, (cat_id, score) in results.items():
                category_votes[cat_id] = category_votes.get(cat_id, 0) + 1
            
            best_cat = max(category_votes, key=category_votes.get)
            confidence = category_votes[best_cat] / len(results)
            return best_cat, confidence
        
        return 1, 0.0


class DatasetImporter:
    def __init__(self, output_dir="imported_data", allow_new_categories=False, max_new_categories=5):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        self.allow_new_categories = allow_new_categories
        self.max_new_categories = max_new_categories
        self.valid_category_ids = list(range(1, 58))  # Updated: 1-57 categories now
        self.new_categories = {}
        
        # Updated category mapping based on new structure
        self.category_mapping = {
            # Electronics
            'electronics': 1, 'laptop': 16, 'phone': 17, 'tablet': 18, 
            'headphone': 19, 'camera': 20, 'smartphone': 17,
            
            # Fashion
            'fashion': 2, 'men': 21, 'women': 22, 'shoes': 23,
            'bags': 24, 'watches': 25, 'clothing': 2,
            
            # Home And Garden
            'home': 3, 'furniture': 26, 'kitchen': 27, 'lights': 28,
            
            # Sports
            'sports': 4, 'gym': 29, 'bicycle': 30, 'fitness': 29,
            
            # Books
            'books': 5, 'literature': 31, 'skills': 32,
            
            # Toys
            'toys': 6,
            
            # Health
            'health': 7, 'beauty': 7,
            
            # Collectibles
            'collectibles': 8, 'coins': 33, 'stamps': 34, 'antiques': 35, 'nft': 36,
            
            # Vehicles
            'vehicles': 9, 'cars': 37, 'motorcycles': 38, 'parts': 39,
            
            # Jewelry
            'jewelry': 10, 'watches': 25, 'necklaces': 41, 'rings': 42,
            
            # Real Estate
            'real estate': 11, 'land': 43, 'residential': 44, 'commercial': 45,
            
            # Business
            'business': 12, 'office': 46, 'equipment': 47, 'restaurant': 48,
            
            # Musical
            'music': 13, 'guitars': 49, 'pianos': 50, 'drums': 51,
            
            # Pets
            'pets': 14, 'dogs': 52, 'cats': 53, 'fish': 54,
            
            # Games
            'games': 15, 'video games': 55, 'consoles': 56, 'accessories': 57,
        }
        
        # Updated existing categories (15 parents + 42 children = 57 total)
        self.existing_categories = {
            # Parent categories
            1: {'name': 'Electronics', 'parent_id': None},
            2: {'name': 'Fashion', 'parent_id': None},
            3: {'name': 'Home And Garden', 'parent_id': None},
            4: {'name': 'Sports', 'parent_id': None},
            5: {'name': 'Books', 'parent_id': None},
            6: {'name': 'Toys', 'parent_id': None},
            7: {'name': 'Health And Beauty', 'parent_id': None},
            8: {'name': 'Collectibles And Art', 'parent_id': None},
            9: {'name': 'Vehicles And Parts', 'parent_id': None},
            10: {'name': 'Jewelry And Watches', 'parent_id': None},
            11: {'name': 'Real Estate', 'parent_id': None},
            12: {'name': 'Business And Industrial', 'parent_id': None},
            13: {'name': 'Musical Instruments', 'parent_id': None},
            14: {'name': 'Pet Supplies', 'parent_id': None},
            15: {'name': 'Video Games And Consoles', 'parent_id': None},
            
            # Electronics children
            16: {'name': 'Laptops', 'parent_id': 1},
            17: {'name': 'Smartphones', 'parent_id': 1},
            18: {'name': 'Tablets', 'parent_id': 1},
            19: {'name': 'Headphones', 'parent_id': 1},
            20: {'name': 'Cameras', 'parent_id': 1},
            
            # Fashion children
            21: {'name': 'Mens Fashion', 'parent_id': 2},
            22: {'name': 'Womens Fashion', 'parent_id': 2},
            23: {'name': 'Shoes', 'parent_id': 2},
            24: {'name': 'Bags', 'parent_id': 2},
            25: {'name': 'Watches', 'parent_id': 2},
            
            # Home And Garden children
            26: {'name': 'Furniture', 'parent_id': 3},
            27: {'name': 'Kitchen', 'parent_id': 3},
            28: {'name': 'Lighting', 'parent_id': 3},
            
            # Sports children
            29: {'name': 'Gym Equipment', 'parent_id': 4},
            30: {'name': 'Bicycles', 'parent_id': 4},
            
            # Books children
            31: {'name': 'Literature', 'parent_id': 5},
            32: {'name': 'Self Help', 'parent_id': 5},
            
            # Collectibles And Art children
            33: {'name': 'Coins', 'parent_id': 8},
            34: {'name': 'Stamps', 'parent_id': 8},
            35: {'name': 'Antiques', 'parent_id': 8},
            36: {'name': 'Digital Art NFTs', 'parent_id': 8},
            
            # Vehicles And Parts children
            37: {'name': 'Cars', 'parent_id': 9},
            38: {'name': 'Motorcycles', 'parent_id': 9},
            39: {'name': 'Parts And Accessories', 'parent_id': 9},
            
            # Jewelry And Watches children
            40: {'name': 'Luxury Watches', 'parent_id': 10},
            41: {'name': 'Necklaces', 'parent_id': 10},
            42: {'name': 'Rings', 'parent_id': 10},
            
            # Real Estate children
            43: {'name': 'Land', 'parent_id': 11},
            44: {'name': 'Residential', 'parent_id': 11},
            45: {'name': 'Commercial', 'parent_id': 11},
            
            # Business And Industrial children
            46: {'name': 'Office Equipment', 'parent_id': 12},
            47: {'name': 'Heavy Equipment', 'parent_id': 12},
            48: {'name': 'Restaurant Supplies', 'parent_id': 12},
            
            # Musical Instruments children
            49: {'name': 'Guitars', 'parent_id': 13},
            50: {'name': 'Pianos And Keyboards', 'parent_id': 13},
            51: {'name': 'Drums And Percussion', 'parent_id': 13},
            
            # Pet Supplies children
            52: {'name': 'Dog Supplies', 'parent_id': 14},
            53: {'name': 'Cat Supplies', 'parent_id': 14},
            54: {'name': 'Fish And Aquariums', 'parent_id': 14},
            
            # Video Games And Consoles children
            55: {'name': 'Video Games', 'parent_id': 15},
            56: {'name': 'Consoles', 'parent_id': 15},
            57: {'name': 'Gaming Accessories', 'parent_id': 15},
        }
        
        self.detector = IntelligentCategoryDetector(self.existing_categories)
    
    def clean_category_name(self, raw_category):
        """Clean and extract category name from various formats"""
        if not raw_category or pd.isna(raw_category):
            return None
        
        category_str = str(raw_category).strip()
        
        if category_str.startswith('[') and category_str.endswith(']'):
            try:
                import ast
                categories = ast.literal_eval(category_str)
                if isinstance(categories, list) and len(categories) > 0:
                    category_str = categories[0]
            except:
                category_str = category_str.strip('[]"\'')
        
        if '>>' in category_str:
            parts = [p.strip() for p in category_str.split('>>')]
            if len(parts) > 2:
                category_str = parts[-2]
            elif len(parts) > 1:
                category_str = parts[-1]
            else:
                category_str = parts[0]
        
        category_str = category_str.strip('"\'[] ')
        category_str = re.sub(r'\s+', ' ', category_str)
        
        if len(category_str) > 100:
            category_str = category_str[:100]
        
        return category_str if category_str else None
    
    def _determine_parent_category(self, text):
        """Determine parent category for new categories"""
        if any(word in text for word in ['electronic', 'digital', 'tech', 'computer', 'phone']):
            return 1
        elif any(word in text for word in ['fashion', 'clothing', 'wear', 'apparel', 'dress']):
            return 2
        elif any(word in text for word in ['home', 'house', 'furniture', 'kitchen']):
            return 3
        elif any(word in text for word in ['sport', 'fitness', 'gym', 'outdoor', 'exercise']):
            return 4
        elif any(word in text for word in ['book', 'read', 'literature', 'novel']):
            return 5
        elif any(word in text for word in ['toy', 'game', 'play', 'kid']):
            return 6
        elif any(word in text for word in ['health', 'beauty', 'cosmetic', 'care']):
            return 7
        elif any(word in text for word in ['antique', 'vintage', 'rare', 'collectible', 'nft']):
            return 8
        elif any(word in text for word in ['car', 'vehicle', 'motorcycle', 'auto']):
            return 9
        elif any(word in text for word in ['jewelry', 'watch', 'luxury', 'gold', 'silver']):
            return 10
        elif any(word in text for word in ['property', 'land', 'house', 'real estate']):
            return 11
        elif any(word in text for word in ['industrial', 'equipment', 'business', 'commercial']):
            return 12
        elif any(word in text for word in ['music', 'instrument', 'guitar', 'piano']):
            return 13
        elif any(word in text for word in ['pet', 'dog', 'cat', 'animal']):
            return 14
        elif any(word in text for word in ['game', 'gaming', 'console', 'video']):
            return 15
        else:
            return 1
    
    def detect_or_create_category(self, product_name, description="", raw_category=None):
        """Use intelligent detection to find category"""
        text = (product_name + " " + description).lower()
        
        if raw_category and not pd.isna(raw_category):
            category_name = self.clean_category_name(raw_category)
            
            if category_name:
                category_lower = category_name.lower()
                
                if category_lower in self.category_mapping:
                    return self.category_mapping[category_lower], False, None, None
                
                if not self.allow_new_categories:
                    category_id, confidence = self.detector.detect_intelligent(
                        product_name, description, raw_category
                    )
                    return category_id, False, None, None
                
                if len(self.new_categories) >= self.max_new_categories:
                    category_id, confidence = self.detector.detect_intelligent(
                        product_name, description, raw_category
                    )
                    return category_id, False, None, None
                
                if category_name not in self.new_categories:
                    parent_id = self._determine_parent_category(text)
                    self.new_categories[category_name] = parent_id
                    print(f"  → New category found: '{category_name}' (parent: {parent_id})")
                    return f"NEW_{len(self.new_categories)}", True, category_name, parent_id
                else:
                    return f"NEW_{list(self.new_categories.keys()).index(category_name) + 1}", True, category_name, self.new_categories[category_name]
        
        category_id, confidence = self.detector.detect_intelligent(
            product_name, description, raw_category
        )
        return category_id, False, None, None
    
    def extract_price(self, price_str):
        """Extract numeric price from string"""
        if pd.isna(price_str):
            return random.randint(100000, 5000000)
        
        price_str = str(price_str).replace(',', '').replace('₹', '')
        price_str = re.sub(r'[^\d.]', '', price_str)
        
        try:
            price = float(price_str)
            
            if price > 100 and price < 100000:
                price = price * 300
            elif price < 1000:
                price = price * 24000
            elif price > 100000:
                pass
            else:
                price = random.randint(100000, 5000000)
            
            if price > 100000000:
                price = random.randint(1000000, 50000000)
                
            return int(price)
        except:
            return random.randint(100000, 5000000)
    
    def generate_missing_fields(self, row):
        """Generate missing fields with realistic data"""
        product = {}
        
        if 'name' in row:
            product['name'] = str(row['name'])[:200]
        elif 'product_name' in row:
            product['name'] = str(row['product_name'])[:200]
        elif 'title' in row:
            product['name'] = str(row['title'])[:200]
        else:
            product['name'] = fake.catch_phrase()
        
        desc_fields = ['description', 'desc', 'product_description', 'details']
        product['description'] = None
        for field in desc_fields:
            if field in row and not pd.isna(row[field]):
                product['description'] = str(row[field])[:1000]
                break
        if not product['description']:
            product['description'] = fake.text(max_nb_chars=200)
        
        price_fields = ['price', 'selling_price', 'retail_price', 'final_price']
        starting_price = None
        for field in price_fields:
            if field in row and not pd.isna(row[field]):
                starting_price = self.extract_price(row[field])
                break
        if not starting_price:
            starting_price = random.randint(100000, 5000000)
        
        product['starting_price'] = starting_price
        product['current_price'] = starting_price
        
        step_price = int(starting_price * random.uniform(0.02, 0.05))
        product['step_price'] = max(10000, min(500000, step_price))
        
        product['buy_now_price'] = int(starting_price * random.uniform(1.15, 1.35))
        
        raw_category = row.get('product_category_tree') or row.get('category') or row.get('product_type')
        
        category_id, is_new, cat_name, parent_id = self.detect_or_create_category(
            product['name'], 
            product['description'],
            raw_category
        )
        
        product['category_id'] = category_id
        product['is_new_category'] = is_new
        product['category_name'] = cat_name
        product['category_parent_id'] = parent_id
        
        if not is_new and category_id not in self.valid_category_ids:
            product['category_id'] = 1
            product['is_new_category'] = False
        
        product['seller_id'] = random.randint(2, 4)
        product['status'] = 'ACTIVE'
        
        start_time = datetime.now() - timedelta(days=random.randint(0, 3))
        end_time = start_time + timedelta(days=random.randint(3, 14))
        product['start_time'] = start_time.strftime('%Y-%m-%d %H:%M:%S')
        product['end_time'] = end_time.strftime('%Y-%m-%d %H:%M:%S')
        
        product['auto_extend'] = random.choice([True, False])
        product['allow_unrated_bidders'] = random.choice([True, True, False])
        product['bid_count'] = random.randint(0, 5)
        
        image_fields = ['image', 'images', 'image_url', 'image_urls', 'product_image']
        product['images'] = []
        for field in image_fields:
            if field in row and not pd.isna(row[field]):
                img_data = str(row[field])
                if img_data.startswith('['):
                    try:
                        imgs = json.loads(img_data.replace("'", '"'))
                        product['images'] = imgs if isinstance(imgs, list) else [imgs]
                    except:
                        product['images'] = [img_data]
                else:
                    product['images'] = [img_data]
                break
        
        if not product['images']:
            product['images'] = [f"https://via.placeholder.com/500?text={product['name'][:20]}"]
        
        return product
    
    def process_dataset(self, filepath, file_type='csv', max_records=100):
        """Process dataset and generate SQL"""
        print(f"\nProcessing {filepath}...")
        print(f"Using intelligent category detection with 57 categories...")
        
        if file_type == 'csv':
            encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
            df = None
            for encoding in encodings:
                try:
                    df = pd.read_csv(filepath, encoding=encoding)
                    print(f"Loaded {len(df)} records from {filepath}")
                    break
                except:
                    continue
            if df is None:
                raise Exception(f"Could not read {filepath}")
        else:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            df = pd.DataFrame(data)
            print(f"Loaded {len(df)} records from {filepath}")
        
        df = df.head(max_records)
        
        products = []
        for idx, row in df.iterrows():
            try:
                product = self.generate_missing_fields(row)
                products.append(product)
            except Exception as e:
                print(f"Error processing row {idx}: {e}")
                continue
        
        print(f"Processed {len(products)} products")
        
        sql_file = self.generate_sql(products)
        
        json_file = f"{self.output_dir}/processed_products.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        print(f"Exported JSON: {json_file}")
        
        return products, sql_file
    
    def generate_sql(self, products):
        """Generate SQL INSERT statements"""
        sql_file = f"{self.output_dir}/import_products.sql"
        
        category_counts = {}
        new_category_products = {}
        
        for idx, product in enumerate(products):
            cat_id = product['category_id']
            category_counts[cat_id] = category_counts.get(cat_id, 0) + 1
            
            if product.get('is_new_category'):
                cat_name = product['category_name']
                if cat_name not in new_category_products:
                    new_category_products[cat_name] = []
                new_category_products[cat_name].append(idx)
        
        with open(sql_file, 'w', encoding='utf-8') as f:
            f.write("-- Auto-generated product imports for PostgreSQL\n")
            f.write(f"-- Generated: {datetime.now().isoformat()}\n")
            f.write(f"-- Detection Method: Intelligent Multi-Method Voting\n")
            f.write(f"-- Total Categories Available: 57\n")
            f.write(f"-- Total products: {len(products)}\n\n")
            
            if self.new_categories:
                f.write("-- ============================================\n")
                f.write("-- NEW CATEGORIES TO CREATE\n")
                f.write("-- ============================================\n\n")
                
                var_counter = 1
                for cat_name, parent_id in self.new_categories.items():
                    cat_name_escaped = cat_name.replace("'", "''")
                    parent_name = self.existing_categories[parent_id]['name']
                    var_name = f"new_cat_{var_counter}"
                    
                    f.write(f"-- Creating: {cat_name} (under {parent_name})\n")
                    f.write(f"DO $\n")
                    f.write(f"DECLARE\n")
                    f.write(f"    {var_name} INTEGER;\n")
                    f.write(f"BEGIN\n")
                    f.write(f"    INSERT INTO categories (name, description, parent_id, created_at)\n")
                    f.write(f"    VALUES ('{cat_name_escaped}', 'Auto-imported category', {parent_id}, NOW())\n")
                    f.write(f"    RETURNING id INTO {var_name};\n")
                    f.write(f"END $;\n\n")
                    
                    for idx in new_category_products.get(cat_name, []):
                        products[idx]['category_var'] = var_name
                    
                    var_counter += 1
                
                f.write("\n")
            
            f.write("-- Category distribution:\n")
            for cat_id, count in sorted(category_counts.items(), key=lambda x: x[0]):
                cat_name = self.existing_categories.get(cat_id, {}).get('name', 'Unknown')
                f.write(f"--   {cat_name}: {count} products\n")
            f.write("\n")
            
            f.write("-- ============================================\n")
            f.write("-- PRODUCT INSERTS\n")
            f.write("-- ============================================\n\n")
            
            for product in products:
                name = product['name'].replace("'", "''")
                desc = product['description'].replace("'", "''")
                cat_id = product['category_id']
                
                f.write(f"-- {name[:50]}\n")
                f.write(f"WITH new_product AS (\n")
                f.write(f"    INSERT INTO products (\n")
                f.write(f"        name, description, starting_price, current_price, step_price,\n")
                f.write(f"        buy_now_price, category_id, seller_id, status, start_time,\n")
                f.write(f"        end_time, auto_extend, allow_unrated_bidders, bid_count,\n")
                f.write(f"        created_at, updated_at\n")
                f.write(f"    ) VALUES (\n")
                f.write(f"        '{name}',\n")
                f.write(f"        '{desc}',\n")
                f.write(f"        {product['starting_price']},\n")
                f.write(f"        {product['current_price']},\n")
                f.write(f"        {product['step_price']},\n")
                f.write(f"        {product['buy_now_price']},\n")
                f.write(f"        {cat_id},\n")
                f.write(f"        {product['seller_id']},\n")
                f.write(f"        '{product['status']}',\n")
                f.write(f"        '{product['start_time']}',\n")
                f.write(f"        '{product['end_time']}',\n")
                f.write(f"        {str(product['auto_extend']).lower()},\n")
                f.write(f"        {str(product['allow_unrated_bidders']).lower()},\n")
                f.write(f"        {product['bid_count']},\n")
                f.write(f"        NOW(),\n")
                f.write(f"        NOW()\n")
                f.write(f"    ) RETURNING id\n")
                f.write(f")\n")
                
                if product['images']:
                    f.write(f"INSERT INTO product_images (product_id, image_url)\n")
                    f.write(f"SELECT new_product.id, image_url\n")
                    f.write(f"FROM new_product, (VALUES\n")
                    for i, img_url in enumerate(product['images'][:3]):
                        img_url_escaped = img_url.replace("'", "''")
                        comma = ',' if i < len(product['images'][:3]) - 1 else ''
                        f.write(f"    ('{img_url_escaped}'){comma}\n")
                    f.write(f") AS images(image_url);\n\n")
                else:
                    f.write(f"SELECT 1;\n\n")
        
        print(f"\nGenerated SQL: {sql_file}")
        
        if self.new_categories:
            print(f"\nNew Categories ({len(self.new_categories)}):")
            for cat_name, parent_id in self.new_categories.items():
                parent_name = self.existing_categories[parent_id]['name']
                print(f"  - {cat_name} (under {parent_name})")
        
        print(f"\nCategory Distribution:")
        for cat_id, count in sorted(category_counts.items(), key=lambda x: x[0]):
            cat_name = self.existing_categories.get(cat_id, {}).get('name', 'Unknown')
            print(f"  {cat_name}: {count} products")
        
        return sql_file


# ============================================
# USAGE EXAMPLES
# ============================================

def import_flipkart_intelligent():
    """Import with intelligent category detection - no new categories"""
    importer = DatasetImporter(
        allow_new_categories=False
    )
    
    filepath = "flipkart_com-ecommerce_sample.csv"
    if os.path.exists(filepath):
        products, sql_file = importer.process_dataset(
            filepath, 
            file_type='csv', 
            max_records=1000
        )
        print(f"\nAll products mapped using intelligent detection")
        print(f"SQL file: {sql_file}")
    else:
        print(f"File not found: {filepath}")
        print("Download from: https://www.kaggle.com/datasets/PromptCloudHQ/flipkart-products")


def import_flipkart_limited():
    """Import with intelligent detection + limited new categories"""
    importer = DatasetImporter(
        allow_new_categories=True,
        max_new_categories=5
    )
    
    filepath = "flipkart_com-ecommerce_sample.csv"
    if os.path.exists(filepath):
        products, sql_file = importer.process_dataset(
            filepath, 
            file_type='csv', 
            max_records=1000
        )
        print(f"\nMapped with intelligent detection + up to 5 new categories")
        print(f"SQL file: {sql_file}")
    else:
        print(f"File not found: {filepath}")


def import_custom_intelligent(filepath, max_records=100):
    """Import any CSV with intelligent detection"""
    importer = DatasetImporter(
        allow_new_categories=False
    )
    products, sql_file = importer.process_dataset(
        filepath,
        file_type='csv',
        max_records=max_records
    )
    print(f"\nGenerated {len(products)} products")
    print(f"SQL file: {sql_file}")
    return products


if __name__ == "__main__":
    import_flipkart_intelligent()