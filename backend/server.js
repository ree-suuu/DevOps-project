import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDatabase } from './config/db.js'
import Product from './models/Product.js'
import Brand from './models/Brand.js'

import productRoutes from './routes/productRoutes.js'
import brandRoutes from './routes/brandRoutes.js'
import authRoutes from './routes/authRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const brandsData = [
  {
    name: 'Baltra',
    slug: 'baltra',
    logo: '/baltra/baltra.png',
    countryOfOrigin: 'Nepal',
    authorizedPartner: true,
    description: 'Trusted Nepali brand for durable cookware, pressure cookers, and everyday appliances.',
    categories: ['pressure-cooker', 'rice-cooker', 'electric-kettle', 'fan', 'mixer', 'lunch-box', 'bottles']
  },
  {
    name: 'Hawkins',
    slug: 'hawkins',
    logo: '/hawkins/hawkins.png',
    countryOfOrigin: 'India',
    authorizedPartner: true,
    description: 'World-renowned pressure cooker brand known for its inside-fitting safety lids.',
    categories: ['pressure-cooker']
  },
  {
    name: 'Diamond',
    slug: 'diamond',
    logo: '/diamond/diamond.png',
    countryOfOrigin: 'India',
    authorizedPartner: true,
    description: 'Manufacturer of induction-bottom stainless steel pressure cookers and cookware sets.',
    categories: ['pressure-cooker']
  },
  {
    name: 'Wega',
    slug: 'wega',
    logo: '/wega/wega.png',
    countryOfOrigin: 'Nepal',
    authorizedPartner: true,
    description: 'Modern kitchen appliances including cordless kettles, electric jugs, and drum rice cookers.',
    categories: ['rice-cooker', 'electric-kettle']
  },
  {
    name: 'Bagmati',
    slug: 'bagmati',
    logo: '/bagmati/bagmati.png',
    countryOfOrigin: 'Nepal',
    authorizedPartner: true,
    description: 'Nepal premier plastics manufacturer producing heavy-duty buckets, basins, and storage pails.',
    categories: ['bucket', 'bottles', 'kitchen-rack']
  },
  {
    name: 'GEM',
    slug: 'gem',
    logo: '/gem/gem.png',
    countryOfOrigin: 'Nepal',
    authorizedPartner: true,
    description: 'Durable Nepali plasticware, organizer racks, food containers, and unbreakable buckets.',
    categories: ['bucket', 'bottles', 'lunch-box', 'kitchen-rack']
  },
  {
    name: 'Thimi Ceramics',
    slug: 'thimi-ceramics',
    logo: '/ceramics/ceramics.png',
    countryOfOrigin: 'Nepal (Bhaktapur)',
    authorizedPartner: true,
    description: 'Traditional handcrafted earthenware and lead-free glazed ceramics from historic Thimi.',
    categories: ['ceramics']
  },
  {
    name: 'Famous Steel',
    slug: 'famous-steel',
    logo: '/famous/famous.png',
    countryOfOrigin: 'Nepal',
    authorizedPartner: true,
    description: 'High-grade stainless steel utensils, modular racks, bottles, and dining ware made in Nepal.',
    categories: ['bottles', 'kitchen-rack']
  }
]

async function autoSeedIfEmpty() {
  try {
    const productCount = await Product.countDocuments()
    if (productCount === 0) {
      console.log('No products found in MongoDB. Auto-seeding catalog...')
      const rawProducts = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'productsData.json'), 'utf-8')
      )
      await Product.insertMany(rawProducts)
      console.log(`Auto-seeded ${rawProducts.length} products successfully.`)
    }

    const brandCount = await Brand.countDocuments()
    if (brandCount === 0) {
      console.log('No brands found in MongoDB. Auto-seeding brands...')
      await Brand.insertMany(brandsData)
      console.log(`Auto-seeded ${brandsData.length} brands successfully.`)
    }
  } catch (err) {
    console.error('Auto-seed failed:', err.message)
  }
}

const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean)

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server) or from allowed origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true)
    }
    return callback(null, true)
  },
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

// Root & Health Checks
app.get('/', (req, res) => {
  res.json({
    name: 'KLAY Kitchen Utensils & Appliances API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      brands: '/api/brands',
      authentication: '/api/auth',
      cart: '/api/cart',
      orders: '/api/orders'
    }
  })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() })
})

// API Routes
app.use('/api/products', productRoutes)
app.use('/api/brands', brandRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)

async function startServer() {
  try {
    await connectDatabase()
    await autoSeedIfEmpty()
    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Unable to start backend:', error.message)
    process.exitCode = 1
  }
}

startServer()
