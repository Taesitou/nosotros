const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const auth = require('../middleware/auth')

const prisma = new PrismaClient()

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})
const upload = multer({ storage })

router.use(auth)

router.get('/', async (req, res) => {
  const albums = await prisma.album.findMany({
    include: { media: true },
    orderBy: { date: 'asc' }
  })
  res.json(albums)
})

router.post('/', async (req, res) => {
  const { title, date, description } = req.body
  const album = await prisma.album.create({
    data: { title, date: new Date(date), description }
  })
  res.json(album)
})

router.get('/:id', async (req, res) => {
  try {
    const album = await prisma.album.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { media: true }
    })
    
    if (!album) {
      return res.status(404).json({ message: 'Álbum no encontrado' })
    }
    
    res.json(album)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' })
  }
})

router.post('/:id/media', upload.array('files'), async (req, res) => {
  const albumId = parseInt(req.params.id)
  const media = await Promise.all(
    req.files.map(file => {
      const type = file.mimetype.startsWith('video') ? 'video' : 'photo'
      return prisma.media.create({
        data: { albumId, filename: file.filename, type }
      })
    })
  )
  res.json(media)
})

router.delete('/:id', async (req, res) => {
  await prisma.album.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ ok: true })
})

router.put('/:id', async (req, res) => {
  try {
    const { title } = req.body
    const album = await prisma.album.update({
      where: { id: parseInt(req.params.id) },
      data: { title }
    })
    res.json(album)
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el álbum' })
  }
})

module.exports = router