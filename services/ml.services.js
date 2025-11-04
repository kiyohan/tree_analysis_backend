const axios = require('axios');

/**
 * Calls the external ML service to analyze a drawing.
 * @param {string} imageURL - The URL of the image to analyze.
 * @returns {Promise<object>} - The analysis result from the ML service.
 */
exports.analyzeDrawing = async (imageURL) => {
  try {
    // In a real scenario, you would call the actual ML API endpoint.
    // For this example, we will mock the response to simulate the API call.
    console.log(`Sending image URL to ML Service: ${imageURL}`);

    // const response = await axios.post(process.env.ML_API_ENDPOINT, {
    //   imageUrl: imageURL,
    //   // You might also send childDetails as per your API spec
    // });
    // return response.data;

    // --- MOCKED RESPONSE FOR DEVELOPMENT ---
    // Simulate a random flagged status
    const isFlagged = Math.random() > 0.5;
    const mockResponse = {
      drawingId: 'mock-uuid-' + Date.now(),
      flaggedForReview: isFlagged,
      flagConfidence: isFlagged ? Math.random() * (0.95 - 0.7) + 0.7 : Math.random() * 0.3,
      psychIndicators: isFlagged ? [
        { indicator: 'emotional_tension', evidence: ['Heavy line pressure detected'], confidence: 0.82 },
        { indicator: 'insecurity', evidence: ['Small figure size relative to page'], confidence: 0.76 }
      ] : [],
      modelVersion: 'htp-ml-mock-v1.0'
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    console.log('Received mock analysis from ML Service:', mockResponse);
    return mockResponse;
    // --- END MOCKED RESPONSE ---

  } catch (error) {
    console.error('Error calling ML service:', error.message);
    // Depending on requirements, you might want to create a case with an 'Error' status
    throw new Error('Failed to get analysis from ML service.');
  }
};