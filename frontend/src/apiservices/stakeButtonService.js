import axiosClient from './axiosClient';

const defaultGameButtons = [
  { label: '+1000', value: 1000 },
  { label: '+2000', value: 2000 },
  { label: '+5000', value: 5000 },
  { label: '+10000', value: 10000 },
  { label: '+20000', value: 20000 },
  { label: '+25000', value: 25000 },
];

const defaultCasinoButtons = [
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '200', value: 200 },
  { label: '500', value: 500 },
  { label: '1000', value: 1000 },
];

export async function getStakeButtonValues() {
  try {
    const { data } = await axiosClient.get('/user/stake-button-values');
    if (data.success) {
      return data.data;
    }
    throw new Error(data.error || 'Failed to fetch stake button values');
  } catch (err) {
    console.error('Error fetching stake button values:', err);
    return {
      game_buttons: defaultGameButtons,
      casino_buttons: defaultCasinoButtons,
    };
  }
}

export async function updateStakeButtonValues(payload) {
  const { data } = await axiosClient.post('/user/stake-button-values', payload);
  if (data.success) return data.data;
  throw new Error(data.error || 'Failed to update stake button values');
}
