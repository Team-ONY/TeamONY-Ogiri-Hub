export const generateImage = async (prompt) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const API_KEY = import.meta.env.VITE_API_KEY;

  try {
    const response = await fetch(`${API_URL}/api/image/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '画像生成に失敗しました');
    }

    return data.imageUrl;
  } catch (error) {
    console.error('画像生成エラー:', error);
    throw error;
  }
};
