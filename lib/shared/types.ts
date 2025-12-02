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

export type AbaQrResponse = {
	intent_id: string;
	qr_string: string;
	abapay_deeplink: string;
	checkout_qr_url: string;
};

export type Mode = "dev" | "uat" | "prod";
