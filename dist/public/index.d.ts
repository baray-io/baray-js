export declare class PublicClient {
    private readonly pay_gateway;
    constructor(public_key: string);
    unloadFrame(): void;
    private loadFrame;
    onSuccess(callback: () => void): void;
    confirmPayment(intent_id: string): void;
}
