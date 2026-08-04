import Header from "./components/Header";

export default function App() {
  return (
    <div>
      <Header />

      <main
        style={{
          maxWidth: "800px",
          margin: "40px auto",
          padding: "20px",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2>Welcome to QuickBot AI</h2>

        <p>
          Create a Sphere wallet, chat with an AI assistant, and manage your
          Web3 assets from one place.
        </p>

        <button
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Create Sphere Wallet
        </button>
      </main>
    </div>
  );
}
