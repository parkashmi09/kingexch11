import axiosClient from './axiosClient';

export const getActiveGames = (params) => {
  return axiosClient.get('/jsGames/games', { params }).then(r => r.data);
};

export const searchGames = (params) => {
  return axiosClient.get('/jsGames/games/search', { params }).then(r => r.data);
};

export const getGamesByCategory = (category, params) => {
  return axiosClient.get(`/jsGames/games/category/${category}`, { params }).then(r => r.data);
};

// A category's CURATED queue only, in curated order — not the whole category.
// `/games/category/:c` serves the queue first and then pads the page with every
// other game in the category; this endpoint is just the queue, which is what the
// reference's crash grid shows. Returns { game_ids, games }.
export const getCategoryPriorityGames = (category, params) => {
  return axiosClient.get(`/jsGames/games/category/${category}/priority`, { params }).then(r => r.data);
};

// Slot provider groups (Jili, Amigo, Red Tiger, ...). The strip order is the
// order slots are curated in — render the tabs in the order returned.
export const getSlotProviders = (params) => {
  return axiosClient.get('/jsGames/games/slot-providers', { params }).then(r => r.data);
};

// One provider's slots, in curated order. params: { page, per_page }
export const getSlotProviderGames = (provider, params) => {
  return axiosClient.get(`/jsGames/games/slot-providers/${provider}/games`, { params }).then(r => r.data);
};

// One provider's whole slot page: its tab strip and every tab's games, already
// ordered (tabs by the owner's strip, games by the owner's queue). `provider`
// takes the slug or the numeric /slot/:id. Inactive games are omitted; empty
// tabs are not. Games that no tab claims arrive as a trailing tab flagged
// `is_uncategorized`.
export const getSlotProviderCategories = (provider, params) => {
  return axiosClient.get(`/jsGames/games/slot-providers/${provider}/categories`, { params }).then(r => r.data);
};

// Generic over the four categories — the slot helpers above are the same thing
// with the category pinned. `provider` takes the slug or the numeric id.
export const getProviders = (category, params) => {
  return axiosClient.get(`/jsGames/games/category/${category}/providers`, { params }).then(r => r.data);
};

export const getProviderCategories = (category, provider, params) => {
  return axiosClient
    .get(`/jsGames/games/category/${category}/providers/${provider}/categories`, { params })
    .then(r => r.data);
};

export const getGameLaunchURL = (data) => {
  return axiosClient.post('/jsGamesv2/launch', data).then(r => r.data);
};
