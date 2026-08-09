import Header from "./components/Header";
import WalletCard from "./components/WalletCard";
import Chat from "./components/Chat";
import "./styles/wallet.css";

export default function App() {
  return (
    <div className="qb-page">
      <Header />

      <main className="qb-main">
        <WalletCard />
        <Chat />
      </main>
    </div>
  );
}
