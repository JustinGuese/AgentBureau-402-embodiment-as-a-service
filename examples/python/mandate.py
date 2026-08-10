"""Create a spend mandate and watch it refuse an over-budget call.

Unlike the other examples in this folder, this one needs NO USDC and sends NO
transaction. A mandate is a signature, and an over-budget call is refused before any
payment is requested — so the whole script runs on an empty wallet.

Docs: https://agentbureau.de/docs/for-agents/spend-mandates
"""

import os
import uuid
from datetime import datetime, timedelta, timezone

import httpx
from dotenv import load_dotenv
from eth_account.messages import encode_defunct
from web3 import Web3

load_dotenv()

PRIVATE_KEY = os.getenv("PRIVATE_KEY", "your_private_key_here")
API_BASE = os.getenv("API_BASE", "https://agentbureau-api.datafortress.cloud/v1")
# "mainnet" for /v1, "testnet" for /dev/v1 — the mount decides, and it is part of the
# signed document, so a testnet mandate can never authorize mainnet spend.
CHAIN = os.getenv("CHAIN", "testnet" if "/dev/" in API_BASE else "mainnet")

w3 = Web3()
account = w3.eth.account.from_key(PRIVATE_KEY)

# --- The mandate ------------------------------------------------------------------
CAPS = {
    "per_call_cap_usdc": 2.00,   # a single call may never cost more than this
    "daily_cap_usdc": 10.00,     # UTC calendar day
    "monthly_cap_usdc": None,    # None = unlimited
    "total_cap_usdc": None,
}
# Empty list = every priced endpoint. Inkasso is deliberately left out below so the
# scope check has something to refuse.
ALLOWED_PATHS = ["/v1/fax", "/v1/letters", "/v1/invoices"]
VALID_FOR_DAYS = 30


def _fmt_cap(value):
    """'*' means unlimited. Six decimals otherwise — must match the server exactly."""
    return "*" if value is None else f"{float(value):.6f}"


def _iso(dt: datetime) -> str:
    """Naive UTC, second precision."""
    return dt.astimezone(timezone.utc).replace(tzinfo=None).isoformat(timespec="seconds")


def build_mandate():
    not_before = datetime.now(timezone.utc)
    expires_at = not_before + timedelta(days=VALID_FOR_DAYS)
    nonce = uuid.uuid4().hex

    # The canonical seed. Every field is load-bearing: the server recomputes this
    # string from your JSON and recovers the signer against the resulting hash, so any
    # difference in ordering, casing or formatting surfaces as a 403.
    seed = ":".join([
        CHAIN,
        account.address.lower(),
        account.address.lower(),
        _fmt_cap(CAPS["per_call_cap_usdc"]),
        _fmt_cap(CAPS["daily_cap_usdc"]),
        _fmt_cap(CAPS["monthly_cap_usdc"]),
        _fmt_cap(CAPS["total_cap_usdc"]),
        ",".join(sorted(p.rstrip("/") for p in ALLOWED_PATHS)),
        _iso(not_before),
        _iso(expires_at),
        nonce,
    ])
    mandate_id = Web3.keccak(text=seed).hex()
    if not mandate_id.startswith("0x"):
        mandate_id = "0x" + mandate_id

    signature = w3.eth.account.sign_message(
        encode_defunct(text=f"AgentBureau Mandate: {mandate_id}"), private_key=PRIVATE_KEY
    ).signature.hex()
    if not signature.startswith("0x"):
        signature = "0x" + signature

    body = {
        "controller_address": account.address,
        "spender_address": account.address,  # same wallet: no co-signature needed
        "chain": CHAIN,
        **CAPS,
        "allowed_paths": sorted(p.rstrip("/") for p in ALLOWED_PATHS),
        "nonce": nonce,
        "not_before": _iso(not_before),
        "expires_at": _iso(expires_at),
        "controller_signature": signature,
    }
    return mandate_id, body


def run_flow():
    mandate_id, body = build_mandate()
    print(f"Wallet: {account.address}")
    print(f"Computed mandate_id: {mandate_id}")

    # 1. Create it. Free — no 402, no payment.
    response = httpx.post(f"{API_BASE}/mandates", json=body, timeout=30)
    if response.status_code != 200:
        print(f"Create failed ({response.status_code}): {response.text}")
        return
    print(f"Created. Server agrees on id: {response.json()['mandate_id'] == mandate_id}\n")

    headers = {"X-MANDATE-ID": mandate_id}

    # 2. A fax costs 1.00 USDC — under the 2.00 per-call cap, so the normal 402 arrives.
    fax = httpx.post(
        f"{API_BASE}/fax",
        json={"recipient_number": "+49123456789", "content": "Within budget."},
        headers=headers, timeout=30,
    )
    print(f"POST /fax      (1.00 USDC) -> {fax.status_code} "
          f"{'payment requested, as normal' if fax.status_code == 402 else fax.text}")

    # 3. An invoice costs 5.00 USDC — over the cap. 403, and no payment was ever asked
    #    for, so the agent cannot accidentally pay for something it is not allowed to do.
    invoice = httpx.post(
        f"{API_BASE}/invoices",
        json={"recipient_name": "Acme GmbH", "recipient_email": "billing@acme.de",
              "amount": 100.0, "description": "Consulting"},
        headers=headers, timeout=30,
    )
    print(f"POST /invoices (5.00 USDC) -> {invoice.status_code} "
          f"X-POLICY-DENIED: {invoice.headers.get('X-POLICY-DENIED')}")
    if invoice.status_code == 403:
        detail = invoice.json()
        # cap_usdc is only present on cap breaches, not on scope/expiry/revocation denials.
        if "cap_usdc" in detail:
            print(f"  attempted {detail['attempted_usdc']} USDC against a cap of {detail['cap_usdc']} USDC")
        print(f"  spent so far today: {detail['spent_today_usdc']} USDC")

    # 4. Anything outside the allowlist is refused regardless of price.
    inkasso = httpx.post(
        f"{API_BASE}/legal/inkasso",
        json={"debtor_name": "Late Payer Ltd", "debtor_address": "Shady Lane 4, London",
              "amount": 1500, "invoice_pdf_uri": "https://example.com/unpaid.pdf",
              "dunning_history": []},
        headers=headers, timeout=30,
    )
    print(f"POST /legal/inkasso        -> {inkasso.status_code} "
          f"X-POLICY-DENIED: {inkasso.headers.get('X-POLICY-DENIED')}")

    # 5. Remaining budget, any time, for free.
    status = httpx.get(f"{API_BASE}/mandates/{mandate_id}/status", timeout=30).json()
    print(f"\nBudget: {status['spent_today_usdc']} spent today, "
          f"{status['remaining_today_usdc']} remaining, resets {status['daily_reset_at']}")


if __name__ == "__main__":
    run_flow()
