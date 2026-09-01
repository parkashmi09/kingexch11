export default function GoalResult({ detail }) {
  return (
    <div className="d-flex justify-content-center">
      <div className="goal-result cricket20ballpopup cricket20ballresult">
        <img src="/assets/front/img/balls/soccer-ball.png" alt="" />
        <span>{detail?.rdesc || ''}</span>
      </div>
    </div>
  );
}
