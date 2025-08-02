document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("user-input");
    input.focus();
    let pendingAudioBlob = null;  // lưu audio chưa gửi
    let pendingAudioUrl = null;
    let chatHistories = [];
    let currentChatIndex = -1;  // chỉ số chat hiện tại, -1 nghĩa chưa có chat nào
    let lessonIndex = 0;
    let sessionId = 1000;
    const state = {
        evaluationScores: {
            overall_score: 85,
            accuracy_score: 88,
            fluency_score: 82,
            pronunciation_score: 80,
            prosody_score: 78
        }
    }

    let tempMessages = [];

    // Ghi âm biến
    let mediaRecorder = null;
    let recordedChunks = [];
    function toggleSidebar() {
        const sidebar = document.getElementById("sidebar");
        sidebar.classList.toggle("hidden");
    }


    function scrollChatToBottom() {
        const chatMessages = document.getElementById("chatMessages");
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function renderChatHistoryList() {
        const list = document.getElementById("chat-history-list");
        list.innerHTML = "";

        chatHistories.forEach((chat, index) => {
            const item = document.createElement("div");
            item.textContent = chat.title;
            item.style.cursor = "pointer";
            item.style.padding = "8px";
            item.style.borderBottom = "1px solid #4a4f6e";
            if (index === currentChatIndex) {
                item.style.backgroundColor = "#90c67c";
                item.style.color = "#242933";
                item.style.fontWeight = "bold";
            } else {
                item.style.color = "#90c67c";
            }

            item.onclick = () => {
                if (tempMessages.length > 0) {
                    tempMessages = [];
                }
                loadChatByIndex(index);
            };

            list.appendChild(item);
        });
    }

    function renderChatMessages(messages) {
        const chatMessages = document.getElementById("chatMessages");
        chatMessages.innerHTML = "";

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
                    console.log(msg.chartData);
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
    function loadChatByIndex(index) {
        currentChatIndex = index;
        renderChatHistoryList();
        renderChatMessages(chatHistories[index].messages);
    }

    function startNewChat() {
        sessionId++;
        lessonIndex++;
        const newChat = {
            title: `Lesson ${lessonIndex}`,
            sessionId: sessionId,
            messages: []
        };
        chatHistories.push(newChat);
        currentChatIndex = chatHistories.length - 1;
        renderChatHistoryList();
        renderChatMessages(newChat.messages);
        document.getElementById("user-input").focus();
    }

    async function sendMessage() {
        const input = document.getElementById("user-input");
        const text = input.value.trim();
        console.log("🧪 evaluationScores:", state.evaluationScores);

        if (!text && !pendingAudioBlob) return;
        if (currentChatIndex < 0) {
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

            chatHistories[currentChatIndex].messages.push(userMessage, chartMessage);
            renderChatMessages(chatHistories[currentChatIndex].messages);

            input.value = "";
            input.focus();
            return;
        }

        // ✅ Nếu người dùng yêu cầu gợi ý chủ đề
        if (text.toLowerCase().includes("chủ đề gợi ý")) {
            const mockTopics = [
                "Du lịch", "Công nghệ", "Giáo dục", "Ẩm thực", "Sức khỏe", "Âm nhạc", "Thể thao"
            ];

            chatHistories[currentChatIndex].messages.push({
                from: "bot",
                content: mockTopics,
                type: "topic-suggestion"
            });

            renderChatMessages(chatHistories[currentChatIndex].messages);
            input.value = "";
            input.focus();
            return;
        }

        // ✅ Gửi tin nhắn thông thường
        const audioUrl = pendingAudioBlob ? URL.createObjectURL(pendingAudioBlob) : null;

        const messageToSend = {
            from: "user",
            text: text || null,
            audio: audioUrl
        };

        chatHistories[currentChatIndex].messages.push(messageToSend);
        renderChatMessages(chatHistories[currentChatIndex].messages);

        let type = pendingAudioBlob ? "audio" : "text";
        let chatInputToSend = text || "analyze this audio";

        await sendToWebhook(pendingAudioBlob, chatInputToSend, type);

        pendingAudioBlob = null;
        if (pendingAudioUrl) {
            URL.revokeObjectURL(pendingAudioUrl);
            pendingAudioUrl = null;
        }
        showPendingAudio(null);

        input.value = "";
        renderChatMessages(chatHistories[currentChatIndex].messages);
        input.focus();
    }



    function handleEnterKey(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }


    async function sendToWebhook(audioBlob, chatInputText, type) {
        const formData = new FormData();

        if (audioBlob) {
            formData.append("audio", audioBlob, "recording.mp3");
        }

        formData.append("userId", 1);
        formData.append("chatInput", chatInputText || "analyze this audio");
        formData.append("sessionId", "lesson-" + sessionId);
        formData.append("type", type); // loại yêu cầu gửi đi

        try {
            const response = await fetch("https://n8nbyphd.duckdns.org/webhook-test/backend", {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error("Server trả về lỗi: " + response.status);

            const contentType = response.headers.get("content-type");
            let newMessages = [];

            if (contentType && contentType.includes("application/json")) {
                const result = await response.json();

                // 1. Tin nhắn text từ bot (nếu có)
                if (result.chatOutput) {
                    const formatted = formatChatOutput(result.chatOutput);

                    newMessages.push({
                        from: "bot",
                        content: formatted,
                        audioBlob: audioBlob || null
                    });
                }

                // 2. Gợi ý chủ đề (nếu có)
                if (result.serviceOutput && Array.isArray(result.serviceOutput)) {
                    const topics = result.serviceOutput.map(item => item.topic);
                    newMessages.push({
                        from: "bot",
                        content: topics,
                        type: "topic-suggestion"
                    });
                }

                // 3. Dữ liệu shadowing (nếu có)
                if (result.serviceOutput && result.serviceOutput.text && result.serviceOutput.wpm) {
                    newMessages.push({
                        from: "shadowing",
                        text: result.serviceOutput.text,
                        wpm: result.serviceOutput.wpm
                    });
                }
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
                        chartData: chartData
                    });
                }

            } else {
                const text = await response.text();
                newMessages.push({
                    from: "bot",
                    content: `Phản hồi từ backend (không phải JSON): ${text}`
                });
            }

            // ✅ Sau khi có đầy đủ dữ liệu, thêm tất cả vào messages cùng lúc
            chatHistories[currentChatIndex].messages.push(...newMessages);
            renderChatMessages(chatHistories[currentChatIndex].messages);

        } catch (err) {
            console.error("Lỗi gửi webhook:", err);

            chatHistories[currentChatIndex].messages.push({
                from: "bot",
                content: "Đã có lỗi khi gửi đến backend: " + err.message
            });

            renderChatMessages(chatHistories[currentChatIndex].messages);
        }
    }
    async function handleTopicClick(topic) {
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
        chatHistories[currentChatIndex].messages.push(userMessage, botIntro, shadowingMock);
        renderChatMessages(chatHistories[currentChatIndex].messages);

        // 🟡 Gửi webhook
        try {
            await sendToWebhook(null, "/speech" + topic, "text"); // Gửi topic dưới dạng text, không có audio
        } catch (err) {
            console.error("Failed to send topic to webhook:", err);
        }
    }
    function startRecording() {
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
                    const blob = new Blob(recordedChunks, { type: "audio/mp3" });
                    pendingAudioBlob = blob;

                    if (pendingAudioUrl) {
                        URL.revokeObjectURL(pendingAudioUrl);
                    }
                    pendingAudioUrl = URL.createObjectURL(blob);

                    showPendingAudio(pendingAudioUrl);
                };

                mediaRecorder.start();
            })
            .catch(err => {
                alert("Không thể truy cập micro: " + err.message);
            });
    }


    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }
    }
    function startShadowing(text, wpm, textContainer) {
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

    function formatChatOutput(text) {
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
    function showPendingAudio(audioUrl) {
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
            if (pendingAudioUrl) URL.revokeObjectURL(pendingAudioUrl);
            container.innerHTML = "";
            container.style.display = "none";
        };

        container.appendChild(audioElem);
        container.appendChild(cancelBtn);
    }


    // Xử lý upload file MP3
    const audioUpload = document.getElementById("audio-upload");
    audioUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        pendingAudioBlob = file;

        if (pendingAudioUrl) {
            URL.revokeObjectURL(pendingAudioUrl);
        }
        pendingAudioUrl = URL.createObjectURL(file);

        showPendingAudio(pendingAudioUrl);

        e.target.value = "";
    });

    // Ghi âm logic
    const recordBtn = document.getElementById("record-btn");
    recordBtn.addEventListener("click", async () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            // Dừng ghi âm
            mediaRecorder.stop();
            recordBtn.textContent = "🎤";
            recordBtn.title = "Ghi âm";
        } else {
            // Bắt đầu ghi âm
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
                    const blob = new Blob(recordedChunks, { type: "audio/mp3" });
                    pendingAudioBlob = blob;

                    if (pendingAudioUrl) {
                        URL.revokeObjectURL(pendingAudioUrl);
                    }
                    pendingAudioUrl = URL.createObjectURL(blob);
                    if (pendingAudioUrl && pendingAudioUrl.length > 0) {
                        showPendingAudio(pendingAudioUrl);
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

    // Gán hàm toàn cục để gọi từ HTML
    window.toggleSidebar = toggleSidebar;
    window.startNewChat = startNewChat;
    window.sendMessage = sendMessage;
    window.handleEnterKey = handleEnterKey;

    // Khởi tạo
    renderChatHistoryList();
    renderChatMessages([]);
});
