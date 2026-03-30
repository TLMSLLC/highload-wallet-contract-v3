import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { HighloadWalletV3 } from '../wrappers/HighloadWalletV3';
import { toNano } from '@ton/core';

describe('Highload Wallet v3 – Query ID Rollover & Timeout Enforcement', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let wallet: SandboxContract<HighloadWalletV3>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');

        wallet = blockchain.openContract(
            await HighloadWalletV3.createFromConfig(
                {
                    subwalletId: 0x10ad,
                    timeout: 2, // short timeout for testing
                    publicKey: deployer.publicKey,
                },
                await HighloadWalletV3.compile()
            )
        );

        await wallet.sendDeploy(deployer.getSender(), toNano('0.05'));
    });

    it('increments bitnumber until rollover occurs', async () => {
        const initial = await wallet.getWalletData();
        const initialQueryId = initial.lastQueryId;

        // Send enough batches to force bitnumber rollover
        for (let i = 0; i < 1100; i++) {
            await wallet.sendBatch(
                deployer.getSender(),
                [
                    {
                        to: deployer.address,
                        value: toNano('0.01'),
                        bounce: false,
                    },
                ],
                toNano('0.05')
            );
        }

        const after = await wallet.getWalletData();

        // Query ID must have advanced by 1100 batches
        expect(after.lastQueryId).toBe(initialQueryId + 1100);
    });

    it('rejects stale batches after timeout expires', async () => {
        const batch = [
            {
                to: deployer.address,
                value: toNano('0.01'),
                bounce: false,
            },
        ];

        // Send a valid batch
        const first = await wallet.sendBatch(
            deployer.getSender(),
            batch,
            toNano('0.05')
        );

        expect(first.transactions).toHaveTransaction({
            from: wallet.address,
            to: deployer.address,
            success: true,
        });

        // Advance blockchain time beyond timeout
        blockchain.now = blockchain.now + 10;

        // Attempt to send the same batch again (should fail)
        const second = await wallet.sendBatch(
            deployer.getSender(),
            batch,
            toNano('0.05')
        );

        expect(second.transactions).toHaveTransaction({
            from: wallet.address,
            to: deployer.address,
            success: false,
        });
    });
});
