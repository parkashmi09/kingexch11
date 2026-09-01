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
qc.setQueryData(['provider-categories','fantasy','popok'], { payload: { categories: [{ slug:'all-games', label:'All Games', games: [
{ game_id: 2000, game_uid: 'u0', game_name: 'G0', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500008677.jpg' },
{ game_id: 2001, game_uid: 'u1', game_name: 'G1', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/555572961.jpg' },
{ game_id: 2002, game_uid: 'u2', game_name: 'G2', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/555574796.jpg' },
{ game_id: 2003, game_uid: 'u3', game_name: 'G3', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500000397.jpg' },
{ game_id: 2004, game_uid: 'u4', game_name: 'G4', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/555570411.gif' },
{ game_id: 2005, game_uid: 'u5', game_name: 'G5', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500043444.gif' },
{ game_id: 2006, game_uid: 'u6', game_name: 'G6', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/555558820.jpg' },
{ game_id: 2007, game_uid: 'u7', game_name: 'G7', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/420033108.gif' },
{ game_id: 2008, game_uid: 'u8', game_name: 'G8', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500009794.gif' },
{ game_id: 2009, game_uid: 'u9', game_name: 'G9', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/420014051.gif' },
{ game_id: 2010, game_uid: 'u10', game_name: 'G10', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/420033385.gif' },
{ game_id: 2011, game_uid: 'u11', game_name: 'G11', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/426634405.gif' },
{ game_id: 2012, game_uid: 'u12', game_name: 'G12', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500000203.jpg' },
{ game_id: 2013, game_uid: 'u13', game_name: 'G13', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/420032901.gif' },
{ game_id: 2014, game_uid: 'u14', game_name: 'G14', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500001017.gif' },
{ game_id: 2015, game_uid: 'u15', game_name: 'G15', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/400041201.gif' },
{ game_id: 2016, game_uid: 'u16', game_name: 'G16', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/426639563.gif' },
{ game_id: 2017, game_uid: 'u17', game_name: 'G17', art: null, game_icon: 'https://sitethemedata.com/casino_icons/other/bcslot/creedroomz/500010297.jpg' }
] }] } });

const userSlice = createSlice({ name:'user', initialState:{ user:{user_id:1}, isAuthenticated:true, balance:100 }, reducers:{} });
const store = configureStore({ reducer: { user: userSlice.reducer } });

process.stdout.write(renderToStaticMarkup(
  <Provider store={store}>
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/fantasy/popok']}>
        <Routes><Route path="/fantasy/:providerId" element={<FantasyHome />} /></Routes>
      </MemoryRouter>
    </QueryClientProvider>
  </Provider>
));
