import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { HighloadWalletV3 } from '../wrappers/HighloadWalletV3';
import { toNano } from '@ton/core';

describe('Highload Wallet v3 – High Volume Simulation', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let wallet: SandboxContract<HighloadWalletV3>;
    let recipients: SandboxContract<TreasuryContract>[];

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');

        wallet = blockchain.openContract(
            await HighloadWalletV3.createFromConfig(
                {
                    subwalletId: 0x10ad,
                    timeout: 3600,
                    publicKey: deployer.publicKey,
                },
                await HighloadWalletV3.compile()
            )
        );

        await wallet.sendDeploy(deployer.getSender(), toNano('0.1'));

        recipients = [];
        for (let i = 0; i < 10; i++) {
            recipients.push(await blockchain.treasury(`r${i}`));
        }
    });

    it('handles sustained batch traffic without failure', async () => {
        const batches = 500;
        let lastQueryId = (await wallet.getWalletData()).lastQueryId;

        for (let i = 0; i < batches; i++) {
            const batch = recipients.map((r) => ({
                to: r.address,
                value: toNano('0.005'),
                bounce: false,
            }));

            const result = await wallet.sendBatch(
                deployer.getSender(),
                batch,
                toNano('0.2')
            );

            for (const r of recipients) {
                expect(result.transactions).toHaveTransaction({
                    from: wallet.address,
                    to: r.address,
                    success: true,
                });
            }

            const state = await wallet.getWalletData();
            expect(state.lastQueryId).toBe(lastQueryId + 1);
            lastQueryId = state.lastQueryId;

            blockchain.now += 1;
        }
    });
});
