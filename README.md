# Baray JS Payment Library

A JavaScript/TypeScript library for integrating Baray API into your web applications. This library provides both client-side (browser) and server-side (Node.js) functionality for handling payments.

## Features

- 🌐 **Dual Environment Support**: Works in both browser and Node.js environments
- 🔒 **Secure Encryption**: Built-in AES encryption for sensitive data
- 🎨 **Flexible UI**: Support for both iframe integration and redirect flow
- 📱 **Mobile Friendly**: Responsive payment interface
- 🔑 **Type Safe**: Full TypeScript support with type definitions

## Installation

```bash
npm install baray-io/baray-js
```

## Quick Start

### Browser Usage (PublicClient)

Use the `PublicClient` for frontend payment processing. The client should call your backend API to create a payment intent, then use the returned intent ID to process the payment.

```typescript
import React, { useState } from "react";
import { PublicClient } from "baray-js";

// Initialize with your public API key
const baray = new PublicClient("pk_dev_your_public_key_here");

interface PaymentData {
	amount: number;
	currency: string;
	customer: {
		email: string;
		name: string;
	};
	items: Array<{
		name: string;
		price: number;
		quantity: number;
	}>;
	description: string;
}

const PaymentComponent: React.FC = () => {
	const [isProcessing, setIsProcessing] = useState(false);
	const [paymentStatus, setPaymentStatus] = useState<string>("");

	// Sample payment data (in real app, this would come from props or state)
	const paymentData: PaymentData = {
		amount: 99.99,
		currency: "USD",
		customer: {
			email: "customer@example.com",
			name: "John Doe",
		},
		items: [{ name: "Premium Plan", price: 99.99, quantity: 1 }],
		description: "Premium subscription",
	};

	// Helper function to create payment intent
	const createPaymentIntent = async (data: PaymentData) => {
		const response = await fetch("/api/checkout", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		const result = await response.json();

		if (!result.success) {
			throw new Error("Failed to create payment intent");
		}

		return result;
	};

	// Method 1: Using iframe (recommended)
	const processPaymentWithIframe = async () => {
		setIsProcessing(true);
		setPaymentStatus("Creating payment intent...");

		try {
			const result = await createPaymentIntent(paymentData);

			setPaymentStatus("Opening payment window...");

			// Use the intent ID to process payment with iframe
			baray.confirmPayment({
				intent_id: result.intent_id,
				use_iframe: true,
				on_success: () => {
					setPaymentStatus("Payment successful!");
					setIsProcessing(false);
					// Handle successful payment (redirect, show success message, etc.)
				},
			});
		} catch (error) {
			console.error("Payment failed:", error);
			setPaymentStatus(`Payment failed: ${error.message}`);
			setIsProcessing(false);
		}
	};

	// Method 2: Using redirect
	const processPaymentWithRedirect = async () => {
		setIsProcessing(true);
		setPaymentStatus("Creating payment intent...");

		try {
			const result = await createPaymentIntent(paymentData);

			setPaymentStatus("Redirecting to payment page...");

			// Redirect to payment page
			baray.confirmPayment({
				intent_id: result.intent_id,
				use_iframe: false,
			});
		} catch (error) {
			console.error("Payment failed:", error);
			setPaymentStatus(`Payment failed: ${error.message}`);
			setIsProcessing(false);
		}
	};

	// Method 3: Alternative - Direct window.open (simple but less control)
	const processPaymentWithPopup = async () => {
		setIsProcessing(true);
		setPaymentStatus("Creating payment intent...");

		try {
			const result = await createPaymentIntent(paymentData);

			setPaymentStatus("Opening payment page in new window...");

			// Open payment page in new window/tab
			window.open(`https://pay.baray.io/${result.intent_id}`, "_blank");

			// Reset status after a delay since we can't track success with popup
			setTimeout(() => {
				setPaymentStatus(
					"Payment window opened. Complete payment in the new tab."
				);
				setIsProcessing(false);
			}, 1000);
		} catch (error) {
			console.error("Payment failed:", error);
			setPaymentStatus(`Payment failed: ${error.message}`);
			setIsProcessing(false);
		}
	};

	// Close iframe manually
	const closePaymentFrame = () => {
		baray.unloadFrame();
		setIsProcessing(false);
		setPaymentStatus("Payment cancelled");
	};

	return (
		<div className="payment-component">
			<h3>Baray Payment Integration</h3>

			<div className="payment-info">
				<h4>Order Details:</h4>
				<p>Amount: ${paymentData.amount}</p>
				<p>Description: {paymentData.description}</p>
				<p>
					Customer: {paymentData.customer.name} ({paymentData.customer.email})
				</p>
			</div>

			<div className="payment-methods">
				<button
					onClick={processPaymentWithIframe}
					disabled={isProcessing}
					className="btn btn-primary"
				>
					{isProcessing ? "Processing..." : "Pay with Iframe (Recommended)"}
				</button>

				<button
					onClick={processPaymentWithRedirect}
					disabled={isProcessing}
					className="btn btn-secondary"
				>
					{isProcessing ? "Processing..." : "Pay with Redirect"}
				</button>

				<button
					onClick={processPaymentWithPopup}
					disabled={isProcessing}
					className="btn btn-tertiary"
				>
					{isProcessing ? "Processing..." : "Pay in New Window"}
				</button>

				{isProcessing && (
					<button onClick={closePaymentFrame} className="btn btn-danger">
						Cancel Payment
					</button>
				)}
			</div>

			{paymentStatus && (
				<div
					className={`status ${
						paymentStatus.includes("successful")
							? "success"
							: paymentStatus.includes("failed")
							? "error"
							: "info"
					}`}
				>
					{paymentStatus}
				</div>
			)}
		</div>
	);
};

