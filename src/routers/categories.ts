import { Hono } from "hono";
import { pool as conn } from "../db/dbconnect";
export const router = new Hono();

router.get("/", async (c) => {
  try {
    let [rows] = await conn.execute("select * from categories");
    return c.json(
      {
        result: rows,
      },
      200
    );
  } catch (error) {
    return c.json({
        success: false,
        error: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
        details: error
      }, 500);
  }
});
