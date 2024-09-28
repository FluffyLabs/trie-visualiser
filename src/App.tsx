import "./App.css";
import { Header } from "./components/ui/Header";
import { TriePage } from "./pages/trie/TriePage";

function App() {
  return (
    <div className="flex flex-col relative" style={{ height: "100vh" }}>
      <Header />
      <div className="h-full" style={{ maxHeight: "calc(100% - 60px)" }}>
        <TriePage />
      </div>
    </div>
  );
}

export default App;
