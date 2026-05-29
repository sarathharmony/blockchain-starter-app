import { FormEvent, useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4002";

type TokenInfo = {
  name: string;
  symbol: string;
  totalSupply: string;
  address: string;
};

type BalanceResult = {
  address: string;
  token: string;
  balance: string;
};

export default function App() {
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [lookupAddress, setLookupAddress] = useState("");
  const [balance, setBalance] = useState<BalanceResult | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/token`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? res.statusText);
        }
        return res.json() as Promise<TokenInfo>;
      })
      .then(setToken)
      .catch((err: Error) => setTokenError(err.message));
  }, []);

  async function onLookup(e: FormEvent) {
    e.preventDefault();
    setBalance(null);
    setBalanceError(null);
    setLoadingBalance(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/balance/${encodeURIComponent(lookupAddress.trim())}`,
      );
      const body = await res.json();
      if (!res.ok) {
        throw new Error((body as { error?: string }).error ?? res.statusText);
      }
      setBalance(body as BalanceResult);
    } catch (err) {
      setBalanceError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingBalance(false);
    }
  }

  return (
    <>
      <h1>ACE Token</h1>

      <section className="card">
        <h2>Token</h2>
        {tokenError && <p className="error">{tokenError}</p>}
        {token && (
          <dl>
            <dt>Name</dt>
            <dd>{token.name}</dd>
            <dt>Symbol</dt>
            <dd>{token.symbol}</dd>
            <dt>Total supply</dt>
            <dd>{token.totalSupply}</dd>
            <dt>Contract</dt>
            <dd>{token.address}</dd>
          </dl>
        )}
        {!token && !tokenError && <p>Loading…</p>}
      </section>

      <section className="card">
        <h2>Balance lookup</h2>
        <form onSubmit={onLookup}>
          <label htmlFor="address">Wallet address</label>
          <input
            id="address"
            value={lookupAddress}
            onChange={(e) => setLookupAddress(e.target.value)}
            placeholder="0x…"
            required
          />
          <button type="submit" disabled={loadingBalance}>
            {loadingBalance ? "Looking up…" : "Look up"}
          </button>
        </form>
        {balanceError && <p className="error">{balanceError}</p>}
        {balance && (
          <dl style={{ marginTop: "1rem" }}>
            <dt>Address</dt>
            <dd>{balance.address}</dd>
            <dt>Balance (wei)</dt>
            <dd>{balance.balance}</dd>
          </dl>
        )}
      </section>
    </>
  );
}
