import { Howl } from "howler";

const click = new Howl({ src: ["/sounds/click.wav"], volume: 0.4 });
const correct = new Howl({ src: ["/sounds/correct.wav"], volume: 0.6 });
const wrong = new Howl({ src: ["/sounds/wrong.wav"], volume: 0.6 });
const complete = new Howl({ src: ["/sounds/complete.wav"], volume: 0.7 });

export const playClickSfx = () => click.play();
export const playCorrectSfx = () => correct.play();
export const playWrongSfx = () => wrong.play();
export const playCompleteSfx = () => complete.play();
