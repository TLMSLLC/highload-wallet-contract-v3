# highl## 📦 Repository Metadata (TLMSLLC Organization Standard)

This repository uses TLMSLLC’s organization‑wide custom property schema to ensure
consistent classification, security alignment, and ecosystem clarity across all
projects. These properties are applied at the organization level and help with
automation, governance, and contributor onboarding.

### 🔧 Custom Properties

| Property | Type | Description |
|---------|------|-------------|
| `project_type` | Single select | Identifies the primary category of the repository within the TLMSLLC ecosystem. Used for filtering, automation, and documentation consistency. |
| `security_level` | Single select | Defines the sensitivity and visibility requirements for the repository. Supports internal governance and access‑control workflows. |
| `compliance_framework` | Single select | Indicates which compliance frameworks apply to the repository’s contents or workflows. |
| `ecosystem_token` | Text | Specifies which token or asset this repository belongs to within the TLMSLLC ecosystem (e.g., L7L, L7L5). |
| `workflow_stage` | Single select | Tracks the lifecycle stage of the repository to support automation, cleanup, and roadmap visibility. |
| `risk_profile` | Multi select | Indicates the operational or security risk level associated with the repository’s contents or dependencies. |
| `owner_team` | Single select | Identifies the internal team responsible for maintaining the repository. |
| `ton_contracts` | Single select | Specifies the type of TON smart contracts associated with this repository. |

### 🧭 Why These Properties Matter

These metadata fields help TLMSLLC:

- Maintain consistent documentation and structure across all repos  
- Automate workflows based on project type, risk, or lifecycle stage  
- Improve internal discoverability and cross‑team coordination  
- Support compliance, security, and governance requirements  
- Map repositories to tokens and smart‑contract components in the ecosystem  

Contributors do not need to modify these values directly; they are managed at the
organization level.
oad-wallet-contract-v3

⚠️ `timeout` must be greater then 0. We recommend using a timeout from 1 hour to 24 hours.

⚠️ This highload-wallet has a limit of 8380415 messages per timeout. If you fill the dictionary completely during the timeout, you will have to wait for the timeout before the dictionary is freed.

⚠️ Use an `subwallet_id` different from the `subwallet_id`'s of other contracts (regular wallets or vesting wallets). We recommend using `0x10ad` as `subwallet_id`.

`query_id` is a composite ID consisting of a shift ([0 .. 8191]) and a bitnumber ([0 .. 1022]). Use `HighloadQueryId.ts` wrapper.

`npm install`

Build:

`npm run build`

Test:

`npm run test`

Useful examples can be found below:
 * [Withdrawal](https://github.com/toncenter/examples/blob/main/withdrawals-highload.js)
 * [Jetton withdrawal](https://github.com/toncenter/examples/blob/main/withdrawals-jettons.js)
 * [Batch withdrawal](https://github.com/toncenter/examples/blob/main/withdrawals-highload-batch.js)
 * [Jetton batch withdrawal](https://github.com/toncenter/examples/blob/main/withdrawals-jettons-highload-batch.js)

Author: [Andrew Gutarev](https://github.com/pyAndr3w)

## Security

The highload-wallet-contract-v3 smart contract has been audited by:
- TonTech: [Audit Report](./audits/ton-blockchain_highload-wallet-contract-v3_2025-04-24.pdf)
