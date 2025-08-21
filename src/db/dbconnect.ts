import * as dotenv from 'dotenv'
import { createPool } from 'mysql2/promise';

// โหลดไฟล์ .env ทันที
dotenv.config();

// สร้าง Connection Pool และ export ออกไปเพื่อให้ไฟล์อื่นเรียกใช้ได้
export const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}).on('connection', (conn) => {
  conn.query("SET time_zone = '+07:00'");
});

