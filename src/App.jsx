import React, {
  useState,
  useEffect,
  useRef,
  useReducer,
  useCallback,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// LAYER-0 CRASH SHIELD  (belajar dari Lyuyu)
// Intercept fatal JS errors sebelum React mount → tampilkan UI error berguna
// bukan blank screen.
// ─────────────────────────────────────────────────────────────────────────────
window.__yuyuCampMounted = false;
window.__yuyuCampErrors  = [];
(function installCrashShield() {
  const ID = "__yuyu_camp_shield";
  function show(msg) {
    if (window.__yuyuCampMounted) return;
    let el = document.getElementById(ID);
    if (!el) {
      el = document.createElement("div");
      el.id = ID;
      el.style.cssText = [
        "position:fixed","inset:0","z-index:2147483647",
        "background:#0C0915","color:#F5F3FF",
        "font-family:'Courier New',monospace",
        "display:flex","flex-direction:column",
        "align-items:center","justify-content:center",
        "padding:24px","text-align:center",
      ].join(";");
      (document.getElementById("root") || document.body).appendChild(el);
    }
    el.innerHTML = `<div style="max-width:420px">
      <div style="font-size:36px;margin-bottom:12px">💔</div>
      <p style="color:#f87171;font-size:14px;margin-bottom:8px">Yuyu crash sebelum sempat muncul...</p>
      <pre style="font-size:10px;color:#fde68a;white-space:pre-wrap;margin-bottom:16px;max-height:120px;overflow:auto">${(msg||"").slice(0,400)}</pre>
      <div style="display:flex;gap:8px;justify-content:center">
        <button onclick="window.location.reload()" style="padding:10px 20px;border-radius:12px;cursor:pointer;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.07);color:#F5F3FF;font-size:11px">🔄 Reload</button>
        <button onclick="(async()=>{try{await window.storage?.delete('yuyu-rpg-v5')}catch(e){}window.location.reload()})()" style="padding:10px 20px;border-radius:12px;cursor:pointer;border:1px solid rgba(239,68,68,.25);background:rgba(239,68,68,.08);color:#f87171;font-size:11px">🗑 Reset Save</button>
      </div></div>`;
  }
  const _prev = window.onerror;
  window.onerror = (msg, src, line, col, err) => {
    const m = err?.message || msg || "";
    window.__yuyuCampErrors.push({ m, src, line, ts: Date.now() });
    show(m);
    if (typeof _prev === "function") _prev(msg, src, line, col, err);
    return false;
  };
  window.addEventListener("unhandledrejection", ev => {
    const m = ev.reason?.message || String(ev.reason) || "Unhandled rejection";
    if (m.includes("ResizeObserver") || m.includes("storage") || m.includes("AbortError")) return;
    window.__yuyuCampErrors.push({ m, ts: Date.now() });
    show(m);
  });
  setTimeout(() => {
    if (!window.__yuyuCampMounted && !document.getElementById(ID))
      show("Yuyu tidak muncul dalam 5 detik. Mungkin ada error tersembunyi.");
  }, 5000);
})();

// ─────────────────────────────────────────────────────────────────────────────
// REACT ERROR BOUNDARY  (belajar dari Lyuyu)
// Wrap seluruh app agar runtime crash tetap menampilkan UI yang berguna.
// ─────────────────────────────────────────────────────────────────────────────
class YuyuErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  componentDidCatch(e, info) {
    window.__yuyuCampErrors.push({ m: e?.message, stack: info?.componentStack?.slice(0, 200) });
  }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div style={{ position:"fixed", inset:0, background:"#0C0915", color:"#F5F3FF",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        padding:24, textAlign:"center", fontFamily:"Courier New,monospace" }}>
        <div style={{ fontSize:36, marginBottom:12 }}>💔</div>
        <p style={{ color:"#f87171", fontSize:14, marginBottom:8 }}>Ada yang crash di dalam Yuyu...</p>
        <pre style={{ fontSize:10, color:"#fde68a", maxWidth:420, whiteSpace:"pre-wrap",
          marginBottom:16, maxHeight:120, overflow:"auto" }}>
          {this.state.err?.message || "Unknown error"}
        </pre>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => window.location.reload()}
            style={{ padding:"10px 20px", borderRadius:12, cursor:"pointer",
              border:"1px solid rgba(255,255,255,.1)", background:"rgba(255,255,255,.07)",
              color:"#F5F3FF", fontSize:11 }}>🔄 Reload</button>
          <button onClick={async () => {
              try { await window.storage?.delete("yuyu-rpg-v5"); } catch(e) {}
              window.location.reload();
            }}
            style={{ padding:"10px 20px", borderRadius:12, cursor:"pointer",
              border:"1px solid rgba(239,68,68,.25)", background:"rgba(239,68,68,.08)",
              color:"#f87171", fontSize:11 }}>🗑 Reset Save</button>
        </div>
      </div>
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SAFETY UTILITIES  (belajar dari Lyuyu)
// Defensive helpers agar NaN / null tidak cascade diam-diam.
// ─────────────────────────────────────────────────────────────────────────────

/** Safe numeric coercion — fallback jika tidak finite. */
const safeNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/** Safe JSON parse — fallback jika error. */
const safeJsonParse = (str, fallback = null) => {
  if (!str || typeof str !== "string") return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
};

/** Safe JSON stringify — handle circular reference. */
const safeStringify = obj => {
  const seen = new WeakSet();
  try {
    return JSON.stringify(obj, (_, v) => {
      if (typeof v === "object" && v !== null) {
        if (seen.has(v)) return "[Circular]";
        seen.add(v);
      }
      return v;
    });
  } catch { return null; }
};

/** Sanitize user chat input — strip XSS & control characters. */
const sanitizeInput = raw => {
  if (!raw || typeof raw !== "string") return "";
  return raw
    .slice(0, 500)
    .replace(/[\x00-\x08\x0B\x0E-\x1F\x7F]/g, "")
    .replace(/<\/?script[^>]*>/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim();
};

/**
 * useMounted — ref tetap true hanya saat komponen hidup.
 * Belajar dari Lyuyu: cegah setState setelah unmount di async calls.
 */
function useMounted() {
  const ref = useRef(true);
  useEffect(() => () => { ref.current = false; }, []);
  return ref;
}

// ─────────────────────────────────────────────────────────────────────────────
// EMOTIONAL BLINDSPOT  (belajar dari Lyuyu)
// Yuyu punya emosi *tersembunyi* di balik mood utama yang bocor tipis ke dialog.
// Contoh: mood "excited" saat stage bos → sebenarnya ada rasa "nervous".
// ─────────────────────────────────────────────────────────────────────────────
const BATTLE_BLINDSPOT_CONDITIONS = [
  { mood:"excited",    blindspot:"nervous", chance:0.20, trigger:gs => gs.world.stage % 5 === 4 },
  { mood:"proud",      blindspot:"tired",   chance:0.15, trigger:gs => (gs.yuyu.prestige||0) > 0 && gs.world.stage <= 3 },
  { mood:"excited",    blindspot:"hurt",    chance:0.18, trigger:gs => (gs.player.deaths||0) > 0 && gs.world.stage < 5 },
  { mood:"determined", blindspot:"tired",   chance:0.22, trigger:gs => (gs.player.deaths||0) >= 3 },
  { mood:"happy",      blindspot:"nervous", chance:0.18, trigger:gs => gs.world.stage % 5 === 0 },
  { mood:"hurt",       blindspot:"proud",   chance:0.12, trigger:gs => (gs.world.highestStage||0) >= 10 },
];

function rollEmotionalBlindspot(currentMood, gameState) {
  const candidates = BATTLE_BLINDSPOT_CONDITIONS.filter(
    b => b.mood === currentMood && b.trigger(gameState)
  );
  if (!candidates.length) return null;
  const entry = candidates[Math.floor(Math.random() * candidates.length)];
  return Math.random() < entry.chance ? entry.blindspot : null;
}

function getBlindspotInstruction(blindspot) {
  const map = {
    nervous : "Yuyu sebenarnya sedikit gugup meski terlihat semangat — bocor lewat kalimat yang sedikit tergesa atau terlalu optimis.",
    tired   : "Yuyu sebenarnya agak kelelahan tapi tidak mau mengaku — responsnya pendek, tapi tetap positif.",
    hurt    : "Yuyu masih sedikit terluka dari pertempuran sebelumnya — ada nuansa hati-hati dalam pilihan katanya.",
    proud   : "Di balik kelelahan itu, Yuyu sebenarnya bangga — sesekali ada senyum kecil yang bocor.",
  };
  return map[blindspot] || "";
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPPRESSED LAYER  (belajar dari Lyuyu)
// Hal yang Yuyu "tahan" selama battle bisa bocor ke dialog berikutnya.
// Disimpan di state, injected ke system prompt saat relevan.
// ─────────────────────────────────────────────────────────────────────────────
const MAX_SUPPRESSED = 4;

function addSuppressedThought(currentLayer, text, trigger) {
  const entry = { text, trigger, ts: Date.now() };
  return [...(currentLayer || []).slice(-(MAX_SUPPRESSED - 1)), entry];
}

function getSuppressedSurface(layer) {
  if (!layer || layer.length === 0) return null;
  // Baru surface jika layer penuh atau ada 2+ pikiran yang tertahan
  if (layer.length < 2) return null;
  return layer[0];
}

function getSuppressedInstruction(suppressed) {
  if (!suppressed) return "";
  return `\n\n## SESUATU YANG TERTAHAN\nYuyu hampir mengucapkan ini sebelumnya tapi menahan diri: "${suppressed.text}". Bisa bocor sangat tipis — bukan diucapkan langsung, hanya sebuah bayangan kecil.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESONANT BATTLE MEMORY  (belajar dari Lyuyu)
// Surface ingatan battle lama yang relevan ke konteks sekarang agar Yuyu
// bisa referensikan masa lalu secara natural dan earned.
// ─────────────────────────────────────────────────────────────────────────────
function getResonantBattleMemory(battleHistory, currentCtx) {
  if (!battleHistory || battleHistory.length < 2) return null;
  if (Math.random() > 0.25) return null; // Surface 25% saja

  const { stage, hpPct, result } = currentCtx;
  const biomeRange = Math.floor((stage - 1) / 5);

  const scored = battleHistory
    .filter(m => m.summary)
    .map(m => {
      let score = 0;
      if (Math.floor(((m.stage||1) - 1) / 5) === biomeRange) score += 4; // same biome
      if (m.result === result)                                 score += 2; // same outcome
      if (Math.abs((m.hpPct||0.5) - hpPct) < 0.2)           score += 2; // similar HP drama
      if (Math.abs(stage - (m.stage||1)) > 10)                score += 1; // nostalgia bonus
      return { ...m, score };
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return null;
  const top = scored[0];
  return { ...top, isDistant: Math.abs(stage - (top.stage||1)) > 10 };
}

function getResonantMemoryInstruction(memory) {
  if (!memory) return "";
  const when = memory.isDistant
    ? `jauh sebelumnya (stage ${memory.stage})`
    : `baru-baru ini (stage ${memory.stage})`;
  return `\n\n## INGATAN YANG RELEVAN\nYuyu teringat ${when}: "${memory.summary}". Boleh muncul sangat tipis — satu referensi kecil atau sentuhan nostalgia, tidak perlu disebut langsung.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PHYSICAL SUBTEXT  (belajar dari Lyuyu)
// Bahasa tubuh `*...*` di-inject ke AI context agar dialog tetap embodied
// dan konsisten dengan kondisi fisik Yuyu saat itu.
// ─────────────────────────────────────────────────────────────────────────────
const BATTLE_PHYSICAL_SUBTEXT = {
  kill        : ["*matanya berbinar sebentar*", "*berdiri lebih tegak*", "*senyumnya kecil tapi jelas*"],
  win         : ["*menarik napas lega*", "*duduk pelan seperti baru sadar pertempuran sudah selesai*", "*tangannya yang tadinya mengepal, membuka*"],
  lose        : ["*mendongak pelan, menatap ke arah lain*", "*diam lebih lama dari biasanya*", "*tangannya menyentuh dadanya*"],
  hurt        : ["*menggigit bibir sebentar*", "*tidak bicara tapi ekspresinya berubah*", "*tangannya sedikit gemetar*"],
  lowHp       : ["*bernapas lebih cepat*", "*matanya fokus ke depan, tidak berkedip*", "*bibirnya rapat*"],
  excited     : ["*melompat kecil tanpa sadar*", "*senyumnya tidak bisa disembunyikan*"],
  tired       : ["*menopang kepala sebentar*", "*matanya berkedip pelan*"],
  nervous     : ["*menggeser posisi, lalu diam*", "*tangannya memegang lengan sendiri*"],
  proud       : ["*berdiri lebih tegak diam-diam*", "*sesekali melirik hasil battle*"],
  kontradiksi : ["*tersenyum tapi tangannya mengepal*", "*suaranya tenang tapi napasnya sedikit bergetar*", "*maju selangkah, lalu berhenti*"],
};

function getPhysicalSubtext(event, mood, isContradiction = false) {
  if (isContradiction && Math.random() < 0.4)
    return pick(BATTLE_PHYSICAL_SUBTEXT.kontradiksi);
  const pool = BATTLE_PHYSICAL_SUBTEXT[event] || BATTLE_PHYSICAL_SUBTEXT[mood] || null;
  if (!pool || Math.random() > 0.40) return null; // Only inject 40% of time
  return pick(pool);
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE TREND  (belajar dari Lyuyu's affectionTrend)
// Lacak win/lose streak agar Yuyu bisa bereaksi berbeda: semangat saat
// player on fire, lebih protektif saat player sedang banyak kalah.
// ─────────────────────────────────────────────────────────────────────────────
function getBattlePerformanceTrend(resultHistory) {
  if (!resultHistory || resultHistory.length < 3) return "stable";
  const last5  = resultHistory.slice(-5);
  const wins   = last5.filter(r => r === "win").length;
  const losses = last5.filter(r => r === "lose").length;
  if (wins   >= 4) return "rising";
  if (losses >= 3) return "falling";
  return "stable";
}

function getPerformanceTrendContext(trend, playerName) {
  if (trend === "rising")
    return `${playerName} sedang di streak kemenangan. Yuyu merasakannya — lebih berani, lebih antusias.`;
  if (trend === "falling")
    return `${playerName} sedang banyak kalah belakangan ini. Yuyu tidak bilang langsung, tapi responsnya lebih penuh dorongan, lebih protektif.`;
  return "";
}

// ─────────────────────────────────────────────────────────────────────────────
// RICH AI CONTEXT BUILDER  (belajar dari Lyuyu's buildDialogPrompt)
// Susun system prompt berlapis: karakter → situasi → mood+blindspot →
// subtext → trend → suppressed → resonant memory.
// Jauh lebih kaya dari flat one-liner sebelumnya.
// ─────────────────────────────────────────────────────────────────────────────
function buildYuyuBattlePrompt({ event, gameState, playerName, ctx = {}, suppressedLayer = [], lenHint = "Balas 1-2 kalimat singkat." }) {
  const { yuyu, world, player } = gameState;
  const mood      = yuyu.mood || "excited";
  const hpPct     = yuyu.hp / (yuyu.maxHp || 100);
  const stage     = world.stage;
  const prestige  = yuyu.prestige || 0;
  const deaths    = player.deaths || 0;
  const resultHistory = yuyu.resultHistory || [];
  const battleHistory = yuyu.battleHistory || [];

  // Compute contextual layers
  const blindspot       = rollEmotionalBlindspot(mood, gameState);
  const suppressed      = getSuppressedSurface(suppressedLayer);
  const resonant        = getResonantBattleMemory(battleHistory, { stage, hpPct, result: ctx.result });
  const trend           = getBattlePerformanceTrend(resultHistory);
  const trendCtx        = getPerformanceTrendContext(trend, playerName);
  const isContradiction = (mood === "excited" || mood === "happy") && hpPct < 0.3;
  const subtext         = getPhysicalSubtext(event, mood, isContradiction);

  // Layer 1: Character identity
  let prompt = `Kamu adalah Yuyu, hero cubic yang imut tapi punya kedalaman emosi. Kamu fighter — bukan mascot. ${lenHint} Dalam Bahasa Indonesia. Jangan mulai dengan nama sendiri atau "Aku". Boleh 1-2 emoji. Jangan terlalu manis atau terlalu dramatis.`;

  // Layer 2: Situational context
  prompt += `\n\n## SITUASI SEKARANG\nPemain: ${playerName}. Stage ${stage}${prestige > 0 ? ` (Prestige ${prestige})` : ""}. HP: ${Math.round(hpPct * 100)}%. Total kematian: ${deaths}x.`;

  // Layer 3: Emotional state + blindspot
  prompt += `\n\n## KONDISI EMOSI\nMood yang terlihat: ${mood}.`;
  if (blindspot) prompt += ` ${getBlindspotInstruction(blindspot)}`;

  // Layer 4: Physical subtext (embody the moment)
  if (subtext) prompt += `\n\nGerak tubuh tepat sebelum bicara: ${subtext}. Dialog harus konsisten dengan ini.`;

  // Layer 5: Performance trend
  if (trendCtx) prompt += `\n\n## TREN PERFORMA\n${trendCtx}`;

  // Layer 6: Suppressed thoughts
  prompt += getSuppressedInstruction(suppressed);

  // Layer 7: Resonant memory
  prompt += getResonantMemoryInstruction(resonant);

  return prompt;
}

// ─────────────────────────────────────────────────────────────────────────────
// API CALL WITH RETRY  (belajar dari Lyuyu's callClaudeWithRetry)
// Retry sekali pada transient failure agar dialog Yuyu tetap muncul.
// ─────────────────────────────────────────────────────────────────────────────
async function callClaudeWithRetry(systemPrompt, userMsg, maxTokens = 60, maxRetries = 1) {
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, attempt * 800));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          model     : "claude-sonnet-4-20250514",
          max_tokens: maxTokens,
          system    : systemPrompt,
          messages  : [{ role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error?.message || "API error");
      const text = data.content?.map(b => b.text || "").join("").trim();
      if (!text) throw new Error("Empty response");
      return text;
    } catch (e) {
      lastErr = e;
      const m = e?.message || "";
      if (m.includes("401") || m.includes("403") || m.includes("abort")) break;
    }
  }
  throw lastErr;
}


// ─────────────────────────────────────────────────────────────────────────────
// YUYU AI UPGRADE BRAIN
// Called after each win. Yuyu evaluates her state and decides what to invest in.
// Returns { upgrades:[{type,payload...}], summary:string }
// ─────────────────────────────────────────────────────────────────────────────
function yuyuAIUpgradeBrain(state) {
  const yuyu   = state.yuyu;
  const player = state.player;
  const world  = state.world;
  const stage  = world.stage;

  let gold        = player.gold;
  const upgrades  = [];
  const notes     = [];

  // ── Reserve: scale with gold amount so Yuyu isn't stingy when rich ──
  // < 500g  → keep 25%   (still building up)
  // < 2000g → keep 15%
  // < 5000g → keep 10%
  // 5000g+  → keep only 5% (she's rich, spend it!)
  const hasAscended = (yuyu.prestige||0) >= 1;
  const reservePct = hasAscended ? 0 : gold < 500 ? 0.25 : gold < 2000 ? 0.15 : gold < 5000 ? 0.10 : 0.05;
  const reserve    = Math.floor(gold * reservePct);
  let spendable    = gold - reserve;
  if (spendable <= 0) return { upgrades:[], summary:"Gold belum cukup buat upgrade sekarang~" };

  const stats  = {...yuyu.stats}; // clone so we can mutate safely
  const eStats = getEffectiveStats(yuyu);
  const owned  = yuyu.ownedEquipment || [];

  // ── Priority 1: Equipment — buy ALL affordable unowned items, not just one per slot ──
  const slotOrder = ["weapon","armor","accessory"];
  for (const slot of slotOrder) {
    const slotItems = EQUIPMENT[slot];
    // Keep buying upgrades in this slot as long as we can afford a better one
    let keepBuying = true;
    while (keepBuying && spendable > 0) {
      const toBuy = [...slotItems].reverse().find(item=>
        !owned.includes(item.id) && item.cost <= spendable
      );
      if (toBuy) {
        upgrades.push({type:"BUY_EQUIP", itemId:toBuy.id});
        notes.push(`beli ${toBuy.name}`);
        owned.push(toBuy.id); // track locally so next iteration sees it as owned
        spendable -= toBuy.cost;
        gold      -= toBuy.cost;
      } else {
        keepBuying = false;
      }
    }
  }

  // ── Priority 2: Stat upgrades — spend until gold is gone or all stats maxed ──
  const statWeights = {
    str:  stage <= 5 ? 1.2 : stage <= 15 ? 1.4 : 1.5,
    def:  stage <= 5 ? 0.8 : stage <= 12 ? 1.2 : 1.4,
    spd:  1.1,
    hp:   stage <= 8 ? 1.3 : 1.0,
    luck: stage <= 10 ? 0.7 : 1.1,
  };
  const statCosts = {str:50,def:40,spd:60,hp:45,luck:35};
  // No artificial maxRounds — keep going until out of gold or all stats maxed
  let statStuck = false;
  while (spendable > 0 && !statStuck) {
    const affordable = Object.keys(stats)
      .filter(k => stats[k] < MAX_STAT)
      .map(k => {
        const lv   = stats[k];
        const cost = statCosts[k] * lv;
        if (cost > spendable) return null;
        const score = statWeights[k] * (MAX_STAT - lv) / Math.max(1, lv);
        return { k, cost, score };
      })
      .filter(Boolean)
      .sort((a,b) => b.score - a.score);

    if (!affordable.length) { statStuck = true; break; }
    const pick = affordable[0];
    upgrades.push({type:"UPGRADE", stat:pick.k});
    notes.push(`${pick.k.toUpperCase()}→${stats[pick.k]+1}`);
    stats[pick.k]++;
    spendable -= pick.cost;
    gold      -= pick.cost;
  }

  // ── Priority 3: Level up ALL unlocked skills (not just equipped) ──
  const allUnlocked = yuyu.unlockedSkills || yuyu.skills || [];
  for (const sid of allUnlocked) {
    const lv   = getSkillLv(yuyu, sid);
    const cost = skillUpgradeCost(lv);
    if (!cost || lv >= 3) continue;
    if (cost <= spendable) {
      upgrades.push({type:"LEVEL_SKILL", skillId:sid});
      notes.push(`${SKILLS[sid]?.name || sid} lv${lv+1}`);
      spendable -= cost;
      gold      -= cost;
    }
  }

  if (!upgrades.length) return { upgrades:[], summary:"Hmm, belum ada yang worth di-upgrade sekarang~" };

  // Build summary — if many upgrades, show count not full list
  const bigSpend = notes.length > 4;
  const summaryNotes = bigSpend ? `${notes.length} upgrade sekaligus` : notes.join(", ");
  const summaries = [
    `Oke, ${summaryNotes}. Yuyu makin kuat! 💪`,
    `Yuyu habisin gold buat ${summaryNotes}~ Worth banget!`,
    `${summaryNotes} — duit segitu mah dihabisin aja! 😤`,
  ];
  return { upgrades, summary: summaries[Math.floor(Math.random()*summaries.length)] };
}

const COLORS = {primary:"#7C3AED",pink:"#EC4899",green:"#10B981",gold:"#F59E0B",red:"#EF4444",bg:"#0C0915",text:"#F5F3FF",muted:"#6B7280"};

// ─────────────────────────────────────────────────────────────────────────────
// PRESTIGE SYSTEM v2 — Named tiers + permanent perks
// ─────────────────────────────────────────────────────────────────────────────
const PRESTIGE_TIERS = [
  {n:1,name:"Bronze",    color:"#cd7f32",icon:"🥉", badge:"I"},
  {n:2,name:"Silver",    color:"#94a3b8",icon:"🥈", badge:"II"},
  {n:3,name:"Gold",      color:"#f59e0b",icon:"🏆", badge:"III"},
  {n:4,name:"Platinum",  color:"#22d3ee",icon:"💎", badge:"IV"},
  {n:5,name:"Diamond",   color:"#a78bfa",icon:"👑", badge:"V"},
  {n:6,name:"Crystal",   color:"#f0abfc",icon:"🔮", badge:"VI"},
  {n:7,name:"Void",      color:"#ec4899",icon:"🌀", badge:"VII"},
  {n:8,name:"Legendary", color:"#fde047",icon:"⭐", badge:"VIII"},
];

const PRESTIGE_PERKS = [
  {id:"veteran",    p:1, name:"Battle Veteran", icon:"🏅", desc:"Level-up milestone grant +2 free stat (bukan +1)"},
  {id:"hoarder",    p:2, name:"Gold Hoarder",   icon:"💰", desc:"Tiap kill: +LUCK bonus gold ekstra"},
  {id:"resilient",  p:3, name:"Resilient",      icon:"🛡",  desc:"Tidak bisa di-one-shot — HP minimum 1 (1× per battle)"},
  {id:"combofan",   p:4, name:"Combo Fan",      icon:"🔥", desc:"Combo bonus aktif mulai kill ke-2 (bukan ke-3)"},
  {id:"momentum",   p:5, name:"Momentum",       icon:"⚡", desc:"Tiap consecutive win: +3% DMG (max +15%, reset saat death)"},
  {id:"finisher",   p:6, name:"Finisher",       icon:"💀", desc:"Kill enemy HP < 20%: bonus +50% gold dari musuh itu"},
  {id:"lastbreath", p:7, name:"Last Breath",    icon:"💨", desc:"HP < 10%: semua skill cooldown reset 1× per battle"},
  {id:"godhand",    p:8, name:"God Hand",       icon:"✨", desc:"Semua stat efektif +3 dalam pertempuran"},
];

/** Get current prestige tier info (cycles every 8) */
const getPrestTier = p => {
  if (!p || p <= 0) return null;
  return PRESTIGE_TIERS[(p-1) % PRESTIGE_TIERS.length];
};

/** Compact star badge — never overflows */
const PrestigeBadge = ({prestige=0, size="sm"}) => {
  if (!prestige) return null;
  const tier = getPrestTier(prestige);
  const cycle = Math.ceil(prestige / 8); // which cycle (1=first 8, 2=second 8, etc.)
  const fz = size==="lg" ? 11 : size==="md" ? 9 : 7.5;
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",gap:2,
      padding:`${size==="lg"?3:2}px ${size==="lg"?7:5}px`,
      borderRadius:99,
      background:`${tier.color}20`,
      border:`1px solid ${tier.color}50`,
      color:tier.color,
      fontSize:fz,fontWeight:900,
      letterSpacing:".04em",
      flexShrink:0,
      whiteSpace:"nowrap",
    }}>
      {tier.icon} {tier.name}{cycle>1?` ×${cycle}`:""}
    </span>
  );
};

const MOOD_PALETTE = {
  excited:{ glow:"rgba(240, 100, 200, .22)", tint:"#fce4ec", cheek:true, extra:"🎉" },
  happy:{ glow:"rgba(251, 113, 133, .18)", tint:"#ffe4e8", cheek:true, extra:"🌸" },
  tired:{ glow:"rgba(120, 90, 180, .14)", tint:"#e8eaf6", cheek:false, extra:"💤" },
  hurt:{ glow:"rgba(239, 68, 68, .18)", tint:"#ffcdd2", cheek:false, extra:"💦" },
  nervous:{ glow:"rgba(250, 150, 50, .16)", tint:"#ffe0b2", cheek:false, extra:"😓" },
  proud:{ glow:"rgba(245, 158, 11, .22)", tint:"#fff8e1", cheek:true, extra:"👑" },
  determined:{ glow:"rgba(99, 102, 241, .2)", tint:"#ede9fe", cheek:false, extra:"💪" },
};

const BIOMES = [
  {name:"Forest Cube",  icon:"🌲",color:"#16A34A",floor1:"#192e19",floor2:"#1f3a1f",grout:"#0f1f0f",deco:"forest",  range:[1,5]   },
  {name:"Stone Dungeon",icon:"🪨",color:"#6B7280",floor1:"#1c1c28",floor2:"#24243a",grout:"#111120",deco:"stone",   range:[6,10]  },
  {name:"Crystal Cave", icon:"💎",color:"#0D9488",floor1:"#0c1f28",floor2:"#102838",grout:"#071318",deco:"crystal", range:[11,15] },
  {name:"Sky Platform", icon:"☁️",color:"#2563EB",floor1:"#0e1840",floor2:"#162050",grout:"#0a1230",deco:"sky",     range:[16,20] },
  {name:"Dark Fortress",icon:"🏰",color:"#7C3AED",floor1:"#180828",floor2:"#200f38",grout:"#0e0520",deco:"fortress",range:[21,25] },
  {name:"Void Realm",   icon:"🌀",color:"#EC4899",floor1:"#0c0820",floor2:"#140c2e",grout:"#08051a",deco:"void",    range:[26,999]},
];

const getBiome = s=>BIOMES.find(b=>s>=b.range[0]&&s<=b.range[1])||BIOMES[5];

const GROUND_Y_RATIO = 0.38;

function getObstacles(biome,W,H,stage){
  const groundY = H*GROUND_Y_RATIO;
  const obs = [];
  if (biome.deco==="forest"){for (let i = 0; i < 5;i++)obs.push({cx:30+i*(W/4.5),cy:groundY,r:14,scene:true});}
  else if (biome.deco==="stone"){for (let i = 0; i < 4;i++)obs.push({cx:20+i*(W/3.5),cy:groundY,r:18,scene:true});}
  else if (biome.deco==="crystal"){for (let i = 0; i < 6;i++)obs.push({cx:15+i*(W/5.5),cy:groundY,r:9,scene:true});}
  else if (biome.deco==="fortress"){for (let i = 0; i < 3;i++)obs.push({cx:25+i*(W/2.8),cy:groundY-30,r:17,scene:true});}
  else if (biome.deco==="void"){for (let i = 0; i < 4;i++)obs.push({cx:20+i*(W/3.2),cy:groundY-10,r:11,scene:true});}
  // extra mid-field obstacles (more as stage increases, shown as boulders)
  const numExtra = Math.min(5,Math.floor(stage/5));
  for (let i = 0; i < numExtra;i++){
    const tx = W*0.25+randomTile(i*17+stage,5)*W*0.52;
    const ty = groundY+22+randomTile(i*17+stage,6)*(H*0.30);
    obs.push({cx:tx,cy:ty,r:13+randomTile(i*17+stage,7)*8,scene:false});
  }
  return obs;
}

function drawObstacleSprite(ctx,obs,biome,time){
  if (obs.scene)return;
  ctx.save();
  ctx.fillStyle=biome.floor1+"f2";
  ctx.strokeStyle=biome.color+"70";
  ctx.lineWidth=1.5;
  ctx.shadowColor=biome.color;
  ctx.shadowBlur=4+Math.sin(time*1.5)*2;
  ctx.beginPath();
  ctx.ellipse(obs.cx,obs.cy,obs.r,obs.r*.65,0,0,Math.PI*2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur=0;
  ctx.fillStyle="rgba(255,255,255,.08)";
  ctx.beginPath();
  ctx.ellipse(obs.cx-obs.r*.3,obs.cy-obs.r*.25,obs.r*.4,obs.r*.25,-.4,0,Math.PI*2);
  ctx.fill();
  ctx.strokeStyle=biome.color+"35";
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.arc(obs.cx,obs.cy,obs.r+4+Math.sin(time*2)*2,0,Math.PI*2);
  ctx.stroke();
  ctx.restore();
}

function steerAvoid(x,y,tdx,tdy,obstacles,entityR=12){
  // Normalize desired direction first so avoidance forces are always on the same scale
  const dLen = Math.hypot(tdx,tdy)||1;
  const ndx = tdx/dLen, ndy = tdy/dLen;
  let avX = 0, avY = 0;
  for (const obs of obstacles){
    if (obs.scene) continue; // skip decorative background objects — only solid boulders block
    const ddx = x-obs.cx, ddy = y-obs.cy;
    const dist = Math.hypot(ddx,ddy)||.01;
    const minD = obs.r + entityR + 8; // tighter buffer — less magnetic pull
    if (dist < minD){
      const t = Math.pow((minD-dist)/minD, 1.2); // gentler falloff
      avX += (ddx/dist)*t*2.2; // unit-scale avoidance (not pixel-scale 130)
      avY += (ddy/dist)*t*2.2;
    }
  }
  return {dx: ndx+avX, dy: ndy+avY};
}

/** Hard push-out: if entity overlaps any solid obstacle, teleport it to the surface */
function pushOutObstacles(x, y, obstacles, entityR=12){
  let nx=x, ny=y;
  for (const obs of obstacles){
    if (obs.scene) continue;
    const ddx = nx-obs.cx, ddy = ny-obs.cy;
    const dist = Math.hypot(ddx,ddy)||.01;
    const minD = obs.r + entityR;
    if (dist < minD){
      const push = (minD-dist)/dist;
      nx += ddx*push;
      ny += ddy*push;
    }
  }
  return {x:nx, y:ny};
}


const ENERGY_MAX   = 100;
const ENERGY_REGEN = 5;   // per second passive
const ENERGY_KILL  = 10;  // bonus per kill

const SKILLS = {
  // ── ACTIVE ────────────────────────────────────────────────────────────────
  starBurst:    {name:"Star Burst",    icon:"⭐",type:"active", cd:8000,  energy:25, desc:["AoE 28+STR dmg","AoE 42+STR dmg","AoE 60+STR dmg+push"],  dmg:[28,42,60],                unlock:{type:"stage",v:1}},
  healPulse:    {name:"Heal Pulse",    icon:"💚",type:"active", cd:15000, energy:30, desc:["Pulih 25+DEF×3 HP","Pulih 40+DEF×4 HP","Pulih 60+DEF×5 HP+DEF naik 3s"], healBase:[25,40,60], healDef:[3,4,5], unlock:{type:"stage",v:1}},
  shieldCube:   {name:"Shield Cube",   icon:"🛡️",type:"active", cd:12000, energy:20, desc:["Blok 1 serangan","Blok 2 serangan","Blok 3 serangan"],     blocks:[1,2,3],               unlock:{type:"stage",v:5}},
  speedRush:    {name:"Speed Rush",    icon:"⚡",type:"active", cd:10000, energy:15, desc:["2× SPD 3s","2× SPD 4.5s","2.5× SPD 6s"],                  dur:[3000,4500,6000],         unlock:{type:"deaths",v:1}},
  thunderStrike:{name:"Thunder",       icon:"🌩️",type:"active", cd:9000,  energy:35, desc:["35+STR×2 dmg+stun","52+STR×2 dmg+stun","78+STR×3 dmg+stun"], dmg:[35,52,78], strMult:[2,2,3], unlock:{type:"stage",v:8}},
  iceBlast:     {name:"Ice Blast",     icon:"❄️",type:"active", cd:11000, energy:30, desc:["Beku 2s+15dmg","Beku 3s+15dmg","Beku 4.5s+20dmg"],        dur:[2000,3000,4500], iceDmg:[15,15,20], unlock:{type:"stage",v:6}},
  flashStep:    {name:"Flash Step",    icon:"🌀",type:"active", cd:7000,  energy:20, desc:["Dash+20+STR dmg+0.6s inv","Dash+32+STR dmg+0.8s","Dash+48+STR×2 dmg+stun 1s"], dmg:[20,32,48], inv:[600,800,1200], unlock:{type:"stage",v:4}},
  battleCry:    {name:"Battle Cry",    icon:"📯",type:"active", cd:13000, energy:25, desc:["ATK+STR×4 selama 3s","ATK+STR×5 selama 4s","ATK+STR×7 selama 5s+10 HP pulih"], dur:[3000,4000,5000], atkBonus:[4,5,7], unlock:{type:"kills",v:15}},
  timeWarp:     {name:"Time Warp",     icon:"⏳",type:"active", cd:16000, energy:40, desc:["Slambat 50% 2s","Lambat 60% 3s","Lambat 80% 4s+AoE 15dmg"], slow:[.5,.6,.8], dur:[2000,3000,4000], unlock:{type:"stage",v:18}},
  spiritBomb:   {name:"Spirit Bomb",   icon:"🔵",type:"active", cd:22000, energy:50, desc:["Charge→80+STR×5 AoE","Charge→120+STR×6","Charge→180+STR×8+push"], dmg:[80,120,180], strMult:[5,6,8], unlock:{type:"stage",v:25}},
  // ── PASSIVE ───────────────────────────────────────────────────────────────
  thorns:       {name:"Thorns",        icon:"🌹",type:"passive",desc:["Balik DEF×2 dmg","Balik DEF×3 dmg","Balik DEF×4 dmg"],              defMult:[2,3,4],              unlock:{type:"kills",v:10}},
  regen:        {name:"Regen",         icon:"❤️",type:"passive",desc:["HP+1/s","HP+2/s","HP+3/s"],                                          rate:[1,2,3],                 unlock:{type:"stage",v:3}},
  berserker:    {name:"Berserker",     icon:"🔥",type:"passive",desc:["ATK+STR×3 saat HP<30","ATK+STR×4 saat HP<30","ATK+STR×6 saat HP<30"], strBonus:[3,4,6],            unlock:{type:"stage",v:12}},
  goldSense:    {name:"Gold Sense",    icon:"💰",type:"passive",desc:["+LUCK×2 gold tiap kill","+LUCK×3 gold tiap kill","LUCK×5 gold tiap kill"], luckMult:[2,3,5],         unlock:{type:"stage",v:10}},
  lifesteal:    {name:"Lifesteal",     icon:"🩸",type:"passive",desc:["Drain STR×1 HP per hit","Drain STR×2 HP per hit","Drain STR×3 HP per hit"], strMult:[1,2,3],         unlock:{type:"kills",v:50}},
  critStrike:   {name:"Crit Strike",   icon:"💥",type:"passive",desc:["20% crit ×2 dmg","30% crit ×2 dmg","40% crit ×2.5 dmg"],           chance:[.2,.3,.4],            unlock:{type:"stage",v:14}},
  barrier:      {name:"Barrier",       icon:"🔮",type:"passive",desc:["Regen DEF×0.5 HP/s","Regen DEF×1 HP/s","Regen DEF×1.5 HP/s"],      defMult:[0.5,1.0,1.5],       unlock:{type:"wins",v:5}},
  guardian:     {name:"Guardian",      icon:"🛡",type:"passive",desc:["Kurangi DEF×2 dmg","Kurangi DEF×3 dmg","Kurangi DEF×4 dmg"],       defMult:[2,3,4],              unlock:{type:"stage",v:15}},
  venomStrike:  {name:"Venom",         icon:"🐍",type:"passive",desc:["Racun 3dmg/s 3s","Racun 5dmg/s 3s","Racun 8dmg/s 4s"],            rate:[3,5,8],dur:[3,3,4],     unlock:{type:"kills",v:20}},
  mirrorImage:  {name:"Mirror",        icon:"🪞",type:"passive",desc:["Dodge 20% + DEF×1 balik","Dodge 30% + DEF×2 balik","Dodge 40% + DEF×3 balik"], chance:[.2,.3,.4], unlock:{type:"deaths",v:3}},
  lastStand:    {name:"Last Stand",    icon:"💀",type:"passive",desc:["ATK+STR×5 saat HP<15","ATK+STR×8+regen saat HP<15","ATK+STR×12+dodge saat HP<15"], strBonus:[5,8,12], unlock:{type:"deaths",v:5}},
  chainReact:   {name:"Chain React",   icon:"⛓️",type:"passive",desc:["Kill→STR×3 splash","Kill→STR×5 splash","Kill→STR×7+stun splash"], strMult:[3,5,7],              unlock:{type:"kills",v:80}},
};

const getSkillLv = (yuyu,id)=> (yuyu.skillLevels||{})[id]||1;

const skillLvIdx = (yuyu,id)=>Math.min(2,getSkillLv(yuyu,id)-1);

const skillUpgradeCost = lv=>lv===1?120:lv===2?280:null;

// ── SKILL UNLOCK CHECKER ────────────────────────────────────────────────────

function checkSkillUnlocks(yuyu,player,world,result){
  const newStage = result==="win"?world.stage+1:world.stage;
  const newDeaths = result==="lose"?(player.deaths||0)+1:(player.deaths||0);
  const totalKills = (player.totalKills||0);
  const wins = (yuyu.battleMemory?.consecutiveWins||0);
  const current = yuyu.unlockedSkills||["starBurst","healPulse"];
  const gained = [];
  Object.entries(SKILLS).forEach(([id,sk])=> {
    if (current.includes(id))return;
    const u = sk.unlock;
    if (!u)return;
    let met = false;
    if (u.type==="stage"&&newStage>=u.v)met=true;
    if (u.type==="deaths"&&newDeaths>=u.v)met=true;
    if (u.type==="kills"&&totalKills>=u.v)met=true;
    if (u.type==="wins"&&wins>=u.v)met=true;
    if (met)gained.push(id);
  });
  return gained;
}

// ── BATTLE MEMORY & STRATEGIES ─────────────────────────────────────────────

const STRATEGIES = {
  // id: { label, desc, icon, scoreAdjustment, selectWeight(ctx)→0-1 }
  hitRun:     {id:"hitRun",    icon:"🏃",label:"Hit & Run",   desc:"Serang→mundur cepat→ulangi"},
  kite:       {id:"kite",     icon:"🪁",label:"Kite",         desc:"Jaga jarak, circle-strafe"},
  burst:      {id:"burst",    icon:"💣",label:"Burst Down",   desc:"Kumpulkan skill, lepas sekaligus"},
  aggressive: {id:"aggressive",icon:"⚔️",label:"All-In",      desc:"Hajar tanpa ampun, full speed"},
  defensive:  {id:"defensive",icon:"🏰",label:"Defensive",    desc:"Tunggu opening, utamakan sustain"},
  crowdCtrl:  {id:"crowdCtrl",icon:"❄️",label:"CC Master",   desc:"Prioritas freeze/stun, kendalikan crowd"},
  focusFire:  {id:"focusFire",icon:"🎯",label:"Focus Fire",   desc:"Bunuh yang lemah duluan tanpa distraksi"},
  berserker:  {id:"berserker",icon:"😈",label:"Berserker",    desc:"Sengaja masuk damage untuk buff besar"},
};

const STRAT_IDS = Object.keys(STRATEGIES);

const INIT_BATTLE_MEMORY = {
  strategyScores:{hitRun:6,kite:5,burst:6,aggressive:8,defensive:5,crowdCtrl:5,focusFire:6,berserker:3},
  habitCounts:{},   // sid→count how many times used
  recentStrats:[],  // last 20 strategy picks
  consecutiveWins:0,
  totalBattles:0,
  dominantHabit:null, // strategy name if one is dominant
  totalSneaks:0,      // lifetime sneak hits landed
  sneakStunTotal:0,   // cumulative stun seconds dealt via sneak
};

// ─────────────────────────────────────────────────────────────────────────────
// YUYU MIND ENGINE v2.0 — "Pro Player Dewa Ahli Bela Diri"
// M1 MonsterProfiler · M2 ThreatValuator · M3 KillInstinct
// M4 BaitEngine · M5 FeastDetector · M6 ClusterLure · M7 MindFuser
// ─────────────────────────────────────────────────────────────────────────────
const YuyuMindEngine = (()=>{
  const _profiles=new Map();
  const MAX_ATK=14,MAX_POS=22;
  let _uid=0;
  const _stamp=m=>{if(m._yuid===undefined)m._yuid=++_uid;};
  const _prof=m=>{
    if(!_profiles.has(m._yuid))_profiles.set(m._yuid,{attackLog:[],posLog:[],pattern:null,baitFallen:0,lastHitT:-99});
    return _profiles.get(m._yuid);
  };

  // M1 — feed hit data, classify attack pattern
  function notifyMonsterHit(m,yuyu,t){
    _stamp(m);const p=_prof(m);
    p.attackLog.push({t,angle:Math.atan2(yuyu.y-m.y,yuyu.x-m.x)});
    if(p.attackLog.length>MAX_ATK)p.attackLog.shift();
    p.lastHitT=t;_classify(p);
  }
  function _classify(p){
    if(p.attackLog.length<4)return;
    const a=p.attackLog.map(e=>e.angle);
    const mean=a.reduce((s,v)=>s+v,0)/a.length;
    const variance=a.reduce((s,v)=>s+(v-mean)**2,0)/a.length;
    let burst=0;
    for(let i=1;i<p.attackLog.length;i++)if(p.attackLog[i].t-p.attackLog[i-1].t<1.2)burst++;
    const br=burst/(p.attackLog.length-1);
    let circ=0;
    if(p.posLog.length>=12){
      const dA=[];
      for(let i=2;i<p.posLog.length;i++)dA.push(Math.atan2(p.posLog[i].y-p.posLog[i-2].y,p.posLog[i].x-p.posLog[i-2].x));
      const dm=dA.reduce((s,v)=>s+v,0)/dA.length;
      circ=dA.reduce((s,v)=>s+(v-dm)**2,0)/dA.length;
    }
    if(circ>1.3)p.pattern='CIRCLER';
    else if(br>0.55)p.pattern='CHARGER';
    else if(variance<0.28)p.pattern='SNIPER';
    else if(variance>1.6)p.pattern='ERRATIC';
    else p.pattern='STANDARD';
  }
  // M1b — recency bias: predict next approach angle if last 3 were consistent
  const _predictApproach=m=>{
    _stamp(m);const log=_prof(m).attackLog;
    if(log.length<3)return null;
    const last3=log.slice(-3).map(e=>e.angle);
    for(let i=1;i<last3.length;i++){const d=Math.abs(last3[i]-last3[i-1]);if(Math.min(d,Math.PI*2-d)>0.75)return null;}
    return last3[last3.length-1];
  };
  const _recPos=(m,t)=>{_stamp(m);const p=_prof(m);p.posLog.push({x:m.x,y:m.y,t});if(p.posLog.length>MAX_POS)p.posLog.shift();};

  // M2 — real danger score beyond distance
  const _tv=(m,yuyu,t)=>{
    if(m.stunUntil>t||m.freezeUntil>t)return 0.01;
    const dist=Math.hypot(m.x-yuyu.x,m.y-yuyu.y)||1;
    const tta=dist/Math.max(m.spd,1);
    const p=_prof(m);
    const rh=p.attackLog.filter(e=>t-e.t<3).length;
    const bm=m.id==='megaboss'?3.5:m.id==='boss'?2.2:1;
    const pm={CHARGER:1.45,SNIPER:1.25,CIRCLER:1.15,ERRATIC:1.3,STANDARD:1}[p.pattern]||1;
    const hr=m.hp/Math.max(m.maxHp||m.hp,1);
    return(m.dmg/tta)*(1+rh*0.3)*bm*pm*(0.45+hr*0.55);
  };
  const _topThreat=(alive,yuyu,t)=>alive.reduce((best,m)=>_tv(m,yuyu,t)>_tv(best,yuyu,t)?m:best,alive[0]);

  // M3 — kill instinct: sniff finishing blows
  const _killTarget=(alive,yuyu)=>{
    const k=alive.filter(m=>m.hp/Math.max(m.maxHp||m.hp,1)<0.22);
    if(!k.length)return null;
    return k.reduce((a,b)=>Math.hypot(a.x-yuyu.x,a.y-yuyu.y)<Math.hypot(b.x-yuyu.x,b.y-yuyu.y)?a:b);
  };

  // M4 — bait engine: IDLE→PRESENTING→WAITING(jiggle)→PUNISHING
  const _b={state:'IDLE',target:null,startT:0,waitT:0,coolUntil:0,successes:0,vec:{dx:0,dy:0},pDir:1};
  function _runBait(yuyu,alive,t,isBoss){
    const hp=yuyu.hp/yuyu.maxHp;
    if(hp<0.38||!alive.length||t<_b.coolUntil)return{active:false};
    if(alive.length>2&&!isBoss)return{active:false};
    const vt=alive.filter(m=>m.hp/Math.max(m.maxHp||m.hp,1)>0.28);
    if(!vt.length)return{active:false};
    const bt=vt.sort((a,b)=>_tv(b,yuyu,t)-_tv(a,yuyu,t))[0];
    switch(_b.state){
      case'IDLE':
        if(hp>0.50&&Math.random()<0.28){
          _b.state='PRESENTING';_b.target=bt;_b.startT=t;
          const d=Math.hypot(bt.x-yuyu.x,bt.y-yuyu.y)||1;
          _b.vec={dx:(bt.x-yuyu.x)/d,dy:(bt.y-yuyu.y)/d};
        }
        return{active:false};
      case'PRESENTING':{
        const dt2=Math.hypot(bt.x-yuyu.x,bt.y-yuyu.y);
        if(t-_b.startT>0.85||dt2<68){_b.state='WAITING';_b.waitT=t;}
        return{active:true,phase:'PRESENTING',vec:_b.vec,spd:1.0};
      }
      case'WAITING':{
        const dt2=Math.hypot(_b.target.x-yuyu.x,_b.target.y-yuyu.y);
        if(dt2<52&&_b.target.spd>18){
          _b.state='PUNISHING';_b.startT=t;_b.successes++;
          _prof(_b.target).baitFallen++;
          const ax=yuyu.x-_b.target.x,ay=yuyu.y-_b.target.y,al=Math.hypot(ax,ay)||1;
          _b.pDir=Math.random()<.5?1:-1;
          const px=-ay/al*_b.pDir,py=ax/al*_b.pDir;
          _b.vec={dx:px*0.72+ax/al*0.28,dy:py*0.72+ay/al*0.28};
        }
        if(t-_b.waitT>1.15){_b.state='IDLE';_b.coolUntil=t+4+Math.random()*3;return{active:false};}
        return{active:true,phase:'WAITING',vec:{dx:Math.sin(t*7)*0.18,dy:Math.cos(t*5.5)*0.12},spd:0.28};
      }
      case'PUNISHING':{
        const el=t-_b.startT;
        const dt2=Math.hypot(_b.target.x-yuyu.x,_b.target.y-yuyu.y);
        if(el>0.42&&dt2<=40){_b.state='IDLE';_b.coolUntil=t+3+Math.random()*2;
          return{active:true,phase:'PUNISH_ATTACK',attackTarget:_b.target,vec:{dx:0,dy:0},spd:1.6};}
        if(el>0.42){const dx=_b.target.x-yuyu.x,dy=_b.target.y-yuyu.y,d=Math.hypot(dx,dy)||1;
          return{active:true,phase:'PUNISH_RUSH',attackTarget:_b.target,vec:{dx:dx/d,dy:dy/d},spd:1.85};}
        return{active:true,phase:'PUNISHING',vec:_b.vec,spd:1.7};
      }
    }
    return{active:false};
  }

  // M5 — feast: dump skills when multiple enemies are disabled
  const _feast=(alive,t)=>{
    const st=alive.filter(m=>m.stunUntil>t||m.freezeUntil>t).length;
    const sc=st*3+alive.filter(m=>m.warpUntil>t).length*1.5+alive.filter(m=>m.poisonUntil>t).length+alive.filter(m=>m.hp/Math.max(m.maxHp||m.hp,1)<0.28).length*2;
    return{active:sc>=4,priority:alive.filter(m=>m.stunUntil>t||m.freezeUntil>t||m.hp/Math.max(m.maxHp||m.hp,1)<.28).sort((a,b)=>a.hp-b.hp)};
  };

  // M6 — cluster lure: optimal convergence point for AoE
  const _lure=(alive,yuyu,CW,CH)=>{
    if(alive.length<3)return null;
    const cx=alive.reduce((s,m)=>s+m.x,0)/alive.length,cy=alive.reduce((s,m)=>s+m.y,0)/alive.length;
    const ax=yuyu.x-cx,ay=yuyu.y-cy,al=Math.hypot(ax,ay)||1;
    return{x:Math.max(40,Math.min(CW-40,cx+ax/al*68)),y:Math.max(30,Math.min(CH-40,cy+ay/al*68))};
  };

  // M7 — mind fuser: synthesize all modules into one decision
  function tick(yuyu,alive,game){
    const t=game.t,CW=game.CW||400,CH=game.CH||600,hp=yuyu.hp/yuyu.maxHp,isBoss=!!(game.isBoss||game.isMegaBoss);
    if(Math.floor(t*7)%2===0)alive.forEach(m=>_recPos(m,t));
    const killTgt=_killTarget(alive,yuyu),bait=_runBait(yuyu,alive,t,isBoss);
    const feast=_feast(alive,t),lure=_lure(alive,yuyu,CW,CH);
    const topThreat=alive.length?_topThreat(alive,yuyu,t):null;
    let out={mode:'STRATEGY',target:topThreat,moveVector:null,spdMult:1.0,forceAttack:false,skillHints:[],mindState:'strategy'};

    if(bait.active){
      const ip=bait.phase==='PUNISH_ATTACK'||bait.phase==='PUNISH_RUSH';
      out={...out,mode:ip?'BAIT_PUNISH':'BAIT_SETUP',target:bait.attackTarget||topThreat,
        moveVector:bait.vec,spdMult:bait.spd,forceAttack:bait.phase==='PUNISH_ATTACK',
        mindState:ip?'punishing':'baiting',skillHints:ip?['flashStep','thunderStrike','starBurst','battleCry']:[]};
    }else if(killTgt&&hp>0.26){
      const dx=killTgt.x-yuyu.x,dy=killTgt.y-yuyu.y,d=Math.hypot(dx,dy)||1;
      out={...out,mode:'KILL_INSTINCT',target:killTgt,spdMult:1.42,mindState:'kill_instinct',
        moveVector:{dx:dx/d,dy:dy/d},skillHints:['flashStep','thunderStrike','starBurst']};
    }else if(feast.active&&feast.priority.length){
      const ft=feast.priority[0],dx=ft.x-yuyu.x,dy=ft.y-yuyu.y,d=Math.hypot(dx,dy)||1;
      out={...out,mode:'FEAST',target:ft,spdMult:1.28,mindState:'feast',
        moveVector:{dx:dx/d,dy:dy/d},skillHints:['battleCry','starBurst','spiritBomb','thunderStrike']};
    }else if(lure&&hp>0.55&&alive.length>=3){
      const dl=Math.hypot(lure.x-yuyu.x,lure.y-yuyu.y);
      if(dl>42){const dx=lure.x-yuyu.x,dy=lure.y-yuyu.y,d=Math.hypot(dx,dy)||1;
        out={...out,mode:'CLUSTER_LURE',moveVector:{dx:dx/d,dy:dy/d},spdMult:1.1,mindState:'luring',skillHints:['iceBlast','timeWarp','starBurst']};}
    }else if(topThreat){
      out={...out,mode:'THREAT_FOCUS',target:topThreat,mindState:'calculated'};
      const pred=_predictApproach(topThreat);
      if(pred!==null){
        const dist=Math.hypot(topThreat.x-yuyu.x,topThreat.y-yuyu.y)||1,bl=dist<85?0.58:0.22;
        const dx=(topThreat.x-yuyu.x)/dist,dy=(topThreat.y-yuyu.y)/dist;
        out.moveVector={dx:dx*(1-bl)+(-Math.sin(pred))*bl,dy:dy*(1-bl)+(Math.cos(pred))*bl};
        out.mindState='pattern_read';
      }
    }
    // Pattern-specific skill hints
    if(topThreat){const pat=_prof(topThreat).pattern;
      if(pat==='CHARGER'&&!out.skillHints.includes('iceBlast'))out.skillHints.unshift('iceBlast');
      if(pat==='CIRCLER'&&!out.skillHints.includes('timeWarp'))out.skillHints.unshift('timeWarp');
      if(pat==='SNIPER'&&!out.skillHints.includes('flashStep'))out.skillHints.unshift('flashStep');
      if(pat==='ERRATIC'&&!out.skillHints.includes('thunderStrike'))out.skillHints.unshift('thunderStrike');
    }
    return out;
  }

  function init(){_profiles.clear();Object.assign(_b,{state:'IDLE',target:null,startT:0,waitT:0,coolUntil:0,successes:0});}
  return{tick,init,reset:init,notifyMonsterHit,_profPublic:(m)=>{_stamp(m);return _prof(m);}};
})();

// ── BATTLE DECISION ENGINE ──────────────────────────────────────────────────
// Threat levels drive hard overrides before memory-based weighted selection

const THREAT = {SAFE:0,CAUTIOUS:1,DANGER:2,CRITICAL:3,LETHAL:4};

function assessThreat(yuyu,alive,game){
  const hpPct = yuyu.hp/yuyu.maxHp;
  // Incoming DPS estimate: sum monster dmg / avg hitInterval for nearby monsters
  const nearby = alive.filter(m=>Math.hypot(m.x-yuyu.x,m.y-yuyu.y)<120);
  const dps = nearby.reduce((s,m)=>s+m.dmg/1.4,0); // 1.4s hit interval
  const ttd = dps>0?yuyu.hp/dps:999; // time-to-death in seconds
  // Encirclement: monsters spread around yuyu
  const angles = nearby.map(m=>Math.atan2(m.y-yuyu.y,m.x-yuyu.x));
  let maxGap = 0;
  if (angles.length>=2){
    const sorted = [...angles].sort((a,b)=>a-b);
    sorted.push(sorted[0]+Math.PI*2);
    for (let i = 1; i < sorted.length;i++)maxGap=Math.max(maxGap,sorted[i]-sorted[i-1]);
  }
  const encircled = angles.length>=3&&maxGap<Math.PI*1.1; // <200deg gap = trapped

  // Threat level
  if (hpPct<0.1||ttd<1.5)return THREAT.LETHAL;
  if (hpPct<0.2||ttd<3||encircled)return THREAT.CRITICAL;
  if (hpPct<0.35||ttd<6)return THREAT.DANGER;
  if (hpPct<0.55||nearby.length>=3)return THREAT.CAUTIOUS;
  return THREAT.SAFE;
}

function selectStrategy(mem,yuyu,alive,game){
  const hpPct = yuyu.hp/yuyu.maxHp;
  const n = alive.length;
  const isBoss = game.isBoss||game.isMegaBoss;
  const threat = assessThreat(yuyu,alive,game);
  const hasBerserker = game.hasBerserker;
  const hasLifesteal = game.hasLifesteal;
  const hasRegen = game.hasRegen||game.hasBarrier;

  // ── HARD OVERRIDES: certain threats force a strategy, no randomness ──
  // LETHAL: always survival — only break if berserker+lifesteal combo makes all-in viable
  if (threat===THREAT.LETHAL){
    if (hasBerserker&&hasLifesteal&&hpPct>0.05)return"berserker"; // death-or-glory heal-through
    return"defensive";
  }
  // CRITICAL: never aggressive, never berserker unless sustain exists
  if (threat===THREAT.CRITICAL){
    if (hasBerserker&&(hasLifesteal||hasRegen)&&isBoss)return"kite"; // kite+berserker combo vs boss
    if (n>=4)return"crowdCtrl"; // CC first when surrounded
    return"defensive";
  }
  // DANGER vs boss: no aggressive all-in
  if (threat===THREAT.DANGER&&isBoss&&hpPct<0.4){
    return"hitRun"; // safe poke only
  }
  // When berserker passive is equipped and hp is low (but not critical), lean into it
  if (hasBerserker&&hpPct<0.3&&hpPct>0.15&&!isBoss){
    return"berserker";
  }

  // ── CONTEXTUAL WEIGHTED SELECTION (memory + situation) ──
  const scores = {...mem.strategyScores};

  // Blank-slate situational bonuses
  if (n>=5){scores.crowdCtrl+=35;scores.burst+=20;}
  else if (n>=3){scores.crowdCtrl+=15;scores.burst+=12;}
  if (isBoss&&n===1){scores.kite+=30;scores.hitRun+=22;scores.defensive+=15;}
  if (hpPct>0.8){scores.aggressive+=18;scores.burst+=10;}
  if (hpPct>0.6&&!isBoss){scores.aggressive+=10;}
  if (hpPct<0.5){scores.aggressive=1;} // nerf aggressive when hurt
  if (hpPct<0.4){scores.berserker=Math.min(scores.berserker,hasBerserker?scores.berserker:1);}
  // Boss phase: second phase (hp<50%) gets more cautious weight
  const bossPhase = isBoss&&alive[0]&&alive[0].hp/alive[0].maxHp<0.5;
  if (bossPhase){scores.kite+=15;scores.hitRun+=10;scores.defensive+=8;}
  // Punish strategies that died recently more (tracked in memory)
  // Speed-dependent: if Yuyu is fast, kite/hitRun more viable
  const iseFast = (yuyu.spd||55)>80;
  if (iseFast){scores.kite+=12;scores.hitRun+=10;}
  // Habit loyalty bonus
  if (mem.dominantHabit)scores[mem.dominantHabit]=(scores[mem.dominantHabit]||0)+22;

  // Kill completely non-viable strategies
  if (!hasBerserker)scores.berserker=1;
  STRAT_IDS.forEach(k=> {if (scores[k]<1)scores[k]=1;});

  // Weighted pick
  const total = STRAT_IDS.reduce((a,k)=>a+scores[k],0);
  let r = Math.random()*total;
  for (const k of STRAT_IDS){r-=scores[k];if (r<=0)return k;}
  return"aggressive";
}

function updateMemoryAfterBattle(mem,result,strategyUsed,sneakHits=0,sneakStunTotal=0){
  const newMem = {...mem,
    totalBattles:(mem.totalBattles||0)+1,
    consecutiveWins:result==="win"?(mem.consecutiveWins||0)+1:0,
    recentStrats:[...(mem.recentStrats||[]).slice(-19),strategyUsed].filter(Boolean),
    strategyScores:{...mem.strategyScores},
    habitCounts:{...mem.habitCounts},
    totalSneaks:(mem.totalSneaks||0)+sneakHits,
    sneakStunTotal:(mem.sneakStunTotal||0)+sneakStunTotal,
  };
  if (strategyUsed){
    const delta = result==="win"?3:result==="lose"?-1:0;
    newMem.strategyScores[strategyUsed]=Math.max(1,(newMem.strategyScores[strategyUsed]||5)+delta);
    newMem.habitCounts[strategyUsed]=(newMem.habitCounts[strategyUsed]||0)+1;
  }
  // Determine dominant habit (used >= 40% of recent 20 battles)
  const freq = {};
  (newMem.recentStrats||[]).forEach(s=> {freq[s]=(freq[s]||0)+1;});
  const dom = STRAT_IDS.find(k=> (freq[k]||0)>=8);
  newMem.dominantHabit=dom||null;
  return newMem;
}

const EQUIPMENT = {
  weapon:[
    {id:"ironSword", name:"Iron Sword", icon:"🗡️",cost:80, bonus:{str:2},       desc:"+2 STR"},
    {id:"steelBow",  name:"Steel Bow",  icon:"🏹",cost:130,bonus:{str:2,spd:2}, desc:"+2 STR +2 SPD"},
    {id:"magicStaff",name:"Magic Staff",icon:"🪄",cost:180,bonus:{str:3,luck:2},desc:"+3 STR +2 LUCK"},
    {id:"darkBlade", name:"Dark Blade", icon:"⚔️",cost:320,bonus:{str:6},       desc:"+6 STR"},
  ],
  armor:[
    {id:"leather",   name:"Leather",    icon:"🧥",cost:60, bonus:{def:2},       desc:"+2 DEF"},
    {id:"chainMail", name:"Chain Mail", icon:"🛡️",cost:110,bonus:{def:3,hp:1},  desc:"+3 DEF +1 HP"},
    {id:"plateMail", name:"Plate Mail", icon:"🦺",cost:200,bonus:{def:5,hp:2},  desc:"+5 DEF +2 HP"},
    {id:"voidCloak", name:"Void Cloak", icon:"🌑",cost:360,bonus:{def:4,luck:3},desc:"+4 DEF +3 LUCK"},
  ],
  accessory:[
    {id:"luckRing",  name:"Lucky Ring", icon:"💍",cost:70, bonus:{luck:3},      desc:"+3 LUCK"},
    {id:"speedBoots",name:"Speed Boots",icon:"👟",cost:120,bonus:{spd:3},       desc:"+3 SPD"},
    {id:"goldAmulet",name:"Gold Amulet",icon:"📿",cost:160,bonus:{luck:2,hp:2}, desc:"+2 LUCK +2 HP"},
    {id:"crown",     name:"Crown",      icon:"👑",cost:400,bonus:{str:2,def:2,spd:2,hp:2,luck:2},desc:"+2 semua stat"},
  ],
};

const ALL_EQUIP = [...EQUIPMENT.weapon,...EQUIPMENT.armor,...EQUIPMENT.accessory];

// ─────────────────────────────────────────────────────────────────────────────
// WEAPON RANGES — melee vs ranged (bow/staff attack from afar)
// ─────────────────────────────────────────────────────────────────────────────
const WEAPON_RANGE = {
  ironSword : { atk: 30,  preferred: 30,  style: "melee"  },
  darkBlade : { atk: 32,  preferred: 30,  style: "melee"  },
  steelBow  : { atk: 130, preferred: 100, style: "ranged" },
  magicStaff: { atk: 115, preferred: 90,  style: "ranged" },
};
const getWeaponRange = weapon => WEAPON_RANGE[weapon] || WEAPON_RANGE.ironSword;

// ─────────────────────────────────────────────────────────────────────────────
// SKILL MECHANICS — targeting type + ideal conditions for each active skill
// ─────────────────────────────────────────────────────────────────────────────
const SKILL_MECHANICS = {
  // AoE skills: best when many enemies clustered near Yuyu
  starBurst   : { targeting:"aoe_self",   idealEnemies:3, idealRange:80,  note:"AoE di sekitar Yuyu" },
  spiritBomb  : { targeting:"aoe_self",   idealEnemies:3, idealRange:120, note:"Charge lalu AoE besar" },
  // Targeted single/area skills: pick best target manually
  thunderStrike:{ targeting:"aoe_all",    idealEnemies:2, idealRange:999, note:"Stun semua musuh" },
  iceBlast    : { targeting:"aoe_all",    idealEnemies:2, idealRange:999, note:"Freeze semua musuh" },
  timeWarp    : { targeting:"aoe_all",    idealEnemies:2, idealRange:999, note:"Slambatin semua musuh" },
  flashStep   : { targeting:"single_best",idealEnemies:1, idealRange:999, note:"Dash ke target, stun" },
  battleCry   : { targeting:"self",       idealEnemies:1, idealRange:999, note:"Buff ATK sementara" },
  // Utility skills
  healPulse   : { targeting:"self",       idealEnemies:0, idealRange:999, note:"Pulihkan HP" },
  shieldCube  : { targeting:"self",       idealEnemies:0, idealRange:999, note:"Blok serangan" },
  speedRush   : { targeting:"self",       idealEnemies:0, idealRange:999, note:"Speed burst" },
};

// ─────────────────────────────────────────────────────────────────────────────
// FOV SYSTEM — Field of View per monster type
// fov    : half-angle in radians (so full cone = fov*2)
// vRange : max detection range in px
// alertDur : how long monster chases after losing sight (seconds)
// ─────────────────────────────────────────────────────────────────────────────
const DEG = Math.PI / 180;
const MFOV = {
  //            fov(half°)  vRange  alertDur  note
  slime   : { fov: 50*DEG, vRange:130, alertDur:2.0 }, // dumb, short sight
  spike   : { fov: 40*DEG, vRange:110, alertDur:1.5 }, // stationary, tunnel vision
  dash    : { fov: 75*DEG, vRange:220, alertDur:2.5 }, // fast & wide-aware
  tank    : { fov: 45*DEG, vRange:160, alertDur:2.0 }, // heavy, narrow focus
  phantom : { fov:100*DEG, vRange:260, alertDur:3.0 }, // near-360, spooky
  golem   : { fov: 35*DEG, vRange:190, alertDur:1.8 }, // huge but near-blind sides
  boss    : { fov: 90*DEG, vRange:999, alertDur:999  }, // always chasing
  megaboss: { fov:180*DEG, vRange:999, alertDur:999  }, // omniscient
};

/** Returns angle offset (0=direct front, π=dead behind) from monster to target */
const getFovAngle = (m, tx, ty) => {
  const toTarget = Math.atan2(ty - m.y, tx - m.x);
  let diff = toTarget - (m.facing ?? 0);
  // Normalize to [-π, π]
  while (diff >  Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return Math.abs(diff); // 0 = straight ahead, π = dead behind
};

/** True if Yuyu is within monster's vision cone AND range */
const isInFOV = (m, tx, ty) => {
  const fov = MFOV[m.id] || MFOV.slime;
  const dist = Math.hypot(tx - m.x, ty - m.y);
  if (dist > fov.vRange) return false;
  return getFovAngle(m, tx, ty) <= fov.fov;
};

/** Stun duration for blind-spot attack: 0 at front, 3s at dead behind */
const getBlindSpotStun = (m, attackFromX, attackFromY) => {
  const angle = getFovAngle(m, attackFromX, attackFromY); // 0–π
  const fov = MFOV[m.id] || MFOV.slime;
  const halfFront = fov.fov; // the "safe" zone angle
  if (angle <= halfFront) return 0; // hit from within FOV = no bonus stun
  // Beyond FOV edge: scale 0→3s as angle goes halfFront→π
  const beyond = (angle - halfFront) / (Math.PI - halfFront);
  return beyond * 3.0;
};

const MTYPES = [
  {id:"slime",   name:"Slime",   color:"#22c55e",w:16,hp:30, dmg:5, spd:35,reward:8  },
  {id:"spike",   name:"Spike",   color:"#f97316",w:18,hp:20, dmg:15,spd:5, reward:10 },
  {id:"dash",    name:"Dash",    color:"#ef4444",w:14,hp:15, dmg:8, spd:90,reward:12 },
  {id:"tank",    name:"Tank",    color:"#92400e",w:22,hp:80, dmg:10,spd:18,reward:20 },
  {id:"phantom", name:"Phantom", color:"#a78bfa",w:16,hp:25, dmg:12,spd:55,reward:18 },
  {id:"golem",   name:"Golem",   color:"#475569",w:26,hp:120,dmg:14,spd:10,reward:32 },
  {id:"boss",    name:"BOSS",    color:"#7e22ce",w:32,hp:200,dmg:20,spd:28,reward:80 },
  {id:"megaboss",name:"MEGA",    color:"#dc2626",w:42,hp:450,dmg:30,spd:20,reward:250},
];

const DLG = {
  kill:["Satu lagi!","Gampang!","Kena kamu!","Lemah~","Hehehe~"],
  hurt:["Aduh... sakit...","Nggak boleh kalah di sini!","Ugh..."],
  win:["MENANG! Gimana? Keren kan?","Yuyu yang terbaik!","Hehe~ gampang kok!","Yeay~! 🎉"],
  lose:["Tolong... revive Yuyu~","Hiks... kalah...","Maaf gagal...","T-tolong..."],
  revive:["Makasih! Yuyu balik!","Siap tempur lagi~!","Kita balas dendam!"],
  ascend:["Yuyu sekarang LEBIH KUAT dari sebelumnya!","Ascended! Kita mulai lagi!","Reborn~! ✨"],
};

const pick = arr=>arr[Math.floor(Math.random()*arr.length)];

const MILESTONES = {
  5: {label:"🌲 Forest Cleared!",gold:100,msg:"Forest takluk! Biome baru menanti!"},
  10:{label:"🎁 Dungeon Master!", gold:200,msg:"Equipment system terbuka! Siapkan gear terbaik!",unlock:"equip"},
  15:{label:"💎 Crystal Legend!",gold:300,msg:"Crystal Cave conquered! Terus maju!"},
  20:{label:"☁️ Sky Walker!",    gold:400,msg:"Langit sudah digenggam! Prestige hint unlock!",unlock:"prestige_hint"},
  25:{label:"🏰 Fortress Lord!", gold:500,msg:"Dark Fortress jatuh! ASCENSION AWAITS!",unlock:"ascension"},
  30:{label:"🌀 Void Walker!",   gold:800,msg:"Void Realm... biome tak terbayangkan. LEGENDARY!"},
};

const DEFAULT_SETTINGS = {
  // ── GAMEPLAY ──────────────────────────────────────────────────────────────
  gameSpeed:1,           // .5 | .75 | 1 | 1.5 | 2
  difficulty:"normal",   // easy | normal | hard | extreme
  monsterCount:"normal", // few | normal | many | chaos
  autoRevive:false,      // bool — auto-spend gold on revive
  campRegen:"normal",    // off | slow | normal | fast
  xpMult:1,             // 0.5 | 1 | 2 | 3
  goldMult:1,           // 0.5 | 1 | 2 | 3
  // ── COMBAT ───────────────────────────────────────────────────────────────
  yuyuAtkSpeed:"normal", // slow | normal | fast | ultra
  yuyuMoveSpeed:"normal",// slow | normal | fast | ultra
  skillCooldown:"normal",// long | normal | short | instant
  monsterAggression:"normal", // passive | normal | aggressive | feral
  invincible:false,      // bool — cheat: yuyu never takes damage
  oneHitKill:false,      // bool — cheat: yuyu kills in one hit
  // ── VISUAL ───────────────────────────────────────────────────────────────
  particles:"low",       // off | low | high
  damageNumbers:true,    // bool
  screenShake:"normal",  // off | light | normal | heavy
  showCombo:true,        // bool
  showStrategy:true,     // bool — show strategy/threat badge
  showFps:false,         // bool
  hudOpacity:100,        // 60 | 80 | 100
  highQuality:true,      // bool
  // ── AI / DIALOG ──────────────────────────────────────────────────────────
  dialogFreq:"normal",   // off | rare | normal | often
  dialogLength:"normal", // short | normal | long
  battleDialog:true,     // bool — in-battle one-liners
  chatEnabled:true,      // bool — chat reply from Yuyu
  // ── VOICE (Web Speech API) ───────────────────────────────────────────────
  voiceEnabled:true,     // bool — Yuyu speaks out loud
  voiceVol:0.85,         // 0.25 | 0.5 | 0.85 | 1.0
  voiceRate:1.15,        // 0.8 | 1.0 | 1.15 | 1.4 — speech speed
  voicePitch:1.5,        // 1.0 | 1.3 | 1.5 | 1.8 — voice pitch
  // ── PLAYER ───────────────────────────────────────────────────────────────
  masterVol:.65, sfxVol:0.55, sfxEnabled:true, musicVol:0.40, musicEnabled:true,
  playerName:"Papa",
};

// ─────────────────────────────────────────────────────────────────────────────
// YUYU VOICE ENGINE — Web Speech API TTS
// Strips emoji/asterisks, picks best Indonesian/female voice, respects settings.
// ─────────────────────────────────────────────────────────────────────────────
const YuyuVoice = (() => {
  let _voices = [];
  let _ready   = false;

  // Load voices — async on some browsers
  const _load = () => {
    _voices = window.speechSynthesis?.getVoices() || [];
    if (_voices.length) _ready = true;
  };
  _load();
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.addEventListener("voiceschanged", _load);
  }

  // Pick best voice: prefer Indonesian, then female, then any
  const _pickVoice = () => {
    if (!_voices.length) _load();
    const id  = _voices.find(v => /id[-_]ID|id[-_]id|Indonesian/i.test(v.lang));
    const fem = _voices.find(v => /female|woman|zira|samantha|karen|tessa|moira|fiona|victoria|susan|amelie|anna|paulina/i.test(v.name));
    return id || fem || _voices[0] || null;
  };

  // Strip emoji, action text (*...*), and excess punctuation for cleaner TTS
  const _clean = txt =>
    txt
      .replace(/\*[^*]*\*/g, "")           // *aksi fisik*
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, "") // emoji
      .replace(/[★✦✨🔥💀👑🎉🌸💔]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

  const _doSpeak = (clean, settings) => {
    const utt = new SpeechSynthesisUtterance(clean);
    utt.volume = settings.voiceVol  ?? 0.85;
    utt.rate   = settings.voiceRate ?? 1.15;
    utt.pitch  = settings.voicePitch ?? 1.5;
    utt.lang   = "id-ID";
    const voice = _pickVoice();
    if (voice) utt.voice = voice;
    // Handle Chrome desktop bug where synthesis stalls after ~15s of silence
    utt.onend = () => {};
    utt.onerror = () => {};
    window.speechSynthesis.speak(utt);
  };

  const speak = (txt, settings = {}) => {
    if (!window.speechSynthesis) return;
    if (settings.voiceEnabled === false) return;
    const clean = _clean(txt);
    if (!clean) return;

    // Resume first — iOS/Chrome suspend synthesis when tab is backgrounded
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    window.speechSynthesis.cancel();

    // If voices not loaded yet, wait for them (happens on first page load)
    if (!_voices.length) {
      _load();
      if (!_voices.length) {
        // Retry after a short delay — voices load asynchronously
        setTimeout(() => {
          _load();
          _doSpeak(clean, settings);
        }, 250);
        return;
      }
    }

    _doSpeak(clean, settings);
  };

  const stop = () => {
    try { window.speechSynthesis?.cancel(); } catch(e) {}
  };

  return { speak, stop };
})();

// ─────────────────────────────────────────────────────────────────────────────
// SFX ENGINE — Procedural Web Audio API
// Zero external files. All sounds synthesized from oscillators + noise.
// ─────────────────────────────────────────────────────────────────────────────
const SFX = (() => {
  let _actx = null, _vol = 0.55, _musicVol = 0.40, _enabled = true, _campNode = null;
  const ac = () => {
    if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
    if (_actx.state === "suspended") _actx.resume();
    return _actx;
  };
  const mkGain = (a, v) => { const g = a.createGain(); g.gain.value = v; return g; };
  const mkNoise = (a, dur) => {
    const len = a.sampleRate * dur, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = a.createBufferSource(); src.buffer = buf; return src;
  };
  const mkOsc = (a, type, freq) => { const o = a.createOscillator(); o.type = type; o.frequency.value = freq; return o; };

  const defs = {
    atk(a,t){const n=mkNoise(a,.09),f=a.createBiquadFilter(),g=mkGain(a,_vol*.45);f.type="bandpass";f.frequency.value=1800;f.Q.value=1.5;f.frequency.linearRampToValueAtTime(3200,t+.09);n.connect(f);f.connect(g);g.connect(a.destination);g.gain.setValueAtTime(_vol*.45,t);g.gain.exponentialRampToValueAtTime(.001,t+.09);n.start(t);n.stop(t+.09);},
    crit(a,t){const o=mkOsc(a,"sine",180),g=mkGain(a,_vol*.85);o.connect(g);g.connect(a.destination);o.frequency.exponentialRampToValueAtTime(38,t+.18);g.gain.setValueAtTime(_vol*.85,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.start(t);o.stop(t+.2);const n=mkNoise(a,.05),f=a.createBiquadFilter(),g2=mkGain(a,_vol*.6);f.type="highpass";f.frequency.value=3000;n.connect(f);f.connect(g2);g2.connect(a.destination);g2.gain.setValueAtTime(_vol*.6,t);g2.gain.exponentialRampToValueAtTime(.001,t+.05);n.start(t);n.stop(t+.05);},
    hit(a,t){const o=mkOsc(a,"sine",110),g=mkGain(a,_vol*.75);o.connect(g);g.connect(a.destination);o.frequency.exponentialRampToValueAtTime(50,t+.2);g.gain.setValueAtTime(_vol*.75,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);o.start(t);o.stop(t+.25);},
    kill(a,t){const o=mkOsc(a,"triangle",400),g=mkGain(a,_vol*.5);o.connect(g);g.connect(a.destination);o.frequency.exponentialRampToValueAtTime(120,t+.12);g.gain.setValueAtTime(_vol*.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.start(t);o.stop(t+.14);},
    killBoss(a,t){[0,.04,.09].forEach((d,i)=>{const o=mkOsc(a,"sawtooth",280-i*55),g=mkGain(a,_vol*.6);o.connect(g);g.connect(a.destination);o.frequency.exponentialRampToValueAtTime(50,t+d+.25);g.gain.setValueAtTime(_vol*.6,t+d);g.gain.exponentialRampToValueAtTime(.001,t+d+.28);o.start(t+d);o.stop(t+d+.28);});},
    shield(a,t){const o=mkOsc(a,"square",700),g=mkGain(a,_vol*.35);o.connect(g);g.connect(a.destination);o.frequency.exponentialRampToValueAtTime(180,t+.1);g.gain.setValueAtTime(_vol*.35,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.start(t);o.stop(t+.12);},
    // Block stance — low defensive thud
    block(a,t){const o=mkOsc(a,"square",320),g=mkGain(a,_vol*.28);o.connect(g);g.connect(a.destination);o.frequency.exponentialRampToValueAtTime(140,t+.08);g.gain.setValueAtTime(_vol*.28,t);g.gain.exponentialRampToValueAtTime(.001,t+.1);o.start(t);o.stop(t+.1);},
    // Parry success — sharp bright ping + stun crack
    parry(a,t){const o=mkOsc(a,"sine",1400),g=mkGain(a,_vol*.7);o.connect(g);g.connect(a.destination);o.frequency.exponentialRampToValueAtTime(2200,t+.06);g.gain.setValueAtTime(_vol*.7,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.start(t);o.stop(t+.12);const o2=mkOsc(a,"triangle",440),g2=mkGain(a,_vol*.5);o2.connect(g2);g2.connect(a.destination);g2.gain.setValueAtTime(0,t+.05);g2.gain.linearRampToValueAtTime(_vol*.5,t+.08);g2.gain.exponentialRampToValueAtTime(.001,t+.32);o2.start(t+.05);o2.stop(t+.32);},
    // Chip damage (flee graze) — soft low hit
    graze(a,t){const o=mkOsc(a,"sine",80),g=mkGain(a,_vol*.4);o.connect(g);g.connect(a.destination);o.frequency.exponentialRampToValueAtTime(40,t+.12);g.gain.setValueAtTime(_vol*.4,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.start(t);o.stop(t+.14);},
    dodge(a,t){const n=mkNoise(a,.11),f=a.createBiquadFilter(),g=mkGain(a,_vol*.35);f.type="bandpass";f.frequency.value=2400;f.Q.value=2;f.frequency.exponentialRampToValueAtTime(700,t+.11);n.connect(f);f.connect(g);g.connect(a.destination);g.gain.setValueAtTime(_vol*.35,t);g.gain.exponentialRampToValueAtTime(.001,t+.11);n.start(t);n.stop(t+.11);},
    skill(a,t){[0,.03,.07].forEach((d,i)=>{const o=mkOsc(a,"sine",660+i*220),g=mkGain(a,_vol*.3);o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(_vol*.3,t+d+.03);g.gain.exponentialRampToValueAtTime(.001,t+d+.2);o.start(t+d);o.stop(t+d+.2);});},
    heal(a,t){const o=mkOsc(a,"sine",330),g=mkGain(a,_vol*.5);o.connect(g);g.connect(a.destination);o.frequency.exponentialRampToValueAtTime(660,t+.28);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(_vol*.5,t+.05);g.gain.exponentialRampToValueAtTime(.001,t+.32);o.start(t);o.stop(t+.32);},
    combo(a,t){[523,659,784,1047].forEach((f,i)=>{const o=mkOsc(a,"sine",f),g=mkGain(a,_vol*.4);o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(0,t+i*.07);g.gain.linearRampToValueAtTime(_vol*.4,t+i*.07+.02);g.gain.exponentialRampToValueAtTime(.001,t+i*.07+.18);o.start(t+i*.07);o.stop(t+i*.07+.18);});},
    win(a,t){[[523,0],[659,.1],[784,.2],[1047,.32],[1319,.46]].forEach(([f,d])=>{const o=mkOsc(a,"triangle",f),g=mkGain(a,_vol*.5);o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(_vol*.5,t+d+.04);g.gain.exponentialRampToValueAtTime(.001,t+d+.25);o.start(t+d);o.stop(t+d+.25);});},
    lose(a,t){[[392,0],[330,.18],[262,.36],[196,.56]].forEach(([f,d])=>{const o=mkOsc(a,"sine",f),g=mkGain(a,_vol*.45);o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(_vol*.45,t+d+.05);g.gain.exponentialRampToValueAtTime(.001,t+d+.3);o.start(t+d);o.stop(t+d+.3);});},
    levelup(a,t){[[523,0],[659,.08],[784,.16],[1047,.26],[1319,.37]].forEach(([f,d])=>{const o=mkOsc(a,"triangle",f),g=mkGain(a,_vol*.45);o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(_vol*.45,t+d+.03);g.gain.exponentialRampToValueAtTime(.001,t+d+.22);o.start(t+d);o.stop(t+d+.22);});},
    coin(a,t){const o=mkOsc(a,"sine",1200),g=mkGain(a,_vol*.3);o.connect(g);g.connect(a.destination);o.frequency.exponentialRampToValueAtTime(780,t+.09);g.gain.setValueAtTime(_vol*.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.11);o.start(t);o.stop(t+.11);},
    battleStart(a,t){const o=mkOsc(a,"sawtooth",220),f=a.createBiquadFilter(),g=mkGain(a,_vol*.65);f.type="lowpass";f.frequency.value=600;o.connect(f);f.connect(g);g.connect(a.destination);o.frequency.exponentialRampToValueAtTime(48,t+.5);g.gain.setValueAtTime(_vol*.65,t);g.gain.exponentialRampToValueAtTime(.001,t+.55);o.start(t);o.stop(t+.55);},
    speedRush(a,t){const n=mkNoise(a,.2),f=a.createBiquadFilter(),g=mkGain(a,_vol*.3);f.type="bandpass";f.frequency.value=1200;f.Q.value=1;f.frequency.exponentialRampToValueAtTime(3000,t+.2);n.connect(f);f.connect(g);g.connect(a.destination);g.gain.setValueAtTime(_vol*.3,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);n.start(t);n.stop(t+.2);},
    iceBlast(a,t){[0,.05,.1,.16].forEach(d=>{const n=mkNoise(a,.07),f=a.createBiquadFilter(),g=mkGain(a,_vol*.22);f.type="highpass";f.frequency.value=2500;n.connect(f);f.connect(g);g.connect(a.destination);g.gain.setValueAtTime(_vol*.22,t+d);g.gain.exponentialRampToValueAtTime(.001,t+d+.07);n.start(t+d);n.stop(t+d+.07);});},
    thunder(a,t){const o=mkOsc(a,"sawtooth",80),f=a.createBiquadFilter(),g=mkGain(a,_vol*.7);f.type="lowpass";f.frequency.value=300;o.connect(f);f.connect(g);g.connect(a.destination);o.frequency.exponentialRampToValueAtTime(35,t+.35);g.gain.setValueAtTime(_vol*.7,t);g.gain.exponentialRampToValueAtTime(.001,t+.4);o.start(t);o.stop(t+.4);const n=mkNoise(a,.06),f2=a.createBiquadFilter(),g2=mkGain(a,_vol*.5);f2.type="bandpass";f2.frequency.value=800;f2.Q.value=.8;n.connect(f2);f2.connect(g2);g2.connect(a.destination);g2.gain.setValueAtTime(_vol*.5,t);g2.gain.exponentialRampToValueAtTime(.001,t+.06);n.start(t);n.stop(t+.06);},
  };

  // ── PROCEDURAL BGM — "Pixel Camp" chiptune sequencer ──────────────────────
  // D pentatonic minor: D F G A C  |  BPM 96  |  16-step loop
  // Layers: kick drum · walking bass · melody lead · chord pad · fire crackle
  const startCampfire = () => {
    if (!_enabled || _campNode) return;
    try {
      const a = ac();

      // Master output gain (controlled by musicVol)
      const masterGain = a.createGain();
      masterGain.gain.value = _musicVol * 0.38;
      masterGain.connect(a.destination);

      // Warm low-pass coloring
      const warmFilter = a.createBiquadFilter();
      warmFilter.type = "lowpass";
      warmFilter.frequency.value = 2800;
      warmFilter.Q.value = 0.5;
      warmFilter.connect(masterGain);

      // Short feedback delay (pseudo-reverb, cozy room feel)
      const delayNode  = a.createDelay(0.5);
      delayNode.delayTime.value = 0.175;
      const feedGain   = a.createGain(); feedGain.gain.value = 0.25;
      const sendGain   = a.createGain(); sendGain.gain.value = 0.18;
      warmFilter.connect(sendGain);
      sendGain.connect(delayNode);
      delayNode.connect(feedGain);
      feedGain.connect(delayNode);
      delayNode.connect(masterGain);

      // ── Scale frequencies: D pentatonic minor ───────────────────────────
      // D3  F3    G3    A3    C4    D4    F4    G4    A4    C5    D5
      const S = [146.83,174.61,196.00,220.00,261.63,293.66,349.23,392.00,440.00,523.25,587.33];
      // Short aliases for readability:        D3=0  F3=1  G3=2  A3=3  C4=4  D4=5  F4=6  G4=7  A4=8  C5=9  D5=10

      // 16-step melody (null = rest).  2 bars of 8 eighth-notes.
      const MEL = [5,null,6,7,8,null,7,6, 5,null,4,5,6,null,7,null];
      // 8-step bass (quarter notes).  root / fifth movement.
      const BASS= [0,0,3,3,2,2,3,0];
      // Chord pads — two chords, each held for one bar (8 steps)
      const PADS= [[0,2,5],[2,5,7]]; // Dm voicing / Gm voicing

      const BPM  = 96;
      const BEAT = 60 / BPM;      // 0.625 s
      const STEP = BEAT / 2;       // 1/8 note = 0.3125 s

      // ── Note scheduler helper ────────────────────────────────────────────
      const note = (freq, t, dur, vol, type="triangle", hpf=60, lpf=3500) => {
        try {
          const o = a.createOscillator(); o.type = type; o.frequency.value = freq;
          const hi = a.createBiquadFilter(); hi.type="highpass"; hi.frequency.value=hpf;
          const lo = a.createBiquadFilter(); lo.type="lowpass";  lo.frequency.value=lpf;
          const g = a.createGain();
          o.connect(hi); hi.connect(lo); lo.connect(g); g.connect(warmFilter);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(vol, t + 0.012);
          g.gain.setValueAtTime(vol * 0.75, t + dur * 0.55);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          o.start(t); o.stop(t + dur + 0.05);
        } catch(e){}
      };

      // Kick drum (pitched sine sweep)
      const kick = (t) => {
        try {
          const o = a.createOscillator(); o.type = "sine";
          o.frequency.setValueAtTime(130, t);
          o.frequency.exponentialRampToValueAtTime(38, t + 0.14);
          const g = a.createGain();
          o.connect(g); g.connect(masterGain);
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(_musicVol * 0.55, t + 0.006);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
          o.start(t); o.stop(t + 0.22);
        } catch(e){}
      };

      // Hi-hat (noise burst)
      const hihat = (t, vol=0.12) => {
        try {
          const buf = a.createBuffer(1, a.sampleRate * 0.05, a.sampleRate);
          const d2 = buf.getChannelData(0);
          for (let i=0;i<d2.length;i++) d2[i]=Math.random()*2-1;
          const src = a.createBufferSource(); src.buffer=buf;
          const f2 = a.createBiquadFilter(); f2.type="highpass"; f2.frequency.value=7000;
          const g2 = a.createGain();
          src.connect(f2); f2.connect(g2); g2.connect(masterGain);
          g2.gain.setValueAtTime(0, t);
          g2.gain.linearRampToValueAtTime(_musicVol * vol, t+0.003);
          g2.gain.exponentialRampToValueAtTime(0.0001, t+0.055);
          src.start(t); src.stop(t+0.06);
        } catch(e){}
      };

      // ── Web Audio scheduler pattern ──────────────────────────────────────
      let step = 0;
      let nextTime = a.currentTime + 0.1;
      let running = true;
      const LOOKAHEAD = 0.12; // schedule this far ahead
      const INTERVAL  = 55;   // check every 55ms

      const schedule = () => {
        if (!running) return;
        while (nextTime < a.currentTime + LOOKAHEAD) {
          const s16  = step % 16;          // position in 16-step bar
          const bar  = Math.floor(step/16) % 2; // which bar (for chord alternation)

          // Kick on beats 1 & 3 (steps 0,4,8,12 of 16-step bar)
          if (s16 % 4 === 0) kick(nextTime);

          // Open hihat on every beat; closed on off-beats
          hihat(nextTime, s16 % 4 === 0 ? 0.10 : 0.045);

          // Melody: 1/8-note lead
          if (MEL[s16] !== null) {
            note(S[MEL[s16]], nextTime, STEP * 0.78, _musicVol * 0.19, "triangle", 80, 3200);
          }

          // Bass: plays on every even 1/8 step (effectively quarter notes)
          if (s16 % 2 === 0) {
            const bi = Math.floor(s16/2); // 0-7
            note(S[BASS[bi]], nextTime, STEP * 1.7, _musicVol * 0.26, "sine", 20, 700);
          }

          // Chord pad: new chord every 8 steps (half-bar)
          if (s16 % 8 === 0) {
            const chord = PADS[(bar + (s16 === 8 ? 1 : 0)) % 2];
            chord.forEach(idx => {
              note(S[idx], nextTime, BEAT * 3.7, _musicVol * 0.065, "sine", 40, 1100);
            });
          }

          step++;
          nextTime += STEP;
        }
        if (running) _campTimerID = setTimeout(schedule, INTERVAL);
      };

      let _campTimerID = null;
      schedule();

      _campNode = {
        masterGain,
        _timerId: _campTimerID,
        _setTimerId: id => { _campTimerID = id; },
        _stopRunning: () => { running = false; clearTimeout(_campTimerID); },
      };
    } catch(e) { console.warn("BGM start failed:", e); }
  };

  const stopCampfire = () => {
    if (!_campNode) return;
    try {
      _campNode._stopRunning();
      const a = ac();
      _campNode.masterGain.gain.linearRampToValueAtTime(0.0001, a.currentTime + 0.7);
    } catch(e) {}
    _campNode = null;
  };
  const play = (name) => { if (!_enabled||!defs[name]) return; try {const a=ac();defs[name](a,a.currentTime);} catch(e){} };
  const setVol = (v) => { _vol=Math.max(0,Math.min(1,v)); };
  const setMusicVol = (v) => {
    _musicVol = Math.max(0, Math.min(1, v));
    if (_campNode?.masterGain) {
      try { _campNode.masterGain.gain.value = _musicVol * 0.38; } catch(e){}
    }
  };
  const setEnabled = (v) => { _enabled=!!v; if(!v)stopCampfire(); };

  return { play, setVol, setMusicVol, setEnabled, startCampfire, stopCampfire };
})();

const SE = { play: () => {}, setVol: () => {} };

const getEffectiveStats = yuyu=> {
  const s = {...yuyu.stats};
  Object.values(yuyu.equipment||{}).forEach(id=> {
    if (!id)return;
    const item = ALL_EQUIP.find(e=>e.id===id);
    if (item)Object.entries(item.bonus).forEach(([k,v])=> {s[k]=(s[k]||1)+v;});
  });
  return s;
};

const MAX_STAT = 10;

const isAscensionReady = yuyu=>Object.values(yuyu.stats).every(v=>v>=MAX_STAT);

/** Prestige bonus — each cycle (8 prestiges) stacks a full multiplier tier */
const getPrestBonus = p => {
  if (!p || p <= 0) return {dmgMult:1, hpMult:1, goldMult:1};
  const fullCycles = Math.floor((p-1) / 8);        // completed full cycles
  const posInCycle = ((p-1) % 8) + 1;              // 1-8 within current cycle
  // Base within-cycle scaling: same as before but normalised to 1 cycle
  const cycleDmg  = posInCycle * 0.45;
  const cycleHp   = posInCycle * 0.30;
  const cycleGold = posInCycle * 0.25;
  // Each completed cycle adds the full ceiling of one cycle permanently
  const stackDmg  = fullCycles * 3.60;   // 8×0.45
  const stackHp   = fullCycles * 2.40;   // 8×0.30
  const stackGold = fullCycles * 2.00;   // 8×0.25
  return {
    dmgMult : 1 + cycleDmg  + stackDmg,
    hpMult  : 1 + cycleHp   + stackHp,
    goldMult: 1 + cycleGold + stackGold,
  };
};

/** Check if a prestige perk is active for this prestige level */
const hasPrestPerk = (prestige, perkId) => {
  const perk = PRESTIGE_PERKS.find(p => p.id === perkId);
  if (!perk) return false;
  // Perk is active if prestige >= perk's tier, accounting for cycles
  // e.g. perk at tier 3 is active at prestige 3, 11, 19 …  but also at 4, 5, …
  // Simplified: active if (prestige % 8 || 8) >= perk.p  OR fullCycles > 0 (already cleared one cycle)
  const posInCycle = ((prestige - 1) % 8) + 1;
  const fullCycles = Math.floor((prestige - 1) / 8);
  return fullCycles > 0 || posInCycle >= perk.p;
};

/** Level scaling multiplier — tiap level naik 8% damage. Level 1 = ×1.0, Level 5 = ×1.32, Level 10 = ×1.72 */
const getLevelMult = lv => 1 + Math.max(0, ((lv||1) - 1)) * 0.08;

const INIT = {
  yuyu:{hp:100,maxHp:100,level:1,xp:0,stats:{str:1,def:1,spd:1,hp:1,luck:1},
    energy:ENERGY_MAX, maxEnergy:ENERGY_MAX,
    skills:["starBurst","healPulse"],
    unlockedSkills:["starBurst","healPulse"],
    skillLevels:{},equipment:{weapon:null,armor:null,accessory:null},ownedEquipment:[],
    mood:"excited",prestige:0,milestonesClaimed:[],
    battleMemory:{...INIT_BATTLE_MEMORY},
    // ── Deep systems (from Lyuyu learning) ──
    suppressedLayer : [],   // [{text, trigger, ts}] — things Yuyu held back
    resultHistory   : [],   // ["win"|"lose"|"retreat"] last 10 results for trend
    battleHistory   : [],   // [{stage, result, hpPct, kills, summary}] for resonant memory
    // ── Prestige perk state ──
    momentumStreak  : 0,    // consecutive wins for Momentum perk
    lastBreathUsed  : false, // Last Breath perk — one-shot CD reset per battle
    resilientUsed   : false, // Resilient perk — one-shot protection per battle
  },
  world:{stage:1,highestStage:0,battleKey:0,unlockedFeatures:[]},
  player:{gold:50,name:"Papa",deaths:0,totalKills:0},
  settings:DEFAULT_SETTINGS,
  chat:[],battleLog:{result:null,kills:0,goldEarned:0,xpEarned:0,pendingMilestone:null},
};

function reducer(s,a){
  switch (a.type){
    case "HYDRATE":{
      const p = a.p||{};
      const yd = {...INIT.yuyu,...(p.yuyu||{})};
      yd.maxHp=yd.maxHp>0?yd.maxHp:INIT.yuyu.maxHp;
      yd.hp=Math.max(0,Math.min(yd.hp??yd.maxHp,yd.maxHp));
      yd.stats={...INIT.yuyu.stats,...(yd.stats||{})};
      yd.skills=Array.isArray(yd.skills)&&yd.skills.length?yd.skills:INIT.yuyu.skills;
      yd.skillLevels=yd.skillLevels||{};
      yd.equipment={...INIT.yuyu.equipment,...(yd.equipment||{})};
      yd.milestonesClaimed=yd.milestonesClaimed||[];
      yd.unlockedSkills=yd.unlockedSkills||["starBurst","healPulse"];
      // Migrate ownedEquipment — if old save has equipped items, move them to owned
      yd.ownedEquipment = yd.ownedEquipment || Object.values(yd.equipment||{}).filter(Boolean);
      // migrate: filter skills to only unlocked ones
      yd.skills=(yd.skills||[]).filter(s=>yd.unlockedSkills.includes(s));
      if (!yd.skills.length)yd.skills=["starBurst"];
      yd.battleMemory={...INIT_BATTLE_MEMORY,...(yd.battleMemory||{})};
      yd.battleMemory.strategyScores={...INIT_BATTLE_MEMORY.strategyScores,...(yd.battleMemory.strategyScores||{})};
      // ── Migrate deep systems (safe defaults for old saves) ──
      yd.suppressedLayer = Array.isArray(yd.suppressedLayer) ? yd.suppressedLayer : [];
      yd.resultHistory   = Array.isArray(yd.resultHistory)   ? yd.resultHistory   : [];
      yd.battleHistory   = Array.isArray(yd.battleHistory)   ? yd.battleHistory   : [];
      yd.momentumStreak  = typeof yd.momentumStreak === "number" ? yd.momentumStreak : 0;
      yd.lastBreathUsed  = yd.lastBreathUsed || false;
      yd.resilientUsed   = yd.resilientUsed  || false;
      yd.energy    = typeof yd.energy    === "number" ? Math.min(yd.energy, ENERGY_MAX)   : ENERGY_MAX;
      yd.maxEnergy = ENERGY_MAX;
      return {...INIT,...p,yuyu:yd,world:{...INIT.world,...(p.world||{})},player:{...INIT.player,...(p.player||{})},settings:{...DEFAULT_SETTINGS,...(p.settings||{})},battleLog:INIT.battleLog};
    }
    case "SET_SETTING":return {...s,settings:{...(s.settings||DEFAULT_SETTINGS),[a.key]:a.value}};
    case "CHAT":return {...s,chat:[...s.chat.slice(-18),a.msg]};
    case "SET_MOOD":return {...s,yuyu:{...s.yuyu,mood:a.mood}};
    case "SET_SKILLS":return {...s,yuyu:{...s.yuyu,skills:a.skills}};
    case "UPGRADE":{
      const lv = s.yuyu.stats[a.stat];
      if (lv>=MAX_STAT)return s;
      const cost = {str:50,def:40,spd:60,hp:45,luck:35}[a.stat]*lv;
      if (s.player.gold<cost)return s;
      const ns = {...s.yuyu.stats,[a.stat]:lv+1};
      const ny = a.stat==="hp"?{...s.yuyu,stats:ns,maxHp:s.yuyu.maxHp+10,hp:s.yuyu.hp+10}:{...s.yuyu,stats:ns};
      return {...s,yuyu:ny,player:{...s.player,gold:s.player.gold-cost}};
    }
    case "LEVEL_SKILL":{
      const id = a.skillId,currLv=getSkillLv(s.yuyu,id),cost=skillUpgradeCost(currLv);
      if (!cost||s.player.gold<cost)return s;
      return {...s,yuyu:{...s.yuyu,skillLevels:{...s.yuyu.skillLevels,[id]:currLv+1}},player:{...s.player,gold:s.player.gold-cost}};
    }
    case "BUY_EQUIP":{
      const item = ALL_EQUIP.find(e=>e.id===a.itemId);
      if (!item) return s;
      const alreadyOwned = (s.yuyu.ownedEquipment||[]).includes(a.itemId);
      // If already owned, just equip it for free
      if (alreadyOwned) {
        const slot = EQUIPMENT.weapon.find(e=>e.id===a.itemId)?"weapon":EQUIPMENT.armor.find(e=>e.id===a.itemId)?"armor":"accessory";
        return {...s,yuyu:{...s.yuyu,equipment:{...s.yuyu.equipment,[slot]:a.itemId}}};
      }
      // Buy: deduct gold, add to owned, equip
      if (s.player.gold<item.cost) return s;
      const slot = EQUIPMENT.weapon.find(e=>e.id===a.itemId)?"weapon":EQUIPMENT.armor.find(e=>e.id===a.itemId)?"armor":"accessory";
      return {...s,
        yuyu:{...s.yuyu,
          equipment:{...s.yuyu.equipment,[slot]:a.itemId},
          ownedEquipment:[...(s.yuyu.ownedEquipment||[]),a.itemId],
        },
        player:{...s.player,gold:s.player.gold-item.cost}
      };
    }
    case "EQUIP_ITEM":{
      // Free swap — only for already-owned items
      const item = ALL_EQUIP.find(e=>e.id===a.itemId);
      if (!item||(!(s.yuyu.ownedEquipment||[]).includes(a.itemId))) return s;
      const slot = EQUIPMENT.weapon.find(e=>e.id===a.itemId)?"weapon":EQUIPMENT.armor.find(e=>e.id===a.itemId)?"armor":"accessory";
      // Toggle: if already equipped in this slot, unequip
      const currentEquipped = s.yuyu.equipment[slot];
      const newEquip = currentEquipped===a.itemId ? null : a.itemId;
      return {...s,yuyu:{...s.yuyu,equipment:{...s.yuyu.equipment,[slot]:newEquip}}};
    }
    case "BATTLE_END":{
      const{result,kills,goldEarned,xpEarned,remainingHp,remainingEnergy,strategyUsed,sneakHits,sneakStunTotal}=a;
      const pb = getPrestBonus(s.yuyu.prestige||0);
      const adjGold = Math.round((goldEarned||0)*pb.goldMult);
      const newXp = (s.yuyu.xp||0)+(xpEarned||0);
      const lvUp = newXp>=s.yuyu.level*100;
      const newLevel = lvUp ? s.yuyu.level+1 : s.yuyu.level;
      // ── Level-up bonuses ──
      // +5 max HP every level, +1 weakest stat every 3 levels (free, no gold)
      // Veteran perk (prestige ≥1): grants +2 instead of +1 free stat
      const lvHpBonus = lvUp ? 5 : 0;
      const freeStatThisLevel = lvUp && newLevel % 3 === 0;
      const hasVeteran = hasPrestPerk(s.yuyu.prestige||0, "veteran");
      const freeStatGrant = hasVeteran ? 2 : 1;
      const lvFreeStats = {...s.yuyu.stats};
      let lvFreeStatKey = null;
      if (freeStatThisLevel) {
        const eligible = Object.entries(lvFreeStats).filter(([,v]) => v < MAX_STAT);
        if (eligible.length) {
          lvFreeStatKey = eligible.reduce((a,b) => a[1] <= b[1] ? a : b)[0];
          lvFreeStats[lvFreeStatKey] = Math.min(MAX_STAT, lvFreeStats[lvFreeStatKey] + freeStatGrant);
        }
      }
      // ── Momentum perk: track consecutive win streak for DMG bonus ──
      const hasMomentum = hasPrestPerk(s.yuyu.prestige||0, "momentum");
      const prevWinStreak = s.yuyu.momentumStreak || 0;
      const newWinStreak = result === "win" ? prevWinStreak + 1 : 0;
      const safeHp = (remainingHp!=null&&!isNaN(remainingHp)&&remainingHp>=0)?remainingHp:(s.yuyu.hp||0);
      const mhp = (s.yuyu.maxHp||100) + lvHpBonus;
      const hpStatVal = lvFreeStats?.hp || s.yuyu.stats?.hp || 1;
      // Win: restore flat hpStat×5 HP bonus + level HP bonus. Lose: start next at hpStat×8. Retreat: keep current.
      const newHp = result==="win"?Math.min(mhp,safeHp+hpStatVal*5+lvHpBonus):result==="retreat"?Math.max(1,safeHp):Math.min(mhp,hpStatVal*8);
      const newStage = result==="win"?s.world.stage+1:s.world.stage;
      const newBattleKey = result==="lose"?(s.world.battleKey||0)+1:s.world.battleKey;
      const newHighest = Math.max(s.world.highestStage||0,result==="win"?s.world.stage:0);
      const newDeaths = result==="lose"?(s.player.deaths||0)+1:(s.player.deaths||0);
      const newTotalKills = (s.player.totalKills||0)+(kills||0);
      const ms = result==="win"?MILESTONES[s.world.stage]:null;
      const alreadyClaimed = (s.yuyu.milestonesClaimed||[]).includes(s.world.stage);
      const msGold = (ms&&!alreadyClaimed)?ms.gold:0;
      const newMsClaimed = (ms&&!alreadyClaimed)?[...(s.yuyu.milestonesClaimed||[]),s.world.stage]:(s.yuyu.milestonesClaimed||[]);
      const newUnlocks = [...(s.world.unlockedFeatures||[])];
      if (ms&&!alreadyClaimed&&ms.unlock&&!newUnlocks.includes(ms.unlock))newUnlocks.push(ms.unlock);
      // ── Update battle memory ──
      const updatedMem = updateMemoryAfterBattle(s.yuyu.battleMemory||INIT_BATTLE_MEMORY,result,strategyUsed,sneakHits||0,sneakStunTotal||0);
      // ── Check skill unlocks ──
      const freshPlayer = {...s.player,deaths:newDeaths,totalKills:newTotalKills};
      const freshWorld = {...s.world,stage:newStage};
      const freshYuyu = {...s.yuyu,battleMemory:updatedMem};
      const newlyUnlocked = checkSkillUnlocks(freshYuyu,freshPlayer,freshWorld,result);
      const newUnlockedSkills = [...(s.yuyu.unlockedSkills||["starBurst","healPulse"]),...newlyUnlocked];
      // Auto-equip new skills (max 2 active + 2 passive)
      // If slot is full, replace the lowest-level equipped skill of same type
      // so Yuyu naturally rotates to newly unlocked skills instead of always keeping starBurst+healPulse
      let newEquippedSkills = [...(s.yuyu.skills||[])];
      const _skillLevels = s.yuyu.skillLevels || {};
      newlyUnlocked.forEach(sid=> {
        const sk = SKILLS[sid];
        if (!sk) return;
        const sameTypeEquipped = newEquippedSkills.filter(x=>SKILLS[x]?.type===sk.type);
        if (sameTypeEquipped.length < 2) {
          // Free slot — just add
          newEquippedSkills.push(sid);
        } else {
          // Slots full — replace lowest-level skill of same type to give new skill a chance
          // Exception: never auto-replace if both equipped are lv3
          const lowestIdx = sameTypeEquipped.reduce((worst, x) => {
            const lv = _skillLevels[x] || 1;
            const worstLv = _skillLevels[worst] || 1;
            return lv < worstLv ? x : worst;
          }, sameTypeEquipped[0]);
          const lowestLv = _skillLevels[lowestIdx] || 1;
          if (lowestLv < 3) {
            // Swap out the weakest slot
            newEquippedSkills = newEquippedSkills.filter(x => x !== lowestIdx);
            newEquippedSkills.push(sid);
          }
        }
      });
      newEquippedSkills=newEquippedSkills.filter(s=>newUnlockedSkills.includes(s));
      // ── System chat ──
      const icon = result==="win"?"🏆":result==="retreat"?"🏳️":"💔";
      const stageTxt = `Stage ${s.world.stage}`;
      let sysMsg = result==="win"
        ?`${icon} ${stageTxt} · ${kills}💀 · +${adjGold}🪙 · +${xpEarned}XP${lvUp?` · ⬆️ Lv.${newLevel}! +5HP${lvFreeStatKey?` +${freeStatGrant} ${lvFreeStatKey.toUpperCase()}`:""}`:""}`:result==="retreat"?`${icon} Retreat ${stageTxt} · ${kills}💀`
        :`${icon} KO di ${stageTxt} · ${kills}💀`;
      if (ms&&!alreadyClaimed)sysMsg+=` · 🎁 ${ms.label} +${ms.gold}🪙`;
      if (strategyUsed)sysMsg+=` · ${STRATEGIES[strategyUsed]?.icon||""} ${STRATEGIES[strategyUsed]?.label||""}`;
      if (updatedMem.dominantHabit&&updatedMem.dominantHabit!==s.yuyu.battleMemory?.dominantHabit)
        sysMsg+=` · 🧠 Habit: ${STRATEGIES[updatedMem.dominantHabit]?.label}`;
      const unlockMsgs = newlyUnlocked.map(sid=>`✨ Skill baru: ${SKILLS[sid]?.icon} ${SKILLS[sid]?.name}`);
      const newChat = [...s.chat.slice(-16),{role:"system",text:sysMsg},...unlockMsgs.map(t=> ({role:"system",text:t}))];

      // ── Track result + battle history for performance trend & resonant memory ──
      const newResultHistory = [
        ...(s.yuyu.resultHistory||[]).slice(-9),
        result,
      ];
      const battleSummary = result === "win"
        ? `Menang di Stage ${s.world.stage} dengan ${kills||0} kill`
        : result === "lose"
        ? `Kalah di Stage ${s.world.stage} setelah ${kills||0} kill`
        : `Retreat dari Stage ${s.world.stage}`;
      const newBattleHistory = [
        ...(s.yuyu.battleHistory||[]).slice(-14),
        { stage: s.world.stage, result, hpPct: (safeHp/(s.yuyu.maxHp||100)), kills: kills||0, summary: battleSummary, ts: Date.now() },
      ];

      // ── Add suppressed thought on loss or near-death win ──
      const wasTense = safeHp / (s.yuyu.maxHp||100) < 0.25;
      let newSuppressed = s.yuyu.suppressedLayer || [];
      if (result === "lose") {
        newSuppressed = addSuppressedThought(newSuppressed,
          `Yuyu hampir menyerah di Stage ${s.world.stage}`, "lose");
      } else if (result === "win" && wasTense) {
        newSuppressed = addSuppressedThought(newSuppressed,
          `Itu terlalu dekat — Yuyu tidak mau akui seberapa takutnya tadi`, "close_win");
      }

      return {...s,
        yuyu:{...s.yuyu,hp:Math.max(1,newHp),level:newLevel,xp:lvUp?0:newXp,
          maxHp:mhp,
          energy: result==="win" ? Math.min(ENERGY_MAX, (remainingEnergy??ENERGY_MAX)) : Math.min(ENERGY_MAX, (remainingEnergy??0) + 20),
          stats:freeStatThisLevel?lvFreeStats:s.yuyu.stats,
          mood:result==="win"?"excited":"hurt",milestonesClaimed:newMsClaimed,
          skills:newEquippedSkills,unlockedSkills:newUnlockedSkills,battleMemory:updatedMem,
          resultHistory : newResultHistory,
          battleHistory : newBattleHistory,
          suppressedLayer: newSuppressed,
          momentumStreak : hasMomentum ? newWinStreak : 0,
        },
        world:{...s.world,stage:newStage,highestStage:newHighest,unlockedFeatures:newUnlocks,battleKey:newBattleKey},
        player:{...s.player,gold:(s.player.gold||0)+adjGold+msGold,deaths:newDeaths,totalKills:newTotalKills},
        battleLog:{result,kills:kills||0,goldEarned:adjGold,xpEarned:xpEarned||0},
        chat:newChat,
      };
    }
    case "REVIVE":{
      const deaths = s.player.deaths||0;
      const cost = 50*Math.max(1,deaths);
      if (s.player.gold<cost)return s;
      const mhp = s.yuyu.maxHp||100;
      const hpStatRevive = s.yuyu.stats?.hp || 1;
      return {...s,yuyu:{...s.yuyu,hp:Math.min(mhp, hpStatRevive*6),mood:"determined"},player:{...s.player,gold:s.player.gold-cost},world:{...s.world,battleKey:(s.world.battleKey||0)+1},battleLog:INIT.battleLog};
    }
    case "DISMISS_RESULT":return {...s,battleLog:{...s.battleLog,result:null,pendingMilestone:null}};
    case "ASCEND":{
      if (!isAscensionReady(s.yuyu))return s;
      const np = (s.yuyu.prestige||0)+1, pb2=getPrestBonus(np);
      const newMaxHp = Math.round(100*pb2.hpMult);
      // Pick best 2 actives + 2 passives by skill level (not hardcoded)
      const _keptLevels = s.yuyu.skillLevels || {};
      const _sortByLv = ids => [...ids].sort((a,b)=>(_keptLevels[b]||1)-(_keptLevels[a]||1));
      const _ownedActives  = (s.yuyu.unlockedSkills||[]).filter(id=>SKILLS[id]?.type==="active");
      const _ownedPassives = (s.yuyu.unlockedSkills||[]).filter(id=>SKILLS[id]?.type==="passive");
      const keptSkills = [
        ..._sortByLv(_ownedActives).slice(0,2),
        ..._sortByLv(_ownedPassives).slice(0,2),
      ];
      const newTier = getPrestTier(np);
      const newPerk = PRESTIGE_PERKS.find(p => {
        const posInCycle = ((np-1) % 8) + 1;
        return p.p === posInCycle;
      });
      const tierMsg = `✨ ASCENDED! ${newTier?.icon} ${newTier?.name} (Prestige ${np})${newPerk ? ` · Perk baru: ${newPerk.icon} ${newPerk.name}!` : ""}`;
      const newChat = [...s.chat.slice(-16), {role:"system", text: tierMsg}];
      return {...s,
        yuyu:{...s.yuyu,
          stats:{str:1,def:1,spd:1,hp:1,luck:1},maxHp:newMaxHp,hp:newMaxHp,level:1,xp:0,
          prestige:np, mood:"proud", skillLevels:{},
          skills:keptSkills, unlockedSkills:keptSkills,
          battleMemory:{...INIT_BATTLE_MEMORY, strategyScores:{...s.yuyu.battleMemory?.strategyScores}||INIT_BATTLE_MEMORY.strategyScores},
          suppressedLayer : [],
          resultHistory   : s.yuyu.resultHistory || [],
          battleHistory   : (s.yuyu.battleHistory||[]).slice(-5),
          momentumStreak  : 0,
          lastBreathUsed  : false,
          resilientUsed   : false,
        },
        world:{...s.world,stage:1,battleKey:(s.world.battleKey||0)+1},
        player:{...s.player,gold:Math.floor(s.player.gold*.5)},
        battleLog:INIT.battleLog,
        chat:newChat,
      };
    }
    case "AI_UPGRADE":{
      // Yuyu's AI bought something — a.upgrades is [{type,payload}]
      let ns = s;
      for (const u of (a.upgrades||[])) {
        if (u.type==="UPGRADE") {
          const lv = ns.yuyu.stats[u.stat];
          if (lv>=MAX_STAT) continue;
          const cost = {str:50,def:40,spd:60,hp:45,luck:35}[u.stat]*lv;
          if (ns.player.gold<cost) continue;
          const newStats = {...ns.yuyu.stats,[u.stat]:lv+1};
          const newY = u.stat==="hp"?{...ns.yuyu,stats:newStats,maxHp:ns.yuyu.maxHp+10,hp:ns.yuyu.hp+10}:{...ns.yuyu,stats:newStats};
          ns = {...ns,yuyu:newY,player:{...ns.player,gold:ns.player.gold-cost}};
        } else if (u.type==="LEVEL_SKILL") {
          const currLv=getSkillLv(ns.yuyu,u.skillId),cost=skillUpgradeCost(currLv);
          if (!cost||ns.player.gold<cost) continue;
          ns = {...ns,yuyu:{...ns.yuyu,skillLevels:{...ns.yuyu.skillLevels,[u.skillId]:currLv+1}},player:{...ns.player,gold:ns.player.gold-cost}};
        } else if (u.type==="BUY_EQUIP") {
          const item=ALL_EQUIP.find(e=>e.id===u.itemId);
          if (!item) continue;
          const alreadyOwned=(ns.yuyu.ownedEquipment||[]).includes(u.itemId);
          if (!alreadyOwned && ns.player.gold<item.cost) continue;
          const slot=EQUIPMENT.weapon.find(e=>e.id===u.itemId)?"weapon":EQUIPMENT.armor.find(e=>e.id===u.itemId)?"armor":"accessory";
          const newOwned = alreadyOwned?ns.yuyu.ownedEquipment:[...(ns.yuyu.ownedEquipment||[]),u.itemId];
          ns = {...ns,yuyu:{...ns.yuyu,equipment:{...ns.yuyu.equipment,[slot]:u.itemId},ownedEquipment:newOwned},player:{...ns.player,gold:alreadyOwned?ns.player.gold:ns.player.gold-item.cost}};
        }
      }
      return ns;
    }
    case "CAMP_REGEN":{
      const mhp = s.yuyu.maxHp||100;
      if (s.yuyu.hp>=mhp)return s;
      return {...s,yuyu:{...s.yuyu,hp:Math.min(mhp,s.yuyu.hp+(a.amount||1))}};
    }
    case "RESET_SAVE":return {...INIT};
    default:return s;
  }
}

// ── CANVAS HELPERS ─────────────────────────────────────────────────────────

const randomTile = (tx,ty,off=0)=> {let h = Math.sin(tx*127.1+ty*311.7+off*91.3)*43758.5453;return h-Math.floor(h);};

function drawScene(ctx,biome,time,W,H){
  const skyH = H*GROUND_Y_RATIO;
  const sky = ctx.createLinearGradient(0,0,0,skyH);
  if (biome.deco==="forest"){sky.addColorStop(0,"#0a1a0c");sky.addColorStop(1,"#162a18");}
  else if (biome.deco==="stone"){sky.addColorStop(0,"#0e0e1c");sky.addColorStop(1,"#1a1a2e");}
  else if (biome.deco==="crystal"){sky.addColorStop(0,"#041018");sky.addColorStop(1,"#082030");}
  else if (biome.deco==="sky"){sky.addColorStop(0,"#080e30");sky.addColorStop(1,"#0e1850");}
  else if (biome.deco==="void"){sky.addColorStop(0,"#060010");sky.addColorStop(1,"#12002a");}
  else {sky.addColorStop(0,"#0c0416");sky.addColorStop(1,"#180828");}
  ctx.fillStyle=sky;
  ctx.fillRect(0,0,W,skyH);
  ctx.save();
  for (let i = 0; i < 40;i++){
    const sx = randomTile(i,0)*W,sy=randomTile(i,1)*skyH*.85,pulse=.4+Math.sin(time*1.2+i)*.35;
    ctx.globalAlpha=pulse*.6;
    ctx.fillStyle=biome.deco==="crystal"?"#7ff8f0":biome.deco==="void"?"#f0a0ff":biome.deco==="fortress"?"#f87171":"#e8d8ff";
    ctx.beginPath();
    ctx.arc(sx,sy,randomTile(i,2)*.9+.3,0,Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
  ctx.save();
  ctx.globalAlpha=.18;
  ctx.fillStyle=biome.color||"#555";
  for (let i = 0; i < 6;i++){
    const bx = i*(W/5)-20,bw=44+randomTile(i,3)*30,bh=60+randomTile(i,4)*80;
    if (biome.deco==="forest"){ctx.beginPath();
    ctx.moveTo(bx+bw/2,skyH*.1);
    ctx.lineTo(bx+bw*.1,skyH*.7);
    ctx.lineTo(bx+bw*.9,skyH*.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(bx+bw*.4,skyH*.65,bw*.2,skyH*.2);}
    else if (biome.deco==="fortress"){ctx.fillRect(bx,skyH-bh,bw,bh);
    ctx.fillRect(bx-4,skyH-bh-12,10,14);
    ctx.fillRect(bx+bw-6,skyH-bh-12,10,14);}
    else if (biome.deco==="void"){ctx.save();
    ctx.globalAlpha=.12;
    ctx.beginPath();
    ctx.arc(bx+bw/2,skyH*.4,bh*.4,0,Math.PI*2);
    ctx.fill();
    ctx.restore();}
    else {ctx.fillRect(bx,skyH-bh,bw*.6,bh);}
  }
  ctx.restore();
  const groundY = skyH;
  const ground = ctx.createLinearGradient(0,groundY,0,H);
  ground.addColorStop(0,biome.floor2);
  ground.addColorStop(.3,biome.floor1);
  ground.addColorStop(1,"#060408");
  ctx.fillStyle=ground;
  ctx.fillRect(0,groundY,W,H-groundY);
  const TILE = 24,cols=Math.ceil(W/TILE)+1,rows=Math.ceil((H-groundY)/TILE)+1;
  for (let row = 0; row < rows;row++)for (let col = 0; col < cols;col++){
    const x = col*TILE,y=groundY+row*TILE,rng=randomTile(col,row+50),lighter=(col+row)%2===0;
    ctx.fillStyle=lighter?biome.floor2+"cc":biome.floor1+"cc";
    ctx.fillRect(x,y,TILE-1,TILE-1);
    ctx.fillStyle=biome.grout+"88";
    ctx.fillRect(x+TILE-1,y,1,TILE);
    ctx.fillRect(x,y+TILE-1,TILE,1);
    if (rng<0.06)drawTileDeco(ctx,biome.deco,x,y,TILE,col,row+50,time);
  }
  ctx.save();
  if (biome.deco==="forest"){for (let i = 0; i < 5;i++){const tx = 30+i*(W/4.5),ty=groundY-2,sw=.6+Math.sin(time*.4+i)*.04;
  ctx.save();
  ctx.translate(tx,ty);
  ctx.scale(sw,1);
  ctx.fillStyle="#0d1f0e";
  ctx.fillRect(-3,0,6,28);
  ctx.fillStyle="#1a3d1a";
  ctx.beginPath();
  ctx.moveTo(0,-50);
  ctx.lineTo(-20,0);
  ctx.lineTo(20,0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle="#1f481f";
  ctx.beginPath();
  ctx.moveTo(0,-70);
  ctx.lineTo(-14,-22);
  ctx.lineTo(14,-22);
  ctx.closePath();
  ctx.fill();
  ctx.restore();}}
  else if (biome.deco==="stone"){for (let i = 0; i < 4;i++){const tx = 20+i*(W/3.5),ty=groundY,r1=randomTile(i,10),rh=30+r1*50;
  ctx.fillStyle=`rgb(${28+r1*10|0},${28+r1*8|0},${44+r1*12|0})`;
  ctx.beginPath();
  ctx.moveTo(tx,ty);
  ctx.lineTo(tx-14,ty-rh);
  ctx.lineTo(tx+14,ty-rh);
  ctx.lineTo(tx+20,ty);
  ctx.closePath();
  ctx.fill();}}
  else if (biome.deco==="crystal"){for (let i = 0; i < 6;i++){const tx = 15+i*(W/5.5),ty=groundY,rh=20+randomTile(i,11)*60;const glow = ctx.createLinearGradient(tx,ty-rh,tx,ty);glow.addColorStop(0,`rgba(100,220,210,${.6+Math.sin(time*2+i)*.2})`);glow.addColorStop(1,"rgba(13,148,136,.2)");
  ctx.fillStyle=glow;
  ctx.beginPath();
  ctx.moveTo(tx,ty);
  ctx.lineTo(tx-8,ty-rh*.6);
  ctx.lineTo(tx,ty-rh);
  ctx.lineTo(tx+8,ty-rh*.6);
  ctx.closePath();
  ctx.fill();}}
  else if (biome.deco==="sky"){for (let i = 0; i < 4;i++){const px = 20+i*(W/3.8),py=groundY-20-randomTile(i,12)*60+Math.sin(time*.5+i)*4;
  ctx.fillStyle="#1a2a5a";
  ctx.beginPath();
  ctx.roundRect(px-25,py-8,50,16,4);
  ctx.fill();
  ctx.fillStyle="rgba(100,150,255,.3)";
  ctx.fillRect(px-22,py-10,46,3);}}
  else if (biome.deco==="fortress"){for (let i = 0; i < 3;i++){const tx = 25+i*(W/2.8),ty=groundY;
  ctx.fillStyle="#200a30";
  ctx.fillRect(tx-15,ty-70,30,70);
  ctx.fillStyle="#2d0f40";for (let j = 0; j < 3;j++){ctx.fillRect(tx-15+j*12,ty-82,8,14);
    }
    ctx.strokeStyle=`rgba(180,60,240,${.08+Math.sin(time+i)*.04})`;
  ctx.lineWidth=1;
  ctx.strokeRect(tx-15,ty-70,30,70);}}
  else if (biome.deco==="void"){for (let i = 0; i < 5;i++){const tx = 20+i*(W/4.2),ty=groundY,rr=15+randomTile(i,14)*30,pulse=.4+Math.sin(time*1.5+i)*.3;
  ctx.strokeStyle=`rgba(236,72,153,${pulse*.5})`;
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.arc(tx,ty-rr,rr,0,Math.PI*2);
  ctx.stroke();
  ctx.fillStyle=`rgba(124,0,180,${pulse*.12})`;
  ctx.fill();}}
  ctx.restore();
  const hglow = ctx.createLinearGradient(0,groundY-8,0,groundY+8);
  hglow.addColorStop(0,"transparent");
  hglow.addColorStop(.5,biome.color+"44");
  hglow.addColorStop(1,"transparent");
  ctx.fillStyle=hglow;
  ctx.fillRect(0,groundY-8,W,16);
  const vig = ctx.createRadialGradient(W/2,H*.45,H*.2,W/2,H*.45,H*.85);
  vig.addColorStop(0,"transparent");
  vig.addColorStop(1,"rgba(0,0,0,.55)");
  ctx.fillStyle=vig;
  ctx.fillRect(0,0,W,H);
}

function drawTileDeco(ctx,deco,x,y,tileSize,col,row,time){
  const cx = x+tileSize/2,cy=y+tileSize/2,r1=randomTile(col,row,1),r2=randomTile(col,row,2);
  ctx.save();
  if (deco==="forest"){ctx.strokeStyle=`rgba(30,${70+r1*30|0},30,.7)`;
  ctx.lineWidth=1;for (let i = 0; i < 3;i++){ctx.beginPath();
  ctx.moveTo(cx-3+i*3,cy+3);
  ctx.lineTo(cx-2+i*3+Math.sin(time+i)*.5,cy-3);
  ctx.stroke();}}
  else if (deco==="stone"){ctx.strokeStyle="rgba(30,30,50,.6)";
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(x+3+r1*4,y+3);
  ctx.lineTo(x+tileSize-4,y+tileSize-4);
  ctx.stroke();}
  else if (deco==="crystal"){ctx.fillStyle=`rgba(13,148,${136+r2*60|0},.4)`;
  ctx.beginPath();
  ctx.moveTo(cx,cy-4);
  ctx.lineTo(cx+2,cy+3);
  ctx.lineTo(cx-2,cy+3);
  ctx.closePath();
  ctx.fill();}
  else if (deco==="void"){ctx.fillStyle=`rgba(236,72,${153+r1*50|0},${.2+Math.sin(time*2+r2*6)*.15})`;
  ctx.beginPath();
  ctx.arc(cx+r1*4-2,cy+r2*4-2,.9,0,Math.PI*2);
  ctx.fill();}
  ctx.restore();
}

// ── CAMP DRAWING ────────────────────────────────────────────────────────────

function drawCamp(ctx,time,W,H){
  const groundY = H*GROUND_Y_RATIO;
  const cx = W*.22,cy=groundY;
  // campfire glow (ground halo)
  const glow = ctx.createRadialGradient(cx,cy+2,0,cx,cy+2,38);
  glow.addColorStop(0,`rgba(255,140,30,${.22+Math.sin(time*3.5)*.07})`);
  glow.addColorStop(1,"transparent");
  ctx.fillStyle=glow;
  ctx.beginPath();
  ctx.ellipse(cx,cy+6,38,18,0,0,Math.PI*2);
  ctx.fill();
  // tent
  const tx = cx+52,tgy=cy;
  ctx.save();
  ctx.fillStyle="rgba(80,30,120,.75)";
  ctx.strokeStyle="rgba(180,100,240,.5)";
  ctx.lineWidth=1.5;
  ctx.beginPath();
  ctx.moveTo(tx,tgy-42);
  ctx.lineTo(tx-28,tgy+2);
  ctx.lineTo(tx+28,tgy+2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle="rgba(50,15,80,.9)";
  ctx.beginPath();
  ctx.moveTo(tx,tgy-42);
  ctx.lineTo(tx+10,tgy-42);
  ctx.lineTo(tx+28,tgy+2);
  ctx.lineTo(tx+15,tgy+2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle="rgba(40,0,60,.95)";
  ctx.beginPath();
  ctx.moveTo(tx-8,tgy-14);
  ctx.lineTo(tx-8,tgy+2);
  ctx.lineTo(tx+8,tgy+2);
  ctx.lineTo(tx+8,tgy-14);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // tent flag
  ctx.save();
  ctx.strokeStyle="rgba(200,140,255,.6)";
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(tx,tgy-42);
  ctx.lineTo(tx,tgy-54);
  ctx.stroke();
  ctx.fillStyle=COLORS.pink;
  ctx.beginPath();
  ctx.moveTo(tx,tgy-54);
  ctx.lineTo(tx+8,tgy-50);
  ctx.lineTo(tx,tgy-46);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // logs
  ctx.save();
  ctx.strokeStyle="#4a2c0a";
  ctx.lineWidth=4;
  ctx.lineCap="round";
  ctx.beginPath();
  ctx.moveTo(cx-11,cy+3);
  ctx.lineTo(cx+11,cy+3);
  ctx.stroke();
  ctx.strokeStyle="#3a1c00";
  ctx.beginPath();
  ctx.moveTo(cx-8,cy+3);
  ctx.lineTo(cx+8,cy+8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx+8,cy+3);
  ctx.lineTo(cx-8,cy+8);
  ctx.stroke();
  ctx.restore();
  // flames
  ctx.save();
  const fl = .7+Math.sin(time*7)*.3,fl2=.6+Math.sin(time*9+1)*.4;
  for (let fi = 0; fi < 3;fi++){
    const fx = cx-4+fi*4,foff=Math.sin(time*6+fi*2)*.8;
    ctx.globalAlpha=fl*(fi===1?.9:.6);
    ctx.fillStyle=fi===1?"#fbbf24":"#ef4444";
    ctx.beginPath();
    ctx.moveTo(fx,cy+3);
    ctx.quadraticCurveTo(fx-3+foff,cy-8,fx,cy-14-fi*4);
    ctx.quadraticCurveTo(fx+3+foff,cy-8,fx,cy+3);
    ctx.fill();
  }
  ctx.globalAlpha=fl2*.8;
  ctx.fillStyle="#fff7ed";
  ctx.beginPath();
  ctx.moveTo(cx,cy+3);
  ctx.quadraticCurveTo(cx-1,cy-4,cx,cy-8);
  ctx.quadraticCurveTo(cx+1,cy-4,cx,cy+3);
  ctx.fill();
  ctx.globalAlpha=1;
  ctx.restore();
  // sparks
  for (let sp = 0; sp < 5;sp++){
    const sAngle = time*2.3+sp*1.26,sr=8+Math.sin(time*4+sp)*5,sLife=((time*.5+sp*.2)%1);
    if (sLife>0.7)continue;
    ctx.save();
    ctx.globalAlpha=(1-sLife/0.7)*.6;
    ctx.fillStyle="#fcd34d";
    ctx.beginPath();
    ctx.arc(cx+Math.cos(sAngle)*sr,cy-5+Math.sin(sAngle)*4-sLife*12,1,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
  // small banner "CAMP"
  ctx.save();
  ctx.globalAlpha=.45+Math.sin(time*.8)*.1;
  ctx.fillStyle="rgba(20,5,40,.7)";
  ctx.beginPath();
  ctx.roundRect(cx-28,cy-72,56,16,4);
  ctx.fill();
  ctx.fillStyle="rgba(200,160,255,.9)";
  ctx.font="bold 7px monospace";
  ctx.textAlign="center";
  ctx.fillText("⛺ SURVIVAL CAMP",cx,cy-62);
  ctx.restore();
}

function drawShadow(ctx,x,y,scale=1){ctx.save();
ctx.fillStyle="rgba(0,0,0,.28)";
ctx.beginPath();
ctx.ellipse(x,y+10*scale,10*scale,4*scale,0,0,Math.PI*2);
ctx.fill();
ctx.restore();}

function drawYuyu(ctx,yuyuData,time,game){
  if (!yuyuData||yuyuData.hp==null||yuyuData.maxHp==null)return;
  const posX = yuyuData.x,posY=yuyuData.y,bobOffset=Math.sin(time*6)*1.2*(yuyuData.bState==="IDLE"?.3:1),isAttacking=yuyuData.bState==="ATTACK",isChasing=yuyuData.bState==="CHASE",isBlocking=yuyuData.bState==="BLOCK",hpPercent=yuyuData.hp/yuyuData.maxHp,isBerserkerMode=game.hasBerserker&&hpPercent<.3;
  const isParryWindow = isBlocking && game.t < yuyuData.parryWindowUntil;
  const justParried   = yuyuData.parrySuccess && (game.t - yuyuData.lastParryT) < 0.45;
  // Read equipped weapon for animation
  const weapon = game.equippedWeapon||"ironSword"; // "ironSword"|"steelBow"|"magicStaff"|"darkBlade"
  const isBow = weapon==="steelBow";
  const isStaff = weapon==="magicStaff";
  const isDark = weapon==="darkBlade";
  ctx.save();
  // prestige ring
  if (game.prestige>0){
    const colors = ["#f59e0b","#a78bfa","#f0abfc","#34d399"];
    ctx.strokeStyle=colors[(game.prestige-1)%colors.length];
    ctx.lineWidth=2;
    ctx.globalAlpha=.5+Math.sin(time*3)*.3;
    ctx.beginPath();
    ctx.arc(posX,posY+bobOffset,20,0,Math.PI*2);
    ctx.stroke();
    ctx.globalAlpha=1;
  }
  // ── resting weapon (drawn BEHIND body) ──
  if (!isAttacking){
    ctx.save();
    ctx.globalAlpha=isChasing?.9:.65;
    if (isBow){
      ctx.translate(posX+5,posY+bobOffset);
      ctx.strokeStyle="#8b5e3c";
      ctx.lineWidth=2;
      ctx.lineCap="round";
      ctx.beginPath();
      ctx.arc(0,0,8,-.6,.6);
      ctx.stroke();
      ctx.strokeStyle="#c4a882";
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(0,-8);
      ctx.lineTo(0,8);
      ctx.stroke();
    } else if (isStaff){
      ctx.translate(posX+4,posY-6+bobOffset);
      ctx.rotate(-.2);
      ctx.strokeStyle=isBerserkerMode?"#a855f7":"#7c3aed";
      ctx.lineWidth=2;
      ctx.lineCap="round";
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(0,20);
      ctx.stroke();
      ctx.fillStyle=isBerserkerMode?"#c084fc":"#60a5fa";
      ctx.shadowColor=isBerserkerMode?"#a855f7":"#3b82f6";
      ctx.shadowBlur=6;
      ctx.beginPath();
      ctx.arc(0,-2,3,0,Math.PI*2);
      ctx.fill();
      ctx.shadowBlur=0;
    } else {
      // sword / darkblade resting
      ctx.translate(posX-4,posY-2+bobOffset);
      ctx.rotate(-.55);
      ctx.fillStyle="#4a3520";
      ctx.beginPath();
      ctx.roundRect(-2,2,4,13,2);
      ctx.fill();
      ctx.fillStyle=isDark?"#2d1b4e":isBerserkerMode?"#c084fc":"#c4cad4";
      ctx.beginPath();
      ctx.roundRect(-1.5,-2,3,isDark?14:11,1);
      ctx.fill();
      if (isDark){ctx.strokeStyle="rgba(139,92,246,.6)";
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.roundRect(-2,-3,5,16,1);
      ctx.stroke();}
      ctx.fillStyle="#f59e0b";
      ctx.fillRect(-2.5,-3,5,3);
    }
    ctx.restore();
  }
  // body shadow / legs
  ctx.fillStyle=isBerserkerMode?"#5b1fa8":"#4c1d95";
  ctx.beginPath();
  ctx.ellipse(posX,posY+4+bobOffset,9,7,0,0,Math.PI*2);
  ctx.fill();
  // torso
  ctx.fillStyle=isBerserkerMode?"#a855f7":"#7c3aed";
  ctx.beginPath();
  ctx.roundRect(posX-7,posY-4+bobOffset,14,11,3);
  ctx.fill();
  // belt — small buckle, clearly NOT a weapon
  ctx.fillStyle="#2d1850";
  ctx.fillRect(posX-7,posY+3.5+bobOffset,14,2);
  ctx.fillStyle="#f59e0b";
  ctx.fillRect(posX-2,posY+3+bobOffset,4,3);
  // head
  ctx.fillStyle=hpPercent<.3?"#ffb3b3":"#ffd6e0";
  ctx.beginPath();
  ctx.arc(posX,posY-12+bobOffset,9,0,Math.PI*2);
  ctx.fill();
  // hair
  ctx.fillStyle="#1a0814";
  ctx.beginPath();
  ctx.ellipse(posX,posY-19+bobOffset,8,5,0,0,Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(posX-7,posY-14+bobOffset,3,4,-.3,0,Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(posX+7,posY-14+bobOffset,3,4,.3,0,Math.PI*2);
  ctx.fill();
  // eyes
  ctx.fillStyle="#1a0814";
  if (isAttacking){ctx.lineWidth=1.5;
  ctx.strokeStyle="#1a0814";
  ctx.beginPath();
  ctx.moveTo(posX-4,posY-13+bobOffset);
  ctx.lineTo(posX-2,posY-11+bobOffset);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(posX+4,posY-13+bobOffset);
  ctx.lineTo(posX+2,posY-11+bobOffset);
  ctx.stroke();}
  else {ctx.beginPath();
  ctx.arc(posX-3,posY-12+bobOffset,1.5,0,Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(posX+3,posY-12+bobOffset,1.5,0,Math.PI*2);
  ctx.fill();
  ctx.fillStyle="#fff";
  ctx.beginPath();
  ctx.arc(posX-2.2,posY-12.8+bobOffset,.7,0,Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(posX+3.8,posY-12.8+bobOffset,.7,0,Math.PI*2);
  ctx.fill();}
  // cheeks
  if (hpPercent>.5){ctx.fillStyle="rgba(255,120,140,.4)";
  ctx.beginPath();
  ctx.ellipse(posX-5.5,posY-9.5+bobOffset,2.5,1.5,0,0,Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(posX+5.5,posY-9.5+bobOffset,2.5,1.5,0,0,Math.PI*2);
  ctx.fill();}
  // ── attack weapon animation (drawn IN FRONT) ──
  if (isAttacking&&yuyuData.target){
    const dx = yuyuData.target.x-posX,dy=yuyuData.target.y-posY,ang=Math.atan2(dy,dx);
    const swing = Math.sin(time*18)*.3;
    ctx.save();
    ctx.translate(posX,posY+bobOffset);
    ctx.rotate(ang+swing);
    if (isBow){
      // bow draw: arc + arrow
      ctx.strokeStyle="#8b5e3c";
      ctx.lineWidth=2;
      ctx.lineCap="round";
      ctx.beginPath();
      ctx.arc(0,0,9,-.7,.7);
      ctx.stroke();
      ctx.strokeStyle="#f5deb3";
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(-9,0);
      ctx.lineTo(9,0);
      ctx.stroke();
      ctx.fillStyle="#c4a882";
      ctx.beginPath();
      ctx.moveTo(14,0);
      ctx.lineTo(9,-2);
      ctx.lineTo(9,2);
      ctx.closePath();
      ctx.fill();
      // bowstring draw
      ctx.strokeStyle="#d4a017";
      ctx.lineWidth=.8;
      ctx.beginPath();
      ctx.moveTo(-8,0);
      ctx.lineTo(-4,-7);
      ctx.moveTo(-8,0);
      ctx.lineTo(-4,7);
      ctx.stroke();
    } else if (isStaff){
      // staff: orb blast effect
      ctx.strokeStyle=isBerserkerMode?"#a855f7":"#60a5fa";
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(2,0);
      ctx.lineTo(24,0);
      ctx.stroke();
      ctx.shadowColor=isBerserkerMode?"#a855f7":"#3b82f6";
      ctx.shadowBlur=10;
      ctx.fillStyle=isBerserkerMode?"#c084fc":"#93c5fd";
      ctx.beginPath();
      ctx.arc(28,0,5,0,Math.PI*2);
      ctx.fill();
      ctx.shadowBlur=0;
      // sparkle
      ctx.strokeStyle=isBerserkerMode?"rgba(192,132,252,.5)":"rgba(147,197,253,.5)";
      ctx.lineWidth=1;
      for (let i = 0; i < 4;i++){const a = i*Math.PI/2+time*4;
      ctx.beginPath();
      ctx.moveTo(28+Math.cos(a)*6,Math.sin(a)*6);
      ctx.lineTo(28+Math.cos(a)*9,Math.sin(a)*9);
      ctx.stroke();}
    } else {
      // sword / darkblade swing
      const col = isDark?"#7c3aed":isBerserkerMode?"#e879f9":"#e2e8f0";
      ctx.fillStyle=col;
      ctx.beginPath();
      ctx.roundRect(5,-2,isDark?26:22,isDark?5:4,2);
      ctx.fill();
      ctx.fillStyle="#f59e0b";
      ctx.fillRect(3,-4,4,8);
      if (isDark||isBerserkerMode){ctx.strokeStyle=isDark?"rgba(139,92,246,.6)":"rgba(232,121,249,.5)";
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.roundRect(4,-3,isDark?28:23,isDark?7:6,2);
      ctx.stroke();}
    }
    ctx.restore();
  }
  // shield bubble
  if (yuyuData.shield>0){ctx.strokeStyle="rgba(96,165,250,.7)";
  ctx.lineWidth=2;
  ctx.setLineDash([4,3]);
  ctx.beginPath();
  ctx.arc(posX,posY+bobOffset,16+yuyuData.shield*4,0,Math.PI*2);
  ctx.stroke();
  ctx.setLineDash([]);}
  // speed trail
  if (yuyuData.speedBoost){ctx.fillStyle="rgba(251,191,36,.12)";
  ctx.beginPath();
  ctx.ellipse(posX-8,posY+2+bobOffset,6,8,0,0,Math.PI*2);
  ctx.fill();}
  // ── BLOCK stance — raised arm guard ──
  if (isBlocking) {
    ctx.save();
    // Glow ring — blue (parry window) or white (blocking)
    ctx.strokeStyle = isParryWindow ? `rgba(253,224,71,${0.5+Math.sin(time*18)*.4})` : "rgba(147,197,253,.55)";
    ctx.lineWidth = isParryWindow ? 2.5 : 1.5;
    ctx.setLineDash(isParryWindow ? [] : [3,3]);
    ctx.beginPath();
    ctx.arc(posX, posY+bobOffset, 18, 0, Math.PI*2);
    ctx.stroke();
    ctx.setLineDash([]);
    // Raised forearm block
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = isParryWindow ? "#fde68a" : "#93c5fd";
    ctx.beginPath();
    ctx.roundRect(posX+7, posY-16+bobOffset, 5, 16, 3);
    ctx.fill();
    ctx.restore();
  }
  // ── PARRY flash ──
  if (justParried) {
    const t2 = (game.t - yuyuData.lastParryT) / 0.45;
    ctx.save();
    ctx.globalAlpha = (1-t2) * 0.8;
    ctx.fillStyle = "#fde68a";
    ctx.shadowColor = "#fbbf24";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(posX, posY+bobOffset, 22*(0.5+t2*.5), 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }
  // HP bar
  const hbW = 28,hbH=3,hbX=posX-hbW/2,hbY=posY-25+bobOffset;
  ctx.fillStyle="rgba(0,0,0,.5)";
  ctx.fillRect(hbX,hbY,hbW,hbH);
  ctx.fillStyle=hpPercent>.5?COLORS.green:hpPercent>.25?COLORS.gold:COLORS.red;
  ctx.fillRect(hbX,hbY,hbW*Math.max(0,hpPercent),hbH);
  ctx.restore();
}

function drawMonsterSprite(ctx,monster,time){
  const{x,y,id,w,hp,maxHp,color}=monster,hpPct=Math.max(0,hp/maxHp);
  const frozenAlpha = monster.freezeUntil&&monster.freezeUntil>time?0.5:1;
  ctx.save();
  ctx.globalAlpha=frozenAlpha;
  if (monster.freezeUntil&&monster.freezeUntil>time){ctx.shadowColor="#7ff8f0";ctx.shadowBlur=10;}
  switch (id){
    case "slime":{
      const bob = Math.sin(time*7+x)*2.5,sq=.85+.15*Math.abs(Math.sin(time*7+x));
    ctx.fillStyle=color;
    ctx.shadowColor=color;
    ctx.shadowBlur=6;
    ctx.beginPath();
    ctx.ellipse(x,y+bob,w/2*1.1,w/2*sq,0,0,Math.PI*2);
    ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle="rgba(255,255,255,.25)";
    ctx.beginPath();
    ctx.ellipse(x-2,y+bob-3,3,2,-.3,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle="#1a2a1a";
    ctx.beginPath();
    ctx.arc(x-3,y+bob-2,2,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x+3,y+bob-2,2,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle="white";
    ctx.beginPath();
    ctx.arc(x-2.3,y+bob-2.5,.8,0,Math.PI*2);
    ctx.fill();break;
    }
    case "spike":{ctx.fillStyle=color;
    ctx.shadowColor=color;
    ctx.shadowBlur=5;
    ctx.beginPath();for (let i = 0; i < 6;i++){const a = i*Math.PI/3-Math.PI/6+Math.sin(time*2)*.1,r=w/2*(i%2===0?1:.65);i===0?ctx.moveTo(x+r*Math.cos(a),y+r*Math.sin(a)):ctx.lineTo(x+r*Math.cos(a),y+r*Math.sin(a));}ctx.closePath();
    ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle="#ff8c00";for (let i = 0; i < 4;i++){const a = i*Math.PI/2;
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0,-w/2);
    ctx.lineTo(3,-w/2-6);
    ctx.lineTo(-3,-w/2-6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();}break;
    }
    case "dash":{
      for (let i = 3;i>0;i--){ctx.fillStyle=`rgba(220,50,50,${.07*i})`;
    ctx.beginPath();
    ctx.ellipse(x-i*7,y,w/2*(0.6+i*.12),w/4,0,0,Math.PI*2);
    ctx.fill();
    }
    ctx.fillStyle=color;
    ctx.shadowColor=color;
    ctx.shadowBlur=7;
    ctx.beginPath();
    ctx.ellipse(x,y,w/2,w/3,0,0,Math.PI*2);
    ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle="rgba(255,255,255,.5)";
    ctx.beginPath();
    ctx.ellipse(x,y-1,w/4,1.5,0,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle="#fff";
    ctx.beginPath();
    ctx.arc(x+3,y,3,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle="#200000";
    ctx.beginPath();
    ctx.arc(x+4,y,1.5,0,Math.PI*2);
    ctx.fill();break;
    }
    case "tank":{
      const pulse = Math.sin(time*1.5)*.5;
    ctx.fillStyle="#5a2d0c";
    ctx.shadowColor="#8a4d1c";
    ctx.shadowBlur=4;
    ctx.beginPath();
    ctx.roundRect(x-w/2,y-w/2,w,w,3);
    ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle="#3d1a06";
    ctx.fillRect(x-w/2,y-w/2,w/2.5,w/2.5);
    ctx.fillRect(x+w/6,y-w/2,w/2.5,w/2.5);
    ctx.fillRect(x-w/2,y+w/6,w/2.5,w/2.5);
    ctx.fillRect(x+w/6,y+w/6,w/2.5,w/2.5);
    ctx.fillStyle="#f59e0b";[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy])=> {ctx.beginPath();
    ctx.arc(x+dx*(w/2-3),y+dy*(w/2-3),1.5,0,Math.PI*2);
    ctx.fill();});
    ctx.fillStyle=`rgba(255,80,0,${.8+pulse*.2})`;
    ctx.fillRect(x-5,y-1.5,10,3);break;
    }
    case "phantom":{
      const tp = Math.sin(time*3+x)*.3;
    ctx.globalAlpha=frozenAlpha*(0.4+Math.abs(tp)*.6);
    ctx.fillStyle=color;
    ctx.shadowColor=color;
    ctx.shadowBlur=12;
    ctx.beginPath();
    ctx.ellipse(x,y,w/2,w/2,0,0,Math.PI*2);
    ctx.fill();
    ctx.shadowBlur=0;
    ctx.globalAlpha=frozenAlpha*(0.7+Math.abs(tp)*.3);
    ctx.fillStyle="rgba(200,180,255,.6)";for (let i = 0; i < 3;i++){const a = i*(Math.PI*2/3)+time*2,rx=x+Math.cos(a)*w*.4,ry=y+Math.sin(a)*w*.3;
    ctx.beginPath();
    ctx.arc(rx,ry,2.5,0,Math.PI*2);
    ctx.fill();
    }
    ctx.fillStyle="#fff";
    ctx.beginPath();
    ctx.arc(x-3,y-2,2.5,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x+3,y-2,2.5,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle="#1a0a2a";
    ctx.beginPath();
    ctx.arc(x-3,y-2,1.5,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x+3,y-2,1.5,0,Math.PI*2);
    ctx.fill();break;
    }
    case "golem":{ctx.fillStyle="#334155";
    ctx.shadowColor="#475569";
    ctx.shadowBlur=5;
    ctx.beginPath();
    ctx.roundRect(x-w/2,y-w/2,w,w,5);
    ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle="#1e293b";for (let i = 0; i < 3;i++)for (let j = 0; j < 3;j++){ctx.beginPath();
    ctx.roundRect(x-w/2+2+i*(w/3+1),y-w/2+2+j*(w/3+1),w/3-1,w/3-1,2);
    ctx.fill();}const eyePulse = .5+Math.sin(time*2)*.5;
    ctx.fillStyle=`rgba(239,68,68,${eyePulse})`;
    ctx.shadowColor="#ef4444";
    ctx.shadowBlur=8;
    ctx.beginPath();
    ctx.arc(x-4,y-3,3,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x+4,y-3,3,0,Math.PI*2);
    ctx.fill();
    ctx.shadowBlur=0;break;
    }
    case "boss":{
      const pulse = Math.sin(time*3);for (let i = 2;i>=0;i--){ctx.fillStyle=`rgba(100,20,180,${.06-i*.015})`;
    ctx.beginPath();
    ctx.arc(x,y,w/2+6+i*5+pulse*2,0,Math.PI*2);
    ctx.fill();
    }
    ctx.fillStyle="#3b0764";
    ctx.shadowColor="#7e22ce";
    ctx.shadowBlur=14;
    ctx.beginPath();
    ctx.ellipse(x,y,w/2+pulse*.8,w/2+pulse*.4,0,0,Math.PI*2);
    ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle="#a855f7";for (let i = 0; i < 3;i++){const a = -Math.PI/2+(i-1)*.5;
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0,-w/2);
    ctx.lineTo(4,-w/2-10);
    ctx.lineTo(-4,-w/2-10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    }
    ctx.fillStyle=`rgba(255,50,50,${.7+pulse*.3})`;
    ctx.shadowColor="#ff0000";
    ctx.shadowBlur=8;
    ctx.beginPath();
    ctx.arc(x-7,y-3,4,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x+7,y-3,4,0,Math.PI*2);
    ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle="#200000";
    ctx.beginPath();
    ctx.arc(x-7,y-3,2,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x+7,y-3,2,0,Math.PI*2);
    ctx.fill();
    ctx.strokeStyle="rgba(255,100,150,.8)";
    ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.moveTo(x-7,y+5);for (let i = 0;i<=6;i++)ctx.lineTo(x-7+i*2,y+5+(i%2===0?-2:2));
    ctx.stroke();break;
    }
    case "megaboss":{
      const pulse = Math.sin(time*2),mp=Math.sin(time*4);for (let i = 3;i>=0;i--){ctx.fillStyle=`rgba(200,0,0,${.05-i*.01})`;
    ctx.beginPath();
    ctx.arc(x,y,w/2+8+i*7+pulse*3,0,Math.PI*2);
    ctx.fill();
    }
    ctx.fillStyle="#3b0000";
    ctx.shadowColor="#dc2626";
    ctx.shadowBlur=18;
    ctx.beginPath();
    ctx.ellipse(x,y,w/2+pulse,w/2+pulse*.5,0,0,Math.PI*2);
    ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle="#fbbf24";for (let i = 0; i < 5;i++){const a = -Math.PI/2+(i-2)*.4;
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0,-w/2-2);
    ctx.lineTo(5,-w/2-16);
    ctx.lineTo(-5,-w/2-16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    }
    ctx.fillStyle=`rgba(255,200,0,${.8+mp*.2})`;
    ctx.shadowColor="#fbbf24";
    ctx.shadowBlur=10;
    ctx.beginPath();
    ctx.arc(x-9,y-4,5,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x+9,y-4,5,0,Math.PI*2);
    ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle="#300000";
    ctx.beginPath();
    ctx.arc(x-9,y-4,2.5,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x+9,y-4,2.5,0,Math.PI*2);
    ctx.fill();
    ctx.strokeStyle="rgba(255,80,80,.9)";
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(x-10,y+7);for (let i = 0;i<=8;i++)ctx.lineTo(x-10+i*2.5,y+7+(i%2===0?-3:3));
    ctx.stroke();break;
    }
    default:break;
  }
  // ── FOV cone visual ──────────────────────────────────────────────────────
  const fovDef = MFOV[monster.id] || MFOV.slime;
  const facing  = monster.facing ?? 0;
  const isAlert = monster.alertUntil && monster.alertUntil > time;
  const coneColor = isAlert ? "rgba(239,68,68," : "rgba(255,220,50,";
  const coneRange = Math.min(fovDef.vRange, 120); // cap visual range so it's not huge
  // Draw FOV cone (two arcs + fill)
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, coneRange, facing - fovDef.fov, facing + fovDef.fov);
  ctx.closePath();
  ctx.fillStyle = coneColor + "1)";
  ctx.fill();
  // Cone edge lines — slightly more visible
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = coneColor + "1)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(facing - fovDef.fov) * coneRange, y + Math.sin(facing - fovDef.fov) * coneRange);
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(facing + fovDef.fov) * coneRange, y + Math.sin(facing + fovDef.fov) * coneRange);
  ctx.stroke();
  ctx.restore();
  // Alert exclamation mark above monster
  if (isAlert) {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.font = `bold 10px monospace`;
    ctx.fillStyle = "#ef4444";
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 6;
    ctx.textAlign = "center";
    ctx.fillText("!", x, y - monster.w/2 - 14);
    ctx.shadowBlur = 0;
    ctx.textAlign = "left";
    ctx.restore();
  }
  // ─────────────────────────────────────────────────────────────────────────

  const hbW = monster.w+10,hbH=3.5,hbX=x-hbW/2,hbY=y-monster.w/2-10;
  ctx.globalAlpha=1;
  ctx.fillStyle="rgba(0,0,0,.6)";
  ctx.fillRect(hbX,hbY,hbW,hbH);
  ctx.fillStyle=hpPct>.5?"#22c55e":hpPct>.25?"#f59e0b":"#ef4444";
  ctx.fillRect(hbX,hbY,hbW*Math.max(0,hpPct),hbH);
  if (monster.id==="boss"||monster.id==="megaboss"){
    ctx.fillStyle="rgba(255,255,255,.7)";
    ctx.font=`bold 7px monospace`;
    ctx.textAlign="center";
    ctx.fillText(monster.id==="megaboss"?"MEGA BOSS":"BOSS",x,hbY-2);
    ctx.textAlign="left";
  }
  ctx.restore();
}

function drawParticle(ctx,particle){ctx.save();
ctx.globalAlpha=Math.max(0,Math.min(1,particle.life*2));
ctx.font="bold 10px monospace";
ctx.fillStyle=particle.col;
ctx.shadowColor=particle.col;
ctx.shadowBlur=3;
ctx.fillText(particle.txt,particle.x,particle.y);
ctx.restore();}

// ── SHEET ──────────────────────────────────────────────────────────────────

function Sheet({onClose,title,children,maxH="84vh"}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(4,2,12,.75)",backdropFilter:"blur(10px)"}}/>
      <div style={{position:"relative",borderRadius:"28px 28px 0 0",background:"linear-gradient(180deg,#16102a 0%,#0e0920 60%,#09061a 100%)",border:"1px solid rgba(255,255,255,.07)",borderBottom:"none",maxHeight:maxH,overflowY:"auto",scrollbarWidth:"none",animation:"sheetUp .28s cubic-bezier(.16,1,.3,1)",boxShadow:"0 -30px 80px rgba(0,0,0,.7),0 -1px 0 rgba(124,58,237,.15)"}}>
        {/* Handle + header */}
        <div style={{position:"sticky",top:0,zIndex:2,background:"linear-gradient(180deg,#16102a 80%,transparent 100%)",borderRadius:"28px 28px 0 0",padding:"14px 20px 10px"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10,cursor:"pointer"}} onClick={onClose}>
            <div style={{width:36,height:4,borderRadius:99,background:"rgba(255,255,255,.12)"}}/>
          </div>
          {title&&<div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(124,58,237,.25))"}}/>
            <span style={{fontSize:9,color:"rgba(196,181,253,.6)",letterSpacing:".22em",fontWeight:800}}>{title.toUpperCase()}</span>
            <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(124,58,237,.25),transparent)"}}/>
          </div>}
        </div>
        <div style={{padding:"0 0 48px"}}>{children}</div>
      </div>
    </div>
  );
}

// ── YUYU AVATAR ────────────────────────────────────────────────────────────

function YuyuEyes({mood,size}){
  const eW = size*.07,eH=size*.09,lX=size*.35,rX=size*.65,eY=size*.18;
  const eyeDefault = (<><ellipse cx={lX} cy={eY} rx={eW} ry={eH} fill="#1a0814"/><ellipse cx={rX} cy={eY} rx={eW} ry={eH} fill="#1a0814"/><circle cx={lX-size*.02} cy={eY-size*.025} r={size*.025} fill="white" opacity=".9"/><circle cx={rX-size*.02} cy={eY-size*.025} r={size*.025} fill="white" opacity=".9"/></>);
  if (mood==="excited"||mood==="happy")return(<><path d={`M${lX-eW} ${eY} Q${lX} ${eY-eH*1.3} ${lX+eW} ${eY}`} fill="#1a0814"/><path d={`M${rX-eW} ${eY} Q${rX} ${eY-eH*1.3} ${rX+eW} ${eY}`} fill="#1a0814"/></>);
  if (mood==="proud")return(<><path d={`M${lX-eW} ${eY} Q${lX} ${eY-eH*1.3} ${lX+eW} ${eY}`} fill="#1a0814"/><path d={`M${rX-eW} ${eY} Q${rX} ${eY-eH*1.3} ${rX+eW} ${eY}`} fill="#1a0814"/><line x1={lX-eW-2} y1={eY-eH*.5} x2={lX+eW+2} y2={eY-eH*1.1} stroke="#1a0814" strokeWidth={size*.025}/><line x1={rX-eW-2} y1={eY-eH*1.1} x2={rX+eW+2} y2={eY-eH*.5} stroke="#1a0814" strokeWidth={size*.025}/></>);
  if (mood==="tired")return(<><ellipse cx={lX} cy={eY+eH*.1} rx={eW} ry={eH*.42} fill="#1a0814"/><ellipse cx={rX} cy={eY+eH*.1} rx={eW} ry={eH*.42} fill="#1a0814"/><path d={`M${lX-eW*1.3} ${eY-eH*.3} Q${lX} ${eY-eH*.72} ${lX+eW*1.3} ${eY-eH*.3}`} stroke="#1a0814" strokeWidth={size*.022} fill="none"/><path d={`M${rX-eW*1.3} ${eY-eH*.3} Q${rX} ${eY-eH*.72} ${rX+eW*1.3} ${eY-eH*.3}`} stroke="#1a0814" strokeWidth={size*.022} fill="none"/></>);
  if (mood==="hurt")return(<><path d={`M${lX-eW} ${eY-eH*.3} L${lX+eW} ${eY+eH*.3}`} stroke="#1a0814" strokeWidth={size*.03} strokeLinecap="round"/><path d={`M${lX-eW} ${eY+eH*.3} L${lX+eW} ${eY-eH*.3}`} stroke="#1a0814" strokeWidth={size*.03} strokeLinecap="round"/><path d={`M${rX-eW} ${eY-eH*.3} L${rX+eW} ${eY+eH*.3}`} stroke="#1a0814" strokeWidth={size*.03} strokeLinecap="round"/><path d={`M${rX-eW} ${eY+eH*.3} L${rX+eW} ${eY-eH*.3}`} stroke="#1a0814" strokeWidth={size*.03} strokeLinecap="round"/></>);
  if (mood==="nervous"||mood==="determined")return(<><ellipse cx={lX} cy={eY} rx={eW} ry={eH} fill="#1a0814"/><ellipse cx={rX} cy={eY} rx={eW} ry={eH} fill="#1a0814"/><circle cx={lX-size*.02} cy={eY-size*.025} r={size*.025} fill="white" opacity=".9"/><circle cx={rX-size*.02} cy={eY-size*.025} r={size*.025} fill="white" opacity=".9"/></>);
  return eyeDefault;
}

function YuyuAvatar({mood="happy",size=80,onClick,prestige=0}){
  const moodStyle = MOOD_PALETTE[mood]||MOOD_PALETTE.happy;
  const [tapReaction,setTapReaction]=useState(null);
  const REACTIONS = ["♡","✨","~","💕","🌸","♪"];
  const handleTap = ()=> {if (onClick)onClick();const r = REACTIONS[Math.floor(Math.random()*REACTIONS.length)];setTapReaction(r);setTimeout(()=>setTapReaction(null),700);};
  const prestigeColors = ["#f59e0b","#a78bfa","#f0abfc","#34d399"];
  const tier = getPrestTier(prestige);
  const pColor = tier ? tier.color : null;
  return(
    <div onClick={handleTap} style={{position:"relative",width:size,height:size,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",filter:`drop-shadow(0 0 ${size*.12}px ${moodStyle.glow})`,flexShrink:0,cursor:"pointer",WebkitTapHighlightColor:"transparent"}}>
      {pColor&&<div style={{position:"absolute",inset:-4,borderRadius:"50%",border:`2px solid ${pColor}`,opacity:.7,animation:"orbFloat 2s ease-in-out infinite"}}/>}
      <div style={{position:"absolute",top:size*.01,left:size*.08,width:size*.84,height:size*.58,background:"linear-gradient(170deg,#120008 60%,#2a0a18)",borderRadius:"50% 50% 45% 45%",zIndex:0}}/>
      <div style={{position:"absolute",top:size*.28,left:size*.04,width:size*.18,height:size*.48,background:"#120008",borderRadius:"40% 20% 50% 30%",zIndex:0}}/>
      <div style={{position:"absolute",top:size*.28,right:size*.04,width:size*.18,height:size*.48,background:"#120008",borderRadius:"20% 40% 30% 50%",zIndex:0}}/>
      <div style={{position:"absolute",top:size*.03,left:size*.12,width:size*.55,height:size*.24,background:"linear-gradient(160deg,#1a0a14,#0d0008)",borderRadius:"50% 30% 60% 20%",zIndex:2,transform:"rotate(-3deg)"}}/>
      <div style={{position:"absolute",top:size*.12,left:size*.14,width:size*.72,height:size*.72,background:`radial-gradient(ellipse at 40% 35%, #fff0f3, ${moodStyle.tint})`,borderRadius:"50%",zIndex:1,boxShadow:"inset 0 2px 8px rgba(200,100,120,.08)",transition:"background .5s"}}/>
      {moodStyle.cheek&&<><div style={{position:"absolute",top:size*.52,left:size*.16,width:size*.18,height:size*.1,background:"rgba(255,130,150,.35)",borderRadius:"50%",zIndex:3,filter:"blur(2px)"}}/><div style={{position:"absolute",top:size*.52,right:size*.16,width:size*.18,height:size*.1,background:"rgba(255,130,150,.35)",borderRadius:"50%",zIndex:3,filter:"blur(2px)"}}/></>}
      <svg style={{position:"absolute",top:size*.24,left:0,right:0,width:"100%",height:size*.32,zIndex:4,overflow:"visible",transform:tapReaction?"scale(0.92)":"scale(1)",transition:"transform 0.15s"}} viewBox={`0 0 ${size} ${size*.32}`}>
        <YuyuEyes mood={mood} size={size}/>
      </svg>
      <div style={{position:"absolute",top:size*.56,left:"50%",transform:"translateX(-50%)",width:size*.04,height:size*.03,background:"rgba(180,100,120,.35)",borderRadius:"50%",zIndex:4}}/>
      <div style={{position:"absolute",bottom:size*.08,left:"50%",transform:"translateX(-50%)",width:size*.35,height:size*.065,background:"#0d0008",borderRadius:"999px",zIndex:5,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:size*.07,height:size*.07,background:"linear-gradient(135deg,#d4a0b0,#c0a0b0)",borderRadius:"50%"}}/></div>
      {moodStyle.extra&&<div style={{position:"absolute",top:-size*.08,right:-size*.04,fontSize:size*.22,zIndex:6,lineHeight:1,animation:"orbFloat 2.4s ease-in-out infinite"}}>{moodStyle.extra}</div>}
      {pColor&&prestige>0&&<div style={{position:"absolute",bottom:-size*.13,left:"50%",transform:"translateX(-50%)",zIndex:7,whiteSpace:"nowrap"}}><PrestigeBadge prestige={prestige} size={size>=64?"md":"sm"}/></div>}
      {tapReaction&&<div style={{position:"absolute",top:"-28px",left:"50%",fontSize:size*.28,zIndex:10,pointerEvents:"none",animation:"reactionPop 0.7s ease-out forwards",whiteSpace:"nowrap",color:COLORS.pink,transform:"translateX(-50%)"}}>{tapReaction}</div>}
    </div>
  );
}

// ── BATTLE ARENA PANEL ─────────────────────────────────────────────────────

function DungeonArenaPanel({state,dispatch,onEnd,started,onStart,onUpgrade,onSettings,cinemaMode,setCinemaMode,camFollow,setCamFollow,persistZoomRef}){
  const [dims,setDims]=useState({CW:window.innerWidth,CH:window.innerHeight});
  const {CW,CH}=dims;
  const containerRef = useRef(null);
  useEffect(()=> {
    const el = containerRef.current;
    if (!el)return;
    const ro = new ResizeObserver(entries=> {
      const{width,height}=entries[0].contentRect;
      setDims({CW:Math.round(width),CH:Math.round(height)});
    });
    ro.observe(el);
    return()=>ro.disconnect();
  },[]);
  const canvasRef = useRef(null),gameRef=useRef(null),animFrameRef=useRef(null),pausedRef=useRef(false);
  const grantKillRef = useRef(null);
  const cinemaModeRef = useRef(cinemaMode);
  useEffect(()=>{ cinemaModeRef.current = cinemaMode; },[cinemaMode]);
  // zoomRef initialized from persistZoomRef so zoom survives battle remounts
  const zoomRef      = useRef(persistZoomRef ? persistZoomRef.current : 1.0);
  // Keep persistZoomRef in sync whenever zoomRef changes
  const setZoom = useRef((v) => {
    zoomRef.current = v;
    if (persistZoomRef) persistZoomRef.current = v;
  }).current;
  const camFollowRef = useRef(camFollow);
  useEffect(()=>{ camFollowRef.current = camFollow; },[camFollow]);
  const startedRef = useRef(started);
  useEffect(()=> {startedRef.current=started;},[started]);
  // Live settings ref — read every tick without rebuilding game loop
  const settingsRef = useRef(state.settings || DEFAULT_SETTINGS);
  useEffect(()=> {
    settingsRef.current = state.settings || DEFAULT_SETTINGS;
    SFX.setVol(settingsRef.current.sfxVol ?? 0.55);
    SFX.setEnabled(settingsRef.current.sfxEnabled !== false);
    SFX.setMusicVol(settingsRef.current.musicVol ?? 0.40);
    // musicEnabled: stop/start campfire immediately when toggled
    if (settingsRef.current.musicEnabled === false) {
      SFX.stopCampfire();
    }
  },[state.settings]);
  const fpsRef = useRef(0);
  const [fpsDisplay, setFpsDisplay] = useState(0);
  const [paused,setPausedState]=useState(false);
  const [dlg,setDlg]=useState("");
  const [showTools,setShowTools]=useState(false);
  const cdsRef = useRef({});
  const [cds,setCds]=useState({});
  const [liveStats,setLiveStats]=useState(()=> ({hp:state.yuyu.hp||state.yuyu.maxHp||100,max:state.yuyu.maxHp||100,kills:0,bossHpPct:1,bossHp:0,bossMaxHp:0,combo:0,energy:ENERGY_MAX,maxEnergy:ENERGY_MAX}));
  const [liveStrategy,setLiveStrategy]=useState(null);
  const [zoomDisplay,setZoomDisplay]=useState(1.0); // HUD-only display, not for tick logic
  const setPaused = v=> {pausedRef.current=v;setPausedState(v);};
  const toggleCinema = ()=> {const nc = !cinemaModeRef.current;cinemaModeRef.current=nc;setCinemaMode(nc);};

  // Keep a ref to state.yuyu so fireSkill stays stable across regen ticks
  const stateYuyuRef = useRef(state.yuyu);
  useEffect(()=> {stateYuyuRef.current=state.yuyu;},[state.yuyu]);

  const dlgApiRef = useRef({lastCall:0,pending:false});
  const flash = useCallback(msg => {
    setDlg(msg);
    // Only speak lines that are actual Yuyu dialog (not system flashes like "Shield ✦" or "🔥 3x COMBO!")
    const isYuyuLine = msg && !msg.startsWith("⚡") && !msg.startsWith("🔥") && !msg.startsWith("Shield");
    if (isYuyuLine) {
      YuyuVoice.speak(msg, stateYuyuRef.current?.settings || DEFAULT_SETTINGS);
    }
    setTimeout(() => setDlg(""), 2800);
  }, []);
  const yuyuSay = useCallback(async(event, ctx = {}) => {
    const now = Date.now();
    const dFreq = stateYuyuRef.current?.settings?.dialogFreq||"normal";
    if(dFreq==="off") return;
    if(!stateYuyuRef.current?.settings?.battleDialog && event!=="win"&&event!=="lose") return;
    const cooldown = dFreq==="rare"?16000:dFreq==="often"?4000:8000;
    if (dlgApiRef.current.pending || now - dlgApiRef.current.lastCall < cooldown) return;
    dlgApiRef.current.pending  = true;
    dlgApiRef.current.lastCall = now;

    // User-facing event description (the "what happened" message to AI)
    const playerName = stateYuyuRef.current?.settings?.playerName || "Papa";
    const dLen = stateYuyuRef.current?.settings?.dialogLength||"normal";
    const lenHint = dLen==="short"?"Balas SANGAT singkat, maks 1 kalimat pendek.":dLen==="long"?"Boleh 2-3 kalimat dengan lebih banyak ekspresi.":"Balas 1-2 kalimat singkat.";
    const eventDesc  = {
      kill  : `Yuyu baru bunuh musuh ke-${ctx.kills||1}${ctx.combo>=3?`, combo ${ctx.combo}x!`:""}. HP ${ctx.hpPct||"?"}%. Stage ${ctx.stage}.`,
      hurt  : `Yuyu kena damage! HP tinggal ${ctx.hpPct||"?"}%. ${ctx.count||1} musuh tersisa.`,
      win   : `Yuyu MENANG di Stage ${ctx.stage}! Bunuh ${ctx.kills||0} musuh. Gold +${ctx.gold||0}.`,
      lose  : `Yuyu KO di Stage ${ctx.stage}... setelah ${ctx.kills||0} kill.`,
      lowHp : `Yuyu HP kritis: ${ctx.hpPct||"?"}%! Masih ${ctx.count||"?"} musuh.`,
    }[event] || event;

    // Build rich layered system prompt using all Lyuyu-learned systems
    const sysPrompt = buildYuyuBattlePrompt({
      event,
      gameState     : { yuyu: stateYuyuRef.current, world: { stage: ctx.stage || 1 }, player: { deaths: 0 } },
      playerName,
      ctx,
      suppressedLayer: stateYuyuRef.current?.suppressedLayer || [],
      lenHint,
    });

    try {
      const txt = await callClaudeWithRetry(sysPrompt, eventDesc, 60);
      if (txt) flash(txt);
    } catch (e) {
      // Silent fail — battle dialog is non-critical
    }
    dlgApiRef.current.pending = false;
  }, [flash]);

  // fireSkill reads stateYuyuRef so its identity never changes → game loop stable
  const fireSkill = useCallback((sid)=> {
    if (!gameRef.current||!gameRef.current.yuyu||gameRef.current.ended)return false;
    if (cdsRef.current[sid])return false;
    const sk = SKILLS[sid];
    if (!sk)return false;
    const game = gameRef.current,yuyu=game.yuyu;
    const sy = stateYuyuRef.current;
    const lvi = skillLvIdx(sy,sid);
    const str = sy.stats?.str||1, def = sy.stats?.def||1;
    const grantKill = m=> {if (grantKillRef.current)grantKillRef.current(m);};
    const cdSetting = stateYuyuRef.current?.settings?.skillCooldown||"normal";
    const cdMult = cdSetting==="long"?1.8:cdSetting==="short"?.45:cdSetting==="instant"?0.01:1;

    // ── Energy system ──────────────────────────────────────────────────────
    const energyCost = sk.energy || 0;
    const curEnergy  = yuyu.energy ?? ENERGY_MAX;
    // If insufficient energy: skill fires at reduced effect (penaltyMult < 1)
    const penaltyMult = energyCost > 0 ? Math.min(1, curEnergy / energyCost) : 1;
    // Deduct energy (never below 0)
    yuyu.energy = Math.max(0, curEnergy - energyCost);
    // ──────────────────────────────────────────────────────────────────────
    if (sid==="starBurst"){
      // AoE dmg = base + STR×7, reduced by penaltyMult if low energy
      game.monsters.forEach(m=> {if (m.hp>0){m.hp-=Math.round((sk.dmg[lvi]+str*7)*penaltyMult);if (m.hp<=0)grantKill(m);}});
      SFX.play("skill");
      if (penaltyMult<0.6) game.parts.push({x:yuyu.x,y:yuyu.y-20,vx:0,vy:-40,life:.7,col:"#fbbf24",txt:"⚡ Low Energy!"});
    }
    else if (sid==="healPulse"){
      // Heal reduced if low energy
      const healAmt = Math.round((sk.healBase[lvi] + def * sk.healDef[lvi]) * penaltyMult);
      yuyu.hp=Math.min(yuyu.maxHp, yuyu.hp + healAmt);
      if (lvi>=2) yuyu.tempDef=game.t+3;
      SFX.play("heal");
    }
    else if (sid==="shieldCube"){
      // Fewer blocks if low energy
      yuyu.shield=Math.max(1, Math.round(sk.blocks[lvi]*penaltyMult));
      SFX.play("shield");
    }
    else if (sid==="speedRush"){
      // Shorter duration if low energy
      yuyu.speedBoost=true;SFX.play("speedRush");
      const dur=sk.dur[lvi]*penaltyMult;
      setTimeout(()=>{if(gameRef.current?.yuyu)gameRef.current.yuyu.speedBoost=false;},dur);
    }
    else if (sid==="thunderStrike"){
      const tdmg = Math.round((sk.dmg[lvi] + str * sk.strMult[lvi]) * penaltyMult);
      const alive = game.monsters.filter(m=>m.hp>0);
      alive.forEach(m=> {m.hp-=tdmg;m.stunUntil=game.t+1.5*penaltyMult;if (m.hp<=0)grantKill(m);});
      SFX.play("thunder");
    }
    else if (sid==="iceBlast"){
      const idmg = Math.round(sk.iceDmg[lvi]*penaltyMult);
      const alive = game.monsters.filter(m=>m.hp>0);
      alive.forEach(m=> {m.hp-=idmg;m.freezeUntil=game.t+(sk.dur[lvi]/1000)*penaltyMult;if (m.hp<=0)grantKill(m);});
      SFX.play("iceBlast");
    }
    else if (sid==="flashStep"){
      const alive = game.monsters.filter(m=>m.hp>0);
      if (alive.length){
        const tgt = alive.reduce((a,b)=>Math.hypot(a.x-yuyu.x,a.y-yuyu.y)<Math.hypot(b.x-yuyu.x,b.y-yuyu.y)?a:b);
        yuyu.x=tgt.x+30; yuyu.y=tgt.y;
        tgt.hp -= Math.round((sk.dmg[lvi] + str * (lvi>=2?2:1)) * penaltyMult);
        tgt.stunUntil=lvi>=2?game.t+1*penaltyMult:0;
        if (tgt.hp<=0)grantKill(tgt);
        yuyu.invincibleUntil=game.t+(sk.inv[lvi]/1000)*penaltyMult;
        SFX.play("dodge");
      }
    }
    else if (sid==="battleCry"){
      yuyu.cryUntil=game.t+(sk.dur[lvi]/1000)*penaltyMult;
      yuyu.cryBonus=Math.round(str*sk.atkBonus[lvi]*penaltyMult);
      if (lvi>=2) yuyu.hp=Math.min(yuyu.maxHp, yuyu.hp + Math.round((10 + def*2)*penaltyMult));
      SFX.play("combo");
    }
    else if (sid==="timeWarp"){
      const alive = game.monsters.filter(m=>m.hp>0);
      alive.forEach(m=> {
        m.warpUntil=game.t+(sk.dur[lvi]/1000)*penaltyMult;
        m.warpSlow=sk.slow[lvi];
        if(lvi>=2)m.hp-=Math.round(15*penaltyMult);
        if(m.hp<=0)grantKill(m);
      });
      SFX.play("iceBlast");
    }
    else if (sid==="spiritBomb"){
      yuyu.chargingBomb=true; SFX.play("skill");
      const bombDmg = Math.round((sk.dmg[lvi] + str * sk.strMult[lvi]) * penaltyMult);
      setTimeout(()=> {
        const g = gameRef.current;
        if (!g||g.ended)return;
        g.monsters.filter(m=>m.hp>0).forEach(m=> {m.hp-=bombDmg;if(m.hp<=0&&grantKillRef.current)grantKillRef.current(m);});
        g.parts.push({x:g.yuyu.x,y:g.yuyu.y-20,vx:0,vy:-50,life:.9,col:"#60a5fa",txt:"💥 BOMB!"});
        g.yuyu.chargingBomb=false;
      },1500);
    }
    cdsRef.current[sid]=true;
    setCds(c=> ({...c,[sid]:true}));
    setTimeout(()=> {delete cdsRef.current[sid];setCds(c=> {const n = {...c};delete n[sid];return n;});},sk.cd*cdMult);
    return true;
  },[yuyuSay]); // stable — no state.yuyu dep

  const executeCmd = useCallback(({cmd,user})=> {
    if (!gameRef.current||!gameRef.current.yuyu||gameRef.current.ended)return;
    const yuyu = gameRef.current.yuyu;
    if (cmd==="dodge"){yuyu.speedBoost=true;flash(`⚡ ${user}: Yuyu menghindar!`);setTimeout(()=> {if (gameRef.current?.yuyu)gameRef.current.yuyu.speedBoost=false;},1500);}
    else if (cmd==="attack"){const alive = gameRef.current.monsters.filter(m=>m.hp>0);if (alive.length){const n = alive.reduce((a,b)=>Math.hypot(a.x-yuyu.x,a.y-yuyu.y)<Math.hypot(b.x-yuyu.x,b.y-yuyu.y)?a:b);yuyu.bState="ATTACK";yuyu.target=n;}}
    else if (cmd==="heal")fireSkill("healPulse");
    else if (cmd==="shield")fireSkill("shieldCube");
    else if (cmd==="burst")fireSkill("starBurst");
  },[flash,fireSkill]);

  useEffect(()=> {
    const canvas = canvasRef.current;
    if (!canvas)return;
    const ctx = canvas.getContext("2d");
    const stage = state.world.stage,biome=getBiome(stage);
    const isMegaBoss = stage%10===0&&stage>=10;
    const isBoss = stage%5===0&&!isMegaBoss;
    const monsterCountSetting = state.settings?.monsterCount || "normal";
    const monsterCountBase = isBoss||isMegaBoss?1:Math.min(14,3+Math.floor(stage*.5));
    const monsterCountMult = monsterCountSetting==="few"?.5:monsterCountSetting==="many"?1.6:monsterCountSetting==="chaos"?2.5:1;
    const monsterCount = isBoss||isMegaBoss?1:Math.max(1,Math.round(monsterCountBase*monsterCountMult));
    const pool = stage<=5?["slime","dash"]:stage<=8?["slime","spike","phantom"]:stage<=12?["spike","dash","tank","phantom"]:stage<=16?["spike","tank","phantom","golem"]:stage<=22?["dash","tank","phantom","golem"]:["dash","phantom","golem","tank"];
    const scale = 1+stage*.08;
    const diffSetting = state.settings?.difficulty || "normal";
    const diffHpMult  = diffSetting==="easy"?.7:diffSetting==="hard"?1.35:diffSetting==="extreme"?1.75:1;
    const diffDmgMult = diffSetting==="easy"?.6:diffSetting==="hard"?1.4:diffSetting==="extreme"?1.9:1;
    const atkSpeedSetting = state.settings?.yuyuAtkSpeed || "normal";
    const atkSpeedMult    = atkSpeedSetting==="slow"?1.6:atkSpeedSetting==="fast"?.65:atkSpeedSetting==="ultra"?.35:1;
    const moveSpeedSetting= state.settings?.yuyuMoveSpeed || "normal";
    const moveSpeedMult   = moveSpeedSetting==="slow"?.6:moveSpeedSetting==="fast"?1.5:moveSpeedSetting==="ultra"?2.2:1;
    const eStats = getEffectiveStats(state.yuyu);
    const pb = getPrestBonus(state.yuyu.prestige||0);
    const levelMult = getLevelMult(state.yuyu.level||1);
    // World = canvas size; zoom handled by ctx.scale in draw, not world expansion
    const WW = CW;
    const WH = CH;
    const groundY = WH*GROUND_Y_RATIO;
    const spawnFloorMax = WH-218;
    const obstacles = getObstacles(biome,WW,WH,stage);
    // Spawn monsters at right side, staggered formation
    const monsters = Array.from({length:monsterCount},(_,i)=> {
      const mt = (isMegaBoss?MTYPES.find(m=>m.id==="megaboss"):isBoss?MTYPES.find(m=>m.id==="boss"):MTYPES.find(m=>m.id===pool[Math.floor(Math.random()*pool.length)]))||MTYPES[0];
      const col = i%4,row=Math.floor(i/4);
      const spawnX = CW*0.65+col*50+Math.random()*20;
      const spawnY = groundY+20+mt.w/2+row*45+Math.random()*10;
      return {...mt,uid:i,x:spawnX,y:Math.min(spawnY,spawnFloorMax-20),maxHp:mt.hp*scale*diffHpMult,hp:mt.hp*scale*diffHpMult,dmg:mt.dmg*scale*diffDmgMult,spd:mt.spd*(diffSetting==="extreme"?1.2:diffSetting==="hard"?1.1:1),lastHit:0,waiting:true,stunUntil:0,freezeUntil:0,
        // FOV system fields
        facing: Math.PI + (Math.random() - 0.5) * Math.PI * 0.6, // face roughly left but with variation
        alertUntil: 0,         // timestamp until still chasing after losing sight
        lastSeenX: null,       // last known Yuyu position
        lastSeenY: null,
        patrolT: Math.random() * Math.PI * 2, // stagger patrol phase so monsters don't move in sync
      };
    });
    const initHp = (state.yuyu.hp>0&&!isNaN(state.yuyu.hp))?state.yuyu.hp:(state.yuyu.maxHp||100);
    const yuyuGroundY = groundY+20;
    const mem = state.yuyu.battleMemory||INIT_BATTLE_MEMORY;
    gameRef.current={
      yuyu:{x:80,y:yuyuGroundY,hp:initHp,maxHp:state.yuyu.maxHp||100,
        energy:state.yuyu.energy??ENERGY_MAX, maxEnergy:ENERGY_MAX,
        spd:(55+eStats.spd*9)*moveSpeedMult,dmg:(8+eStats.str*6)*pb.dmgMult*levelMult,def:eStats.def||1,kills:0,gold:0,xp:0,shield:0,speedBoost:false,lastAtk:0,atkCd:(1300-eStats.spd*40)/1000*atkSpeedMult,bState:"IDLE",target:null,dlgKills:0,combo:0,lastKillT:0,tempDef:0,invincibleUntil:0,cryUntil:0,cryMult:1,chargingBomb:false,bombChargeEnd:0,
        // ── Block / Parry ──
        blockUntil:0, blockCoolUntil:0, parryWindowUntil:0, parrySuccess:false, lastParryT:-99,
        // ── Combat Decision Engine ──
        combatDecideT:0, combatStance:"NONE",
      },
      monsters,parts:[],t:0,ended:false,regenT:0,isBoss,isMegaBoss,allActivated:false,
      obstacles,groundY,
      WW,WH,
      // ── CAMERA — world-space position that maps to screen center ─────────
      camX:80, camY:yuyuGroundY,   // initialised to Yuyu spawn
      // passive flags
      hasThorns:state.yuyu.skills.includes("thorns"),hasRegen:state.yuyu.skills.includes("regen"),
      hasBerserker:state.yuyu.skills.includes("berserker"),hasGoldSense:state.yuyu.skills.includes("goldSense"),
      hasLifesteal:state.yuyu.skills.includes("lifesteal"),hasCrit:state.yuyu.skills.includes("critStrike"),
      hasBarrier:state.yuyu.skills.includes("barrier"),hasGuardian:state.yuyu.skills.includes("guardian"),
      hasVenom:state.yuyu.skills.includes("venomStrike"),hasMirror:state.yuyu.skills.includes("mirrorImage"),
      hasLastStand:state.yuyu.skills.includes("lastStand"),hasChainReact:state.yuyu.skills.includes("chainReact"),
      // Thorns: DEF×defMult flat damage reflect
      thornDefMult:SKILLS.thorns.defMult[skillLvIdx(state.yuyu,"thorns")],
      regenRate:SKILLS.regen.rate[skillLvIdx(state.yuyu,"regen")],
      // Berserker: flat ATK bonus = STR×strBonus when HP<30%
      berserkerStrBonus:SKILLS.berserker.strBonus[skillLvIdx(state.yuyu,"berserker")],
      // GoldSense: extra gold = LUCK×luckMult per kill
      goldLuckMult:state.yuyu.skills.includes("goldSense")?SKILLS.goldSense.luckMult[skillLvIdx(state.yuyu,"goldSense")]:0,
      // Lifesteal: flat drain = STR×strMult per hit
      lifestealStrMult:SKILLS.lifesteal.strMult[skillLvIdx(state.yuyu,"lifesteal")],
      critChance:SKILLS.critStrike.chance[skillLvIdx(state.yuyu,"critStrike")],
      // Barrier: regen flat HP/s = DEF×defMult
      barrierDefMult:SKILLS.barrier.defMult[skillLvIdx(state.yuyu,"barrier")],
      // Guardian: flat damage reduction = DEF×defMult
      guardianDefMult:SKILLS.guardian.defMult[skillLvIdx(state.yuyu,"guardian")],
      venomDmg:SKILLS.venomStrike.rate[skillLvIdx(state.yuyu,"venomStrike")],
      venomDur:SKILLS.venomStrike.dur[skillLvIdx(state.yuyu,"venomStrike")],
      mirrorChance:SKILLS.mirrorImage.chance[skillLvIdx(state.yuyu,"mirrorImage")],
      // LastStand: flat ATK bonus = STR×strBonus when HP<15%
      lastStandStrBonus:SKILLS.lastStand.strBonus[skillLvIdx(state.yuyu,"lastStand")],
      // ChainReact: flat splash = STR×strMult on kill
      chainStrMult:SKILLS.chainReact.strMult[skillLvIdx(state.yuyu,"chainReact")],
      biome,stage,prestige:state.yuyu.prestige||0,goldBonus:pb.goldMult,
      equippedWeapon:state.yuyu.equipment?.weapon||null,
      weaponRange: getWeaponRange(state.yuyu.equipment?.weapon||"ironSword"),
      // ── Prestige perk flags ──
      perkHoarder   : hasPrestPerk(state.yuyu.prestige||0, "hoarder"),
      perkResilient : hasPrestPerk(state.yuyu.prestige||0, "resilient"),
      perkComboFan  : hasPrestPerk(state.yuyu.prestige||0, "combofan"),
      perkFinisher  : hasPrestPerk(state.yuyu.prestige||0, "finisher"),
      perkLastBreath: hasPrestPerk(state.yuyu.prestige||0, "lastbreath"),
      perkGodHand   : hasPrestPerk(state.yuyu.prestige||0, "godhand"),
      // Momentum: +3% DMG per consecutive win, max +15%
      momentumDmgMult: hasPrestPerk(state.yuyu.prestige||0, "momentum")
        ? 1 + Math.min(5, state.yuyu.momentumStreak||0) * 0.03
        : 1,
      resilientUsed  : false,   // one-shot protection consumed flag
      lastBreathUsed : false,   // CD reset consumed flag
      // strategy engine
      strategyId:"aggressive",strategyT:0,strategyUsed:"aggressive",
      hitRunPhase:"attack",hitRunT:0,kiteAngle:0,
      burstReady:false,burstSkills:[],
      battleMem:mem,
      // ── FOLLOW CAMERA ──────────────────────────────────────────────────────
      // camX/camY = world-space offset applied via ctx.translate during draw.
      // Yuyu always renders at screen center-ish; world pans around her.
      camX:80, camY:yuyuGroundY,   // start anchored to Yuyu spawn
    };
    YuyuMindEngine.init();

    // ── ZOOM: mouse-wheel (Google Maps style — zoom toward cursor) ────────
    const ZOOM_MIN=0.35, ZOOM_MAX=4.0;
    const onWheel = e=>{
      e.preventDefault();
      const game=gameRef.current; if(!game)return;
      const rect=canvas.getBoundingClientRect();
      const mx=(e.clientX-rect.left)*(CW/rect.width);
      const my=(e.clientY-rect.top )*(CH/rect.height);
      const oldZ=zoomRef.current;
      const factor=e.deltaY<0?1.12:1/1.12;
      const newZ=Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,oldZ*factor));
      // Zoom toward cursor: keep world point under cursor stationary
      // world_x = (mx - CW/2)/oldZ + camX  →  should stay == (mx - CW/2)/newZ + newCamX
      const wx=(mx-CW/2)/oldZ + game.camX;
      const wy=(my-CH/2)/oldZ + game.camY;
      game.camX=wx-(mx-CW/2)/newZ;
      game.camY=wy-(my-CH/2)/newZ;
      setZoom(newZ);
      setZoomDisplay(Math.round(newZ*100)/100);
    };
    canvas.addEventListener("wheel",onWheel,{passive:false});

    // ── ZOOM: pinch-to-zoom (touch) ───────────────────────────────────────
    let _lastPinchDist=0, _lastPinchMx=0, _lastPinchMy=0;
    const pinchDist=touches=>Math.hypot(touches[0].clientX-touches[1].clientX,touches[0].clientY-touches[1].clientY);
    const pinchMid =(touches,rect)=>({
      x:(((touches[0].clientX+touches[1].clientX)/2)-rect.left)*(CW/rect.width),
      y:(((touches[0].clientY+touches[1].clientY)/2)-rect.top )*(CH/rect.height),
    });
    const onTouchStart=e=>{if(e.touches.length===2){e.preventDefault();_lastPinchDist=pinchDist(e.touches);const r=canvas.getBoundingClientRect();const m=pinchMid(e.touches,r);_lastPinchMx=m.x;_lastPinchMy=m.y;}};
    const onTouchMove=e=>{
      if(e.touches.length!==2)return;e.preventDefault();
      const game=gameRef.current;if(!game)return;
      const rect=canvas.getBoundingClientRect();
      const dist=pinchDist(e.touches),mid=pinchMid(e.touches,rect);
      const oldZ=zoomRef.current;
      const newZ=Math.max(ZOOM_MIN,Math.min(ZOOM_MAX,oldZ*(dist/_lastPinchDist)));
      const wx=(_lastPinchMx-CW/2)/oldZ+game.camX;
      const wy=(_lastPinchMy-CH/2)/oldZ+game.camY;
      game.camX=wx-(mid.x-CW/2)/newZ;
      game.camY=wy-(mid.y-CH/2)/newZ;
      setZoom(newZ);
      setZoomDisplay(Math.round(newZ*100)/100);
      _lastPinchDist=dist;_lastPinchMx=mid.x;_lastPinchMy=mid.y;
    };
    canvas.addEventListener("touchstart",onTouchStart,{passive:false});
    canvas.addEventListener("touchmove",onTouchMove,{passive:false});

    let last = performance.now(),lowHpDone=false,fpsFrames=0,fpsTimer=0;
    // stable kill grant function used both in tick and fireSkill
    grantKillRef.current=(m)=> {
      const game = gameRef.current;
      if (!game||game.ended)return;
      const yuyu = game.yuyu;
      const sy = stateYuyuRef.current;
      yuyu.kills++;
      yuyu.dlgKills++;
      const comboWindow = 2;
      // ComboFan perk: combo bonus starts at kill 2 instead of 3
      const comboThresh = game.perkComboFan ? 2 : 3;
      if (game.t-yuyu.lastKillT<comboWindow){yuyu.combo++;} else {yuyu.combo=1;}
      yuyu.lastKillT=game.t;
      const eS = getEffectiveStats(sy);
      const luckStat = eS.luck||1;
      const comboBonus = yuyu.combo>=comboThresh ? yuyu.combo : 1;
      // Base gold + luck flat bonus
      const diff = sy.settings?.difficulty||"normal";
      const diffMult = diff==="hard"?1.4:diff==="extreme"?1.8:diff==="easy"?0.8:1;
      const sGoldMult = sy.settings?.goldMult??1;
      const stageGoldMult = 1+game.stage*.15+Math.floor(game.stage/5)*.25;
      // GoldSense: LUCK×luckMult flat bonus gold per kill
      const goldSenseBonus = game.hasGoldSense ? luckStat * game.goldLuckMult : 0;
      // Hoarder perk: extra +LUCK flat gold per kill (on top of GoldSense)
      const hoarderBonus = game.perkHoarder ? luckStat : 0;
      // Finisher perk: +50% gold when killing enemy at HP < 20% of maxHp (already dead here, check pre-kill HP)
      const finisherMult = (game.perkFinisher && (m.hp + (yuyu.dmg||1)) / Math.max(m.maxHp,1) < 0.20) ? 1.5 : 1;
      yuyu.gold+=Math.round((m.reward + goldSenseBonus + hoarderBonus)*stageGoldMult*comboBonus*game.goldBonus*diffMult*sGoldMult*finisherMult);
      // Energy gain on kill — rewards aggressive play
      yuyu.energy = Math.min(yuyu.maxEnergy, (yuyu.energy||0) + ENERGY_KILL);
      const sXpMult = sy.settings?.xpMult??1;
      yuyu.xp+=Math.round((10+game.stage*3)*diffMult*sXpMult);
      if (yuyu.combo>=comboThresh){flash(`🔥 ${yuyu.combo}x COMBO!`);SFX.play("combo");}
      else if (yuyu.dlgKills<=2)yuyuSay("kill",{kills:yuyu.kills,combo:yuyu.combo,hpPct:Math.round(yuyu.hp/yuyu.maxHp*100),stage:game.stage});
    };
    function tick(now){
      if (!gameRef.current||!gameRef.current.yuyu){animFrameRef.current=requestAnimationFrame(tick);return;}
      if (gameRef.current.ended)return;
      if (pausedRef.current){animFrameRef.current=requestAnimationFrame(tick);return;}
      const cfg = settingsRef.current;
      const rawDt = Math.min((now-last)/1000,.05);
      const gameSpd = cfg.gameSpeed??1;
      const dt = rawDt*gameSpd;
      last=now;
      // FPS tracking
      fpsFrames++;fpsTimer+=rawDt;
      if(fpsTimer>=1){fpsRef.current=Math.round(fpsFrames/fpsTimer);fpsFrames=0;fpsTimer=0;if(cfg.showFps)setFpsDisplay(fpsRef.current);}
      const game = gameRef.current;
      game.t+=dt;
      const yuyu = game.yuyu;
      const isStarted = startedRef.current;
      if (isStarted&&!game.allActivated){game.monsters.forEach(m=> {m.waiting=false;});game.allActivated=true;}
      const alive = game.monsters.filter(m=>m.hp>0&&!m.waiting);
      if (!isStarted){
        yuyu.bState="IDLE";
        yuyu.target=null;
        const gY = game.groundY||CH*GROUND_Y_RATIO;
        yuyu.x=60+Math.sin(game.t*.7)*18;
        yuyu.y=gY+16+Math.sin(game.t*.5)*4;
      } else {
        const gY = game.groundY||CH*GROUND_Y_RATIO;
        const uiBottom = cinemaModeRef.current?28:218;
        const WW_ = CW;  // world = canvas width
        const WH_ = CH;  // world = canvas height
        const floorMin = gY+10,floorMax=WH_-uiBottom;
        const hpPct = yuyu.hp/yuyu.maxHp;
        const nearest = alive.length?alive.reduce((a,b)=>Math.hypot(a.x-yuyu.x,a.y-yuyu.y)<Math.hypot(b.x-yuyu.x,b.y-yuyu.y)?a:b):null;
        const weakest = alive.length?alive.reduce((a,b)=>a.hp<b.hp?a:b):null;
        const dist = nearest?Math.hypot(nearest.x-yuyu.x,nearest.y-yuyu.y):999;

        // ── Threat assessment (every frame, cheap) ──
        const threat = assessThreat(yuyu,alive,game);

        // ── Strategy re-eval: every 3s OR immediately on threat escalation ──
        const prevThreat = game.lastThreat||THREAT.SAFE;
        const threatEscalated = threat>prevThreat&&threat>=THREAT.DANGER;
        const stratChangeNeeded = !game.strategyId||game.t-game.strategyT>3||threatEscalated||(!alive.length&&game.strategyId);
        game.lastThreat=threat;
        if (stratChangeNeeded&&alive.length){
          const newStrat = selectStrategy(game.battleMem,yuyu,alive,game);
          if (newStrat!==game.strategyId||threatEscalated){
            game.strategyId=newStrat;
            game.strategyT=game.t;
            game.strategyUsed=newStrat;
            game.hitRunPhase="attack";
            game.hitRunT=0;
            game.hitRunAttacks=0;
            setLiveStrategy(newStrat);
          }
        }
        if (!alive.length&&game.strategyId){game.strategyId=null;setLiveStrategy(null);}
        const strat = game.strategyId||"aggressive";

        // ── Weapon-aware attack range — available to BOTH skill brain and movement strategies ──
        const wRange = game.weaponRange || {atk:30,preferred:30,style:"melee"};
        const ATK_RANGE = wRange.atk;
        const PREF_RANGE = wRange.preferred;
        const isRanged = wRange.style === "ranged";

        // ── YuyuMind: synthesize kill instinct, bait, feast, cluster, pattern read ──
        const _mindDec = alive.length?YuyuMindEngine.tick(yuyu,alive,{...game,CW:WW_,CH:WH_}):null;

        // ── Passive: regen, barrier, lastStand, venom tick ──
        const eStatsTick = getEffectiveStats(stateYuyuRef.current);
        // GodHand perk: +3 to all effective stats in battle
        const godHandBonus = game.perkGodHand ? 3 : 0;
        const strTick = (eStatsTick.str||1) + godHandBonus, defTick = (eStatsTick.def||1) + godHandBonus;
        if (game.hasRegen){game.regenT+=dt;if (game.regenT>=1){game.regenT=0;yuyu.hp=Math.min(yuyu.maxHp,yuyu.hp+game.regenRate);}}
        // Energy: passive regen every frame
        yuyu.energy = Math.min(yuyu.maxEnergy, (yuyu.energy||0) + ENERGY_REGEN * dt);
        // Barrier: flat HP/s = DEF × defMult
        if (game.hasBarrier){yuyu.hp=Math.min(yuyu.maxHp,yuyu.hp+(defTick*game.barrierDefMult)*dt);}
        // LastStand: small flat regen when HP<15%
        if (game.hasLastStand&&hpPct<.15){yuyu.hp=Math.min(yuyu.maxHp,yuyu.hp+(defTick*0.5)*dt);}
        if (game.hasVenom){
          alive.forEach(m=> {if (m.poisonUntil>game.t){m.hp-=game.venomDmg*dt;if (m.hp<=0)grantKillRef.current(m);}});
        }

        // ── SKILL BRAIN v2 — context-aware targeting ──────────────────────────
        // Each active skill now checked against its SKILL_MECHANICS context:
        //   aoe_self  → only good when enemies are clustered near Yuyu
        //   aoe_all   → always hits all, best when many alive
        //   single_best → pick best target (lowest HP, or highest threat)
        //   self       → immediate utility skill, fire when score warrants
        //
        // Scoring considers: HP %, threat level, enemy count, clustering,
        //   weapon style (ranged wants AoE from distance), current strategy.
        if (!game.skillBrainT)game.skillBrainT=0;
        if (game.t-game.skillBrainT>=0.38){
          game.skillBrainT=game.t;
          const equippedActives = (stateYuyuRef.current.unlockedSkills||[]).filter(s=>SKILLS[s]?.type==="active");
          const isBossFight = game.isBoss||game.isMegaBoss;
          const aliveCount = alive.length;
          const curEnergy = yuyu.energy ?? ENERGY_MAX;

          // ── Cluster score: how many enemies within 90px of Yuyu ──
          const clusterNear = alive.filter(m=>Math.hypot(m.x-yuyu.x,m.y-yuyu.y)<90).length;
          const clusterAll  = aliveCount; // all-target AoE affects everyone regardless

          // ── SURVIVAL OVERRIDE: CRITICAL/LETHAL always fires heal/escape ──
          let skipDamageSkills = false;
          if (threat>=THREAT.CRITICAL){
            if (!cdsRef.current["healPulse"]&&equippedActives.includes("healPulse")){fireSkill("healPulse");game.skillBrainT=game.t+0.1;}
            else if (!cdsRef.current["shieldCube"]&&equippedActives.includes("shieldCube")&&!yuyu.shield){fireSkill("shieldCube");game.skillBrainT=game.t+0.1;}
            else if (!cdsRef.current["speedRush"]&&equippedActives.includes("speedRush")&&!yuyu.speedBoost){fireSkill("speedRush");}
            if (threat===THREAT.LETHAL){skipDamageSkills=true;}
          }
          if (threat===THREAT.DANGER&&hpPct<0.35&&!cdsRef.current["healPulse"]&&equippedActives.includes("healPulse")){
            fireSkill("healPulse");
          }

          // ── Context-aware score function ──
          const scoreSkill = sid => {
            if (cdsRef.current[sid]) return -1;
            const mech = SKILL_MECHANICS[sid] || {targeting:"self",idealEnemies:1,idealRange:999};
            const survivalMult = threat>=THREAT.DANGER?2.5:threat===THREAT.CAUTIOUS?1.4:1;
            // Energy penalty: prefer cheaper skills when energy is low
            // but don't fully block — let penalty system handle the reduced effect
            const cost = SKILLS[sid]?.energy || 0;
            const energyRatio = cost > 0 ? Math.min(1, curEnergy / cost) : 1;
            const energyMult = energyRatio >= 1 ? 1 : energyRatio >= 0.5 ? 0.7 : 0.35;
            let base = 0;

            switch (sid) {
              // ── SURVIVAL SKILLS ──
              case "healPulse":
                if (hpPct>=0.88) return 0;
                base = hpPct<0.2?300:hpPct<0.35?200:hpPct<0.55?130:55;
                if (isBossFight&&hpPct<0.4) base*=1.6;
                return base*survivalMult*energyMult;

              case "shieldCube":
                if (yuyu.shield>0) return 0;
                base = hpPct<0.3?180:hpPct<0.5?110:45;
                if (isBossFight) base*=1.4;
                return base*survivalMult*energyMult;

              case "speedRush":
                if (yuyu.speedBoost) return 0;
                if (threat>=THREAT.CRITICAL) return 200*survivalMult*energyMult;
                if (threat===THREAT.DANGER) return 80*energyMult;
                if (isRanged&&dist<PREF_RANGE*0.5) return 90*energyMult;
                return (hpPct>0.7?15:30)*energyMult;

              case "starBurst":
                if (threat>=THREAT.CRITICAL) return 20*energyMult;
                if (clusterNear<2&&!isBossFight) return 10*energyMult;
                base = clusterNear>=4?130:clusterNear>=3?100:clusterNear>=2?70:30;
                if (isBossFight&&hpPct>0.5) base*=1.3;
                if (isRanged) base*=0.7;
                return base*energyMult;

              case "spiritBomb":
                if (threat>=THREAT.DANGER) return 0;
                if (aliveCount<3&&!isBossFight) return 0;
                if (hpPct<0.6) return 0;
                base = aliveCount>=4?90:aliveCount>=3?65:0;
                return base*energyMult;

              case "thunderStrike":
                if (threat>=THREAT.CRITICAL) return 25*energyMult;
                base = aliveCount>=3?130:aliveCount>=2?105:isBossFight?95:60;
                if (isBossFight) base*=1.6;
                if (isRanged) base*=1.3;
                return base*energyMult;

              case "iceBlast":
                if (threat>=THREAT.DANGER) return 110*survivalMult*energyMult;
                base = aliveCount>=3?115:aliveCount>=2?90:isBossFight?80:50;
                if (isRanged) base*=1.3;
                return base*energyMult;

              case "timeWarp":
                if (threat>=THREAT.DANGER) return 110*survivalMult*energyMult;
                base = aliveCount>=3?105:aliveCount>=2?82:aliveCount*35;
                if (isRanged) base*=1.2;
                return base*energyMult;

              case "flashStep": {
                if (threat>=THREAT.CRITICAL&&isBossFight) return 170*energyMult;
                if (threat>=THREAT.CRITICAL) return 90*energyMult;
                if (threat>=THREAT.DANGER) return 75*energyMult;
                const flashTargetVal = alive.length ? alive.reduce((best,m)=>{
                  const score = (1-m.hp/Math.max(m.maxHp,1))*2 + (1-Math.hypot(m.x-yuyu.x,m.y-yuyu.y)/200);
                  return score>(best._score||0) ? {...m,_score:score} : best;
                },{_score:0}) : null;
                const isGoodFlashTarget = flashTargetVal && flashTargetVal.hp/Math.max(flashTargetVal.maxHp,1) < 0.4;
                const isFarAway = dist > 150;
                base = isGoodFlashTarget?115:isFarAway?80:(dist<50?35:55);
                if (isRanged) base*=0.8;
                return base*energyMult;
              }

              case "battleCry":
                if (threat>=THREAT.DANGER) return 5*energyMult;
                if (aliveCount>=3&&hpPct>0.4) return 120*energyMult;
                base = (aliveCount>=2&&hpPct>0.4) ? 90 : (aliveCount>=1&&hpPct>0.6) ? 55 : 15;
                if (isRanged) base*=0.85;
                return base*energyMult;

              default: return 10;
            }
          };

          // ── Strategy modifier ──
          // Balance: each strategy has a clear "best" skill set, starBurst is no longer always dominant
          const applyStratMod = (sid,base) => {
            if (base<=0) return base;
            // burst: spiritBomb/thunder shine more, starBurst reduced from ×1.7→×1.1
            if (strat==="burst"){
              if (["spiritBomb","thunderStrike"].includes(sid))      return base*1.8;
              if (["iceBlast","battleCry"].includes(sid))             return base*1.4;
              if (sid==="starBurst")                                   return base*1.1;
            }
            // crowdCtrl: freeze/slow/thunder all excellent
            if (strat==="crowdCtrl"){
              if (["iceBlast","thunderStrike","timeWarp"].includes(sid)) return base*1.8;
              if (sid==="flashStep")                                       return base*1.3; // pick off frozen targets
            }
            // defensive: shield/heal/speed — starBurst explicitly deprioritized
            if (strat==="defensive"){
              if (["healPulse","shieldCube"].includes(sid))           return base*1.8;
              if (sid==="timeWarp")                                    return base*1.5;
              if (sid==="speedRush")                                   return base*1.3;
              if (sid==="starBurst")                                   return base*0.6; // don't burst when playing safe
            }
            // hitRun: flashStep is king, speed enables kiting
            if (strat==="hitRun"){
              if (sid==="flashStep")                                   return base*1.9;
              if (sid==="speedRush")                                   return base*1.6;
              if (sid==="battleCry")                                   return base*1.2;
            }
            // berserker: battleCry first, then burst — starBurst reduced
            if (strat==="berserker"){
              if (sid==="battleCry")                                   return base*2.0;
              if (["spiritBomb","thunderStrike"].includes(sid))        return base*1.5;
              if (sid==="starBurst")                                   return base*1.1;
            }
            // kite: slow/freeze/thunder to keep enemies away
            if (strat==="kite"){
              if (["iceBlast","timeWarp"].includes(sid))               return base*1.7;
              if (sid==="thunderStrike")                                return base*1.5;
              if (sid==="speedRush")                                    return base*1.3;
            }
            // Ranged weapons: AoE-all skills shine, AoE-self less useful
            if (isRanged){
              if (["thunderStrike","iceBlast","timeWarp"].includes(sid)) return base*1.25;
              if (sid==="starBurst")                                       return base*0.75; // AoE-self bad for ranged
            }
            return base;
          };

          // ── MindEngine skill hints: fire highest-priority hint first ──
          if (!skipDamageSkills&&_mindDec?.skillHints?.length){
            for(const sid of _mindDec.skillHints){
              if(equippedActives.includes(sid)&&!cdsRef.current[sid]){
                const sc = applyStratMod(sid,scoreSkill(sid));
                if(sc>12) { fireSkill(sid); break; }
              }
            }
          }

          // ── Burst strategy: accumulate then dump all ready at once ──
          if (!skipDamageSkills){
            if (strat==="burst"&&threat<THREAT.DANGER){
              const ready = equippedActives.filter(s=>!cdsRef.current[s]);
              const hasSurvival = ready.some(s=>["healPulse","shieldCube","speedRush"].includes(s)&&scoreSkill(s)>80);
              if (hasSurvival){
                const sur = ready.filter(s=>scoreSkill(s)>80)[0];
                if (sur) fireSkill(sur);
              } else if (ready.length>=Math.min(2,equippedActives.length)){
                ready.sort((a,b)=>applyStratMod(b,scoreSkill(b))-applyStratMod(a,scoreSkill(a)))
                  .forEach(s=>{if(applyStratMod(s,scoreSkill(s))>8)fireSkill(s);});
              }
            } else {
              // Normal: fire best scoring skill if above threshold
              const best = equippedActives
                .map(s=>({s,score:applyStratMod(s,scoreSkill(s))}))
                .filter(x=>x.score>0)
                .sort((a,b)=>b.score-a.score)[0];
              if (best&&best.score>12) fireSkill(best.s);
            }
          }
        }

        // ── Strategy movement + target selection ──
        // MindEngine overrides: target, moveVector, spdMult based on active mode
        let tgt = (_mindDec?.target)||nearest;
        let spdMult = 1;
        let moveVector = {dx:0,dy:0};
        // If mind engine has a high-priority movement vector, pre-fill it (strategies can still override)
        if(_mindDec?.moveVector&&(_mindDec.mode==='KILL_INSTINCT'||_mindDec.mode==='BAIT_PUNISH'||_mindDec.mode==='BAIT_SETUP'||_mindDec.mode==='FEAST')){
          moveVector=_mindDec.moveVector;spdMult=_mindDec.spdMult||1;
          if(_mindDec.forceAttack&&tgt){yuyu.bState="ATTACK";yuyu.target=tgt;}
        }

        // ── SNEAK AI: If target isn't alerted and Yuyu is not in its FOV,
        //    try to circle behind for a blind-spot first strike.
        //    Yuyu gets better at this as totalSneaks grows (habit). ──
        const sneakExp   = stateYuyuRef.current?.battleMemory?.totalSneaks || 0;
        const sneakLevel = Math.min(3, Math.floor(sneakExp / 5)); // 0→1 at 5, 2 at 10, 3 at 15+
        // More experienced Yuyu sneaks even under slight danger
        const sneakThreatMax = THREAT.CAUTIOUS + sneakLevel; // base=1, max=4 (LETHAL still blocked)
        const sneakTarget = tgt
          && (game.t >= (tgt.alertUntil||0))      // monster not already alert
          && !isInFOV(tgt, yuyu.x, yuyu.y)         // Yuyu outside monster FOV
          && threat <= sneakThreatMax               // threat within tolerance
          && threat < THREAT.LETHAL;                // never sneak when dying

        if (sneakTarget && dist > 35) {
          const mFacing = tgt.facing ?? 0;
          // Experienced Yuyu aims closer behind — sneak dist shrinks with level
          const sneakDist = 50 - sneakLevel * 5;
          const behindX = tgt.x + Math.cos(mFacing + Math.PI) * sneakDist;
          const behindY = tgt.y + Math.sin(mFacing + Math.PI) * sneakDist;
          const dBehind = Math.hypot(behindX - yuyu.x, behindY - yuyu.y) || 1;
          if (dBehind > 15) {
            const raw2 = steerAvoid(yuyu.x, yuyu.y, behindX - yuyu.x, behindY - yuyu.y, game.obstacles, 10);
            const rd2 = Math.hypot(raw2.dx, raw2.dy) || 1;
            moveVector = {dx: raw2.dx/rd2, dy: raw2.dy/rd2};
            // Higher sneak level = closer to normal speed (more confident)
            spdMult = 0.80 + sneakLevel * 0.06;
            yuyu.bState = dBehind <= ATK_RANGE ? "ATTACK" : "CHASE";
            yuyu.target = tgt;
            game.isSneaking = true;
          } else {
            // Already behind — attack immediately
            yuyu.bState = "ATTACK";
            yuyu.target = tgt;
            game.isSneaking = true;
          }
        } else {
          game.isSneaking = false;
        }

        if (strat==="focusFire")tgt=weakest||nearest;
        if (strat==="crowdCtrl")tgt=alive.length?alive.reduce((a,b)=> {
          const scoreA = alive.filter(x=>Math.hypot(x.x-a.x,x.y-a.y)<80).length;
          const scoreB = alive.filter(x=>Math.hypot(x.x-b.x,x.y-b.y)<80).length;
          return scoreA>scoreB?a:b;
        },alive[0]):null;

        // ── Helper: flee from group centroid, not just nearest ──
        const fleeFromGroup = ()=> {
          const cx = alive.reduce((s,m)=>s+m.x,0)/alive.length;
          const cy = alive.reduce((s,m)=>s+m.y,0)/alive.length;
          const wallMargin = 55;
          let wdx = 0,wdy=0;
          if (yuyu.x<wallMargin)wdx+=(wallMargin-yuyu.x)/wallMargin*2;
          if (yuyu.x>WW_-wallMargin)wdx-=(yuyu.x-(WW_-wallMargin))/wallMargin*2;
          if (yuyu.y<floorMin+wallMargin)wdy+=(wallMargin-(yuyu.y-floorMin))/wallMargin*2;
          if (yuyu.y>floorMax-wallMargin)wdy-=(yuyu.y-(floorMax-wallMargin))/wallMargin*2;
          const raw = steerAvoid(yuyu.x,yuyu.y,yuyu.x-cx+wdx*40,yuyu.y-cy+wdy*40,game.obstacles);
          const d2 = Math.hypot(raw.dx,raw.dy)||1;
          return {dx:raw.dx/d2,dy:raw.dy/d2};
        };

        // ── Helper: perpendicular strafe vector around a target ──
        const strafeAround = (tx,ty,dir=1)=> {
          const ax = yuyu.x-tx,ay=yuyu.y-ty;
          const len = Math.hypot(ax,ay)||1;
          // perpendicular CCW (dir=1) or CW (dir=-1)
          return {dx:(-ay/len)*dir,dy:(ax/len)*dir};
        };

        // ── Helper: predict target position dt ahead ──
        const predictPos = (m,ahead=0.25)=> {
          const vx = (m.x-(m.prevX||m.x))/(0.05);
          const vy = (m.y-(m.prevY||m.y))/(0.05);
          return {x:m.x+vx*ahead,y:m.y+vy*ahead};
        };

        // Store prev pos on monsters for prediction
        alive.forEach(m=> {m.prevX=m.x;m.prevY=m.y;});

        // ── Weapon-aware attack range — defined before the strategy chain ──
        // For ranged: maintain preferred distance, back off if too close
        const rangedMaintainPos = (tx,ty)=> {
          const awayX = yuyu.x-tx, awayY = yuyu.y-ty;
          const awayLen = Math.hypot(awayX,awayY)||1;
          if (dist < PREF_RANGE*0.6) {
            const raw = steerAvoid(yuyu.x,yuyu.y,awayX/awayLen,awayY/awayLen,game.obstacles);
            const rd = Math.hypot(raw.dx,raw.dy)||1;
            return {vec:{dx:raw.dx/rd,dy:raw.dy/rd},spd:1.1,state:"FLEE"};
          } else if (dist > ATK_RANGE) {
            const dx2 = tx-yuyu.x, dy2 = ty-yuyu.y, d2 = Math.hypot(dx2,dy2)||1;
            const raw = steerAvoid(yuyu.x,yuyu.y,dx2/d2,dy2/d2,game.obstacles);
            const rd = Math.hypot(raw.dx,raw.dy)||1;
            return {vec:{dx:raw.dx/rd,dy:raw.dy/rd},spd:0.85,state:"CHASE"};
          } else {
            const perp = strafeAround(tx,ty,game.kiteDir||1);
            return {vec:{dx:perp.dx*0.4,dy:perp.dy*0.4},spd:0.7,state:"ATTACK"};
          }
        };

        if (!alive.length){yuyu.bState="IDLE";}

        // ── If sneaking, skip all strategy movement — sneak moveVector already set above ──
        else if (game.isSneaking) {
          // Sneak is active — movement already set, just ensure bState is valid
          if (dist <= ATK_RANGE) { yuyu.bState="ATTACK"; yuyu.target=tgt; }
        }

        // ── LETHAL/CRITICAL: always flee regardless of chosen strategy (except berserker w/ sustain) ──
        else if (threat===THREAT.LETHAL&&strat!=="berserker"){
          yuyu.bState="FLEE";
          const atWall = yuyu.x<35||yuyu.x>WW_-35||yuyu.y<floorMin+35||yuyu.y>floorMax-35;
          if (atWall){game.velX=0;game.velY=0;}
          moveVector=fleeFromGroup();
          spdMult=1.7;
        }

        // ══ HIT & RUN ══
        else if (strat==="hitRun"&&tgt){
          if (!game.hitRunDir)game.hitRunDir=Math.random()<.5?1:-1;
          if (!game.hitRunAttacks)game.hitRunAttacks=0;

          if (game.hitRunPhase==="attack"){
            if (dist<=ATK_RANGE){
              yuyu.bState="ATTACK";
              yuyu.target=tgt;
              if (game.t-yuyu.lastAtk<0.1)game.hitRunAttacks++;
              if (game.hitRunAttacks>=2){
                game.hitRunPhase="sidestep";
                game.hitRunT=game.t;
                game.hitRunAttacks=0;
                game.hitRunDir*=-1;
              }
              if (isRanged){const rp=rangedMaintainPos(tgt.x,tgt.y);moveVector=rp.vec;spdMult=rp.spd;}
            } else {
              const pred = predictPos(tgt);
              const dx = pred.x-yuyu.x,dy=pred.y-yuyu.y;
              const d2 = Math.hypot(dx,dy)||1;
              const perp = strafeAround(tgt.x,tgt.y,game.hitRunDir);
              const blend = Math.min(1,(dist-ATK_RANGE)/80);
              const raw = steerAvoid(yuyu.x,yuyu.y,dx/d2+perp.dx*blend*0.6,dy/d2+perp.dy*blend*0.6,game.obstacles);
              const rd = Math.hypot(raw.dx,raw.dy)||1;
              yuyu.bState="CHASE";
              moveVector={dx:raw.dx/rd,dy:raw.dy/rd};
            }
          } else if (game.hitRunPhase==="sidestep"){
            yuyu.bState="FLEE";
            const sv = strafeAround(tgt.x,tgt.y,game.hitRunDir);
            const raw = steerAvoid(yuyu.x,yuyu.y,sv.dx,sv.dy,game.obstacles);
            const rd = Math.hypot(raw.dx,raw.dy)||1;
            moveVector={dx:raw.dx/rd,dy:raw.dy/rd};
            spdMult=1.35;
            if (game.t-game.hitRunT>0.55)game.hitRunPhase="attack";
          }
        }

        // ══ KITE ══
        else if (strat==="kite"&&tgt){
          const KITE_R = isRanged ? Math.max(PREF_RANGE, 90) : 85;
          const KITE_ATTACK_RANGE = ATK_RANGE;
          const KITE_SPD_MULT = 1.2;

          if (!game.kiteDir)game.kiteDir=1;
          const wallMargin = 60;
          if (yuyu.x<wallMargin||yuyu.x>WW_-wallMargin)game.kiteDir*=-1;
          if (yuyu.y<floorMin+wallMargin||yuyu.y>floorMax-wallMargin)game.kiteDir*=-1;

          const orbitSpd = (0.9+Math.max(0,(KITE_R-dist)/KITE_R)*1.2)*game.kiteDir;
          game.kiteAngle=(game.kiteAngle||0)+orbitSpd*dt;

          const orbitX = tgt.x+Math.cos(game.kiteAngle)*KITE_R;
          const orbitY = tgt.y+Math.sin(game.kiteAngle)*KITE_R*0.65;

          const toOrbitX = orbitX-yuyu.x,toOrbitY=orbitY-yuyu.y;
          const orbitDist = Math.hypot(toOrbitX,toOrbitY)||1;

          const radErr = dist-KITE_R;
          const radDirX = (yuyu.x-tgt.x)/dist*(radErr>0?-1:1);
          const radDirY = (yuyu.y-tgt.y)/dist*(radErr>0?-1:1);

          const combX = toOrbitX/orbitDist*0.6+radDirX*0.4*Math.abs(radErr)/KITE_R;
          const combY = toOrbitY/orbitDist*0.6+radDirY*0.4*Math.abs(radErr)/KITE_R;
          const raw = steerAvoid(yuyu.x,yuyu.y,combX,combY,game.obstacles);
          const rd = Math.hypot(raw.dx,raw.dy)||1;
          moveVector={dx:raw.dx/rd,dy:raw.dy/rd};
          spdMult=KITE_SPD_MULT;

          if (dist<=KITE_ATTACK_RANGE){yuyu.bState="ATTACK";yuyu.target=tgt;}
          else {yuyu.bState="CHASE";}

          const closing = dist<KITE_R*1.1&&tgt.spd>50;
          if (closing&&!yuyu.speedBoost){
            const perp = strafeAround(tgt.x,tgt.y,game.kiteDir);
            moveVector={dx:perp.dx,dy:perp.dy};
            spdMult=1.5;
          }
        }

        // ══ DEFENSIVE ══
        else if (strat==="defensive"&&tgt){
          const SAFE_MIN = isRanged ? PREF_RANGE*0.65 : 55;
          const SAFE_MAX = isRanged ? ATK_RANGE : 95;

          if (dist<SAFE_MIN){
            yuyu.bState="FLEE";
            const awayX = yuyu.x-tgt.x,awayY=yuyu.y-tgt.y;
            const awayLen = Math.hypot(awayX,awayY)||1;
            if (!game.defStrafeDir)game.defStrafeDir=Math.random()<.5?1:-1;
            const perp = strafeAround(tgt.x,tgt.y,game.defStrafeDir);
            const blendX = awayX/awayLen*0.5+perp.dx*0.5;
            const blendY = awayY/awayLen*0.5+perp.dy*0.5;
            const raw = steerAvoid(yuyu.x,yuyu.y,blendX,blendY,game.obstacles);
            const rd = Math.hypot(raw.dx,raw.dy)||1;
            moveVector={dx:raw.dx/rd,dy:raw.dy/rd};
            spdMult=0.9;
          } else if (dist>SAFE_MAX){
            yuyu.bState="CHASE";
            const dx = tgt.x-yuyu.x,dy=tgt.y-yuyu.y,d2=Math.hypot(dx,dy)||1;
            const perp = strafeAround(tgt.x,tgt.y,game.defStrafeDir||1);
            const raw = steerAvoid(yuyu.x,yuyu.y,dx/d2*0.7+perp.dx*0.3,dy/d2*0.7+perp.dy*0.3,game.obstacles);
            const rd = Math.hypot(raw.dx,raw.dy)||1;
            moveVector={dx:raw.dx/rd,dy:raw.dy/rd};
            spdMult=0.7;
          } else {
            yuyu.bState="ATTACK";
            yuyu.target=tgt;
            const perp = strafeAround(tgt.x,tgt.y,game.defStrafeDir||1);
            moveVector={dx:perp.dx*0.3,dy:perp.dy*0.3};
            if (Math.random()<0.008)game.defStrafeDir=(game.defStrafeDir||1)*-1;
          }
        }

        // ══ BERSERKER ══
        else if (strat==="berserker"&&tgt){
          const bAtkR = isRanged ? ATK_RANGE : 35;
          yuyu.bState=dist<=bAtkR?"ATTACK":"CHASE";
          yuyu.target=tgt;
          const dx = tgt.x-yuyu.x,dy=tgt.y-yuyu.y,d2=Math.hypot(dx,dy)||1;
          const zigzag = Math.sin(game.t*8)*0.45;
          const perp = strafeAround(tgt.x,tgt.y,1);
          const raw = steerAvoid(yuyu.x,yuyu.y,dx/d2+perp.dx*zigzag,dy/d2+perp.dy*zigzag,game.obstacles);
          const rd = Math.hypot(raw.dx,raw.dy)||1;
          spdMult=1.5;
          moveVector={dx:raw.dx/rd,dy:raw.dy/rd};
          if (isRanged&&dist<PREF_RANGE*0.5){const rp=rangedMaintainPos(tgt.x,tgt.y);moveVector=rp.vec;spdMult=rp.spd;}
        }

        // ══ FOCUS FIRE ══
        else if (strat==="focusFire"&&tgt){
          if (dist<=ATK_RANGE){
            yuyu.bState="ATTACK";yuyu.target=tgt;
            if (isRanged){const rp=rangedMaintainPos(tgt.x,tgt.y);moveVector=rp.vec;spdMult=rp.spd;}
          } else {
            yuyu.bState="CHASE";
            const pred = predictPos(tgt);
            const dx = pred.x-yuyu.x,dy=pred.y-yuyu.y,d2=Math.hypot(dx,dy)||1;
            const raw = steerAvoid(yuyu.x,yuyu.y,dx/d2,dy/d2,game.obstacles);
            const rd = Math.hypot(raw.dx,raw.dy)||1;
            spdMult=1.15;
            moveVector={dx:raw.dx/rd,dy:raw.dy/rd};
          }
        }

        // ══ CROWD CONTROL ══
        else if (strat==="crowdCtrl"&&tgt){
          const cx = alive.reduce((s,m)=>s+m.x,0)/alive.length;
          const cy = alive.reduce((s,m)=>s+m.y,0)/alive.length;
          const toCX = cx-yuyu.x,toCY=cy-yuyu.y;
          const toCDist = Math.hypot(toCX,toCY)||1;
          const CROWD_RANGE = isRanged ? PREF_RANGE : 55;

          if (toCDist<CROWD_RANGE){
            yuyu.bState="ATTACK";
            yuyu.target=tgt;
            const perp = strafeAround(cx,cy,game.kiteDir||1);
            moveVector={dx:perp.dx*0.2,dy:perp.dy*0.2};
            if (isRanged){const rp=rangedMaintainPos(tgt.x,tgt.y);moveVector=rp.vec;spdMult=rp.spd;}
          } else {
            yuyu.bState="CHASE";
            const raw = steerAvoid(yuyu.x,yuyu.y,toCX/toCDist,toCY/toCDist,game.obstacles);
            const rd = Math.hypot(raw.dx,raw.dy)||1;
            moveVector={dx:raw.dx/rd,dy:raw.dy/rd};
          }
        }

        // ══ AGGRESSIVE + BURST (default) ══
        else if (tgt){
          if (dist<=ATK_RANGE){
            yuyu.bState="ATTACK";yuyu.target=tgt;
            if (isRanged){const rp=rangedMaintainPos(tgt.x,tgt.y);moveVector=rp.vec;spdMult=rp.spd;}
          } else {
            yuyu.bState="CHASE";
            const dx = tgt.x-yuyu.x,dy=tgt.y-yuyu.y,d2=Math.hypot(dx,dy)||1;
            const weave = Math.sin(game.t*5)*0.25;
            const perp = strafeAround(tgt.x,tgt.y,1);
            const raw = steerAvoid(yuyu.x,yuyu.y,dx/d2+perp.dx*weave,dy/d2+perp.dy*weave,game.obstacles);
            const rd = Math.hypot(raw.dx,raw.dy)||1;
            moveVector={dx:raw.dx/rd,dy:raw.dy/rd};
          }
        }

        // ══ COMBAT DECISION ENGINE ══════════════════════════════════════════
        // Yuyu makes a deliberate combat choice every ~300-450ms.
        // She reads monster approach timing, pattern, and own HP — then COMMITS
        // to one stance for that window. Not a passive sensor — an active decision.
        //
        // Choices: ATTACK_COMMIT · BLOCK_STANCE · PARRY_ATTEMPT · DODGE_STEP · (no change)
        {
          if (!game.combatDecideT) game.combatDecideT = 0;
          if (!game.combatStance)  game.combatStance  = "NONE";

          const decideInterval = 0.32 + Math.random()*0.14; // ~320-460ms, slight randomness
          const doDecide = game.t - game.combatDecideT > decideInterval;

          if (doDecide && alive.length && !yuyu.chargingBomb) {
            game.combatDecideT = game.t;

            // ── Read the most dangerous nearby monster ──
            const closestM = alive.reduce((a,b)=>
              Math.hypot(a.x-yuyu.x,a.y-yuyu.y)<Math.hypot(b.x-yuyu.x,b.y-yuyu.y)?a:b);
            const closestDist = Math.hypot(closestM.x-yuyu.x,closestM.y-yuyu.y);
            const mProf = YuyuMindEngine._profPublic?.(closestM); // may be null if not exposed
            const timeSinceMHit = game.t - (closestM.lastHit||0);
            const mHitCd = 1.4; // monster's attack cooldown
            // Predict: is monster ABOUT to attack? (approaching fast + cooldown almost done)
            const mApproaching = closestDist < 55 && closestM.spd > 10;
            const mAttackImminent = mApproaching && timeSinceMHit > mHitCd * 0.65;
            const mJustAttacked   = timeSinceMHit < 0.25; // very recent hit = just struck

            // ── Yuyu's "reading" — how well she reads this monster ──
            // DEF stat boosts defensive reads, STR boosts attack confidence
            const defRead = Math.min(1, defTick / 6);  // 0→1 as DEF goes 0→6
            const strConf = Math.min(1, strTick / 6);  // 0→1 as STR goes 0→6

            // ── Score each option ──
            let scores = { NONE:0, ATTACK_COMMIT:0, BLOCK_STANCE:0, PARRY_ATTEMPT:0, DODGE_STEP:0 };

            // ATTACK: commit to pressing in — good when healthy, enemy is vulnerable
            const enemyVulnerable = mJustAttacked ||           // enemy just struck = recovery window
                                    closestM.stunUntil > game.t ||
                                    closestM.freezeUntil > game.t ||
                                    (closestDist < 45 && !mAttackImminent);
            scores.ATTACK_COMMIT = enemyVulnerable ? 80 + strConf*40 : 30 + strConf*20;
            if (hpPct > 0.7) scores.ATTACK_COMMIT += 25;
            if (hpPct < 0.3) scores.ATTACK_COMMIT -= 30;
            // Ranged: ATTACK_COMMIT also valid at range
            if (isRanged && closestDist <= ATK_RANGE) scores.ATTACK_COMMIT += 20;

            // BLOCK: raise guard — good when enemy is about to hit and DEF is decent
            scores.BLOCK_STANCE = mAttackImminent ? 60 + defRead*50 : 15;
            if (yuyu.bState === "BLOCK" || game.t < yuyu.blockCoolUntil) scores.BLOCK_STANCE = 0; // can't stack
            if (hpPct < 0.15) scores.BLOCK_STANCE = 0; // too low — just flee

            // PARRY: very deliberate — only when Yuyu "reads" the attack perfectly
            // Requires DEF ≥ 3, monster imminent, and Yuyu is NOT already blocking
            const canParry = defTick >= 3 &&
                             mAttackImminent &&
                             game.t > yuyu.blockCoolUntil &&
                             yuyu.bState !== "BLOCK";
            scores.PARRY_ATTEMPT = canParry ? 30 + defRead*70 + (defTick>=6?30:0) : 0;
            // Parry is high-risk: penalize if DEF is low (mistimed = full damage)
            if (defTick < 4) scores.PARRY_ATTEMPT *= 0.5;

            // DODGE_STEP: burst sideways — good when surrounded or HP critical
            const surrounded = alive.filter(m=>Math.hypot(m.x-yuyu.x,m.y-yuyu.y)<70).length >= 2;
            scores.DODGE_STEP = surrounded ? 55 : mAttackImminent ? 40 : 10;
            if (hpPct < 0.25) scores.DODGE_STEP += 35; // low HP → dodge more
            if (yuyu.speedBoost) scores.DODGE_STEP += 20;
            // Can't dodge while blocking
            if (yuyu.bState === "BLOCK") scores.DODGE_STEP = 0;

            // NONE: keep current behaviour
            scores.NONE = 20 + (yuyu.bState==="ATTACK"?25:0);

            // ── Pick highest scoring option ──
            const best = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];

            // ── Execute decision ──
            game.combatStance = best;

            if (best === "ATTACK_COMMIT") {
              // Yuyu decides to press the attack — override strategy for this window
              yuyu.bState = closestDist <= 38 ? "ATTACK" : "CHASE";
              yuyu.target = closestM;

            } else if (best === "BLOCK_STANCE") {
              yuyu.bState = "BLOCK";
              yuyu.target = closestM;
              yuyu.blockUntil = game.t + 0.55;
              yuyu.parryWindowUntil = game.t; // no parry window — normal block
              yuyu.blockCoolUntil = game.t + 2.0;
              yuyu.parrySuccess = false;
              SFX.play("block");

            } else if (best === "PARRY_ATTEMPT") {
              // Yuyu COMMITS to a parry — she's betting the monster will attack NOW
              yuyu.bState = "BLOCK";
              yuyu.target = closestM;
              yuyu.blockUntil = game.t + 0.5;
              yuyu.parryWindowUntil = game.t + 0.35; // full parry window — she timed it
              yuyu.blockCoolUntil = game.t + 1.8;
              yuyu.parrySuccess = false;
              SFX.play("block");

            } else if (best === "DODGE_STEP") {
              // Yuyu steps sideways — brief invincibility dash
              yuyu.invincibleUntil = game.t + 0.22;
              yuyu.bState = "FLEE";
              SFX.play("dodge");
            }
          }

          // ── Expire BLOCK if duration is up ──
          if (yuyu.bState === "BLOCK" && game.t > yuyu.blockUntil) {
            yuyu.bState = "CHASE";
            yuyu.parrySuccess = false;
            game.combatStance = "NONE";
          }

          // ── While in BLOCK: hold still, face threat ──
          if (yuyu.bState === "BLOCK") {
            moveVector = { dx: 0, dy: 0 };
          }
        }
        const spd = yuyu.spd*(yuyu.speedBoost?2:1)*(yuyu.cryUntil>game.t?1.1:1)*spdMult;
        if (yuyu.bState!=="ATTACK"&&yuyu.bState!=="IDLE"&&!yuyu.chargingBomb){
          if (!game.velX)game.velX=0;
          if (!game.velY)game.velY=0;
          const BLEND = Math.min(1,dt*12);
          game.velX=game.velX*(1-BLEND)+moveVector.dx*BLEND;
          game.velY=game.velY*(1-BLEND)+moveVector.dy*BLEND;
          const vLen = Math.hypot(game.velX,game.velY)||1;
          const nx = yuyu.x+(game.velX/vLen)*spd*dt;
          const ny = yuyu.y+(game.velY/vLen)*spd*dt;
          // Wall slide: zero out the velocity component pointing into the wall
          const clampedX = Math.max(20,Math.min(WW_-20,nx));
          const clampedY = Math.max(floorMin,Math.min(floorMax,ny));
          if (clampedX!==nx) game.velX = 0;
          if (clampedY!==ny) game.velY = 0;
          yuyu.x=clampedX;
          yuyu.y=clampedY;
        } else if (yuyu.bState==="IDLE"){yuyu.x+=Math.sin(game.t*.7)*.4;
        yuyu.y+=Math.cos(game.t*.5)*.3;
        };
        yuyu.x=Math.max(20,Math.min(WW_-20,yuyu.x));
        yuyu.y=Math.max(floorMin,Math.min(floorMax,yuyu.y));
        // Hard push-out: if Yuyu overlaps a solid obstacle, move her to the surface
        if (game.obstacles){
          const pu = pushOutObstacles(yuyu.x,yuyu.y,game.obstacles,10);
          yuyu.x=Math.max(20,Math.min(WW_-20,pu.x));
          yuyu.y=Math.max(floorMin,Math.min(floorMax,pu.y));
        }

        // ── Attack ──
        if (yuyu.bState==="ATTACK"&&yuyu.target&&game.t-yuyu.lastAtk>yuyu.atkCd){
          yuyu.lastAtk=game.t;
          let dmg = yuyu.dmg * (game.momentumDmgMult || 1);
          if (cfg.oneHitKill) dmg = yuyu.target.maxHp * 999;
          // Berserker: flat ATK bonus = STR×strBonus when HP<30%
          if (game.hasBerserker&&hpPct<.3) dmg += strTick * game.berserkerStrBonus;
          // LastStand: flat ATK bonus = STR×strBonus when HP<15%
          if (game.hasLastStand&&hpPct<.15) dmg += strTick * game.lastStandStrBonus;
          // BattleCry: flat bonus
          if (game.t<(yuyu.cryUntil||0)) dmg += yuyu.cryBonus||0;
          // Berserker strategy bonus (minor flat)
          if (strat==="berserker"&&hpPct<.3) dmg += strTick * 2;
          const isCrit = game.hasCrit&&Math.random()<game.critChance;
          const critMult = getSkillLv(stateYuyuRef.current,"critStrike")>=3?2.5:2;
          if (isCrit) dmg *= critMult;
          dmg = Math.round(dmg);
          yuyu.target.hp -= dmg;
          SFX.play(isCrit ? "crit" : "atk");
          // Venom on hit
          if (game.hasVenom){yuyu.target.poisonUntil=game.t+game.venomDur;yuyu.target.poisonDmg=game.venomDmg;}

          // ── BLIND SPOT: attack from outside monster's FOV → bonus stun ──
          const blindStun = getBlindSpotStun(yuyu.target, yuyu.x, yuyu.y);
          if (blindStun > 0.3) {
            // Yuyu hit from blind spot! Stun the monster + bonus damage
            yuyu.target.stunUntil = Math.max(yuyu.target.stunUntil||0, game.t + blindStun);
            // Alert monster instantly (it now knows where Yuyu is)
            const fovDef2 = MFOV[yuyu.target.id] || MFOV.slime;
            yuyu.target.alertUntil = game.t + fovDef2.alertDur;
            yuyu.target.lastSeenX  = yuyu.x;
            yuyu.target.lastSeenY  = yuyu.y;
            const stunLabel = blindStun >= 2.5 ? "💀 SNEAK!" : blindStun >= 1.5 ? "⚡ BLIND HIT!" : "BLIND +";
            if(cfg.damageNumbers!==false)game.parts.push({
              x:yuyu.target.x, y:yuyu.target.y-18,
              vx:0, vy:-38, life:.75,
              col: blindStun>=2.5 ? "#f59e0b" : "#c4b5fd",
              txt: stunLabel
            });
            // Track sneak in live game state for habit accumulation at battle end
            game.sneakHits = (game.sneakHits||0) + 1;
            game.sneakStunTotal = (game.sneakStunTotal||0) + blindStun;
            // Sneak = dead behind (≥2.5s stun) → Yuyu gets energy bonus
            if (blindStun >= 2.5) {
              yuyu.energy = Math.min(yuyu.maxEnergy, (yuyu.energy||0) + 8);
            }
          } else if (!isInFOV(yuyu.target, yuyu.x, yuyu.y)) {
            // Even outside-FOV hits that aren't "blind spot" still alert the monster
            yuyu.target.alertUntil = Math.max(yuyu.target.alertUntil||0, game.t + 1.0);
          }

          const killed = yuyu.target.hp<=0;
          if (cfg.damageNumbers!==false)game.parts.push({x:yuyu.target.x,y:yuyu.target.y-5,vx:(Math.random()-.5)*80,vy:-45,life:.55,col:"#fbbf24",txt:(isCrit?"★":"")+dmg});
          // Lifesteal: flat = STR×strMult HP per hit
          if (game.hasLifesteal){const drain = Math.round(strTick * game.lifestealStrMult);yuyu.hp=Math.min(yuyu.maxHp,yuyu.hp+drain);}
          if (killed){
            SFX.play((game.isBoss||game.isMegaBoss) ? "killBoss" : "kill");
            if (game.hasChainReact){
              // ChainReact: flat splash = STR×strMult
              const splash = Math.round(strTick * game.chainStrMult);
              alive.filter(m=>m!==yuyu.target&&m.hp>0&&Math.hypot(m.x-yuyu.target.x,m.y-yuyu.target.y)<50).forEach(m=> {
                m.hp-=splash;
                if (getSkillLv(stateYuyuRef.current,"chainReact")>=3)m.stunUntil=game.t+0.5;
              });
            }
            grantKillRef.current(yuyu.target);
          }
        }

        // ── Monster AI + collision ──
        const aggrSetting = cfg.monsterAggression||"normal";
        const aggrMult = aggrSetting==="passive"?.45:aggrSetting==="aggressive"?1.45:aggrSetting==="feral"?2.2:1;
        alive.forEach(m=> {
          if (m.poisonUntil>game.t&&game.hasVenom){m.hp-=game.venomDmg*dt;if (m.hp<=0){grantKillRef.current(m);return;}}
          if (game.t<(m.stunUntil||0)||game.t<(m.freezeUntil||0))return;
          if (m.id==="phantom"&&Math.random()<.002){m.x=CW*.35+Math.random()*CW*.55;m.y=floorMin+Math.random()*(floorMax-floorMin);}

          // ── FOV: can monster see Yuyu right now? ──
          const canSeeYuyu = isInFOV(m, yuyu.x, yuyu.y);
          const isAlerted  = game.t < (m.alertUntil || 0);

          if (canSeeYuyu) {
            // Monster spots Yuyu — update alert timer and last known position
            const fovDef = MFOV[m.id] || MFOV.slime;
            m.alertUntil = game.t + fovDef.alertDur;
            m.lastSeenX  = yuyu.x;
            m.lastSeenY  = yuyu.y;
          }

          const shouldChase = canSeeYuyu || isAlerted;
          const mSpdMult = (m.warpUntil>game.t?(1-m.warpSlow):1)*aggrMult;

          if (m.id==="spike") {
            // Spike never moves — just updates facing
          } else if (shouldChase) {
            // Chase toward Yuyu (or last seen position)
            const tx = canSeeYuyu ? yuyu.x : (m.lastSeenX ?? yuyu.x);
            const ty = canSeeYuyu ? yuyu.y : (m.lastSeenY ?? yuyu.y);
            const raw = steerAvoid(m.x,m.y,tx-m.x,ty-m.y,game.obstacles,m.w/2+4);
            const d2 = Math.hypot(raw.dx,raw.dy)||1;
            m.x+=raw.dx/d2*m.spd*mSpdMult*dt;
            m.y+=raw.dy/d2*m.spd*mSpdMult*dt;
            // Update facing toward movement direction
            m.facing = Math.atan2(raw.dy, raw.dx);
          } else {
            // Patrol: slow idle wander — monster has no idea where Yuyu is
            m.patrolT = (m.patrolT||0) + dt;
            const patrolDir = (m.uid * 1.3) + Math.sin(m.patrolT * 0.4) * 1.2;
            const px = Math.cos(patrolDir) * m.spd * 0.25 * mSpdMult * dt;
            const py = Math.sin(patrolDir) * m.spd * 0.08 * mSpdMult * dt;
            m.x += px; m.y += py;
            m.facing = patrolDir; // face patrol direction
          }

          m.x=Math.max(m.w/2+4,Math.min(WW_-m.w/2-4,m.x));
          m.y=Math.max(floorMin,Math.min(floorMax,m.y));
          // Hard push-out from solid obstacles
          if (game.obstacles){
            const mpu = pushOutObstacles(m.x,m.y,game.obstacles,m.w/2+2);
            m.x=Math.max(m.w/2+4,Math.min(WW_-m.w/2-4,mpu.x));
            m.y=Math.max(floorMin,Math.min(floorMax,mpu.y));
          }
          const dx2 = yuyu.x-m.x,dy2=yuyu.y-m.y,d=Math.hypot(dx2,dy2)||1;

          // ── FLEE chip damage — graze hit when very close while fleeing ──
          if (yuyu.bState==="FLEE" && d<20 && game.t-m.lastHit>0.6) {
            m.lastHit=game.t;
            if (cfg.invincible||yuyu.invincibleUntil>game.t) return;
            const chipDmg = Math.max(1, m.dmg - Math.floor(defTick/3));
            yuyu.hp -= chipDmg;
            SFX.play("graze");
            const shk = cfg.screenShake||"normal";
            if(shk!=="off"){game.shakeUntil=game.t+0.1;game.shakeMag=shk==="heavy"?4:2;}
            if(cfg.damageNumbers!==false)game.parts.push({x:yuyu.x,y:yuyu.y-8,vx:(Math.random()-.5)*40,vy:-25,life:.35,col:"#f87171",txt:`-${chipDmg}`});
          }

          // ── Normal melee hit (only if monster can sense Yuyu or very close) ──
          if (d<28&&game.t-m.lastHit>1.4&&(shouldChase||d<18)){
            m.lastHit=game.t;
            if (cfg.invincible||yuyu.invincibleUntil>game.t)return;
            if (yuyu.shield>0){yuyu.shield--;flash("Shield ✦");SFX.play("shield");return;}

            // ── PARRY CHECK — hit lands inside parry window ──
            if (yuyu.bState==="BLOCK" && game.t < yuyu.parryWindowUntil) {
              yuyu.parrySuccess = true;
              yuyu.lastParryT = game.t;
              m.stunUntil = game.t + 1.4;
              // Counter-reflect: flat DEF×2 damage back to attacker
              const parryReflect = Math.max(1, defTick * 2);
              m.hp -= parryReflect;
              if (m.hp <= 0) grantKillRef.current(m);
              game.parts.push({x:yuyu.x,y:yuyu.y-10,vx:0,vy:-40,life:.55,col:"#fde68a",txt:"PARRY!"});
              SFX.play("parry");
              yuyu.invincibleUntil = game.t + 0.5;
              return;
            }

            // ── BLOCK — hit lands outside parry window → DEF-based mitigation ──
            if (yuyu.bState==="BLOCK" && game.t < yuyu.blockUntil) {
              const extraDef = game.t<(yuyu.tempDef||0)?2:0;
              // Guardian: flat DEF×defMult reduction on top
              const guardianFlat = game.hasGuardian ? defTick * game.guardianDefMult : 0;
              const rawDmg = Math.max(1, m.dmg - (defTick + extraDef)*2 - guardianFlat);
              // Block further halves damage (DEF does the heavy lifting)
              const blockedDmg = Math.max(1, Math.floor(rawDmg / 2));
              YuyuMindEngine.notifyMonsterHit(m,yuyu,game.t);
              yuyu.hp -= blockedDmg;
              SFX.play("block");
              if(cfg.damageNumbers!==false)game.parts.push({x:yuyu.x,y:yuyu.y-10,vx:(Math.random()-.5)*30,vy:-28,life:.4,col:"#93c5fd",txt:`-${blockedDmg}`});
              return;
            }

            // ── mirror dodge ──
            if (game.hasMirror&&Math.random()<game.mirrorChance){
              if(cfg.damageNumbers!==false)game.parts.push({x:yuyu.x,y:yuyu.y-14,vx:0,vy:-30,life:.5,col:"#c4b5fd",txt:"DODGE!"});
              SFX.play("dodge");
              return;
            }

            // ── Normal hit ──
            const extraDef = game.t<(yuyu.tempDef||0)?2:0;
            // Guardian: flat reduction = DEF×defMult
            const guardianFlat = game.hasGuardian ? defTick * game.guardianDefMult : 0;
            const dmg = Math.max(1, m.dmg - (defTick + extraDef)*2 - guardianFlat);
            YuyuMindEngine.notifyMonsterHit(m,yuyu,game.t);
            yuyu.hp -= dmg;
            // ── Resilient perk: prevent one-shot (HP floor = 1, once per battle) ──
            if (game.perkResilient && !game.resilientUsed && yuyu.hp <= 0) {
              yuyu.hp = 1;
              game.resilientUsed = true;
              if(cfg.damageNumbers!==false)game.parts.push({x:yuyu.x,y:yuyu.y-18,vx:0,vy:-40,life:.7,col:"#22d3ee",txt:"RESILIENT!"});
              flash("🛡 Resilient!");
            }
            SFX.play("hit");
            // Thorns: reflect DEF×defMult flat back
            if (game.hasThorns) m.hp -= Math.max(1, defTick * game.thornDefMult);
            // Mirror: if dodge fails, still reflect DEF×defMult on counter lv
            if(cfg.damageNumbers!==false)game.parts.push({x:yuyu.x,y:yuyu.y-10,vx:(Math.random()-.5)*60,vy:-35,life:.45,col:COLORS.red,txt:`-${Math.round(dmg)}`});
            const shk = cfg.screenShake||"normal";
            if(shk!=="off"){const mag=shk==="heavy"?10:shk==="light"?3:6;game.shakeUntil=game.t+0.18;game.shakeMag=mag;}
            if (!lowHpDone&&hpPct<.3){lowHpDone=true;yuyuSay("hurt",{hpPct:Math.round(hpPct*100),count:alive.length,stage:game.stage});}
          }
        });

        // ── Last Breath perk: reset all CDs once when HP < 10% ──
        if (game.perkLastBreath && !game.lastBreathUsed && yuyu.hp/yuyu.maxHp < 0.10 && yuyu.hp > 0) {
          game.lastBreathUsed = true;
          cdsRef.current = {};
          setCds({});
          flash("💨 Last Breath! CD Reset!");
        }

        game.parts=game.parts.filter(p=>p.life>0);
        if(cfg.particles!=="off")game.parts.forEach(p=> {p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=55*dt;p.life-=dt;});
        else game.parts=[];
        const boss0 = (game.isBoss||game.isMegaBoss)?game.monsters[0]:null;
        setLiveStats({hp:isNaN(yuyu.hp)?0:Math.max(0,yuyu.hp),max:yuyu.maxHp||100,kills:yuyu.kills,bossHpPct:boss0?Math.max(0,boss0.hp/boss0.maxHp):0,bossHp:boss0?Math.max(0,Math.round(boss0.hp)):0,bossMaxHp:boss0?Math.round(boss0.maxHp):0,combo:yuyu.combo||0,threat,combatStance:game.yuyu?.combatStance||"NONE",energy:yuyu.energy??ENERGY_MAX,maxEnergy:ENERGY_MAX,isSneaking:game.isSneaking||false});
        if (yuyu.hp<=0&&!game.ended){
          game.ended=true;
          SFX.play("lose");
          const snap = {kills:yuyu.kills,xp:yuyu.xp,strat:game.strategyUsed,energy:yuyu.energy??0,sneakHits:game.sneakHits||0,sneakStun:game.sneakStunTotal||0};
          yuyuSay("lose",{kills:snap.kills,stage:game.stage});
          setTimeout(()=>onEnd({result:"lose",kills:snap.kills,goldEarned:0,xpEarned:snap.xp,remainingHp:0,remainingEnergy:snap.energy,strategyUsed:snap.strat,sneakHits:snap.sneakHits,sneakStunTotal:snap.sneakStun}),1800);
        } else if (!alive.length&&!game.ended){
          game.ended=true;
          SFX.play("win");
          const snap = {kills:yuyu.kills,gold:yuyu.gold,xp:yuyu.xp,hp:Math.max(0,yuyu.hp),strat:game.strategyUsed,energy:yuyu.energy??ENERGY_MAX,sneakHits:game.sneakHits||0,sneakStun:game.sneakStunTotal||0};
          yuyuSay("win",{kills:snap.kills,gold:snap.gold,stage:game.stage});
          setTimeout(()=>onEnd({result:"win",kills:snap.kills,goldEarned:snap.gold,xpEarned:snap.xp,remainingHp:snap.hp,remainingEnergy:snap.energy,strategyUsed:snap.strat,sneakHits:snap.sneakHits,sneakStunTotal:snap.sneakStun}),1800);
        }
      }
      if (game.ended)return;

      // ── CAMERA UPDATE ────────────────────────────────────────────────────
      {
        const zoom = zoomRef.current;
        const follow = camFollowRef.current;
        // Visible world area at current zoom
        const visW = CW / zoom, visH = CH / zoom;

        if (follow && isStarted) {
          // Look-ahead: nudge slightly toward nearest threat
          const nearest_m = alive.length ? alive.reduce((a,b)=>Math.hypot(a.x-yuyu.x,a.y-yuyu.y)<Math.hypot(b.x-yuyu.x,b.y-yuyu.y)?a:b) : null;
          let lookX=0, lookY=0;
          if (nearest_m) {
            const ldx=nearest_m.x-yuyu.x, ldy=nearest_m.y-yuyu.y, ld=Math.hypot(ldx,ldy)||1;
            lookX=(ldx/ld)*40/zoom;   // scale look-ahead with zoom
            lookY=(ldy/ld)*20/zoom;
          }
          const targetCamX = yuyu.x + lookX;
          const targetCamY = yuyu.y + lookY;
          const lerpSpd = 5.5;
          game.camX += (targetCamX - game.camX) * Math.min(1, lerpSpd * dt);
          game.camY += (targetCamY - game.camY) * Math.min(1, lerpSpd * dt);
        } else if (!isStarted) {
          // Idle: snap to Yuyu fast
          game.camX += (yuyu.x - game.camX) * Math.min(1, 8 * dt);
          game.camY += (yuyu.y - game.camY) * Math.min(1, 8 * dt);
        }
        // Clamp camera so world edges don't expose black void.
        // When zoomed out enough that the whole world fits, just center it.
        const worldW = game.WW||CW, worldH = game.WH||CH;
        if (visW >= worldW) {
          game.camX = worldW / 2;   // world fits horizontally — center it
        } else {
          game.camX = Math.max(visW/2, Math.min(worldW - visW/2, game.camX));
        }
        if (visH >= worldH) {
          game.camY = worldH / 2;   // world fits vertically — center it
        } else {
          game.camY = Math.max(visH/2, Math.min(worldH - visH/2, game.camY));
        }
      }

      // ── DRAW ─────────────────────────────────────────────────────────────
      const zoom = zoomRef.current;
      ctx.clearRect(0,0,CW,CH);
      ctx.save();
      // Screen shake
      let shakeX=0,shakeY=0;
      if(game.shakeUntil&&game.t<game.shakeUntil){const mag=game.shakeMag||6;shakeX=(Math.random()-.5)*mag;shakeY=(Math.random()-.5)*mag;}
      // Transform: screen_pos = (world_pos - cam) * zoom + screenCenter
      ctx.translate(CW/2+shakeX, CH/2+shakeY);
      ctx.scale(zoom, zoom);
      ctx.translate(-game.camX, -game.camY);

      drawScene(ctx,game.biome,game.t,game.WW||CW,game.WH||CH);
      if (!isStarted)drawCamp(ctx,game.t,game.WW||CW,game.WH||CH);
      if (isStarted&&game.obstacles){game.obstacles.forEach(obs=>drawObstacleSprite(ctx,obs,game.biome,game.t));}
      const allM = isStarted?game.monsters.filter(m=>m.hp>0):[];
      if (!game.yuyu||!yuyu){animFrameRef.current=requestAnimationFrame(tick);return;}
      allM.forEach(m=>drawShadow(ctx,m.x,m.y,m.w/16));
      const sprites = [{_t:"yuyu",y:yuyu.y},...allM.map(m=> ({_t:"monster",y:m.y,m}))].sort((a,b)=>a.y-b.y);
      sprites.forEach(s=> {
        if (s._t==="yuyu")drawYuyu(ctx,yuyu,game.t,game);
        else {
          if (s.m.waiting){ctx.save();ctx.globalAlpha=0.35+Math.sin(game.t*2)*.1;}
          drawMonsterSprite(ctx,s.m,game.t);
          if (s.m.waiting)ctx.restore();
        }
      });
      game.parts.forEach(p=>drawParticle(ctx,p));
      ctx.restore(); // ← end camera transform
      animFrameRef.current=requestAnimationFrame(tick);
    }
    animFrameRef.current=requestAnimationFrame(tick);
    return()=> {
      if (animFrameRef.current)cancelAnimationFrame(animFrameRef.current);
      gameRef.current=null;
      YuyuVoice.stop();
      canvas.removeEventListener("wheel",onWheel);
      canvas.removeEventListener("touchstart",onTouchStart);
      canvas.removeEventListener("touchmove",onTouchMove);
    };
  },[flash,onEnd]); // fireSkill/yuyuSay are stable via refs — no need in deps

  const activeSkills = (state.yuyu.unlockedSkills||[]).filter(s=>SKILLS[s]?.type==="active");
  const biome = getBiome(state.world.stage);
  const isMegaBoss = state.world.stage%10===0&&state.world.stage>=10;
  const isBoss = (state.world.stage%5===0&&!isMegaBoss)||isMegaBoss;
  const hpPct = (liveStats.max>0)?(liveStats.hp/liveStats.max):0;
  const safeHpPct = isNaN(hpPct)?0:Math.max(0,Math.min(1,hpPct));
  const hpColor = safeHpPct>.5?COLORS.green:safeHpPct>.25?COLORS.gold:COLORS.red;

  const hudOpacity = (state.settings?.hudOpacity ?? 100) / 100;
  const showStrategyBadge = state.settings?.showStrategy !== false;
  const showFpsHud = state.settings?.showFps === true;
  const btnStyle = (accent) => ({
    width:30, height:30, borderRadius:9, cursor:"pointer",
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:13, backdropFilter:"blur(6px)", border:"none",
    background: accent || "rgba(255,255,255,.07)",
    color:"rgba(255,255,255,.8)", flexShrink:0,
  });

  return(
    <div ref={containerRef} style={{position:"absolute",inset:0,background:"#070511"}}>
      <canvas ref={canvasRef} width={CW} height={CH} style={{display:"block",width:CW,height:CH,touchAction:"none"}}/>

      {/* ══ TOP HUD GRADIENT BG ══ */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:90,background:"linear-gradient(180deg,rgba(4,2,12,.95) 0%,rgba(4,2,12,.6) 70%,transparent 100%)",pointerEvents:"none",zIndex:10,opacity:hudOpacity}}/>

      {/* ══ ROW 1: Stage info + stats + action buttons ══ */}
      <div style={{position:"absolute",top:0,left:0,right:0,zIndex:11,padding:"8px 10px 0",opacity:hudOpacity}}>
        <div style={{display:"flex",alignItems:"center",gap:6,position:"relative"}}>

          {/* Left: biome + stage */}
          <div style={{flex:1,minWidth:0,display:"flex",alignItems:"center",gap:5}}>
            <span style={{fontSize:16,lineHeight:1,flexShrink:0}}>{biome.icon}</span>
            <div style={{minWidth:0}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.9)",fontWeight:800,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                {isMegaBoss?<span style={{color:"#fca5a5"}}>💀 MEGA BOSS</span>:isBoss?<span style={{color:"#e879f9"}}>👑 BOSS</span>:biome.name}
              </div>
              <div style={{fontSize:7,color:"rgba(255,255,255,.3)",letterSpacing:".1em",lineHeight:1.3,marginTop:1,display:"flex",alignItems:"center",gap:4}}>
                STAGE {state.world.stage}{state.yuyu.prestige>0&&<PrestigeBadge prestige={state.yuyu.prestige}/>}
              </div>
            </div>
          </div>

          {/* Center: gold + kills pill */}
          <div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:3,padding:"4px 8px",borderRadius:20,background:"rgba(245,158,11,.13)",border:"1px solid rgba(245,158,11,.28)"}}>
              <span style={{fontSize:10}}>🪙</span>
              <span style={{fontSize:10,color:"#fbbf24",fontWeight:800}}>{state.player.gold}</span>
            </div>
            {started&&<div style={{display:"flex",alignItems:"center",gap:3,padding:"4px 8px",borderRadius:20,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.22)"}}>
              <span style={{fontSize:9}}>💀</span>
              <span style={{fontSize:10,color:"rgba(255,255,255,.85)",fontWeight:700}}>{liveStats.kills}</span>
              {(state.settings?.showCombo!==false)&&liveStats.combo>=3&&<span style={{fontSize:9,color:"#f87171",fontWeight:900,animation:"livePulse 0.7s ease-in-out infinite"}}>🔥{liveStats.combo}x</span>}
            </div>}
          </div>

          {/* Right: action buttons */}
          <div style={{display:"flex",gap:4,alignItems:"center",flexShrink:0}}>
            <button onClick={onUpgrade} style={btnStyle("rgba(124,58,237,.3)")}>📈</button>
            <button onClick={onSettings} style={btnStyle("rgba(255,255,255,.05)")}>⚙️</button>
            <button onClick={()=>setShowTools(v=>!v)} style={btnStyle(showTools?"rgba(124,58,237,.4)":"rgba(255,255,255,.05)")} title="Tools">
              <span style={{fontSize:14}}>👁️</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══ TOOLS TRAY (👁️) — floats top-right ══ */}
      {showTools&&(
        <div style={{position:"absolute",top:50,right:10,zIndex:30,display:"flex",alignItems:"center",gap:5,padding:"6px 10px",borderRadius:14,background:"rgba(6,3,16,.95)",border:"1px solid rgba(255,255,255,.12)",backdropFilter:"blur(16px)",boxShadow:"0 8px 28px rgba(0,0,0,.7)",opacity:hudOpacity}}>
          {/* Pause + RUN — only in battle */}
          {started&&<>
            <button onClick={()=>setPaused(!paused)} style={{...btnStyle(paused?"rgba(245,158,11,.25)":undefined),color:paused?"#fbbf24":"rgba(255,255,255,.75)",border:`1px solid ${paused?"rgba(245,158,11,.4)":"rgba(255,255,255,.1)"}`}}>{paused?"▶":"⏸"}</button>
            <button onClick={()=>{setShowTools(false);onEnd({result:"retreat",kills:gameRef.current?.yuyu?.kills||0,goldEarned:0,xpEarned:gameRef.current?.yuyu?.xp||0,remainingHp:Math.max(0,gameRef.current?.yuyu?.hp||0),remainingEnergy:gameRef.current?.yuyu?.energy??ENERGY_MAX});}} style={{...btnStyle("rgba(80,0,0,.7)"),border:"1px solid rgba(239,68,68,.35)",color:"#f87171",gap:3,paddingInline:8,width:"auto"}}>
              <span style={{fontSize:11}}>🏳️</span><span style={{fontSize:8,fontWeight:900,letterSpacing:".04em"}}>RUN</span>
            </button>
            <div style={{width:1,height:18,background:"rgba(255,255,255,.12)"}}/>
          </>}
          {/* Cinema + camera follow */}
          <button onClick={toggleCinema} style={{...btnStyle(cinemaMode?"rgba(124,58,237,.5)":undefined),border:`1px solid ${cinemaMode?"rgba(124,58,237,.7)":"rgba(255,255,255,.1)"}`,color:cinemaMode?"#c4b5fd":"rgba(255,255,255,.55)"}}>🎬</button>
          <button onClick={()=>{const n=!camFollow;setCamFollow(n);camFollowRef.current=n;}} style={{...btnStyle(camFollow?"rgba(6,182,212,.3)":undefined),border:`1px solid ${camFollow?"rgba(6,182,212,.6)":"rgba(255,255,255,.1)"}`,color:camFollow?"#67e8f9":"rgba(255,255,255,.45)"}}>📷</button>
          <div style={{width:1,height:18,background:"rgba(255,255,255,.12)"}}/>
          {/* Zoom */}
          <button onClick={()=>{const nz=Math.max(0.35,zoomRef.current/1.25);setZoom(nz);setZoomDisplay(Math.round(nz*100)/100);}} style={{...btnStyle(),fontSize:17,fontWeight:700,color:"rgba(255,255,255,.75)"}}>−</button>
          <span style={{fontSize:9,color:"rgba(255,255,255,.5)",fontWeight:700,minWidth:32,textAlign:"center"}}>{Math.round(zoomDisplay*100)}%</span>
          <button onClick={()=>{const nz=Math.min(4.0,zoomRef.current*1.25);setZoom(nz);setZoomDisplay(Math.round(nz*100)/100);}} style={{...btnStyle(),fontSize:17,fontWeight:700,color:"rgba(255,255,255,.75)"}}>+</button>
          <button onClick={()=>{setZoom(1.0);setZoomDisplay(1.0);const g=gameRef.current;if(g){g.camX=g.yuyu?.x||CW/2;g.camY=g.yuyu?.y||CH/2;}}} style={{...btnStyle(),fontSize:7,fontWeight:900,color:"rgba(255,255,255,.4)",fontFamily:"inherit"}}>1:1</button>
          {showFpsHud&&<><div style={{width:1,height:18,background:"rgba(255,255,255,.12)"}}/><span style={{fontSize:8,color:"rgba(255,255,255,.4)",fontWeight:700,minWidth:32,textAlign:"center"}}>{fpsDisplay}fps</span></>}
        </div>
      )}

      {/* ══ YUYU HP PANEL (bottom-left) ══ — only show when NOT cinema */}
      {!cinemaMode&&<div style={{position:"absolute",bottom:"clamp(172px,24vh,205px)",left:"clamp(8px,2vw,14px)",zIndex:10,minWidth:"clamp(120px,32vw,155px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
          <div style={{position:"relative",flexShrink:0}}>
            <div style={{width:"clamp(28px,7.5vw,34px)",height:"clamp(28px,7.5vw,34px)",borderRadius:"50%",background:`radial-gradient(circle at 38% 32%,${hpColor}35,rgba(8,4,20,.9))`,border:`2px solid ${hpColor}`,boxShadow:`0 0 10px ${hpColor}55,inset 0 0 8px rgba(0,0,0,.5)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(11px,3vw,14px)"}}>
              {safeHpPct>0.5?"🌸":safeHpPct>0.25?"😤":"💀"}
            </div>
            {safeHpPct<=0.25&&<div style={{position:"absolute",inset:-3,borderRadius:"50%",border:`1.5px solid ${COLORS.red}`,animation:"livePulse 0.6s ease-in-out infinite",pointerEvents:"none"}}/>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:3}}>
              <span style={{fontSize:"clamp(8px,2.1vw,10px)",color:"rgba(255,255,255,.9)",fontWeight:800}}>Yuyu</span>
              <span style={{fontSize:"clamp(6px,1.4vw,7px)",color:"rgba(255,255,255,.3)"}}>Lv.{state.yuyu.level}</span>
              <span style={{marginLeft:"auto",fontSize:"clamp(9px,2.4vw,12px)",color:hpColor,fontWeight:900,textShadow:`0 0 8px ${hpColor}88`}}>
                {Math.round(started?liveStats.hp:state.yuyu.hp||0)}<span style={{fontSize:"clamp(6px,1.4vw,7px)",color:"rgba(255,255,255,.28)",fontWeight:400}}>/{started?liveStats.max:state.yuyu.maxHp}</span>
              </span>
            </div>
            <div style={{position:"relative",height:"clamp(6px,1.6vw,8px)",borderRadius:99,background:"rgba(0,0,0,.7)",border:"1px solid rgba(255,255,255,.08)",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,width:`${safeHpPct*100}%`,borderRadius:99,background:safeHpPct>.5?`linear-gradient(90deg,#059669,#34d399,#6ee7b7)`:safeHpPct>.25?`linear-gradient(90deg,#d97706,#fbbf24,#fde68a)`:`linear-gradient(90deg,#b91c1c,#ef4444,#fca5a5)`,transition:"width .18s ease-out",boxShadow:`0 0 6px ${hpColor}88`}}/>
              {[25,50,75].map(p=><div key={p} style={{position:"absolute",top:0,bottom:0,left:`${p}%`,width:1,background:"rgba(0,0,0,.35)",zIndex:1}}/>)}
              <div style={{position:"absolute",top:0,left:0,right:0,height:"40%",borderRadius:"99px 99px 0 0",background:"rgba(255,255,255,.12)"}}/>
            </div>
            <div style={{height:2,borderRadius:99,background:"rgba(255,255,255,.06)",marginTop:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${Math.min(100,((state.yuyu.xp||0)/(state.yuyu.level*100))*100)}%`,background:"linear-gradient(90deg,#6366f1,#a78bfa)",borderRadius:99,transition:"width .3s"}}/>
            </div>
          </div>
        </div>
      </div>}

      {/* ══ BOSS BAR (bottom-right) ══ */}
      {!cinemaMode&&started&&isBoss&&<div style={{position:"absolute",bottom:"clamp(172px,24vh,205px)",right:"clamp(8px,2vw,14px)",zIndex:10,minWidth:"clamp(120px,32vw,155px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:3}}>
              <span style={{fontSize:"clamp(8px,2.1vw,10px)",color:isMegaBoss?"#fca5a5":"#e879f9",fontWeight:800}}>{isMegaBoss?"MEGA":"BOSS"}</span>
              <span style={{marginLeft:"auto",fontSize:"clamp(9px,2.4vw,12px)",color:isMegaBoss?"#f87171":"#e879f9",fontWeight:900,textShadow:`0 0 8px ${isMegaBoss?"#ef444488":"#a855f788"}`}}>
                {liveStats.bossHp}<span style={{fontSize:"clamp(6px,1.4vw,7px)",color:"rgba(255,255,255,.28)",fontWeight:400}}>/{liveStats.bossMaxHp}</span>
              </span>
            </div>
            <div style={{position:"relative",height:"clamp(6px,1.6vw,8px)",borderRadius:99,background:"rgba(0,0,0,.7)",border:"1px solid rgba(255,255,255,.08)",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,width:`${liveStats.bossHpPct*100}%`,borderRadius:99,background:isMegaBoss?`linear-gradient(90deg,#7f1d1d,#dc2626,#f87171)`:`linear-gradient(90deg,#581c87,#a855f7,#e879f9)`,transition:"width .2s ease-out",boxShadow:`0 0 8px ${isMegaBoss?"#ef444466":"#a855f766"}`}}/>
              {[25,50,75].map(p=><div key={p} style={{position:"absolute",top:0,bottom:0,left:`${p}%`,width:1,background:"rgba(0,0,0,.4)",zIndex:1}}/>)}
              <div style={{position:"absolute",top:0,left:0,right:0,height:"40%",borderRadius:"99px 99px 0 0",background:"rgba(255,255,255,.1)"}}/>
            </div>
            <div style={{display:"flex",gap:3,marginTop:2}}>
              {[3,2,1].map(phase=><div key={phase} style={{flex:1,height:2,borderRadius:99,background:liveStats.bossHpPct>(phase-1)/3?isMegaBoss?"rgba(239,68,68,.55)":"rgba(168,85,247,.55)":"rgba(255,255,255,.08)",transition:"background .3s"}}/>)}
            </div>
          </div>
          <div style={{width:"clamp(28px,7.5vw,34px)",height:"clamp(28px,7.5vw,34px)",borderRadius:"50%",background:isMegaBoss?"radial-gradient(circle,rgba(220,38,38,.4),rgba(8,4,20,.9))":"radial-gradient(circle,rgba(126,34,206,.4),rgba(8,4,20,.9))",border:`2px solid ${isMegaBoss?"#ef4444":"#a855f7"}`,boxShadow:`0 0 12px ${isMegaBoss?"#ef444455":"#a855f755"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(12px,3vw,15px)",animation:"livePulse 2s ease-in-out infinite",flexShrink:0}}>
            {isMegaBoss?"💀":"👑"}
          </div>
        </div>
      </div>}

      {/* ══ DIALOG BUBBLE — anchored above HP panel, never overlaps skill bar ══ */}
      {dlg&&<div style={{position:"absolute",bottom:"clamp(215px,30vh,250px)",left:"50%",transform:"translateX(-50%)",zIndex:15,pointerEvents:"none",animation:"toastDrop .22s cubic-bezier(.34,1.56,.64,1)",maxWidth:"72vw",whiteSpace:"nowrap"}}>
        <div style={{background:"linear-gradient(135deg,rgba(20,10,40,.96),rgba(10,5,25,.96))",border:"1px solid rgba(196,181,253,.22)",borderRadius:20,padding:"7px 14px",boxShadow:"0 6px 28px rgba(0,0,0,.65),0 0 0 1px rgba(124,58,237,.12)",display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:10,color:"rgba(196,181,253,.6)",fontWeight:700,letterSpacing:".04em",flexShrink:0}}>Yuyu</span>
          <div style={{width:1,height:10,background:"rgba(196,181,253,.18)",flexShrink:0}}/>
          <span style={{fontSize:11,color:"rgba(245,240,255,.95)",lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis"}}>{dlg}</span>
        </div>
      </div>}

      {/* ══ PAUSED ══ */}
      {paused&&<div onClick={()=>setPaused(false)} style={{position:"absolute",inset:0,background:"rgba(4,2,12,.82)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:14,cursor:"pointer"}}>
        <div style={{textAlign:"center"}}>
          <div style={{width:64,height:64,borderRadius:20,background:"rgba(124,58,237,.2)",border:"2px solid rgba(124,58,237,.5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 10px",boxShadow:"0 0 30px rgba(124,58,237,.3)"}}>⏸</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.5)",letterSpacing:".28em",fontWeight:700}}>PAUSED</div>
          <div style={{fontSize:8,color:"rgba(255,255,255,.2)",marginTop:5,letterSpacing:".06em"}}>tap untuk lanjut</div>
        </div>
      </div>}

      {/* ══ BATTLE START ══ — top, below HUD */}
      {!started&&<div style={{position:"absolute",top:"clamp(52px,8vh,64px)",left:0,right:0,zIndex:12,padding:"0 clamp(8px,2vw,14px)",display:"flex",alignItems:"center",gap:6}}>
        {MILESTONES[state.world.stage]&&<div style={{display:"flex",alignItems:"center",gap:4,fontSize:"clamp(7px,1.8vw,8px)",color:COLORS.gold,padding:"3px 8px",borderRadius:99,background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.3)",flexShrink:0}}>
          <span>🎁</span><span style={{fontWeight:700}}>Milestone!</span>
        </div>}
        <button onClick={onStart} style={{
          padding:"6px clamp(14px,4vw,22px)",borderRadius:10,
          background:isMegaBoss?`linear-gradient(135deg,#7f1d1d,#dc2626)`:isBoss?`linear-gradient(135deg,#4c1d95,#7c3aed)`:`linear-gradient(135deg,#4c1d95,#7c3aed,#be185d)`,
          border:`1px solid ${isMegaBoss?"rgba(239,68,68,.4)":"rgba(196,181,253,.25)"}`,
          color:"#fff",fontSize:"clamp(9px,2.3vw,11px)",fontWeight:900,
          cursor:"pointer",fontFamily:"inherit",letterSpacing:".06em",
          boxShadow:`0 3px 12px ${isMegaBoss?"rgba(220,38,38,.35)":"rgba(124,58,237,.4)"}`,
          display:"flex",alignItems:"center",gap:5,backdropFilter:"blur(6px)",flexShrink:0,
        }}>
          <span style={{fontSize:"clamp(10px,2.6vw,13px)"}}>{isMegaBoss?"💀":isBoss?"👑":"⚔️"}</span>
          <span>BATTLE{isMegaBoss?" MEGA":isBoss?" BOSS":""}</span>
        </button>
        {state.battleLog.result==="lose"&&(()=> {
          const cost = 50*Math.max(1,state.player.deaths||0);
          const can = state.player.gold>=cost;
          return(<button onClick={()=>can&&dispatch({type:"REVIVE"})} style={{padding:"5px 12px",borderRadius:99,background:can?"rgba(16,185,129,.15)":"rgba(255,255,255,.04)",border:`1px solid ${can?"rgba(16,185,129,.35)":"rgba(255,255,255,.07)"}`,color:can?"#34d399":"#4b5563",fontSize:"clamp(7px,1.9vw,9px)",cursor:can?"pointer":"default",fontFamily:"inherit",fontWeight:800,display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
            <span>💊</span><span>Revive · 🪙{cost}</span>
          </button>);
        })()}
        <div style={{fontSize:"clamp(6px,1.4vw,7px)",color:"rgba(255,255,255,.2)",letterSpacing:".08em"}}>
          Stage {state.world.stage}{isMegaBoss?" · MEGA":isBoss?" · BOSS":""}
          {(state.player.deaths||0)>0&&<span style={{color:"rgba(239,68,68,.4)",marginLeft:4}}>💀{state.player.deaths}x</span>}
        </div>
      </div>}

      {/* ══ STRATEGY + THREAT BADGE ══ — rendered inline inside skill bar row below */}

      {/* ══ CINEMA: compact floating HP ══ */}
      {cinemaMode&&started&&<div style={{position:"absolute",top:50,left:"50%",transform:"translateX(-50%)",zIndex:14,pointerEvents:"none",display:"flex",gap:8,alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,background:"rgba(4,2,12,.75)",border:`1px solid ${hpColor}50`,backdropFilter:"blur(10px)"}}>
          <span style={{fontSize:11}}>{safeHpPct>0.5?"🌸":safeHpPct>0.25?"😤":"💀"}</span>
          <div style={{width:55,height:5,borderRadius:99,background:"rgba(0,0,0,.5)",overflow:"hidden"}}>
            <div style={{height:"100%",width:`${safeHpPct*100}%`,borderRadius:99,background:safeHpPct>.5?"linear-gradient(90deg,#059669,#34d399)":safeHpPct>.25?"linear-gradient(90deg,#d97706,#fbbf24)":"linear-gradient(90deg,#b91c1c,#ef4444)",transition:"width .18s"}}/>
          </div>
          <span style={{fontSize:9,color:hpColor,fontWeight:900}}>{Math.round(liveStats.hp)}</span>
        </div>
        {isBoss&&<div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,background:"rgba(4,2,12,.75)",border:`1px solid ${isMegaBoss?"#ef444450":"#a855f750"}`,backdropFilter:"blur(10px)"}}>
          <span style={{fontSize:11}}>{isMegaBoss?"💀":"👑"}</span>
          <div style={{width:45,height:5,borderRadius:99,background:"rgba(0,0,0,.5)",overflow:"hidden"}}>
            <div style={{height:"100%",width:`${liveStats.bossHpPct*100}%`,borderRadius:99,background:isMegaBoss?"linear-gradient(90deg,#b91c1c,#ef4444)":"linear-gradient(90deg,#581c87,#a855f7)",transition:"width .2s"}}/>
          </div>
          <span style={{fontSize:9,color:isMegaBoss?"#f87171":"#e879f9",fontWeight:900}}>{Math.round(liveStats.bossHpPct*100)}%</span>
        </div>}
      </div>}

      {/* ══ SKILL BAR + ENERGY ══ — top, below HUD, only in battle + not cinema */}
      {started&&!cinemaMode&&<div style={{position:"absolute",top:"clamp(52px,8vh,64px)",left:0,right:0,zIndex:12,padding:"0 clamp(6px,1.5vw,10px)",display:"flex",gap:"clamp(4px,1.2vw,6px)",alignItems:"center"}}>
        {activeSkills.map((sid,i)=> {
          const sk = SKILLS[sid],onCd=!!cds[sid],lv=getSkillLv(state.yuyu,sid);
          const energyCost = sk.energy || 0;
          const curEnergy = liveStats.energy ?? ENERGY_MAX;
          const canAfford = curEnergy >= energyCost;
          const energyPct = energyCost > 0 ? Math.min(1, curEnergy / energyCost) : 1;
          const R = 17,circ=2*Math.PI*R;
          const glowColor = !canAfford?"#f59e0b":lv>=3?"#fbbf24":lv>=2?"#c4b5fd":biome.color;
          return(
            <div key={sid} style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
              <div style={{position:"relative",width:"clamp(40px,11vw,50px)",height:"clamp(40px,11vw,50px)"}}>
                {!onCd&&canAfford&&<div style={{position:"absolute",inset:-2,borderRadius:"50%",background:`radial-gradient(circle,${glowColor}20 0%,transparent 70%)`,animation:"skillReady 1.8s ease-in-out infinite"}}/>}
                <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",transform:"rotate(-90deg)"}} viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r={R} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="2.5"/>
                  {!onCd&&canAfford&&<circle cx="20" cy="20" r={R} fill="none" stroke={glowColor} strokeWidth="2.5" strokeOpacity=".6" strokeDasharray={circ} strokeDashoffset="0" strokeLinecap="round"/>}
                  {!onCd&&!canAfford&&<circle cx="20" cy="20" r={R} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeOpacity=".35" strokeDasharray={`${circ*energyPct} ${circ}`} strokeLinecap="round"/>}
                  {onCd&&<circle cx="20" cy="20" r={R} fill="none" stroke={biome.color} strokeWidth="2.5" strokeOpacity=".25" strokeDasharray={`0 ${circ}`} strokeLinecap="round"/>}
                </svg>
                <div style={{position:"absolute",inset:4,borderRadius:"50%",background:onCd?"rgba(8,4,18,.9)":!canAfford?"rgba(30,18,4,.9)":`radial-gradient(circle at 38% 32%,${biome.color}40 0%,rgba(8,4,18,.92) 70%)`,border:`1.5px solid ${onCd?"rgba(255,255,255,.06)":!canAfford?"rgba(245,158,11,.3)":glowColor+"50"}`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",backdropFilter:"blur(4px)"}}>
                  <span style={{fontSize:"clamp(13px,3.6vw,18px)",lineHeight:1,filter:onCd?"grayscale(1) brightness(.35)":!canAfford?"grayscale(.6) brightness(.7)":"none",transition:"filter .2s"}}>{sk.icon}</span>
                  {onCd&&<span style={{fontSize:"clamp(4px,1.1vw,5.5px)",color:"#6b7280",fontWeight:700,marginTop:1}}>CD</span>}
                  {!onCd&&!canAfford&&<span style={{fontSize:"clamp(4px,1.1vw,5.5px)",color:"#f59e0b",fontWeight:700,marginTop:1}}>⚡{energyCost}</span>}
                </div>
                {lv>1&&<div style={{position:"absolute",bottom:-1,right:-1,background:"rgba(0,0,0,.85)",borderRadius:5,padding:"1px 3px",fontSize:"clamp(4px,1.1vw,6px)",color:lv>=3?"#fbbf24":"#c4b5fd",fontWeight:700,lineHeight:1}}>{"★".repeat(lv)}</div>}
                <div style={{position:"absolute",top:-1,left:1,fontSize:"clamp(4px,1vw,5.5px)",color:"rgba(255,255,255,.28)",fontWeight:700}}>{i+1}</div>
              </div>
              <div style={{fontSize:"clamp(4px,1.1vw,6px)",fontWeight:800,color:onCd?"#374151":!canAfford?"#92400e":COLORS.text,whiteSpace:"nowrap",maxWidth:"clamp(40px,11vw,50px)",overflow:"hidden",textOverflow:"ellipsis",textAlign:"center"}}>{sk.name}</div>
            </div>
          );
        })}
        {/* ── Energy bar ── */}
        {(()=>{
          const curEnergy = liveStats.energy ?? ENERGY_MAX;
          const energyPct = curEnergy / ENERGY_MAX;
          const eColor = energyPct>0.6?"#60a5fa":energyPct>0.3?"#f59e0b":"#ef4444";
          return(
            <div style={{display:"flex",flexDirection:"column",gap:2,alignItems:"center",padding:"4px 7px",borderRadius:10,background:"rgba(4,2,12,.75)",border:"1px solid rgba(96,165,250,.2)",backdropFilter:"blur(8px)",flexShrink:0}}>
              <span style={{fontSize:7,color:"rgba(255,255,255,.4)",fontWeight:700,letterSpacing:".06em"}}>⚡ ENERGY</span>
              <div style={{width:40,height:5,borderRadius:99,background:"rgba(0,0,0,.6)",overflow:"hidden",border:"1px solid rgba(255,255,255,.07)"}}>
                <div style={{height:"100%",width:`${energyPct*100}%`,borderRadius:99,background:`linear-gradient(90deg,${eColor},${eColor}cc)`,transition:"width .15s ease-out",boxShadow:`0 0 6px ${eColor}88`}}/>
              </div>
              <span style={{fontSize:7,color:eColor,fontWeight:900}}>{Math.round(curEnergy)}<span style={{color:"rgba(255,255,255,.2)",fontWeight:400}}>/{ENERGY_MAX}</span></span>
            </div>
          );
        })()}
        {/* Strategy + threat pill */}
        {showStrategyBadge&&liveStrategy&&(()=>{
          const th = liveStats.threat||0;
          const tC = th>=4?"#ef4444":th>=3?"#f97316":th>=2?"#fbbf24":th>=1?"#86efac":"rgba(255,255,255,.3)";
          const tL = th>=4?"💀":th>=3?"🔴":th>=2?"🟠":th>=1?"🟡":"✅";
          const stanceMap = {
            ATTACK_COMMIT: {icon:"⚔️",  label:"Strike",  col:"#fbbf24"},
            BLOCK_STANCE:  {icon:"🛡️",  label:"Block",   col:"#93c5fd"},
            PARRY_ATTEMPT: {icon:"⚡",  label:"Parry",   col:"#fde68a"},
            DODGE_STEP:    {icon:"🌀",  label:"Dodge",   col:"#c4b5fd"},
            NONE:          {icon:null,  label:null,      col:null},
          };
          const stance = stanceMap[liveStats.combatStance||"NONE"];
          return(
            <div style={{display:"flex",alignItems:"center",gap:4,pointerEvents:"none",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",padding:"3px 8px",borderRadius:99,background:"rgba(4,2,12,.85)",border:`1px solid ${biome.color}45`,backdropFilter:"blur(8px)",gap:4}}>
                <span style={{fontSize:9}}>{STRATEGIES[liveStrategy]?.icon}</span>
                <span style={{fontSize:"clamp(6px,1.6vw,7.5px)",color:COLORS.text,fontWeight:800}}>{STRATEGIES[liveStrategy]?.label}</span>
                <span style={{fontSize:"clamp(6px,1.5vw,7px)",color:tC}}>{tL}</span>
                {(state.yuyu.battleMemory?.dominantHabit===liveStrategy)&&<span style={{fontSize:6,color:"#fbbf24"}}>★</span>}
              </div>
              {stance.icon&&<div style={{display:"flex",alignItems:"center",padding:"3px 7px",borderRadius:99,background:"rgba(4,2,12,.85)",border:`1px solid ${stance.col}40`,backdropFilter:"blur(8px)",gap:3}}>
                <span style={{fontSize:9}}>{stance.icon}</span>
                <span style={{fontSize:"clamp(6px,1.5vw,7px)",color:stance.col,fontWeight:800}}>{stance.label}</span>
              </div>}
              {liveStats.isSneaking&&<div style={{display:"flex",alignItems:"center",padding:"3px 7px",borderRadius:99,background:"rgba(4,2,12,.9)",border:"1px solid rgba(196,181,253,.45)",backdropFilter:"blur(8px)",gap:3,animation:"livePulse 1s ease-in-out infinite"}}>
                <span style={{fontSize:9}}>🥷</span>
                <span style={{fontSize:"clamp(6px,1.5vw,7px)",color:"#c4b5fd",fontWeight:800}}>SNEAK</span>
              </div>}
            </div>
          );
        })()}
      </div>}

      <LiveChatOverlay state={state} dispatch={dispatch} started={started} onBattleCmd={executeCmd}/>
    </div>
  );
}

// ── LIVE CHAT ──────────────────────────────────────────────────────────────

function LiveChatOverlay({state,dispatch,started,onBattleCmd}){
  const [input,setInput]=useState(""),[loading,setLoading]=useState(false);
  const endRef   = useRef(null), edRef = useRef(null);
  const mounted  = useMounted(); // ← Lyuyu: prevent setState after unmount
  useEffect(()=> {endRef.current?.scrollIntoView({behavior:"smooth"});},[state.chat]);
  const playerName = state.settings?.playerName||state.player.name||"Papa";
  const parseBattleCmd = txt=> {
    const t = txt.toLowerCase();
    if (/\b(dodge|hindari|menghindar|ngelak|elak)\b/.test(t))return"dodge";
    if (/\b(attack|serang|hajar|gebuk|tampar)\b/.test(t))return"attack";
    if (/\b(heal|sembuh|pulihkan|sembuhkan)\b/.test(t))return"heal";
    if (/\b(shield|block|bertahan|pertahan)\b/.test(t))return"shield";
    if (/\b(burst|bom|ledak|star burst)\b/.test(t))return"burst";
    return null;
  };
  const send = async()=> {
    const raw = sanitizeInput(input); // ← Lyuyu: strip XSS before processing
    const txt = raw.trim();
    if (!txt||loading)return;
    dispatch({type:"CHAT",msg:{role:"user",text:txt,isBattle:started}});
    setInput("");
    if (edRef.current)edRef.current.textContent="";
    if (started){const cmd = parseBattleCmd(txt);if (cmd&&onBattleCmd){onBattleCmd({cmd,user:playerName,text:txt});return;}}
    if (state.settings?.chatEnabled===false){ dispatch({type:"CHAT",msg:{role:"yuyu",text:"(chat dimatikan di Settings~)"}});return; }
    setLoading(true);
    try {
      const pb        = getPrestBonus(state.yuyu.prestige || 0);
      const lastBattle = state.battleLog.result
        ? `Battle terakhir: ${state.battleLog.result === "win" ? "MENANG" : "KALAH"}, ${state.battleLog.kills} kill.`
        : "Belum battle.";
      const situation = started
        ? " Yuyu sedang BATTLE aktif! Balas super singkat, kayak streamer live."
        : " Yuyu istirahat di survival camp.";
      const trend     = getBattlePerformanceTrend(state.yuyu.resultHistory || []);
      const trendHint = getPerformanceTrendContext(trend, playerName);

      // ── Rich layered system prompt (Lyuyu-style context builder) ──
      const sys = [
        `Kamu Yuyu, hero cubic manja tapi semangat. Fighter dengan kedalaman emosi — bukan mascot.`,
        `Pemain: ${playerName}. HP ${Math.round(state.yuyu.hp||0)}/${state.yuyu.maxHp}, Gold ${state.player.gold}, Stage ${state.world.stage}, Prestige ${state.yuyu.prestige||0}, Mood: ${state.yuyu.mood}.`,
        `DMG Mult: x${pb.dmgMult.toFixed(1)}. ${lastBattle}${situation}`,
        trendHint ? `Tren performa: ${trendHint}` : "",
        (state.yuyu.suppressedLayer||[]).length >= 2
          ? `Ada sesuatu yang Yuyu tahan: "${(state.yuyu.suppressedLayer||[])[0]?.text||""}". Mungkin bocor tipis.`
          : "",
        `Balas 1-2 kalimat Bahasa Indonesia. Mood berubah? tulis [MOOD:xxx] di akhir.`,
      ].filter(Boolean).join(" ");

      // Build conversation history (last 4 exchanges)
      const msgs = [
        ...state.chat.slice(-4).map(m => ({
          role   : m.role === "user" ? "user" : "assistant",
          content: m.text,
        })),
        { role: "user", content: txt },
      ];

      // Use raw fetch for multi-turn (callClaudeWithRetry is single-turn)
      const res  = await fetch("https://api.anthropic.com/v1/messages", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 200, system: sys, messages: msgs }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error?.message || "API error");

      let reply = data.content?.[0]?.text || "...";

      // Parse mood shift signal [MOOD:xxx]
      const mm = reply.match(/\[MOOD:(\w+)\]/);
      if (mm) {
        const validMoods = new Set(Object.keys({ excited:1, happy:1, tired:1, hurt:1, nervous:1, proud:1, determined:1 }));
        if (validMoods.has(mm[1])) dispatch({ type: "SET_MOOD", mood: mm[1] });
        reply = reply.replace(/\[MOOD:\w+\]/g, "").trim();
      }

      // Only update state if still mounted (Lyuyu useMounted pattern)
      if (mounted.current) {
        dispatch({ type: "CHAT", msg: { role: "yuyu", text: reply, isBattle: started } });
        YuyuVoice.speak(reply, state.settings || DEFAULT_SETTINGS);
      }
    } catch (e) {
      if (mounted.current) {
        dispatch({ type: "CHAT", msg: { role: "yuyu", text: "Eh ada yang aneh~" } });
      }
    }
    if (mounted.current) setLoading(false);
  };
  const recent = state.chat.slice(-6);
  const accentColor = started?"rgba(236,72,153,.6)":"rgba(124,58,237,.6)";
  return(
    <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:11}}>
      {/* Gradient fade */}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(0deg,rgba(4,2,12,.98) 0%,rgba(4,2,12,.85) 55%,transparent 100%)",pointerEvents:"none"}}/>
      {/* Messages */}
      <div style={{position:"relative",padding:"0 12px",maxHeight:"clamp(75px,13vh,108px)",overflowY:"auto",scrollbarWidth:"none",display:"flex",flexDirection:"column",gap:3,justifyContent:"flex-end",paddingBottom:4}}>
        {recent.length===0&&<div style={{fontSize:"clamp(7px,1.9vw,9px)",color:"rgba(255,255,255,.2)",textAlign:"center",padding:"6px 0",letterSpacing:".06em"}}>{started?"💬 ketik perintah battle...":"💬 ngobrol sama Yuyu~"}</div>}
        {recent.map((m,i)=> (
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:5,animation:"chatIn .2s ease-out"}}>
            {m.role==="system"
              ?<div style={{width:"100%",textAlign:"center",padding:"2px 8px"}}>
                <span style={{fontSize:"clamp(6px,1.7vw,8px)",color:"rgba(255,255,255,.3)",fontStyle:"italic",letterSpacing:".03em"}}>{m.text}</span>
               </div>
              :<>
                <div style={{flexShrink:0,padding:"1px 6px",borderRadius:99,background:m.role==="yuyu"?"rgba(124,58,237,.2)":started?"rgba(236,72,153,.15)":"rgba(59,130,246,.15)",border:`1px solid ${m.role==="yuyu"?"rgba(124,58,237,.35)":started?"rgba(236,72,153,.3)":"rgba(59,130,246,.3)"}`,marginTop:1}}>
                  <span style={{fontSize:"clamp(6px,1.6vw,8px)",fontWeight:800,color:m.role==="yuyu"?"#c4b5fd":started?"#f9a8d4":"#93c5fd",lineHeight:1.5,whiteSpace:"nowrap"}}>{m.role==="yuyu"?"Yuyu":playerName}</span>
                </div>
                <span style={{fontSize:"clamp(7px,2vw,9.5px)",color:"rgba(255,255,255,.88)",lineHeight:1.5,wordBreak:"break-word",minWidth:0}}>{m.text}</span>
              </>}
          </div>
        ))}
        {loading&&<div style={{display:"flex",gap:4,padding:"2px 0",alignItems:"center"}}>
          <div style={{padding:"1px 6px",borderRadius:99,background:"rgba(124,58,237,.2)",border:"1px solid rgba(124,58,237,.3)"}}>
            <span style={{fontSize:"clamp(6px,1.6vw,8px)",color:"#c4b5fd",fontWeight:800}}>Yuyu</span>
          </div>
          <div style={{display:"flex",gap:3,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:4,height:4,borderRadius:"50%",background:"#a78bfa",animation:`dot 1s ${i*.18}s ease-in-out infinite`}}/>)}</div>
        </div>}
        <div ref={endRef}/>
      </div>
      {/* Input row */}
      <div style={{position:"relative",padding:"6px 10px clamp(10px,2.5vh,16px)",display:"flex",gap:6,alignItems:"center"}}>
        <div style={{flex:1,position:"relative"}}>
          <div ref={edRef} contentEditable suppressContentEditableWarning
            onInput={e=>setInput(e.currentTarget.textContent)}
            onKeyDown={e=> {if (e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();if (edRef.current)edRef.current.textContent="";}}}
            data-ph={started?"ketik perintah battle...":"ngobrol sama Yuyu..."}
            style={{
              minHeight:"clamp(30px,7.5vh,36px)",maxHeight:56,
              padding:"6px clamp(10px,2.5vw,12px)",
              borderRadius:20,
              background:"rgba(255,255,255,.06)",
              border:`1px solid ${started?"rgba(236,72,153,.2)":"rgba(124,58,237,.2)"}`,
              color:"rgba(255,255,255,.9)",fontSize:"clamp(9px,2.4vw,11px)",
              outline:"none",overflowY:"auto",lineHeight:1.5,
              boxShadow:`inset 0 1px 3px rgba(0,0,0,.4),0 0 0 0 ${accentColor}`,
              transition:"border-color .2s,box-shadow .2s",
            }}/>
        </div>
        <button onClick={()=> {send();if (edRef.current)edRef.current.textContent="";}}
          style={{
            width:"clamp(32px,8vw,38px)",height:"clamp(32px,8vw,38px)",
            borderRadius:12,flexShrink:0,
            background:started
              ?"linear-gradient(135deg,#be185d,#7c3aed)"
              :"linear-gradient(135deg,#4c1d95,#7c3aed)",
            border:"none",color:"#fff",
            fontSize:"clamp(13px,3.2vw,16px)",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 4px 14px ${started?"rgba(190,24,93,.4)":"rgba(124,58,237,.4)"}`,
          }}>➤</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UPGRADE SHEET
// ─────────────────────────────────────────────────────────────────────────────

function UpgradeSheet({ state, dispatch, onAscend }) {
  const [tab, setTab] = useState("profile");
  const eStats   = getEffectiveStats(state.yuyu);
  const ascReady = isAscensionReady(state.yuyu);
  const pb       = getPrestBonus(state.yuyu.prestige || 0);
  const levelMult = getLevelMult(state.yuyu.level || 1);
  const atkDmg   = Math.round((8 + eStats.str * 6) * pb.dmgMult * levelMult);
  const atkCdMs  = Math.max(200, 1300 - eStats.spd * 40);
  const dps      = (atkDmg / (atkCdMs / 1000)).toFixed(1);
  const mem      = state.yuyu.battleMemory || INIT_BATTLE_MEMORY;

  const STAT_META = {
    str:  { icon:"⚔️", name:"STR", color:"#ef4444", desc:"ATK per hit" },
    def:  { icon:"🛡️", name:"DEF", color:"#3b82f6", desc:"damage mitigasi" },
    spd:  { icon:"⚡", name:"SPD", color:"#f59e0b", desc:"kecepatan gerak & atk" },
    hp:   { icon:"❤️", name:"HP",  color:"#10b981", desc:"max HP" },
    luck: { icon:"🍀", name:"LUCK",color:"#8b5cf6", desc:"gold & crit bonus" },
  };

  const TABS = [
    { id:"profile", icon:"🌸", label:"Profil" },
    { id:"combat",  icon:"⚔️", label:"Combat" },
    { id:"skills",  icon:"✨", label:"Skill" },
    { id:"equip",   icon:"🎒", label:"Gear" },
    { id:"prestige",icon:"⭐", label:"Prestige", dot: ascReady },
    { id:"codex",   icon:"📖", label:"Codex" },
  ];

  const CODEX = [
    { id:"slime",   emoji:"🟢", bio:"Monster dasar. Lambat tapi gigih.",          tip:"Mudah di-kite, kill duluan sebelum yang lain." },
    { id:"spike",   emoji:"🟠", bio:"Diam di tempat, lempar duri damage tinggi.", tip:"Dekati dari sisi — jangan frontal." },
    { id:"dash",    emoji:"🔴", bio:"Super cepat, sprint tanpa henti.",           tip:"Ice Blast counter terbaik." },
    { id:"tank",    emoji:"🟤", bio:"Lambat, HP besar, armor tebal.",             tip:"STR + Berserker buat perpendek durasi." },
    { id:"phantom", emoji:"🟣", bio:"Hantu bisa teleport acak.",                  tip:"Thunder Strike + stun adalah counter terbaik." },
    { id:"golem",   emoji:"⚫", bio:"Golem batu, HP tertinggi non-boss.",         tip:"Heal Pulse + Lifesteal wajib aktif." },
    { id:"boss",    emoji:"👑", bio:"Boss muncul tiap 5 stage.",                  tip:"Pastikan HP full sebelum mulai." },
    { id:"megaboss",emoji:"💀", bio:"MEGA BOSS tiap 10 stage. Ancaman terbesar.", tip:"Maxkan build + Prestige bonus." },
  ];

  const moodDesc = {
    excited:"Bersemangat banget, siap ngehajar~", happy:"Senang dan rileks",
    proud:"Bangga sama dirinya sendiri", determined:"Fokus total, gak bisa diganggu",
    hurt:"Lagi kesakitan tapi tetap berdiri", tired:"Kecapean, butuh istirahat",
    nervous:"Sedikit gugup tapi tetap jalan",
  };

  const TabBtn = ({id,icon,label,dot}) => (
    <button onClick={()=>setTab(id)} style={{
      flex:"0 0 auto", padding:"6px 10px", borderRadius:9, fontSize:"clamp(7px,1.9vw,8.5px)",
      letterSpacing:".05em", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", position:"relative",
      background:tab===id?"linear-gradient(135deg,rgba(124,58,237,.45),rgba(236,72,153,.25))":"transparent",
      border:`1px solid ${tab===id?"rgba(124,58,237,.5)":"transparent"}`,
      color:tab===id?"#e9d5ff":COLORS.muted, fontWeight:tab===id?800:600, transition:"all .15s",
    }}>
      {dot&&<span style={{position:"absolute",top:2,right:2,width:6,height:6,borderRadius:"50%",background:"#fbbf24",boxShadow:"0 0 6px #f59e0b"}}/>}
      {icon} {label}
    </button>
  );

  return (
    <div style={{padding:"0 16px"}}>

      {/* Header — Yuyu identity card */}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"4px 0 14px",borderBottom:"1px solid rgba(255,255,255,.06)",marginBottom:12}}>
        <YuyuAvatar mood={state.yuyu.mood||"happy"} size={56} prestige={state.yuyu.prestige||0}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:16,fontWeight:900,color:COLORS.text,lineHeight:1.2}}>Yuyu</div>
          <div style={{fontSize:8,color:"rgba(255,255,255,.4)",marginTop:2,display:"flex",alignItems:"center",gap:4}}>
            Lv.{state.yuyu.level} · Stage {state.world.stage}
            {state.yuyu.prestige>0 ? <PrestigeBadge prestige={state.yuyu.prestige}/> : <span> · No Prestige</span>}
          </div>
          <div style={{fontSize:7.5,color:"#c4b5fd",marginTop:3,fontStyle:"italic"}}>{moodDesc[state.yuyu.mood||"happy"]}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:13,color:"#fbbf24",fontWeight:900}}>🪙 {state.player.gold}</div>
          <div style={{fontSize:7,color:COLORS.muted,marginTop:2}}>💀 {state.player.deaths||0} mati</div>
          <div style={{fontSize:7,color:COLORS.muted}}>⚔️ {state.player.totalKills||0} kills</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:2,background:"rgba(255,255,255,.04)",borderRadius:12,padding:3,marginBottom:14,overflowX:"auto",scrollbarWidth:"none"}}>
        {TABS.map(t=><TabBtn key={t.id} {...t}/>)}
      </div>

      {/* ══ PROFIL ══ */}
      {tab==="profile"&&(()=>{
        const nextLvXp = state.yuyu.level*100;
        const xpPct = Math.min(1,(state.yuyu.xp||0)/nextLvXp);
        const statCosts = {str:50,def:40,spd:60,hp:45,luck:35};
        const nextUpgrades = Object.entries(STAT_META).map(([id,meta])=>{
          const lv = state.yuyu.stats[id];
          if (lv>=MAX_STAT) return null;
          const cost = statCosts[id]*lv;
          return {id,meta,lv,cost,canAfford:state.player.gold>=cost};
        }).filter(Boolean);
        const cheapest = nextUpgrades.sort((a,b)=>a.cost-b.cost)[0];
        const winRate = (()=>{
          const hist = state.yuyu.resultHistory||[];
          if (!hist.length) return null;
          const wins = hist.filter(r=>r==="win").length;
          return Math.round(wins/hist.length*100);
        })();
        return (<>
          <div style={{fontSize:7.5,color:COLORS.muted,letterSpacing:".12em",fontWeight:700,marginBottom:8}}>STATUS YUYU</div>
          <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
            {Object.entries(STAT_META).map(([id,meta])=>{
              const lv=state.yuyu.stats[id],eff=eStats[id],pct=lv/MAX_STAT,maxed=lv>=MAX_STAT;
              const cost=statCosts[id]*lv;
              const STAT_EFFECT = {
                str:`ATK/hit: ${Math.round((8+eff*6)*pb.dmgMult*getLevelMult(state.yuyu.level||1))}`,
                def:`Damage kurang: -${eff*2} per hit`,
                spd:`Move spd: ${55+eff*9} | Atk CD: ${Math.max(200,1300-eff*40)}ms`,
                hp:`Max HP: ${state.yuyu.maxHp}`,
                luck:`Gold bonus: +${eff} tiap kill`,
              };
              return(
                <div key={id}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                    <span style={{fontSize:14,width:22,textAlign:"center",flexShrink:0}}>{meta.icon}</span>
                    <div style={{width:38,flexShrink:0}}>
                      <div style={{fontSize:8.5,fontWeight:800,color:meta.color}}>{meta.name}</div>
                    </div>
                    <div style={{flex:1,position:"relative",height:8,borderRadius:99,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
                      <div style={{position:"absolute",inset:0,width:`${pct*100}%`,borderRadius:99,
                        background:maxed?`linear-gradient(90deg,${meta.color},#fbbf24)`:meta.color,
                        transition:"width .4s ease-out",boxShadow:maxed?`0 0 6px ${meta.color}88`:undefined}}/>
                      {maxed&&<div style={{position:"absolute",top:0,bottom:0,width:"30%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent)",animation:"shimmer 2s ease-in-out infinite"}}/>}
                    </div>
                    <div style={{width:60,textAlign:"right",flexShrink:0}}>
                      <span style={{fontSize:11,fontWeight:900,color:maxed?"#fbbf24":meta.color}}>{maxed?"MAX":lv}</span>
                      {eff>lv&&<span style={{fontSize:7,color:"#fbbf24",marginLeft:3}}>({eff})</span>}
                      {!maxed&&<div style={{fontSize:6,color:COLORS.muted}}>🪙{cost}</div>}
                    </div>
                  </div>
                  <div style={{paddingLeft:30,fontSize:7,color:"rgba(255,255,255,.35)",marginBottom:1}}>{STAT_EFFECT[id]}</div>
                </div>
              );
            })}
          </div>

          {/* XP bar */}
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:7.5,color:COLORS.muted}}>
              <span>⬆️ Level {state.yuyu.level} XP</span>
              <span style={{color:"#a78bfa"}}>{state.yuyu.xp||0} / {nextLvXp}</span>
            </div>
            <div style={{height:6,borderRadius:99,background:"rgba(255,255,255,.06)",overflow:"hidden"}}>
              <div style={{height:"100%",width:`${xpPct*100}%`,borderRadius:99,background:"linear-gradient(90deg,#7c3aed,#a78bfa)",transition:"width .3s"}}/>
            </div>
            <div style={{fontSize:7,color:"rgba(255,255,255,.3)",marginTop:3}}>
              Level {state.yuyu.level+1} reward: +5 max HP{(state.yuyu.level+1)%3===0?" + free stat boost":""}
            </div>
          </div>

          {/* Next affordable upgrade hint */}
          {cheapest&&<div style={{padding:"9px 12px",borderRadius:12,background:"rgba(16,185,129,.07)",border:"1px solid rgba(16,185,129,.2)",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:13}}>{cheapest.meta.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:8,fontWeight:800,color:"#34d399"}}>Upgrade berikutnya</div>
              <div style={{fontSize:7.5,color:"rgba(255,255,255,.55)"}}>{cheapest.meta.name} Lv.{cheapest.lv} → {cheapest.lv+1}</div>
            </div>
            <div style={{fontSize:10,fontWeight:900,color:cheapest.canAfford?"#fbbf24":"#6b7280"}}>🪙{cheapest.cost}</div>
          </div>}

          {/* Battle history + win rate */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:12}}>
            {[
              {label:"Battles",  val:mem.totalBattles||0,        icon:"⚔️",color:"#c4b5fd"},
              {label:"Win Rate", val:winRate!=null?`${winRate}%`:"-", icon:"📈",color:winRate!=null&&winRate>=60?"#34d399":winRate!=null&&winRate<40?"#f87171":"#fbbf24"},
              {label:"Win Streak",val:mem.consecutiveWins||0,    icon:"🔥",color:"#fbbf24"},
              {label:"Best Stage",val:state.world.highestStage||0,icon:"🏆",color:"#34d399"},
              {label:"Kills",     val:state.player.totalKills||0, icon:"💀",color:"#f87171"},
              {label:"Kematian",  val:state.player.deaths||0,     icon:"🪦",color:"#9ca3af"},
            ].map(s=>(
              <div key={s.label} style={{padding:"10px 8px",borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",textAlign:"center"}}>
                <div style={{fontSize:13}}>{s.icon}</div>
                <div style={{fontSize:12,fontWeight:900,color:s.color,lineHeight:1.2,marginTop:3}}>{s.val}</div>
                <div style={{fontSize:6.5,color:COLORS.muted,marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>

          {(state.yuyu.resultHistory||[]).length>0&&(
            <div style={{marginBottom:12}}>
              <div style={{fontSize:7.5,color:COLORS.muted,letterSpacing:".12em",fontWeight:700,marginBottom:6}}>10 BATTLE TERAKHIR</div>
              <div style={{display:"flex",gap:4}}>
                {(state.yuyu.resultHistory||[]).slice(-10).map((r,i)=>(
                  <div key={i} title={r} style={{width:18,height:18,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,
                    background:r==="win"?"rgba(16,185,129,.2)":r==="lose"?"rgba(239,68,68,.2)":"rgba(245,158,11,.15)",
                    border:`1px solid ${r==="win"?"rgba(16,185,129,.4)":r==="lose"?"rgba(239,68,68,.35)":"rgba(245,158,11,.3)"}`,
                    color:r==="win"?"#34d399":r==="lose"?"#f87171":"#fbbf24"}}>
                    {r==="win"?"W":r==="lose"?"L":"R"}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{padding:"10px 12px",borderRadius:12,background:"rgba(124,58,237,.08)",border:"1px solid rgba(124,58,237,.18)"}}>
            <div style={{fontSize:7.5,color:"#c4b5fd",fontWeight:700,marginBottom:3}}>💡 Yuyu upgrade otomatis setelah setiap win</div>
            <div style={{fontSize:7.5,color:"rgba(255,255,255,.45)",lineHeight:1.5}}>
              {(state.yuyu.prestige||0)>=1?"Post-ascension: Yuyu belanja sepuasnya — no reserve~":
                state.player.gold >= 5000 ? "Yuyu kaya! Reserve cuma 5% — habisin aja! 😤" :
                state.player.gold >= 2000 ? "Reserve 10% — Yuyu makin berani belanja!" :
                state.player.gold >= 500  ? "Reserve 15% — nabung sedikit dulu~" :
                "Reserve 25% — lagi hemat, gold masih tipis."}
            </div>
          </div>
        </>);
      })()}

      {/* ══ COMBAT ══ */}
      {tab==="combat"&&(()=>{
        const wRange = getWeaponRange(state.yuyu.equipment?.weapon||"ironSword");
        const ttk = (()=>{
          // Time-to-kill a typical stage monster — hp≈30+stage×8, ATK = atkDmg
          const monsterHp = 30 + state.world.stage * 8;
          const hitsNeeded = Math.ceil(monsterHp / Math.max(1, atkDmg));
          return ((hitsNeeded * atkCdMs) / 1000).toFixed(1);
        })();
        const hasAscended2 = (state.yuyu.prestige||0)>=1;
        return (<>
          <div style={{fontSize:7.5,color:COLORS.muted,letterSpacing:".12em",fontWeight:700,marginBottom:8}}>COMBAT STATS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:14}}>
            {[
              {label:"ATK/hit", val:atkDmg,               color:"#ef4444",icon:"⚔️", tip:"dmg per serangan"},
              {label:"DPS",     val:dps,                   color:"#f97316",icon:"💥", tip:"damage per detik"},
              {label:"Atk CD",  val:`${atkCdMs}ms`,        color:"#fbbf24",icon:"⏱",  tip:"jeda antar serangan"},
              {label:"DEF red", val:`-${eStats.def*2}/hit`, color:"#3b82f6",icon:"🛡️", tip:"pengurangan damage"},
              {label:"SPD",     val:`${55+eStats.spd*9}`,  color:"#f59e0b",icon:"⚡", tip:"kecepatan gerak"},
              {label:"Max HP",  val:state.yuyu.maxHp,      color:"#10b981",icon:"❤️", tip:"total HP"},
              {label:"Atk Range",val:`${wRange.atk}px`,   color:"#c4b5fd",icon:"📏", tip:wRange.style==="ranged"?"Ranged weapon":"Melee weapon"},
              {label:"TTK",     val:`${ttk}s`,             color:"#34d399",icon:"⏳", tip:`bunuh musuh stage ${state.world.stage}`},
            ].map(s=>(
              <div key={s.label} style={{padding:"10px 8px",borderRadius:12,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",textAlign:"center"}}>
                <div style={{fontSize:13}}>{s.icon}</div>
                <div style={{fontSize:12,fontWeight:900,color:s.color,lineHeight:1.2,marginTop:3}}>{s.val}</div>
                <div style={{fontSize:6.5,color:COLORS.muted,marginTop:2}}>{s.label}</div>
                <div style={{fontSize:5.5,color:"rgba(255,255,255,.2)",marginTop:1}}>{s.tip}</div>
              </div>
            ))}
          </div>

          {/* Prestige bonus pill */}
          {hasAscended2&&<div style={{padding:"8px 12px",borderRadius:10,background:"rgba(124,58,237,.1)",border:"1px solid rgba(124,58,237,.25)",marginBottom:12,display:"flex",gap:12,fontSize:7.5,color:"#c4b5fd",justifyContent:"center"}}>
            <span>⚔️ DMG ×{pb.dmgMult.toFixed(2)}</span>
            <span>❤️ HP ×{pb.hpMult.toFixed(2)}</span>
            <span>🪙 Gold ×{pb.goldMult.toFixed(2)}</span>
            {(state.yuyu.momentumStreak||0)>0&&<span>⚡ Momentum +{Math.min(5,state.yuyu.momentumStreak)*3}%</span>}
          </div>}

          {/* Weapon style indicator */}
          <div style={{padding:"9px 12px",borderRadius:12,marginBottom:12,display:"flex",alignItems:"center",gap:10,
            background:wRange.style==="ranged"?"rgba(37,99,235,.1)":"rgba(220,38,38,.08)",
            border:`1px solid ${wRange.style==="ranged"?"rgba(37,99,235,.35)":"rgba(220,38,38,.25)"}`}}>
            <span style={{fontSize:18}}>{wRange.style==="ranged"?"🏹":"⚔️"}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:8.5,fontWeight:800,color:wRange.style==="ranged"?"#93c5fd":"#fca5a5"}}>
                {wRange.style==="ranged"?"Ranged Weapon — Yuyu menjaga jarak":"Melee Weapon — Yuyu mendekati musuh"}
              </div>
              <div style={{fontSize:7,color:"rgba(255,255,255,.4)",marginTop:2}}>
                {wRange.style==="ranged"
                  ?`Serangan dari ${wRange.preferred}px, AoE skill tetap efektif dari jarak aman`
                  :`Bergerak ke dalam ${wRange.atk}px, menekan musuh langsung`}
              </div>
            </div>
          </div>

          <div style={{fontSize:7.5,color:COLORS.muted,letterSpacing:".12em",fontWeight:700,marginBottom:8}}>🧠 BATTLE INTELLIGENCE</div>
          <div style={{padding:"12px 14px",borderRadius:14,background:"linear-gradient(135deg,rgba(124,58,237,.1),rgba(236,72,153,.06))",border:"1px solid rgba(124,58,237,.2)",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:7.5,color:COLORS.muted}}>
              <span>{mem.totalBattles||0} battles total</span>
              {mem.dominantHabit&&<span style={{color:"#fbbf24"}}>★ Habit: {STRATEGIES[mem.dominantHabit]?.label}</span>}
            </div>
            {(mem.totalSneaks||0)>0&&<div style={{display:"flex",gap:8,marginBottom:8,fontSize:7,color:"#c4b5fd"}}>
              <span>🥷 {mem.totalSneaks} sneak hits</span>
              <span>⚡ {(mem.sneakStunTotal||0).toFixed(1)}s stun dealt</span>
              <span style={{color:mem.totalSneaks>=15?"#fbbf24":mem.totalSneaks>=10?"#c4b5fd":"rgba(255,255,255,.4)"}}>
                Sneak Lv.{Math.min(3,Math.floor((mem.totalSneaks||0)/5))} {mem.totalSneaks>=15?"👑":mem.totalSneaks>=10?"⚡":mem.totalSneaks>=5?"🥷":""}
              </span>
            </div>}
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {[...STRAT_IDS].sort((a,b)=>(mem.strategyScores[b]||0)-(mem.strategyScores[a]||0)).slice(0,5).map(k=>{
                const isDom=mem.dominantHabit===k;
                return(
                  <div key={k} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 8px",borderRadius:99,
                    background:isDom?"rgba(245,158,11,.18)":"rgba(255,255,255,.05)",
                    border:`1px solid ${isDom?"rgba(245,158,11,.5)":"rgba(255,255,255,.1)"}`}}>
                    <span style={{fontSize:9}}>{STRATEGIES[k]?.icon}</span>
                    <span style={{fontSize:7,color:isDom?"#fbbf24":COLORS.muted,fontWeight:700}}>{STRATEGIES[k]?.label}</span>
                    <span style={{fontSize:6.5,color:"rgba(255,255,255,.25)"}}>{mem.strategyScores[k]||0}</span>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:8,fontSize:7,color:"rgba(255,255,255,.3)",lineHeight:1.5}}>
              Score = seberapa sering strategi ini berhasil. Yuyu pilih berdasarkan situasi — score besar = strategi favorit.
            </div>
          </div>

          <div style={{fontSize:7.5,color:COLORS.muted,letterSpacing:".12em",fontWeight:700,marginBottom:8}}>SKILL TERSEDIA ({(state.yuyu.unlockedSkills||[]).length})</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {(state.yuyu.unlockedSkills||[]).map(sid=>{
              const sk=SKILLS[sid];if(!sk)return null;
              const lv=getSkillLv(state.yuyu,sid),tc=sk.type==="active"?"#60a5fa":"#a78bfa";
              const mech=SKILL_MECHANICS[sid];
              const ec=sk.energy||0;
              return(
                <div key={sid} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 10px",borderRadius:12,background:`${tc}12`,border:`1px solid ${tc}35`,flex:"1 0 140px"}}>
                  <span style={{fontSize:16}}>{sk.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:8.5,fontWeight:800,color:COLORS.text}}>{sk.name}</div>
                    <div style={{display:"flex",gap:1,marginTop:1}}>{[1,2,3].map(i=><span key={i} style={{fontSize:7,color:i<=lv?"#fbbf24":"rgba(255,255,255,.1)"}}>{i<=lv?"★":"☆"}</span>)}</div>
                    {ec>0&&<div style={{fontSize:6,color:"#93c5fd",marginTop:1}}>⚡ {ec} energy</div>}
                    {mech&&<div style={{fontSize:6.5,color:"rgba(255,255,255,.3)",marginTop:1}}>{mech.note}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </>);
      })()}

      {/* ══ SKILLS ══ — rich monitor */}
      {tab==="skills"&&(()=>{
        const eStats2 = getEffectiveStats(state.yuyu);
        const str2 = eStats2.str||1;
        const SKILL_EXPLAIN = {
          starBurst   : lv=> `AoE ${SKILLS.starBurst.dmg[lv-1]+str2*7} dmg · Yuyu pakai saat ≥2 musuh mendekat`,
          healPulse   : lv=> `Sembuh ${SKILLS.healPulse.healBase[lv-1]+eStats2.def*SKILLS.healPulse.healDef[lv-1]} HP · Yuyu pakai otomatis saat HP kritis`,
          shieldCube  : lv=> `Blok ${SKILLS.shieldCube.blocks[lv-1]} serangan · Pakai saat HP rendah dan musuh menyerang`,
          speedRush   : lv=> `2× SPD selama ${SKILLS.speedRush.dur[lv-1]/1000}s · Kabur atau ngejar`,
          thunderStrike:lv=> `${SKILLS.thunderStrike.dmg[lv-1]+str2*SKILLS.thunderStrike.strMult[lv-1]} dmg + stun all · Best vs boss`,
          iceBlast    : lv=> `Freeze ${SKILLS.iceBlast.dur[lv-1]/1000}s + ${SKILLS.iceBlast.iceDmg[lv-1]} dmg all · Pernapasan ekstra`,
          flashStep   : lv=> `Dash + ${SKILLS.flashStep.dmg[lv-1]+str2*(lv>=3?2:1)} dmg · Pakai saat musuh hampir mati`,
          battleCry   : lv=> `+${str2*SKILLS.battleCry.atkBonus[lv-1]} ATK selama ${SKILLS.battleCry.dur[lv-1]/1000}s · Best sebelum burst`,
          timeWarp    : lv=> `Lambat ${SKILLS.timeWarp.slow[lv-1]*100}% selama ${SKILLS.timeWarp.dur[lv-1]/1000}s · Escape + CC`,
          spiritBomb  : lv=> `Charge 1.5s → ${SKILLS.spiritBomb.dmg[lv-1]+str2*SKILLS.spiritBomb.strMult[lv-1]} dmg AoE · Hanya saat aman`,
          thorns      : lv=> `Balik ${eStats2.def*SKILLS.thorns.defMult[lv-1]} dmg tiap kena pukul (passive)`,
          regen       : lv=> `+${SKILLS.regen.rate[lv-1]} HP/s pasif (passive)`,
          berserker   : lv=> `+${str2*SKILLS.berserker.strBonus[lv-1]} ATK saat HP<30% (passive)`,
          goldSense   : lv=> `+${eStats2.luck*SKILLS.goldSense.luckMult[lv-1]} gold extra/kill (passive)`,
          lifesteal   : lv=> `Drain ${str2*SKILLS.lifesteal.strMult[lv-1]} HP/hit (passive)`,
          critStrike  : lv=> `${SKILLS.critStrike.chance[lv-1]*100}% crit ×${lv>=3?2.5:2} dmg (passive)`,
          barrier     : lv=> `+${eStats2.def*SKILLS.barrier.defMult[lv-1]} HP/s saat hidup (passive)`,
          guardian    : lv=> `Kurangi -${eStats2.def*SKILLS.guardian.defMult[lv-1]} dmg per hit (passive)`,
          venomStrike : lv=> `Racun ${SKILLS.venomStrike.rate[lv-1]} dmg/s selama ${SKILLS.venomStrike.dur[lv-1]}s (passive)`,
          mirrorImage : lv=> `${SKILLS.mirrorImage.chance[lv-1]*100}% dodge + balik dmg (passive)`,
          lastStand   : lv=> `+${str2*SKILLS.lastStand.strBonus[lv-1]} ATK saat HP<15% (passive)`,
          chainReact  : lv=> `Kill → splash ${str2*SKILLS.chainReact.strMult[lv-1]} ke sekitar (passive)`,
        };
        return (<>
          <div style={{padding:"10px 12px",borderRadius:12,background:"rgba(124,58,237,.08)",border:"1px solid rgba(124,58,237,.18)",marginBottom:12}}>
            <div style={{fontSize:8,color:"#c4b5fd",fontWeight:700,marginBottom:3}}>⚡ Semua skill unlock langsung tersedia — dipakai pakai energi</div>
            <div style={{fontSize:7.5,color:"rgba(255,255,255,.45)",lineHeight:1.5}}>
              Tidak ada slot equip. Yuyu bisa pakai skill apapun yang sudah unlock, tapi setiap skill butuh energi. Energi regen +{ENERGY_REGEN}/detik dan +{ENERGY_KILL} per kill. Skill yang dipakai saat energi kurang tetap jalan — tapi efeknya berkurang.
            </div>
          </div>

          <div style={{fontSize:7.5,color:COLORS.muted,letterSpacing:".12em",fontWeight:700,marginBottom:8}}>
            SKILL TERSEDIA ({(state.yuyu.unlockedSkills||[]).length})
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
            {(state.yuyu.unlockedSkills||[]).map(sid=>{
              const sk=SKILLS[sid];if(!sk)return null;
              const lv=getSkillLv(state.yuyu,sid);
              const tc=sk.type==="active"?"#60a5fa":"#a78bfa";
              const explain=SKILL_EXPLAIN[sid]?.(lv)||sk.desc[lv-1];
              const nextLv=lv<3?lv+1:null;
              const upgCost=skillUpgradeCost(lv);
              const energyCost=sk.energy||0;
              return(
                <div key={sid} style={{padding:"11px 12px",borderRadius:14,
                  background:"linear-gradient(135deg,rgba(124,58,237,.12),rgba(196,181,253,.03))",
                  border:"1.5px solid rgba(124,58,237,.3)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <div style={{width:34,height:34,borderRadius:9,background:`${tc}20`,border:`1.5px solid ${tc}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{sk.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:10,fontWeight:900,color:COLORS.text}}>{sk.name}</span>
                        <div style={{display:"flex",gap:2}}>{[1,2,3].map(i=><span key={i} style={{fontSize:8,color:i<=lv?"#fbbf24":"rgba(255,255,255,.1)"}}>{i<=lv?"★":"☆"}</span>)}</div>
                      </div>
                      <div style={{display:"flex",gap:5,marginTop:3,flexWrap:"wrap"}}>
                        <span style={{fontSize:6.5,padding:"1px 6px",borderRadius:99,background:`${tc}20`,border:`1px solid ${tc}35`,color:tc,fontWeight:700}}>{sk.type}</span>
                        {sk.type==="active"&&<span style={{fontSize:6.5,color:"rgba(255,255,255,.35)"}}>CD: {sk.cd/1000}s</span>}
                        {energyCost>0&&<span style={{fontSize:6.5,padding:"1px 6px",borderRadius:99,background:"rgba(96,165,250,.12)",border:"1px solid rgba(96,165,250,.3)",color:"#93c5fd",fontWeight:700}}>⚡ {energyCost} energy</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize:7.5,color:"rgba(255,255,255,.65)",lineHeight:1.5,marginBottom:nextLv?6:0}}>{explain}</div>
                  {nextLv&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 8px",borderRadius:8,background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)"}}>
                    <div style={{fontSize:7,color:"rgba(255,255,255,.5)"}}>Lv.{nextLv}: <span style={{color:"rgba(255,255,255,.7)"}}>{sk.desc[nextLv-1]}</span></div>
                    <span style={{fontSize:8,fontWeight:800,color:state.player.gold>=(upgCost||0)?"#fbbf24":"#6b7280"}}>🪙{upgCost}</span>
                  </div>}
                </div>
              );
            })}
          </div>

          <div style={{fontSize:7.5,color:COLORS.muted,letterSpacing:".12em",fontWeight:700,marginBottom:6}}>🔒 BELUM TERBUKA</div>
          <div style={{display:"flex",flexDirection:"column",gap:3}}>
            {Object.entries(SKILLS).filter(([sid])=>!(state.yuyu.unlockedSkills||[]).includes(sid)).map(([sid,sk])=>{
              const u=sk.unlock;
              const curVal = u?.type==="stage"?state.world.stage:u?.type==="kills"?state.player.totalKills:u?.type==="deaths"?state.player.deaths:(state.yuyu.battleMemory?.consecutiveWins||0);
              const progress = u ? Math.min(1, curVal/u.v) : 0;
              const hint=u?.type==="stage"?`Stage ${u.v}`:u?.type==="kills"?`${u.v} kills`:u?.type==="deaths"?`${u.v}× mati`:`${u.v} wins`;
              return(
                <div key={sid} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:10,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)"}}>
                  <span style={{fontSize:15,filter:"grayscale(1) opacity(.25)"}}>{sk.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:8,color:COLORS.muted,fontWeight:700}}>{sk.name}</div>
                    <div style={{height:3,borderRadius:99,background:"rgba(255,255,255,.06)",marginTop:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${progress*100}%`,background:"rgba(124,58,237,.5)",borderRadius:99,transition:"width .3s"}}/>
                    </div>
                    <div style={{fontSize:6,color:"rgba(255,255,255,.2)",marginTop:2}}>{sk.type}</div>
                  </div>
                  <div style={{fontSize:7,color:"#4b5563",fontWeight:700,flexShrink:0}}>{hint}</div>
                </div>
              );
            })}
          </div>
        </>);
      })()}

      {/* ══ GEAR ══ — player can buy + swap */}
      {tab==="equip"&&<>
        {!(state.world.unlockedFeatures||[]).includes("equip")&&state.world.highestStage<10
          ?<div style={{padding:"40px 20px",textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:10}}>🔒</div>
            <div style={{fontSize:11,color:COLORS.muted,fontWeight:700}}>Unlock di Stage 10</div>
          </div>
          :<>
            <div style={{padding:"8px 12px",borderRadius:12,background:"rgba(16,185,129,.07)",border:"1px solid rgba(16,185,129,.2)",marginBottom:12}}>
              <div style={{fontSize:8,color:"#34d399",fontWeight:700,marginBottom:2}}>🎒 Gear — kontrol kamu</div>
              <div style={{fontSize:7.5,color:"rgba(255,255,255,.45)",lineHeight:1.5}}>Beli permanen. Ganti yang sudah dimiliki gratis. Yuyu juga beli sendiri kalau worth.</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {["weapon","armor","accessory"].map(slot=>{
                const eid=state.yuyu.equipment[slot],item=eid?ALL_EQUIP.find(e=>e.id===eid):null,si=slot==="weapon"?"🗡️":slot==="armor"?"🛡️":"💍";
                const wR=slot==="weapon"&&item?getWeaponRange(item.id):null;
                return(
                  <div key={slot} style={{padding:"12px 10px",borderRadius:14,background:item?"rgba(245,158,11,.1)":"rgba(255,255,255,.03)",border:`1px solid ${item?"rgba(245,158,11,.35)":"rgba(255,255,255,.08)"}`,textAlign:"center"}}>
                    <div style={{fontSize:22,marginBottom:4}}>{item?item.icon:si}</div>
                    <div style={{fontSize:8.5,color:item?COLORS.text:COLORS.muted,fontWeight:700,marginBottom:2}}>{item?item.name:slot}</div>
                    {item&&<div style={{fontSize:7,color:"#fbbf24",fontWeight:700}}>{item.desc}</div>}
                    {wR&&<div style={{fontSize:6.5,color:wR.style==="ranged"?"#93c5fd":"#fca5a5",marginTop:3}}>{wR.style==="ranged"?`🏹 Range ${wR.atk}px`:`⚔️ Melee ${wR.atk}px`}</div>}
                    {!item&&<div style={{fontSize:7,color:"rgba(255,255,255,.2)"}}>kosong</div>}
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:10,marginBottom:10,fontSize:7,color:COLORS.muted}}>
              <span>✦ terpasang</span><span>📦 milik (gratis ganti)</span><span>🪙 beli dulu</span>
            </div>
            {["weapon","armor","accessory"].map(slot=>(
              <div key={slot} style={{marginBottom:14}}>
                <div style={{fontSize:7.5,color:COLORS.muted,letterSpacing:".14em",fontWeight:700,marginBottom:7}}>{slot.toUpperCase()}</div>
                <div style={{display:"flex",gap:7,overflowX:"auto",scrollbarWidth:"none",paddingBottom:2}}>
                  {EQUIPMENT[slot].map(item=>{
                    const isEquipped=state.yuyu.equipment[slot]===item.id,isOwned=(state.yuyu.ownedEquipment||[]).includes(item.id),canBuy=!isOwned&&state.player.gold>=item.cost;
                    const wR2=slot==="weapon"?getWeaponRange(item.id):null;
                    const onClick=()=>{if(isOwned)dispatch({type:"EQUIP_ITEM",itemId:item.id});else if(canBuy)dispatch({type:"BUY_EQUIP",itemId:item.id});};
                    return(
                      <button key={item.id} onClick={onClick} style={{flexShrink:0,width:80,padding:"10px 8px 8px",borderRadius:12,textAlign:"center",fontFamily:"inherit",cursor:(isOwned||canBuy)?"pointer":"default",
                        background:isEquipped?"linear-gradient(135deg,rgba(245,158,11,.25),rgba(245,158,11,.1))":isOwned?"rgba(16,185,129,.1)":canBuy?"rgba(255,255,255,.05)":"rgba(255,255,255,.02)",
                        border:`1.5px solid ${isEquipped?"rgba(245,158,11,.6)":isOwned?"rgba(16,185,129,.4)":canBuy?"rgba(255,255,255,.12)":"rgba(255,255,255,.04)"}`}}>
                        <div style={{fontSize:20,marginBottom:4}}>{item.icon}</div>
                        <div style={{fontSize:8,fontWeight:800,color:isEquipped?"#fbbf24":isOwned?"#34d399":canBuy?COLORS.text:"#374151",marginBottom:2}}>{item.name}</div>
                        <div style={{fontSize:6.5,color:isEquipped?"#fbbf24":isOwned?"#6ee7b7":"rgba(255,255,255,.4)",marginBottom:2}}>{item.desc}</div>
                        {wR2&&<div style={{fontSize:6,color:wR2.style==="ranged"?"#93c5fd":"#fca5a5",marginBottom:2}}>{wR2.style==="ranged"?`🏹${wR2.atk}px`:`⚔️${wR2.atk}px`}</div>}
                        <div style={{fontSize:8,fontWeight:800,color:isEquipped?"#fbbf24":isOwned?"#34d399":canBuy?"#fbbf24":"#374151"}}>
                          {isEquipped?"✦ EQUIPPED":isOwned?"📦 GANTI":`🪙${item.cost}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        }
      </>}

      {/* ══ PRESTIGE ══ */}
      {tab==="prestige"&&(()=>{
        const p = state.yuyu.prestige||0;
        const tier = getPrestTier(p);
        const cycle = p>0 ? Math.ceil(p/8) : 0;
        const posInCycle = p>0 ? ((p-1)%8)+1 : 0;
        // next tier info
        const nextTierIdx = p>0 ? p%8 : 0; // index into PRESTIGE_TIERS for next
        const nextTier = PRESTIGE_TIERS[nextTierIdx];
        // perks unlocked so far
        const activePerks = PRESTIGE_PERKS.filter(pk => hasPrestPerk(p, pk.id));
        const nextPerk = PRESTIGE_PERKS.find(pk => !hasPrestPerk(p, pk.id));
        return (
          <>
            {/* ── Tier header ── */}
            <div style={{textAlign:"center",padding:"12px 0 14px",borderBottom:"1px solid rgba(255,255,255,.06)",marginBottom:14}}>
              {p===0 ? (
                <>
                  <div style={{fontSize:36,marginBottom:6}}>🌑</div>
                  <div style={{fontSize:14,fontWeight:900,color:COLORS.muted,marginBottom:4}}>Belum Prestige</div>
                  <div style={{fontSize:8,color:COLORS.muted,lineHeight:1.5}}>Max semua stat ke {MAX_STAT} untuk Ascend pertama</div>
                </>
              ) : (
                <>
                  <div style={{fontSize:36,marginBottom:6}}>{tier.icon}</div>
                  <PrestigeBadge prestige={p} size="lg"/>
                  {cycle>1&&<div style={{marginTop:4,fontSize:8,color:"rgba(255,255,255,.4)"}}>Cycle {cycle} · Rank {p}</div>}
                  <div style={{display:"flex",justifyContent:"center",gap:12,fontSize:8,color:COLORS.muted,marginTop:8}}>
                    <span>💀 {state.player.deaths||0}</span><span>·</span>
                    <span>⚔️ {state.player.totalKills||0} kills</span><span>·</span>
                    <span>🏆 Stage {state.world.highestStage||0}</span>
                  </div>
                </>
              )}
            </div>

            {/* ── Multiplier cards ── */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
              {[
                {icon:"⚔️",label:"DMG MULT",val:`×${pb.dmgMult.toFixed(2)}`,color:"#ef4444"},
                {icon:"❤️",label:"HP MULT", val:`×${pb.hpMult.toFixed(2)}`, color:"#10b981"},
                {icon:"🪙",label:"GOLD MULT",val:`×${pb.goldMult.toFixed(2)}`,color:"#f59e0b"},
              ].map(b=>(
                <div key={b.label} style={{padding:"12px 8px",borderRadius:14,background:`${b.color}10`,border:`1px solid ${b.color}30`,textAlign:"center"}}>
                  <div style={{fontSize:20,marginBottom:4}}>{b.icon}</div>
                  <div style={{fontSize:14,fontWeight:900,color:b.color,lineHeight:1}}>{b.val}</div>
                  <div style={{fontSize:6.5,color:COLORS.muted,letterSpacing:".1em",marginTop:4}}>{b.label}</div>
                </div>
              ))}
            </div>

            {/* ── Momentum tracker ── */}
            {hasPrestPerk(p,"momentum")&&(()=>{
              const streak = state.yuyu.momentumStreak||0;
              const bonus = Math.min(5,streak)*3;
              return(
                <div style={{padding:"10px 12px",borderRadius:12,background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:14}}>⚡</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:8,fontWeight:800,color:"#fbbf24"}}>Momentum — {streak} win streak</div>
                    <div style={{fontSize:7,color:COLORS.muted}}>DMG bonus: +{bonus}% {streak>=5?"(MAX)":""}</div>
                  </div>
                  <div style={{display:"flex",gap:3}}>
                    {[1,2,3,4,5].map(i=>(
                      <div key={i} style={{width:10,height:10,borderRadius:3,background:streak>=i?"#fbbf24":"rgba(255,255,255,.1)",border:`1px solid ${streak>=i?"#f59e0b":"rgba(255,255,255,.12)"}`}}/>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ── Prestige Perks unlocked ── */}
            {activePerks.length>0&&(
              <div style={{marginBottom:14}}>
                <div style={{fontSize:7.5,color:COLORS.muted,letterSpacing:".12em",fontWeight:700,marginBottom:8}}>PERKS AKTIF</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {activePerks.map(pk=>(
                    <div key={pk.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:12,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)"}}>
                      <span style={{fontSize:15,flexShrink:0}}>{pk.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:8.5,fontWeight:800,color:COLORS.text}}>{pk.name}</div>
                        <div style={{fontSize:7,color:COLORS.muted,lineHeight:1.4,marginTop:1}}>{pk.desc}</div>
                      </div>
                      <span style={{fontSize:7,color:"#34d399",fontWeight:800,flexShrink:0}}>✦ ON</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Next perk preview ── */}
            {nextPerk&&p>0&&(
              <div style={{marginBottom:14,padding:"10px 12px",borderRadius:12,background:"rgba(124,58,237,.06)",border:"1px solid rgba(124,58,237,.15)"}}>
                <div style={{fontSize:7.5,color:COLORS.muted,letterSpacing:".1em",fontWeight:700,marginBottom:6}}>PERK BERIKUTNYA (Prestige {nextPerk.p + Math.floor(p/8)*8})</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:15,flexShrink:0,opacity:.5}}>{nextPerk.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:8.5,fontWeight:800,color:"#c4b5fd"}}>{nextPerk.name}</div>
                    <div style={{fontSize:7,color:COLORS.muted,lineHeight:1.4,marginTop:1}}>{nextPerk.desc}</div>
                  </div>
                  <span style={{fontSize:7,color:COLORS.muted,fontWeight:800,flexShrink:0}}>🔒</span>
                </div>
              </div>
            )}

            {/* ── Ascension gate ── */}
            <div style={{padding:"14px",borderRadius:16,background:ascReady?"rgba(245,158,11,.1)":"rgba(255,255,255,.03)",border:`1px solid ${ascReady?"rgba(245,158,11,.4)":"rgba(255,255,255,.07)"}`,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                <span style={{fontSize:12}}>{ascReady?"✨":"🔒"}</span>
                <span style={{fontSize:9,fontWeight:800,color:ascReady?"#fbbf24":COLORS.muted}}>
                  {ascReady ? `ASCENSION SIAP! → ${nextTier?.icon} ${nextTier?.name}` : "Requirements Ascend:"}
                </span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {["str","def","spd","hp","luck"].map(s=>{
                  const lv=state.yuyu.stats[s],done=lv>=MAX_STAT;
                  return(
                    <div key={s} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:99,background:done?"rgba(245,158,11,.18)":"rgba(255,255,255,.05)",border:`1px solid ${done?"rgba(245,158,11,.4)":"rgba(255,255,255,.08)"}`}}>
                      <span style={{fontSize:7,fontWeight:800,color:done?"#fbbf24":COLORS.muted}}>{s.toUpperCase()}</span>
                      <span style={{fontSize:7,color:done?"#fbbf24":"rgba(255,255,255,.25)"}}>{done?"MAX ✦":`${lv}/${MAX_STAT}`}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {ascReady&&<button onClick={onAscend} style={{width:"100%",padding:"16px",borderRadius:16,background:`linear-gradient(135deg,${tier?.color||"#92400e"},${nextTier?.color||"#d97706"},#7c3aed)`,border:"1px solid rgba(245,158,11,.6)",color:"#fff",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"inherit",letterSpacing:".1em",animation:"ascendPulse 2s ease-in-out infinite",boxShadow:"0 8px 32px rgba(245,158,11,.4)"}}>
              {nextTier?.icon} ASCEND → {nextTier?.name} {nextTier?.icon}
            </button>}
            {!ascReady&&<div style={{fontSize:8,color:COLORS.muted,textAlign:"center",padding:"6px"}}>Yuyu akan maxkan semua stat ke Lv.{MAX_STAT} sendiri~</div>}
            <div style={{marginTop:10,padding:"10px 12px",borderRadius:12,background:"rgba(124,58,237,.08)",border:"1px solid rgba(124,58,237,.18)",fontSize:7.5,color:"#c4b5fd",lineHeight:1.6,textAlign:"center"}}>
              Tiap Ascension: stat reset · DMG/HP/Gold mult naik · Tier baru · Perk baru terbuka
            </div>
          </>
        );
      })()}

      {/* ══ CODEX ══ */}
      {tab==="codex"&&(()=>{
        const stage3 = state.world.stage;
        const scale3 = 1 + stage3 * 0.08;
        const biome3 = getBiome(stage3);
        const curPool = stage3<=5?["slime","dash"]:stage3<=8?["slime","spike","phantom"]:stage3<=12?["spike","dash","tank","phantom"]:stage3<=16?["spike","tank","phantom","golem"]:stage3<=22?["dash","tank","phantom","golem"]:["dash","phantom","golem","tank"];
        return (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {/* Current stage context */}
            <div style={{padding:"9px 12px",borderRadius:12,background:`${biome3.color}15`,border:`1px solid ${biome3.color}30`,marginBottom:4}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                <span style={{fontSize:14}}>{biome3.icon}</span>
                <span style={{fontSize:9,fontWeight:800,color:biome3.color}}>{biome3.name} — Stage {stage3}</span>
              </div>
              <div style={{fontSize:7,color:"rgba(255,255,255,.45)"}}>Musuh saat ini: <span style={{color:"rgba(255,255,255,.7)"}}>{curPool.map(id=>MTYPES.find(m=>m.id===id)?.name).join(", ")}</span></div>
              <div style={{fontSize:7,color:"rgba(255,255,255,.35)",marginTop:1}}>Scale ×{scale3.toFixed(2)} — semua HP/DMG dikalikan faktor ini</div>
            </div>

            <div style={{fontSize:7.5,color:COLORS.muted,letterSpacing:".12em",marginBottom:4,fontWeight:700}}>MONSTER CODEX</div>
            {CODEX.map(c=>{
              const mt=MTYPES.find(m=>m.id===c.id);if(!mt)return null;
              const boss=c.id==="boss"||c.id==="megaboss";
              const inCurrentPool = curPool.includes(c.id)||(boss&&(stage3%5===0||stage3%10===0));
              const scaledHp = Math.round(mt.hp*scale3);
              const scaledDmg = Math.round(mt.dmg*scale3);
              // TTK estimate against this monster
              const eStats3 = getEffectiveStats(state.yuyu);
              const myDmg = Math.round((8+eStats3.str*6)*pb.dmgMult*getLevelMult(state.yuyu.level||1));
              const atkCdMs3 = Math.max(200,1300-eStats3.spd*40);
              const hitsNeeded3 = Math.ceil(scaledHp/Math.max(1,myDmg));
              const ttk3 = ((hitsNeeded3*atkCdMs3)/1000).toFixed(1);
              return(
                <div key={c.id} style={{borderRadius:16,overflow:"hidden",
                  background:inCurrentPool?(boss?"rgba(124,58,237,.12)":"rgba(255,255,255,.05)"):"rgba(255,255,255,.02)",
                  border:`1px solid ${inCurrentPool?(boss?"rgba(124,58,237,.35)":"rgba(255,255,255,.1)"):"rgba(255,255,255,.04)"}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <div style={{width:36,height:36,borderRadius:9,background:`${mt.color}20`,border:`2px solid ${inCurrentPool?mt.color+80:mt.color+"30"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0,opacity:inCurrentPool?1:0.45}}>{c.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                        <span style={{fontSize:11,fontWeight:900,color:inCurrentPool?mt.color:COLORS.muted}}>{mt.name}</span>
                        {boss&&<span style={{fontSize:6.5,padding:"1px 5px",borderRadius:99,background:c.id==="megaboss"?"rgba(220,38,38,.4)":"rgba(126,34,206,.4)",color:"#fff",fontWeight:800}}>{c.id==="megaboss"?"MEGA":"BOSS"}</span>}
                        {inCurrentPool&&!boss&&<span style={{fontSize:6,padding:"1px 5px",borderRadius:99,background:"rgba(16,185,129,.2)",color:"#34d399",fontWeight:800}}>AKTIF</span>}
                      </div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        {[{l:"HP",v:scaledHp,c:"#10b981"},{l:"DMG",v:scaledDmg,c:"#ef4444"},{l:"SPD",v:mt.spd,c:"#f59e0b"},{l:"🪙",v:mt.reward,c:"#fbbf24"},{l:"TTK",v:`${ttk3}s`,c:"#a78bfa"}].map(s=>(
                          <span key={s.l} style={{fontSize:7}}><span style={{color:s.c,fontWeight:800}}>{s.v}</span><span style={{color:"rgba(255,255,255,.3)"}}> {s.l}</span></span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {inCurrentPool&&<div style={{padding:"8px 12px"}}>
                    <div style={{fontSize:7.5,color:"rgba(255,255,255,.6)",lineHeight:1.5,marginBottom:5}}>{c.bio}</div>
                    <div style={{display:"flex",alignItems:"flex-start",gap:5,padding:"5px 8px",borderRadius:8,background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.2)"}}>
                      <span style={{fontSize:9,flexShrink:0}}>💡</span>
                      <span style={{fontSize:7.5,color:"#fde68a",lineHeight:1.5}}>{c.tip}</span>
                    </div>
                  </div>}
                </div>
              );
            })}
            <div style={{fontSize:7,color:COLORS.muted,textAlign:"center",padding:"6px 0"}}>Stats sudah discale untuk Stage {stage3}. TTK = estimasi waktu bunuh 1 musuh.</div>
          </div>
        );
      })()}

    </div>
  );
}

function AscensionScreen({ state, dispatch, onClose }) {
  const np      = (state.yuyu.prestige || 0) + 1;
  const pb      = getPrestBonus(np);
  const newTier = getPrestTier(np);
  const posInCycleNp = ((np-1)%8)+1;
  const newPerk = PRESTIGE_PERKS.find(pk => pk.p === posInCycleNp);
  const changes = [
    { text: "Semua stat reset ke Lv.1",                     color: "rgba(255,255,255,.4)",  icon: "🔄" },
    { text: `DMG permanent ×${pb.dmgMult.toFixed(2)}`,       color: "#34d399",               icon: "⚔️" },
    { text: `Max HP permanent ×${pb.hpMult.toFixed(2)}`,     color: "#34d399",               icon: "❤️" },
    { text: `Gold earned ×${pb.goldMult.toFixed(2)}`,        color: "#34d399",               icon: "🪙" },
    { text: "Skill levels reset",                            color: "rgba(255,255,255,.35)", icon: "⚡" },
    { text: "Gold berkurang 50%",                            color: "#f87171",               icon: "💸" },
    { text: "Kembali ke Stage 1",                            color: "rgba(255,255,255,.35)", icon: "🔁" },
    ...(newPerk ? [{ text: `Perk baru: ${newPerk.name}!`, color: "#fbbf24", icon: newPerk.icon }] : []),
  ];

  const tierColor = newTier?.color || "#f59e0b";

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backdropFilter: "blur(16px)", padding: "24px", background: `radial-gradient(ellipse at 50% 30%,${tierColor}20,transparent 55%),radial-gradient(ellipse at 50% 80%,rgba(124,58,237,.15),transparent 60%),rgba(4,2,12,.96)` }}>
      <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle,${tierColor}20,transparent 70%)`, pointerEvents: "none", animation: "ascendPulse 2s ease-in-out infinite" }}/>

      <div style={{ fontSize: 60, marginBottom: 10, animation: "resultBounce .6s cubic-bezier(.34,1.56,.64,1)", filter: `drop-shadow(0 0 20px ${tierColor})` }}>{newTier?.icon||"✨"}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: tierColor, letterSpacing: ".1em", marginBottom: 6, textShadow: `0 0 40px ${tierColor}` }}>ASCENSION!</div>
      <div style={{ marginBottom: 20 }}><PrestigeBadge prestige={np} size="lg"/></div>

      {/* Changes card */}
      <div style={{ width: "100%", maxWidth: 300, borderRadius: 20, background: "rgba(255,255,255,.04)", border: `1px solid ${tierColor}40`, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10 }}>📋</span>
          <span style={{ fontSize: 8, color: tierColor, fontWeight: 800, letterSpacing: ".12em" }}>SETELAH ASCEND</span>
        </div>
        <div style={{ padding: "8px 0" }}>
          {changes.map((x, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 14px" }}>
              <span style={{ fontSize: 12, flexShrink: 0 }}>{x.icon}</span>
              <span style={{ fontSize: 9, color: x.color, fontWeight: 600 }}>{x.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 300 }}>
        <button onClick={onClose} style={{
          flex: 1, padding: "13px", borderRadius: 14,
          background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
          color: "rgba(255,255,255,.5)", fontSize: 11, cursor: "pointer",
          fontFamily: "inherit", fontWeight: 700,
        }}>Batal</button>
        <button onClick={() => { dispatch({ type: "ASCEND" }); onClose(); }} style={{
          flex: 2, padding: "13px", borderRadius: 14,
          background: `linear-gradient(135deg,${tierColor},#7c3aed)`,
          border: `1px solid ${tierColor}80`,
          color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 900,
          boxShadow: `0 8px 28px ${tierColor}50`, letterSpacing: ".06em",
        }}>{newTier?.icon} ASCEND → {newTier?.name}!</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS SHEET  — expanded full controls
// ─────────────────────────────────────────────────────────────────────────────
function SettingsSheet({ state, dispatch, onClose }) {
  const cfg = state.settings || DEFAULT_SETTINGS;
  const set = (k, v) => dispatch({ type: "SET_SETTING", key: k, value: v });
  const [confirmReset, setConfirmReset] = useState(false);

  const Row = ({ label, sub, children }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 0", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
      <div style={{ flex:1, minWidth:0, paddingRight:10 }}>
        <div style={{ fontSize:10, color:COLORS.text, fontWeight:600 }}>{label}</div>
        {sub && <div style={{ fontSize:7.5, color:COLORS.muted, marginTop:1 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink:0 }}>{children}</div>
    </div>
  );

  const Sec = ({ icon, title }) => (
    <div style={{ padding:"16px 0 6px", display:"flex", alignItems:"center", gap:7 }}>
      <span style={{ fontSize:13 }}>{icon}</span>
      <span style={{ fontSize:7.5, color:"rgba(196,181,253,.5)", letterSpacing:".2em", fontWeight:800 }}>{title}</span>
    </div>
  );

  const Toggle = ({ k }) => {
    const on = k in cfg ? !!cfg[k] : !!(DEFAULT_SETTINGS[k]);
    return (
      <button onClick={() => set(k, !on)} style={{
        position:"relative", width:44, height:24, borderRadius:99,
        background: on ? "rgba(124,58,237,.6)" : "rgba(255,255,255,.08)",
        border:`1px solid ${on ? "rgba(124,58,237,.8)" : "rgba(255,255,255,.12)"}`,
        cursor:"pointer", transition:"all .2s", flexShrink:0,
      }}>
        <div style={{
          position:"absolute", top:3, left: on ? 22 : 3, width:16, height:16,
          borderRadius:"50%", background: on ? "#fff" : "rgba(255,255,255,.4)",
          transition:"left .2s ease", boxShadow: on ? "0 0 8px rgba(124,58,237,.6)" : undefined,
        }}/>
      </button>
    );
  };

  const Sel = ({ k, opts }) => (
    <div style={{ display:"flex", gap:3, flexWrap:"wrap", justifyContent:"flex-end" }}>
      {opts.map(o => (
        <button key={o.v} onClick={() => set(k, o.v)} style={{
          padding:"5px 8px", borderRadius:8,
          background: cfg[k] === o.v ? "rgba(124,58,237,.35)" : "rgba(255,255,255,.05)",
          border:`1px solid ${cfg[k] === o.v ? "rgba(124,58,237,.6)" : "rgba(255,255,255,.08)"}`,
          color: cfg[k] === o.v ? COLORS.text : "rgba(255,255,255,.4)",
          fontSize:8, cursor:"pointer", fontFamily:"inherit", fontWeight:700, transition:"all .12s",
        }}>{o.l}</button>
      ))}
    </div>
  );

  const cheatOn = cfg.invincible || cfg.oneHitKill;

  return (
    <div style={{ padding:"0 16px" }}>

      {/* ── GAMEPLAY ── */}
      <Sec icon="⚙️" title="GAMEPLAY"/>
      <Row label="Game Speed"><Sel k="gameSpeed" opts={[{v:.5,l:".5×"},{v:.75,l:".75×"},{v:1,l:"1×"},{v:1.5,l:"1.5×"},{v:2,l:"2×"}]}/></Row>
      <Row label="Difficulty" sub="Berlaku saat battle baru dimulai"><Sel k="difficulty" opts={[{v:"easy",l:"Easy"},{v:"normal",l:"Normal"},{v:"hard",l:"Hard"},{v:"extreme",l:"Extreme"}]}/></Row>
      <Row label="Jumlah Musuh" sub="Berlaku saat battle baru dimulai"><Sel k="monsterCount" opts={[{v:"few",l:"Dikit"},{v:"normal",l:"Normal"},{v:"many",l:"Banyak"},{v:"chaos",l:"CHAOS"}]}/></Row>
      <Row label="Auto-Revive" sub={`Otomatis pakai 🪙${50*Math.max(1,state.player.deaths||0)} saat kalah`}><Toggle k="autoRevive"/></Row>
      <Row label="Camp Regen" sub="Kecepatan HP pulih di camp"><Sel k="campRegen" opts={[{v:"off",l:"Off"},{v:"slow",l:"Lambat"},{v:"normal",l:"Normal"},{v:"fast",l:"Cepat"}]}/></Row>
      <Row label="Gold Multiplier"><Sel k="goldMult" opts={[{v:.5,l:"×0.5"},{v:1,l:"×1"},{v:2,l:"×2"},{v:3,l:"×3"}]}/></Row>
      <Row label="XP Multiplier"><Sel k="xpMult" opts={[{v:.5,l:"×0.5"},{v:1,l:"×1"},{v:2,l:"×2"},{v:3,l:"×3"}]}/></Row>

      {/* ── COMBAT ── */}
      <Sec icon="⚔️" title="COMBAT"/>
      <Row label="Yuyu ATK Speed" sub="Berlaku saat battle baru dimulai"><Sel k="yuyuAtkSpeed" opts={[{v:"slow",l:"Lambat"},{v:"normal",l:"Normal"},{v:"fast",l:"Cepat"},{v:"ultra",l:"Ultra"}]}/></Row>
      <Row label="Yuyu Move Speed" sub="Berlaku saat battle baru dimulai"><Sel k="yuyuMoveSpeed" opts={[{v:"slow",l:"Lambat"},{v:"normal",l:"Normal"},{v:"fast",l:"Cepat"},{v:"ultra",l:"Ultra"}]}/></Row>
      <Row label="Skill Cooldown"><Sel k="skillCooldown" opts={[{v:"long",l:"Lama"},{v:"normal",l:"Normal"},{v:"short",l:"Singkat"},{v:"instant",l:"Instant"}]}/></Row>
      <Row label="Agresivitas Musuh" sub="Seberapa agresif monster mengejar"><Sel k="monsterAggression" opts={[{v:"passive",l:"Pasif"},{v:"normal",l:"Normal"},{v:"aggressive",l:"Agresif"},{v:"feral",l:"Liar"}]}/></Row>

      {/* ── VISUAL ── */}
      <Sec icon="🎨" title="VISUAL"/>
      <Row label="Partikel"><Sel k="particles" opts={[{v:"off",l:"Off"},{v:"low",l:"Low"},{v:"high",l:"High"}]}/></Row>
      <Row label="Angka Damage"><Toggle k="damageNumbers"/></Row>
      <Row label="Tampilkan Combo"><Toggle k="showCombo"/></Row>
      <Row label="Tampilkan Strategi" sub="Badge strategi + threat level di battle"><Toggle k="showStrategy"/></Row>
      <Row label="Screen Shake"><Sel k="screenShake" opts={[{v:"off",l:"Off"},{v:"light",l:"Ringan"},{v:"normal",l:"Normal"},{v:"heavy",l:"Heavy"}]}/></Row>
      <Row label="HUD Opacity"><Sel k="hudOpacity" opts={[{v:60,l:"60%"},{v:80,l:"80%"},{v:100,l:"100%"}]}/></Row>
      <Row label="Tampilkan FPS"><Toggle k="showFps"/></Row>

      {/* ── AI / DIALOG ── */}
      <Sec icon="💬" title="AI / DIALOG"/>
      <Row label="Dialog Yuyu" sub="One-liner otomatis saat battle"><Toggle k="battleDialog"/></Row>
      <Row label="Frekuensi Dialog"><Sel k="dialogFreq" opts={[{v:"off",l:"Off"},{v:"rare",l:"Jarang"},{v:"normal",l:"Normal"},{v:"often",l:"Sering"}]}/></Row>
      <Row label="Panjang Dialog"><Sel k="dialogLength" opts={[{v:"short",l:"Pendek"},{v:"normal",l:"Normal"},{v:"long",l:"Panjang"}]}/></Row>
      <Row label="Chat Yuyu" sub="Yuyu balas chat kamu (pakai AI)"><Toggle k="chatEnabled"/></Row>

      {/* ── VOICE ── */}
      <Sec icon="🔊" title="SUARA YUYU (TTS)"/>
      <Row label="Aktifkan Suara" sub="Yuyu ngomong pakai Web Speech API"><Toggle k="voiceEnabled"/></Row>
      <Row label="Volume Suara"><Sel k="voiceVol" opts={[{v:.25,l:"25%"},{v:.5,l:"50%"},{v:.85,l:"85%"},{v:1,l:"100%"}]}/></Row>
      <Row label="Kecepatan Bicara"><Sel k="voiceRate" opts={[{v:.8,l:"Lambat"},{v:1,l:"Normal"},{v:1.15,l:"Cepat"},{v:1.4,l:"Sangat Cepat"}]}/></Row>
      <Row label="Pitch Suara" sub="Makin tinggi = makin imut~"><Sel k="voicePitch" opts={[{v:1,l:"Normal"},{v:1.3,l:"Tinggi"},{v:1.5,l:"Lebih Tinggi"},{v:1.8,l:"Paling Imut"}]}/></Row>
      <Row label="Test Suara" sub="Tap tombol ini untuk coba suara">
        <button
          onClick={() => {
            // Resume synthesis in case browser suspended it — required on mobile
            if (window.speechSynthesis?.paused) window.speechSynthesis.resume();
            YuyuVoice.speak("Hehe~ gimana? suaraku imut kan~", cfg);
          }}
          style={{padding:"6px 14px",borderRadius:10,background:"rgba(124,58,237,.3)",border:"1px solid rgba(124,58,237,.6)",color:"#c4b5fd",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:800}}
        >▶ Test Suara</button>
      </Row>

      {/* ── MUSIK LATAR ── */}
      <Sec icon="🎵" title="MUSIK LATAR (CAMP)"/>
      <Row label="Aktifkan Musik" sub="Suara api unggun di camp"><Toggle k="musicEnabled"/></Row>
      <Row label="Volume Musik" sub="Terpisah dari volume SFX"><Sel k="musicVol" opts={[{v:.1,l:"10%"},{v:.25,l:"25%"},{v:.40,l:"40%"},{v:.65,l:"65%"},{v:1,l:"100%"}]}/></Row>

      {/* ── SFX ── */}
      <Sec icon="🎮" title="SOUND EFFECTS (BATTLE)"/>
      <Row label="Aktifkan SFX" sub="Suara serangan, kill, skill, dll"><Toggle k="sfxEnabled"/></Row>
      <Row label="Volume SFX"><Sel k="sfxVol" opts={[{v:.15,l:"15%"},{v:.35,l:"35%"},{v:.55,l:"55%"},{v:.8,l:"80%"}]}/></Row>
      <Row label="Test SFX" sub="Coba beberapa sound effect">
        <div style={{display:"flex",gap:4}}>
          <button onClick={()=>SFX.play("atk")}  style={{padding:"4px 8px",borderRadius:8,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",color:COLORS.text,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>⚔️</button>
          <button onClick={()=>SFX.play("kill")} style={{padding:"4px 8px",borderRadius:8,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",color:COLORS.text,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>💀</button>
          <button onClick={()=>SFX.play("heal")} style={{padding:"4px 8px",borderRadius:8,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",color:COLORS.text,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>💚</button>
          <button onClick={()=>SFX.play("win")}  style={{padding:"4px 8px",borderRadius:8,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",color:COLORS.text,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>🏆</button>
        </div>
      </Row>

      {/* ── PLAYER ── */}
      <Sec icon="👤" title="PLAYER"/>
      <Row label="Nama Player">
        <input
          value={cfg.playerName || "Papa"}
          onChange={e => set("playerName", e.target.value.slice(0,14))}
          style={{ padding:"6px 10px", borderRadius:10, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", color:COLORS.text, fontSize:10, outline:"none", width:120, fontFamily:"inherit" }}
        />
      </Row>

      {/* ── CHEAT ── */}
      <Sec icon="🧪" title="CHEAT MODE"/>
      <div style={{ marginBottom:6, padding:"8px 10px", borderRadius:10, background:"rgba(245,158,11,.06)", border:"1px solid rgba(245,158,11,.15)", fontSize:8, color:"rgba(245,158,11,.7)", lineHeight:1.5 }}>
        ⚠️ Cheat menonaktifkan pencapaian yang wajar. Tapi ini game kamu, have fun!
      </div>
      <Row label="Invincible" sub="Yuyu tidak pernah kena damage"><Toggle k="invincible"/></Row>
      <Row label="One-Hit Kill" sub="Yuyu bunuh musuh dengan 1 serangan"><Toggle k="oneHitKill"/></Row>

      {/* ── DANGER ZONE ── */}
      <Sec icon="⚠️" title="DANGER ZONE"/>
      <div style={{ padding:"8px 0 4px" }}>
        {!confirmReset
          ? <button onClick={() => setConfirmReset(true)} style={{
              width:"100%", padding:"12px", borderRadius:12,
              background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.25)",
              color:"#f87171", fontSize:10, cursor:"pointer", fontFamily:"inherit", fontWeight:700,
              display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            }}>
              <span>🗑️</span><span>Reset Semua Progres</span>
            </button>
          : <div style={{ padding:"12px", borderRadius:12, background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)" }}>
              <div style={{ fontSize:8.5, color:"#f87171", fontWeight:700, textAlign:"center", marginBottom:10 }}>Yakin? Ini tidak bisa dibatalkan!</div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => setConfirmReset(false)} style={{ flex:1, padding:"10px", borderRadius:10, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", color:COLORS.muted, fontSize:9, cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>Batal</button>
                <button onClick={() => { dispatch({ type:"RESET_SAVE" }); onClose(); }} style={{ flex:1, padding:"10px", borderRadius:10, background:"rgba(239,68,68,.35)", border:"1px solid rgba(239,68,68,.6)", color:"#fff", fontSize:9, cursor:"pointer", fontFamily:"inherit", fontWeight:800 }}>Ya, Reset!</button>
              </div>
            </div>
        }
      </div>
      <div style={{ fontSize:7.5, color:COLORS.muted, textAlign:"center", padding:"10px 0 6px", letterSpacing:".06em" }}>Settings tersimpan otomatis ✦</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function MainScreen({ state, dispatch, onEndBattle }) {
  const [sheet,      setSheet]      = useState(null);
  const [started,    setStarted]    = useState(false);
  const [showAscend, setShowAscend] = useState(false);
  // Persistent across battle remounts
  const [cinemaMode, setCinemaMode] = useState(false);
  const [camFollow,  setCamFollow]  = useState(true);
  // Zoom persists across battle remounts — lives here not inside DungeonArenaPanel
  const persistZoomRef = useRef(1.0);

  const handleEnd      = useCallback(payload => { onEndBattle(payload); setStarted(false); }, [onEndBattle]);
  const handleStart    = useCallback(() => { setStarted(true); SFX.play("battleStart"); SFX.stopCampfire(); }, []);
  const handleUpgrade  = useCallback(() => setSheet("upgrade"), []);
  const handleSettings = useCallback(() => setSheet("settings"), []);

  const prevKeyRef = useRef(state.world.battleKey);
  useEffect(() => {
    if (state.world.battleKey !== prevKeyRef.current) {
      prevKeyRef.current = state.world.battleKey;
      setStarted(false);
    }
  }, [state.world.battleKey]);

  // Campfire ambient SFX — play while at camp, stop during battle
  useEffect(() => {
    if (started) { SFX.stopCampfire(); return; }
    if (state.settings?.musicEnabled === false) return;
    SFX.startCampfire();
    return () => SFX.stopCampfire();
  }, [started, state.settings?.musicEnabled]);
  useEffect(() => {
    if (started) return;
    const mhp = state.yuyu.maxHp || 100;
    if (state.yuyu.hp >= mhp) return;
    const regenSetting = state.settings?.campRegen || "normal";
    if (regenSetting === "off") return;
    const hpStat = state.yuyu.stats?.hp || 1;
    const regenAmt = regenSetting==="fast" ? hpStat*4 : regenSetting==="slow" ? hpStat : hpStat*2;
    const id = setInterval(() => {
      dispatch({ type: "CAMP_REGEN", amount: Math.max(1, regenAmt) });
    }, 1000);
    return () => clearInterval(id);
  // Intentionally exclude state.yuyu.hp — adding it would restart the interval
  // every tick (causing the "respawn" bug). The interval self-terminates via
  // the CAMP_REGEN reducer which clamps HP at maxHp.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, state.yuyu.maxHp, state.settings?.campRegen, state.yuyu.stats?.hp]);

  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <DungeonArenaPanel
        key={`arena-${state.world.stage}-${state.world.battleKey}`}
        state={state} dispatch={dispatch}
        onEnd={handleEnd} started={started}
        onStart={handleStart} onUpgrade={handleUpgrade} onSettings={handleSettings}
        cinemaMode={cinemaMode} setCinemaMode={setCinemaMode}
        camFollow={camFollow} setCamFollow={setCamFollow}
        persistZoomRef={persistZoomRef}
      />
      {sheet === "upgrade" && (
        <Sheet onClose={() => setSheet(null)} title="Upgrade">
          <UpgradeSheet state={state} dispatch={dispatch} onAscend={() => { setSheet(null); setShowAscend(true); }}/>
        </Sheet>
      )}
      {sheet === "settings" && (
        <Sheet onClose={() => setSheet(null)} title="Settings">
          <SettingsSheet state={state} dispatch={dispatch} onClose={() => setSheet(null)}/>
        </Sheet>
      )}
      {showAscend && <AscensionScreen state={state} dispatch={dispatch} onClose={() => setShowAscend(false)}/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [state, dispatch] = useReducer(reducer, INIT);

  // Hydrate from persistent storage (safe parse from Lyuyu)
  useEffect(() => {
    (async () => {
      try {
        const s = await window.storage.get("yuyu-rpg-v5");
        if (s?.value) {
          const parsed = safeJsonParse(s.value, null);
          if (parsed) dispatch({ type: "HYDRATE", p: parsed });
        }
      } catch (e) {}
    })();
  }, []);

  // Auto-save with 1 s debounce (safe stringify from Lyuyu)
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const str = safeStringify(state);
        if (str) await window.storage.set("yuyu-rpg-v5", str);
      } catch (e) {}
    }, 1000);
    return () => clearTimeout(t);
  }, [state]);

  const handleEnd = useCallback(payload => {
    dispatch({ type: "BATTLE_END", ...payload });
    // Level up check
    const currentXp = state.yuyu?.xp || 0;
    const currentLv = state.yuyu?.level || 1;
    if ((currentXp + (payload.xpEarned||0)) >= currentLv * 100) SFX.play("levelup");
    if ((payload.goldEarned||0) > 0) SFX.play("coin");

    // ── Yuyu AI upgrade after a win ──
    if (payload.result === "win") {
      // Wait for BATTLE_END gold to be applied before evaluating
      setTimeout(() => {
        // Build a projected state with the gold already added
        const projGold = (state.player.gold||0) + (payload.goldEarned||0);
        const projState = {
          ...state,
          player: { ...state.player, gold: projGold },
        };
        const { upgrades, summary } = yuyuAIUpgradeBrain(projState);
        if (upgrades.length) {
          dispatch({ type: "AI_UPGRADE", upgrades });
          dispatch({ type: "CHAT", msg: { role: "yuyu", text: summary } });
        }
      }, 600);
    }
  }, [state, dispatch]);

  return (
    <YuyuErrorBoundary>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0C0915; }
        [data-ph]:empty::before { content: attr(data-ph); color: #6B7280; pointer-events: none; }
        @keyframes orbFloat      { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-5px)} }
        @keyframes reactionPop   { 0%{opacity:1;transform:translateX(-50%) scale(.6) translateY(0)} 80%{opacity:1;transform:translateX(-50%) scale(1.15) translateY(-18px)} 100%{opacity:0;transform:translateX(-50%) scale(1) translateY(-24px)} }
        @keyframes dot           { 0%,100%{opacity:.2;transform:translateY(0)} 50%{opacity:1;transform:translateY(-4px)} }
        @keyframes sheetUp       { from{transform:translateY(100%);opacity:.7} to{transform:translateY(0);opacity:1} }
        @keyframes dlgPop        { from{opacity:0;transform:translateX(-50%) scale(.92)} to{opacity:1;transform:translateX(-50%) scale(1)} }
        @keyframes resultBounce  { 0%{transform:scale(.5);opacity:0} 70%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        @keyframes resultFade    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cdRing        { from{stroke-dashoffset:0} to{stroke-dashoffset:144.51} }
        @keyframes skillReady    { 0%,100%{filter:brightness(1) drop-shadow(0 0 5px currentColor)} 50%{filter:brightness(1.3) drop-shadow(0 0 10px currentColor)} }
        @keyframes livePulse     { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        @keyframes toastDrop     { from{opacity:0;transform:translateX(-50%) translateY(-18px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes shimmer       { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes fadeUp        { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ascendPulse   { 0%,100%{box-shadow:0 0 20px rgba(245,158,11,.3)} 50%{box-shadow:0 0 50px rgba(245,158,11,.7),0 0 80px rgba(124,58,237,.4)} }
        @keyframes chatIn        { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar { display: none; }
      `}</style>
      <div
        ref={el => { if (el) window.__yuyuCampMounted = true; }}
        style={{
          width: "100%", height: "100dvh",
          display: "flex", flexDirection: "column",
          background: COLORS.bg, color: COLORS.text,
          fontFamily: "'Nunito',-apple-system,BlinkMacSystemFont,sans-serif",
          position: "relative", overflow: "hidden",
        }}
      >
        <MainScreen state={state} dispatch={dispatch} onEndBattle={handleEnd}/>
      </div>
    </YuyuErrorBoundary>
  );
}
