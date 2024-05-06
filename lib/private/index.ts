import { isBrower } from "../utils/is_browser";
import { must } from "../utils/must";
import { Key, WebhookKey } from "../utils/key";
import { IntentDetail, IntentPayload } from "../shared/types";
import CryptoJS from "crypto-js";

export class PrivateClient {
	protected readonly api_key: string;
	protected readonly secret_key: string;
	protected readonly iv_key: string;
	protected readonly wh_secret_key: string;
	protected readonly wh_iv_key: string;

	protected readonly api_gateway: string;

	constructor(
		api_key: string,
		secret_key: string,
		iv_key: string,
		wh_secret_key: string,
		wh_iv_key: string
	) {
		must(!isBrower(), "This libary is not meant to run in the web browser");

		const _api_key = new Key(api_key);
		const _secret_key = new Key(secret_key);
		const _webhook_secret = new WebhookKey(wh_secret_key);
		const _webhook_iv = new WebhookKey(wh_iv_key);
		must(
			_api_key.isPublicKey(),
			"Invalid public key. A public key must start with pk_***"
		);
		must(
			_secret_key.isPrivateKey(),
			"Invalid private key. A secret key must start with sk_***"
		);
		must(
			_webhook_secret.isSecretKey(),
			"Invalid webhook secret key. A webhook secret key must start with wh_sk_***"
		);
		must(
			_webhook_iv.isIVKey(),
			"Invalid webhook IV key. A webhook IV key must start with wh_iv_***"
		);

		const api_gateways = new Map([
			["dev", "http://localhost:3001"],
			["uat", "https://uat-api.baray.io"],
			["prod", "https://api.baray.io"],
		]);

		this.api_key = api_key;
		this.secret_key = secret_key;
		this.iv_key = iv_key;
		this.api_gateway = api_gateways.get(_api_key.mode)!;
		this.wh_secret_key = wh_secret_key;
		this.wh_iv_key = wh_iv_key;
	}

	encrypt(data: string) {
		let key = new Key(this.secret_key);
		let sk = CryptoJS.enc.Base64.parse(key.key);
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

	decryptIntent(data: string) {
		try {
			let _sk = new WebhookKey(this.wh_secret_key);
			let _iv = new WebhookKey(this.wh_iv_key);

			let sk = CryptoJS.enc.Base64.parse(_sk.key);
			let iv = CryptoJS.enc.Base64.parse(_iv.key);

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
}
