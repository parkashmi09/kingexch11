import useSportsTree from '../hooks/useSportsTree';

// The reference lists a sport (sidebar, header bar, /sports, phone strip) only
// while its events feed has events for it; Casino, Lottery and Vimaan always
// show. Entries carry `etid` (our feed's sport id) and `racing` for the racing
// tree. Until the tree arrives the ball sports stay listed and racing waits,
// so nothing listed flickers out.
export default function useListedSports(list) {
  const { sports, racing, loading } = useSportsTree();
  return list.filter((s) => {
    if (s.etid == null) return true;
    if (loading) return !s.racing;
    const tree = s.racing ? racing : sports;
    return (tree.find((t) => +t.etid === s.etid)?.children || []).length > 0;
  });
}
