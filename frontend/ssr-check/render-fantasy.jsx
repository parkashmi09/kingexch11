// Renders FantasyHome with stubbed data so its DOM can be diffed against
// excpeted.txt. Verification harness only — not shipped.
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import FantasyHome from '../src/pages/FantasyHome.jsx';

const PROVIDERS = ['smart','popok','pascal','our','spribe','scratch','darwin','gemini','studio21','beon','jacktop','kingmidas-fantasy'];
const payload = {
  providers: { payload: { providers: PROVIDERS.map((p,i)=>({ id:null, provider:p, label:p, sort_order:i })) } },
  categories: { payload: { categories: [{ slug:'all-games', label:'All Games', games: Array.from({length:26},(_,i)=>({
    game_id: 1000+i, game_uid: 'uid'+i, game_name: 'Game '+i, art: null,
    game_icon: 'https://sitethemedata.com/casino_icons/other/ssg/xgames/g'+i+'.jpg',
  })) }] } },
};

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
qc.setQueryData(['providers','fantasy'], payload.providers);
qc.setQueryData(['provider-categories','fantasy','smart'], payload.categories);

const userSlice = createSlice({ name:'user', initialState:{ user:{user_id:1}, isAuthenticated:true, balance:100 }, reducers:{} });
const store = configureStore({ reducer: { user: userSlice.reducer } });

process.stdout.write(renderToStaticMarkup(
  <Provider store={store}>
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/o_fantasy']}>
        <Routes><Route path="/o_fantasy" element={<FantasyHome />} /></Routes>
      </MemoryRouter>
    </QueryClientProvider>
  </Provider>
));
