/* =====================================================================
   codeharbour tools — everything lives in this one file:
   - the full tool catalogue (56 tools across 3 categories)
   - grid + modal rendering
   - the working implementations for the tools marked available:true
   ===================================================================== */

/* ---------- 1. Catalogue ---------- */
/* TOOLS and CATEGORY_LABEL now live in tools-catalog.js (loaded before
   this file) so account.html can read the same catalogue. */


/* ---------- 2. Grid rendering ---------- */

function buildGrids(){
  ['student','business','productivity'].forEach(cat=>{
    const grid = document.getElementById('grid-'+cat);
    const items = TOOLS.filter(t=>t.category===cat);
    grid.innerHTML = items.map(toolCardHTML).join('');
  });

  document.querySelectorAll('[data-open]').forEach(btn=>{
    btn.addEventListener('click', ()=> openTool(btn.getAttribute('data-open')));
  });

  document.querySelectorAll('[data-fav]').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.stopPropagation();
      toggleFavorite(btn.getAttribute('data-fav'));
    });
  });
}

function toolCardHTML(tool){
  const soonClass = tool.available ? '' : ' soon';
  const isFav = favoriteIds.has(tool.id);
  const foot = tool.available
    ? `<button class="tool-open-btn" data-open="${tool.id}">Open tool \u2192</button>`
    : `<span class="status-pill status-soon">Coming soon</span>`;
  return `
    <div class="ticket tool-ticket${soonClass}">
        <button class="fav-toggle${isFav ? ' active' : ''}" data-fav="${tool.id}" aria-label="${isFav ? 'Remove from favourites' : 'Add to favourites'}" title="Favourite">${isFav ? '\u2605' : '\u2606'}</button>
        <div class="ticket-ref">${CATEGORY_LABEL[tool.category]}</div>
        <h3>${tool.name}</h3>
        <p>${tool.blurb}</p>
        <div class="tool-ticket-foot">${foot}</div>
    </div>`;
}

/* ---------- 3. Modal controls ---------- */

const overlay   = ()=> document.getElementById('modalOverlay');
const modalRef  = ()=> document.getElementById('modalRef');
const modalTitle= ()=> document.getElementById('modalTitle');
const modalBody = ()=> document.getElementById('modalBody');

let activeTimer = null; // so we can clear any running interval when the modal closes

function openTool(id){
  const tool = TOOLS.find(t=>t.id===id);
  if(!tool || !tool.available) return;

  modalRef().textContent = CATEGORY_LABEL[tool.category];
  modalTitle().textContent = tool.name;
  modalBody().innerHTML = '';

  RENDERERS[tool.renderer](modalBody());

  overlay().classList.add('open');
  document.body.style.overflow = 'hidden';

  recordRecent(id);
}

function closeTool(){
  overlay().classList.remove('open');
  document.body.style.overflow = '';
  if(activeTimer){ clearInterval(activeTimer); activeTimer = null; }
}

function initModal(){
  document.getElementById('modalClose').addEventListener('click', closeTool);
  overlay().addEventListener('click', e=>{ if(e.target === overlay()) closeTool(); });
  document.addEventListener('keydown', e=>{ if(e.key === 'Escape') closeTool(); });
}

/* ---------- 3.5. Account: favourites & recently used (synced via Supabase) ---------- */
/* Uses the same Supabase project as techindustries — signing in here uses
   the same account. Tool DATA (assignments, expenses, etc.) still lives
   only in localStorage; only the favourite/recent tool lists sync. */

let favoriteIds = new Set();
let currentUserId = null;
let _sbClient = null;

async function getSupabase(){
  if(_sbClient) return _sbClient;
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  _sbClient = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  return _sbClient;
}

async function initFavorites(){
  try{
    const sb = await getSupabase();
    const { data:{ session } } = await sb.auth.getSession();
    if(!session){ currentUserId = null; favoriteIds = new Set(); return; }
    currentUserId = session.user.id;
    const { data } = await sb.from('tool_favorites').select('tool_id').eq('user_id', currentUserId);
    favoriteIds = new Set((data||[]).map(r=>r.tool_id));
  }catch(e){
    console.warn('Favourites unavailable:', e);
    currentUserId = null;
    favoriteIds = new Set();
  }
}

