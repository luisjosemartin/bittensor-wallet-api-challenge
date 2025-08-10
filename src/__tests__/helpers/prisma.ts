import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Cargar variables de entorno del archivo .env.test
dotenv.config({ path: '.env.test' })

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

export default prisma
