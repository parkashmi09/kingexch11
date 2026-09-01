import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getCasinoResultReport } from '../apiservices/reportService';
import { getDetailResults } from '../apiservices/casinoService';
import { bToastError } from '../components/BToast';
import MxDatePicker from '../components/MxDatePicker';
import FullScreenLoader from '../components/FullScreenLoader';
import CasinoResultModal from '../components/casino/CasinoResultModal';
import html2pdf from 'html2pdf.js';
import { exportToExcel } from '../utils/exportTable';

const CASINO_TYPES = [
  { value: 'teen', label: 'Teenpatti 1-day' },
  { value: 'poker', label: 'Poker 1-Day' },
  { value: '3cardj', label: '3 Cards Judgement' },
  { value: 'aaa', label: 'Amar Akbar Anthony' },
  { value: 'ab20', label: 'Andar Bahar' },
  { value: 'abj', label: 'Andar Bahar 2' },
  { value: 'baccarat', label: 'Baccarat' },
  { value: 'baccarat2', label: 'Baccarat 2' },
  { value: 'btable', label: 'Bollywood Casino' },
  { value: 'card32', label: '32 Cards A' },
  { value: 'card32eu', label: '32 Cards B' },
  { value: 'cmatch20', label: 'Cricket Match 20-20' },
  { value: 'cmeter', label: 'Casino Meter' },
  { value: 'cricketv', label: 'Cricket V' },
  { value: 'cricketv2', label: 'Cricket V2' },
  { value: 'cricketv3', label: '5Five Cricket' },
  { value: 'dt20', label: '20-20 Dragon Tiger' },
  { value: 'dt202', label: '20-20 Dragon Tiger 2' },
  { value: 'dt6', label: '1 Day Dragon Tiger' },
  { value: 'dtl20', label: '20-20 D T L' },
  { value: 'lottcard', label: 'lottcard' },
  { value: 'lucky7', label: 'Lucky 7 - A' },
  { value: 'lucky7eu', label: 'Lucky 7 - B' },
  { value: 'poker20', label: '20-20 Poker' },
  { value: 'poker6', label: 'Poker 6 Players' },
  { value: 'teen20', label: '20-20 Teenpatti' },
  { value: 'teen8', label: 'Teenpatti Open' },
  { value: 'teen9', label: 'Teenpatti Test' },
  { value: 'war', label: 'Casino War' },
  { value: 'worli', label: 'Worli Matka' },
  { value: 'worli2', label: 'Instant Worli' },
  { value: 'teen6', label: 'Teenpatti - 2.0' },
  { value: 'queen', label: 'Queen' },
  { value: 'race20', label: 'Race20' },
  { value: 'lucky7eu2', label: 'Lucky 7 - C' },
  { value: 'superover', label: 'Super Over' },
  { value: 'trap', label: 'The Trap' },
  { value: 'patti2', label: '2 Cards Teenpatti' },
  { value: 'teensin', label: '29Card Baccarat' },
  { value: 'teenmuf', label: 'Muflis Teenpatti' },
  { value: 'race17', label: 'Race to 17' },
  { value: 'teen20b', label: '20-20 Teenpatti B' },
  { value: 'trio', label: 'Trio' },
  { value: 'notenum', label: 'Note Number' },
  { value: 'teen2024', label: 'Teen 20 24' },
  { value: 'kbc', label: 'K.B.C' },
  { value: 'teen120', label: '1 CARD 20-20' },
  { value: 'teen1', label: '1 CARD ONE-DAY' },
  { value: 'vteen20', label: 'V-20-20 Teenpatti' },
  { value: 'vteen', label: 'V-Teenpatti 1-day' },
  { value: 'vdt6', label: 'V-1 Day Dragon Tiger' },
  { value: 'vdt20', label: 'V-20-20 Dragon Tiger' },
  { value: 'vlucky7', label: 'V-Lucky 7 - A' },
  { value: 'vrace17', label: 'V-Race to 17' },
  { value: 'vteenmuf', label: 'V-Muflis Teenpatti' },
  { value: 'vaaa', label: 'V-Amar Akbar Anthony' },
  { value: 'vbtable', label: 'V-Bollywood Casino' },
  { value: 'vbaccarat', label: 'V-Baccarat' },
  { value: 'vtrio', label: 'V-Trio' },
  { value: 'vtrap', label: 'V-The Trap' },
  { value: 'ab3', label: 'ANDAR BAHAR 50 CARDS' },
  { value: 'vdtl20', label: 'V-20-20 D T L' },
  { value: 'aaa2', label: 'Amar Akbar Anthony 2' },
  { value: 'roulette', label: 'roulette' },
  { value: 'race2', label: 'Race to 2nd' },
  { value: 'teen3', label: 'Instant Teenpatti' },
  { value: 'dum10', label: 'Dus ka Dum' },
  { value: 'cmeter1', label: '1 Card Meter' },
  { value: 'teen32', label: 'Instant Teenpatti 2.0' },
  { value: 'sicbo', label: 'Sic Bo' },
  { value: 'ballbyball', label: 'Ball by ball' },
  { value: 'roulette1', label: 'roulette1' },
  { value: 'teen33', label: 'Instant Teenpatti 3.0' },
  { value: 'roulette2', label: 'roulette2' },
  { value: 'superover2', label: 'Super Over2' },
  { value: 'roulette3', label: 'roulette3' },
  { value: 'sicbo2', label: 'Sic Bo 2' },
  { value: 'teen41', label: 'Queen top open teenpatti' },
  { value: 'teen42', label: 'Jack top open teenpatti' },
  { value: 'lucky15', label: 'Lucky 15' },
  { value: 'goal', label: 'Goal' },
  { value: 'ab4', label: 'Andar-Bahar 150 card' },
  { value: 'superover3', label: 'Mini SuperOver' },
  { value: 'ourroullete', label: 'Unique Roulette' },
  { value: 'teen20c', label: '20-20 Teenpatti C' },
  { value: 'btable2', label: 'Bollywood Casino 2' },
  { value: 'teenjoker', label: 'Teenpatti Joker' },
  { value: 'joker1', label: 'Unlimited Joker One Day' },
  { value: 'joker20', label: 'Teenpatti Joker 20-20' },
  { value: 'joker120', label: 'Unlimited Joker 20-20' },
  { value: 'poison20', label: 'Teenpatti Poison 20-20' },
  { value: 'teenunique', label: 'Unique Teenpatti' },
  { value: 'poison', label: 'Teenpatti Poison One Day' },
  { value: 'roulette11', label: 'Golden Roulette' },
  { value: 'roulette12', label: 'Beach Roulette' },
  { value: 'roulette13', label: 'Regular Roulette' },
  { value: 'pteen', label: 'Premium Teenpatti 1-day' },
  { value: 'pteen20', label: 'Premium 20-20 Teenpatti' },
  { value: 'pdt6', label: 'Premium 1 Day Dragon Tiger' },
  { value: 'pdt20', label: 'Premium 20-20 Dragon Tiger' },
  { value: 'plucky7', label: 'Premium Lucky 7' },
  { value: 'pcard32', label: 'Premium 32 Cards' },
  { value: 'pbaccarat', label: 'Premium Baccarat' },
  { value: 'tteen', label: 'Tembo Teenpatti 1-day' },
  { value: 'tteen20', label: 'Tembo 20-20 Teenpatti' },
  { value: 'tdt6', label: 'Tembo 1 Day Dragon Tiger' },
  { value: 'tdt20', label: 'Tembo 20-20 Dragon Tiger' },
  { value: 'tlucky7', label: 'Tembo Lucky 7' },
  { value: 'tcard32', label: 'Tembo 32 Cards' },
  { value: 'tbaccarat', label: 'Tembo Baccarat' },
  { value: 'lucky5', label: 'Lucky 6' },
  { value: 'mogambo', label: 'Mogambo' },
  { value: 'dolidana', label: 'Dolidana' },
  { value: 'teen20v', label: '20-20 Teenpatti VIP' },
  { value: 'worli3', label: 'Matka' },
  { value: 'teen62', label: 'V VIP Teenpatti 1-day' },
  { value: 'bb', label: 'DimCL' },
];

