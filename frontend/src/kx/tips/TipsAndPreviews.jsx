import { useEffect, useState } from 'react';
import { ng, host, KX } from '../ng';
import Loader from '../Loader';
import { refPost, ngDate } from '../refApi';

const C = ng('ktp');
const D = ng('ktpd');

/** app-tips-and-previews-details — one article: back arrow, today's date, the picture under its title, then the text a paragraph per line. */
function TipsDetails({ item, onBack }) {
  useEffect(() => {
    const t = setTimeout(() => document.getElementById('focusContainer')?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <app-tips-and-previews-details {...C} {...host('ktpd')}>
      <div {...D} id="focusContainer" className="d-flex align-items-center w-100">
        <a {...D} className="backIcon" onClick={onBack}>
          <i {...D} className="fas fa-arrow-circle-left"></i>
        </a>
        <div {...D} className="ms-1 d-flex justify-content-end w-100">
          <span {...D}>
            <i {...D} className="far fa-calendar-alt me-2"></i>
          </span>
          {` ${ngDate(Date.now(), 'dd-MM-yyyy')} `}
        </div>
      </div>
      <div {...D} className="imgDiv position-relative mt-1">
        <img {...D} width="728" height="300" alt="" className="img-fluid imgnews" src={item.url} />
        <div {...D} className="titleNewsss">{` ${item.title} `}</div>
      </div>
      <div {...D} className="description mt-1">
        {item.paragraphs.map((p, i) => (
          <div {...D} key={i}>
            <p {...D}>{p}</p>
          </div>
        ))}
      </div>
    </app-tips-and-previews-details>
  );
}

/**
 * app-tips-and-previews — the home board's Tips & Previews (exchange 98): the
 * reference's NEWS list, picture beside headline and summary; an article opens
 * in place, and its back arrow returns to the list.
 */
export default function TipsAndPreviews({ C: parent }) {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    let live = true;
    refPost('/api/exchange/tips/tipsPreviewList', {}, 30)
      .then((res) => live && setNews(res?.data?.preview || []))
      .catch(() => {})
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, []);

  return (
    <app-tips-and-previews {...parent} {...host('ktp')} {...KX}>
      {loading && <Loader attrs={C} />}
      <div {...C} className="container-fluid mt-2">
        {!open && (
          <div {...C} className="row">
            <div {...C} className="col-12 newsContainer">
              <div {...C} className="card">
                <div {...C} className="card-header newsHeader">NEWS</div>
                <div {...C} className="card-body p-0">
                  {news.map((n, i) => (
                    <div {...C} key={i} className="p-2 mainNews">
                      <a {...C} onClick={() => setOpen({ ...n, paragraphs: n.description.split('\n') })}>
                        <div {...C} className="d-flex">
                          <div {...C} className="width-img">
                            <img {...C} width="320" height="180" alt="" className="NewsImg" src={n.url} />
                          </div>
                          <div {...C} className="width-content">
                            <div {...C} className="">
                              <h2 {...C} className="news-heading">{n.title}</h2>
                              <p {...C} className="news-description mt-1">{` ${n.description} `}</p>
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {open && (
          <div {...C}>
            <TipsDetails item={open} onBack={() => setOpen(null)} />
          </div>
        )}
      </div>
    </app-tips-and-previews>
  );
}
