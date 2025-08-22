import { Hono } from "hono";
import { pool as conn } from "../db/dbconnect";
export const router = new Hono();
import { SignJWT } from 'jose'
import * as bcrypt from 'bcryptjs'
import { LoginForm } from '../models/login_form'
router.post('/login', async (c) => {
  const body = await c.req.json<LoginForm>()

  try {
    console.log('Login attempt with email:', body.email);
    const [rows]: any = await conn.query("select * from user where email = ?", [body.email])
    console.log(rows)
    if (!rows || rows.length === 0) {
      return c.json({ success: false, error: 'ไม่พบผู้ใช้ที่มีอีเมลนี้' }, 400)
    }

    const user = rows[0]
    const isPasswordValid = await bcrypt.compare(body.password, user.password)

    if (!isPasswordValid) {
      return c.json({ success: false, error: 'รหัสผ่านไม่ถูกต้อง' }, 401)
    }

     const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
     const token = await new SignJWT({
      sub: user.id,          
      email: user.email,    
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()              
    .setExpirationTime('2h')    
    .sign(secret)
   
    return c.json({
    success: true,
    token,
    tokenType: 'Bearer',
    expiresIn: 2 * 60 * 60, // วินาที
    user: { id: user.id, email: user.email }, 
  })

  } catch (error) {
    console.error(error)
    return c.json({ success: false, error: 'Server error' }, 500)
  }
})

router.post('/register/:password', async (c) => {
    let pass = c.req.param('password')
    let passwordHash = await bcrypt.hash(pass, 10)

    return c.text(`Register with password: ${passwordHash}`) // แค่ตัวอย่าง
})
