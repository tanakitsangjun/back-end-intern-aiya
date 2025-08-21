import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { pool,  } from '../src/db/dbconnect';
import {router as products } from './routers/products'
import {router as categories } from './routers/categories'
import { router as auth } from './routers/auth'
import { jwt } from 'hono/jwt'
const app = new Hono()

// เพิ่ม CORS middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173','https://internaiya.gonggang.net'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

app.get('/', (c) => {
  return c.text('Hello asd!')
})

app.use('/products/*',jwt({secret:process.env.JWT_SECRET!}))
app.use('/categories/*',jwt({secret:process.env.JWT_SECRET!}))

app.route('/products',products)
app.route('/categories',categories)
app.route('/auth',auth)

export default app
 