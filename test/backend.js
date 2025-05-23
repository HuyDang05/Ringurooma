// backend.js - test script for Ringurooma backend
// This script sends an HTTP request to the Ringurooma backend for testing

/**
 * === USAGE INSTRUCTIONS ===
 * 
 * 1. Run the script with Node.js:
 *    node backend.js
 * 
 * 2. Required Parameters:
 *    - userId: A number that identifies the user (required)
 *    - chatInput: Text input from the chat (required)
 *    - sessionId: A string to identify the session (required) 
 *    - audio: Audio file (optional)
 * 
 * 3. Configuration:
 *    You can modify the configuration variables below to change:
 *    - The target API endpoint URL
 *    - Whether to include an audio file
 *    - Other request parameters
 * 
 * 4. Testing Different Scenarios:
 *    - To test without audio: Set includeAudio to false
 *    - To test with audio: Set includeAudio to true and make sure audioFilePath points to a valid file
 */

const fs = require('fs');
const path = require('path');

// Configuration - Customize these values as needed
const config = {
  webhookUrl: 'https://n8nbyphd.duckdns.org/webhook-test/backend',
  audioFilePath: '../resources/audio/shortest_fast.wav', // Path to your audio file
  userId: 1,
  chatInput: '\\eval',
  sessionId: 'test-session',
  includeAudio: true // Set to false to test without audio
};

// Main function to send the request using fetch API
async function testRinguroomaBackend() {
  console.log('=== Ringurooma Backend Test ===');
  console.log(`Webhook URL: ${config.webhookUrl}`);

  try {
    // Create FormData object (equivalent to multipart/form-data)
    const formData = new FormData();

    // Add required fields
    formData.append('userId', config.userId);
    formData.append('chatInput', config.chatInput);
    formData.append('sessionId', config.sessionId);

    // Add audio file if included
    if (config.includeAudio) {
      console.log(`Including audio file: ${config.audioFilePath}`);

      try {
        const audioBuffer = fs.readFileSync(config.audioFilePath);
        const audioBlob = new Blob([audioBuffer], {
          type: path.extname(config.audioFilePath) === '.wav' ? 'audio/wav' : 'audio/mp3'
        });
        formData.append('audio', audioBlob, path.basename(config.audioFilePath));
      } catch (fileError) {
        console.error(`Error reading audio file: ${fileError.message}`);
        return;
      }
    }

    console.log('\nSending request to Ringurooma backend...');
    console.time('Request completed in');

    // Send the request using fetch API
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      body: formData,
    });

    console.timeEnd('Request completed in');
    console.log(`Response status: ${response.status}`);

    // Parse and display the response
    const responseData = await response.json();
    console.log('\nResponse data:');
    console.log(JSON.stringify(responseData, null, 2));

  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error(`Error message: ${error.message}`);
  }
}

// Run the test
testRinguroomaBackend();