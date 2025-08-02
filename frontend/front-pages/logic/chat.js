import { sendToWebhook } from "../service/webhook.js";
import { renderChatHistoryList, renderChatMessages } from "../dom/chatUI.js";
import { showPendingAudio } from "../dom/audioPreview.js";
import {
    state
} from "./state.js";

export function startNewChat() {
    state.sessionId++;
    state.lessonIndex++;
    const newChat = {
        title: `Lesson ${state.lessonIndex}`,
        sessionId: state.sessionId,
        messages: []
    };
    state.chatHistories.push(newChat);
    state.currentChatIndex = state.chatHistories.length - 1;
    renderChatHistoryList();
    renderChatMessages(newChat.messages);
    document.getElementById("user-input").focus();
}

export async function sendMessage() {
    const input = document.getElementById("user-input");
    const text = input.value.trim();
    console.log("🧪 state.evaluationScores:", state.evaluationScores);

    if (!text && !state.pendingAudioBlob) return;
    if (state.currentChatIndex < 0) {
        startNewChat();
    }

    // ✅ Nếu người dùng yêu cầu đánh giá → hiển thị chart từ mock
    if (text.toLowerCase().includes("đánh giá")) {
        const chartData = {
            type: "bar",
            labels: ["Overall", "Accuracy", "Fluency", "Pronunciation", "Prosody"],
            values: [
                state.evaluationScores.overall_score,
                state.evaluationScores.accuracy_score,
                state.evaluationScores.fluency_score,
                state.evaluationScores.pronunciation_score,
                state.evaluationScores.prosody_score
            ],
            label: "Đánh giá kỹ năng nói"
        };

        const userMessage = { from: "user", text };
        const chartMessage = { from: "bot", type: "chart", chartData };

        state.chatHistories[state.currentChatIndex].messages.push(userMessage, chartMessage);
        renderChatMessages(state.chatHistories[state.currentChatIndex].messages);

        input.value = "";
        input.focus();
        return;
    }

    // ✅ Nếu người dùng yêu cầu gợi ý chủ đề
    if (text.toLowerCase().includes("chủ đề gợi ý")) {
        const mockTopics = [
            "Du lịch", "Công nghệ", "Giáo dục", "Ẩm thực", "Sức khỏe", "Âm nhạc", "Thể thao"
        ];

        state.chatHistories[state.currentChatIndex].messages.push({
            from: "bot",
            content: mockTopics,
            type: "topic-suggestion"
        });

        renderChatMessages(state.chatHistories[state.currentChatIndex].messages);
        input.value = "";
        input.focus();
        return;
    }

    // ✅ Gửi tin nhắn thông thường
    const audioUrl = state.pendingAudioBlob ? URL.createObjectURL(state.pendingAudioBlob) : null;

    const messageToSend = {
        from: "user",
        text: text || null,
        audio: audioUrl
    };

    state.chatHistories[state.currentChatIndex].messages.push(messageToSend);
    renderChatMessages(state.chatHistories[state.currentChatIndex].messages);

    let type = state.pendingAudioBlob ? "audio" : "text";
    let chatInputToSend = text || "analyze this audio";

    await sendToWebhook(state.pendingAudioBlob, chatInputToSend, type);

    state.pendingAudioBlob = null;
    if (state.pendingAudioUrl) {
        URL.revokeObjectURL(state.pendingAudioUrl);
        state.pendingAudioUrl = null;
    }
    showPendingAudio(null);

    input.value = "";
    renderChatMessages(state.chatHistories[state.currentChatIndex].messages);
    input.focus();
}

export function handleEnterKey(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

export function loadChatByIndex(index) {
    state.currentChatIndex = index;
    renderChatHistoryList();
    renderChatMessages(state.chatHistories[index].messages);
}

export async function handleTopicClick(topic) {
    const userMessage = {
        from: "user",
        content: topic
    };

    const botIntro = {
        from: "bot",
        content: `Tuyệt vời! Hãy luyện tập chủ đề "${topic}".`
    };

    const shadowingTexts = {
        "Du lịch": "旅行は新しい文化を体験し、人々と出会う素晴らしい方法です。自分自身を成長させる機会になります。",
        "Công nghệ": "テクノロジーは私たちの生活と仕事の仕方を変えました。便利になった反面、新しい課題も生まれています。",
        "Giáo dục": "教育はより良い未来への鍵です。すべての子どもが質の高い教育を受けるべきです。",
        "Sức khỏe": "健康は幸せの土台です。バランスの取れた食事、運動、十分な休息が大切です。",
        "Âm nhạc": "音楽は感情を表現し、人々をつなぐ力があります。どこにいても音楽は私たちの心を豊かにします。",
        "Ẩm thực": "食べ物は文化を映す鏡です。世界中の料理を味わうことで、他の国や人々への理解が深まります。",
        "Thể thao": "スポーツは健康を保ち、チームワークや努力の大切さを教えてくれます。",
    };

    const shadowingText = shadowingTexts[topic] || ["一緒に日本語で話す練習をしましょう！"];

    const shadowingMock = {
        from: "shadowing",
        text: shadowingText,
        wpm: 130
    };



    // Push vào local chat history
    state.chatHistories[state.currentChatIndex].messages.push(userMessage, botIntro, shadowingMock);
    renderChatMessages(state.chatHistories[state.currentChatIndex].messages);

    // 🟡 Gửi webhook
    try {
        await sendToWebhook(null, `/speech ${topic}` + topic, "text"); // Gửi topic dưới dạng text, không có audio
    } catch (err) {
        console.error("Failed to send topic to webhook:", err);
    }
}