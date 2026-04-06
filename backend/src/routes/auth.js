const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const users = [
  { name: process.env.USER1_NAME, pass: process.env.USER1_PASS },
  { name: process.env.USER2_NAME, pass: process.env.USER2_PASS },
]

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = users.find(u => u.name === username)
  if (!user || user.pass !== password) {
    return res.status(401).json({ error: 'Credenciales incorrectas' })
  }
  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '30d' })
  res.json({ token })
})

module.exports = router