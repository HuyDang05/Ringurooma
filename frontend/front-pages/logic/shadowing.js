import { startRecording, stopRecording } from "./recording.js";

export function startShadowing(text, wpm, textContainer) {
    const characters = text.split(""); // mỗi ký tự một phần tử
    textContainer.innerHTML = ""; // clear countdown

    startRecording();

    // Chia wpm ra thành ký tự mỗi phút (giả sử trung bình 5 ký tự mỗi từ)
    const cpm = wpm * 5; // character per minute
    const interval = 60000 / cpm; // ms per character
    let index = 0;

    const intervalId = setInterval(() => {
        if (index >= characters.length) {
            clearInterval(intervalId);

            setTimeout(() => {
                stopRecording();
            }, 3000); // dừng sau 3s

            return;
        }

        const span = document.createElement("span");
        span.textContent = characters[index];
        span.style.color = "#90c67c";
        textContainer.appendChild(span);
        index++;
    }, interval);
}