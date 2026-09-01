import { memo } from 'react';
import { Link } from 'react-router-dom';

const MatkaLastResults = memo(function MatkaLastResults({ results = [], reportLink = '/report/casinoresult/worli3', className = '' }) {
  return (
    <div className={`casino-video-last-results matka-result${className ? ` ${className}` : ''}`}>
      {results.map((r, i) => (
        <span key={i} className="resultb">{r}</span>
      ))}
      <Link to={reportLink} className="result-more">...</Link>
    </div>
  );
});

export default MatkaLastResults;