const SUPEROVER_TYPES = ['superover', 'superover2', 'superover3', 'cricketv3'];
const ENRICH_TYPES = ['ab3', 'ab4'];

/** Map raw win values to human-readable labels based on game type */
function mapWinValue(win, type) {
  if (win === null || win === undefined) return '-';
  const v = String(win);
  switch (type) {
    case 'teen9':
      if (v === '1') return 'Tiger';
      if (v === '2') return 'Lion';
      if (v === '3') return 'Dragon';
      return v;
    case 'teen62':
    case 'teen':
    case 'teen8':
      if (!v || v === '0') return 'No Win';
      return v;
    case 'war':
      if (v === '0') return '-';
      return v || '-';
    case 'teen6':
      if (v === '1') return 'Player A';
      if (v === '2') return 'Player B';
      return v;
    case 'teen20':
    case 'teen20c':
    case 'teen32':
    case 'teen33':
    case 'teen41':
    case 'teen42':
    case 'teen3':
    case 'lucky7':
    case 'lucky7eu':
    case 'lucky7eu2':
      if (v === '1') return 'Low Card';
      if (v === '2') return 'High Card';
      if (v === '0') return 'Tie';
      return v;
    case 'baccarat':
    case 'baccarat2':
      if (v === '1') return 'Player';
      if (v === '2') return 'Banker';
      if (v === '3') return 'Tie Game';
      return v;
    case 'teensin':
      if (v === '1') return 'Player A';
      if (v === '2') return 'Player B';
      return v;
    case 'poker6': {
      const pNum = Number(v) - 10;
      if (pNum >= 1 && pNum <= 6) return `Player ${pNum}`;
      if (v === '0' || v === 0) return 'T';
      return v;
    }
    case 'ab20':
      return 'Win';
    case 'abj':
      if (v === '1') return 'Andar';
      if (v === '2') return 'Bahar';
      return v;
    case 'poker':
    case 'poker20':
    case 'ab3':
    case 'poison':
    case 'poison20':
    case 'teenjoker':
    case 'joker1':
    case 'joker20':
    case 'joker120':
    case 'patti2':
    case 'trap':
      if (v === '1') return 'Player A';
      if (v === '2') return 'Player B';
      if (v === '3') return 'Tie';
      return v;
    case 'lucky5':
      if (v === '1') return 'Low Card';
      if (v === '2') return 'High Card';
      return v;
    case 'mogambo':
      if (v === '1') return 'Daga/Teja';
      if (v === '2') return 'Mogambo';
      return v;
    case 'superover':
    case 'superover2':
    case 'superover3':
      if (v === '1') return 'IND';
      if (v === '2') return 'AUS';
      if (v === '0') return 'TIE';
      return v;
    case 'cricketv3':
      if (v === '1') return 'AUS';
      if (v === '2') return 'IND';
      if (v === '0') return 'TIE';
      return v;
    case 'btable':
    case 'btable2':
      if (v === '1') return 'Don';
      if (v === '2') return 'Amar Akbar Anthony';
      if (v === '3') return 'Sahib Bibi Aur Ghulam';
      if (v === '4') return 'Dharam Veer';
      if (v === '5') return 'Kis Kis Ko Pyaar Karoon';
      if (v === '6') return 'Ghulam';
      return v;
    case 'goal':
      if (v === '1') return 'Cristiano Ronaldo';
      if (v === '2') return 'Lionel Messi';
      if (v === '3') return 'Robert Lewandowski';
      if (v === '4') return 'Neymar';
      if (v === '5') return 'Harry Kane';
      if (v === '6') return 'Zlatan Ibrahimovic';
      if (v === '7') return 'Romelu Lukaku';
      if (v === '8') return 'Kylian Mbappe';
      if (v === '9') return 'Erling Haaland';
      if (v === '10') return 'No Goal';
      if (v === '11') return 'Shot Goal';
      if (v === '12') return 'Header Goal';
      if (v === '13') return 'Penalty Goal';
      if (v === '14') return 'Free Kick Goal';
      if (v === '15') return 'No Goal';
      return v;
    case 'ab3':
    case 'ab4':
      if (v === '1') return 'Andar';
      if (v === '2') return 'Bahar';
      if (v === '0') return 'Bahar';
      return v;
    case 'race17':
      if (v === '1') return 'Yes';
      if (v === '2') return 'No';
      return v;
    case 'dum10':
      if (v === '1') return 'Yes';
      if (v === '2') return 'No';
      return v;
    case 'race2':
      if (v === '1') return 'Player A';
      if (v === '2') return 'Player B';
      if (v === '3') return 'Player C';
      if (v === '4') return 'Player D';
      return v;
    case 'race20':
      if (v === '1') return 'K Spade';
      if (v === '2') return 'K Heart';
      if (v === '3') return 'K Club';
      if (v === '4') return 'K Diamond';
      return v;
    case 'aaa':
    case 'aaa2':
      if (v === '1') return 'Amar';
      if (v === '2') return 'Akbar';
      if (v === '3') return 'Anthony';
      return v;
    case 'teen1':
    case 'teen120':
      if (v === '1') return 'Player';
      if (v === '2') return 'Dealer';
      if (v === '3') return 'Tie';
      return v;
    case 'notenum':
      return 'Won';
    case 'trio':
      return 'Win';
    case 'teen20b':
    case 'teenmuf':
      if (v === '1') return 'Player A';
      if (v === '2') return 'Player B';
      if (v === '3') return 'Tie';
      return v;
    case 'cmeter1':
      if (v === '1') return 'Fighter A';
      if (v === '2') return 'Fighter B';
      if (v === '3') return 'Tie';
      return v;
    case 'cmeter':
      if (v === '1') return 'Low';
      if (v === '2') return 'High';
      if (v === '0') return 'Tie';
      return v;
    case 'lucky15':
      if (v === '1') return '0 Run';
      if (v === '2') return '1 Run';
      if (v === '3') return '2 Run';
      if (v === '4') return '4 Run';
      if (v === '5') return '6 Run';
      if (v === '6') return 'Wicket';
      return v;
    case 'dt6':
    case 'dt20':
    case 'dt202':
      if (v === '1') return 'Dragon';
      if (v === '2') return 'Tiger';
      if (v === '3') return 'Tie';
      return v;
    case 'dtl20':
      if (v === '1') return 'Dragon';
      if (v === '21') return 'Tiger';
      if (v === '41') return 'Lion';
      return v;
    case 'card32':
    case 'card32eu':
      if (v === '1') return 'Player 8';
      if (v === '2') return 'Player 9';
      if (v === '3') return 'Player 10';
      if (v === '4') return 'Player 11';
      return v;
    default:
      return v || '-';
  }
}

