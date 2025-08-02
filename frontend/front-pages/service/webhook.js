import { state } from "../logic/state.js";
import { renderChatMessages, formatChatOutput } from "../dom/chatUI.js";

export async function sendToWebhook(audioBlob, chatInputText, type) {
    const formData = new FormData();
    console.log("audioBlob", audioBlob);
    console.log("chatInputText", chatInputText);

    if (audioBlob) {
        formData.append("audio", audioBlob, "recording.mp3");
    }

    formData.append("userId", 1);
    formData.append("chatInput", chatInputText || "analyze this audio");
    formData.append("sessionId", "lesson-" + state.sessionId);
    formData.append("type", type);

    try {
        const response = await fetch("https://n8nbyphd.duckdns.org/webhook-test/backend", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Server trả về lỗi: " + response.status);

        const contentType = response.headers.get("content-type");
        let newMessages = [];

        const lastMessages = state.chatHistories[state.currentChatIndex].messages;
        const lastMessage = lastMessages[lastMessages.length - 1];

        if (contentType && contentType.includes("application/json")) {
            const result = await response.json();

            // 1. Phản hồi chính
            if (result.chatOutput) {
                const formatted = formatChatOutput(result.chatOutput);
                newMessages.push({
                    from: "bot",
                    content: formatted,
                    audioBlob: audioBlob || null
                });
            }

            // 2. Gợi ý chủ đề nếu input là chủ đề hoặc /topic
            const inputLower = (chatInputText || "").toLowerCase();
            const isTopicRequest = inputLower.includes("chủ đề") || inputLower.includes("/topic");

            if (isTopicRequest && Array.isArray(result.serviceOutput)) {
                const topics = result.serviceOutput.map(item => item.topic).filter(Boolean);
                if (topics.length > 0) {
                    newMessages.push({
                        from: "bot",
                        content: topics,
                        type: "topic-suggestion"
                    });
                }
            }

            // 3. Shadowing nếu là yêu cầu phát biểu hoặc sau khi click vào topic
            const isSpeechRequest = inputLower.includes("/speech");
            const isAfterTopicClick = lastMessage?.type === "topic-suggestion";

            if ((isSpeechRequest || isAfterTopicClick) &&
                result.serviceOutput?.text &&
                result.serviceOutput?.wpm
            ) {
                newMessages.push({
                    from: "shadowing",
                    text: result.serviceOutput.text,
                    wpm: result.serviceOutput.wpm
                });
            }

            // 4. Nếu có chấm điểm
            if (!result.serviceOutput?.chartData && typeof result.overall_score !== "undefined") {
                const chartData = {
                    type: "bar",
                    labels: ["Overall", "Accuracy", "Fluency", "Pronunciation", "Prosody"],
                    values: [
                        result.overall_score,
                        result.accuracy_score,
                        result.fluency_score,
                        result.pronunciation_score,
                        result.prosody_score
                    ],
                    label: "Đánh giá kỹ năng nói"
                };

                newMessages.push({
                    from: "bot",
                    type: "chart",
                    chartData
                });
            }

        } else {
            const text = await response.text();
            newMessages.push({
                from: "bot",
                content: `Phản hồi từ backend (không phải JSON): ${text}`
            });
        }

        if (newMessages.length > 0) {
            state.chatHistories[state.currentChatIndex].messages.push(...newMessages);
            renderChatMessages(state.chatHistories[state.currentChatIndex].messages);
        }

    } catch (err) {
        console.error("Lỗi gửi webhook:", err);

        state.chatHistories[state.currentChatIndex].messages.push({
            from: "bot",
            content: "Đã có lỗi khi gửi đến backend: " + err.message
        });

        renderChatMessages(state.chatHistories[state.currentChatIndex].messages);
    }
}