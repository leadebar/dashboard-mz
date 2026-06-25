import { useState, useRef, useEffect, useCallback } from 'react'
import Head from 'next/head'

// ── TYPES ──
type TaskStatus = 'todo' | 'done'
type Msg = { role: 'user' | 'assistant'; content: string; ts: string; tasks?: Task[]; dates?: CalDate[] }
type Task = { text: string; proj: string; deadline?: string; who: string }
type CalDate = { d: string; t: string; proj: string; type: 'deadline' | 'rdv' | 'newsletter' | 'task' }
type KTask = { id: string; text: string; proj: string; deadline?: string; status: TaskStatus; source?: string; chatRef?: string }
type View = 'dashboard' | 'chat' | 'todo' | 'calendrier' | 'email'
type EId = 'seo' | 'blog' | 'newsletter' | 'agenda' | 'mails' | 'ppt' | 'data' | 'strategie'

const LOGO = 'data:image/png;base64,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'
const FCSS = `body { font-family: 'Inter', sans-serif; } * { box-sizing: border-box; margin: 0; padding: 0; }`

const RED = '#C8102E', WHITE = '#FFFFFF', DARK = '#1A1A1A'
const GREY = '#F5F5F5', GREY2 = '#EBEBEB', BORDER = '#DCDCDC'
const TEXT = '#1A1A1A', TEXT2 = '#666666', TEXT3 = '#999999'
const BLUE = '#0D47A1', BLUE_BG = '#E3F2FD', BLUE_BORDER = '#90CAF9'

const PROJ: Record<string,{color:string;bg:string;border:string}> = {
  'MZ Real Estate': { color: RED, bg: '#FFF0F2', border: '#F5B8C2' },
  'MZ Rentals':     { color: '#C8102E', bg: '#FFF5F0', border: '#F5C8B8' },
  'Newsletters':    { color: '#333333', bg: '#F5F5F5', border: '#DCDCDC' },
}

const STATUS_CONFIG: Record<TaskStatus,{label:string;color:string;bg:string;border:string}> = {
  todo: { label: 'À faire', color: TEXT3, bg: GREY, border: BORDER },
  done: { label: 'Terminé', color: '#2E7D32', bg: '#E8F5E9', border: '#A5D6A7' },
}

const EX: Record<EId,{name:string;title:string;color:string;bg:string;initials:string}> = {
  seo:        { name: 'Ashley',   title: 'SEO & Référencement',       color: '#1B5E20', bg: '#E8F5E9', initials: 'AS' },
  blog:       { name: 'Lauren',   title: 'Rédaction & SEO Blog',      color: '#0D47A1', bg: '#E3F2FD', initials: 'LA' },
  newsletter: { name: 'Madison',  title: 'Newsletter Mailchimp',       color: '#4A148C', bg: '#F3E5F5', initials: 'MA' },
  agenda:     { name: 'Taylor',   title: 'Agenda & Planning',          color: RED,       bg: '#FFF0F2', initials: 'TA' },
  mails:      { name: 'Olivia',   title: 'Rédaction Mails',           color: '#BF360C', bg: '#FBE9E7', initials: 'OL' },
  ppt:        { name: 'Sophia',   title: 'Présentations PPT & Canva', color: '#6A1B9A', bg: '#F3E5F5', initials: 'SO' },
  data:       { name: 'Brooklyn', title: 'Analyse & Data',            color: '#01579B', bg: '#E1F5FE', initials: 'BR' },
  strategie:  { name: 'Victoria', title: 'Stratégie Marketing',       color: DARK,      bg: GREY,     initials: 'VI' },
}

const PERSONAS: Record<EId, string> = {
  seo: "Tu travailles pour Lea Debar, Chargee Marketing Digital chez Michael Zingraf Real Estate (Christie's International Real Estate), agence immobilier de luxe Riviera et Provence, 14 agences.\nProjets : MZ Real Estate (vente prestige), MZ Rentals (location luxe), Newsletters (80k contacts Mailchimp).\nOutils : Mailchimp, Apimo, Google Analytics, portails SeLoger Prestige / Belles Demeures / JamesEdition.\nRegles : reponds en francais naturel, ZERO markdown. Si tu identifies des taches/dates, ajoute a la fin sur une seule ligne : {\"tasks\":[{\"text\":\"X\",\"proj\":\"MZ Real Estate\",\"deadline\":\"2026-06-25\",\"who\":\"lea\"}],\"dates\":[{\"d\":\"2026-06-25\",\"t\":\"titre\",\"proj\":\"Newsletters\",\"type\":\"newsletter\"}]} sinon rien.\n\nTu es ASHLEY, experte SEO. Tu produis : balises title/meta (155 car.), H1/H2, mots-cles locaux immobilier luxe, recommandations techniques actionnables.",
  blog: "Tu travailles pour Lea Debar, Chargee Marketing Digital chez Michael Zingraf Real Estate (Christie's International Real Estate), agence immobilier de luxe Riviera et Provence, 14 agences.\nProjets : MZ Real Estate (vente prestige), MZ Rentals (location luxe), Newsletters (80k contacts Mailchimp).\nOutils : Mailchimp, Apimo, Google Analytics, portails SeLoger Prestige / Belles Demeures / JamesEdition.\nRegles : reponds en francais naturel, ZERO markdown. Si tu identifies des taches/dates, ajoute a la fin sur une seule ligne : {\"tasks\":[{\"text\":\"X\",\"proj\":\"MZ Real Estate\",\"deadline\":\"2026-06-25\",\"who\":\"lea\"}],\"dates\":[{\"d\":\"2026-06-25\",\"t\":\"titre\",\"proj\":\"Newsletters\",\"type\":\"newsletter\"}]} sinon rien.\n\nTu es LAUREN, redactrice SEO blog immobilier luxe. Tu produis : articles complets, guides destinations Riviera/Provence, introductions accrocheuses, metas.",
  newsletter: "Tu travailles pour Lea Debar, Chargee Marketing Digital chez Michael Zingraf Real Estate (Christie's International Real Estate), agence immobilier de luxe Riviera et Provence, 14 agences.\nProjets : MZ Real Estate (vente prestige), MZ Rentals (location luxe), Newsletters (80k contacts Mailchimp).\nOutils : Mailchimp, Apimo, Google Analytics, portails SeLoger Prestige / Belles Demeures / JamesEdition.\nRegles : reponds en francais naturel, ZERO markdown. Si tu identifies des taches/dates, ajoute a la fin sur une seule ligne : {\"tasks\":[{\"text\":\"X\",\"proj\":\"MZ Real Estate\",\"deadline\":\"2026-06-25\",\"who\":\"lea\"}],\"dates\":[{\"d\":\"2026-06-25\",\"t\":\"titre\",\"proj\":\"Newsletters\",\"type\":\"newsletter\"}]} sinon rien.\n\nTu es MADISON, experte Mailchimp. Tu produis : objets email (45 car. max), preheaders, contenus par blocs, CTA, segmentation. Style prestige MZ.",
  agenda: "Tu travailles pour Lea Debar, Chargee Marketing Digital chez Michael Zingraf Real Estate (Christie's International Real Estate), agence immobilier de luxe Riviera et Provence, 14 agences.\nProjets : MZ Real Estate (vente prestige), MZ Rentals (location luxe), Newsletters (80k contacts Mailchimp).\nOutils : Mailchimp, Apimo, Google Analytics, portails SeLoger Prestige / Belles Demeures / JamesEdition.\nRegles : reponds en francais naturel, ZERO markdown. Si tu identifies des taches/dates, ajoute a la fin sur une seule ligne : {\"tasks\":[{\"text\":\"X\",\"proj\":\"MZ Real Estate\",\"deadline\":\"2026-06-25\",\"who\":\"lea\"}],\"dates\":[{\"d\":\"2026-06-25\",\"t\":\"titre\",\"proj\":\"Newsletters\",\"type\":\"newsletter\"}]} sinon rien.\n\nTu es TAYLOR, assistante planning et agenda. Quand on te colle un email ou une demande : 1) extrais TOUTES les taches demandees avec leurs deadlines exactes 2) classe-les par priorite 3) formule chaque tache de facon actionnable et precise. Tu ne rates aucune deadline, tu identifies les urgences. Sois exhaustive.",
  mails: "Tu travailles pour Lea Debar, Chargee Marketing Digital chez Michael Zingraf Real Estate (Christie's International Real Estate), agence immobilier de luxe Riviera et Provence, 14 agences.\nProjets : MZ Real Estate (vente prestige), MZ Rentals (location luxe), Newsletters (80k contacts Mailchimp).\nOutils : Mailchimp, Apimo, Google Analytics, portails SeLoger Prestige / Belles Demeures / JamesEdition.\nRegles : reponds en francais naturel, ZERO markdown. Si tu identifies des taches/dates, ajoute a la fin sur une seule ligne : {\"tasks\":[{\"text\":\"X\",\"proj\":\"MZ Real Estate\",\"deadline\":\"2026-06-25\",\"who\":\"lea\"}],\"dates\":[{\"d\":\"2026-06-25\",\"t\":\"titre\",\"proj\":\"Newsletters\",\"type\":\"newsletter\"}]} sinon rien.\n\nTu es OLIVIA, experte communication professionnelle luxe. Tu rediges/corriges/ameliores les mails. Tu produis l'email complet pret a copier avec objet. Ton MZ : professionnel, prestige, assertif.",
  ppt: "Tu travailles pour Lea Debar, Chargee Marketing Digital chez Michael Zingraf Real Estate (Christie's International Real Estate), agence immobilier de luxe Riviera et Provence, 14 agences.\nProjets : MZ Real Estate (vente prestige), MZ Rentals (location luxe), Newsletters (80k contacts Mailchimp).\nOutils : Mailchimp, Apimo, Google Analytics, portails SeLoger Prestige / Belles Demeures / JamesEdition.\nRegles : reponds en francais naturel, ZERO markdown. Si tu identifies des taches/dates, ajoute a la fin sur une seule ligne : {\"tasks\":[{\"text\":\"X\",\"proj\":\"MZ Real Estate\",\"deadline\":\"2026-06-25\",\"who\":\"lea\"}],\"dates\":[{\"d\":\"2026-06-25\",\"t\":\"titre\",\"proj\":\"Newsletters\",\"type\":\"newsletter\"}]} sinon rien.\n\nTu es SOPHIA, experte presentations PPT/Canva. Tu produis : plan detaille slide par slide + tous les textes. Style MZ : epure, rouge et blanc.",
  data: "Tu travailles pour Lea Debar, Chargee Marketing Digital chez Michael Zingraf Real Estate (Christie's International Real Estate), agence immobilier de luxe Riviera et Provence, 14 agences.\nProjets : MZ Real Estate (vente prestige), MZ Rentals (location luxe), Newsletters (80k contacts Mailchimp).\nOutils : Mailchimp, Apimo, Google Analytics, portails SeLoger Prestige / Belles Demeures / JamesEdition.\nRegles : reponds en francais naturel, ZERO markdown. Si tu identifies des taches/dates, ajoute a la fin sur une seule ligne : {\"tasks\":[{\"text\":\"X\",\"proj\":\"MZ Real Estate\",\"deadline\":\"2026-06-25\",\"who\":\"lea\"}],\"dates\":[{\"d\":\"2026-06-25\",\"t\":\"titre\",\"proj\":\"Newsletters\",\"type\":\"newsletter\"}]} sinon rien.\n\nTu es BROOKLYN, experte data et analyse. Tu analyses stats Mailchimp, portails, GA. Tu produis : syntheses chiffrees, tableaux en texte, recommandations. Tu peux aussi generer des bilans hebdomadaires sur demande.",
  strategie: "Tu travailles pour Lea Debar, Chargee Marketing Digital chez Michael Zingraf Real Estate (Christie's International Real Estate), agence immobilier de luxe Riviera et Provence, 14 agences.\nProjets : MZ Real Estate (vente prestige), MZ Rentals (location luxe), Newsletters (80k contacts Mailchimp).\nOutils : Mailchimp, Apimo, Google Analytics, portails SeLoger Prestige / Belles Demeures / JamesEdition.\nRegles : reponds en francais naturel, ZERO markdown. Si tu identifies des taches/dates, ajoute a la fin sur une seule ligne : {\"tasks\":[{\"text\":\"X\",\"proj\":\"MZ Real Estate\",\"deadline\":\"2026-06-25\",\"who\":\"lea\"}],\"dates\":[{\"d\":\"2026-06-25\",\"t\":\"titre\",\"proj\":\"Newsletters\",\"type\":\"newsletter\"}]} sinon rien.\n\nTu es VICTORIA, Directrice Strategie Marketing luxe. Tu produis : analyses strategiques, plans d'action priorises, recommandations positionnement digital MZ.",
}

