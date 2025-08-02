import { handleTopicClick } from "../logic/chat.js";
import { startShadowing } from "../logic/shadowing.js";
import { state } from "../logic/state.js";

export function renderChatHistoryList() {
    const list = document.getElementById("chat-history-list");
    list.innerHTML = "";

    state.chatHistories.forEach((chat, index) => {
        const item = document.createElement("div");
        item.textContent = chat.title;
        item.style.cursor = "pointer";
        item.style.padding = "8px";
        item.style.borderBottom = "1px solid #4a4f6e";
        if (index === state.currentChatIndex) {
            item.style.backgroundColor = "#90c67c";
            item.style.color = "#242933";
            item.style.fontWeight = "bold";
        } else {
            item.style.color = "#90c67c";
        }

        item.onclick = () => {
            if (state.tempMessages.length > 0) {
                state.tempMessages = [];
            }
            loadChatByIndex(index);
        };

        list.appendChild(item);
    });
}

export function renderChatMessages(messages) {
    const chatMessages = document.getElementById("chatMessages");
    chatMessages.innerHTML = "";
    console.log("renderChatMessages", messages);

    messages.forEach(msg => {
        const bubble = document.createElement("div");
        bubble.classList.add("chat-bubble");

        if (msg.from === "user" && msg.text && msg.audio) {
            console.log(msg.audio);
            console.log("msg.text =", msg.text);
            bubble.classList.add("from-user");

            const textElem = document.createElement("div");
            textElem.textContent = msg.text;
            bubble.appendChild(textElem);

            const audioElem = document.createElement("audio");
            audioElem.controls = true;
            audioElem.src = msg.audio;

            bubble.appendChild(audioElem);
        }
        else if (msg.from === "user" && msg.text) {
            bubble.classList.add("from-user");
            bubble.textContent = msg.text;

        } else if (msg.from === "user" && msg.audio) {
            console.log(msg.audio);
            bubble.classList.add("from-user");

            const audioElem = document.createElement("audio");
            audioElem.controls = true;
            audioElem.src = msg.audio;
            bubble.appendChild(audioElem);
        }

        else if (msg.from === "bot") {
            bubble.classList.add("from-bot");

            // Nếu là đề xuất topic
            if (msg.type === "topic-suggestion" && Array.isArray(msg.content)) {
                msg.content.forEach(topic => {
                    const button = document.createElement("button");
                    button.className = "topic-button";
                    button.textContent = topic;
                    button.onclick = () => handleTopicClick(topic);
                    bubble.appendChild(button);
                });
            }
            else if (msg.type === "chart" && msg.chartData) {
                const chartContainer = document.createElement("canvas");
                console.log("hi", msg.chartData);
                chartContainer.style.maxWidth = "100%";
                chartContainer.style.maxHeight = "300px";
                chartContainer.style.borderRadius = "8px";

                bubble.appendChild(chartContainer);
                setTimeout(() => {
                    const ctx = chartContainer.getContext("2d");
                    new Chart(ctx, {
                        type: msg.chartData.type || "bar",
                        data: {
                            labels: msg.chartData.labels,
                            datasets: [{
                                label: msg.chartData.label || "Dữ liệu",
                                data: msg.chartData.values,
                                backgroundColor: "rgba(75, 192, 192, 0.4)",
                                borderColor: "rgba(75, 192, 192, 1)",
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    display: msg.chartData.type !== "pie"
                                }
                            },
                            scales: msg.chartData.type === "bar" || msg.chartData.type === "line" ? {
                                y: {
                                    beginAtZero: true
                                }
                            } : {}
                        }
                    });
                }, 0);
            }
            else {
                bubble.innerHTML = msg.content; // Hỗ trợ Markdown hoặc HTML nhẹ
            }

        } else if (msg.from === "audio") {
            bubble.classList.add("from-user");

            // Tạo audio player
            const audioElem = document.createElement("audio");
            audioElem.controls = true;
            audioElem.src = msg.audio;
            bubble.appendChild(audioElem);
        }
        else if (msg.from === "shadowing") {
            bubble.classList.add("from-bot");

            const textContainer = document.createElement("div");
            textContainer.id = "shadowing-text";
            textContainer.style.marginBottom = "12px";
            textContainer.style.fontSize = "20px"; // tăng cỡ chữ
            textContainer.style.fontWeight = "600"; // đậm
            textContainer.style.lineHeight = "1.6"; // dễ đọc hơn
            textContainer.textContent = msg.text;

            const readyBtn = document.createElement("button");
            readyBtn.textContent = "Sẵn sàng";
            readyBtn.className = "ready-button"; // dùng class CSS
            readyBtn.onclick = () => startShadowing(msg.text, msg.wpm, textContainer);

            bubble.appendChild(textContainer);
            bubble.appendChild(readyBtn);
        }


        chatMessages.appendChild(bubble);
    });

    scrollChatToBottom();

    // Ẩn welcome text nếu đã có tin nhắn
    const welcomeText = document.getElementById("welcome-text");
    if (messages.length > 0) {
        welcomeText.style.display = "none";
    } else {
        welcomeText.style.display = "block";
    }
}

export function scrollChatToBottom() {
    const chatMessages = document.getElementById("chatMessages");
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
function loadChatByIndex(index) {
    state.currentChatIndex = index;
    renderChatHistoryList();
    renderChatMessages(state.chatHistories[index].messages);
}
export function formatChatOutput(text) {
    return text
        .replace(/\*\*(.+?)\*\*:/g, (_, title) => `<h3>${title}</h3>`)
        .replace(/\*\*(.+?)\*\*/g, (_, bold) => `<strong>${bold}</strong>`)
        .replace(/\n?\s*\d+\.\s(.+?)(?=\n|$)/g, (_, item) => `<li>${item}</li>`)
        .replace(/\n?-\s(.+?)(?=\n|$)/g, (_, item) => `<li>${item}</li>`)
        .replace(/\n\s*\n/g, '</p><p>')
        .replace(/^(.+)$/gm, '<p>$1</p>')
        .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
        .replace(/<\/ul>\s*<ul>/g, '');
}