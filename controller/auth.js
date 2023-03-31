const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../schemas/user');

exports.signup = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(dbUser => {
            if (dbUser) {
                return res.status(409).json({ message: "email already exists" });
            } else if (req.body.email && req.body.password) {
                bcrypt.hash(req.body.password, 12)
                    .then(passwordHash => {
                        const user = new User({
                            email: req.body.email,
                            name: req.body.name,
                            password: passwordHash
                        });
                        return user.save()
                            .then(() => {
                                res.status(200).json({ message: "user created" });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(502).json({ message: "error while creating the user" });
                            });
                    })
                    .catch(err => {
                        return res.status(500).json({ message: "couldnt hash the password" });
                    });
            } else if (!req.body.password) {
                return res.status(400).json({ message: "password not provided" });
            } else if (!req.body.email) {
                return res.status(400).json({ message: "email not provided" });
            };
        })
        .catch(err => {
            console.log('error', err);
        });
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(dbUser => {
            if (!dbUser) {
                return res.status(404).json({ message: "user not found" });
            } else {
                bcrypt.compare(req.body.password, dbUser.password)
                    .then(compareRes => {
                        if (compareRes) {
                            const token = jwt.sign({ email: req.body.email }, 'secret', { expiresIn: '1h' });
                            res.status(200).json({ message: "user logged in", "token": token });
                        } else {
                            res.status(401).json({ message: "invalid credentials" });
                        }
                    })
                    .catch(err => {
                        res.status(502).json({ message: "error while checking user password" });
                    });
            }
        })
        .catch(err => {
            console.log('error', err);
        });
};

exports.isAuth = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        return res.status(401).json({ message: 'not authenticated' });
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'secret');
    } catch (err) {
        return res.status(500).json({ message: err.message || 'could not decode the token' });
    }
    if (!decodedToken) {
        res.status(401).json({ message: 'unauthorized' });
    } else {
        const email = decodedToken.email;
        User.findOne({ email: email })
            .then(user => {
                console.log(user);
                res.status(200).json({  message: 'Login success' , "data": user });
            })
            .catch(err => {
                console.log('error', err);
            });
    }
};