export default PaymentComponent;
```

### Server Usage (PrivateClient)

Use the `PrivateClient` for server-side payment intent creation:

```typescript
import { PrivateClient } from "baray-js";

// Initialize with your private credentials
const baray = new PrivateClient(
	"pk_dev_your_public_key_here",
	"your_44_character_secret_key_here",
	"your_24_character_iv_key_here"
);

// Create a payment intent
const intent = await baray.createIntent({
	amount: "100.00",
	currency: "USD",
	order_id: "order_123",
	order_details: {
		description: "Purchase of premium subscription",
		customer_email: "customer@example.com",
		customer_name: "John Doe",
	},
});

console.log("Payment intent created:", intent._id);
```

## API Reference

### PublicClient

The `PublicClient` is designed for browser environments and handles the payment UI.

#### Constructor

```typescript
new PublicClient(api_key: string)
```

- `api_key`: Your public API key (starts with `pk_dev_`, `pk_uat_`, or `pk_prod_`)

#### Methods

##### `confirmPayment(props)`

Initiates the payment process.

```typescript
confirmPayment(props: {
  intent_id: string;
  use_iframe: boolean;
  on_success?: () => void;
})
```

Parameters:

- `intent_id`: The payment intent ID returned from `createIntent`
- `use_iframe`: Whether to use iframe integration (`true`) or redirect (`false`)
- `on_success`: Optional callback function called when payment succeeds (iframe mode only)

##### `getPayLink(intent_id)`

Returns the direct payment URL.

```typescript
getPayLink(intent_id: string): string
```

##### `unloadFrame()`

Manually closes the payment iframe.

```typescript
unloadFrame(): void
```

### PrivateClient

The `PrivateClient` is designed for server environments and handles payment intent creation.

#### Constructor

```typescript
new PrivateClient(api_key: string, secret_key: string, iv_key: string)
```

- `api_key`: Your public API key
- `secret_key`: Your 44-character secret key
- `iv_key`: Your 24-character IV key

#### Methods

##### `createIntent(intent)`

Creates a new payment intent.

```typescript
createIntent(intent: IntentPayload): Promise<IntentDetail>
```

Parameters:

- `intent`: Payment intent configuration

```typescript
type IntentPayload = {
	amount: string; // Payment amount
	currency: string; // Currency code (e.g., 'USD')
	order_id: string; // Your unique order identifier
	tracking?: any; // Optional tracking information
	order_details?: any; // Optional order details
};
```

Returns:

```typescript
type IntentDetail = {
	_id: string; // Payment intent ID
	items: any[];
	total_price: string;
	total_discount: string;
	grand_total: string;
	order_date: string;
	org_id: string;
	customer_id: string;
};
```

##### `encrypt(data)` and `decryptIntent(data)`

Utility methods for data encryption/decryption.

```typescript
encrypt(data: string): string
decryptIntent(data: string): string | null
```

## Environment Setup

### Development

Use keys starting with `pk_dev_` for development and testing.

### UAT (User Acceptance Testing)

Use keys starting with `pk_uat_` for staging environments.

### Production

Use keys starting with `pk_prod_` for live transactions.

## Complete Integration Example

Here's a complete example showing a streamlined checkout process:

### Backend (Node.js/Express)

```typescript
import express from "express";
import { PrivateClient } from "baray-js";

const app = express();
app.use(express.json());

const baray = new PrivateClient(
	process.env.BARAY_PUBLIC_KEY!,
	process.env.BARAY_SECRET_KEY!,
	process.env.BARAY_IV_KEY!
);

// In-memory storage for demo (use database in production)
const orders = new Map();

