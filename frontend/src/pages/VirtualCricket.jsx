import SportDetailView from '../components/betting/SportDetailView';

// Standalone Virtual Cricket page (/virtual-cricket) — same board as the home
// "Cricket" virtual tab: SportDetailView in virtual mode renders ONLY the
// virtual leagues the main cricket board hides (T5 XI, T10 XI, Virtual
// Cricket League / Dim "(e)" games). Unlike the home cricket board (fetch-once),
// this page keeps the normal 5s live poll — virtual rounds turn over every
// ~3 minutes, so a static list would go dead almost immediately.
function VirtualCricket() {
  return (
    <div className="home-container">
      <SportDetailView sportId={4} isFootball={false} virtual />
    </div>
  );
}

export default VirtualCricket;
