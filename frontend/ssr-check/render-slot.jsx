// Server-renders SlotHome so its DOM can be diffed against the reference dump.
// Not shipped — a verification harness only.
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import SlotHome from '../src/pages/SlotHome.jsx';

const userSlice = createSlice({
  name: 'user',
  initialState: { user: { user_id: 1 }, isAuthenticated: true, balance: 100 },
  reducers: {},
});
const store = configureStore({ reducer: { user: userSlice.reducer } });
const qc = new QueryClient({ defaultOptions: { queries: { retry: false, enabled: false } } });

const html = renderToStaticMarkup(
  <Provider store={store}>
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[process.env.SLOT_ROUTE || '/slot/64']}>
        <Routes>
          <Route path="/slot/:providerId" element={<SlotHome />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  </Provider>
);
process.stdout.write(html);
