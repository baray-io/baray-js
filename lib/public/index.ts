import { isBrower } from "../utils/is_browser";
import { Key } from "../utils/key";
import { must } from "../utils/must";

export class PublicClient {
	// private readonly public_key: string;
	private readonly pay_gateway: string;
	// private readonly api_gateway: string;

	public constructor(public_key: string) {
		must(isBrower(), "This libary is meant to run only in the web browser");
		const key = new Key(public_key);
		must(
			key.isPublicKey(),
			"Invalid public key. A public key must start with pk_***"
		);

		// const api_gateways = new Map([
		// 	["dev", "http://localhost:3001"],
		// 	["uat", "https://uat-api.baray.io"],
		// 	["prod", "https://api.baray.io"],
		// ]);

		const pay_gateways = new Map([
			["dev", "http://localhost:5173"],
			["uat", "https://uat-pay.baray.io"],
			["prod", "https://pay.baray.io"],
		]);

		// this.public_key = public_key;
		// this.api_key = key.key;
		// this.api_gateway = api_gateways.get(key.mode)!;
		this.pay_gateway = pay_gateways.get(key.mode)!;
	}

	// private async validateIntent(intent_id: string) {
	// 	const res = await fetch(`${this.api_gateway}/pay/validate/${intent_id}`, {
	// 		method: "POST",
	// 		headers: {
	// 			"x-api-key": this.public_key,
	// 			contentType: "application/json",
	// 		},
	// 	});
	// 	return await res.json();
	// }

	public unloadFrame() {
		console.log("Frame unloading");
		const existing = document.querySelector("#baray") as HTMLIFrameElement;
		if (existing) {
			existing.style.opacity = "0";
			existing.style.transform = "translate(0px, 20px)";
			setTimeout(() => {
				existing.remove();
			}, 500);
		}
	}

	// @ts-ignore
	private loadFrame(intent_id: string, onSuccess?: () => void) {
		const body = document.body;
		const frame = document.createElement("iframe");

		frame.id = "baray";
		frame.src = `${this.pay_gateway}/${intent_id}`;

		frame.style.backgroundColor = "transparent";
		frame.style.position = "fixed";
		frame.style.zIndex = "2147483647";
		frame.style.top = "0";
		frame.style.left = "0";
		frame.style.width = "100vw";
		frame.style.height = "100dvh";
		frame.style.border = "none";
		frame.style.transition = "ease-out 300ms";

		window.addEventListener("message", (e) => {
			if (e.origin === this.pay_gateway) {
				if (e.data === "close") {
					this.unloadFrame();
				}

				if (e.data === "success") {
					if (typeof onSuccess === "function") {
						onSuccess();
					}
				}
			}
		});

		body.appendChild(frame);
	}

	openPortal(intent_id: string) {
		let url = `${this.pay_gateway}/${intent_id}`;
		// window.location.replace(url);
		window.open(url, "_blank", "noopener noreferrer");
	}

	confirmPayment(intent_id: string, _onSuccess?: () => void) {
		if (!intent_id) {
			return this.unloadFrame();
		}
		// this.loadFrame(intent_id, onSuccess);
		this.openPortal(intent_id);
	}
}
