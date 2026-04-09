-- 1. SETUP DATABASE
CREATE DATABASE IF NOT EXISTS motoparts_db;
USE motoparts_db;

-- 2. BERSIHKAN TABEL LAMA (URUTANNYA GAK BOLEH ASAL BIAR GAK ERROR)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. BUAT TABEL-TABEL UTAMA

-- Tabel Pengguna
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Produk
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    stock INT NOT NULL,
    image VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Pesanan (Orders)
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_price DECIMAL(15, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'rejected', 'shipped') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel Detail Pesanan (Order Items)
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    qty INT NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Tabel Pembayaran (Bukti Transfer)
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    proof VARCHAR(255) NOT NULL,
    status ENUM('pending', 'confirmed', 'rejected', 'shipped') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- --- SEED DATA ---

-- Admin User (Password: admin123)
-- Hash generated using bcrypt
INSERT INTO users (name, email, password, role) VALUES 
('Admin MotoParts', 'admin@motoparts.com', '$2a$10$Xm3p2jG.nUf0P6n7kH3IueN1.kG8yRzGvY6B7NlJg9p1s.G7n8oG.', 'admin');

-- Produk Contoh
INSERT INTO products (name, price, stock, description) VALUES 
('Knalpot Racing Proliner', 950000.00, 10, 'Knalpot racing suara gahar untuk kelas 150cc.'),
('Oli Shell Advance Ultra', 110000.00, 30, 'Oli fully synthetic untuk daya tahan mesin maksimal.'),
('Ban FDR Sport XR Evo', 320000.00, 20, 'Ban dengan daya grip tinggi untuk penggunaan harian.'),
('Busi Iridium NGK', 125000.00, 50, 'Busi iridium untuk api yang lebih stabil dan kencang.');
