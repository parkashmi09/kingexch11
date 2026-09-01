export default function Lucky15Result({ detail }) {
  return (
    <div className="d-flex justify-content-center">
      <div className="cricket20ballpopup cricket20ballresult">
        <img src="/assets/front/img/balls/ball-blank.png" alt="" />
        <span>{detail?.rdesc || ''}</span>
      </div>
    </div>
  );
}
