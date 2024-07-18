export declare class PublicClient {
    private readonly pay_gateway;
    constructor(public_key: string);
    unloadFrame(): void;
    private loadFrame;
    openPortal(intent_id: string): void;
    confirmPayment(intent_id: string, _onSuccess?: () => void): void;
}
