import { memo } from 'react';
import Lucky7Result from './Lucky7Result';
import Lucky6Result from './Lucky6Result';
import PoisonResult from './PoisonResult';
import DoliDanaResult from './DoliDanaResult';
import SicBoResult from './SicBoResult';
import BallByBallResult from './BallByBallResult';
import MogamboResult from './MogamboResult';
import TeenUniqueResult from './TeenUniqueResult';
import Joker1Result from './Joker1Result';
import Joker20Result from './Joker20Result';
import Joker120Result from './Joker120Result';
import Btable2Result from './Btable2Result';
import GoalResult from './GoalResult';
import Lucky15Result from './Lucky15Result';
import AB20Result from './AB20Result';
import ABJResult from './ABJResult';
import AB3Result from './AB3Result';
import AB4Result from './AB4Result';
import SuperOverResult from './SuperOverResult';
import Teen20cResult from './Teen20cResult';
import Teen9Result from './Teen9Result';
import Teen8Result from './Teen8Result';
import PokerResult from './PokerResult';
import Poker6Result from './Poker6Result';
import BaccaratResult from './BaccaratResult';
import Baccarat2Result from './Baccarat2Result';
import Dum10Result from './Dum10Result';
import MeterResult from './MeterResult';
import DragonTigerResult from './DragonTigerResult';
import Race2Result from './Race2Result';
import Race20Result from './Race20Result';
import AAA2Result from './AAA2Result';
import Teen1Result from './Teen1Result';
import Teen120Result from './Teen120Result';
import Card32Result from './Card32Result';
import Card32EUResult from './Card32EUResult';
import NoteNumResult from './NoteNumResult';
import TrioResult from './TrioResult';
import Race17Result from './Race17Result';
import MuflisResult from './MuflisResult';
import TeensinResult from './TeensinResult';
import Teen20bResult from './Teen20bResult';
import Teenpatti2CardsResult from './Teenpatti2CardsResult';
import TrapResult from './TrapResult';
import ThreeCardJResult from './ThreeCardJResult';
import GenericTeenpattiResult from './GenericTeenpattiResult';
import WarResult from './WarResult';
import WorliResult from './WorliResult';
import RouletteResult from './RouletteResult';
import LotteryResult from './LotteryResult';
import FiveCricketResult from './FiveCricketResult';
import CricketMatch20Result from './CricketMatch20Result';
import CasinoMeterResult from './CasinoMeterResult';
import Teen6Result from './Teen6Result';

const RESULT_MAP = {
  lucky7:      Lucky7Result,
  // Virtual Lucky 7 — same rdesc shape (Winner#OddEven#Color#Card#Line)
  vlucky7:     Lucky7Result,
  lucky7eu:    Lucky7Result,
  lucky7eu2:   Lucky7Result,
  lucky5:      Lucky6Result,
  poison:      PoisonResult,
  poison20:    PoisonResult,
  dolidana:    DoliDanaResult,
  sicbo2:      SicBoResult,
  sicbo:       SicBoResult,
  ballbyball:  BallByBallResult,
  mogambo:     MogamboResult,
  teenunique:  TeenUniqueResult,
  joker1:      Joker1Result,
  joker20:     Joker20Result,
  joker120:    Joker120Result,
  btable:      Btable2Result,
  btable2:     Btable2Result,
  goal:        GoalResult,
  lucky15:     Lucky15Result,
  ab20:        AB20Result,
  abj:         ABJResult,
  ab3:         AB3Result,
  ab4:         AB4Result,
  superover:   SuperOverResult,
  superover3:  SuperOverResult,
  superover2:  SuperOverResult,
  cricketv3:   FiveCricketResult,
  cmatch20:    CricketMatch20Result,
  teen20c:     Teen20cResult,
  teen20:      Teen20cResult,
  teen20v1:    Teen20cResult,   // VIP variant — same rdesc shape and card split
  teen9:       Teen9Result,
  teen8:       Teen8Result,
  poker:       PokerResult,
  poker20:     PokerResult,
  poker6:      Poker6Result,
  baccarat:    BaccaratResult,
  baccarat2:   Baccarat2Result,
  dum10:       Dum10Result,
  cmeter1:     MeterResult,
  cmeter:      CasinoMeterResult,
  teen6:       Teen6Result,
  dt20:        DragonTigerResult,
  dt6:         DragonTigerResult,
  dt202:       DragonTigerResult,
  dtl20:       DragonTigerResult,
  teen1:       Teen1Result,
  teen120:     Teen120Result,
  race2:       Race2Result,
  race20:      Race20Result,
  aaa:         AAA2Result,
  aaa2:        AAA2Result,
  card32:      Card32Result,
  card32eu:    Card32EUResult,
  notenum:     NoteNumResult,
  trio:        TrioResult,
  // Virtual Trio — same three-card / rdesc shape
  // (Session#Judgement#RedBlack#OddEven#Pattern)
  vtrio:       TrioResult,
  race17:      Race17Result,
  teenmuf:     MuflisResult,
  // Virtual Muflis — same six-card / Player A|B result shape
  vteenmuf:    MuflisResult,
  teensin:     TeensinResult,
  teen20b:     Teen20bResult,
  patti2:      Teenpatti2CardsResult,
  trap:        TrapResult,
  '3cardj':    ThreeCardJResult,
  war:         WarResult,
  worli:       WorliResult,
  worli2:      WorliResult,
  ourroullete: RouletteResult,
  roulette11:  RouletteResult,
  roulette12:  RouletteResult,
  roulette13:  RouletteResult,
  lottcard:    LotteryResult,
};

const ResultContentSwitch = memo(function ResultContentSwitch({ gameType, detail }) {
  const Component = RESULT_MAP[gameType] || GenericTeenpattiResult;
  return <Component detail={detail} gameType={gameType} />;
});

export default ResultContentSwitch;
