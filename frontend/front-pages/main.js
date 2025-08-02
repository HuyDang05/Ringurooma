import { toggleSidebar } from "./dom/sidebar.js";
import { startNewChat, sendMessage, handleEnterKey } from "./logic/chat.js";
import { renderChatHistoryList, renderChatMessages } from "./dom/chatUI.js";
import { setupAudioUpload, setupRecordButton } from "./logic/recording.js";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("user-input").focus();
  document.getElementById("sidebar-toggle-btn").addEventListener("click", toggleSidebar);
  document.getElementById("new-chat-btn").addEventListener("click", startNewChat);
  document.getElementById("send-btn").addEventListener("click", sendMessage);
  document.getElementById("user-input").addEventListener("keydown", handleEnterKey);


  renderChatHistoryList();
  renderChatMessages([]);

  setupAudioUpload();
  setupRecordButton();

  // Gắn vào window nếu cần gọi từ HTML
  window.toggleSidebar = toggleSidebar;
  window.startNewChat = startNewChat;
  window.sendMessage = sendMessage;
  window.handleEnterKey = handleEnterKey;
});
