import { isBrower } from "../utils/is_browser";
import { must } from "../utils/must";
import { AbaQrResponse, IntentDetail, IntentPayload } from "../shared/types";
import CryptoJS from "crypto-js";

export class PrivateClient {
	protected readonly api_key: string;
	protected readonly secret_key: string;
	protected readonly iv_key: string;
	protected readonly api_gateway: string;

	constructor(api_key: string, secret_key: string, iv_key: string) {
		must(!isBrower(), "This libary is not meant to run in the web browser");
		must(
			api_key.startsWith("pk_prod_") ||
				api_key.startsWith("pk_uat_") ||
				api_key.startsWith("pk_dev_"),
			"Invalid API key"
		);
		must(
			secret_key.length === 44,
			"Invalid secret key. A secret key length must be 44 chars"
		);
		must(
			iv_key.length === 24,
			"Invalid iv key. An iv key length must be 24 chars"
		);

		this.api_key = api_key;
		this.secret_key = secret_key;
		this.iv_key = iv_key;
		this.api_gateway = "https://api.baray.io";
	}

	public encrypt(data: string) {
		let sk = CryptoJS.enc.Base64.parse(this.secret_key);
		let iv = CryptoJS.enc.Base64.parse(this.iv_key);

		const cfg = {
			iv: iv, // parse the IV
			padding: CryptoJS.pad.Pkcs7,
			mode: CryptoJS.mode.CBC,
		};
		const cipher = CryptoJS.AES.encrypt(data, sk, cfg);

		return CryptoJS.enc.Base64.parse(cipher.toString()).toString(
			CryptoJS.enc.Base64
		);
	}

	public decryptIntent(data: string) {
		try {
			let sk = CryptoJS.enc.Base64.parse(this.secret_key);
			let iv = CryptoJS.enc.Base64.parse(this.iv_key);

			const cfg = {
				iv: iv, // parse the IV
				padding: CryptoJS.pad.Pkcs7,
				mode: CryptoJS.mode.CBC,
			};

			const value = CryptoJS.AES.decrypt(data, sk, cfg);
			return value.toString(CryptoJS.enc.Utf8);
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	async createIntent(intent: IntentPayload) {
		const myHeaders = new Headers();
		myHeaders.append("x-api-key", this.api_key);
		myHeaders.append("Content-Type", "application/json");

		const raw = JSON.stringify(intent);
		const encrypted = this.encrypt(raw);

		const body = JSON.stringify({
			data: encrypted,
		});

		const requestOptions: RequestInit = {
			method: "POST",
			headers: myHeaders,
			body: body,
			redirect: "follow",
		};

		const result = await fetch(`${this.api_gateway}/pay`, requestOptions);
		return (await result.json()) as IntentDetail;
	}

	async createAbaQr(intent: IntentPayload) {
		const myHeaders = new Headers();
		myHeaders.append("x-api-key", this.api_key);
		myHeaders.append("Content-Type", "application/json");

		const raw = JSON.stringify(intent);
		const encrypted = this.encrypt(raw);

		const body = JSON.stringify({
			data: encrypted,
		});

		const requestOptions: RequestInit = {
			method: "POST",
			headers: myHeaders,
			body: body,
			redirect: "follow",
		};

		const result = await fetch(
			`${this.api_gateway}/payments/aba/pay_qr`,
			requestOptions
		);
		return (await result.json()) as AbaQrResponse;
	}
}
