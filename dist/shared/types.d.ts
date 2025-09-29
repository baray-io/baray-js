export type IntentPayload = {
    amount: string;
    currency: string;
    order_id: string;
    tracking?: any;
    order_details?: any;
    custom_success_url?: string;
};
export type IntentDetail = {
    _id: string;
    items: any[];
    total_price: string;
    total_discount: string;
    grand_total: string;
    order_date: string;
    org_id: string;
    customer_id: string;
};
export type Mode = "dev" | "uat" | "prod";
