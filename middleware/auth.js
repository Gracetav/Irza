exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

exports.isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).send('Access Denied: Admins Only');
};

exports.isGuest = (req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    res.redirect('/');
};
