import { lazy, Suspense } from 'react';

const Teen62Rules = lazy(() => import('./Teen62Rules'));
const DoliDanaRules = lazy(() => import('./DoliDanaRules'));
const MogamboRules = lazy(() => import('./MogamboRules'));
const Lucky6Rules = lazy(() => import('./Lucky6Rules'));
const PoisonRules = lazy(() => import('./PoisonRules'));
const Joker120Rules = lazy(() => import('./Joker120Rules'));
const Joker20Rules = lazy(() => import('./Joker20Rules'));
const Teen20cRules = lazy(() => import('./Teen20cRules'));
const Btable2Rules = lazy(() => import('./Btable2Rules'));
const SuperOver3Rules = lazy(() => import('./SuperOver3Rules'));
const UniqueTeenpattiRules = lazy(() => import('./UniqueTeenpattiRules'));
const AB4Rules = lazy(() => import('./AB4Rules'));
const GoalRules = lazy(() => import('./GoalRules'));
const Lucky15Rules = lazy(() => import('./Lucky15Rules'));
const SuperOver2Rules = lazy(() => import('./SuperOver2Rules'));
const Teen41Rules = lazy(() => import('./Teen41Rules'));
const Teen42Rules = lazy(() => import('./Teen42Rules'));
const SicBo2Rules = lazy(() => import('./SicBo2Rules'));
const Teen20Rules = lazy(() => import('./Teen20Rules'));
const Teen9Rules = lazy(() => import('./Teen9Rules'));
const PokerRules = lazy(() => import('./PokerRules'));
const BaccaratRules = lazy(() => import('./BaccaratRules'));
const MeterRules = lazy(() => import('./MeterRules'));
const InstantTeenpattiRules = lazy(() => import('./InstantTeenpattiRules'));
const Race2Rules = lazy(() => import('./Race2Rules'));
const DragonTigerRules = lazy(() => import('./DragonTigerRules'));
const AAA2Rules = lazy(() => import('./AAA2Rules'));
const DTL20Rules = lazy(() => import('./DTL20Rules'));
const DT202Rules = lazy(() => import('./DT202Rules'));
const Teen1Rules = lazy(() => import('./Teen1Rules'));
const Teen120Rules = lazy(() => import('./Teen120Rules'));
const NoteNumRules = lazy(() => import('./NoteNumRules'));
const Card32Rules = lazy(() => import('./Card32Rules'));
const ABJRules = lazy(() => import('./ABJRules'));
const Lucky7Rules = lazy(() => import('./Lucky7Rules'));
const TrioRules = lazy(() => import('./TrioRules'));
const Teen20bRules = lazy(() => import('./Teen20bRules'));
const Race17Rules = lazy(() => import('./Race17Rules'));
const MuflisRules = lazy(() => import('./MuflisRules'));
const TeensinRules = lazy(() => import('./TeensinRules'));
const WarRules = lazy(() => import('./WarRules'));
const Teenpatti2CardsRules = lazy(() => import('./Teenpatti2CardsRules'));
const TrapRules = lazy(() => import('./TrapRules'));
const SuperOverRules = lazy(() => import('./SuperOverRules'));
const Race20Rules = lazy(() => import('./Race20Rules'));
const RouletteRules = lazy(() => import('./RouletteRules'));
const LottcardRules = lazy(() => import('./LottcardRules'));
const CricketV3Rules = lazy(() => import('./CricketV3Rules'));
const CricketMatch20Rules = lazy(() => import('./CricketMatch20Rules'));
const CasinoMeterRules = lazy(() => import('./CasinoMeterRules'));
const Teen6Rules = lazy(() => import('./Teen6Rules'));

/**
 * Maps gameType to its rules component.
 * All teenpatti variants share the same rules.
 * Add new cases as more rules components are created.
 */
function getRulesComponent(gameType) {
  switch (gameType) {
    // All teenpatti variants share teen62 rules
    case 'teen':
    case 'teen32':
    case 'teen33':
    case 'teen62':
      return Teen62Rules;

    case 'teen6':
      return Teen6Rules;

    case 'patti2':
      return Teenpatti2CardsRules;

    case 'trap':
      return TrapRules;

    case 'superover':
      return SuperOverRules;

    case 'race20':
      return Race20Rules;

    case 'teen8':
    case 'teen9':
      return Teen9Rules;

    case 'poker':
    case 'poker20':
    case 'poker6':
      return PokerRules;

    case 'baccarat':
    case 'baccarat2':
      return BaccaratRules;

    case 'teen20':
    case 'teen20v1':
      return Teen20Rules;

    case 'dolidana':
      return DoliDanaRules;

    case 'mogambo':
      return MogamboRules;

    case 'lucky5':
      return Lucky6Rules;

    case 'poison':
    case 'poison20':
      return PoisonRules;

    case 'teenunique':
      return UniqueTeenpattiRules;

    case 'joker1':
    case 'joker120':
      return Joker120Rules;

    case 'joker20':
      return Joker20Rules;

    case 'teen20c':
      return Teen20cRules;

    case 'btable':
    case 'btable2':
      return Btable2Rules;

    case 'superover3':
      return SuperOver3Rules;

    case 'ab4':
      return AB4Rules;

    case 'abj':
      return ABJRules;

    case 'lucky7':
    case 'lucky7eu':
    case 'lucky7eu2':
      return Lucky7Rules;

    case 'goal':
    case 'goal2':
      return GoalRules;

    case 'lucky15':
      return Lucky15Rules;

    case 'superover2':
      return SuperOver2Rules;

    case 'teen41':
      return Teen41Rules;

    case 'teen42':
      return Teen42Rules;

    case 'sicbo':
    case 'sicbo2':
      return SicBo2Rules;

    case 'cmeter1':
      return MeterRules;

    case 'cmeter':
      return CasinoMeterRules;

    case 'teen3':
      return InstantTeenpattiRules;

    case 'race2':
      return Race2Rules;

    case 'dt6':
    case 'dt20':
      return DragonTigerRules;

    case 'dt202':
      return DT202Rules;

    case 'dtl20':
      return DTL20Rules;

    case 'aaa':
    case 'aaa2':
      return AAA2Rules;

    case 'teen1':
      return Teen1Rules;

    case 'teen120':
      return Teen120Rules;

    case 'notenum':
      return NoteNumRules;

    case 'card32':
    case 'card32eu':
      return Card32Rules;

    case 'trio':
      return TrioRules;

    case 'teen20b':
      return Teen20bRules;

    case 'race17':
      return Race17Rules;

    case 'teenmuf':
      return MuflisRules;

    case 'teensin':
      return TeensinRules;

    case 'war':
      return WarRules;

    case 'ourroullete':
    case 'roulette11':
    case 'roulette12':
    case 'roulette13':
      return RouletteRules;

    case 'lottcard':
      return LottcardRules;

    case 'cricketv3':
      return CricketV3Rules;

    case 'cmatch20':
      return CricketMatch20Rules;

    default:
      return null;
  }
}

export default function CasinoRulesSwitch({ gameType }) {
  const RulesComponent = getRulesComponent(gameType);
  if (!RulesComponent) return null;

  return (
    <Suspense fallback={<div style={{ padding: 10, color: '#fff' }}>Loading rules...</div>}>
      <RulesComponent />
    </Suspense>
  );
}
