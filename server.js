const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;
const router = express.Router();
const Users = require('./schemas/user')
const Investments = require('./schemas/Investment')
const ChartModel= require('./schemas/chart')

mongoose.connect('mongodb+srv://winij:oam12345@appdb.uvwnnq1.mongodb.net/AppDB', {
    useNewUrlParser: true
}).then(() => {
    console.log('DATABASE IS CONNECT SUCCESSFUL :)');
  })
  .catch(() => {
    console.log('DATABASE CONNECT FAILED :(');
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
    const user = await Users.findOne({ email: email, password: md5(password) });

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

app.get('/users', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    jwt.verify(token, 'MyApp', async (err, decoded) => {
        if (err) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }

        const user = await Users.findOne({ email: decoded.email });

        if (!!user) {
            res.json({ status: 'ok', message: 'User found', data: user });
        } else {
            res.json({ status: 'error', message: 'User not found' });
        }
    });
});

app.get('/user', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decodedToken = jwt.verify(token, 'MyApp');
      const user = await Users.findById(decodedToken.iss).select('-password');
      if (!!user) {
        res.json({ status: 'ok', message: 'user data', user });
      } else {
        res.json({ status: 'error', message: 'User not found' });
      }
    } catch (error) {
      res.json({ status: 'error', message: 'Invalid token' });
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
app.get('/usersall', async (req, res) => {
    try {
        const users = await Users.find();
        res.json(users);
    } catch (error) {
        console.log(error.message);
    }
});
//api get one user
app.get('/users/:id', async (req, res) => {
    try {
        const user = await Users.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: 'error', message: error.message });
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

//api push payment on investment
app.post('/investments/:id/payment', async (req, res) => {
  try {
    const id = req.params.id;
    const payment = req.body.payment;

    const investment = await Investments.findById(id);
    if (!investment) {
      res.status(404).json({ status: 'error', message: 'Investment not found' });
      return;
    }

    investment.payment.push(payment);
    investment.spendings.push({ spendthing: payment.spendthing, costvalue: payment.costvalue });
    await investment.save();

    res.json({ status: 'ok', message: 'Payment submitted successfully', investment });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: 'error', message: error.message });
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
app.get('/investments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const investment = await Investments.findById(id);
    if (investment) {
      res.json({ status: 'ok', investment: investment });
    } else {
      res.json({ status: 'error', message: 'Investment not found' });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ status: 'error', message: error.message });
  }
});

//api delete invest
app.delete('/investments/:id', async (req, res) => {
  
  const { id } = req.params;
  try {
    const investmentId = mongoose.Types.ObjectId(id);
    const investment = await Investments.findById(investmentId);
    if (investment) {
      await investment.delete();
      res.json({ status: 'ok', message: 'Investment deleted successfully' });
    } else {
      res.status(404).json({ status: 'error', message: 'Investment not found' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});









app.post('/signup', (req, res, next) => {
    // Check if email already exists
    Users.findOne({ email: req.body.email }).then(user => {
      if (user) {
        return res.status(409).json({ message: 'Email already exists' });
      }
  
      bcrypt.hash(req.body.password, 12).then(hash => {
        const user = new Users({
          email: req.body.email,
          fname: req.body.fname,
          password: hash
        });
  
        user.save().then(() => {
          res.status(201).json({ message: 'User created' });
        }).catch(error => {
          console.log(error);
          res.status(500).json({ message: 'Could not create user' });
        });
      });
    });
  });
  
  app.post('/signin', (req, res, next) => {
    let fetchedUser;
  
    Users.findOne({ email: req.body.email }).then(user => {
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      fetchedUser = user;
  
      return bcrypt.compare(req.body.password, user.password);
    }).then(result => {
      if (!result) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ email: fetchedUser.email, userId: fetchedUser._id }, 'secret', { expiresIn: '1h' });
      res.status(200).json({ message: 'User logged in', token: token });
    }).catch(error => {
      console.log(error);
      res.status(500).json({ message: 'Could not log in' });
    });
  });
  
  app.get('/private', (req, res, next) => {
    const authHeader = req.get('Authorization');
  
    if (!authHeader) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
  
    const token = authHeader.split(' ')[1];
    let decodedToken;
  
    try {
      decodedToken = jwt.verify(token, 'secret');
    } catch (error) {
      return res.status(500).json({ message: error.message || 'Could not decode the token' });
    }
  
    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    Users.findById(decodedToken.userId)
      .then(user => {
        if (!user) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
  
        res.status(200).json({ message: 'Login success', data: user });
      })
      .catch(error => {
        console.log(error);
        res.status(500).json({ message: 'Could not fetch user' });
      });
  });
  
  app.use('/', (req, res, next) => {
    res.status(404).json({ error: 'page not found' });
  });
  
  module.exports = app;

//chart api
app.post('/chartdata', async (req, res) => {
  try {
    const { payment, price } = req.body;
    
    // Create a new ChartModel object and save it to the database
    const chartData = new ChartModel({ payment, price });
    await chartData.save();

    res.status(201).json({ status: 'ok', message: 'Chart data saved successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});
// app.post('/chartdata', async (req, res) => {
//   try {
//       const payload = req.body;
//       // check if investment already exists
//       const existsChartData = await ChartData.findOne({ payment: payload.payment, value: payload.value});
//       if (existsChartData) {
//           res.json({ status: 'error', message: 'chart already exists' });
//           return;
//       }
//       // create new investment object
//       const chart = new ChartData(payload);
//       await chart.save();
//       res.json({ status: 'ok', message: 'Chart create' });
//   } catch (error) {
//       console.log(error.message);
//       res.json({ status: 'error', message: error.message });
//   }
// });

// GET route to retrieve all chart data items
app.get('/chartdata', async (req, res) => {
  try {
    // Find all chart data items in the database
    const chartData = await ChartModel.find();

    res.json({ status: 'ok', data: chartData });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});




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


