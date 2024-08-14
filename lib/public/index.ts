import { isBrower } from "../utils/is_browser";
import { Key } from "../utils/key";
import { must } from "../utils/must";

export class PublicClient {
	private readonly pay_gateway: string;

	public constructor(public_key: string) {
		must(isBrower(), "This libary is meant to run only in the web browser");
		const key = new Key(public_key);
		must(
			key.isPublicKey(),
			"Invalid public key. A public key must start with pk_***"
		);

		const pay_gateways = new Map([
			["dev", "http://localhost:5173"],
			["uat", "https://uat-pay.baray.io"],
			["prod", "https://pay.baray.io"],
		]);

		this.pay_gateway = pay_gateways.get(key.mode)!;
	}

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

	getPayLink(intent_id: string) {
		return `${this.pay_gateway}/${intent_id}`;
	}

	// @ts-ignore
	private loadFrame(intent_id: string, onSuccess?: () => void) {
		const body = document.body;
		const frame = document.createElement("iframe");

		frame.id = "baray";
		frame.src = this.getPayLink(intent_id);

		frame.sandbox.add("allow-scripts");
		frame.sandbox.add("allow-popups");
		frame.sandbox.add("allow-forms");
		frame.sandbox.add("allow-popups-to-escape-sandbox");
		frame.sandbox.add("allow-top-navigation-to-custom-protocols");

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

	private openPortal(intent_id: string) {
		window.location.replace(this.getPayLink(intent_id));
	}

	confirmPayment(props: {
		intent_id: string;
		use_iframe: boolean;
		on_success?: () => void;
	}) {
		if (props.use_iframe) {
			if (!props.intent_id) {
				return this.unloadFrame();
			}
			this.loadFrame(props.intent_id, props.on_success);
		} else {
			this.openPortal(props.intent_id);
		}
	}
}
