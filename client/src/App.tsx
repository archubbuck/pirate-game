import { useEffect } from "react";
import { Game } from "./components/Game";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";

function App() {
  const setBackgroundMusic = useAudio((state) => state.setBackgroundMusic);
  const setHitSound = useAudio((state) => state.setHitSound);
  const setSuccessSound = useAudio((state) => state.setSuccessSound);

  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const hitAudio = new Audio("/sounds/hit.mp3");
    hitAudio.volume = 0.5;
    setHitSound(hitAudio);

    const successAudio = new Audio("/sounds/success.mp3");
    successAudio.volume = 0.5;
    setSuccessSound(successAudio);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return <Game />;
}

export default App;
