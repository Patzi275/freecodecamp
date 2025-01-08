const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config()
const mongoose = require('mongoose')


let userSchema = new mongoose.Schema({
  username: String
}, { versionKey: false})

let exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date
}, { versionKey: false })

// let logSchema = new mongoose.Schema({
//   username: String,
//   count: Number,
//   log: [exerciseSchema]
// })

let User = mongoose.model('User', userSchema)
let Exercise = mongoose.model('Exercise', exerciseSchema)

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users', (req, res) => {
  const { username } = req.body
  User.create({ username })
    .then(user => res.json(user))
    .catch(err => res.json({ error: err.message }))
})

app.get('/api/users', (req, res) => {
  User.find({})
    .then(users => res.json(users))
    .catch(err => res.json({ error: 'Error fetching users' }))
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  const { description, duration, date } = req.body
  const userId = req.params._id

  const user = await User.findById(userId)
  if (!user) {
    return res.json({ error: 'User not found' })
  }

  const exercise = await Exercise.create({ username: user.username, description, duration, date: date || new Date() })
  res.json({
    ...exercise.toObject(),
    date: new Date(exercise.date).toISOString()
  })
})


app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.json({ error: 'User not found' });
    }

    const filter = { username: user.username };
    if (from) {
      filter.date = { $gte: new Date(from) };
    }
    if (to) {
      filter.date = { ...filter.date, $lte: new Date(to) };
    }

    const exercises = await Exercise.find(filter)
      .limit(limit ? parseInt(limit) : undefined)
      .select('description duration date -_id');

    const log = exercises.map((exercise) => ({
      description: exercise.description,
      duration: exercise.duration,
      date: new Date(exercise.date).toDateString(),
    }));

    res.json({
      username: user.username,
      count: log.length,
      _id: user._id,
      log,
    });
  } catch (err) {
    console.error(err);
    res.json({ error: 'Error fetching logs' });
  }
});




const listener = app.listen(process.env.PORT || 3000, async () => {
  console.log('Your app is listening on port ' + listener.address().port)
  await mongoose.connect(process.env.MONGO_URI)
})
