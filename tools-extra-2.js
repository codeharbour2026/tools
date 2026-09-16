/* Additional renderer loaded after tools-extra.js */
Object.assign(RENDERERS, {
  attendanceCalculator(root){
    root.innerHTML=`
      <div class="tool-row">
        <div class="field"><label>Classes attended</label><input id="ac-attended" type="number" min="0" value="0"></div>
        <div class="field"><label>Classes missed</label><input id="ac-missed" type="number" min="0" value="0"></div>
      </div>
      <div class="grade-total">
        <div class="big" id="ac-percent">0%</div>
        <div class="weight-note">Attendance rate</div>
      </div>
      <div class="tool-stat-row">
        <div class="tool-stat"><span class="num" id="ac-total">0</span><span class="lbl">Total classes</span></div>
        <div class="tool-stat"><span class="num" id="ac-missedpct">0%</span><span class="lbl">Missed</span></div>
      </div>`;
    const calc=()=>{
      const attended=Math.max(0,Number(root.querySelector('#ac-attended').value)||0);
      const missed=Math.max(0,Number(root.querySelector('#ac-missed').value)||0);
      const total=attended+missed;
      const pct=total?attended/total*100:0;
      root.querySelector('#ac-percent').textContent=pct.toFixed(1)+'%';
      root.querySelector('#ac-total').textContent=total;
      root.querySelector('#ac-missedpct').textContent=(total?missed/total*100:0).toFixed(1)+'%';
    };
    root.querySelectorAll('input').forEach(i=>i.addEventListener('input',calc));calc();
  }
});
