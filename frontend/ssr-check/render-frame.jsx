import { renderToStaticMarkup } from 'react-dom/server';
import GameFrame from '../src/components/casino/GameFrame.jsx';

console.log(renderToStaticMarkup(
  <div className="report-box casino-box fancy-page frame-open">
    <div className="container-fluid container-fluid-5">GRID</div>
    <GameFrame title="Mr.Mars" src="https://web.jacktop.win/init-wolf777?lng=en" onExit={() => {}} />
  </div>
));
