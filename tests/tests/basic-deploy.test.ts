import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { HighloadWalletV3 } from '../wrappers/HighloadWalletV3';
import { toNano } from '@ton/core';

describe('Highload Wallet v3 – Basic Deployment', () => {
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
                    timeout: 3600,
                    publicKey: deployer.publicKey,
                },
                await HighloadWalletV3.compile()
            )
        );
    });

    it('deploys successfully', async () => {
        const deployResult = await wallet.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: wallet.address,
            success: true,
        });
    });

    it('has correct initial state', async () => {
        const state = await wallet.getWalletData();

        expect(state.subwalletId).toBe(0x10ad);
        expect(state.timeout).toBe(3600);
        expect(state.owner.equals(deployer.address)).toBe(true);
    });

    it('accepts a simple internal message', async () => {
        const result = await deployer.send({
            to: wallet.address,
            value: toNano('0.02'),
        });

        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: wallet.address,
            success: true,
        });
    });
});
