export interface CreateProductReq {
    namep:       string;
    category_id: number;
    description: string;
    price:       number;
    image_url:   string;
    amount:      number;
}