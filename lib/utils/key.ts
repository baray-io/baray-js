import { must } from "./must";

export class Key {
	public type: string;
	public mode: string;
	public key: string;

	public constructor(key_string: string) {
		const [keyType, mode, actualKey] = key_string.split("_");

		must(keyType === "pk" || keyType === "sk", "Invalid key type");

		must(
			mode === "dev" || mode === "uat" || mode === "prod",
			"Invalid key mode"
		);

		must(typeof actualKey !== "undefined", "Invlid key");

		this.type = keyType;
		this.mode = mode;
		this.key = actualKey;
	}

	public isPrivateKey() {
		return this.type === "sk";
	}

	public isPublicKey() {
		return this.type === "pk";
	}
}

export class WebhookKey {
	public type: string;
	public mode: string;
	public key: string;

	public constructor(key_string: string) {
		const [keyType, mode, actualKey] = key_string.split("_");

		must(keyType === "wh", "Invalid webhook key");

		must(mode === "sk" || mode === "iv", "Invalid webhook key type");

		must(typeof actualKey !== "undefined", "Invlid key");

		this.type = keyType;
		this.mode = mode;
		this.key = actualKey;
	}

	public isSecretKey() {
		return this.mode === "sk";
	}

	public isIVKey() {
		return this.mode === "iv";
	}
}
