const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const jwt = require('jsonwebtoken');

const app = express();
const port =  process.env.PORT ||3000;
const secretKey = 'your-secret-key';

// Middleware
app.use(bodyParser.json());
const upload = multer({ dest: 'uploads/' }); // Folder untuk menyimpan file upload

// Dummy user data
const users = [
  { id: 'user-yj5pc_LARC_AgK61', name: 'Arif Faizin', email: 'arif@example.com', password: 'password' }
];

// Dummy stories data
let stories = [
  {
    id: 'story-FvU4u0Vp2S3PMsFg',
    name: 'Dimas',
    description: 'Lorem Ipsum',
    photoUrl: 'https://story-api.dicoding.dev/images/stories/photos-1641623658595_dummy-pic.png',
    createdAt: '2022-01-08T06:34:18.598Z',
    lat: -10.212,
    lon: -16.002
  }
];

// Middleware untuk verifikasi token
function verifyToken(req, res, next) {
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ error: true, message: 'Forbidden' });
    req.user = user;
    next();
  });
}

// Endpoint Register
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  // Cek email unik
  if (users.find(user => user.email === email)) {
    return res.status(400).json({ error: true, message: 'Email must be unique' });
  }

  const newUser = { id: `user-${Math.random().toString(36).substr(2, 10)}`, name, email, password };
  users.push(newUser);

  res.json({ error: false, message: 'User Created' });
});

// Endpoint Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: true, message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id, name: user.name }, secretKey, { expiresIn: '1h' });
  res.json({ error: false, message: 'success', loginResult: { userId: user.id, name: user.name, token } });
});

// Endpoint Add New Story
app.post('/stories', verifyToken, upload.single('photo'), (req, res) => {
  const { description, lat, lon } = req.body;
  const photoUrl = req.file.path; // Path file upload (contoh sederhana, sebaiknya disimpan di server atau cloud storage)

  const newStory = {
    id: `story-${Math.random().toString(36).substr(2, 10)}`,
    name: req.user.name,
    description,
    photoUrl,
    createdAt: new Date().toISOString(),
    lat: parseFloat(lat) || null,
    lon: parseFloat(lon) || null
  };

  stories.push(newStory);

  res.json({ error: false, message: 'success' });
});

// Endpoint Add New Story with Guest Account
app.post('/stories/guest', upload.single('photo'), (req, res) => {
  const { description, lat, lon } = req.body;
  const photoUrl = req.file.path; // Path file upload (contoh sederhana, sebaiknya disimpan di server atau cloud storage)

  const newStory = {
    id: `story-${Math.random().toString(36).substr(2, 10)}`,
    name: 'Guest',
    description,
    photoUrl,
    createdAt: new Date().toISOString(),
    lat: parseFloat(lat) || null,
    lon: parseFloat(lon) || null
  };

  stories.push(newStory);

  res.json({ error: false, message: 'success' });
});

// Endpoint Get All Stories
app.get('/stories', verifyToken, (req, res) => {
  const { page = 1, size = 10, location = 0 } = req.query;
  const startIdx = (page - 1) * size;
  const endIdx = startIdx + parseInt(size);

  let filteredStories = stories.slice(startIdx, endIdx);

  if (location === '1') {
    filteredStories = stories.filter(story => story.lat !== null && story.lon !== null);
  }

  res.json({ error: false, message: 'Stories fetched successfully', listStory: filteredStories });
});

// Endpoint Detail Story
app.get('/stories/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const story = stories.find(s => s.id === id);

  if (!story) {
    return res.status(404).json({ error: true, message: 'Story not found' });
  }

  res.json({ error: false, message: 'Story fetched successfully', story });
});


// Endpoint Home
app.get('/', (req, res) => {
  res.json({ error: false, message: 'Home endpoint Work' });
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
