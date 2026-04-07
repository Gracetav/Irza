const pool = require('../config/db');

// Dashboard - Statistics
exports.getDashboard = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
        const [products] = await pool.query('SELECT COUNT(*) as count FROM products');
        const [orders] = await pool.query('SELECT COUNT(*) as count FROM orders');
        const [pendingOrders] = await pool.query('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');

        res.render('admin/dashboard', { 
            title: 'Admin Dashboard',
            stats: {
                users: users[0].count,
                products: products[0].count,
                orders: orders[0].count,
                pending: pendingOrders[0].count
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// User Management
exports.getUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE role = "user" ORDER BY created_at DESC');
        res.render('admin/users', { title: 'User Management', users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Product Management
exports.getProducts = async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        res.render('admin/products', { title: 'Product Management', products });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.postAddProduct = async (req, res) => {
    const { name, price, stock, description } = req.body;
    const image = req.file ? req.file.filename : null;
    try {
        await pool.query('INSERT INTO products (name, price, stock, description, image) VALUES (?, ?, ?, ?, ?)', [name, price, stock, description, image]);
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.postEditProduct = async (req, res) => {
    const { id, name, price, stock, description } = req.body;
    let query = 'UPDATE products SET name = ?, price = ?, stock = ?, description = ? WHERE id = ?';
    let params = [name, price, stock, description, id];

    if (req.file) {
        query = 'UPDATE products SET name = ?, price = ?, stock = ?, description = ?, image = ? WHERE id = ?';
        params = [name, price, stock, description, req.file.filename, id];
    }

    try {
        await pool.query(query, params);
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// Order Confirmation
exports.getOrders = async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT orders.*, users.name as user_name, payments.proof, payments.status as payment_status 
            FROM orders 
            JOIN users ON orders.user_id = users.id 
            LEFT JOIN payments ON orders.id = payments.order_id 
            ORDER BY orders.created_at DESC
        `);
        res.render('admin/orders', { title: 'Order Management', orders });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.updateOrderStatus = async (req, res) => {
    const { order_id, status } = req.body;
    try {
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, order_id]);
        // Also update payment status if necessary
        await pool.query('UPDATE payments SET status = ? WHERE order_id = ?', [status, order_id]);
        res.redirect('/admin/orders');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
