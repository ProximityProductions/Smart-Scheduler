// src/services/firebase/geminiService.js
import { GEMINI_API_KEY, API_CONFIG } from '../../config/apiConfig';

export const geminiService = {
  /**
   * Break down a task into subtasks using Gemini AI
   * @param {string} taskTitle - The main task title
   * @param {string} taskDescription - The task description
   * @returns {Promise<Array>} Array of subtask objects
   */
  async breakDownTask(taskTitle, taskDescription) {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const prompt = `You are a task management assistant. Break down the following task into 3-7 actionable subtasks.

Task Title: ${taskTitle}
Task Description: ${taskDescription || 'No description provided'}

Requirements:
- Return ONLY a JSON array
- Each subtask should be specific and actionable
- Keep subtasks concise (10-15 words max)
- Order subtasks logically
- No explanations, just the JSON array

Format:
[
  {"title": "Subtask 1", "description": "Brief description"},
  {"title": "Subtask 2", "description": "Brief description"}
]`;

    try {
      const response = await fetch(
        `${API_CONFIG.GEMINI_BASE_URL}/models/${API_CONFIG.MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: API_CONFIG.MAX_TOKENS,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate subtasks');
      }

      const data = await response.json();
      const generatedText = data.candidates[0]?.content?.parts[0]?.text;

      if (!generatedText) {
        throw new Error('No response from Gemini API');
      }

      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }

      const subtasks = JSON.parse(jsonMatch[0]);

      // Validate subtasks structure
      if (!Array.isArray(subtasks) || subtasks.length === 0) {
        throw new Error('Invalid subtasks format');
      }

      return subtasks.map(subtask => ({
        title: subtask.title || subtask.name || 'Untitled Subtask',
        description: subtask.description || ''
      }));

    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(error.message || 'Failed to break down task with AI');
    }
  },

  /**
   * Test API connection
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      const response = await fetch(
        `${API_CONFIG.GEMINI_BASE_URL}/models/${API_CONFIG.MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }]
          })
        }
      );
      return response.ok;
    } catch {
      return false;
    }
  }
};