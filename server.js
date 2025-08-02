require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(express.static('.')); // Serve index.html

app.post('/upload', async (req, res) => {
  const { content, filename } = req.body;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_USERNAME;

  try {
    const response = await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/contents/images/${filename}`,
      {
        message: `Upload ${filename}`,
        content: content,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json'
        }
      }
    );

    res.json({ message: "Uploaded successfully", url: response.data.content.download_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));