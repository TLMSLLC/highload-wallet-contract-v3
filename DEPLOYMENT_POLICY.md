# Deployment policy for TLMSLLC/highload-wallet-contract-v3

## 1. Scope and intent

This policy governs deployment of the **Highload Wallet v3** contract from this repository to any TON network (testnet or mainnet).  
Goal: **No deployment without traceable review, passing checks, and alignment with TLMSLLC governance metadata.**

---

## 2. Governance and metadata requirements

The following repository properties MUST be set and accurate before any production deployment:

- `project_type`: `ton_contract`
- `security_level`: `high`
- `workflow_stage`: one of `development`, `staging`, `production`
- `risk_profile`: documented in README or SECURITY.md
- `ton_contracts`: includes `highload-wallet-v3`

**Policy binding:**

- If `security_level = high`:
  - All required checks in section 4 MUST pass.
  - At least **one human reviewer** with security context MUST approve the deployment PR.
- If `workflow_stage = production`:
  - Direct pushes to `main` are **forbidden**.
  - Deployments MUST originate from a tagged release.

---

## 3. Branching and release model

- **Default branch:** `main`
- **Working branches:** feature branches only (no direct work on `main`).
- **Release tags:** `vX.Y.Z` (e.g., `v1.0.0`)

**Rules:**

1. All changes flow: feature branch → PR → `main`.
2. Production deployments use **annotated tags** on `main`.
3. The contract artifact used for deployment MUST be built from a tagged commit.

---

## 4. Required checks before deployment

The following checks are REQUIRED for any deployment to **staging** or **production**:

1. **Build & compile**
   - Contract compiles successfully using the documented build command.
   - Build is reproducible (same commit → same artifact).

2. **Tests**
   - All automated tests pass (unit/integration/e2e as available).
   - At minimum:
     - Deploy wallet
     - Execute batch transfers
     - Validate balances and expected state

3. **Static analysis / code scanning**
   - Code scanning (e.g., CodeQL) runs on the PR.
   - No **high** or **critical** severity issues remain open.
   - Any **medium** issues are either fixed or explicitly documented as accepted risk.

4. **Dependencies**
   - No known critical vulnerabilities in direct dependencies.
   - Lockfile (if applicable) is committed and up to date.

---

## 5. Audit and delta review

- The upstream Highload Wallet v3 implementation has been externally audited.
- This fork MUST ensure:
  - No intentional changes to core contract logic without:
    - A documented rationale, and
    - A focused internal review (and external audit if material).

**Before first production deployment:**

- Rebuild the contract from this repo and compare the resulting cell to the audited upstream version.
- If they differ:
  - Document the differences.
  - Decide whether a **targeted re‑audit** is required.

---

## 6. Environment and rollout requirements

### 6.1 Testnet first

- All new versions MUST be deployed to **testnet** first.
- Minimum soak period on testnet: **7 days** of normal usage or simulated load.

### 6.2 Mainnet deployment

Mainnet deployment is allowed only if:

1. All checks in section 4 are green.
2. Testnet deployment has completed the soak period without critical incidents.
3. A deployment PR is approved by:
   - At least one maintainer, and
   - One security‑aware reviewer (can be the same person if roles overlap, but approval is explicit).

---

## 7. Operational runbook (minimum)

Before production deployment, the repo MUST contain a short operator guide (e.g., `RUNBOOK.md`) covering:

- How to deploy the contract (step‑by‑step).
- How to verify a successful deployment (addresses, state, basic checks).
- How to handle:
  - Misconfigured timeouts
  - Stuck messages
  - Key rotation / owner change
- Known limits:
  - Max messages per timeout
  - Required uniqueness of `subwallet_id`
  - Query ID structure and expectations

---

## 8. Emergency procedures

If a critical issue is discovered:

1. **Pause further deployments** immediately.
2. Document the issue in the repo (private or public, as appropriate).
3. If possible, deploy a mitigated version to testnet first.
4. Only resume mainnet deployments after:
   - Fix is validated on testnet.
   - Code scanning and tests are green.
   - Reviewers explicitly acknowledge the fix in the PR.

---

## 9. Policy changes

Any change to this policy MUST:

1. Be made via PR.
2. Receive at least one approval from a maintainer.
3. Be reflected in:
   - Repository metadata (if relevant).
   - CI configuration (if it affects required checks).