const BRIEF_P = "Tu travailles pour Lea Debar, Chargee Marketing Digital chez Michael Zingraf Real Estate (Christie's International Real Estate), agence immobilier de luxe Riviera et Provence, 14 agences.\nProjets : MZ Real Estate (vente prestige), MZ Rentals (location luxe), Newsletters (80k contacts Mailchimp).\nOutils : Mailchimp, Apimo, Google Analytics, portails SeLoger Prestige / Belles Demeures / JamesEdition.\nRegles : reponds en francais naturel, ZERO markdown. Si tu identifies des taches/dates, ajoute a la fin sur une seule ligne : {\"tasks\":[{\"text\":\"X\",\"proj\":\"MZ Real Estate\",\"deadline\":\"2026-06-25\",\"who\":\"lea\"}],\"dates\":[{\"d\":\"2026-06-25\",\"t\":\"titre\",\"proj\":\"Newsletters\",\"type\":\"newsletter\"}]} sinon rien.\n\nTu coordonnes Ashley (SEO), Lauren (Blog), Madison (Newsletter), Taylor (Agenda), Olivia (Mails), Sophia (PPT), Brooklyn (Data), Victoria (Strategie). Format : Ashley : [2-3 phrases]\\n\\nLauren : [2-3 phrases]... ZERO markdown, uniquement ces 8 prenoms."

function getSC(status: string) {
  return STATUS_CONFIG[status as TaskStatus] || STATUS_CONFIG['todo']
}

const TASK_TEMPLATES = [
  { name: 'Cycle Newsletter', tasks: [
    { text: 'Définir le sujet et les biens à mettre en avant', proj: 'Newsletters' },
    { text: 'Rédiger le contenu newsletter', proj: 'Newsletters' },
    { text: 'Créer le template Mailchimp', proj: 'Newsletters' },
    { text: 'Test envoi sur adresse de test', proj: 'Newsletters' },
    { text: 'Envoi final à la base', proj: 'Newsletters' },
    { text: 'Analyse des stats 48h après', proj: 'Newsletters' },
  ]},
  { name: 'Bilan portails mensuel', tasks: [
    { text: 'Extraire stats SeLoger du mois', proj: 'MZ Real Estate' },
    { text: 'Extraire stats Belles Demeures du mois', proj: 'MZ Real Estate' },
    { text: 'Compiler leads par agence', proj: 'MZ Real Estate' },
    { text: 'Rédiger synthèse pour la direction', proj: 'MZ Real Estate' },
  ]},
  { name: 'Publication SEO', tasks: [
    { text: 'Briefer Ashley sur les mots-clés cibles', proj: 'MZ Rentals' },
    { text: 'Rédaction article / page SEO', proj: 'MZ Rentals' },
    { text: 'Intégration CMS + balises', proj: 'MZ Rentals' },
    { text: 'Mise en ligne + soumission GSC', proj: 'MZ Rentals' },
  ]},
]

function parseMsg(raw: string): { text: string; tasks: Task[]; dates: CalDate[] } {
  let text = raw, tasks: Task[] = [], dates: CalDate[] = []
  const j = raw.lastIndexOf('{"tasks"')
  if (j !== -1) {
    try {
      const p = JSON.parse(raw.slice(j))
      tasks = Array.isArray(p.tasks) ? p.tasks : []
      dates = Array.isArray(p.dates) ? p.dates : []
      text = raw.slice(0, j).trim()
    } catch {}
  }
  text = text.replace(/\*\*(.+?)\*\*/g,'$1').replace(/^#{1,4}\s+/gm,'').replace(/^\|.+\|$/gm,'').replace(/^[-|=]+$/gm,'').replace(/^\s*[-*]\s+/gm,'').replace(/\n{3,}/g,'\n\n').trim()
  return { text, tasks, dates }
}

function fd(d: string) {
  try { return new Date(d+'T00:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'}) } catch { return d }
}

function getWeek(off=0) {
  const t=new Date(), day=t.getDay(), m=new Date(t)
  m.setDate(t.getDate()-(day===0?6:day-1)+off*4)
  return Array.from({length:28},(_,i)=>{const d=new Date(m);d.setDate(m.getDate()+i);return d})
}

const DAYS=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

function tc(type:string) {
  if(type==='newsletter') return {bg:'#F3E5F5',color:'#4A148C',border:'#CE93D8'}
  if(type==='deadline') return {bg:'#FFEBEE',color:RED,border:'#EF9A9A'}
  if(type==='rdv') return {bg:'#E3F2FD',color:BLUE,border:'#90CAF9'}
  return {bg:'#FFF3E0',color:'#E65100',border:'#FFCC80'}
}

const C=(x:React.CSSProperties)=>x
const F="'Inter','Helvetica Neue',sans-serif"
const FE="'Inter','Helvetica Neue',Arial,sans-serif"

