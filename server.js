const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

mongoose.connect('mongodb://localhost:27017/skillZwap')
  .then(() => {
    console.log('✅ Connected to MongoDB database skillZwap');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files early
app.use(express.static('public'));

// Session middleware
app.use(session({
  secret: 'skillZwap-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/skillZwap'
  }),
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Models
const User = require('./models/User');
const SessionRequest = require('./models/Session');

// Static HTML routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/marketplace', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'marketplace.html'));
});

// Mount API route files for modular code (assuming you have more files for other features)
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ----- All other API routes here as in your original server.js -----

// Register user
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, skillsToTeach, skillsToLearn } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      skillsToTeach: skillsToTeach.split(',').map(skill => skill.trim()),
      skillsToLearn: skillsToLearn.split(',').map(skill => skill.trim())
    });

    await user.save();

    req.session.userId = user._id;
    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    req.session.userId = user._id;
    res.json({ success: true, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Get current user
app.get('/api/user', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await User.findById(req.session.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get matching users
app.get('/api/matches', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const currentUser = await User.findById(req.session.userId);

    const matches = await User.find({
      _id: { $ne: req.session.userId },
      skillsToTeach: { $in: currentUser.skillsToLearn }
    }).select('-password');

    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users for marketplace
app.get('/api/users', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { search } = req.query;
    let query = { _id: { $ne: req.session.userId } };

    if (search) {
      query.$or = [
        { skillsToTeach: { $regex: search, $options: 'i' } },
        { skillsToLearn: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send session request
app.post('/api/session-request', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { recipientId, skill, message } = req.body;

    const existingRequest = await SessionRequest.findOne({
      requester: req.session.userId,
      recipient: recipientId,
      skill,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Request already sent for this skill' });
    }

    const sessionRequest = new SessionRequest({
      requester: req.session.userId,
      recipient: recipientId,
      skill,
      message,
      status: 'pending'
    });

    await sessionRequest.save();
    res.json({ success: true, message: 'Session request sent' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get received session requests
app.get('/api/session-requests/received', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const requests = await SessionRequest.find({
      recipient: req.session.userId
    }).populate('requester', 'name email');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get sent session requests
app.get('/api/session-requests/sent', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const requests = await SessionRequest.find({
      requester: req.session.userId
    }).populate('recipient', 'name email');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Respond to session request
app.post('/api/session-request/:id/respond', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { status } = req.body; // 'accepted' or 'rejected'

    const request = await SessionRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.session.userId
      },
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ success: true, message: `Request ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