async function toggleFavorite(toolId){
  try{
    const sb = await getSupabase();
    const { data:{ session } } = await sb.auth.getSession();
    if(!session){ showToast('Sign in to save favourites'); return; }

    if(favoriteIds.has(toolId)){
      await sb.from('tool_favorites').delete().eq('user_id', session.user.id).eq('tool_id', toolId);
      favoriteIds.delete(toolId);
      showToast('Removed from favourites');
    }else{
      await sb.from('tool_favorites').insert([{ user_id: session.user.id, tool_id: toolId }]);
      favoriteIds.add(toolId);
      showToast('Added to favourites');
    }
    buildGrids();
  }catch(e){
    console.warn('Could not update favourites:', e);
  }
}

async function recordRecent(toolId){
  try{
    const sb = await getSupabase();
    const { data:{ session } } = await sb.auth.getSession();
    if(!session) return;
    await sb.from('tool_recent').upsert(
      { user_id: session.user.id, tool_id: toolId, opened_at: new Date().toISOString() },
      { onConflict: 'user_id,tool_id' }
    );
  }catch(e){
    console.warn('Could not record recent tool:', e);
  }
}

/* ---------- 4. Small helpers shared by tools ---------- */

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._hideTimer);
  t._hideTimer = setTimeout(()=> t.classList.remove('show'), 2200);
}

function loadJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch(e){ return fallback; }
}

function saveJSON(key, value){
  try{ localStorage.setItem(key, JSON.stringify(value)); }catch(e){ /* storage unavailable, fail silently */ }
}

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

function escapeHTML(str){
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function fmtMoney(n){
  const num = Number(n) || 0;
  return '$' + num.toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 });
}