// Checkout endpoint - creates order and payment intent in one step
app.post("/api/checkout", async (req, res) => {
	try {
		const { amount, currency, customer, items, description } = req.body;

		// Validate required fields
		if (!amount || !currency || !customer?.email || !customer?.name) {
			return res.status(400).json({
				error:
					"Missing required fields: amount, currency, customer.email, customer.name",
			});
		}

		// Generate unique order ID
		const orderId = `order_${Date.now()}_${Math.random()
			.toString(36)
			.substr(2, 9)}`;

		// Create order
		const order = {
			order_id: orderId,
			amount: parseFloat(amount.toFixed(2)),
			currency: currency.toUpperCase(),
			customer,
			items: items || [],
			description: description || `Order ${orderId}`,
			status: "created",
			created_at: new Date().toISOString(),
		};

		// Create payment intent
		const intent = await baray.createIntent({
			amount: order.amount.toFixed(2),
			currency: order.currency,
			order_id: order.order_id,
			order_details: {
				description: order.description,
				items: order.items,
				customer_email: order.customer.email,
				customer_name: order.customer.name,
			},
		});

		// Update order with payment intent
		order.status = "payment_pending";
		order.intent_id = intent._id;
		order.updated_at = new Date().toISOString();

		// Store order (use database in production)
		orders.set(orderId, order);

		res.json({
			success: true,
			intent_id: intent._id,
			order_id: order.order_id,
			amount: order.amount,
			currency: order.currency,
		});
	} catch (error) {
		console.error("Checkout failed:", error);
		res.status(500).json({ error: "Failed to process checkout" });
	}
});

// Webhook endpoint for payment notifications
app.post(
	"/api/webhooks/payment",
	express.raw({ type: "application/json" }),
	(req, res) => {
		try {
			const payload = JSON.parse(req.body.toString());
			const { encrypted_order_id } = payload;

			if (!encrypted_order_id) {
				return res.status(400).json({ error: "Missing encrypted_order_id" });
			}

			// Decrypt the order ID
			const decryptedOrderId = baray.decryptIntent(encrypted_order_id);

			if (!decryptedOrderId) {
				return res.status(400).json({ error: "Failed to decrypt order ID" });
			}

			// Get the order
			const order = orders.get(decryptedOrderId);

			if (!order) {
				return res.status(404).json({ error: "Order not found" });
			}

			// Update order status to completed
			order.status = "completed";
			order.completed_at = new Date().toISOString();
			order.updated_at = new Date().toISOString();
			orders.set(decryptedOrderId, order);

			console.log(`Payment completed for order: ${decryptedOrderId}`);

			// Send confirmation email, update inventory, etc.
			// await sendConfirmationEmail(order.customer.email, order);
			// await updateInventory(order.items);

			res.status(200).json({
				success: true,
				message: "Webhook processed successfully",
			});
		} catch (error) {
			console.error("Webhook processing failed:", error);
			res.status(500).json({ error: "Webhook processing failed" });
		}
	}
);
```

### Frontend (React)

```typescript
import React, { useState } from "react";
import { PublicClient } from "baray-js";

const baray = new PublicClient(process.env.REACT_APP_BARAY_PUBLIC_KEY!);

function PaymentComponent() {
	const [isProcessing, setIsProcessing] = useState(false);

	const handlePayment = async () => {
		setIsProcessing(true);

		try {
			// Single checkout call that creates order and payment intent
			const response = await fetch("/api/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount: 99.99,
					currency: "USD",
					customer: {
						email: "customer@example.com",
						name: "John Doe",
					},
					items: [{ name: "Premium Plan", price: 99.99, quantity: 1 }],
					description: "Premium subscription",
				}),
			});

			const result = await response.json();

			if (!result.success) {
				throw new Error("Failed to create checkout");
			}

			// Process payment with Baray
			baray.confirmPayment({
				intent_id: result.intent_id,
				use_iframe: true,
				on_success: () => {
					alert("Payment successful!");
					setIsProcessing(false);
				},
			});
		} catch (error) {
			console.error("Payment failed:", error);
			setIsProcessing(false);
		}
	};

	return (
		<button onClick={handlePayment} disabled={isProcessing}>
			{isProcessing ? "Processing..." : "Pay Now"}
		</button>
	);
}
```

## Webhook Payload

When a payment is completed, Baray will send a webhook to your configured endpoint with the following JSON payload:

```json
{
	"encrypted_order_id": "encrypted_string_containing_order_id"
}
```

The `encrypted_order_id` contains the order ID encrypted using your secret key. Use the `decryptIntent()` method to decrypt it and retrieve the original order ID.

## Error Handling

The library includes built-in validation and will throw errors for:

- Invalid API keys
- Incorrect secret/IV key lengths
- Using PublicClient in Node.js environment
- Using PrivateClient in browser environment

Always wrap your calls in try-catch blocks:

```typescript
try {
	const intent = await baray.createIntent(paymentData);
	// Handle success
} catch (error) {
	console.error("Payment creation failed:", error);
	// Handle error
}
```

## Security Best Practices

1. **Never expose secret keys**: Only use secret keys on your server
2. **Validate webhooks**: Always verify webhook signatures
3. **Use HTTPS**: Ensure all communication is encrypted
4. **Validate amounts**: Always validate payment amounts on your server
5. **Store minimal data**: Don't store sensitive payment information

## Support

For questions and support, please contact the Baray team or refer to the official documentation.

## License

This library is provided under the terms specified by Baray payment services.
