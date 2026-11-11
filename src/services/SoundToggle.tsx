import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faVolumeXmark } from "@fortawesome/free-solid-svg-icons";

import { playSound, setSoundMuted, useSoundMuted } from "./sound";

import "./soundToggle.css";

export const SoundToggle = () => {
  const isMuted = useSoundMuted();

  const toggle = () => {
    setSoundMuted(!isMuted);
    if (isMuted) {
      playSound("tap");
    }
  };

  return (
    <button
      type="button"
      className={`soundToggle ${isMuted ? "isMuted" : ""}`}
      onClick={toggle}
      aria-label={isMuted ? "Włącz dźwięk" : "Wycisz dźwięk"}
      aria-pressed={!isMuted}
      title={isMuted ? "Włącz dźwięk" : "Wycisz dźwięk"}
    >
      <FontAwesomeIcon icon={isMuted ? faVolumeXmark : faVolumeHigh} />
    </button>
  );
};
