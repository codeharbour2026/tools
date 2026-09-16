/* =====================================================================
   tools-extra.js — additional working tools for codeharbour tools.
   Loaded after tools.js so it can extend the existing RENDERERS object.
   Data is stored locally in the browser, matching the existing tools.
   ===================================================================== */

const extraRenderers = {

  /* ---------------- Homework Planner ---------------- */
  homeworkPlanner(root){
    const KEY='ch_homework';
    let items=loadJSON(KEY,[]);
    root.innerHTML=`
      <div class="intake" style="padding:22px 24px;margin-bottom:22px;">
        <div class="tool-row">
          <div class="field"><label>Homework</label><input id="hw-title" placeholder="Maths worksheet"></div>
          <div class="field"><label>Subject</label><input id="hw-subject" placeholder="Maths"></div>
          <div class="field"><label>Due date</label><input id="hw-due" type="date"></div>
        </div>
        <button class="tool-open-btn" id="hw-add">Add homework</button>
      </div>
      <div class="item-list" id="hw-list"></div>
      <div class="empty-note" id="hw-empty" style="display:none;">No homework added yet.</div>`;
    const list=root.querySelector('#hw-list');
    function render(){
      items.sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999'));
      list.innerHTML=items.map(i=>`<div class="item-row${i.done?' done':''}"><input type="checkbox" class="item-check" data-id="${i.id}" ${i.done?'checked':''}><div class="item-main"><strong>${escapeHTML(i.title)}</strong><span>${escapeHTML(i.subject||'General')} • ${i.due||'No due date'}</span></div><button class="item-del" data-id="${i.id}">✕</button></div>`).join('');
      root.querySelector('#hw-empty').style.display=items.length?'none':'block'; saveJSON(KEY,items);
    }
    root.querySelector('#hw-add').onclick=()=>{const title=root.querySelector('#hw-title').value.trim();if(!title){showToast('Add a homework title first');return;}items.push({id:uid(),title,subject:root.querySelector('#hw-subject').value.trim(),due:root.querySelector('#hw-due').value,done:false});root.querySelector('#hw-title').value='';root.querySelector('#hw-subject').value='';render();};
    list.addEventListener('change',e=>{if(e.target.classList.contains('item-check')){const i=items.find(x=>x.id===e.target.dataset.id);if(i){i.done=e.target.checked;render();}}});
    list.addEventListener('click',e=>{if(e.target.classList.contains('item-del')){items=items.filter(i=>i.id!==e.target.dataset.id);render();}});render();
  },

  /* ---------------- Study Planner ---------------- */
  studyPlanner(root){
    const KEY='ch_study_plan'; let items=loadJSON(KEY,[]);
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Subject</label><input id="sp-subject" placeholder="Science"></div><div class="field"><label>Date</label><input id="sp-date" type="date"></div><div class="field"><label>Minutes</label><input id="sp-min" type="number" min="5" value="45"></div></div><div class="field"><label>What will you study?</label><input id="sp-topic" placeholder="Chapter 4 revision"></div><button class="tool-open-btn" id="sp-add">Add study session</button><div class="item-list" id="sp-list" style="margin-top:20px"></div>`;
    const list=root.querySelector('#sp-list');
    function render(){items.sort((a,b)=>(a.date||'').localeCompare(b.date||''));list.innerHTML=items.map(i=>`<div class="item-row"><div class="item-main"><strong>${escapeHTML(i.subject)} — ${escapeHTML(i.topic)}</strong><span>${i.date||'No date'} • ${i.minutes} minutes</span></div><button class="item-del" data-id="${i.id}">✕</button></div>`).join('')||'<div class="empty-note">No study sessions planned.</div>';saveJSON(KEY,items);}
    root.querySelector('#sp-add').onclick=()=>{const subject=root.querySelector('#sp-subject').value.trim(),topic=root.querySelector('#sp-topic').value.trim();if(!subject||!topic){showToast('Add a subject and study topic');return;}items.push({id:uid(),subject,topic,date:root.querySelector('#sp-date').value,minutes:Number(root.querySelector('#sp-min').value)||45});root.querySelector('#sp-topic').value='';render();};
    list.addEventListener('click',e=>{if(e.target.classList.contains('item-del')){items=items.filter(i=>i.id!==e.target.dataset.id);render();}});render();
  },

  /* ---------------- Exam Countdown ---------------- */
  examCountdown(root){
    const KEY='ch_exams'; let items=loadJSON(KEY,[]);
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Exam</label><input id="ec-name" placeholder="Science exam"></div><div class="field"><label>Subject</label><input id="ec-subject" placeholder="Science"></div><div class="field"><label>Exam date</label><input id="ec-date" type="date"></div></div><button class="tool-open-btn" id="ec-add">Add exam</button><div class="item-list" id="ec-list" style="margin-top:20px"></div>`;
    const list=root.querySelector('#ec-list');
    function render(){items.sort((a,b)=>a.date.localeCompare(b.date));list.innerHTML=items.map(i=>{const d=daysUntil(i.date);const label=d<0?`${Math.abs(d)} days ago`:d===0?'Today':`${d} days left`;return `<div class="item-row"><div class="item-main"><strong>${escapeHTML(i.name)}</strong><span>${escapeHTML(i.subject)} • ${i.date} • ${label}</span></div><button class="item-del" data-id="${i.id}">✕</button></div>`}).join('')||'<div class="empty-note">No exams added.</div>';saveJSON(KEY,items);}
    root.querySelector('#ec-add').onclick=()=>{const name=root.querySelector('#ec-name').value.trim(),date=root.querySelector('#ec-date').value;if(!name||!date){showToast('Add an exam name and date');return;}items.push({id:uid(),name,subject:root.querySelector('#ec-subject').value.trim(),date});root.querySelector('#ec-name').value='';render();};
    list.addEventListener('click',e=>{if(e.target.classList.contains('item-del')){items=items.filter(i=>i.id!==e.target.dataset.id);render();}});render();
  },

  /* ---------------- Study Streak Tracker ---------------- */
  studyStreakTracker(root){
    const KEY='ch_study_streak'; let state=loadJSON(KEY,{dates:[]});
    root.innerHTML=`<div class="grade-total"><div class="big" id="sst-current">0 days</div><div class="weight-note">Current study streak</div></div><button class="tool-open-btn" id="sst-today">Mark today as studied</button><div class="tool-stat-row" style="margin-top:24px"><div class="tool-stat"><span class="num" id="sst-best">0</span><span class="lbl">Best streak</span></div><div class="tool-stat"><span class="num" id="sst-total">0</span><span class="lbl">Days studied</span></div></div><div class="tool-actions"><button class="tool-mini-btn" id="sst-clear">Clear history</button></div>`;
    function streak(){const ds=[...new Set(state.dates)].sort();if(!ds.length)return{current:0,best:0};let best=1,run=1;for(let i=1;i<ds.length;i++){const a=new Date(ds[i-1]+'T00:00:00'),b=new Date(ds[i]+'T00:00:00');if((b-a)/86400000===1)run++;else run=1;best=Math.max(best,run);}let current=1;for(let i=ds.length-1;i>0;i--){const a=new Date(ds[i-1]+'T00:00:00'),b=new Date(ds[i]+'T00:00:00');if((b-a)/86400000===1)current++;else break;}const today=new Date();today.setHours(0,0,0,0);const last=new Date(ds.at(-1)+'T00:00:00');if((today-last)/86400000>1)current=0;return{current,best};}
    function render(){const s=streak();root.querySelector('#sst-current').textContent=`${s.current} day${s.current===1?'':'s'}`;root.querySelector('#sst-best').textContent=s.best;root.querySelector('#sst-total').textContent=state.dates.length;saveJSON(KEY,state);}
    root.querySelector('#sst-today').onclick=()=>{const d=new Date().toISOString().slice(0,10);if(!state.dates.includes(d)){state.dates.push(d);showToast('Study day recorded!');}render();};root.querySelector('#sst-clear').onclick=()=>{state.dates=[];render();};render();
  },

  /* ---------------- Quote Calculator ---------------- */
  quoteCalculator(root){
    let items=[{id:uid(),desc:'',qty:1,price:0}];
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Customer</label><input id="qc-customer" placeholder="Customer name"></div><div class="field"><label>Tax %</label><input id="qc-tax" type="number" value="10" min="0"></div></div><table class="tool-table"><thead><tr><th>Description</th><th>Qty</th><th>Price</th><th></th></tr></thead><tbody id="qc-body"></tbody></table><button class="tool-mini-btn" id="qc-add">+ Add item</button><div class="invoice-preview" id="qc-total"></div>`;
    const body=root.querySelector('#qc-body');function render(){body.innerHTML=items.map(i=>`<tr data-id="${i.id}"><td><input class="qc-desc" value="${escapeHTML(i.desc)}" placeholder="Website setup"></td><td><input class="qc-qty" type="number" min="0" value="${i.qty}"></td><td><input class="qc-price" type="number" min="0" step="0.01" value="${i.price}"></td><td><button class="tool-mini-btn qc-del">Remove</button></td></tr>`).join('');const sub=items.reduce((s,i)=>s+(Number(i.qty)||0)*(Number(i.price)||0),0),tax=sub*(Number(root.querySelector('#qc-tax').value)||0)/100;root.querySelector('#qc-total').innerHTML=`<div style="display:flex;justify-content:space-between"><span>Subtotal</span><strong>${fmtMoney(sub)}</strong></div><div style="display:flex;justify-content:space-between"><span>Tax</span><strong>${fmtMoney(tax)}</strong></div><div class="inv-total"><span>Quote total</span><strong>${fmtMoney(sub+tax)}</strong></div>`;}
    body.addEventListener('input',e=>{const tr=e.target.closest('tr'),i=items.find(x=>x.id===tr.dataset.id);if(!i)return;if(e.target.classList.contains('qc-desc'))i.desc=e.target.value;if(e.target.classList.contains('qc-qty'))i.qty=e.target.value;if(e.target.classList.contains('qc-price'))i.price=e.target.value;render();});body.addEventListener('click',e=>{if(e.target.classList.contains('qc-del')){items=items.filter(i=>i.id!==e.target.closest('tr').dataset.id);render();}});root.querySelector('#qc-add').onclick=()=>{items.push({id:uid(),desc:'',qty:1,price:0});render();};root.querySelector('#qc-tax').oninput=render;render();
  },

  /* ---------------- Revenue Tracker ---------------- */
  revenueTracker(root){
    const KEY='ch_revenue';let items=loadJSON(KEY,[]);
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Description</label><input id="rv-desc" placeholder="Website project"></div><div class="field"><label>Amount</label><input id="rv-amount" type="number" min="0" step="0.01"></div><div class="field"><label>Date</label><input id="rv-date" type="date"></div></div><button class="tool-open-btn" id="rv-add">Add revenue</button><div class="tool-stat-row" style="margin-top:22px"><div class="tool-stat"><span class="num" id="rv-total">$0.00</span><span class="lbl">Total revenue</span></div><div class="tool-stat"><span class="num" id="rv-count">0</span><span class="lbl">Entries</span></div></div><div class="item-list" id="rv-list"></div>`;
    const list=root.querySelector('#rv-list');function render(){items.sort((a,b)=>(b.date||'').localeCompare(a.date||''));list.innerHTML=items.map(i=>`<div class="item-row"><div class="item-main"><strong>${escapeHTML(i.desc)}</strong><span>${i.date||'No date'}</span></div><strong>${fmtMoney(i.amount)}</strong><button class="item-del" data-id="${i.id}">✕</button></div>`).join('')||'<div class="empty-note">No revenue logged.</div>';root.querySelector('#rv-total').textContent=fmtMoney(items.reduce((s,i)=>s+(Number(i.amount)||0),0));root.querySelector('#rv-count').textContent=items.length;saveJSON(KEY,items);}
    root.querySelector('#rv-add').onclick=()=>{const desc=root.querySelector('#rv-desc').value.trim(),amount=root.querySelector('#rv-amount').value;if(!desc||!amount){showToast('Add a description and amount');return;}items.push({id:uid(),desc,amount:Number(amount),date:root.querySelector('#rv-date').value});root.querySelector('#rv-desc').value='';root.querySelector('#rv-amount').value='';render();};list.addEventListener('click',e=>{if(e.target.classList.contains('item-del')){items=items.filter(i=>i.id!==e.target.dataset.id);render();}});render();
  },

  /* ---------------- Profit Calculator ---------------- */
  profitCalculator(root){
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Cost</label><input id="pc-cost" type="number" min="0" step="0.01" value="0"></div><div class="field"><label>Sale price</label><input id="pc-sale" type="number" min="0" step="0.01" value="0"></div></div><div class="grade-total"><div class="big" id="pc-profit">$0.00</div><div class="weight-note">Profit</div></div><div class="tool-stat-row"><div class="tool-stat"><span class="num" id="pc-margin">0%</span><span class="lbl">Profit margin</span></div><div class="tool-stat"><span class="num" id="pc-markup">0%</span><span class="lbl">Markup</span></div></div>`;
    function calc(){const c=Number(root.querySelector('#pc-cost').value)||0,s=Number(root.querySelector('#pc-sale').value)||0,p=s-c;root.querySelector('#pc-profit').textContent=fmtMoney(p);root.querySelector('#pc-margin').textContent=(s?p/s*100:0).toFixed(1)+'%';root.querySelector('#pc-markup').textContent=(c?p/c*100:0).toFixed(1)+'%';}root.querySelectorAll('input').forEach(i=>i.addEventListener('input',calc));calc();
  },

  /* ---------------- Appointment Scheduler ---------------- */
  appointmentScheduler(root){
    const KEY='ch_appointments';let items=loadJSON(KEY,[]);
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Customer</label><input id="ap-name" placeholder="Customer name"></div><div class="field"><label>Date</label><input id="ap-date" type="date"></div><div class="field"><label>Time</label><input id="ap-time" type="time"></div></div><div class="field"><label>Notes</label><input id="ap-notes" placeholder="Project consultation"></div><button class="tool-open-btn" id="ap-add">Add appointment</button><div class="item-list" id="ap-list" style="margin-top:20px"></div>`;
    const list=root.querySelector('#ap-list');function render(){items.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));list.innerHTML=items.map(i=>`<div class="item-row"><div class="item-main"><strong>${escapeHTML(i.name)}</strong><span>${i.date||'No date'} • ${i.time||'No time'} • ${escapeHTML(i.notes||'')}</span></div><button class="item-del" data-id="${i.id}">✕</button></div>`).join('')||'<div class="empty-note">No appointments scheduled.</div>';saveJSON(KEY,items);};root.querySelector('#ap-add').onclick=()=>{const name=root.querySelector('#ap-name').value.trim();if(!name){showToast('Add a customer name');return;}items.push({id:uid(),name,date:root.querySelector('#ap-date').value,time:root.querySelector('#ap-time').value,notes:root.querySelector('#ap-notes').value.trim()});root.querySelector('#ap-name').value='';root.querySelector('#ap-notes').value='';render();};list.addEventListener('click',e=>{if(e.target.classList.contains('item-del')){items=items.filter(i=>i.id!==e.target.dataset.id);render();}});render();
  },

  /* ---------------- Customer Database ---------------- */
  customerDatabase(root){
    const KEY='ch_customers';let items=loadJSON(KEY,[]);
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Name</label><input id="cd-name" placeholder="Customer name"></div><div class="field"><label>Email</label><input id="cd-email" type="email" placeholder="customer@example.com"></div><div class="field"><label>Phone</label><input id="cd-phone" placeholder="0400 000 000"></div></div><div class="field"><label>Notes</label><input id="cd-notes" placeholder="Project details"></div><button class="tool-open-btn" id="cd-add">Add customer</button><input id="cd-search" placeholder="Search customers" style="margin-top:18px"><div class="item-list" id="cd-list"></div>`;
    const list=root.querySelector('#cd-list');function render(){const q=root.querySelector('#cd-search').value.toLowerCase();const shown=items.filter(i=>(i.name+' '+i.email+' '+i.phone).toLowerCase().includes(q));list.innerHTML=shown.map(i=>`<div class="item-row"><div class="item-main"><strong>${escapeHTML(i.name)}</strong><span>${escapeHTML(i.email||'')} • ${escapeHTML(i.phone||'')}<br>${escapeHTML(i.notes||'')}</span></div><button class="item-del" data-id="${i.id}">✕</button></div>`).join('')||'<div class="empty-note">No customers found.</div>';saveJSON(KEY,items);};root.querySelector('#cd-add').onclick=()=>{const name=root.querySelector('#cd-name').value.trim();if(!name){showToast('Add a customer name');return;}items.push({id:uid(),name,email:root.querySelector('#cd-email').value.trim(),phone:root.querySelector('#cd-phone').value.trim(),notes:root.querySelector('#cd-notes').value.trim()});['cd-name','cd-email','cd-phone','cd-notes'].forEach(id=>root.querySelector('#'+id).value='');render();};root.querySelector('#cd-search').oninput=render;list.addEventListener('click',e=>{if(e.target.classList.contains('item-del')){items=items.filter(i=>i.id!==e.target.dataset.id);render();}});render();
  },

  /* ---------------- Daily Planner ---------------- */
  dailyPlanner(root){
    const KEY='ch_daily_plan';let items=loadJSON(KEY,[]);
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Time</label><input id="dp-time" type="time"></div><div class="field"><label>Task</label><input id="dp-task" placeholder="Study / meeting / task"></div></div><button class="tool-open-btn" id="dp-add">Add to plan</button><div class="item-list" id="dp-list" style="margin-top:20px"></div>`;const list=root.querySelector('#dp-list');function render(){items.sort((a,b)=>(a.time||'').localeCompare(b.time||''));list.innerHTML=items.map(i=>`<div class="item-row"><div class="item-main"><strong>${i.time||'Any time'}</strong><span>${escapeHTML(i.task)}</span></div><button class="item-del" data-id="${i.id}">✕</button></div>`).join('')||'<div class="empty-note">Your day is empty.</div>';saveJSON(KEY,items);}root.querySelector('#dp-add').onclick=()=>{const task=root.querySelector('#dp-task').value.trim();if(!task){showToast('Add a task');return;}items.push({id:uid,time:root.querySelector('#dp-time').value,task});root.querySelector('#dp-task').value='';render();};list.addEventListener('click',e=>{if(e.target.classList.contains('item-del')){items=items.filter(i=>i.id!==e.target.dataset.id);render();}});render();
  },

  /* ---------------- Weekly Planner ---------------- */
  weeklyPlanner(root){
    const KEY='ch_weekly_plan';let items=loadJSON(KEY,[]);const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Day</label><select id="wp-day">${days.map(d=>`<option>${d}</option>`).join('')}</select></div><div class="field"><label>Task</label><input id="wp-task" placeholder="Task or plan"></div></div><button class="tool-open-btn" id="wp-add">Add to week</button><div class="item-list" id="wp-list" style="margin-top:20px"></div>`;const list=root.querySelector('#wp-list');function render(){list.innerHTML=days.map(d=>{const dayItems=items.filter(i=>i.day===d);return `<div style="margin:14px 0"><strong>${d}</strong>${dayItems.map(i=>`<div class="item-row"><div class="item-main"><span>${escapeHTML(i.task)}</span></div><button class="item-del" data-id="${i.id}">✕</button></div>`).join('')||'<div class="empty-note">Nothing planned.</div>'}</div>`}).join('');saveJSON(KEY,items);}root.querySelector('#wp-add').onclick=()=>{const task=root.querySelector('#wp-task').value.trim();if(!task){showToast('Add a task');return;}items.push({id:uid(),day:root.querySelector('#wp-day').value,task});root.querySelector('#wp-task').value='';render();};list.addEventListener('click',e=>{if(e.target.classList.contains('item-del')){items=items.filter(i=>i.id!==e.target.dataset.id);render();}});render();
  },

  /* ---------------- Focus Timer ---------------- */
  focusTimer(root){
    let seconds=25*60,running=false;root.innerHTML=`<div class="timer-display" id="ft-display">25:00</div><div class="tool-row" style="max-width:260px;margin:18px auto"><div class="field"><label>Minutes</label><input id="ft-min" type="number" min="1" max="180" value="25"></div></div><div class="timer-controls"><button class="tool-open-btn" id="ft-start">Start</button><button class="tool-mini-btn" id="ft-reset">Reset</button></div>`;const display=root.querySelector('#ft-display'),start=root.querySelector('#ft-start');function show(){display.textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}function stop(){running=false;clearInterval(activeTimer);activeTimer=null;start.textContent='Start';}start.onclick=()=>{if(running){stop();return;}running=true;start.textContent='Pause';activeTimer=setInterval(()=>{seconds--;if(seconds<=0){seconds=0;stop();showToast('Focus session complete!');}show();},1000);};root.querySelector('#ft-reset').onclick=()=>{stop();seconds=(Number(root.querySelector('#ft-min').value)||25)*60;show();};root.querySelector('#ft-min').onchange=()=>{if(!running){seconds=(Number(root.querySelector('#ft-min').value)||25)*60;show();}};show();
  },

  /* ---------------- Goal Tracker ---------------- */
  goalTracker(root){
    const KEY='ch_goals';let items=loadJSON(KEY,[]);root.innerHTML=`<div class="tool-row"><div class="field"><label>Goal</label><input id="gt-name" placeholder="Finish website project"></div><div class="field"><label>Target %</label><input id="gt-progress" type="number" min="0" max="100" value="0"></div></div><button class="tool-open-btn" id="gt-add">Add goal</button><div class="item-list" id="gt-list" style="margin-top:20px"></div>`;const list=root.querySelector('#gt-list');function render(){list.innerHTML=items.map(i=>`<div class="item-row"><div class="item-main"><strong>${escapeHTML(i.name)}</strong><span>${i.progress}% complete</span><progress value="${i.progress}" max="100" style="width:100%"></progress></div><button class="item-del" data-id="${i.id}">✕</button></div>`).join('')||'<div class="empty-note">No goals added.</div>';saveJSON(KEY,items);}root.querySelector('#gt-add').onclick=()=>{const name=root.querySelector('#gt-name').value.trim();if(!name){showToast('Add a goal');return;}items.push({id:uid(),name,progress:Math.max(0,Math.min(100,Number(root.querySelector('#gt-progress').value)||0))});root.querySelector('#gt-name').value='';render();};list.addEventListener('click',e=>{if(e.target.classList.contains('item-del')){items=items.filter(i=>i.id!==e.target.dataset.id);render();}});render();
  },

  /* ---------------- Habit Tracker ---------------- */
  habitTracker(root){
    const KEY='ch_habits';let items=loadJSON(KEY,[]);root.innerHTML=`<div class="tool-row"><div class="field"><label>Habit</label><input id="ht-name" placeholder="Read for 20 minutes"></div></div><button class="tool-open-btn" id="ht-add">Add habit</button><div class="item-list" id="ht-list" style="margin-top:20px"></div>`;const list=root.querySelector('#ht-list');function render(){list.innerHTML=items.map(i=>`<div class="item-row"><div class="item-main"><strong>${escapeHTML(i.name)}</strong><span>${i.dates.length} day${i.dates.length===1?'':'s'} completed</span></div><button class="tool-mini-btn ht-today" data-id="${i.id}">Mark today</button><button class="item-del" data-id="${i.id}">✕</button></div>`).join('')||'<div class="empty-note">No habits added.</div>';saveJSON(KEY,items);}root.querySelector('#ht-add').onclick=()=>{const name=root.querySelector('#ht-name').value.trim();if(!name){showToast('Add a habit');return;}items.push({id:uid(),name,dates:[]});root.querySelector('#ht-name').value='';render();};list.addEventListener('click',e=>{const id=e.target.dataset.id;if(e.target.classList.contains('ht-today')){const i=items.find(x=>x.id===id),d=new Date().toISOString().slice(0,10);if(i&&!i.dates.includes(d))i.dates.push(d);render();}if(e.target.classList.contains('item-del')){items=items.filter(i=>i.id!==id);render();}});render();
  },
};

Object.assign(RENDERERS, extraRenderers);
