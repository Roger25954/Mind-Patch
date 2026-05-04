import { HeroSection } from "./components/HeroSection";
import { Features } from "./components/Features";
import { GamesSection } from "./components/GamesSection";
import { PromptBox } from "./components/PromptBox";

function App() {
  return (
    <div style={{ background: "#080808" }}>
      <HeroSection />
      <Features />
      <GamesSection />
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "60px 24px" }}>
        <PromptBox />
      </div>
    </div>
  );
}

export default App;
