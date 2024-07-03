export declare class PublicClient {
    private readonly public_key;
    private readonly pay_gateway;
    private readonly api_gateway;
    private readonly bridge;
    private readonly frame;
    constructor(public_key: string);
    init(): Promise<void>;
    private validateIntent;
    unloadFrame(): void;
    private loadFrame;
    confirmPayment(intent_id: string): void;
}
