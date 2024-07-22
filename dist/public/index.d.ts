export declare class PublicClient {
    private readonly pay_gateway;
    constructor(public_key: string);
    unloadFrame(): void;
    getPayLink(intent_id: string): string;
    private loadFrame;
    private openPortal;
    confirmPayment(intent_id: string, use_iframe: boolean, on_success?: () => void): void;
}
