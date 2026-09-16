/* Remaining Business Tools */

const BUSINESS_EXTRA_RENDERERS = {
  contactManager(root){
    const KEY='ch_contacts'; let items=loadJSON(KEY,[]);
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Name</label><input id="cm-name" placeholder="Alex Smith"></div><div class="field"><label>Company</label><input id="cm-company" placeholder="Example Co"></div><div class="field"><label>Email</label><input id="cm-email" type="email" placeholder="alex@example.com"></div></div><button class="tool-open-btn" id="cm-add">Add contact</button><div class="item-list" id="cm-list"></div>`;
    const list=root.querySelector('#cm-list');
    function render(){list.innerHTML=items.map(x=>`<div class="item-row"><div class="item-main"><strong>${escapeHTML(x.name)}</strong><span>${escapeHTML(x.company||'')} ${x.email?'• '+escapeHTML(x.email):''}</span></div><button class="item-del" data-id="${x.id}">✕</button></div>`).join('')||'<div class="empty-note">No contacts yet.</div>';saveJSON(KEY,items)}
    root.querySelector('#cm-add').onclick=()=>{const name=root.querySelector('#cm-name').value.trim();if(!name){showToast('Enter a name first');return}items.push({id:uid(),name,company:root.querySelector('#cm-company').value.trim(),email:root.querySelector('#cm-email').value.trim()});root.querySelectorAll('input').forEach(i=>i.value='');render()};
    list.onclick=e=>{if(e.target.dataset.id){items=items.filter(x=>x.id!==e.target.dataset.id);render()}};render();
  },

  inventoryTracker(root){
    const KEY='ch_inventory';let items=loadJSON(KEY,[]);
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Item</label><input id="inv-name" placeholder="USB-C cable"></div><div class="field"><label>Quantity</label><input id="inv-qty" type="number" min="0" value="1"></div><div class="field"><label>Low-stock level</label><input id="inv-low" type="number" min="0" value="5"></div></div><button class="tool-open-btn" id="inv-add">Add stock item</button><div class="item-list" id="inv-list"></div>`;
    const list=root.querySelector('#inv-list');
    function render(){list.innerHTML=items.map(x=>`<div class="item-row"><div class="item-main"><strong>${escapeHTML(x.name)}</strong><span>Quantity: ${x.qty} • Low-stock alert: ${x.low}</span></div><button class="tool-mini-btn inv-minus" data-id="${x.id}">−</button><button class="tool-mini-btn inv-plus" data-id="${x.id}">+</button><button class="item-del" data-id="${x.id}">✕</button></div>`).join('')||'<div class="empty-note">No inventory items yet.</div>';saveJSON(KEY,items)}
    root.querySelector('#inv-add').onclick=()=>{const name=root.querySelector('#inv-name').value.trim();if(!name)return showToast('Enter an item name');items.push({id:uid(),name,qty:Number(root.querySelector('#inv-qty').value)||0,low:Number(root.querySelector('#inv-low').value)||0});render()};
    list.onclick=e=>{const id=e.target.dataset.id,x=items.find(i=>i.id===id);if(!x)return;if(e.target.classList.contains('inv-minus'))x.qty=Math.max(0,x.qty-1);else if(e.target.classList.contains('inv-plus'))x.qty++;else if(e.target.classList.contains('item-del'))items=items.filter(i=>i.id!==id);render()};render();
  },

  salesTracker(root){
    const KEY='ch_sales';let items=loadJSON(KEY,[]);
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Sale / product</label><input id="st-name" placeholder="Website package"></div><div class="field"><label>Amount</label><input id="st-amount" type="number" min="0" step="0.01" placeholder="500"></div><div class="field"><label>Date</label><input id="st-date" type="date"></div></div><button class="tool-open-btn" id="st-add">Log sale</button><div class="tool-stat-row"><div class="tool-stat"><span class="num" id="st-total">$0.00</span><span class="lbl">Total sales</span></div><div class="tool-stat"><span class="num" id="st-count">0</span><span class="lbl">Sales</span></div></div><div class="item-list" id="st-list"></div>`;
    const list=root.querySelector('#st-list');function render(){const total=items.reduce((s,x)=>s+Number(x.amount),0);root.querySelector('#st-total').textContent=fmtMoney(total);root.querySelector('#st-count').textContent=items.length;list.innerHTML=items.map(x=>`<div class="item-row"><div class="item-main"><strong>${escapeHTML(x.name)}</strong><span>${fmtMoney(x.amount)} • ${x.date||'No date'}</span></div><button class="item-del" data-id="${x.id}">✕</button></div>`).join('')||'<div class="empty-note">No sales logged yet.</div>';saveJSON(KEY,items)}
    root.querySelector('#st-add').onclick=()=>{const name=root.querySelector('#st-name').value.trim();if(!name)return showToast('Enter what was sold');items.push({id:uid(),name,amount:Number(root.querySelector('#st-amount').value)||0,date:root.querySelector('#st-date').value});render()};list.onclick=e=>{if(e.target.dataset.id){items=items.filter(x=>x.id!==e.target.dataset.id);render()}};render();
  },

  subscriptionTracker(root){
    const KEY='ch_subscriptions';let items=loadJSON(KEY,[]);
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Subscription</label><input id="sub-name" placeholder="Design software"></div><div class="field"><label>Cost</label><input id="sub-cost" type="number" min="0" step="0.01" placeholder="20"></div><div class="field"><label>Renewal date</label><input id="sub-date" type="date"></div></div><button class="tool-open-btn" id="sub-add">Add subscription</button><div class="tool-stat-row"><div class="tool-stat"><span class="num" id="sub-total">$0.00</span><span class="lbl">Total cost</span></div></div><div class="item-list" id="sub-list"></div>`;
    const list=root.querySelector('#sub-list');function render(){root.querySelector('#sub-total').textContent=fmtMoney(items.reduce((s,x)=>s+Number(x.cost),0));list.innerHTML=items.map(x=>{const d=daysUntil(x.date);return `<div class="item-row"><div class="item-main"><strong>${escapeHTML(x.name)}</strong><span>${fmtMoney(x.cost)} • Renews ${x.date||'unknown'}${d!==null&&d>=0?' • '+d+'d left':''}</span></div><button class="item-del" data-id="${x.id}">✕</button></div>`}).join('')||'<div class="empty-note">No subscriptions yet.</div>';saveJSON(KEY,items)}
    root.querySelector('#sub-add').onclick=()=>{const name=root.querySelector('#sub-name').value.trim();if(!name)return showToast('Enter a subscription');items.push({id:uid(),name,cost:Number(root.querySelector('#sub-cost').value)||0,date:root.querySelector('#sub-date').value});render()};list.onclick=e=>{if(e.target.dataset.id){items=items.filter(x=>x.id!==e.target.dataset.id);render()}};render();
  },

  staffHoursCalculator(root){
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Hours worked</label><input id="sh-hours" type="number" min="0" step="0.25" value="8"></div><div class="field"><label>Hourly rate</label><input id="sh-rate" type="number" min="0" step="0.01" value="25"></div></div><div class="grade-total"><div class="big" id="sh-result">$200.00</div><div class="weight-note">Estimated wages</div></div><p class="empty-note">Enter total hours and the hourly rate. Overtime or tax is not included.</p>`;
    const calc=()=>root.querySelector('#sh-result').textContent=fmtMoney((Number(root.querySelector('#sh-hours').value)||0)*(Number(root.querySelector('#sh-rate').value)||0));root.addEventListener('input',calc);calc();
  },

  projectTrackerBusiness(root){
    const KEY='ch_business_projects';let items=loadJSON(KEY,[]);
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Project</label><input id="bp-name" placeholder="Client website"></div><div class="field"><label>Client</label><input id="bp-client" placeholder="Example Co"></div><div class="field"><label>Due date</label><input id="bp-date" type="date"></div></div><button class="tool-open-btn" id="bp-add">Add project</button><div class="item-list" id="bp-list"></div>`;const list=root.querySelector('#bp-list');
    function render(){list.innerHTML=items.map(x=>`<div class="item-row"><input type="checkbox" class="item-check" data-id="${x.id}" ${x.done?'checked':''}><div class="item-main${x.done?' done':''}"><strong>${escapeHTML(x.name)}</strong><span>${escapeHTML(x.client||'No client')} • ${x.date||'No due date'}</span></div><button class="item-del" data-id="${x.id}">✕</button></div>`).join('')||'<div class="empty-note">No projects yet.</div>';saveJSON(KEY,items)}
    root.querySelector('#bp-add').onclick=()=>{const name=root.querySelector('#bp-name').value.trim();if(!name)return showToast('Enter a project name');items.push({id:uid(),name,client:root.querySelector('#bp-client').value.trim(),date:root.querySelector('#bp-date').value,done:false});render()};list.addEventListener('change',e=>{if(e.target.dataset.id){const x=items.find(i=>i.id===e.target.dataset.id);if(x)x.done=e.target.checked;render()}});list.onclick=e=>{if(e.target.classList.contains('item-del')){items=items.filter(x=>x.id!==e.target.dataset.id);render()}};render();
  },

  servicePricingCalculator(root){
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Hours</label><input id="sp-hours" type="number" min="0" step="0.25" value="2"></div><div class="field"><label>Hourly cost</label><input id="sp-cost" type="number" min="0" step="0.01" value="20"></div><div class="field"><label>Materials</label><input id="sp-materials" type="number" min="0" step="0.01" value="0"></div><div class="field"><label>Margin %</label><input id="sp-margin" type="number" min="0" max="99" step="1" value="30"></div></div><div class="grade-total"><div class="big" id="sp-result">$57.14</div><div class="weight-note">Suggested customer price</div></div><p class="empty-note">Price = labour + materials, adjusted so the target percentage is gross margin.</p>`;
    function calc(){const h=Number(root.querySelector('#sp-hours').value)||0,c=Number(root.querySelector('#sp-cost').value)||0,m=Number(root.querySelector('#sp-materials').value)||0,g=Math.min(99,Math.max(0,Number(root.querySelector('#sp-margin').value)||0));const base=h*c+m;const price=g>=100?base:base/(1-g/100);root.querySelector('#sp-result').textContent=fmtMoney(price)}root.addEventListener('input',calc);calc();
  },

  breakEvenCalculator(root){
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Fixed costs</label><input id="be-fixed" type="number" min="0" value="1000"></div><div class="field"><label>Sale price</label><input id="be-price" type="number" min="0" step="0.01" value="50"></div><div class="field"><label>Variable cost / sale</label><input id="be-variable" type="number" min="0" step="0.01" value="20"></div></div><div class="grade-total"><div class="big" id="be-result">34</div><div class="weight-note">Sales needed to break even</div></div>`;
    function calc(){const f=Number(root.querySelector('#be-fixed').value)||0,p=Number(root.querySelector('#be-price').value)||0,v=Number(root.querySelector('#be-variable').value)||0;const contribution=p-v;root.querySelector('#be-result').textContent=contribution>0?Math.ceil(f/contribution).toLocaleString():'—'}root.addEventListener('input',calc);calc();
  },

  cashFlowTracker(root){
    const KEY='ch_cashflow';let items=loadJSON(KEY,[]);
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Description</label><input id="cf-name" placeholder="Client payment"></div><div class="field"><label>Amount</label><input id="cf-amount" type="number" step="0.01" placeholder="500"></div><div class="field"><label>Type</label><select id="cf-type"><option value="in">Money in</option><option value="out">Money out</option></select></div></div><button class="tool-open-btn" id="cf-add">Add entry</button><div class="grade-total"><div class="big" id="cf-balance">$0.00</div><div class="weight-note">Net cash flow</div></div><div class="item-list" id="cf-list"></div>`;const list=root.querySelector('#cf-list');
    function render(){const balance=items.reduce((s,x)=>s+(x.type==='in'?Number(x.amount):-Number(x.amount)),0);root.querySelector('#cf-balance').textContent=fmtMoney(balance);list.innerHTML=items.map(x=>`<div class="item-row"><div class="item-main"><strong>${escapeHTML(x.name)}</strong><span>${x.type==='in'?'+':'−'}${fmtMoney(x.amount)}</span></div><button class="item-del" data-id="${x.id}">✕</button></div>`).join('')||'<div class="empty-note">No cash-flow entries yet.</div>';saveJSON(KEY,items)}
    root.querySelector('#cf-add').onclick=()=>{const name=root.querySelector('#cf-name').value.trim();if(!name)return showToast('Enter a description');items.push({id:uid(),name,amount:Number(root.querySelector('#cf-amount').value)||0,type:root.querySelector('#cf-type').value});render()};list.onclick=e=>{if(e.target.dataset.id){items=items.filter(x=>x.id!==e.target.dataset.id);render()}};render();
  },

  businessGoalTracker(root){
    const KEY='ch_business_goals';let items=loadJSON(KEY,[]);
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Goal</label><input id="bg-name" placeholder="Reach $2,000 revenue"></div><div class="field"><label>Target</label><input id="bg-target" type="number" min="0" step="0.01" value="2000"></div><div class="field"><label>Current</label><input id="bg-current" type="number" min="0" step="0.01" value="0"></div></div><button class="tool-open-btn" id="bg-add">Add goal</button><div class="item-list" id="bg-list"></div>`;const list=root.querySelector('#bg-list');
    function render(){list.innerHTML=items.map(x=>{const pct=x.target?Math.min(100,Number(x.current)/Number(x.target)*100):0;return `<div class="item-row"><div class="item-main"><strong>${escapeHTML(x.name)}</strong><span>${fmtMoney(x.current)} / ${fmtMoney(x.target)} • ${pct.toFixed(0)}%</span><div style="height:7px;background:var(--line);margin-top:7px;border-radius:5px;overflow:hidden"><div style="width:${pct}%;height:100%;background:currentColor"></div></div></div><button class="item-del" data-id="${x.id}">✕</button></div>`}).join('')||'<div class="empty-note">No business goals yet.</div>';saveJSON(KEY,items)}
    root.querySelector('#bg-add').onclick=()=>{const name=root.querySelector('#bg-name').value.trim();if(!name)return showToast('Enter a goal');items.push({id:uid(),name,target:Number(root.querySelector('#bg-target').value)||0,current:Number(root.querySelector('#bg-current').value)||0});render()};list.onclick=e=>{if(e.target.dataset.id){items=items.filter(x=>x.id!==e.target.dataset.id);render()}};render();
  },

  clientPortal(root){
    const KEY='ch_client_portal';let items=loadJSON(KEY,[]);
    root.innerHTML=`<div class="tool-row"><div class="field"><label>Client</label><input id="cp-client" placeholder="Alex / Example Co"></div><div class="field"><label>Project update</label><input id="cp-update" placeholder="Homepage is ready for review"></div></div><button class="tool-open-btn" id="cp-add">Add update</button><div class="item-list" id="cp-list"></div><p class="empty-note">This browser-only tool creates a simple local client-update board. It does not publish or send files to clients.</p>`;const list=root.querySelector('#cp-list');
    function render(){list.innerHTML=items.map(x=>`<div class="item-row"><div class="item-main"><strong>${escapeHTML(x.client)}</strong><span>${escapeHTML(x.update)} • ${new Date(x.created).toLocaleDateString()}</span></div><button class="item-del" data-id="${x.id}">✕</button></div>`).join('')||'<div class="empty-note">No client updates yet.</div>';saveJSON(KEY,items)}
    root.querySelector('#cp-add').onclick=()=>{const client=root.querySelector('#cp-client').value.trim(),update=root.querySelector('#cp-update').value.trim();if(!client||!update)return showToast('Enter a client and update');items.unshift({id:uid(),client,update,created:Date.now()});render()};list.onclick=e=>{if(e.target.dataset.id){items=items.filter(x=>x.id!==e.target.dataset.id);render()}};render();
  }
};

Object.assign(RENDERERS,BUSINESS_EXTRA_RENDERERS);
