import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { HighloadWalletV3 } from '../wrappers/HighloadWalletV3';
import { JettonMaster, JettonWallet } from '../wrappers/Jetton';
import { toNano } from '@ton/core';

describe('Highload Wallet v3 – Jetton Batch Transfers', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let wallet: SandboxContract<HighloadWalletV3>;
    let jettonMaster: SandboxContract<JettonMaster>;
    let deployerJettonWallet: SandboxContract<JettonWallet>;
    let recipients: SandboxContract<TreasuryContract>[];
    let recipientJettonWallets: SandboxContract<JettonWallet>[];

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

        jettonMaster = blockchain.openContract(await JettonMaster.create());
        await jettonMaster.sendDeploy(deployer.getSender(), toNano('0.1'));

        deployerJettonWallet = blockchain.openContract(
            await jettonMaster.getWallet(deployer.address)
        );

        await jettonMaster.mint(
            deployer.getSender(),
            deployer.address,
            toNano('1000')
        );

        recipients = [];
        recipientJettonWallets = [];

        for (let i = 0; i < 5; i++) {
            const r = await blockchain.treasury(`r${i}`);
            recipients.push(r);

            const jw = blockchain.openContract(
                await jettonMaster.getWallet(r.address)
            );
            recipientJettonWallets.push(jw);
        }
    });

    it('executes a batch of jetton transfers', async () => {
        const batch = recipients.map((r) => ({
            to: r.address,
            jettonAmount: toNano('5'),
        }));

        const result = await wallet.sendJettonBatch(
            deployer.getSender(),
            deployerJettonWallet.address,
            batch,
            toNano('0.2')
        );

        for (let i = 0; i < recipients.length; i++) {
            expect(result.transactions).toHaveTransaction({
                from: deployerJettonWallet.address,
                to: recipientJettonWallets[i].address,
                success: true,
            });

            const balance = await recipientJettonWallets[i].getBalance();
            expect(balance).toBe(toNano('5'));
        }
    });

    it('increments query ID after jetton batch', async () => {
        const initial = await wallet.getWalletData();
        const initialQueryId = initial.lastQueryId;

        const batch = recipients.map((r) => ({
            to: r.address,
            jettonAmount: toNano('3'),
        }));

        await wallet.sendJettonBatch(
            deployer.getSender(),
            deployerJettonWallet.address,
            batch,
            toNano('0.2')
        );

        const after = await wallet.getWalletData();
        expect(after.lastQueryId).toBe(initialQueryId + 1);
    });
});
