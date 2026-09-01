import { memo } from 'react';
import { getGameConfig } from '../../../config/casinoGames';
import TeenpattiCards from './TeenpattiCards';
import DragonTigerCards from './DragonTigerCards';
import Lucky7Cards from './Lucky7Cards';
import PokerCards from './PokerCards';
import AndarBaharCards from './AndarBaharCards';
import DoliDanaCards from './DoliDanaCards';
import MogamboCards from './MogamboCards';
import PoisonCards from './PoisonCards';
import Joker120Cards from './Joker120Cards';
import Joker20Cards from './Joker20Cards';
import TeenpattiTestCards from './TeenpattiTestCards';
import TeenpattiOpenCards from './TeenpattiOpenCards';
import Poker20Cards from './Poker20Cards';
import Poker6Cards from './Poker6Cards';
import MeterCards from './MeterCards';
import Teen1Cards from './Teen1Cards';
import Race2Cards from './Race2Cards';
import NoteNumCards from './NoteNumCards';
import DragonTigerLionCards from './DragonTigerLionCards';
import Card32Cards from './Card32Cards';
import TrioCards from './TrioCards';
import Race17Cards from './Race17Cards';
import ThreeCardJCards from './ThreeCardJCards';
import WarCards from './WarCards';
import WorliCards from './WorliCards';
import TrapCards from './TrapCards';
import Race20Cards from './Race20Cards';

const LAYOUT_MAP = {
  teenpatti: TeenpattiCards,
  dragonTiger: DragonTigerCards,
  lucky7: Lucky7Cards,
  poker: PokerCards,
  andarBahar: AndarBaharCards,
  doliDana: DoliDanaCards,
  mogambo: MogamboCards,
  poison: PoisonCards,
  joker120: Joker120Cards,
  joker20: Joker20Cards,
  teenpattiTest: TeenpattiTestCards,
  teenpattiOpen: TeenpattiOpenCards,
  poker20: Poker20Cards,
  poker6: Poker6Cards,
  meter: MeterCards,
  teen1: Teen1Cards,
  race2: Race2Cards,
  notenum: NoteNumCards,
  dragonTigerLion: DragonTigerLionCards,
  card32: Card32Cards,
  trio: TrioCards,
  race17: Race17Cards,
  threeCardJ: ThreeCardJCards,
  war: WarCards,
  worli: WorliCards,
  trap: TrapCards,
  race20: Race20Cards,
};

/**
 * Renders the correct card layout based on gameType config.
 * Looks up cardLayout from casinoGames config and maps to the right component.
 */
const CasinoCardSwitch = memo(function CasinoCardSwitch({ gameType, cardString }) {
  const { cardLayout } = getGameConfig(gameType);
  const CardComponent = LAYOUT_MAP[cardLayout];

  if (!CardComponent) return null;

  return <CardComponent cardString={cardString || ''} />;
});

export default CasinoCardSwitch;
