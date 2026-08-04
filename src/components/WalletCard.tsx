export default function WalletCard() {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "20px",
        marginTop: "24px",
        textAlign: "left",
      }}
    >
      <h3>💼 Sphere Wallet</h3>

      <p>
        <strong>Status:</strong> Not Connected
      </p>

      <p>
        <strong>Address:</strong> --
      </p>

      <p>
        <strong>Balance:</strong> 0 USDC
      </p>

      <button
        style={{
          marginTop: "12px",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Create Wallet
      </button>
    </div>
  );
}