function CasinoResults() {
  const today = new Date().toISOString().split('T')[0];
  const { gameType: gameTypeParam } = useParams();

  const [date, setDate] = useState(today);
  const [casinoType, setCasinoType] = useState(gameTypeParam || '');
  const [entries, setEntries] = useState(25);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [resultMid, setResultMid] = useState(null);

  const fetchData = useCallback(async (type) => {
    setLoading(true);
    try {
      // result-report, not last-results: same rounds, but each row carries
      // `winName` — the winner's label. last-results returns only a numeric
      // `win`, which had to be resolved by a detail-results call PER ROW or by
      // a hardcoded per-game map, and the Winner column ended up showing the
      // raw code ("2") for every game without an entry in either.
      const result = await getCasinoResultReport(type || casinoType);
      let records = Array.isArray(result)
        ? result
        : Array.isArray(result?.data?.data?.res)
        ? result.data.data.res
        : Array.isArray(result?.data?.res)
        ? result.data.res
        : Array.isArray(result?.data)
        ? result.data
        : [];
      const gameType = type || casinoType;
      // The feed's own label wins; mapWinValue stays as the fallback for a
      // round that has no winName yet.
      records = records.map((r) => (
        r.winName ? { ...r, winnat: r.winnat || r.winName } : r
      ));
      if (SUPEROVER_TYPES.includes(gameType) && records.length > 0) {
        const enriched = await Promise.all(
          records.map(async (r) => {
            try {
              const detail = await getDetailResults(gameType, String(r.mid));
              const t1 = detail?.data?.data?.t1 || detail?.data?.t1 || {};
              const winnat = t1.winnat || mapWinValue(r.win, gameType);
              const rdesc = t1.rdesc || '';
              return { ...r, winnat: rdesc ? `${winnat}(${rdesc})` : winnat };
            } catch {
              return r;
            }
          })
        );
        setData(enriched);
        setTotalRecords(result?.total ?? enriched.length);
      } else if (ENRICH_TYPES.includes(gameType) && records.length > 0) {
        // AB4: derive "Card X" from the last dealt card
        const CARD_MAP = { A: 'A', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10', J: 'J', Q: 'Q', K: 'K' };
        const enriched = await Promise.all(
          records.map(async (r) => {
            try {
              const detail = await getDetailResults(gameType, String(r.mid));
              const t1 = detail?.data?.data?.t1 || detail?.data?.t1 || {};
              if (t1.winnat) return { ...r, winnat: t1.winnat };
              // Derive card value from last card in the card string
              const cardStr = t1.card || '';
              const cards = cardStr.split(',').map((c) => c.trim()).filter(Boolean);
              if (cards.length > 0) {
                const lastCard = cards[cards.length - 1];
                // Extract value: "5DD" -> "5", "10HH" -> "10", "KSS" -> "K", "ACC" -> "A"
                const val = lastCard.replace(/(CC|DD|HH|SS)$/i, '');
                const label = CARD_MAP[val] || val;
                return { ...r, winnat: `Card ${label}` };
              }
              return r;
            } catch {
              return r;
            }
          })
        );
        setData(enriched);
        setTotalRecords(result?.total ?? enriched.length);
        // (WINNAT_TYPES used to sit here, firing one detail-results call per row
        //  purely to read `winnat`. result-report ships that as `winName`, so a
        //  page of 20 rounds costs one request instead of 21.)
      } else {
        setData(records);
        setTotalRecords(result?.total ?? records.length);
      }
      if (records.length === 0) bToastError('No Record Found.');
      setPage(1);
    } catch {
      setData([]);
      setTotalRecords(0);
      bToastError('No Record Found.');
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, [casinoType]);

  // Auto-fetch on mount ONLY when the URL carries a gameType param (arriving
  // from a casino table's results link, e.g. /report/casinoresult/goal2).
  // Opening the plain /report/casinoresult page fetches nothing until the
  // user picks a casino type and presses Submit.
  useEffect(() => {
    if (gameTypeParam) fetchData(gameTypeParam);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = () => {
    if (!casinoType) {
      bToastError('Select Casino Type!');
      return;
    }
    setPage(1);
    fetchData(casinoType);
  };

  const filteredData = searchTerm.trim()
    ? data.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  const totalPages = Math.max(1, Math.ceil((totalRecords || filteredData.length) / entries));
  const startIndex = (page - 1) * entries;
  const pagedData = filteredData.slice(startIndex, startIndex + entries);

  // Reference marks export icons disabled while there is nothing to export,
  // and gives the excel wrapper a per-mount export_<timestamp> id.
  const exportId = useRef(`export_${Date.now()}`).current;
  const exportDisabled = filteredData.length === 0;

  const getExportColumns = () => [
    { label: 'Round ID', getValue: (r) => r.mid || r.round_id || '-' },
    { label: 'Winner', getValue: (r) => r.winnat || mapWinValue(r.result ?? r.winner ?? r.win, casinoType) },
  ];

  const handleExport = (type) => {
    const cols = getExportColumns();
    const exportData = filteredData.length ? filteredData : data;
    if (!exportData.length) return;

    if (type === 'pdf') {
      const wrapper = document.createElement('div');
      const rowsHtml = exportData.map((r, i) => {
        const mid = r.mid || r.round_id || '-';
        const winner = r.winnat || mapWinValue(r.result ?? r.winner ?? r.win, casinoType);
        const bg = i % 2 === 0 ? '#f2f2f2' : '#ffffff';
        return `<tr><td style="padding:10px 12px;color:#555555;white-space:nowrap;background:${bg};">${mid}</td><td style="padding:10px 12px;color:#555555;white-space:nowrap;background:${bg};">${winner}</td></tr>`;
      }).join('');

      const el = document.createElement('div');
      el.innerHTML = `<div style="padding:20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333;background:#fff;"><h1 style="font-weight:normal;font-size:24px;color:#555;margin:0 0 20px 0;">Casino Results</h1><table style="width:100%;border-collapse:collapse;font-size:14px;"><thead><tr><th style="padding:10px 12px;text-align:left;font-weight:bold;white-space:nowrap;color:#fff;background:#4A90E2;">Round ID</th><th style="padding:10px 12px;text-align:left;font-weight:bold;white-space:nowrap;color:#fff;background:#4A90E2;">Winner</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>`;
      document.body.appendChild(el);

      html2pdf().set({
        margin: 10,
        filename: 'Casino Results.pdf',
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(el.firstChild).save().then(() => {
        document.body.removeChild(el);
      });
    } else {
      exportToExcel(exportData, cols, 'Casino_Results');
    }
  };

  return (
    <div className="report-box">
      {loading && <FullScreenLoader />}


      <div className="report-title">
        <div className="report-name">Casino Results</div>
        <div className="report-search search-box">
          <div className="form-group mb-0">
            <input
              type="text"
              placeholder="Search"
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <img src="/assets/icons/search.svg" className="search-icon" alt="search" />
          </div>
        </div>
      </div>

      <div className="report-form">
        <div className="form-group from-date">
          <label>Date</label>
          <MxDatePicker value={date} onChange={setDate} maxDate={today} />
        </div>
        <div className="form-group to-date">
          <label>Type</label>
          <select
            className="form-control"
            value={casinoType}
            onChange={(e) => setCasinoType(e.target.value)}
          >
            <option value="">Select Type</option>
            {CASINO_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>{ct.label}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
      </div>

      <div className="report-page-count">
        {/* The gaps around the select are whitespace text nodes in the
            reference markup — JSX strips them, so they must be explicit */}
        <div className="form-group mb-0">
          <label>Show</label>
          {' '}
          <select
            className="form-control"
            value={entries}
            onChange={(e) => { setEntries(Number(e.target.value)); setPage(1); }}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="300">300</option>
            <option value="400">400</option>
            <option value="500">500</option>
          </select>
          {' '}
          <label>Entries</label>
        </div>
        <div className="file-icons">
          <div onClick={() => !exportDisabled && handleExport('pdf')}>
            <i className={`fas fa-file-pdf${exportDisabled ? ' disabled' : ''}`}></i>
          </div>
          <div id={exportId} onClick={() => !exportDisabled && handleExport('excel')}>
            <i className={`fas fa-file-excel${exportDisabled ? ' disabled' : ''}`}></i>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="report-table d-none-mobile">
        <table className="table table-hover">
          <thead>
            <tr>
              <th className="bet-amount"><div>Round ID</div></th>
              <th className="bet-remark"><div>Winner</div></th>
            </tr>
          </thead>
          <tbody>
            {pagedData.length === 0 ? (
              <tr className="no-record"><td colSpan="2">no records found</td></tr>
            ) : (
              pagedData.map((item, index) => (
                <tr key={index} className="pointer" onClick={() => setResultMid(item.mid || item.round_id)}>
                  <td className="bet-event-name"><div>{item.mid || item.round_id || '-'}</div></td>
                  <td className="bet-date"><div>{item.winnat || mapWinValue(item.result ?? item.winner ?? item.win, casinoType)}</div></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="report-table d-none-desktop">
        {pagedData.length === 0 ? (
          <div className="report-row no-record">no records found</div>
        ) : (
          pagedData.map((item, index) => (
            <div className="report-row pointer" key={index} onClick={() => setResultMid(item.mid || item.round_id)}>
              <div><span className="bet-heading">Round ID</span> <span>{item.mid || item.round_id || '-'}</span></div>
              <div><span className="bet-heading">Winner</span> <span>{item.winnat || mapWinValue(item.result ?? item.winner ?? item.win, casinoType)}</span></div>
            </div>
          ))
        )}
      </div>

      {hasFetched && filteredData.length > 0 && totalPages > 0 && (
        <ul className="pagination justify-content-center mt-2">
          <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
            <a tabIndex={page === 1 ? -1 : 0} className="page-link" onClick={() => page > 1 && setPage(1)}>&lt;&lt;</a>
          </li>
          <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
            <a tabIndex={page === 1 ? -1 : 0} className="page-link" onClick={() => page > 1 && setPage(p => p - 1)}>&lt;</a>
          </li>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <li key={p} className={`page-item${p === page ? ' active' : ''}`}>
              <a tabIndex={0} className="page-link" onClick={() => setPage(p)}>{p}</a>
            </li>
          ))}
          <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
            <a tabIndex={page === totalPages ? -1 : 0} className="page-link" onClick={() => page < totalPages && setPage(p => p + 1)}>&gt;</a>
          </li>
          <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
            <a tabIndex={page === totalPages ? -1 : 0} className="page-link" onClick={() => page < totalPages && setPage(totalPages)}>&gt;&gt;</a>
          </li>
        </ul>
      )}

      <CasinoResultModal
        show={!!resultMid}
        onClose={() => setResultMid(null)}
        gameType={casinoType}
        gameName={CASINO_TYPES.find((ct) => ct.value === casinoType)?.label || casinoType}
        mid={resultMid}
      />
    </div>
  );
}

export default CasinoResults;
