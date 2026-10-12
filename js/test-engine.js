const TE={T:null,si:0,qi:0,sel:null,tick:null,end:0,done:false,t0:0,n:0,
stop(){clearInterval(this.tick)},
async start(b,id,type,path){await busy(b,async()=>{const u=getUser();
const{data:prev,error}=await sb.from('attempts').select('test_id,test_type').eq('user_id',u.id);if(error)return toast('Could not check attempts.');
const n=prev.filter(x=>x.test_id===id).length;if(type==='full'){if(n>=2)return toast('Attempts completed for this mock.');
if(!u.ssc_gd_premium&&+id.split('-').pop()>CFG.FREE_MOCKS)return toast('This mock is for premium members. Please unlock Premium.')}
let j;try{const r=await fetch(`${CFG.GITHUB_TEST_BASE_URL}/${path}`);if(!r.ok)throw 0;j=await r.json()}catch(e){return toast('Test file not found or failed to load.')}
const ss=j.sections||[];if(!ss.length)return toast('Invalid test file.');
this.T={id,type,title:j.title,neg:j.negativeMarking??.25,mp:j.marksPerQuestion??2,secs:ss.map(s=>({id:s.id,title:s.title,dur:s.duration||15,qs:s.questions.map(q=>({...q,a:null,st:'unanswered',rv:false}))}))};
this.n=n;this.si=0;this.done=false;this.t0=Date.now();this.beginSection();showSection('active-test')})},
S(){return this.T.secs[this.si]},Q(){return this.S().qs[this.qi]},
beginSection(){this.qi=0;this.sel=null;this.end=Date.now()+this.S().dur*60000;this.stop();this.tick=setInterval(()=>this.clock(),500);this.render()},
clock(){const left=Math.max(0,this.end-Date.now()),e=$('#te-time');if(e){e.classList.toggle('low',left<60000);const m=Math.floor(left/60000),s=Math.floor(left/1000)%60;e.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
if(left<=0){this.stop();this.nextSection(true)}},
cls(q,i){return'pb '+(q.rv?'rv':q.st==='skipped'?'sk':q.st==='attempted'?'at':'')+(i===this.qi?' cur':'')},
render(){const S=this.S(),sh={reasoning:'Reasoning','gk-ga':'GK/GA',mathematics:'Maths','english-hindi':'English/Hindi'};
$('#s-active-test').innerHTML=`<div class="thead"><div class="tt"><b>${esc(this.T.title)}</b><small id="te-q"></small></div><div id="te-time" class="timer">--:--</div></div>
<div class="strip"><div class="steps2">${this.T.secs.map((s,i)=>`<span class="st ${i<this.si?'done':i===this.si?'now':''}">${i<this.si?'✓ ':''}${esc(sh[s.id]||s.title)}</span>`).join('')}</div><button class="btn danger sm" onclick="TE.confirm()">Submit Section</button></div><div id="te-body"></div>`;this.draw()},
draw(){const S=this.S(),q=this.Q(),L=S.qs.length,c=this.cnt(S),old=$('#te-body .pal'),open=old?old.open:true;this.sel=this.sel??q.a;$('#te-q').textContent=`Question ${this.qi+1} of ${L}`;
$('#te-body').innerHTML=`<div class="prog" title="Attempted ${c.at} of ${L}"><i style="width:${c.at/L*100}%"></i></div>
<details class="pal" ${open?'open':''}><summary>Question Palette<span class="cnts"><em class="g">${c.at}</em><em class="r">${c.sk}</em><em class="p">${c.rv}</em><em>${c.un}</em></span></summary><div class="legend"><span><i class="d at"></i>Attempted</span><span><i class="d sk"></i>Skipped</span><span><i class="d rv"></i>Review</span><span><i class="d"></i>Unanswered</span></div>
<div class="palette">${S.qs.map((x,i)=>`<button class="${this.cls(x,i)}" aria-label="Question ${i+1}" onclick="TE.go(${i})">${i+1}</button>`).join('')}</div></details>
<div class="qcard"><div class="qh"><span class="qn">Q${this.qi+1}</span><span class="mk">+${this.T.mp} correct · −${this.T.neg} wrong</span>${q.rv?'<span class="tag p">Marked for review</span>':''}</div><div class="qtext">${esc(q.question)}</div>${q.image?`<img src="${esc(q.image)}" alt="" loading="lazy">`:''}
<div role="radiogroup" aria-label="Options">${q.options.map((o,i)=>`<button class="opt${this.sel===i?' on':''}" role="radio" aria-checked="${this.sel===i}" onclick="TE.pick(${i})"><span class="ltr">${'ABCD'[i]||i+1}</span><span class="ot">${esc(o)}</span></button>`).join('')}</div></div>
<div class="abar"><button class="btn out" onclick="TE.go(${this.qi-1})" ${this.qi?'':'disabled'}>← Prev</button><button class="btn rvb" onclick="TE.mark()">Review</button><button class="btn out" onclick="TE.skip()">Skip</button><button class="btn" onclick="TE.save()">Save &amp; Next</button></div>`;this.clock()},
go(i){if(i<0||i>=this.S().qs.length)return;this.qi=i;this.sel=null;this.draw();window.scrollTo(0,0)},
pick(i){this.sel=i;$$('.opt').forEach((b,k)=>{b.classList.toggle('on',k===i);b.setAttribute('aria-checked',k===i)})},
adv(){this.qi<this.S().qs.length-1?this.go(this.qi+1):(this.sel=null,this.draw())},
save(){if(this.sel==null)return toast('Select an option first, or use Skip.');const q=this.Q();q.a=this.sel;q.st='attempted';q.rv=false;this.adv()},
skip(){const q=this.Q();q.a=null;q.st='skipped';q.rv=false;this.adv()},
mark(){const q=this.Q();if(this.sel!=null){q.a=this.sel;q.st='attempted'}q.rv=true;this.adv()},
cnt(S){const c={at:0,sk:0,rv:0,un:0};S.qs.forEach(q=>{q.st==='attempted'&&c.at++;q.st==='skipped'&&c.sk++;q.rv&&c.rv++;q.st==='unanswered'&&c.un++});return c},
confirm(){const c=this.cnt(this.S()),last=this.si===this.T.secs.length-1;
$('#modal').innerHTML=`<div class="mbox"><h3>${last?'Submit Full Mock?':'Submit this section?'}</h3><p>Attempted: ${c.at}<br>Skipped: ${c.sk}<br>Marked for Review: ${c.rv}<br>Unanswered: ${c.un}</p><div class="actions"><button class="btn out" onclick="TE.close()">Continue Test</button><button class="btn danger" onclick="TE.close();TE.nextSection(false)">${last?'Submit Test':'Submit Section'}</button></div></div>`;$('#modal').hidden=false},
close(){$('#modal').hidden=true},
nextSection(auto){this.stop();if(this.si<this.T.secs.length-1){this.si++;if(auto){$('#modal').innerHTML='<div class="mbox"><h3>Section Completed</h3><p>Next Section Starting…</p></div>';$('#modal').hidden=false;setTimeout(()=>{this.close();this.beginSection()},1800)}else this.beginSection()}else this.finish()},
async finish(){if(this.done)return;this.done=true;const T=this.T;let C=0,W=0,K=0;const secs=[],ans=[];
T.secs.forEach(s=>{let c=0,w=0,k=0;s.qs.forEach(q=>{if(q.a==null){k++}else if(q.a===q.correctAnswer)c++;else w++;ans.push({s:s.id,id:q.id,a:q.a,rv:q.rv})});C+=c;W+=w;K+=k;secs.push({title:s.title,correct:c,wrong:w,skipped:k})});
const row={user_id:getUser().id,test_id:T.id,test_type:T.type,attempt_number:this.n+1,score:C*T.mp-W*T.neg,correct:C,wrong:W,skipped:K,time_taken:Math.round((Date.now()-this.t0)/1000),sections:secs,answers:ans};
this.res={row,T};$('#modal').innerHTML='<div class="mbox"><p>Saving result…</p></div>';$('#modal').hidden=false;
const{error}=await sb.from('attempts').insert(row);this.close();
if(error)toast('Result could not be saved: '+error.message);
showSection('result')},
async result(){const r=this.res;if(!r)return showSection('dashboard');const x=r.row,L=x.correct+x.wrong+x.skipped||80,pct=Math.max(0,x.score/1.6),acc=x.correct/((x.correct+x.wrong)||1)*100,att=(x.correct+x.wrong)/L*100;
const S=x.sections.map(s=>({...s,acc:s.correct/((s.correct+s.wrong)||1)*100})),best=[...S].sort((a,b)=>b.acc-a.acc)[0],worst=[...S].sort((a,b)=>a.acc-b.acc)[0];
const verdict=pct>=75?'Excellent work!':pct>=55?'Good attempt — keep pushing':pct>=35?'Fair start — practice will lift this':'Needs more practice';
$('#s-result').innerHTML=`<div class="rhero"><div class="ring" style="--p:${pct}"><div><b>${f1(x.score)}</b><small>/ 160</small></div></div><div><h2>${verdict}</h2><p>${f1(pct)}% · ${esc(x.test_id.replace('ssc-gd-','').replace(/-/g,' '))} · Attempt ${x.attempt_number}</p><p class="muted">Time taken: ${Math.floor(x.time_taken/60)}m ${x.time_taken%60}s</p></div></div>
<div class="grid">${card('Correct',x.correct)}${card('Wrong',x.wrong)}${card('Skipped',x.skipped)}${card('Accuracy',f1(acc)+'%')}${card('Attempt Rate',f1(att)+'%')}${card('Avg Time / Question',Math.round(x.time_taken/L)+'s')}<div class="stat" id="rk"><b>…</b><span>Your Rank</span></div><div class="stat" id="avgs"><b>…</b><span>Average Score (all)</span></div></div>
<h3>Section analysis</h3><div class="grid">${S.map(s=>{const tot=s.correct+s.wrong+s.skipped||1;return`<div class="card"><b>${esc(s.title)}</b><span class="tag ${s.acc>=70?'g':s.acc>=45?'a':'r'}">${s.acc>=70?'Strong':s.acc>=45?'Average':'Needs work'}</span><div class="seg"><i style="width:${s.correct/tot*100}%;background:var(--ok)"></i><i style="width:${s.wrong/tot*100}%;background:var(--bad)"></i></div><small>${s.correct} correct · ${s.wrong} wrong · ${s.skipped} skipped · Accuracy ${f1(s.acc)}%</small></div>`}).join('')}</div>
<h3>Insights</h3><div class="card ins"><p><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg> Strongest section: <b>${esc(best.title)}</b> (${f1(best.acc)}% accuracy)</p><p><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg> Focus next on: <b>${esc(worst.title)}</b> (${f1(worst.acc)}% accuracy)</p><p><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg> Marks lost to negative marking: <b>${f1(x.wrong*.25)}</b></p><p><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg> ${x.skipped} skipped questions — each correct answer there is worth +2 marks.</p>${x.wrong>x.correct/3?'<p><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg> Many wrong answers. Skip when unsure to protect your score.</p>':''}</div>
<div class="actions col">${r.T?'<button class="btn" onclick="showSection(\'review\')">Review Answers</button>':''}<button class="btn out" onclick="showSection('performance')">My Performance</button><button class="btn out" onclick="showSection('dashboard')">Back to Dashboard</button></div>`;
const{data}=await sb.from('attempts').select('score').eq('test_id',x.test_id);if(data&&$('#rk')){const better=data.filter(d=>d.score>x.score).length;$('#rk b').textContent='#'+(better+1)+' of '+Math.max(data.length,1);$('#avgs b').textContent=f1(avg(data.map(d=>d.score)))}},
openAttempt(i){this.res={row:HIST[i],T:null};showSection('result')},
review(){const r=this.res;if(!r)return showSection('dashboard');let h='<h2>Answer Review</h2>';
r.T.secs.forEach(s=>{h+=`<h3>${esc(s.title)}</h3>`;s.qs.forEach((q,i)=>{const st=q.a==null?'Skipped':q.a===q.correctAnswer?'Correct':'Wrong';
h+=`<div class="card"><b>Q${i+1}. ${st}${q.rv?' + Review':''}</b><div class="qtext">${esc(q.question)}</div>${q.options.map((o,k)=>`<div class="opt ro${k===q.correctAnswer?' ok':k===q.a?' bad':''}">${esc(o)}</div>`).join('')}<p class="muted">Your answer: ${q.a==null?'—':esc(q.options[q.a])}<br>Correct: ${esc(q.options[q.correctAnswer])}</p></div>`})});$('#s-review').innerHTML=h}};
window.addEventListener('beforeunload',e=>{if(TE.T&&!TE.done&&$('#s-active-test')&&!$('#s-active-test').hidden){e.preventDefault();e.returnValue=''}});
