import axiosClient from './axiosClient';

// Per-user 1-Click Betting stake values (game-details user-settings block).
// GET /user/buttonlist on load, POST /user/updatebuttonlist on Save.

const DEFAULT_BUTTONS = [100, 200, 300];

export async function getOneClickButtons() {
  try {
    const { data } = await axiosClient.get('/user/buttonlist');
    if (data.success && Array.isArray(data.data?.buttons) && data.data.buttons.length === 3) {
      return data.data.buttons.map(Number);
    }
    throw new Error(data.error || 'Failed to fetch button list');
  } catch (err) {
    console.error('Error fetching one-click button list:', err);
    return DEFAULT_BUTTONS;
  }
}

export async function updateOneClickButtons(buttons) {
  const { data } = await axiosClient.post('/user/updatebuttonlist', { buttons });
  if (data.success) return data.data.buttons;
  throw new Error(data.error || 'Failed to update button list');
}
