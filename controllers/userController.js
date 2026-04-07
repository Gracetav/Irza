const pool = require('../config/db');

// Landing Page - Product Catalog
exports.getHome = async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        res.render('user/home', { title: 'MotoParts Store', products });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Product Detail
exports.getProductDetail = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.redirect('/');
        res.render('user/product-detail', { title: rows[0].name, product: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Cart Management
exports.getCart = (req, res) => {
    const cart = req.session.cart || [];
    res.render('user/cart', { title: 'My Cart', cart });
};

exports.addToCart = async (req, res) => {
    const { product_id, qty } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [product_id]);
        if (rows.length === 0) return res.redirect('/');
        
        const product = rows[0];
        let cart = req.session.cart || [];
        
        const index = cart.findIndex(item => item.id === parseInt(product_id));
        if (index > -1) {
            cart[index].qty += parseInt(qty);
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                qty: parseInt(qty)
            });
        }
        
        req.session.cart = cart;
        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updateCart = (req, res) => {
    const { id, qty } = req.body;
    let cart = req.session.cart || [];
    const index = cart.findIndex(item => item.id === parseInt(id));
    if (index > -1) {
        cart[index].qty = parseInt(qty);
    }
    req.session.cart = cart;
    res.redirect('/cart');
};

exports.removeFromCart = (req, res) => {
    const id = req.params.id;
    let cart = req.session.cart || [];
    req.session.cart = cart.filter(item => item.id !== parseInt(id));
    res.redirect('/cart');
};

// Checkout
exports.checkout = async (req, res) => {
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect('/cart');
    
    const user_id = req.session.user.id;
    const total_price = cart.reduce((total, item) => total + (item.price * item.qty), 0);
    
    try {
        const [result] = await pool.query('INSERT INTO orders (user_id, total_price) VALUES (?, ?)', [user_id, total_price]);
        const order_id = result.insertId;
        
        for (const item of cart) {
            await pool.query('INSERT INTO order_items (order_id, product_id, qty, price) VALUES (?, ?, ?, ?)', [order_id, item.id, item.qty, item.price]);
        }
        
        req.session.cart = []; // Clear cart
        res.redirect(`/order-status/${order_id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Order Status & Payment Proof
exports.getOrders = async (req, res) => {
    const user_id = req.session.user.id;
    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
        res.render('user/orders', { title: 'My Orders', orders });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.getOrderDetail = async (req, res) => {
    const order_id = req.params.id;
    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [order_id, req.session.user.id]);
        if (orders.length === 0) return res.redirect('/orders');
        
        const [items] = await pool.query(`
            SELECT order_items.*, products.name, products.image 
            FROM order_items 
            JOIN products ON order_items.product_id = products.id 
            WHERE order_id = ?
        `, [order_id]);

        const [payments] = await pool.query('SELECT * FROM payments WHERE order_id = ?', [order_id]);
        
        res.render('user/order-detail', { title: 'Order Detail', order: orders[0], items, payment: payments[0] || null });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.uploadProof = async (req, res) => {
    const { order_id } = req.body;
    const proof = req.file ? req.file.filename : null;
    if (!proof) return res.redirect(`/order-status/${order_id}`);
    
    try {
        await pool.query('INSERT INTO payments (order_id, proof) VALUES (?, ?)', [order_id, proof]);
        res.redirect(`/order-status/${order_id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