export default function MZHub() {
  const [auth,setAuth]=useState(false)
  const [pwd,setPwd]=useState('')
  const [pwdErr,setPwdErr]=useState(false)
  const [view,setView]=useState<View>('dashboard')
  const [ae,setAe]=useState<EId|null>(null)
  const [hist,setHist]=useState<Record<EId,Msg[]>>(()=>{
    try{if(typeof window==='undefined')return{seo:[],blog:[],newsletter:[],agenda:[],mails:[],ppt:[],data:[],strategie:[]};const s=localStorage.getItem('mz_hist');return s?JSON.parse(s):{seo:[],blog:[],newsletter:[],agenda:[],mails:[],ppt:[],data:[],strategie:[]}}catch{return{seo:[],blog:[],newsletter:[],agenda:[],mails:[],ppt:[],data:[],strategie:[]}}
  })
  const [inp,setInp]=useState('')
  const [file,setFile]=useState<File|null>(null)
  const [fileLoading,setFileLoading]=useState(false)
  const fileRef=useRef<HTMLInputElement>(null)
  const [load,setLoad]=useState(false)
  const [bt,setBt]=useState('')
  const [bmsgs,setBmsgs]=useState<{role:'user'|'assistant';content:string;ts:string}[]>(()=>{
    try{if(typeof window==='undefined')return[];const s=localStorage.getItem('mz_bmsgs');return s?JSON.parse(s):[]}catch{return[]}
  })
  const [bl,setBl]=useState(false)
  const [tasks,setTasks]=useState<KTask[]>(()=>{
    try{
      if(typeof window==='undefined')return[]
      const s=localStorage.getItem('mz_tasks')
      if(!s)return[]
      const parsed=JSON.parse(s)
      // Migrate old format: done boolean -> status string
      return parsed.map((t: KTask & {done?: boolean})=>({...t, status: (t.status==='done'||t.done)?'done':'todo'}))
    }catch{return[]}
  })
  const [cal,setCal]=useState<CalDate[]>(()=>{
    try{if(typeof window==='undefined')return[];const s=localStorage.getItem('mz_cal');return s?JSON.parse(s):[]}catch{return[]}
  })
  const [taskNotes,setTaskNotes]=useState<Record<string,string>>(()=>{
    try{if(typeof window==='undefined')return{};const s=localStorage.getItem('mz_notes');return s?JSON.parse(s):{}}catch{return{}}
  })
  const [expandedTaskId,setExpandedTaskId]=useState<string|null>(null)
  const [editTaskId,setEditTaskId]=useState<string|null>(null)
  const [editTaskText,setEditTaskText]=useState('')
  const [editCalIdx,setEditCalIdx]=useState<number|null>(null)
  const [editCalText,setEditCalText]=useState('')
  const [editCalDate,setEditCalDate]=useState('')
  const [showAddTask,setShowAddTask]=useState(false)
  const [newTaskText,setNewTaskText]=useState('')
  const [newTaskProj,setNewTaskProj]=useState('MZ Real Estate')
  const [newTaskDeadline,setNewTaskDeadline]=useState('')
  const [showAddCal,setShowAddCal]=useState(false)
  const [newCalText,setNewCalText]=useState('')
  const [newCalDate,setNewCalDate]=useState('')
  const [newCalType,setNewCalType]=useState<'deadline'|'newsletter'|'rdv'|'task'>('task')
  const [newCalProj,setNewCalProj]=useState('MZ Real Estate')
  const [woff,setWoff]=useState(0)
  const [ap,setAp]=useState<string|null>(null)
  const [searchQ,setSearchQ]=useState('')
  const [emailText,setEmailText]=useState('')
  const [emailLoading,setEmailLoading]=useState(false)
  const [emailResult,setEmailResult]=useState('')
  const [showTemplate,setShowTemplate]=useState(false)
  const [time,setTime]=useState('')
  const chatEnd=useRef<HTMLDivElement>(null)
  const bEnd=useRef<HTMLDivElement>(null)
  const iRef=useRef<HTMLInputElement>(null)
  const bFileRef=useRef<HTMLInputElement>(null)

  useEffect(()=>{const f=()=>setTime(new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}));f();const t=setInterval(f,1000);return()=>clearInterval(t)},[])
  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:'smooth'})},[hist,load])
  useEffect(()=>{bEnd.current?.scrollIntoView({behavior:'smooth'})},[bmsgs,bl])
  useEffect(()=>{try{localStorage.setItem('mz_hist',JSON.stringify(hist))}catch{}},[hist])
  useEffect(()=>{try{localStorage.setItem('mz_bmsgs',JSON.stringify(bmsgs))}catch{}},[bmsgs])
  useEffect(()=>{try{localStorage.setItem('mz_tasks',JSON.stringify(tasks))}catch{}},[tasks])
  useEffect(()=>{try{localStorage.setItem('mz_cal',JSON.stringify(cal))}catch{}},[cal])
  useEffect(()=>{try{localStorage.setItem('mz_notes',JSON.stringify(taskNotes))}catch{}},[taskNotes])

  const ex=ae?EX[ae]:null
  const msgs=ae?hist[ae]:[]
  const today=new Date().toISOString().split('T')[0]
  const week=getWeek(woff)

  const todayTasks = tasks.filter(t=>t.status!=='done'&&t.deadline===today)

  const addFromResponse=useCallback((tks:Task[],dts:CalDate[],src?:string)=>{
    if(tks.length>0){const n=Date.now();setTasks(p=>[...p,...tks.map((t,i)=>({id:'a_'+n+'_'+i,text:t.text,proj:t.proj||'MZ Real Estate',deadline:t.deadline,status:'todo' as TaskStatus,source:src}))])}
    if(dts.length>0) setCal(p=>[...p,...dts])
  },[])

  const saveNote=(id:string,note:string)=>setTaskNotes(prev=>({...prev,[id]:note}))
  const deleteTask=(id:string)=>setTasks(p=>p.filter(t=>t.id!==id))
  const startEditTask=(t:KTask)=>{setEditTaskId(t.id);setEditTaskText(t.text)}
  const saveEditTask=()=>{if(!editTaskText.trim())return;setTasks(p=>p.map(t=>t.id===editTaskId?{...t,text:editTaskText}:t));setEditTaskId(null);setEditTaskText('')}
  const deleteCalItem=(idx:number)=>setCal(p=>p.filter((_,i)=>i!==idx))
  const startEditCal=(idx:number,item:CalDate)=>{setEditCalIdx(idx);setEditCalText(item.t);setEditCalDate(item.d)}
  const saveEditCal=()=>{if(!editCalText.trim())return;setCal(p=>p.map((item,i)=>i===editCalIdx?{...item,t:editCalText,d:editCalDate}:item));setEditCalIdx(null);setEditCalText('')}
  const cycleStatus=(id:string)=>{
    setTasks(p=>p.map(t=>t.id===id?{...t,status:t.status==='done'?'todo':'done'}:t))
  }

  const addTask=()=>{
    if(!newTaskText.trim())return
    setTasks(p=>[...p,{id:'manual_'+Date.now(),text:newTaskText,proj:newTaskProj,deadline:newTaskDeadline||undefined,status:'todo' as TaskStatus,source:'manuel'}])
    setNewTaskText('');setNewTaskDeadline('');setShowAddTask(false)
  }

  const addCalItem=()=>{
    if(!newCalText.trim()||!newCalDate)return
    setCal(p=>[...p,{d:newCalDate,t:newCalText,proj:newCalProj,type:newCalType}])
    setNewCalText('');setNewCalDate('');setShowAddCal(false)
  }

  const applyTemplate=(tpl:typeof TASK_TEMPLATES[0])=>{
    const n=Date.now()
    const newTasks=tpl.tasks.map((t,i)=>({id:'tpl_'+n+'_'+i,text:t.text,proj:t.proj,status:'todo' as TaskStatus,source:'template:'+tpl.name}))
    setTasks(p=>[...p,...newTasks])
    setShowTemplate(false)
  }

  const resetAll=()=>{
    if(!confirm('Effacer toutes les données ?'))return
    setHist({seo:[],blog:[],newsletter:[],agenda:[],mails:[],ppt:[],data:[],strategie:[]})
    setBmsgs([]);setTasks([]);setCal([]);setTaskNotes({});setEmailResult('')
    try{['mz_hist','mz_bmsgs','mz_tasks','mz_cal','mz_notes'].forEach(k=>localStorage.removeItem(k))}catch{}
  }

  // Search
  const searchResults = searchQ.trim().length > 1 ? [
    ...tasks.filter(t=>t.text.toLowerCase().includes(searchQ.toLowerCase())||(taskNotes[t.id]||'').toLowerCase().includes(searchQ.toLowerCase())).map(t=>({type:'task',text:t.text,sub:t.proj,id:t.id})),
    ...cal.filter(c=>c.t.toLowerCase().includes(searchQ.toLowerCase())).map(c=>({type:'cal',text:c.t,sub:fd(c.d),id:c.d+c.t})),
    ...(Object.keys(hist) as EId[]).flatMap(id=>hist[id].filter(m=>m.content.toLowerCase().includes(searchQ.toLowerCase())).map(m=>({type:'msg',text:m.content.slice(0,60)+'...',sub:EX[id].name+' · '+m.ts,id:id+'_'+m.ts}))),
  ] : []

  // Email → Taylor
  const analyzeEmail=useCallback(async()=>{
    if(!emailText.trim()||emailLoading)return
    setEmailLoading(true);setEmailResult('')
    try{
      const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:PERSONAS['agenda'],messages:[{role:'user',content:'Voici un email recu. Extrais toutes les taches demandees, deadlines, et actions a faire de facon exhaustive :\n\n'+emailText}]})})
      const d=await r.json()
      const{text:clean,tasks:tks,dates:dts}=parseMsg(d.content||'')
      setEmailResult(clean)
      if(tks.length>0||dts.length>0) addFromResponse(tks,dts,'Taylor (email)')
    }catch{setEmailResult('Erreur de connexion.')}
    setEmailLoading(false)
  },[emailText,emailLoading,addFromResponse])

  // Extract text from file for API
  async function extractText(f:File):Promise<string>{
    const name=f.name.toLowerCase()
    if(name.endsWith('.txt')||name.endsWith('.md')||name.endsWith('.csv')||name.endsWith('.json')||name.endsWith('.html')){
      return await f.text()
    }
    return new Promise(res=>{
      const reader=new FileReader()
      reader.onload=()=>res(reader.result as string)
      reader.readAsDataURL(f)
    })
  }

  function buildMessages(msgs:Msg[],fileContent?:string,userText?:string):{role:string;content:string|{type:string;[key:string]:unknown}[]}[]{
    const result:{role:string;content:string|{type:string;[key:string]:unknown}[]}[]=msgs.slice(0,-1).map(m=>({role:m.role,content:m.content as string}))
    if(!fileContent){result.push({role:'user',content:userText||''});return result}
    if(fileContent.startsWith('__PDF_BASE64__:')){
      const b64=fileContent.replace('__PDF_BASE64__:','').replace(':__END_PDF__','')
      result.push({role:'user',content:[
        {type:'document',source:{type:'base64',media_type:'application/pdf',data:b64}},
        {type:'text',text:userText||'Analyse ce document.'}
      ]})
    } else if(fileContent.startsWith('data:image/')){
      const b64=fileContent.split(',')[1]
      const mt=fileContent.split(';')[0].replace('data:','')
      result.push({role:'user',content:[
        {type:'image',source:{type:'base64',media_type:mt,data:b64}},
        {type:'text',text:userText||'Analyse cette image.'}
      ]})
    } else {
      result.push({role:'user',content:(userText||'')+'\n\nContenu du fichier :\n'+fileContent})
    }
    return result
  }

  const send=useCallback(async(ov?:string)=>{
    const txt=ov||inp
    if((!txt.trim()&&!file)||!ae||load)return
    const ts=new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
    const displayText=txt+(file?' 📎 '+file.name:'')
    const up=[...hist[ae],{role:'user' as const,content:displayText,ts}]
    setHist(h=>({...h,[ae]:up}));setInp('');setLoad(true)
    const currentFile=file;setFile(null)
    try{
      let fileContent:string|undefined
      if(currentFile){
        setFileLoading(true)
        if(currentFile.type==='application/pdf'){
          const b64=await new Promise<string>(res=>{const r=new FileReader();r.onload=()=>res((r.result as string).split(',')[1]);r.readAsDataURL(currentFile)})
          fileContent='__PDF_BASE64__:'+b64+':__END_PDF__'
        } else if(currentFile.type.startsWith('image/')){
          fileContent=await new Promise<string>(res=>{const r=new FileReader();r.onload=()=>res(r.result as string);r.readAsDataURL(currentFile)})
        } else {
          fileContent=await extractText(currentFile)
        }
        setFileLoading(false)
      }
      const apiMessages=buildMessages(up,fileContent,txt)
      const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:PERSONAS[ae],messages:apiMessages})})
      const d=await r.json()
      const{text:clean,tasks:tks,dates:dts}=parseMsg(d.content||'')
      const rts=new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
      setHist(h=>({...h,[ae]:[...up,{role:'assistant',content:clean,ts:rts,tasks:tks,dates:dts}]}))
      if(tks.length>0||dts.length>0) addFromResponse(tks,dts,EX[ae].name)
    }catch{
      setHist(h=>({...h,[ae]:[...up,{role:'assistant',content:'Erreur de connexion.',ts:''}]}))
    }
    setLoad(false);setTimeout(()=>iRef.current?.focus(),100)
  },[inp,ae,load,hist,file,fileLoading,addFromResponse])

  const sendB=useCallback(async()=>{
    if(!bt.trim()||bl)return
    const ts=new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
    const up=[...bmsgs,{role:'user' as const,content:bt,ts}]
    setBmsgs(up);setBt('');setBl(true)
    try{
      const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:BRIEF_P,messages:up.map(m=>({role:m.role,content:m.content}))})})
      const d=await r.json()
      const clean=(d.content||'').replace(/\*\*(.+?)\*\*/g,'$1').replace(/^#{1,4}\s+/gm,'').replace(/^\s*[-*]\s+/gm,'').trim()
      setBmsgs(p=>[...p,{role:'assistant',content:clean,ts:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}])
    }catch{setBmsgs(p=>[...p,{role:'assistant',content:'Erreur.',ts:''}])}
    setBl(false)
  },[bt,bl,bmsgs])

  const openE=(id:EId)=>{setAe(id);setView('chat');setTimeout(()=>iRef.current?.focus(),150)}

  // ── LOGIN ──
  if(!auth) return (
    <>
      <Head><title>MZ Hub — Accès restreint</title><style dangerouslySetInnerHTML={{__html:FCSS}}/></Head>
      <div style={C({display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',background:'#1A1A1A',fontFamily:F})}>
        <div style={C({background:WHITE,borderRadius:4,padding:'40px 48px',width:380,boxShadow:'0 8px 40px rgba(0,0,0,0.3)',textAlign:'center'})}>
          <img src={LOGO} alt="MZ" style={C({width:56,height:56,borderRadius:4,margin:'0 auto 20px',display:'block'})}/>
          <div style={C({fontFamily:FE,fontSize:13,color:RED,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:4})}>MICHAËL ZINGRAF</div>
          <div style={C({fontFamily:F,fontSize:10,color:TEXT3,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:28})}>Hub Marketing — Accès restreint</div>
          <input type="password" value={pwd} onChange={e=>{setPwd(e.target.value);setPwdErr(false)}}
            onKeyDown={e=>{if(e.key==='Enter'){if(pwd==='MZHub2026!')setAuth(true);else setPwdErr(true)}}}
            placeholder="Mot de passe" autoFocus
            style={C({width:'100%',padding:'11px 14px',fontSize:13,fontFamily:F,border:'1px solid '+(pwdErr?RED:BORDER),borderRadius:3,color:TEXT,outline:'none',marginBottom:10,boxSizing:'border-box' as const})}/>
          {pwdErr&&<div style={C({fontSize:12,color:RED,marginBottom:10,fontFamily:F})}>Mot de passe incorrect</div>}
          <button onClick={()=>{if(pwd==='MZHub2026!')setAuth(true);else setPwdErr(true)}}
            style={C({width:'100%',padding:'11px',fontSize:12,fontWeight:500,background:RED,color:WHITE,border:'none',borderRadius:3,cursor:'pointer',fontFamily:FE,letterSpacing:'0.08em',textTransform:'uppercase'})}>
            Accéder
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Head><title>MZ Hub — Léa Debar</title><style dangerouslySetInnerHTML={{__html:FCSS}}/></Head>
      <div style={C({display:'flex',height:'100vh',overflow:'hidden',fontFamily:F,background:'#F8F8F8',color:TEXT})}>

        {/* SIDEBAR */}
        <aside style={C({width:224,background:RED,display:'flex',flexDirection:'column',flexShrink:0,boxShadow:'2px 0 16px rgba(200,16,46,0.18)'})}>
          <div style={C({padding:'20px 16px 16px',borderBottom:'1px solid rgba(255,255,255,0.12)'})}>
            <img src={LOGO} alt="MZ" style={C({width:48,height:48,borderRadius:3,display:'block',marginBottom:10})}/>
            <div style={C({fontFamily:FE,fontSize:11,color:WHITE,letterSpacing:'0.1em',textTransform:'uppercase',opacity:0.92})}>MICHAËL ZINGRAF</div>
            <div style={C({fontFamily:F,fontSize:8,color:'rgba(255,255,255,0.5)',letterSpacing:'0.08em',textTransform:'uppercase',marginTop:2})}>Christie&apos;s Int&apos;l Real Estate</div>
            <div style={C({marginTop:8,height:'0.5px',background:'rgba(255,255,255,0.18)'})}></div>
            <div style={C({marginTop:5,fontSize:8,color:'rgba(255,255,255,0.38)',letterSpacing:'0.1em',textTransform:'uppercase',fontFamily:F})}>Hub Marketing Digital</div>
          </div>

          {/* Search */}
          <div style={C({padding:'10px 10px 0'})}>
            <div style={C({position:'relative'})}>
              <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                placeholder="🔍 Rechercher..."
                style={C({width:'100%',padding:'7px 10px',fontSize:11,fontFamily:F,background:'rgba(0,0,0,0.2)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:3,color:WHITE,outline:'none',boxSizing:'border-box' as const})}/>
              {searchQ&&<button onClick={()=>setSearchQ('')} style={C({position:'absolute',right:6,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:12})}>✕</button>}
            </div>
            {searchResults.length>0&&(
              <div style={C({background:WHITE,borderRadius:3,marginTop:4,boxShadow:'0 4px 12px rgba(0,0,0,0.15)',maxHeight:200,overflowY:'auto'})}>
                {searchResults.slice(0,8).map((r,i)=>(
                  <div key={i} onClick={()=>{setSearchQ('');if(r.type==='task'){setView('todo')}else if(r.type==='cal'){setView('calendrier')}else{setAe((r.id.split('_')[0]) as EId);setView('chat')}}}
                    style={C({padding:'7px 10px',borderBottom:'1px solid '+GREY2,cursor:'pointer',display:'flex',gap:8,alignItems:'flex-start'})}>
                    <span style={C({fontSize:9,padding:'1px 5px',borderRadius:3,background:r.type==='task'?'#FFF0F2':r.type==='cal'?'#E3F2FD':'#E8F5E9',color:r.type==='task'?RED:r.type==='cal'?BLUE:'#2E7D32',flexShrink:0,fontWeight:600,fontFamily:F})}>{r.type==='task'?'TÂCHE':r.type==='cal'?'CAL':'MSG'}</span>
                    <div><div style={C({fontSize:11,color:TEXT,lineHeight:1.3})}>{r.text}</div><div style={C({fontSize:10,color:TEXT3})}>{r.sub}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={C({padding:'8px 8px 4px',marginTop:4})}>
            <div style={C({fontSize:8,color:'rgba(255,255,255,0.32)',letterSpacing:'0.18em',textTransform:'uppercase',padding:'0 8px',marginBottom:4,fontFamily:F})}>NAVIGATION</div>
            {([
              {v:'dashboard' as View,l:'Dashboard',icon:'⌂'},
              {v:'email' as View,l:'Coller un email',icon:'✉'},
              {v:'chat' as View,l:'Mon équipe',icon:'◎'},
              {v:'todo' as View,l:'Tâches',icon:'✓'},
              {v:'calendrier' as View,l:'Calendrier',icon:'◫'},
            ]).map(item=>(
              <button key={item.v} onClick={()=>{setView(item.v);if(item.v!=='chat')setAe(null)}} style={C({
                display:'flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:4,cursor:'pointer',
                fontSize:12,fontFamily:F,border:'none',width:'100%',textAlign:'left',
                background:view===item.v&&!ae?'rgba(255,255,255,0.15)':'none',
                color:view===item.v&&!ae?WHITE:'rgba(255,255,255,0.58)',
                fontWeight:view===item.v?500:400,
              })}>
                <span style={C({width:14,textAlign:'center',fontSize:11})}>{item.icon}</span>{item.l}
                {item.v==='email'&&<span style={C({marginLeft:'auto',fontSize:9,background:'rgba(255,255,255,0.2)',padding:'1px 5px',borderRadius:8,color:WHITE})}>Taylor</span>}
              </button>
            ))}
          </div>

          <div style={C({padding:'6px 8px 4px'})}>
            <div style={C({fontSize:8,color:'rgba(255,255,255,0.32)',letterSpacing:'0.18em',textTransform:'uppercase',padding:'0 8px',marginBottom:4,fontFamily:F})}>PROJETS</div>
            {Object.keys(PROJ).map(p=>(
              <button key={p} onClick={()=>{setView('todo');setAp(p)}} style={C({display:'flex',alignItems:'center',gap:8,padding:'5px 10px',borderRadius:4,cursor:'pointer',fontSize:11,fontFamily:F,border:'none',width:'100%',textAlign:'left',background:'none',color:'rgba(255,255,255,0.55)'})}>
                <span style={C({width:5,height:5,borderRadius:'50%',background:'rgba(255,255,255,0.5)',flexShrink:0})}></span>
                <span style={C({flex:1})}>{p}</span>
                <span style={C({fontSize:9,color:'rgba(255,255,255,0.3)',background:'rgba(0,0,0,0.12)',padding:'1px 5px',borderRadius:8})}>{tasks.filter(t=>t.proj===p&&t.status!=='done').length}</span>
              </button>
            ))}
          </div>

          <div style={C({padding:'6px 8px 4px'})}>
            <div style={C({fontSize:8,color:'rgba(255,255,255,0.32)',letterSpacing:'0.18em',textTransform:'uppercase',padding:'0 8px',marginBottom:4,fontFamily:F})}>ÉQUIPE</div>
            {(Object.keys(EX) as EId[]).map(id=>{
              const e=EX[id]
              return (
                <button key={id} onClick={()=>openE(id)} style={C({display:'flex',alignItems:'center',gap:8,padding:'5px 10px',borderRadius:4,cursor:'pointer',fontSize:11,fontFamily:F,border:'none',width:'100%',textAlign:'left',background:ae===id?'rgba(255,255,255,0.15)':'none',color:ae===id?WHITE:'rgba(255,255,255,0.55)'})}>
                  <div style={C({width:20,height:20,borderRadius:'50%',background:WHITE,display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,fontWeight:700,color:RED,flexShrink:0})}>{e.initials}</div>
                  {e.name}
                  {hist[id].length>0&&<span style={C({marginLeft:'auto',fontSize:9,color:WHITE,background:'rgba(0,0,0,0.2)',padding:'1px 5px',borderRadius:8})}>{hist[id].filter(m=>m.role==='assistant').length}</span>}
                </button>
              )
            })}
          </div>

          <div style={C({marginTop:'auto',padding:'10px 8px',borderTop:'1px solid rgba(255,255,255,0.1)'})}>
            <div style={C({display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:4,background:'rgba(0,0,0,0.15)'})}>
              <div style={C({width:26,height:26,borderRadius:'50%',background:WHITE,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:RED,flexShrink:0})}>L</div>
              <div style={C({flex:1})}>
                <div style={C({fontSize:11,fontWeight:500,color:WHITE,fontFamily:F})}>Léa Debar</div>
                <div style={C({fontSize:9,color:'rgba(255,255,255,0.45)'})}>Chargée Marketing Digital</div>
              </div>
              <button onClick={resetAll} title="Réinitialiser" style={C({background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',fontSize:12,padding:'2px'})}>↺</button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={C({flex:1,display:'flex',flexDirection:'column',overflow:'hidden'})}>
          {/* Topbar */}
          <div style={C({height:52,background:WHITE,borderBottom:'1px solid '+BORDER,display:'flex',alignItems:'center',padding:'0 24px',gap:12,flexShrink:0,boxShadow:'0 1px 4px rgba(0,0,0,0.04)'})}>
            <div style={C({fontFamily:FE,fontSize:13,color:DARK,flex:1,letterSpacing:'0.06em',textTransform:'uppercase'})}>
              {ae?EX[ae].name+' — '+EX[ae].title:view==='dashboard'?"Vue d'ensemble":view==='email'?'Email → Taylor (Agenda)':view==='chat'?'Mon équipe':view==='todo'?'Tâches & Projets':'Calendrier MZ'}
            </div>
            <div style={C({fontSize:11,color:TEXT3,fontVariantNumeric:'tabular-nums'})}>{time}</div>

            {ae&&<button onClick={()=>setHist(h=>({...h,[ae]:[]}))} style={C({padding:'4px 10px',fontSize:11,background:'none',border:'1px solid '+BORDER,borderRadius:3,color:TEXT3,cursor:'pointer',fontFamily:F})}>Effacer</button>}
            <button onClick={()=>{setView('chat');setAe(null)}} style={C({padding:'6px 16px',fontSize:11,fontWeight:500,background:RED,color:WHITE,border:'none',borderRadius:3,cursor:'pointer',fontFamily:FE,letterSpacing:'0.08em',textTransform:'uppercase'})}>+ Brief équipe</button>
          </div>

          <div style={C({flex:1,overflow:'hidden',display:'flex',flexDirection:'column'})}>

            {/* DASHBOARD */}
            {view==='dashboard'&&(
              <div style={C({flex:1,overflowY:'auto',padding:24})}>
                <div style={C({marginBottom:18})}>
                  <div style={C({fontSize:10,color:TEXT3,marginBottom:4,fontFamily:F,letterSpacing:'0.06em',textTransform:'uppercase'})}>{new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
                  <div style={C({fontFamily:FE,fontSize:22,color:DARK,letterSpacing:'0.04em',textTransform:'uppercase'})}>Bonjour, <span style={C({color:RED})}>Léa</span></div>
                </div>



                {/* Today tasks + mini week calendar */}
                <div style={C({display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16})}>
                  {/* Tâches du jour */}
                  <div style={C({background:WHITE,border:'1px solid '+BORDER,borderRadius:3,padding:'14px 16px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',borderTop:'2px solid '+RED})}>
                    <div style={C({display:'flex',alignItems:'center',marginBottom:10})}>
                      <div style={C({fontSize:9,fontWeight:600,color:TEXT3,textTransform:'uppercase',letterSpacing:'0.12em',flex:1,fontFamily:F})}>Tâches du jour · {new Date().toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}</div>
                      <span style={C({fontSize:11,color:todayTasks.length>0?RED:TEXT3,fontWeight:600,fontFamily:F})}>{todayTasks.length} tâche{todayTasks.length!==1?'s':''}</span>
                    </div>
                    {todayTasks.length===0 ? (
                      <div style={C({fontSize:13,color:TEXT3,textAlign:'center',padding:'20px 0',fontFamily:F})}>Aucune deadline aujourd&apos;hui 🎉</div>
                    ) : todayTasks.map(t=>{
                      const sc=getSC(t.status)
                      const pc=PROJ[t.proj]||PROJ['MZ Real Estate']
                      return (
                        <div key={t.id} style={C({display:'flex',alignItems:'flex-start',gap:8,padding:'7px 0',borderBottom:'1px solid '+GREY2})}>
                          <div style={C({width:4,height:'100%',minHeight:16,background:RED,borderRadius:2,flexShrink:0,marginTop:3})}></div>
                          <div style={C({flex:1})}>
                            <div style={C({fontSize:12,color:TEXT,lineHeight:1.4,fontFamily:F})}>{t.text}</div>
                            <div style={C({display:'flex',gap:6,marginTop:2})}>
                              <span style={C({fontSize:9,color:sc.color,background:sc.bg,padding:'1px 5px',borderRadius:3,border:'1px solid '+sc.border,fontFamily:F,cursor:'pointer'})} onClick={()=>cycleStatus(t.id)}>{sc.label}</span>
                              <span style={C({fontSize:9,color:pc.color,fontFamily:F})}>{t.proj}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Mini calendrier semaine */}
                  <div style={C({background:WHITE,border:'1px solid '+BORDER,borderRadius:3,padding:'14px 16px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',borderTop:'2px solid '+RED})}>
                    <div style={C({display:'flex',alignItems:'center',marginBottom:10})}>
                      <div style={C({fontSize:9,fontWeight:600,color:TEXT3,textTransform:'uppercase',letterSpacing:'0.12em',flex:1,fontFamily:F})}>Cette semaine</div>
                      <button onClick={()=>setView('calendrier')} style={C({fontSize:10,color:RED,background:'none',border:'none',cursor:'pointer',fontFamily:F})}>Voir tout →</button>
                    </div>
                    <div style={C({display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3})}>
                      {['L','M','M','J','V','S','D'].map((d,i)=><div key={i} style={C({fontSize:8,fontWeight:600,color:TEXT3,textAlign:'center',fontFamily:F,paddingBottom:3})}>{d}</div>)}
                      {getWeek(0).map((date,i)=>{
                        const dStr=date.toISOString().split('T')[0]
                        const isT=dStr===today
                        const dayItems=cal.filter(c=>c.d===dStr)
                        const dayTasks=tasks.filter(t=>t.deadline===dStr&&t.status!=='done')
                        return (
                          <div key={i} onClick={()=>setView('calendrier')} style={C({background:isT?'#FFF0F2':GREY,border:'1px solid '+(isT?RED:BORDER),borderRadius:3,padding:'4px 3px',minHeight:52,cursor:'pointer'})}>
                            <div style={C({fontSize:11,fontWeight:isT?700:400,color:isT?RED:DARK,textAlign:'center',fontFamily:FE,marginBottom:3})}>{date.getDate()}</div>
                            {dayItems.slice(0,2).map((item,j)=>{
                              const t=tc(item.type)
                              return <div key={j} style={C({fontSize:8,padding:'1px 3px',borderRadius:2,marginBottom:1,background:t.bg,color:t.color,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',lineHeight:1.4})}>{item.t}</div>
                            })}
                            {dayTasks.length>0&&<div style={C({fontSize:8,padding:'1px 3px',borderRadius:2,background:'#FFEBEE',color:RED,fontWeight:600})}>⚡{dayTasks.length}</div>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Email rapide + Équipe */}
                <div style={C({display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14})}>
                  <div style={C({background:WHITE,border:'1px solid '+BORDER,borderRadius:3,padding:'14px 16px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',borderTop:'2px solid '+RED})}>
                    <div style={C({fontSize:9,fontWeight:600,color:TEXT3,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:8,fontFamily:F,display:'flex',alignItems:'center',justifyContent:'space-between'})}>
                      <span>Coller un email → Taylor</span>
                      <button onClick={()=>setView('email')} style={C({fontSize:10,color:RED,background:'none',border:'none',cursor:'pointer',fontFamily:F})}>Voir tout →</button>
                    </div>
                    <textarea value={emailText} onChange={e=>setEmailText(e.target.value)}
                      placeholder="Colle ton email ici, Taylor extrait toutes les tâches..."
                      style={C({width:'100%',minHeight:80,padding:'7px 9px',fontSize:12,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none',resize:'none',lineHeight:1.5,boxSizing:'border-box' as const,marginBottom:8})}/>
                    <button onClick={analyzeEmail} disabled={emailLoading||!emailText.trim()}
                      style={C({width:'100%',padding:'8px',fontSize:11,fontWeight:500,background:emailLoading||!emailText.trim()?GREY2:RED,color:emailLoading||!emailText.trim()?TEXT3:WHITE,border:'none',borderRadius:3,cursor:emailLoading||!emailText.trim()?'not-allowed':'pointer',fontFamily:FE,letterSpacing:'0.06em',textTransform:'uppercase'})}>
                      {emailLoading?'Taylor analyse...':'Extraire les tâches'}
                    </button>
                    {emailResult&&<div style={C({marginTop:8,padding:'8px 10px',background:'#FAFAFA',border:'1px solid '+BORDER,borderLeft:'2px solid '+RED,borderRadius:3,fontSize:12,lineHeight:1.6,color:TEXT,fontFamily:F})}>{emailResult}</div>}
                  </div>
                  <div style={C({background:WHITE,border:'1px solid '+BORDER,borderRadius:3,padding:'14px 16px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'})}>
                    <div style={C({fontSize:9,fontWeight:600,color:TEXT3,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:10,fontFamily:F})}>Mon équipe</div>
                    <div style={C({display:'grid',gridTemplateColumns:'1fr 1fr',gap:6})}>
                      {(Object.keys(EX) as EId[]).map(id=>{
                        const e=EX[id]
                        return (
                          <div key={id} onClick={()=>openE(id)} style={C({display:'flex',alignItems:'center',gap:6,padding:'6px 8px',borderRadius:3,cursor:'pointer',border:'1px solid '+BORDER,background:'#FAFAFA'})}>
                            <div style={C({width:24,height:24,borderRadius:'50%',background:RED,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700,color:WHITE,flexShrink:0})}>{e.initials}</div>
                            <div style={C({minWidth:0})}>
                              <div style={C({fontSize:11,fontWeight:500,color:DARK,fontFamily:F})}>{e.name}</div>
                              <div style={C({fontSize:9,color:TEXT3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'})}>{e.title}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Tâches + Échéances */}
                <div style={C({display:'grid',gridTemplateColumns:'1fr 1fr',gap:14})}>
                  <div style={C({background:WHITE,border:'1px solid '+BORDER,borderRadius:3,padding:'14px 16px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'})}>
                    <div style={C({display:'flex',alignItems:'center',marginBottom:10})}>
                      <div style={C({fontSize:9,fontWeight:600,color:TEXT3,textTransform:'uppercase',letterSpacing:'0.12em',flex:1,fontFamily:F})}>Tâches prioritaires</div>
                      <button onClick={()=>setShowAddTask(v=>!v)} style={C({padding:'2px 8px',fontSize:11,background:showAddTask?GREY2:RED,color:showAddTask?TEXT3:WHITE,border:'none',borderRadius:3,cursor:'pointer',fontFamily:F})}>+ Ajouter</button>
                    </div>
                    {showAddTask&&(
                      <div style={C({marginBottom:10,padding:'10px',background:'#FAFAFA',border:'1px solid '+BORDER,borderRadius:3})}>
                        <input value={newTaskText} onChange={e=>setNewTaskText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTask()} placeholder="Intitulé..."
                          style={C({width:'100%',padding:'6px 8px',fontSize:12,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none',marginBottom:6,boxSizing:'border-box' as const})}/>
                        <div style={C({display:'flex',gap:6,marginBottom:6})}>
                          <select value={newTaskProj} onChange={e=>setNewTaskProj(e.target.value)} style={C({flex:1,padding:'5px 6px',fontSize:11,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none',background:WHITE})}>
                            {Object.keys(PROJ).map(p=><option key={p} value={p}>{p}</option>)}
                          </select>
                          <input type="date" value={newTaskDeadline} onChange={e=>setNewTaskDeadline(e.target.value)} style={C({flex:1,padding:'5px 6px',fontSize:11,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none'})}/>
                        </div>
                        <div style={C({display:'flex',gap:6})}>
                          <button onClick={addTask} style={C({flex:1,padding:'6px',fontSize:11,background:RED,color:WHITE,border:'none',borderRadius:3,cursor:'pointer',fontFamily:F,fontWeight:500})}>Ajouter</button>
                          <button onClick={()=>setShowAddTask(false)} style={C({padding:'6px 10px',fontSize:11,background:'none',border:'1px solid '+BORDER,borderRadius:3,cursor:'pointer',color:TEXT3,fontFamily:F})}>Annuler</button>
                        </div>
                      </div>
                    )}
                    {tasks.filter(t=>t.status!=='done').slice(0,6).map(t=>{
                      const pc=PROJ[t.proj]||PROJ['MZ Real Estate']
                      const sc=getSC(t.status)
                      return (
                        <div key={t.id} style={C({borderBottom:'1px solid '+GREY2})}>
                          <div style={C({display:'flex',alignItems:'flex-start',gap:8,padding:'6px 0'})}>
                            <div onClick={()=>cycleStatus(t.id)} style={C({width:13,height:13,border:'1.5px solid '+(t.status==='done'?RED:BORDER),background:t.status==='done'?RED:'transparent',borderRadius:2,flexShrink:0,marginTop:2,cursor:'pointer'})}></div>
                            <div style={C({flex:1,minWidth:0})}>
                              <div onClick={()=>setExpandedTaskId(expandedTaskId===t.id?null:t.id)} style={C({fontSize:12,color:TEXT,lineHeight:1.4,fontFamily:F,cursor:'pointer'})}>{t.text}</div>
                              <div style={C({display:'flex',gap:5,marginTop:2,alignItems:'center',flexWrap:'wrap'})}>
                                <span onClick={()=>cycleStatus(t.id)} style={C({fontSize:9,color:sc.color,background:sc.bg,padding:'1px 6px',borderRadius:3,border:'1px solid '+sc.border,fontFamily:F,cursor:'pointer'})}>{sc.label}</span>
                                <span style={C({fontSize:10,color:RED})}>{t.proj}</span>
                                {t.deadline&&<span style={C({fontSize:10,color:RED,fontWeight:500})}>⚡ {fd(t.deadline)}</span>}
                                {taskNotes[t.id]&&<span style={C({fontSize:10,color:BLUE})}>📝</span>}
                                <div style={C({marginLeft:'auto',display:'flex',gap:3})}>
                                  <button onClick={()=>setExpandedTaskId(expandedTaskId===t.id?null:t.id)} style={C({padding:'1px 4px',fontSize:10,background:expandedTaskId===t.id?BLUE_BG:'none',border:'1px solid '+(expandedTaskId===t.id?BLUE_BORDER:BORDER),borderRadius:2,cursor:'pointer',color:expandedTaskId===t.id?BLUE:TEXT3})}>📝</button>
                                  <button onClick={()=>deleteTask(t.id)} style={C({padding:'1px 4px',fontSize:10,background:'none',border:'1px solid '+BORDER,borderRadius:2,cursor:'pointer',color:TEXT3})}>✕</button>
                                </div>
                              </div>
                            </div>
                          </div>
                          {expandedTaskId===t.id&&(
                            <div style={C({margin:'0 0 8px 21px',padding:'8px 10px',background:'#FAFAFA',border:'1px solid '+BLUE_BORDER,borderLeft:'3px solid '+BLUE,borderRadius:'0 3px 3px 0'})}>
                              <textarea value={taskNotes[t.id]||''} onChange={e=>saveNote(t.id,e.target.value)}
                                placeholder={'Notes, références...\nEx : MZCA6408, MZIB0076'}
                                style={C({width:'100%',minHeight:56,padding:'6px 8px',fontSize:11,fontFamily:F,border:'1px solid #DCDCDC',borderRadius:3,color:TEXT,outline:'none',resize:'vertical',lineHeight:1.5,boxSizing:'border-box' as const})}/>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {tasks.filter(t=>t.status!=='done').length===0&&<div style={C({fontSize:12,color:TEXT3,textAlign:'center',padding:'16px 0',fontFamily:F})}>Aucune tâche en cours</div>}
                  </div>
                  <div style={C({background:WHITE,border:'1px solid '+BORDER,borderRadius:3,padding:'14px 16px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'})}>
                    <div style={C({display:'flex',alignItems:'center',marginBottom:10})}>
                      <div style={C({fontSize:9,fontWeight:600,color:TEXT3,textTransform:'uppercase',letterSpacing:'0.12em',flex:1,fontFamily:F})}>Prochaines échéances</div>
                      <button onClick={()=>setShowAddCal(v=>!v)} style={C({padding:'2px 8px',fontSize:11,background:showAddCal?GREY2:RED,color:showAddCal?TEXT3:WHITE,border:'none',borderRadius:3,cursor:'pointer',fontFamily:F})}>+ Ajouter</button>
                    </div>
                    {showAddCal&&(
                      <div style={C({marginBottom:10,padding:'10px',background:'#FAFAFA',border:'1px solid '+BORDER,borderRadius:3})}>
                        <input value={newCalText} onChange={e=>setNewCalText(e.target.value)} placeholder="Titre de l'événement..."
                          style={C({width:'100%',padding:'6px 8px',fontSize:12,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none',marginBottom:6,boxSizing:'border-box' as const})}/>
                        <div style={C({display:'flex',gap:6,marginBottom:6})}>
                          <input type="date" value={newCalDate} onChange={e=>setNewCalDate(e.target.value)} style={C({flex:1,padding:'5px 6px',fontSize:11,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none'})}/>
                          <select value={newCalType} onChange={e=>setNewCalType(e.target.value as 'deadline'|'newsletter'|'rdv'|'task')} style={C({flex:1,padding:'5px 6px',fontSize:11,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none',background:WHITE})}>
                            <option value="task">Tâche</option>
                            <option value="deadline">Deadline</option>
                            <option value="newsletter">Newsletter</option>
                            <option value="rdv">RDV</option>
                          </select>
                        </div>
                        <select value={newCalProj} onChange={e=>setNewCalProj(e.target.value)} style={C({width:'100%',padding:'5px 6px',fontSize:11,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none',background:WHITE,marginBottom:6,boxSizing:'border-box' as const})}>
                          {Object.keys(PROJ).map(p=><option key={p} value={p}>{p}</option>)}
                        </select>
                        <div style={C({display:'flex',gap:6})}>
                          <button onClick={addCalItem} style={C({flex:1,padding:'6px',fontSize:11,background:RED,color:WHITE,border:'none',borderRadius:3,cursor:'pointer',fontFamily:F,fontWeight:500})}>Ajouter</button>
                          <button onClick={()=>setShowAddCal(false)} style={C({padding:'6px 10px',fontSize:11,background:'none',border:'1px solid '+BORDER,borderRadius:3,cursor:'pointer',color:TEXT3,fontFamily:F})}>Annuler</button>
                        </div>
                      </div>
                    )}
                    {cal.filter(c=>c.d>=today).sort((a,b)=>a.d.localeCompare(b.d)).slice(0,6).map((c,i)=>{
                      const t=tc(c.type)
                      const globalIdx=cal.findIndex(item=>item.d===c.d&&item.t===c.t)
                      return (
                        <div key={i} style={C({display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid '+GREY2})}>
                          <span style={C({fontSize:10,fontWeight:600,color:t.color,background:t.bg,padding:'2px 7px',borderRadius:3,flexShrink:0,border:'1px solid '+t.border,fontFamily:F})}>{fd(c.d)}</span>
                          <span style={C({fontSize:12,color:TEXT,fontFamily:F,flex:1})}>{c.t}</span>
                          <button onClick={()=>deleteCalItem(globalIdx)} style={C({padding:'1px 5px',fontSize:10,background:'none',border:'none',cursor:'pointer',color:TEXT3,flexShrink:0})}>✕</button>
                        </div>
                      )
                    })}
                    {cal.filter(c=>c.d>=today).length===0&&<div style={C({fontSize:12,color:TEXT3,textAlign:'center',padding:'16px 0',fontFamily:F})}>Aucune échéance</div>}
                  </div>
                </div>
              </div>
            )}

            {/* EMAIL → TAYLOR */}
            {view==='email'&&(
              <div style={C({flex:1,overflowY:'auto',padding:24})}>
                <div style={C({fontFamily:FE,fontSize:18,color:DARK,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:4})}>Coller un email <span style={C({color:RED})}>→ Taylor</span></div>
                <div style={C({fontSize:12,color:TEXT3,fontFamily:F,marginBottom:16})}>Taylor extrait automatiquement toutes les tâches, deadlines et actions — et les ajoute à ton kanban.</div>
                <div style={C({background:WHITE,border:'1px solid '+BORDER,borderRadius:3,padding:'16px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',borderTop:'2px solid '+RED,marginBottom:14})}>
                  <textarea value={emailText} onChange={e=>setEmailText(e.target.value)}
                    placeholder="Colle ici le contenu complet de l'email reçu..."
                    style={C({width:'100%',minHeight:180,padding:'10px 12px',fontSize:13,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none',resize:'vertical',lineHeight:1.7,boxSizing:'border-box' as const,marginBottom:10})}/>
                  <div style={C({display:'flex',gap:8})}>
                    <button onClick={analyzeEmail} disabled={emailLoading||!emailText.trim()}
                      style={C({flex:1,padding:'10px',fontSize:12,fontWeight:500,background:emailLoading||!emailText.trim()?GREY2:RED,color:emailLoading||!emailText.trim()?TEXT3:WHITE,border:'none',borderRadius:3,cursor:emailLoading||!emailText.trim()?'not-allowed':'pointer',fontFamily:FE,letterSpacing:'0.08em',textTransform:'uppercase'})}>
                      {emailLoading?'Taylor analyse...':'Extraire les tâches et deadlines'}
                    </button>
                    <button onClick={()=>{setEmailText('');setEmailResult('')}} style={C({padding:'10px 14px',fontSize:11,background:'none',border:'1px solid '+BORDER,borderRadius:3,cursor:'pointer',color:TEXT3,fontFamily:F})}>Effacer</button>
                  </div>
                </div>
                {emailResult&&(
                  <div style={C({background:WHITE,border:'1px solid '+BORDER,borderRadius:3,padding:'16px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',borderLeft:'3px solid '+RED})}>
                    <div style={C({fontSize:9,fontWeight:700,color:RED,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10,fontFamily:FE})}>Analyse de Taylor</div>
                    <div style={C({fontSize:13,lineHeight:1.8,color:TEXT,fontFamily:F,whiteSpace:'pre-wrap'})}>{emailResult}</div>
                    <div style={C({marginTop:12,padding:'8px 10px',background:'#E8F5E9',border:'1px solid #A5D6A7',borderRadius:3,fontSize:11,color:'#2E7D32',fontFamily:F})}>✓ Les tâches et dates identifiées ont été automatiquement ajoutées à ton kanban et calendrier.</div>
                  </div>
                )}
              </div>
            )}

            {/* CHAT ÉQUIPE */}
            {view==='chat'&&!ae&&(
              <div style={C({flex:1,display:'flex',flexDirection:'column',overflow:'hidden'})}>
                <div style={C({padding:'14px 24px 10px',flexShrink:0})}>
                  <div style={C({fontFamily:FE,fontSize:15,color:DARK,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:10})}>Mon équipe <span style={C({color:RED})}>MZ</span></div>
                  <div style={C({display:'flex',gap:8,flexWrap:'wrap'})}>
                    {(Object.keys(EX) as EId[]).map(id=>{
                      const e=EX[id]
                      return (
                        <div key={id} onClick={()=>openE(id)} style={C({display:'flex',alignItems:'center',gap:8,padding:'6px 12px',background:WHITE,border:'1px solid '+BORDER,borderRadius:3,cursor:'pointer'})}>
                          <div style={C({width:26,height:26,borderRadius:'50%',background:RED,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700,color:WHITE,flexShrink:0})}>{e.initials}</div>
                          <div>
                            <div style={C({fontSize:12,fontWeight:500,color:RED,fontFamily:F})}>{e.name}</div>
                            <div style={C({fontSize:9,color:TEXT3,fontFamily:F})}>{e.title}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div style={C({flex:1,display:'flex',flexDirection:'column',overflow:'hidden',margin:'0 24px 24px',background:WHITE,border:'1px solid '+BORDER,borderRadius:3})}>
                  <div style={C({padding:'11px 16px',borderBottom:'1px solid '+BORDER,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'space-between'})}>
                    <div>
                      <div style={C({fontSize:12,fontWeight:500,color:DARK,fontFamily:F})}>Briefing équipe</div>
                      <div style={C({fontSize:10,color:TEXT3,fontFamily:F})}>Ashley · Lauren · Madison · Taylor · Olivia · Sophia · Brooklyn · Victoria</div>
                    </div>
                    {bmsgs.length>0&&<button onClick={()=>setBmsgs([])} style={C({padding:'3px 10px',fontSize:11,background:'none',border:'1px solid '+BORDER,borderRadius:3,color:TEXT3,cursor:'pointer',fontFamily:F})}>Effacer</button>}
                  </div>
                  <div style={C({flex:1,overflowY:'auto',padding:16})}>
                    {bmsgs.length===0&&(
                      <div style={C({textAlign:'center',padding:'48px 20px',color:TEXT3})}>
                        <div style={C({fontFamily:FE,fontSize:13,color:DARK,letterSpacing:'0.04em',textTransform:'uppercase',marginBottom:6})}>Briefer toute l&apos;équipe</div>
                        <div style={C({fontSize:12,fontFamily:F})}>Pose une question ou soumets un projet.</div>
                      </div>
                    )}
                    {bmsgs.map((m,i)=>(
                      <div key={i} style={C({marginBottom:14})}>
                        {m.role==='user'
                          ?<div style={C({display:'flex',justifyContent:'flex-end'})}><div style={C({maxWidth:'70%',padding:'10px 14px',background:RED,color:WHITE,borderRadius:'3px 3px 1px 3px',fontSize:13,lineHeight:1.6,whiteSpace:'pre-wrap',fontFamily:F})}>{m.content}</div></div>
                          :<div style={C({padding:'12px 16px',background:'#FAFAFA',border:'1px solid '+BORDER,borderLeft:'2px solid '+RED,borderRadius:'3px 3px 3px 1px',fontSize:13,lineHeight:1.85,whiteSpace:'pre-wrap',color:TEXT,fontFamily:F})}>{m.content}</div>
                        }
                        <div style={C({fontSize:10,color:TEXT3,marginTop:3,textAlign:m.role==='user'?'right':'left',fontFamily:F})}>{m.ts}</div>
                      </div>
                    ))}
                    {bl&&<div style={C({padding:'10px 14px',background:'#FAFAFA',border:'1px solid '+BORDER,borderLeft:'2px solid '+RED,borderRadius:3,fontSize:13,color:TEXT3,fontFamily:F})}>L&apos;équipe réfléchit…</div>}
                    <div ref={bEnd}/>
                  </div>
                  <div style={C({padding:'11px 14px',borderTop:'1px solid '+BORDER,display:'flex',gap:8,flexShrink:0})}>
                    <input value={bt} onChange={e=>setBt(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendB()}
                      placeholder="Une question pour toute l'équipe..."
                      style={C({flex:1,padding:'9px 14px',fontSize:13,fontFamily:F,background:'#FAFAFA',border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none'})}/>
                    <button onClick={sendB} disabled={bl||!bt.trim()} style={C({padding:'9px 18px',fontSize:11,fontWeight:500,background:bl||!bt.trim()?GREY2:RED,color:bl||!bt.trim()?TEXT3:WHITE,border:'none',borderRadius:3,cursor:bl||!bt.trim()?'not-allowed':'pointer',fontFamily:FE,letterSpacing:'0.06em',textTransform:'uppercase'})}>Envoyer</button>
                  </div>
                </div>
              </div>
            )}

            {/* CHAT INDIVIDUEL */}
            {view==='chat'&&ae&&ex&&(
              <div style={C({flex:1,display:'flex',flexDirection:'column',overflow:'hidden',padding:'10px 24px 24px'})}>
                <div style={C({flexShrink:0,marginBottom:8})}>
                  <button onClick={()=>setAe(null)} style={C({padding:'4px 10px',fontSize:11,background:'none',border:'1px solid '+BORDER,borderRadius:3,color:TEXT3,cursor:'pointer',fontFamily:F})}>← Équipe</button>
                </div>
                <div style={C({flex:1,background:WHITE,border:'1px solid '+BORDER,borderRadius:3,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0,boxShadow:'0 1px 8px rgba(0,0,0,0.06)'})}>
                  <div style={C({display:'flex',alignItems:'center',gap:12,padding:'12px 18px',borderBottom:'1px solid '+BORDER,background:'#FAFAFA',flexShrink:0,borderTop:'2px solid '+RED})}>
                    <div style={C({width:38,height:38,borderRadius:'50%',background:RED,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:WHITE})}>{ex.initials}</div>
                    <div>
                      <div style={C({fontFamily:FE,fontSize:13,color:DARK,letterSpacing:'0.04em',textTransform:'uppercase'})}>{ex.name}</div>
                      <div style={C({fontSize:10,color:ex.color,fontFamily:F})}>{ex.title}</div>
                    </div>
                    <div style={C({marginLeft:'auto',display:'flex',alignItems:'center',gap:4,fontSize:10,color:'#27AE60',fontFamily:F})}>
                      <span style={C({width:6,height:6,borderRadius:'50%',background:'#27AE60',display:'inline-block'})}></span>En ligne
                    </div>
                  </div>
                  <div style={C({flex:1,overflowY:'auto',padding:18,minHeight:0})}>
                    {msgs.length===0&&(
                      <div style={C({textAlign:'center',padding:'52px 20px'})}>
                        <div style={C({width:52,height:52,borderRadius:'50%',background:RED,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:WHITE,margin:'0 auto 14px'})}>{ex.initials}</div>
                        <div style={C({fontFamily:FE,fontSize:14,color:DARK,letterSpacing:'0.04em',textTransform:'uppercase',marginBottom:6})}>{ex.name}</div>
                        <div style={C({fontSize:12,color:TEXT3,lineHeight:1.6,fontFamily:F})}>Je connais tous tes projets MZ. Dis-moi ce dont tu as besoin.</div>
                      </div>
                    )}
                    {msgs.map((m,i)=>(
                      <div key={i} style={C({display:'flex',flexDirection:m.role==='user'?'row-reverse':'row',gap:10,alignItems:'flex-start',marginBottom:18})}>
                        {m.role==='assistant'&&<div style={C({width:28,height:28,borderRadius:'50%',background:RED,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:WHITE,flexShrink:0,marginTop:2})}>{ex.initials}</div>}
                        <div style={C({maxWidth:'76%'})}>
                          <div style={C({padding:'11px 15px',fontSize:13,lineHeight:1.7,whiteSpace:'pre-wrap',borderRadius:m.role==='user'?'3px 3px 1px 3px':'3px 3px 3px 1px',background:m.role==='user'?RED:WHITE,color:m.role==='user'?WHITE:TEXT,boxShadow:m.role==='user'?'none':'0 1px 4px rgba(0,0,0,0.06)',border:m.role==='user'?'none':'1px solid '+BORDER,borderLeft:m.role==='assistant'?'2px solid '+RED:undefined,fontFamily:F})}>{m.content}</div>
                          {m.role==='assistant'&&((m.tasks?.length??0)>0||(m.dates?.length??0)>0)&&(
                            <div style={C({display:'flex',flexDirection:'column',gap:8,marginTop:10})}>
                              {(m.tasks?.length??0)>0&&(
                                <div style={C({background:'#FFF0F2',border:'1px solid #F5B8C2',borderLeft:'2px solid '+RED,borderRadius:3,padding:'10px 14px'})}>
                                  <div style={C({fontSize:9,fontWeight:700,color:RED,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8,fontFamily:FE})}>✓ Ajouté à ta liste</div>
                                  {m.tasks?.map((t,j)=>(
                                    <div key={j} style={C({display:'flex',gap:8,padding:'3px 0',fontSize:12,color:TEXT,fontFamily:F})}>
                                      <span style={C({color:RED,fontWeight:600})}>→</span>{t.text}
                                      {t.deadline&&<span style={C({color:RED,marginLeft:'auto',fontWeight:500})}>{fd(t.deadline)}</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {(m.dates?.length??0)>0&&(
                                <div style={C({background:BLUE_BG,border:'1px solid '+BLUE_BORDER,borderLeft:'2px solid '+BLUE,borderRadius:3,padding:'10px 14px'})}>
                                  <div style={C({fontSize:9,fontWeight:700,color:BLUE,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8,fontFamily:FE})}>◫ Ajouté au calendrier</div>
                                  {m.dates?.map((d,j)=>(
                                    <div key={j} style={C({display:'flex',gap:8,padding:'3px 0',fontSize:12,color:TEXT,fontFamily:F})}>
                                      <span style={C({color:BLUE,fontWeight:600})}>{fd(d.d)}</span>{d.t}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          <div style={C({fontSize:10,color:TEXT3,marginTop:4,textAlign:m.role==='user'?'right':'left',fontFamily:F})}>{m.ts}</div>
                        </div>
                      </div>
                    ))}
                    {load&&(
                      <div style={C({display:'flex',gap:10,alignItems:'flex-start',marginBottom:16})}>
                        <div style={C({width:28,height:28,borderRadius:'50%',background:RED,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:WHITE,flexShrink:0})}>{ex.initials}</div>
                        <div style={C({padding:'10px 14px',borderRadius:'3px 3px 3px 1px',background:WHITE,border:'1px solid '+BORDER,borderLeft:'2px solid '+RED,fontSize:13,color:TEXT3,fontFamily:F})}>{fileLoading?'Chargement fichier...':ex.name+' rédige…'}</div>
                      </div>
                    )}
                    <div ref={chatEnd}/>
                  </div>
                  <div style={C({padding:'11px 14px',borderTop:'1px solid '+BORDER,display:'flex',gap:8,background:'#FAFAFA',flexShrink:0,alignItems:'center'})}>
                    <input type="file" ref={fileRef} onChange={e=>{const f=e.target.files?.[0];if(f)setFile(f);e.target.value=''}} style={C({display:'none'})}/>
                    <button onClick={()=>fileRef.current?.click()} title={file?file.name:'Joindre un fichier'} style={C({padding:'9px 10px',fontSize:14,background:file?BLUE_BG:'none',border:'1px solid '+(file?BLUE_BORDER:BORDER),borderRadius:3,cursor:'pointer',color:file?BLUE:TEXT3,flexShrink:0})}>📎</button>
                    {file&&<span style={C({fontSize:10,color:BLUE,maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flexShrink:0})}>{file.name}</span>}
                    <input ref={iRef} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
                      placeholder={'Message pour '+ex.name+'…'}
                      style={C({flex:1,padding:'9px 14px',fontSize:13,fontFamily:F,background:WHITE,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none'})}/>
                    <button onClick={()=>send()} disabled={load||(!inp.trim()&&!file)} style={C({padding:'9px 18px',fontSize:11,fontWeight:500,background:load||(!inp.trim()&&!file)?GREY2:RED,color:load||(!inp.trim()&&!file)?TEXT3:WHITE,border:'none',borderRadius:3,cursor:load||(!inp.trim()&&!file)?'not-allowed':'pointer',fontFamily:FE,letterSpacing:'0.06em',textTransform:'uppercase'})}>Envoyer</button>
                  </div>
                </div>
              </div>
            )}

            {/* TODO */}
            {view==='todo'&&(
              <div style={C({flex:1,overflowY:'auto',padding:24})}>
                <div style={C({display:'flex',alignItems:'center',gap:10,marginBottom:14})}>
                  <div style={C({fontFamily:FE,fontSize:17,color:DARK,letterSpacing:'0.06em',textTransform:'uppercase',flex:1})}>Tâches <span style={C({color:RED})}>& Projets</span></div>
                  <button onClick={()=>setShowTemplate(v=>!v)} style={C({padding:'5px 12px',fontSize:11,background:showTemplate?GREY2:DARK,color:showTemplate?TEXT3:WHITE,border:'none',borderRadius:3,cursor:'pointer',fontFamily:F})}>⚡ Templates</button>
                  <button onClick={()=>setShowAddTask(v=>!v)} style={C({padding:'5px 12px',fontSize:11,background:RED,color:WHITE,border:'none',borderRadius:3,cursor:'pointer',fontFamily:F})}>+ Ajouter</button>
                </div>

                {showTemplate&&(
                  <div style={C({marginBottom:14,padding:'12px 16px',background:WHITE,border:'1px solid '+BORDER,borderRadius:3,boxShadow:'0 1px 4px rgba(0,0,0,0.04)'})}>
                    <div style={C({fontSize:10,fontWeight:600,color:TEXT3,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10,fontFamily:F})}>Templates de tâches récurrentes</div>
                    <div style={C({display:'flex',gap:8,flexWrap:'wrap'})}>
                      {TASK_TEMPLATES.map(tpl=>(
                        <button key={tpl.name} onClick={()=>applyTemplate(tpl)} style={C({padding:'7px 14px',fontSize:12,background:GREY,border:'1px solid '+BORDER,borderRadius:3,cursor:'pointer',fontFamily:F,color:TEXT})}>
                          <span style={C({color:RED,marginRight:6})}>⚡</span>{tpl.name} <span style={C({color:TEXT3,fontSize:10})}>({tpl.tasks.length} tâches)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {showAddTask&&(
                  <div style={C({marginBottom:14,padding:'12px 16px',background:WHITE,border:'1px solid '+BORDER,borderRadius:3,boxShadow:'0 1px 4px rgba(0,0,0,0.04)'})}>
                    <input value={newTaskText} onChange={e=>setNewTaskText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTask()} placeholder="Intitulé de la tâche..." autoFocus
                      style={C({width:'100%',padding:'8px 10px',fontSize:13,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none',marginBottom:8,boxSizing:'border-box' as const})}/>
                    <div style={C({display:'flex',gap:8,marginBottom:8})}>
                      <select value={newTaskProj} onChange={e=>setNewTaskProj(e.target.value)} style={C({flex:1,padding:'6px 8px',fontSize:12,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none',background:WHITE})}>
                        {Object.keys(PROJ).map(p=><option key={p} value={p}>{p}</option>)}
                      </select>
                      <input type="date" value={newTaskDeadline} onChange={e=>setNewTaskDeadline(e.target.value)} style={C({flex:1,padding:'6px 8px',fontSize:12,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none'})}/>
                    </div>
                    <div style={C({display:'flex',gap:8})}>
                      <button onClick={addTask} style={C({flex:1,padding:'8px',fontSize:12,background:RED,color:WHITE,border:'none',borderRadius:3,cursor:'pointer',fontFamily:F,fontWeight:500})}>Ajouter</button>
                      <button onClick={()=>setShowAddTask(false)} style={C({padding:'8px 12px',fontSize:12,background:'none',border:'1px solid '+BORDER,borderRadius:3,cursor:'pointer',color:TEXT3,fontFamily:F})}>Annuler</button>
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div style={C({display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'})}>
                  {[{id:null,name:'Toutes'},...Object.keys(PROJ).map(p=>({id:p,name:p}))].map(f=>(
                    <button key={f.id||'all'} onClick={()=>setAp(f.id)} style={C({padding:'5px 12px',fontSize:11,fontWeight:500,borderRadius:3,border:'1px solid '+(ap===f.id?RED:BORDER),background:ap===f.id?RED:WHITE,color:ap===f.id?WHITE:TEXT2,cursor:'pointer',fontFamily:F})}>{f.name}</button>
                  ))}
                </div>

                {/* 2-column: À faire / Terminé */}
                <div style={C({display:'grid',gridTemplateColumns:'1fr 1fr',gap:12})}>
                  {(['todo','done'] as TaskStatus[]).map(status=>{
                    const sc=getSC(status)
                    const statusTasks=tasks.filter(t=>t.status===status&&(!ap||t.proj===ap))
                    return (
                      <div key={status} style={C({background:WHITE,border:'1px solid '+BORDER,borderRadius:3,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'})}>
                        <div style={C({padding:'8px 12px',background:sc.bg,borderBottom:'1px solid '+sc.border,borderTop:'2px solid '+(status==='done'?'#2E7D32':RED),display:'flex',alignItems:'center',gap:6})}>
                          <span style={C({fontSize:11,fontWeight:600,color:sc.color,flex:1,fontFamily:FE,letterSpacing:'0.04em',textTransform:'uppercase'})}>{sc.label}</span>
                          <span style={C({fontSize:11,color:sc.color,fontWeight:600})}>{statusTasks.length}</span>
                        </div>
                        <div style={C({padding:'8px',maxHeight:600,overflowY:'auto'})}>
                          {statusTasks.map(t=>{
                            const pc=PROJ[t.proj]||PROJ['MZ Real Estate']
                            return (
                              <div key={t.id} style={C({background:'#FAFAFA',border:'1px solid '+BORDER,borderRadius:3,marginBottom:8,overflow:'hidden',opacity:t.status==='done'?0.65:1})}>
                                <div style={C({padding:'8px 10px'})}>
                                  <div style={C({display:'flex',alignItems:'flex-start',gap:8,marginBottom:5})}>
                                    <div onClick={()=>cycleStatus(t.id)} style={C({width:16,height:16,borderRadius:3,border:'1.5px solid '+(t.status==='done'?'#2E7D32':BORDER),background:t.status==='done'?'#2E7D32':'transparent',flexShrink:0,marginTop:1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:WHITE,cursor:'pointer',fontWeight:700})}>{t.status==='done'?'✓':''}</div>
                                    {editTaskId===t.id?(
                                      <div style={C({display:'flex',gap:4,flex:1})}>
                                        <input value={editTaskText} onChange={e=>setEditTaskText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveEditTask()} autoFocus style={C({flex:1,padding:'3px 6px',fontSize:12,fontFamily:F,border:'1px solid '+RED,borderRadius:3,color:TEXT,outline:'none'})}/>
                                        <button onClick={saveEditTask} style={C({padding:'3px 6px',fontSize:10,background:RED,color:WHITE,border:'none',borderRadius:3,cursor:'pointer'})}>OK</button>
                                        <button onClick={()=>setEditTaskId(null)} style={C({padding:'3px 5px',fontSize:10,background:'none',border:'1px solid '+BORDER,borderRadius:3,cursor:'pointer',color:TEXT3})}>✕</button>
                                      </div>
                                    ):(
                                      <div onClick={()=>setExpandedTaskId(expandedTaskId===t.id?null:t.id)} style={C({fontSize:12,color:TEXT,lineHeight:1.4,fontFamily:F,cursor:'pointer',flex:1,textDecoration:t.status==='done'?'line-through':'none'})}>{t.text}</div>
                                    )}
                                  </div>
                                  <div style={C({display:'flex',gap:4,flexWrap:'wrap',alignItems:'center',paddingLeft:24})}>
                                    <span style={C({fontSize:9,color:pc.color,background:pc.bg,padding:'1px 5px',borderRadius:3,border:'1px solid '+pc.border,fontFamily:F})}>{t.proj}</span>
                                    {t.deadline&&<span style={C({fontSize:9,color:t.status==='done'?TEXT3:RED,fontWeight:600})}>⚡ {fd(t.deadline)}</span>}
                                    
                                    {taskNotes[t.id]&&<span style={C({fontSize:9,color:BLUE})}>📝</span>}
                                    <div style={C({marginLeft:'auto',display:'flex',gap:3})}>
                                      <button onClick={()=>setExpandedTaskId(expandedTaskId===t.id?null:t.id)} style={C({padding:'2px 4px',fontSize:9,background:expandedTaskId===t.id?BLUE_BG:'none',border:'1px solid '+(expandedTaskId===t.id?BLUE_BORDER:BORDER),borderRadius:2,cursor:'pointer',color:expandedTaskId===t.id?BLUE:TEXT3})}>📝</button>
                                      <button onClick={()=>startEditTask(t)} style={C({padding:'2px 4px',fontSize:9,background:'none',border:'1px solid '+BORDER,borderRadius:2,cursor:'pointer',color:TEXT3})}>✎</button>
                                      <button onClick={()=>deleteTask(t.id)} style={C({padding:'2px 4px',fontSize:9,background:'none',border:'1px solid '+BORDER,borderRadius:2,cursor:'pointer',color:RED})}>✕</button>
                                    </div>
                                  </div>
                                </div>
                                {expandedTaskId===t.id&&(
                                  <div style={C({padding:'8px 10px',borderTop:'1px solid '+BLUE_BORDER,background:BLUE_BG})}>
                                    <div style={C({fontSize:9,fontWeight:600,color:BLUE,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4,fontFamily:F})}>Notes & références</div>
                                    <textarea value={taskNotes[t.id]||''} onChange={e=>saveNote(t.id,e.target.value)} placeholder={'Notes, refs...\nEx: MZCA6408, MZIB0076'} style={C({width:'100%',minHeight:64,padding:'5px 7px',fontSize:11,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none',resize:'vertical',lineHeight:1.5,boxSizing:'border-box' as const,background:WHITE})}/>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                          {statusTasks.length===0&&<div style={C({fontSize:12,color:TEXT3,textAlign:'center',padding:'24px 0',fontFamily:F})}>—</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
                  {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map(status=>{
                    const sc=getSC(status)
                    const statusTasks=tasks.filter(t=>t.status===status&&(!ap||t.proj===ap))
                    return (
                      <div key={status} style={C({background:WHITE,border:'1px solid '+BORDER,borderRadius:3,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'})}>
                        <div style={C({padding:'8px 12px',background:sc.bg,borderBottom:'1px solid '+sc.border,display:'flex',alignItems:'center',gap:6})}>
                          <span style={C({fontSize:11,fontWeight:600,color:sc.color,flex:1,fontFamily:FE,letterSpacing:'0.04em',textTransform:'uppercase'})}>{sc.label}</span>
                          <span style={C({fontSize:11,color:sc.color,fontWeight:600})}>{statusTasks.length}</span>
                        </div>
                        <div style={C({padding:'8px',maxHeight:520,overflowY:'auto'})}>
                          {statusTasks.map(t=>{
                            const pc=PROJ[t.proj]||PROJ['MZ Real Estate']
                            return (
                              <div key={t.id} style={C({background:'#FAFAFA',border:'1px solid '+BORDER,borderRadius:3,marginBottom:8,overflow:'hidden'})}>
                                <div style={C({padding:'8px 10px'})}>
                                  {editTaskId===t.id?(
                                    <div style={C({display:'flex',gap:4,marginBottom:6})}>
                                      <input value={editTaskText} onChange={e=>setEditTaskText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveEditTask()} autoFocus
                                        style={C({flex:1,padding:'4px 6px',fontSize:11,fontFamily:F,border:'1px solid '+RED,borderRadius:3,color:TEXT,outline:'none'})}/>
                                      <button onClick={saveEditTask} style={C({padding:'3px 6px',fontSize:10,background:RED,color:WHITE,border:'none',borderRadius:3,cursor:'pointer'})}>OK</button>
                                      <button onClick={()=>setEditTaskId(null)} style={C({padding:'3px 5px',fontSize:10,background:'none',border:'1px solid '+BORDER,borderRadius:3,cursor:'pointer',color:TEXT3})}>✕</button>
                                    </div>
                                  ):(
                                    <div onClick={()=>setExpandedTaskId(expandedTaskId===t.id?null:t.id)} style={C({fontSize:12,color:TEXT,lineHeight:1.4,fontFamily:F,cursor:'pointer',marginBottom:6})}>{t.text}</div>
                                  )}
                                  <div style={C({display:'flex',gap:4,flexWrap:'wrap',alignItems:'center'})}>
                                    <span style={C({fontSize:9,color:pc.color,background:pc.bg,padding:'1px 5px',borderRadius:3,border:'1px solid '+pc.border,fontFamily:F})}>{t.proj}</span>
                                    {t.deadline&&<span style={C({fontSize:9,color:RED,fontWeight:600})}>⚡ {fd(t.deadline)}</span>}
                                    
                                    {taskNotes[t.id]&&<span style={C({fontSize:9,color:BLUE})}>📝</span>}
                                    <div style={C({marginLeft:'auto',display:'flex',gap:3})}>
                                      <button onClick={()=>cycleStatus(t.id)} title="Changer le statut" style={C({padding:'2px 5px',fontSize:9,background:sc.bg,border:'1px solid '+sc.border,borderRadius:2,cursor:'pointer',color:sc.color,fontFamily:F})}>→</button>
                                      <button onClick={()=>setExpandedTaskId(expandedTaskId===t.id?null:t.id)} style={C({padding:'2px 4px',fontSize:9,background:expandedTaskId===t.id?BLUE_BG:'none',border:'1px solid '+(expandedTaskId===t.id?BLUE_BORDER:BORDER),borderRadius:2,cursor:'pointer',color:expandedTaskId===t.id?BLUE:TEXT3})}>📝</button>
                                      <button onClick={()=>startEditTask(t)} style={C({padding:'2px 4px',fontSize:9,background:'none',border:'1px solid '+BORDER,borderRadius:2,cursor:'pointer',color:TEXT3})}>✎</button>
                                      <button onClick={()=>deleteTask(t.id)} style={C({padding:'2px 4px',fontSize:9,background:'none',border:'1px solid '+BORDER,borderRadius:2,cursor:'pointer',color:RED})}>✕</button>
                                    </div>
                                  </div>
                                </div>
                                {expandedTaskId===t.id&&(
                                  <div style={C({padding:'8px 10px',borderTop:'1px solid '+BLUE_BORDER,background:BLUE_BG})}>
                                    <div style={C({fontSize:9,fontWeight:600,color:BLUE,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4,fontFamily:F})}>Notes & références</div>
                                    <textarea value={taskNotes[t.id]||''} onChange={e=>saveNote(t.id,e.target.value)}
                                      placeholder={'Notes, refs...\nEx: MZCA6408, MZIB0076'}
                                      style={C({width:'100%',minHeight:64,padding:'5px 7px',fontSize:11,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none',resize:'vertical',lineHeight:1.5,boxSizing:'border-box' as const,background:WHITE})}/>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                          {statusTasks.length===0&&<div style={C({fontSize:11,color:TEXT3,textAlign:'center',padding:'20px 0',fontFamily:F})}>—</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
            )}

            {/* CALENDRIER 4 SEMAINES */}
            {view==='calendrier'&&(
              <div style={C({flex:1,overflowY:'auto',padding:24})}>
                <div style={C({display:'flex',alignItems:'center',gap:10,marginBottom:14})}>
                  <div style={C({fontFamily:FE,fontSize:17,color:DARK,flex:1,letterSpacing:'0.06em',textTransform:'uppercase'})}>Calendrier <span style={C({color:RED})}>MZ</span></div>
                  <button onClick={()=>setShowAddCal(v=>!v)} style={C({padding:'5px 12px',fontSize:11,background:RED,color:WHITE,border:'none',borderRadius:3,cursor:'pointer',fontFamily:F})}>+ Événement</button>
                  <div style={C({display:'flex',gap:4})}>
                    {[{l:'←',a:()=>setWoff(w=>w-1)},{l:"Aujourd'hui",a:()=>setWoff(0)},{l:'→',a:()=>setWoff(w=>w+1)}].map((b,i)=>(
                      <button key={i} onClick={b.a} style={C({padding:'5px 12px',fontSize:11,background:i===1&&woff===0?RED:WHITE,color:i===1&&woff===0?WHITE:TEXT2,border:'1px solid '+BORDER,borderRadius:3,cursor:'pointer',fontFamily:F})}>{b.l}</button>
                    ))}
                  </div>
                </div>

                {showAddCal&&(
                  <div style={C({marginBottom:14,padding:'12px 16px',background:WHITE,border:'1px solid '+BORDER,borderRadius:3,boxShadow:'0 1px 4px rgba(0,0,0,0.04)'})}>
                    <div style={C({display:'flex',gap:8,marginBottom:8})}>
                      <input value={newCalText} onChange={e=>setNewCalText(e.target.value)} placeholder="Titre de l'événement..." autoFocus
                        style={C({flex:2,padding:'7px 10px',fontSize:12,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none'})}/>
                      <input type="date" value={newCalDate} onChange={e=>setNewCalDate(e.target.value)} style={C({flex:1,padding:'7px 8px',fontSize:12,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none'})}/>
                      <select value={newCalType} onChange={e=>setNewCalType(e.target.value as 'deadline'|'newsletter'|'rdv'|'task')} style={C({flex:1,padding:'7px 8px',fontSize:12,fontFamily:F,border:'1px solid '+BORDER,borderRadius:3,color:TEXT,outline:'none',background:WHITE})}>
                        <option value="task">Tâche</option>
                        <option value="deadline">Deadline</option>
                        <option value="newsletter">Newsletter</option>
                        <option value="rdv">RDV</option>
                      </select>
                      <button onClick={addCalItem} style={C({padding:'7px 14px',fontSize:11,background:RED,color:WHITE,border:'none',borderRadius:3,cursor:'pointer',fontFamily:F,fontWeight:500})}>Ajouter</button>
                      <button onClick={()=>setShowAddCal(false)} style={C({padding:'7px 10px',fontSize:11,background:'none',border:'1px solid '+BORDER,borderRadius:3,cursor:'pointer',color:TEXT3,fontFamily:F})}>✕</button>
                    </div>
                  </div>
                )}

                <div style={C({display:'flex',gap:8,marginBottom:10})}>
                  {[{l:'Newsletter',t:'newsletter'},{l:'Deadline',t:'deadline'},{l:'RDV',t:'rdv'},{l:'Tâche',t:'task'}].map(l=>{
                    const t=tc(l.t)
                    return <span key={l.t} style={C({fontSize:10,padding:'2px 8px',borderRadius:3,background:t.bg,color:t.color,border:'1px solid '+t.border,fontFamily:F})}>{l.l}</span>
                  })}
                </div>

                <div style={C({display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:4})}>
                  {DAYS.map(d=><div key={d} style={C({fontSize:9,fontWeight:600,color:TEXT3,textTransform:'uppercase',letterSpacing:'0.1em',textAlign:'center',fontFamily:F,padding:'4px 0'})}>{d}</div>)}
                </div>
                <div style={C({display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4})}>
                  {week.map((date,i)=>{
                    const dStr=date.toISOString().split('T')[0]
                    const isT=dStr===today
                    const items=cal.filter(c=>c.d===dStr)
                    return (
                      <div key={i} style={C({background:isT?'#FFF0F2':WHITE,border:'1px solid '+(isT?RED:BORDER),borderRadius:3,padding:'6px 6px',minHeight:80,borderTop:isT?'2px solid '+RED:'1px solid '+BORDER})}>
                        <div style={C({fontFamily:FE,fontSize:14,color:isT?RED:DARK,marginBottom:4,lineHeight:1})}>{date.getDate()}</div>
                        {items.map((item,j)=>{
                          const t=tc(item.type)
                          const globalIdx=cal.findIndex(ci=>ci.d===item.d&&ci.t===item.t)
                          return (
                            <div key={j} style={C({marginBottom:3})}>
                              {editCalIdx===globalIdx?(
                                <div style={C({display:'flex',flexDirection:'column',gap:2})}>
                                  <input value={editCalText} onChange={e=>setEditCalText(e.target.value)} autoFocus
                                    style={C({width:'100%',padding:'2px 4px',fontSize:9,fontFamily:F,border:'1px solid '+RED,borderRadius:2,color:TEXT,outline:'none',boxSizing:'border-box' as const})}/>
                                  <input type="date" value={editCalDate} onChange={e=>setEditCalDate(e.target.value)}
                                    style={C({width:'100%',padding:'2px 4px',fontSize:9,fontFamily:F,border:'1px solid '+RED,borderRadius:2,color:TEXT,outline:'none',boxSizing:'border-box' as const})}/>
                                  <div style={C({display:'flex',gap:2})}>
                                    <button onClick={saveEditCal} style={C({flex:1,padding:'2px',fontSize:8,background:RED,color:WHITE,border:'none',borderRadius:2,cursor:'pointer'})}>OK</button>
                                    <button onClick={()=>setEditCalIdx(null)} style={C({padding:'2px 3px',fontSize:8,background:'none',border:'1px solid '+BORDER,borderRadius:2,cursor:'pointer',color:TEXT3})}>✕</button>
                                  </div>
                                </div>
                              ):(
                                <div style={C({padding:'2px 5px',borderRadius:2,fontSize:9,lineHeight:1.4,background:t.bg,color:t.color,border:'1px solid '+t.border,fontFamily:F,display:'flex',alignItems:'center',gap:2})}>
                                  <span style={C({flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'})}>{item.t}</span>
                                  <button onClick={()=>startEditCal(globalIdx,item)} style={C({padding:'0 2px',fontSize:8,background:'none',border:'none',cursor:'pointer',color:t.color,flexShrink:0,opacity:0.7})}>✎</button>
                                  <button onClick={()=>deleteCalItem(globalIdx)} style={C({padding:'0 2px',fontSize:8,background:'none',border:'none',cursor:'pointer',color:t.color,flexShrink:0,opacity:0.7})}>✕</button>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  )
}
