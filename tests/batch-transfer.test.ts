import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { HighloadWalletV3 } from '../wrappers/HighloadWalletV3';
import { toNano, Address } from '@ton/core';

describe('Highload Wallet v3 – Batch Transfer Behavior', () => {
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

        await wallet.sendDeploy(deployer.getSender(), toNano('0.05'));

        recipients = [
            await blockchain.treasury('r1'),
            await blockchain.treasury('r2'),
            await blockchain.treasury('r3'),
        ];
    });

    it('executes a batch of internal transfers', async () => {
        const batch = recipients.map((r) => ({
            to: r.address,
            value: toNano('0.02'),
            bounce: false,
        }));

        const sendResult = await wallet.sendBatch(
            deployer.getSender(),
            batch,
            toNano('0.1')
        );

        for (const r of recipients) {
            expect(sendResult.transactions).toHaveTransaction({
                from: wallet.address,
                to: r.address,
                success: true,
            });
        }
    });

    it('increments query ID correctly across batch', async () => {
        const initial = await wallet.getWalletData();
        const initialQueryId = initial.lastQueryId;

        const batch = recipients.map((r) => ({
            to: r.address,
            value: toNano('0.01'),
            bounce: false,
        }));

        await wallet.sendBatch(
            deployer.getSender(),
            batch,
            toNano('0.1')
        );

        const after = await wallet.getWalletData();
        expect(after.lastQueryId).toBe(initialQueryId + 1);
    });
});
