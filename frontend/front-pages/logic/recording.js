import { showPendingAudio } from "../dom/audioPreview.js";

export let mediaRecorder = null;
export let recordedChunks = [];
import { state } from "./state.js";

export function setupAudioUpload() {
    const audioUpload = document.getElementById("audio-upload");

    audioUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        state.pendingAudioBlob = file;

        if (state.pendingAudioUrl) {
            URL.revokeObjectURL(state.pendingAudioUrl);
        }

        state.pendingAudioUrl = URL.createObjectURL(file);
        showPendingAudio(state.pendingAudioUrl);

        e.target.value = ""; // reset input
    });
    console.log(state.pendingAudioUrl);
}

export function setupRecordButton() {
    const recordBtn = document.getElementById("record-btn");

    recordBtn.addEventListener("click", async () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            recordBtn.textContent = "🎤";
            recordBtn.title = "Ghi âm";
        } else {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert("Trình duyệt không hỗ trợ ghi âm!");
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                recordedChunks = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunks, { type: "audio/wav" });
                    state.pendingAudioBlob = blob;

                    if (state.pendingAudioUrl) {
                        URL.revokeObjectURL(state.pendingAudioUrl);
                    }

                    state.pendingAudioUrl = URL.createObjectURL(blob);
                    if (state.pendingAudioUrl && state.pendingAudioUrl.length > 0) {
                        showPendingAudio(state.pendingAudioUrl);
                    } else {
                        console.log("Không gọi showPendingAudio vì audioUrl rỗng");
                    }
                };

                mediaRecorder.start();
                recordBtn.textContent = "⏹️";
                recordBtn.title = "Dừng ghi âm";
            } catch (err) {
                alert("Lỗi khi bật micro: " + err.message);
            }
        }
    });
}
export function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Trình duyệt không hỗ trợ ghi âm!");
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            recordedChunks = [];

            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: "audio/wav" });
                state.pendingAudioBlob = blob;

                if (state.pendingAudioUrl) {
                    URL.revokeObjectURL(state.pendingAudioUrl);
                }
                state.pendingAudioUrl = URL.createObjectURL(blob);

                showPendingAudio(state.pendingAudioUrl);
            };

            mediaRecorder.start();
        })
        .catch(err => {
            alert("Không thể truy cập micro: " + err.message);
        });
}

export function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
    }
}