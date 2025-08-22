import { Hono } from 'hono'
import {pool as conn} from '../db/dbconnect'
import { CreateProductReq } from '../models/create_product';
import { sql } from 'bun';

// Interface สำหรับ request body


export const router = new Hono()

router.get('/',  async (c) => {
    try {
        let [rows] = await conn.execute("select * from categories,products,inventory where \tcategories.id = products.category_id and products.id = inventory.product_id");
        // c.res.json({})
        return c.json({
            result:rows
        });
    } catch (error) {
        return c.json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
            details: error
          }, 500);
    }
  }).post('/',async (c) =>{
    try {
        const body: CreateProductReq = await c.req.json();  

            const [productResult] = await conn.execute(
                'INSERT INTO products (namep, price, description, category_id, image_url) VALUES (?, ?, ?, ?,?)',
                [body.namep, body.price, body.description, body.category_id, body.image_url]
            );
            const productId = (productResult as any).insertId;
          let a =   await conn.execute(
                'INSERT INTO inventory (product_id, amount, last_updated) VALUES (?, ?, NOW())',
                [productId, body.amount]
            );
            await conn.commit();
          
            return c.json({
                success: true,
                message: 'เพิ่มสินค้าสำเร็จ',
                product_id: productId
            }, 201);
    } catch (error) {
        return c.json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า',
            details: error
        }, 500);
    }
    
  }).put('/:id',async (c) =>{
    try {
        let sql = `
            UPDATE categories c, products p, inventory i
            SET 
                p.namep = ?,
                p.price = ?,
                p.description = ?,
                p.image_url = ?,
                i.amount = ?,
                i.last_updated = NOW()
            WHERE c.id = p.category_id 
                AND p.id = i.product_id 
                AND p.id = ?
        `;
        const id  = c.req.param('id');
        const body = await c.req.json();
        let response = await conn.execute(sql, [
            body.namep || '',
            body.price || '',
            body.description || '',
            body.image_url || '',
            body.amount || 0,
            id
        ]);
        
        return c.json({
            success: true,
            message: 'อัปเดตข้อมูลสำเร็จ',
            affectedRows: (response[0] as any).affectedRows
        });
        
    } catch (error) {
        return c.json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
            details: error
        }, 500);
    }
  }).delete('/:id', async (c) =>{
    try {
        const id = c.req.param('id')
        const connection = await conn.getConnection();
        await connection.beginTransaction();
        try {
            await connection.execute('DELETE FROM inventory WHERE product_id = ?', [id]);
            const [productResult] = await connection.execute('DELETE FROM products WHERE id = ?', [id]);
            await connection.commit();
            return c.json({
                success: true,
                message: 'ลบข้อมูลสำเร็จ',
                affectedRows: (productResult as any).affectedRows
            });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        return c.json({
            success: false,
            error: 'เกิดข้อผิดพลาดในการลบข้อมูล',
            details: error
        }, 500);
    }


  })
 //   .post("/",zva)
 
 //   export default router
 