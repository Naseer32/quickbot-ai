import Header from "./components/Header";
import WalletCard from "./components/WalletCard";

export default function App() {
  return (
    <div>
      <Header />

      <main
        style={{
          maxWidth: "800px",
          margin: "40px auto",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2>Welcome to QuickBot AI</h2>

        <p>
          Your AI-powered Web3 assistant built with the Unicity Sphere SDK.
        </p>

        <WalletCard />
<SignMessage />
      </main>
    </div>
  );
}
