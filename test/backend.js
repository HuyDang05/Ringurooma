// backend.js - test script for Ringurooma backend
// This script sends an audio file to the Ringurooma backend for scoring Japanese speech pronunciation

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Configuration - Customize these values as needed
const config = {
  webhookUrl: 'https://n8nbyphd.duckdns.org/webhook-test/process-audio',
  audioFilePath: '../resources/audio/n5level.wav', // Path to your Japanese speech audio file
  userId: 'test-user-123',
  // Sample Japanese text with translation: "Hello, my name is Tanaka. I'm studying Japanese. Please evaluate my pronunciation."
  referenceText: 'こんにちは、私の名前は田中です。日本語を勉強しています。発音を評価してください。'
};

// Utility to check file size in MB
function getFileSizeInMB(filePath) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
  return fileSizeInMB;
}

// Function to validate audio file
function validateAudioFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Audio file not found at ${filePath}`);
  }

  const fileExt = path.extname(filePath).toLowerCase();
  if (!['.wav', '.mp3'].includes(fileExt)) {
    throw new Error(`Unsupported file format: ${fileExt}. Only .wav and .mp3 are supported.`);
  }

  const fileSizeMB = getFileSizeInMB(filePath);
  if (fileSizeMB > 10) {
    throw new Error(`File size (${fileSizeMB.toFixed(2)} MB) exceeds the 10 MB limit.`);
  }

  return {
    mimeType: fileExt === '.wav' ? 'audio/wav' : 'audio/mp3',
    sizeInMB: fileSizeMB
  };
}

// Main function to send the request
async function testRinguroomaBackend() {
  console.log('=== Ringurooma Backend Test ===');
  console.log(`Webhook URL: ${config.webhookUrl}`);
  console.log(`Audio file: ${config.audioFilePath}`);

  try {
    // Validate audio file
    const fileInfo = validateAudioFile(config.audioFilePath);
    console.log(`File validated: ${fileInfo.mimeType}, ${fileInfo.sizeInMB.toFixed(2)} MB`);

    // Create form data
    const formData = new FormData();

    // Add the audio file
    const audioFile = fs.createReadStream(config.audioFilePath);
    formData.append('audio0', audioFile);

    // Add other required data
    formData.append('user_id', config.userId);
    formData.append('reference_text', config.referenceText);

    console.log('\nSending request to Ringurooma backend...');
    console.time('Request completed in');

    // Send the request
    const response = await axios.post(config.webhookUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60000 // 60 seconds timeout
    });

    console.timeEnd('Request completed in');

    // Log the result
    console.log('\nResponse received with status:', response.status);

    // Handle error response
    if (response.data && response.data.error) {
      console.error('Error from server:', response.data.error);
      return;
    }

    // Process successful response
    if (response.data) {
      console.log('\n=== Score Summary ===');

      if (response.data.jlpt_level) {
        console.log(`JLPT Level: ${response.data.jlpt_level}`);
      }

      if (response.data.pronunciation_scores) {
        const scores = response.data.pronunciation_scores;
        console.log('\nPronunciation Scores:');
        console.log(`- Accuracy: ${scores.accuracy || 'N/A'}`);
        console.log(`- Fluency: ${scores.fluency || 'N/A'}`);
        console.log(`- Completeness: ${scores.completeness || 'N/A'}`);
        console.log(`- Pronunciation: ${scores.pronunciation || 'N/A'}`);
      }

      if (response.data.transcription) {
        console.log('\nTranscription:');
        console.log(response.data.transcription);
      }

      if (response.data.sentiment) {
        console.log('\nSentiment Analysis:');
        console.log(`- Score: ${response.data.sentiment.score || 'N/A'}`);
        console.log(`- Sentiment: ${response.data.sentiment.label || response.data.sentiment}`);
      }

      if (response.data.benchmark_comparison) {
        console.log('\nBenchmark Comparison:');
        const benchmark = response.data.benchmark_comparison;
        console.log(`- Accuracy vs Benchmark: ${benchmark.accuracy_vs_benchmark > 0 ? '+' : ''}${benchmark.accuracy_vs_benchmark}`);
        console.log(`- Fluency vs Benchmark: ${benchmark.fluency_vs_benchmark > 0 ? '+' : ''}${benchmark.fluency_vs_benchmark}`);
      }

      // Save full response to file for reference
      fs.writeFileSync(
        './ringurooma-response.json',
        JSON.stringify(response.data, null, 2),
        'utf8'
      );
      console.log('\nFull response saved to ringurooma-response.json');
    }

  } catch (error) {
    console.error('\n❌ Error occurred:');
    if (error.response) {
      // The request was made and the server responded with an error
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server. The server might be down or the URL is incorrect.');
    } else {
      // Error before making the request
      console.error('Error:', error.message);
    }
  }
}

// Helper function to display usage instructions
function showUsage() {
  console.log(`
Usage Instructions:
------------------
1. Install dependencies:
   npm install axios form-data

2. Prepare an audio file:
   - Place a Japanese speech audio file (WAV or MP3) in the same directory
   - Ensure the file is under 10MB in size
   - Update the 'audioFilePath' in the script if using a different filename

3. Customize the test:
   - Update the userId if needed
   - Modify the reference Japanese text to match what is being spoken
   
4. Run the script:
   node backend.js
`);
}

// Run the test
showUsage();
testRinguroomaBackend();