function daysUntil(dateStr){
  if(!dateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(dateStr + 'T00:00:00');
  return Math.round((due - today) / 86400000);
}

/* =====================================================================
   5. TOOL IMPLEMENTATIONS
   Each renderer(container) builds its own UI inside the modal body
   and wires up its own localStorage persistence.
   ===================================================================== */

const RENDERERS = {

  /* ---------------- Assignment Tracker ---------------- */
  assignmentTracker(root){
    const KEY = 'ch_assignments';
    let items = loadJSON(KEY, []);

    root.innerHTML = `
      <div class="intake" style="padding:22px 24px; margin-bottom:22px;">
        <div class="tool-row">
          <div class="field"><label>Title</label><input id="at-title" placeholder="Chemistry lab report"></div>
          <div class="field"><label>Subject</label><input id="at-subject" placeholder="Chemistry"></div>
          <div class="field"><label>Due date</label><input id="at-due" type="date"></div>
        </div>
        <button class="tool-open-btn" id="at-add">Add assignment</button>
      </div>
      <div class="item-list" id="at-list"></div>
      <div class="empty-note" id="at-empty" style="display:none;">Nothing tracked yet — add your first assignment above.</div>
    `;

    const list = root.querySelector('#at-list');
    const empty = root.querySelector('#at-empty');

    function render(){
      items.sort((a,b)=> (a.due||'9999').localeCompare(b.due||'9999'));
      list.innerHTML = items.map(it=>{
        const d = daysUntil(it.due);
        let dueLabel = it.due ? new Date(it.due+'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'}) : 'No date';
        if(d !== null && !it.done){
          if(d < 0) dueLabel += ` \u2022 ${Math.abs(d)}d overdue`;
          else if(d === 0) dueLabel += ' \u2022 due today';
          else dueLabel += ` \u2022 ${d}d left`;
        }
        return `
          <div class="item-row${it.done?' done':''}">
            <input type="checkbox" class="item-check" data-id="${it.id}" ${it.done?'checked':''}>
            <div class="item-main">
              <strong>${escapeHTML(it.title)}</strong>
              <span>${escapeHTML(it.subject||'General')} \u2022 ${dueLabel}</span>
            </div>
            <button class="item-del" data-id="${it.id}" aria-label="Delete">\u2715</button>
          </div>`;
      }).join('');
      empty.style.display = items.length ? 'none' : 'block';
      saveJSON(KEY, items);
    }

    root.querySelector('#at-add').addEventListener('click', ()=>{
      const title = root.querySelector('#at-title').value.trim();
      if(!title){ showToast('Give the assignment a title first'); return; }
      items.push({ id:uid(), title, subject:root.querySelector('#at-subject').value.trim(), due:root.querySelector('#at-due').value, done:false });
      root.querySelector('#at-title').value = '';
      root.querySelector('#at-subject').value = '';
      root.querySelector('#at-due').value = '';
      render();
    });

    list.addEventListener('change', e=>{
      if(e.target.classList.contains('item-check')){
        const it = items.find(i=>i.id===e.target.dataset.id);
        if(it){ it.done = e.target.checked; render(); }
      }
    });

    list.addEventListener('click', e=>{
      if(e.target.classList.contains('item-del')){
        items = items.filter(i=>i.id !== e.target.dataset.id);
        render();
      }
    });

    render();
  },

  /* ---------------- Grade Calculator ---------------- */
  gradeCalculator(root){
    const KEY = 'ch_grades';
    let rows = loadJSON(KEY, [
      { id:uid(), name:'Assignment 1', weight:20, score:85 },
      { id:uid(), name:'Midterm',      weight:30, score:78 },
    ]);

    root.innerHTML = `
      <div class="grade-total">
        <div class="big" id="gc-total">0%</div>
        <div class="weight-note" id="gc-weightnote">0% of total weight entered</div>
      </div>
      <table class="tool-table">
        <thead><tr><th>Assessment</th><th>Weight %</th><th>Score %</th><th></th></tr></thead>
        <tbody id="gc-body"></tbody>
      </table>
      <button class="tool-open-btn" id="gc-add" style="margin-top:16px;">Add assessment</button>
    `;

    const body = root.querySelector('#gc-body');

    function render(){
      body.innerHTML = rows.map(r=>`
        <tr data-id="${r.id}">
          <td><input class="gc-name" value="${escapeHTML(r.name)}"></td>
          <td><input class="gc-weight" type="number" min="0" max="100" value="${r.weight}"></td>
          <td><input class="gc-score" type="number" min="0" max="100" value="${r.score}"></td>
          <td><button class="tool-mini-btn gc-del">Remove</button></td>
        </tr>`).join('');

      const totalWeight = rows.reduce((s,r)=> s + (Number(r.weight)||0), 0);
      const weighted = rows.reduce((s,r)=> s + (Number(r.weight)||0) * (Number(r.score)||0), 0);
      const overall = totalWeight > 0 ? (weighted / totalWeight) : 0;

      root.querySelector('#gc-total').textContent = overall.toFixed(1) + '%';
      const note = root.querySelector('#gc-weightnote');
      note.textContent = `${totalWeight}% of total weight entered`;
      note.classList.toggle('warn', totalWeight !== 100 && rows.length > 0);

      saveJSON(KEY, rows);
    }

    body.addEventListener('input', e=>{
      const tr = e.target.closest('tr');
      const row = rows.find(r=>r.id === tr.dataset.id);
      if(!row) return;
      if(e.target.classList.contains('gc-name'))   row.name = e.target.value;
      if(e.target.classList.contains('gc-weight')) row.weight = e.target.value;
      if(e.target.classList.contains('gc-score'))  row.score = e.target.value;
      render();
    });

    body.addEventListener('click', e=>{
      if(e.target.classList.contains('gc-del')){
        const tr = e.target.closest('tr');
        rows = rows.filter(r=>r.id !== tr.dataset.id);
        render();
      }
    });

    root.querySelector('#gc-add').addEventListener('click', ()=>{
      rows.push({ id:uid(), name:'New assessment', weight:0, score:0 });
      render();
    });

    render();
  },

  /* ---------------- To-Do List ---------------- */
  todoList(root){
    const KEY = 'ch_todos';
    let items = loadJSON(KEY, []);

    root.innerHTML = `
      <div class="tool-row" style="grid-template-columns:1fr auto;">
        <div class="field" style="margin-bottom:0;"><input id="td-input" placeholder="What needs doing?"></div>
        <button class="tool-open-btn" id="td-add">Add</button>
      </div>
      <div class="tool-stat-row" style="margin-top:20px;">
        <div class="tool-stat"><span class="num" id="td-remaining">0</span><span class="lbl">Remaining</span></div>
        <div class="tool-stat"><span class="num" id="td-done">0</span><span class="lbl">Done</span></div>
      </div>
      <div class="item-list" id="td-list"></div>
      <div class="tool-actions">
        <button class="tool-mini-btn" id="td-clear">Clear completed</button>
      </div>
    `;

    const list = root.querySelector('#td-list');

    function render(){
      list.innerHTML = items.map(it=>`
        <div class="item-row${it.done?' done':''}">
          <input type="checkbox" class="item-check" data-id="${it.id}" ${it.done?'checked':''}>
          <div class="item-main"><strong>${escapeHTML(it.text)}</strong></div>
          <button class="item-del" data-id="${it.id}" aria-label="Delete">\u2715</button>
        </div>`).join('') || `<div class="empty-note">Your list is empty \u2014 add something above.</div>`;

      root.querySelector('#td-remaining').textContent = items.filter(i=>!i.done).length;
      root.querySelector('#td-done').textContent = items.filter(i=>i.done).length;
      saveJSON(KEY, items);
    }

    function addItem(){
      const input = root.querySelector('#td-input');
      const text = input.value.trim();
      if(!text) return;
      items.unshift({ id:uid(), text, done:false });
      input.value = '';
      render();
    }

    root.querySelector('#td-add').addEventListener('click', addItem);
    root.querySelector('#td-input').addEventListener('keydown', e=>{ if(e.key==='Enter') addItem(); });

    list.addEventListener('change', e=>{
      if(e.target.classList.contains('item-check')){
        const it = items.find(i=>i.id===e.target.dataset.id);
        if(it){ it.done = e.target.checked; render(); }
      }
    });

    list.addEventListener('click', e=>{
      if(e.target.classList.contains('item-del')){
        items = items.filter(i=>i.id !== e.target.dataset.id);
        render();
      }
    });

    root.querySelector('#td-clear').addEventListener('click', ()=>{
      items = items.filter(i=>!i.done);
      render();
    });

    render();
  },

  /* ---------------- Pomodoro Timer ---------------- */
  pomodoroTimer(root){
    const KEY = 'ch_pomodoro';
    let state = loadJSON(KEY, { workMin:25, breakMin:5, sessions:0 });
    let secondsLeft = state.workMin * 60;
    let mode = 'work'; // 'work' | 'break'
    let running = false;

    root.innerHTML = `
      <div class="timer-mode" id="pm-mode">Work session</div>
      <div class="timer-display" id="pm-display">25:00</div>
      <div class="tool-row" style="max-width:280px; margin:18px auto 0;">
        <div class="field-inline"><label>Work (min)</label><input id="pm-work" type="number" min="1" max="90" value="${state.workMin}"></div>
        <div class="field-inline"><label>Break (min)</label><input id="pm-break" type="number" min="1" max="60" value="${state.breakMin}"></div>
      </div>
      <div class="timer-controls">
        <button class="tool-open-btn" id="pm-start">Start</button>
        <button class="tool-mini-btn" id="pm-reset">Reset</button>
      </div>
      <div class="tool-stat-row" style="margin-top:26px;">
        <div class="tool-stat"><span class="num" id="pm-sessions">${state.sessions}</span><span class="lbl">Sessions completed</span></div>
      </div>
    `;

    const display = root.querySelector('#pm-display');
    const modeLabel = root.querySelector('#pm-mode');
    const startBtn = root.querySelector('#pm-start');
    const workInput = root.querySelector('#pm-work');
    const breakInput = root.querySelector('#pm-break');

    function updateDisplay(){
      const m = Math.floor(secondsLeft/60).toString().padStart(2,'0');
      const s = (secondsLeft%60).toString().padStart(2,'0');
      display.textContent = `${m}:${s}`;
      modeLabel.textContent = mode === 'work' ? 'Work session' : 'Break';
    }

    function tick(){
      secondsLeft--;
      if(secondsLeft < 0){
        if(mode === 'work'){
          state.sessions++;
          root.querySelector('#pm-sessions').textContent = state.sessions;
          saveJSON(KEY, state);
          showToast('Work session done \u2014 take a break!');
          mode = 'break';
          secondsLeft = (Number(breakInput.value)||5) * 60;
        }else{
          showToast('Break\u2019s over \u2014 back to it.');
          mode = 'work';
          secondsLeft = (Number(workInput.value)||25) * 60;
        }
      }
      updateDisplay();
    }

    startBtn.addEventListener('click', ()=>{
      running = !running;
      if(running){
        startBtn.textContent = 'Pause';
        activeTimer = setInterval(tick, 1000);
      }else{
        startBtn.textContent = 'Start';
        clearInterval(activeTimer);
        activeTimer = null;
      }
    });

    root.querySelector('#pm-reset').addEventListener('click', ()=>{
      running = false;
      clearInterval(activeTimer); activeTimer = null;
      startBtn.textContent = 'Start';
      mode = 'work';
      secondsLeft = (Number(workInput.value)||25) * 60;
      updateDisplay();
    });

    [workInput, breakInput].forEach(inp=>{
      inp.addEventListener('change', ()=>{
        state.workMin = Number(workInput.value)||25;
        state.breakMin = Number(breakInput.value)||5;
        saveJSON(KEY, state);
        if(!running && mode==='work'){ secondsLeft = state.workMin*60; updateDisplay(); }
      });
    });

    updateDisplay();
  },

  /* ---------------- Invoice Generator ---------------- */
  invoiceGenerator(root){
    const KEY = 'ch_invoice';
    let data = loadJSON(KEY, {
      business:'', client:'', number:'INV-001', date:new Date().toISOString().slice(0,10), taxRate:10,
      items:[{ id:uid(), desc:'', qty:1, price:0 }]
    });

    root.innerHTML = `
      <div class="tool-row">
        <div class="field"><label>Your business</label><input id="inv-business" value="${escapeHTML(data.business)}"></div>
        <div class="field"><label>Client</label><input id="inv-client" value="${escapeHTML(data.client)}"></div>
      </div>
      <div class="tool-row">
        <div class="field"><label>Invoice #</label><input id="inv-number" value="${escapeHTML(data.number)}"></div>
        <div class="field"><label>Date</label><input id="inv-date" type="date" value="${data.date}"></div>
        <div class="field"><label>Tax %</label><input id="inv-tax" type="number" min="0" max="100" value="${data.taxRate}"></div>
      </div>
      <table class="tool-table">
        <thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th></th></tr></thead>
        <tbody id="inv-body"></tbody>
      </table>
      <button class="tool-mini-btn" id="inv-add" style="margin-top:12px;">+ Add line item</button>
      <div class="invoice-preview" id="inv-preview"></div>
      <div class="tool-actions no-print" style="margin-top:18px;">
        <button class="tool-open-btn" id="inv-print">Print / Save as PDF</button>
      </div>
    `;

    const body = root.querySelector('#inv-body');
    const preview = root.querySelector('#inv-preview');

    function totals(){
      const subtotal = data.items.reduce((s,it)=> s + (Number(it.qty)||0) * (Number(it.price)||0), 0);
      const tax = subtotal * ((Number(data.taxRate)||0)/100);
      return { subtotal, tax, total: subtotal + tax };
    }

    function render(){
      body.innerHTML = data.items.map(it=>`
        <tr data-id="${it.id}">
          <td><input class="inv-desc" value="${escapeHTML(it.desc)}" placeholder="Item description"></td>
          <td><input class="inv-qty" type="number" min="0" value="${it.qty}" style="width:70px;"></td>
          <td><input class="inv-price" type="number" min="0" step="0.01" value="${it.price}" style="width:90px;"></td>
          <td><button class="tool-mini-btn inv-del">Remove</button></td>
        </tr>`).join('');

      const t = totals();
      preview.innerHTML = `
        <div><strong>${escapeHTML(data.business||'Your business')}</strong> \u2192 ${escapeHTML(data.client||'Client name')}</div>
        <div style="margin-top:4px; color:var(--ink-soft);">${escapeHTML(data.number)} \u2022 ${data.date}</div>
        <div style="margin-top:14px; display:flex; justify-content:space-between;"><span>Subtotal</span><span>${fmtMoney(t.subtotal)}</span></div>
        <div style="display:flex; justify-content:space-between;"><span>Tax (${data.taxRate||0}%)</span><span>${fmtMoney(t.tax)}</span></div>
        <div class="inv-total"><span>Total</span><span>${fmtMoney(t.total)}</span></div>
      `;

      saveJSON(KEY, data);
    }

    root.querySelector('#inv-business').addEventListener('input', e=>{ data.business = e.target.value; render(); });
    root.querySelector('#inv-client').addEventListener('input', e=>{ data.client = e.target.value; render(); });
    root.querySelector('#inv-number').addEventListener('input', e=>{ data.number = e.target.value; render(); });
    root.querySelector('#inv-date').addEventListener('input', e=>{ data.date = e.target.value; render(); });
    root.querySelector('#inv-tax').addEventListener('input', e=>{ data.taxRate = e.target.value; render(); });

    body.addEventListener('input', e=>{
      const tr = e.target.closest('tr');
      const item = data.items.find(i=>i.id === tr.dataset.id);
      if(!item) return;
      if(e.target.classList.contains('inv-desc'))  item.desc = e.target.value;
      if(e.target.classList.contains('inv-qty'))   item.qty = e.target.value;
      if(e.target.classList.contains('inv-price')) item.price = e.target.value;
      render();
    });

    body.addEventListener('click', e=>{
      if(e.target.classList.contains('inv-del')){
        const tr = e.target.closest('tr');
        data.items = data.items.filter(i=>i.id !== tr.dataset.id);
        render();
      }
    });

    root.querySelector('#inv-add').addEventListener('click', ()=>{
      data.items.push({ id:uid(), desc:'', qty:1, price:0 });
      render();
    });

    root.querySelector('#inv-print').addEventListener('click', ()=> window.print());

    render();
  },

  /* ---------------- Expense Tracker ---------------- */
  expenseTracker(root){
    const KEY = 'ch_expenses';
    let items = loadJSON(KEY, []);
    const CATS = ['Supplies','Software','Travel','Marketing','Equipment','Other'];

    root.innerHTML = `
      <div class="tool-row">
        <div class="field"><label>Description</label><input id="ex-desc" placeholder="Printer paper"></div>
        <div class="field"><label>Category</label>
          <select id="ex-cat">${CATS.map(c=>`<option>${c}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Amount</label><input id="ex-amount" type="number" min="0" step="0.01" placeholder="0.00"></div>
        <div class="field"><label>Date</label><input id="ex-date" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
      </div>
      <button class="tool-open-btn" id="ex-add">Add expense</button>

      <div class="tool-stat-row" style="margin-top:22px;">
        <div class="tool-stat"><span class="num" id="ex-total">$0.00</span><span class="lbl">Total spent</span></div>
        <div class="tool-stat"><span class="num" id="ex-count">0</span><span class="lbl">Expenses logged</span></div>
      </div>

      <div id="ex-breakdown" style="margin-bottom:10px;"></div>

      <table class="tool-table">
        <thead><tr><th>Description</th><th>Category</th><th>Date</th><th>Amount</th><th></th></tr></thead>
        <tbody id="ex-body"></tbody>
      </table>
      <div class="empty-note" id="ex-empty" style="display:none;">No expenses logged yet.</div>
    `;

    const body = root.querySelector('#ex-body');

    function render(){
      items.sort((a,b)=> (b.date||'').localeCompare(a.date||''));
      body.innerHTML = items.map(it=>`
        <tr>
          <td>${escapeHTML(it.desc)}</td>
          <td>${escapeHTML(it.cat)}</td>
          <td>${it.date||'\u2014'}</td>
          <td>${fmtMoney(it.amount)}</td>
          <td><button class="tool-mini-btn ex-del" data-id="${it.id}">Remove</button></td>
        </tr>`).join('');

      root.querySelector('#ex-empty').style.display = items.length ? 'none' : 'block';

      const total = items.reduce((s,it)=> s + (Number(it.amount)||0), 0);
      root.querySelector('#ex-total').textContent = fmtMoney(total);
      root.querySelector('#ex-count').textContent = items.length;

      const byCat = {};
      items.forEach(it=>{ byCat[it.cat] = (byCat[it.cat]||0) + (Number(it.amount)||0); });
      const breakdown = root.querySelector('#ex-breakdown');
      const catEntries = Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
      breakdown.innerHTML = catEntries.length ? `
        <div class="section-subhead" style="margin:20px 0 10px; font-size:1rem;">By category</div>
        ${catEntries.map(([cat,amt])=>`
          <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--line); font-size:.9rem; color:var(--ink-soft);">
            <span>${escapeHTML(cat)}</span><span>${fmtMoney(amt)}</span>
          </div>`).join('')}
      ` : '';

      saveJSON(KEY, items);
    }

    root.querySelector('#ex-add').addEventListener('click', ()=>{
      const desc = root.querySelector('#ex-desc').value.trim();
      const amount = root.querySelector('#ex-amount').value;
      if(!desc || !amount){ showToast('Add a description and amount first'); return; }
      items.push({
        id:uid(), desc, cat:root.querySelector('#ex-cat').value,
        amount:Number(amount), date:root.querySelector('#ex-date').value
      });
      root.querySelector('#ex-desc').value = '';
      root.querySelector('#ex-amount').value = '';
      render();
    });

    body.addEventListener('click', e=>{
      if(e.target.classList.contains('ex-del')){
        items = items.filter(i=>i.id !== e.target.dataset.id);
        render();
      }
    });

    render();
  },
};

/* ---------- 6. Nav toggle + boot ---------- */

document.addEventListener('DOMContentLoaded', async ()=>{
  await initFavorites();
  buildGrids();
  initModal();

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(toggle && links){
    toggle.addEventListener('click', ()=>{
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Opened via a link from account.html (favourites / recent tools)
  const params = new URLSearchParams(window.location.search);
  const openId = params.get('open');
  if(openId) openTool(openId);
});
