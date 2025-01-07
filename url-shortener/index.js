require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

const url_map = {};
app.post('/api/shorturl', function (req, res) {
  const url = req.body.url;
  if (!url) {
    console.log(req.body);
    return res.json({ error: 'invalid URL' });
  }

  if (url_map[url]) {
    return res.json({ original_url: url, short_url: url_map[url] });
  }

  const hostname = new URL(url).hostname;

  dns.lookup(hostname, (err, address, family) => {
    if (err) {
      console.log(err);
      return res.json({ error: 'invalid URL' });
    }

    const short_url = Math.floor(Math.random() * 1000);
    url_map[short_url] = url;
    return res.json({ original_url: url, short_url });
  });
});

app.get('/api/shorturl/:short_url', function (req, res) {
  const { short_url } = req.params;
  const url = url_map[short_url];
  if (!url) {
    res.json({ error: 'No short url found for given input' });
  }

  res.redirect(url);
});

  app.listen(port, function () {
    console.log(`Listening on port ${port}`);
  });
