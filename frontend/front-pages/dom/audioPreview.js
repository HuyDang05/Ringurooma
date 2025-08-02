import { state } from "../logic/state.js";

export function showPendingAudio(audioUrl) {
    const container = document.getElementById("pending-audio-container");
    container.innerHTML = "";

    if (!audioUrl) {
        container.style.display = "none";
        return;
    }

    container.style.display = "block";

    const audioElem = document.createElement("audio");
    audioElem.controls = true;
    audioElem.src = audioUrl;

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Hủy audio";
    cancelBtn.onclick = () => {
        if (state.pendingAudioUrl) URL.revokeObjectURL(state.pendingAudioUrl);
        container.innerHTML = "";
        container.style.display = "none";
    };

    container.appendChild(audioElem);
    container.appendChild(cancelBtn);
}
