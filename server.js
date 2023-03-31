const express = require('express');
const app = express();
const mongoose = require('mongoose');

const cors = require('cors');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;

const Users = require('./schemas/user')
const Investments = require('./schemas/Investment')


mongoose.connect('mongodb+srv://winij:oam12345@appdb.uvwnnq1.mongodb.net/AppDB', {
    useNewUrlParser: true
});


app.use(express.json());
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//api login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await Users.findOne({ email: email, password: md5(password) })

    if (!!user) {
        var token = jwt.sign({
            iss: user._id,
            email: user.email,
        }, "MyApp");

        res.json({ status: 'ok', message: 'login success', token });
    } else {
        res.json({ status: 'error', message: 'User not found' });
    }
});

//apiregister
app.post('/users', async (req, res) => {
    try {
        const payload = req.body;
        // check if user is exists
        const existsUser = await Users.findOne({ email: payload.email });
        if (existsUser) {
            res.json({ status: 'error', message: 'email is exists' });
            return;
        }
        // hash raw password to md5
        payload.password = md5(payload.password);
        const user = new Users(payload);
        await user.save();
        res.json({ status: 'ok', message: 'User is Created!' });
    } catch (error) {
        console.log(error.message);
    }
});

//api get all user
app.get('/users', async (req, res) => {
    try {
        const users = await Users.find();
        res.json(users);
    } catch (error) {
        console.log(error.message);
    }
});
//api investments
app.post('/investments', async (req, res) => {
    try {
        const payload = req.body;
        // check if investment already exists
        const existsInvestment = await Investments.findOne({ investment: payload.investment, roundNumber: payload.RroundNumber });
        if (existsInvestment) {
            res.json({ status: 'error', message: 'Investment already exists' });
            return;
        }
        // create new investment object
        const investment = new Investments(payload);
        await investment.save();
        res.json({ status: 'ok', message: 'Investment created!' });
    } catch (error) {
        console.log(error.message);
        res.json({ status: 'error', message: error.message });
    }
});

//api all investments
app.get('/investments', async (req, res) => {
    try {
        const investments = await Investments.find();
        res.json({ status: 'ok', investments: investments });
    } catch (error) {
        console.log(error.message);
        res.json({ status: 'error', message: error.message });
    }
});


//api get one invest

app.get('/investments/:id', async (req, res) => {
    const payload = req.body;
    const { _id } = req.params;
  
    const investment = await Investments.findByIdAndUpdate(id, { $set: payload });
    res.json(investment);
  });




//user one 
//   app.get('/users/me', async (req, res) => {
//     try {
//       const token = req.headers.authorization?.split(' ')[1];
//       if (!token) {
//         return res.status(401).json({ error: 'Missing authorization header' });
//       }
//       const { iss } = jwt.verify(token, 'MyApp');
//       const user = await Users.findOne({ _id: iss });
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }
//       return res.status(200).json({ user });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: 'Internal server error' });
//     }
//   });



app.get('/users/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ message: 'Authorization header missing' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const user = await Users.findOne({ _id: req.params.id });
        var decoded = jwt.verify(token, "MyApp").iss;
        const iss = decoded.iss;
        res.json({ status: 200, user });
    } catch (error) {
        console.log(error.message);
    }
});
//   app.get('/users/me', async (req, res) => {
//     try{
//       const token = req.headers.authorization.split(' ')[1];
//       var iss = jwt.verify(token, "MyApp").iss;
//       const user = await Users.findOne({_id: iss});
//       res.json({status: 200, user});
//     } catch(error) {
//       res.json({status: 204, error});
//     }
//   });


const PORT = 3000;
const server = app.listen(PORT, () => {
    console.log(`your server is running in http://localhost:${PORT}`);
});

process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.message}`);
    console.log(`Shutting down the server `);
    server.close(() => {
        process.exit(1);
    });
});

app.use(express.json());


