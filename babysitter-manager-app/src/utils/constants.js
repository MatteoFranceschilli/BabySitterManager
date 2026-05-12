
// Sostituisci con i tuoi valori da console.firebase.google.com
export const FB_CONFIG = {
  apiKey: "INSERISCI_QUI_API_KEY",
  authDomain: "INSERISCI_QUI_AUTH_DOMAIN",
  projectId: "INSERISCI_QUI_PROJECT_ID",
  storageBucket: "INSERISCI_QUI_STORAGE_BUCKET",
  messagingSenderId: "INSERISCI_QUI_SENDER_ID",
  appId: "INSERISCI_QUI_APP_ID"
};
export let db_fs = null,
  auth_fb = null;
try {
  const FB_CONFIG_VALID = typeof firebase !== "undefined" && FB_CONFIG.apiKey && !FB_CONFIG.apiKey.startsWith("INSERISCI");
  if (FB_CONFIG_VALID) {
    if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
    db_fs = firebase.firestore();
    auth_fb = firebase.auth();
  }
} catch (e) {
  console.warn("Firebase non inizializzato:", e.message);
}
export const SK = "babysitter_db";
export const saveLocal = d => {
  try {
    localStorage.setItem(SK, JSON.stringify(d));
  } catch (e) {}
};
export const loadLocal = () => {
  try {
    const r = localStorage.getItem(SK);
    return r ? JSON.parse(r) : null;
  } catch (e) {
    return null;
  }
};
export const saveDB = async (uid_user, d) => {
  saveLocal(d);
  if (db_fs && uid_user) {
    try {
      await db_fs.collection("users").doc(uid_user).set({
        db: JSON.stringify(d)
      }, {
        merge: true
      });
    } catch (e) {}
  }
};
export const loadDB_remote = async uid_user => {
  if (!db_fs || !uid_user) return null;
  try {
    const doc = await db_fs.collection("users").doc(uid_user).get();
    if (doc.exists && doc.data().db) return JSON.parse(doc.data().db);
  } catch (e) {}
  return null;
};
export const uid = () => Math.random().toString(36).slice(2, 10);
export const GG_KEYS = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"];
export const GG_LABEL = {
  lun: "Lun",
  mar: "Mar",
  mer: "Mer",
  gio: "Gio",
  ven: "Ven",
  sab: "Sab",
  dom: "Dom"
};
export const GG_DOW = {
  dom: 0,
  lun: 1,
  mar: 2,
  mer: 3,
  gio: 4,
  ven: 5,
  sab: 6
};
export const blankGL = () => {
  const g = {};
  GG_KEYS.forEach(k => {
    g[k] = {
      attivo: false,
      inizio: "",
      fine: ""
    };
  });
  return g;
};
export const blankP = () => ({
  id: uid(),
  nome: "",
  cognome: "",
  dataNascita: "",
  luogoNascita: "",
  codiceFiscale: "",
  indirizzo: "",
  citta: "",
  cap: "",
  telefono: "",
  email: "",
  nazionalita: "",
  tipoDocumento: "",
  numeroDocumento: "",
  dataRilascio: "",
  dataScadenza: ""
});
export const blankC = pid => ({
  id: uid(),
  personaId: pid || "",
  tipo: "baby-sitter",
  convivenza: "non-convivente",
  dataInizio: "",
  dataFine: "",
  livelloCCNL: "BS",
  oreSett: "",
  pagaOraria: "",
  pagaMensile: "",
  superminimo: "",
  scatti: 0,
  modalitaPagamento: "bonifico",
  iban: "",
  banca: "",
  note: "",
  giorniLavoro: blankGL(),
  tipoRetribuzione: "oraria",
  istatPerc: "0",
  minimoRicalcolato: ""
});
export const blankG = pid => ({
  id: uid(),
  personaId: pid || "",
  data: "",
  tipo: "ordinaria",
  oreEntrata: "",
  oreUscita: "",
  oreExtra: "0",
  durata: "",
  note: "",
  giustificativo: ""
});
export const defaultDb = () => ({
  persone: [],
  contratti: [],
  giornate: []
});
export const calcOre = (e, u) => {
  if (!e || !u) return null;
  const [eh, em] = e.split(":").map(Number),
    [uh, um] = u.split(":").map(Number);
  const d = uh * 60 + um - (eh * 60 + em);
  return d > 0 ? d / 60 : null;
};
export const n2 = v => isNaN(parseFloat(v)) ? 0 : parseFloat(v);
export const toDS = d => {
  const y = d.getFullYear(),
    m = String(d.getMonth() + 1).padStart(2, "0"),
    dd2 = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + dd2;
};
export const CCNL_DEFAULTS = {
  // Minimi mensili conviventi (Tab.A dic.2025)
  minConv: {
    A: 900,
    AS: 950,
    B: 974.39,
    BS: 1043.99,
    C: 1113.61,
    CS: 1183.19,
    D: 1597.82,
    DS: 1667.42
  },
  // Minimi orari non-conviventi (Tab.C dic.2025)
  minOra: {
    A: 6.45,
    AS: 6.70,
    B: 6.95,
    BS: 7.38,
    C: 7.79,
    CS: 8.23,
    D: 9.48,
    DS: 9.88
  },
  vittoGg: 3.10,
  // Tab.F valore giornaliero vitto
  allogGg: 2.45,
  // Tab.F valore giornaliero alloggio
  ferie: 26,
  // Art.17 giorni lavorativi/anno
  permConv: 16,
  // Art.19 ore permesso convivente
  permNonConv: 12,
  // Art.19 ore permesso non-conv >=30h/sett
  scattiPerc: 4,
  // Art.37 % per scatto
  scattiMax: 7,
  // Art.37 numero massimo scatti
  contribDatore: 17.91,
  // % INPS datore (stima)
  contribLav: 5.84,
  // % INPS lavoratore (stima)
  contribAss: 0.04 // Art.54 €/h datore
};
export const loadCCNL = () => {
  try {
    const s = localStorage.getItem("bm_ccnl");
    return s ? {
      ...CCNL_DEFAULTS,
      ...JSON.parse(s)
    } : CCNL_DEFAULTS;
  } catch {
    return CCNL_DEFAULTS;
  }
};
export let CCNL = loadCCNL();
export const MIN_CONV = CCNL.minConv;
export const MIN_ORA = CCNL.minOra;
export let VITTO_GG = CCNL.vittoGg;
export let ALLOG_GG = CCNL.allogGg;
export const LIV = {
  A: {
    label: "A - Base",
    desc: "Pulizie, lavanderia, aiuto cucina, animali"
  },
  AS: {
    label: "A Super",
    desc: "Addetto compagnia (autosufficienti adulti)"
  },
  B: {
    label: "B - Qualificato",
    desc: "Collaboratore polifunzionale, cameriere, autista"
  },
  BS: {
    label: "B Super",
    desc: "Baby-sitter / assistente familiari autosufficienti"
  },
  C: {
    label: "C - Autonomo",
    desc: "Cuoco"
  },
  CS: {
    label: "C Super",
    desc: "Assistente NON autosufficienti (non formato)"
  },
  D: {
    label: "D - Coordinamento",
    desc: "Maggiordomo, governante, capo cuoco, istitutore"
  },
  DS: {
    label: "D Super",
    desc: "Assistente NON autosufficienti (formato >=500h)"
  }
};
export const TG = {
  ordinaria: {
    label: "Ordinaria",
    perc: 0,
    bg: "#E8F1FF",
    fg: "#2A5F8F"
  },
  straord_g: {
    label: "Straord. +25%",
    perc: 25,
    bg: "#FFF1E0",
    fg: "#C04A00"
  },
  straord_n: {
    label: "Straord. notte +50%",
    perc: 50,
    bg: "#EEEAF8",
    fg: "#4A2A9C"
  },
  domenicale: {
    label: "Domenicale +60%",
    perc: 60,
    bg: "#FCE8F2",
    fg: "#9C2060"
  },
  festiva: {
    label: "Festivita +60%",
    perc: 60,
    bg: "#FCE8F2",
    fg: "#8B0037"
  },
  notturna: {
    label: "Notturna +20%",
    perc: 20,
    bg: "#EDE7F6",
    fg: "#512DA8"
  },
  ferie: {
    label: "Ferie 26gg/anno",
    perc: 0,
    bg: "#EAF3EE",
    fg: "#3D7A52"
  },
  malattia: {
    label: "Malattia",
    perc: null,
    bg: "#FBECEC",
    fg: "#B03030"
  },
  permesso: {
    label: "Permesso retrib.",
    perc: 0,
    bg: "#E3F2FD",
    fg: "#1565C0"
  },
  permesso_nr: {
    label: "Permesso non retrib.",
    perc: null,
    bg: "#ECEFF1",
    fg: "#546E7A"
  },
  lutto: {
    label: "Lutto (Art.19c3)",
    perc: 0,
    bg: "#EDE7F6",
    fg: "#4527A0"
  },
  assenza: {
    label: "Assenza",
    perc: null,
    bg: "#ECEFF1",
    fg: "#546E7A"
  }
};
export const FEST = ["01-01", "01-06", "04-25", "05-01", "06-02", "08-15", "10-04", "11-01", "12-08", "12-25", "12-26"];
// Parse YYYY-MM-DD as local date (avoids UTC timezone shift)
export const parseDate = s => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const getDow = s => {
  const dt = parseDate(s);
  return dt ? dt.getDay() : -1;
};
export const isFest = d => {
  if (!d) return false;
  const p = d.split("-");
  return FEST.includes(p[1] + "-" + p[2]);
};
export const isDom = d => getDow(d) === 0;
export const withScatti = (b, n) => n2(b) * (1 + Math.min(parseInt(n) || 0, CCNL.scattiMax) * (CCNL.scattiPerc / 100));
export const tfrM = m => (n2(m) * 12 / 13.5 / 12).toFixed(2);
export const tredM = m => (n2(m) / 12).toFixed(2);

// TFR totale maturato (L.297/1982, Art.41 CCNL)
// Quota annua = retrib.annua / 13.5
// Rivalutazione 1.5% fisso + 75% ISTAT (usiamo 1.5% come minimo garantito)
export const calcTFRTotale = contratto => {
  if (!contratto) return null;
  const dataInizio = contratto.dataInizio;
  if (!dataInizio) return null;
  const pagaB = contratto.convivenza === "convivente" ? n2(contratto.pagaMensile) : n2(contratto.pagaOraria) * n2(contratto.oreSett) * 52 / 12;
  const pagaCS = withScatti(pagaB, contratto.scatti);
  if (!pagaCS) return null;
  const oggi = new Date();
  const inizio = parseDate(dataInizio);
  if (!inizio || inizio > oggi) return null;

  // anni e mesi maturati
  const anniTot = (oggi - inizio) / (365.25 * 24 * 3600 * 1000);
  if (anniTot < 0) return null;

  // Retribuzione annua utile (paga + 13a + vitto/alloggio se conv)
  const conv = contratto.convivenza === "convivente";
  const retribAnnua = pagaCS * 12 + pagaCS + (conv ? (VITTO_GG + ALLOG_GG) * 365 : 0);

  // Quota annua TFR
  const quotaAnnua = retribAnnua / 13.5;

  // Calcola anno per anno dal 1° gennaio del 1° anno pieno
  const annoInizio = inizio.getFullYear();
  const annoOggi = oggi.getFullYear();
  let totale = 0;
  const righe = [];
  for (let a = annoInizio; a <= annoOggi; a++) {
    const inizioA = a === annoInizio ? inizio : new Date(a, 0, 1);
    const fineA = a === annoOggi ? oggi : new Date(a, 11, 31);
    const giorniA = (fineA - inizioA) / (24 * 3600 * 1000) + 1;
    const frazioneA = Math.min(giorniA / 365, 1);
    const quotaA = quotaAnnua * frazioneA;
    // Rivalutazione sulle quote anni precedenti (1.5% annuo)
    const anniRival = annoOggi - a;
    const rivalutazione = anniRival > 0 ? totale * (Math.pow(1.015, anniRival) - Math.pow(1.015, anniRival - 1)) : 0;
    totale += quotaA;
    righe.push({
      anno: a,
      quota: quotaA.toFixed(2),
      rivalutazione: rivalutazione.toFixed(2)
    });
  }
  return {
    totale: totale.toFixed(2),
    quotaAnnua: quotaAnnua.toFixed(2),
    anniMaturati: anniTot.toFixed(1),
    righe
  };
};
export const prova = (l, c) => l === "D" || l === "DS" || c === "convivente" ? "30 giorni lavorativi" : "8 giorni lavorativi";

// Calcola busta paga mensile
export const fmtOre = v => {
  const h = Math.floor(n2(v));
  const m = Math.round((n2(v) - h) * 60);
  return h + "h" + (m > 0 ? " " + m + "m" : "");
};
export const calcBustaPaga = (gMese, contratto) => {
  if (!contratto) return null;
  const pOra = n2(contratto.pagaOraria);
  const pMens = n2(contratto.pagaMensile);
  const conv = contratto.convivenza === "convivente";
  const isMens = (contratto.tipoRetribuzione || "oraria") === "mensilizzata";
  const gl = contratto.giorniLavoro || {};
  const GG_DOW_REV = {
    0: "dom",
    1: "lun",
    2: "mar",
    3: "mer",
    4: "gio",
    5: "ven",
    6: "sab"
  };

  // Ore contratto per giorno della settimana
  const oreContrattoDow = data => {
    const dow = getDow(data);
    const key = GG_DOW_REV[dow];
    const g = gl[key];
    return g && g.attivo ? calcOre(g.inizio, g.fine) || 0 : 0;
  };

  // Paga giornaliera (1/26 del mensile) per modalità mensilizzata
  const pagaGG = pMens > 0 ? pMens / 26 : pOra * (n2(contratto.oreSett) / 6 || 0);

  // Calcola giorni malattia consecutivi per applicare Art.27
  const sorted = gMese.filter(g => g.tipo === "malattia").map(g => g.data).sort();
  const malattiaPerc = {}; // data -> percentuale
  let streak = 0;
  sorted.forEach((d, i) => {
    if (i === 0) {
      streak = 1;
    } else {
      const prev = new Date(sorted[i - 1]);
      prev.setDate(prev.getDate() + 1);
      streak = prev.toISOString().split("T")[0] === d ? streak + 1 : 1;
    }
    malattiaPerc[d] = streak <= 3 ? 0.5 : 1.0;
  });
  const tipi = {};
  const add = (k, ore, imp) => {
    if (!tipi[k]) tipi[k] = {
      ore: 0,
      imp: 0
    };
    tipi[k].ore += ore;
    tipi[k].imp += imp;
  };
  gMese.forEach(g => {
    const tipo = g.tipo;

    // ASSENZA / PERMESSO NON RETRIBUITO: non pagati
    // mensilizzata: decurto proporzionale alle ore (o 1/26 giornata intera se no durata)
    if (tipo === "assenza" || tipo === "permesso_nr") {
      if (isMens) {
        const durataOre = n2(g.durata);
        const oreGiorno = oreContrattoDow(g.data) || n2(contratto.oreSett) / 5 || 8;
        const frazGiornata = durataOre > 0 ? durataOre / oreGiorno : 1;
        add(tipo, durataOre || oreGiorno, -(pagaGG * frazGiornata));
      }
      return;
    }

    // LUTTO: pagato come ordinario (Art.19 c.3), durata indicata
    if (tipo === "lutto") {
      if (isMens) {
        // già incluso nello stipendio, nessuna decurtazione
        if (n2(g.durata) > 0) add("lutto", n2(g.durata), 0);
        return;
      }
      const durataOre = n2(g.durata);
      const oreGiorno = durataOre > 0 ? durataOre : n2(g.oreCalcolate) || oreContrattoDow(g.data);
      if (!oreGiorno) return;
      add("lutto", oreGiorno, oreGiorno * pOra);
      return;
    }

    // FERIE
    if (tipo === "ferie") {
      if (isMens) {
        add("ferie", 0, 0);
        return;
      } // già incluse nello stipendio
      const oreGiorno = oreContrattoDow(g.data);
      if (!oreGiorno) return;
      add("ferie", oreGiorno, oreGiorno * pOra);
      return;
    }

    // MALATTIA: pagata % per CCNL Art.27
    if (tipo === "malattia") {
      const oreGiorno = n2(g.oreCalcolate) || oreContrattoDow(g.data);
      const perc = malattiaPerc[g.data] || 0.5;
      if (isMens) {
        // mensilizzata: stipendio base incluso, decurto quota non coperta
        const coperto = pagaGG * perc;
        const decurto = pagaGG * (1 - perc);
        add("malattia", 0, -decurto); // decurtazione della parte non pagata
      } else {
        if (!oreGiorno) return;
        const imp = oreGiorno * pOra * perc;
        add("malattia", oreGiorno, imp);
      }
      return;
    }

    // PERMESSO RETRIBUITO: ore permesso separate + ore restanti come ordinaria
    if (tipo === "permesso") {
      if (isMens) {
        add("permesso", n2(g.durata), 0); // ore conteggiate ma già pagate nello stipendio
        return;
      }
      const orePermesso = n2(g.durata);
      const oreGiorno = oreContrattoDow(g.data);
      if (orePermesso > 0) add("permesso", orePermesso, orePermesso * pOra);
      const oreRest = oreGiorno - orePermesso;
      if (oreRest > 0) add("ordinaria", oreRest, oreRest * pOra);
      return;
    }

    // ALTRI TIPI: usa calcImp con maggiorazione
    const ore = n2(g.oreCalcolate) + n2(g.oreExtra);
    if (!ore) return;
    const t = TG[tipo];
    if (t && t.perc === null) return;
    if (isMens) {
      // mensilizzata: ordinario e ferie già inclusi nello stipendio
      // aggiunge solo la quota di maggiorazione (es. +60% domenicale = solo la parte extra)
      if (tipo === "ordinaria" || tipo === "ferie") return;
      const maggiorazione = t ? ore * pOra * (t.perc / 100) : 0;
      if (maggiorazione > 0) add(tipo, ore, maggiorazione);
    } else {
      const imp = t ? ore * pOra * (1 + t.perc / 100) : ore * pOra;
      add(tipo, ore, imp);
    }
  });
  const rows = [];
  let totLordo = isMens ? pMens > 0 ? pMens : 0 : 0;
  const order = ["ordinaria", "straord_g", "straord_n", "domenicale", "festiva", "notturna", "ferie", "permesso", "lutto", "malattia", "assenza", "permesso_nr"];
  const allKeys = [...new Set([...order, ...Object.keys(tipi)])];
  if (isMens && pMens > 0) {
    rows.push({
      label: "Stipendio mensile base",
      ore: "—",
      imp: pMens.toFixed(2),
      bg: C.accentL || "#FDF0E8",
      fg: C.accent || "#C8602A"
    });
  }
  allKeys.forEach(k => {
    if (!tipi[k]) return;
    const t = TG[k] || TG.ordinaria;
    const r = tipi[k];
    if (isMens) {
      if (k === "assenza" || k === "permesso_nr") {
        const oreLabel = r.ore > 0 ? fmtOre(r.ore) : "—";
        rows.push({
          label: t.label + " (decurtazione proporzionale)",
          ore: oreLabel,
          imp: r.imp.toFixed(2),
          bg: "#FBECEC",
          fg: "#B03030"
        });
        totLordo += r.imp;
      } else if (k === "malattia") {
        rows.push({
          label: t.label + " (quota non coperta Art.27)",
          ore: "—",
          imp: r.imp.toFixed(2),
          bg: t.bg,
          fg: t.fg
        });
        totLordo += r.imp;
      } else if (k === "permesso") {
        rows.push({
          label: t.label + " (incluso nello stipendio)",
          ore: fmtOre(r.ore),
          imp: "incluso",
          bg: t.bg,
          fg: t.fg
        });
      } else {
        // straordinari, festivi, notturni → solo quota maggiorazione
        rows.push({
          label: t.label + " (solo maggiorazione)",
          ore: fmtOre(r.ore),
          imp: "+" + r.imp.toFixed(2),
          bg: t.bg,
          fg: t.fg
        });
        totLordo += r.imp;
      }
    } else {
      const note = k === "malattia" ? " (50%/100% Art.27)" : k === "permesso" ? " (ore permesso)" : "";
      rows.push({
        label: t.label + note,
        ore: fmtOre(r.ore),
        imp: r.imp.toFixed(2),
        bg: t.bg,
        fg: t.fg
      });
      totLordo += r.imp;
    }
  });
  const nAssenze = gMese.filter(g => g.tipo === "assenza").length;
  const nPermNR = gMese.filter(g => g.tipo === "permesso_nr").length;
  const nMalattia = gMese.filter(g => g.tipo === "malattia").length;
  const nLutto = gMese.filter(g => g.tipo === "lutto").length;
  const orePermRet = gMese.filter(g => g.tipo === "permesso").reduce((a, g) => a + n2(g.durata), 0);
  const ferieMese = gMese.filter(g => g.tipo === "ferie").length;
  // Ferie maturate proporzionali al mese corrente del contratto
  const annoCorr = gMese.length > 0 ? parseInt(gMese[0].data.substring(0, 4)) : new Date().getFullYear();
  const annoStr2 = annoCorr + "-01";
  const inizioM2 = contratto.dataInizio && contratto.dataInizio.substring(0, 7) > annoStr2 ? contratto.dataInizio.substring(0, 7) : annoStr2;
  const lastM2 = gMese.reduce((a, g) => g.data.substring(0, 7) > a ? g.data.substring(0, 7) : a, "");
  const mesiM2 = lastM2 && lastM2 >= inizioM2 ? Math.max(0, (parseInt(lastM2.split("-")[0]) - parseInt(inizioM2.split("-")[0])) * 12 + (parseInt(lastM2.split("-")[1]) - parseInt(inizioM2.split("-")[1])) + 1) : 0;
  const ferieMat2 = Math.floor(CCNL.ferie * mesiM2 / 12);
  const oreSett = n2(contratto.oreSett);
  const permMax = contratto.convivenza === "convivente" ? oreSett > 0 && oreSett <= 30 ? 12 : CCNL.permConv : oreSett >= 30 ? CCNL.permNonConv : Math.round(CCNL.permNonConv * oreSett / 30 * 2) / 2;
  const supermin = n2(contratto.superminimo);
  const vittoMens = conv ? VITTO_GG * 30 : 0;
  const allogMens = conv ? ALLOG_GG * 30 : 0;
  const tredMens = n2(contratto.pagaMensile) > 0 ? n2(contratto.pagaMensile) / 12 : totLordo / 12;
  const tfrMens = (totLordo + tredMens) / 13.5;
  const imponibile = totLordo + supermin + vittoMens + allogMens;

  let oreInps = 0;
  allKeys.forEach(k => {
    if (tipi[k] && k !== 'assenza' && k !== 'permesso_nr') {
      oreInps += tipi[k].ore || 0;
    }
  });
  if (oreInps === 0 && isMens) {
     oreInps = Math.round(n2(contratto.oreSett) * 4.3333);
  }

  
  let retEffettivaOraria = 0;
  if (isMens) {
      const pm = n2(contratto.pagaMensile);
      retEffettivaOraria = pm > 0 ? (pm + supermin + tredMens + vittoMens + allogMens) / (oreSett * 4.3333) : 0;
  } else {
      const po = n2(contratto.pagaOraria);
      retEffettivaOraria = po + (po / 12) + ((vittoMens + allogMens) / (oreSett * 4.3333));
  }

  let inpsTot = 0, inpsLav = 0;
  if (contratto.calcContributi === "agevolata" || oreSett > 24) {
      inpsTot = 1.30; inpsLav = 0.33;
  } else {
      if (retEffettivaOraria <= 9.40) { inpsTot = 1.79; inpsLav = 0.45; }
      else if (retEffettivaOraria <= 11.45) { inpsTot = 2.02; inpsLav = 0.51; }
      else { inpsTot = 2.46; inpsLav = 0.62; }
  }

  const contribDatore = oreInps > 0 ? (inpsTot - inpsLav) * oreInps : 0;
  const contribLav = oreInps > 0 ? inpsLav * oreInps : 0;
  const contributiAss = 0;
  return {
    rows,
    totLordo: totLordo.toFixed(2),
    supermin: supermin > 0 ? supermin.toFixed(2) : null,
    vittoMens: conv ? vittoMens.toFixed(2) : null,
    allogMens: conv ? allogMens.toFixed(2) : null,
    tredMens: tredMens.toFixed(2),
    tfrMens: tfrMens.toFixed(2),
    contribDatore: contribDatore.toFixed(2),
    contribLav: contribLav.toFixed(2),
    contributiAss: contributiAss.toFixed(2),
    nettoStimato: (totLordo + supermin - contribLav).toFixed(2),
    costoDatore: (totLordo + supermin + vittoMens + allogMens + contribDatore + contributiAss + tredMens + tfrMens).toFixed(2),
    isMens,
    nAssenze,
    nPermNR,
    orePermNR: gMese.filter(g => g.tipo === "permesso_nr").reduce((a, g) => a + n2(g.durata), 0),
    nMalattia,
    nLutto,
    oreLutto: gMese.filter(g => g.tipo === "lutto").reduce((a, g) => a + n2(g.durata), 0),
    orePermRet,
    permMax,
    ferieMese,
    ferieMat2
  };
};
export const preav = (s, ov) => {
  const o = n2(s);
  if (o >= 25) return ov ? "30 gg" : "15 gg";
  return ov ? "15 gg" : "8 gg";
};
export const calcImp = (ore, paga, tipo) => {
  if (!ore || !paga) return null;
  const t = TG[tipo];
  if (!t || t.perc === null) return null;
  return (ore * n2(paga) * (1 + t.perc / 100)).toFixed(2);
};
export const m2o = (m, s) => {
  const mv = n2(m),
    sv = n2(s);
  return !mv || !sv ? "" : (mv * 12 / (sv * 52)).toFixed(2);
};
export const o2m = (r, s) => {
  const rv = n2(r),
    sv = n2(s);
  return !rv || !sv ? "" : (rv * sv * 52 / 12).toFixed(2);
};
export const autoTipo = d => isFest(d) ? "festiva" : isDom(d) ? "domenicale" : "ordinaria";
export const oreGL = gl => {
  if (!gl) return 0;
  return GG_KEYS.reduce((a, k) => {
    const g = gl[k];
    return a + (g && g.attivo ? calcOre(g.inizio, g.fine) || 0 : 0);
  }, 0);
};
export const genGiornate = (c, dal, al) => {
  if (!c || !dal || !al) return [];
  const gl = c.giorniLavoro || {},
    res = [];
  const [ey, em, ed] = al.split("-").map(Number);
  const end = new Date(ey, em - 1, ed);
  const [sy, sm, sd] = dal.split("-").map(Number);
  const cur = new Date(sy, sm - 1, sd);
  while (cur <= end) {
    const dow = cur.getDay();
    const key = GG_KEYS.find(k => GG_DOW[k] === dow);
    if (key && gl[key] && gl[key].attivo) {
      const ds = toDS(cur);
      res.push({
        ...blankG(c.personaId),
        data: ds,
        tipo: autoTipo(ds),
        oreEntrata: gl[key].inizio,
        oreUscita: gl[key].fine,
        oreCalcolate: calcOre(gl[key].inizio, gl[key].fine)
      });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return res;
};
export const THEMES = {
  chiaro: {
    name: "Chiaro",
    emoji: "☀️",
    bg: "#F7F2EC",
    card: "#FFF",
    border: "#E8DDD0",
    borderM: "#D5C8B8",
    accent: "#C8602A",
    accentL: "#FDF0E8",
    text: "#1E1008",
    textM: "#5A3820",
    textL: "#9A7A60",
    green: "#3D7A52",
    greenB: "#EAF3EE",
    blue: "#2A5F8F",
    blueB: "#E8F1FF",
    red: "#B03030",
    redB: "#FBECEC",
    navBg: "#FFF",
    headerBg: "#FFF",
    font: "'Sora',sans-serif",
    fontSerif: "'Lora',serif"
  },
  scuro: {
    name: "Scuro",
    emoji: "🌙",
    bg: "#0F1117",
    card: "#1A1D27",
    border: "#2A2D3E",
    borderM: "#3A3D52",
    accent: "#7C6DFF",
    accentL: "#1E1B3A",
    text: "#E8E8F0",
    textM: "#A0A0C0",
    textL: "#606080",
    green: "#4ADE80",
    greenB: "#0D2818",
    blue: "#60A5FA",
    blueB: "#0D1E38",
    red: "#F87171",
    redB: "#2A0D0D",
    navBg: "#1A1D27",
    headerBg: "#1A1D27",
    font: "'Sora',sans-serif",
    fontSerif: "'Lora',serif"
  },
  cyberpunk: {
    name: "Cyberpunk",
    emoji: "⚡",
    bg: "#0A0010",
    card: "#110022",
    border: "#FF00FF33",
    borderM: "#FF00FF66",
    accent: "#FF00FF",
    accentL: "#2A0030",
    text: "#00FFFF",
    textM: "#CC88FF",
    textL: "#884499",
    green: "#00FF88",
    greenB: "#001A0D",
    blue: "#00CCFF",
    blueB: "#001A22",
    red: "#FF2266",
    redB: "#220010",
    navBg: "#110022",
    headerBg: "#0A0010",
    font: "'Courier New',monospace",
    fontSerif: "'Courier New',monospace"
  },
  steampunk: {
    name: "Steampunk",
    emoji: "⚙️",
    bg: "#1A1208",
    card: "#241A08",
    border: "#6B4A1A",
    borderM: "#8B6A2A",
    accent: "#D4922A",
    accentL: "#2A1A00",
    text: "#E8D5A0",
    textM: "#C4A060",
    textL: "#8A6A30",
    green: "#7AAA44",
    greenB: "#0A1A00",
    blue: "#7A9ABB",
    blueB: "#0A1220",
    red: "#CC5533",
    redB: "#1A0800",
    navBg: "#120E04",
    headerBg: "#0E0A02",
    font: "'Courier New',monospace",
    fontSerif: "'Palatino Linotype','Palatino',serif"
  },
  lotr: {
    name: "LOTR Elfico",
    emoji: "🧝",
    bg: "#E8F0D8",
    card: "#F4F8E8",
    border: "#A8C878",
    borderM: "#78A848",
    accent: "#6A8A20",
    accentL: "#D8EAA8",
    text: "#1A2A08",
    textM: "#3A5A10",
    textL: "#6A8A40",
    green: "#3A7A10",
    greenB: "#C8E8A0",
    blue: "#2A6A8A",
    blueB: "#B8D8E8",
    red: "#8A2A10",
    redB: "#F0C8B8",
    navBg: "#D8E8C0",
    headerBg: "#C8DCA8",
    font: "'Palatino Linotype','Palatino',serif",
    fontSerif: "'Palatino Linotype','Palatino',serif"
  }
};
export let C = THEMES.chiaro;
export const AVC = ["#C8602A", "#2A6098", "#3D8A5C", "#7A3D90", "#8A5A00", "#2A7A7A", "#8F2A4A", "#4A6A2A"];
export const MESI = ["", "Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
function Av({
  p,
  sz
}) {
  sz = sz || 38;
  const i = ((p && p.nome ? p.nome[0] : "") + (p && p.cognome ? p.cognome[0] : "")).toUpperCase() || "?";
  const ci = p && p.nome ? p.nome.charCodeAt(0) % AVC.length : 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: sz,
      height: sz,
      borderRadius: "50%",
      background: AVC[ci],
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: sz * .38,
      fontWeight: 800,
      flexShrink: 0
    }
  }, i);
}
function Bdg({
  tipo
}) {
  const t = TG[tipo] || TG.ordinaria;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      padding: "3px 9px",
      borderRadius: 20,
      fontSize: 10,
      fontWeight: 700,
      background: t.bg,
      color: t.fg,
      textTransform: "uppercase",
      letterSpacing: ".06em",
      whiteSpace: "nowrap"
    }
  }, t.label);
}
export const getIS = () => ({
  padding: "12px 14px",
  borderRadius: 10,
  border: "1.5px solid " + C.border,
  background: C.card,
  color: C.text,
  fontSize: 15,
  outline: "none",
  width: "100%"
});
function Inp({
  label,
  full,
  col,
  style,
  ...p
}) {
  const IS = getIS();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 5,
      gridColumn: full ? "1/-1" : col
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: ".09em",
      color: C.textL
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({}, p, {
    style: {
      ...IS,
      ...(style || {})
    },
    onFocus: e => e.target.style.borderColor = C.accent,
    onBlur: e => e.target.style.borderColor = C.border
  })));
}
function Sel({
  label,
  full,
  col,
  style,
  children,
  ...p
}) {
  const IS = getIS();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 5,
      gridColumn: full ? "1/-1" : col
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: ".09em",
      color: C.textL
    }
  }, label), /*#__PURE__*/React.createElement("select", _extends({}, p, {
    style: {
      ...IS,
      ...(style || {})
    },
    onFocus: e => e.target.style.borderColor = C.accent,
    onBlur: e => e.target.style.borderColor = C.border
  }), children));
}
function TA({
  label,
  full,
  style,
  ...p
}) {
  const IS = getIS();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 5,
      gridColumn: full ? "1/-1" : undefined
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: ".09em",
      color: C.textL
    }
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({}, p, {
    style: {
      ...IS,
      resize: "vertical",
      minHeight: 68,
      ...(style || {})
    },
    onFocus: e => e.target.style.borderColor = C.accent,
    onBlur: e => e.target.style.borderColor = C.border
  })));
}
function Btn({
  children,
  variant,
  full,
  sm,
  style,
  ...p
}) {
  variant = variant || "primary";
  const vs = {
    primary: {
      bg: C.accent,
      color: C.bg,
      border: "none"
    },
    ghost: {
      bg: "transparent",
      color: C.textM,
      border: "1.5px solid " + C.border
    },
    soft: {
      bg: C.accentL,
      color: C.accent,
      border: "1.5px solid " + C.borderM
    },
    danger: {
      bg: C.redB,
      color: C.red,
      border: "1.5px solid " + C.red
    },
    info: {
      bg: C.blueB,
      color: C.blue,
      border: "1.5px solid " + C.blue
    }
  };
  const s = vs[variant] || vs.primary;
  return /*#__PURE__*/React.createElement("button", _extends({}, p, {
    style: {
      padding: sm ? "9px 14px" : "14px 20px",
      borderRadius: 12,
      cursor: "pointer",
      fontSize: sm ? 12.5 : 15,
      fontWeight: 700,
      fontFamily: C.font,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      transition: "all .15s",
      background: s.bg,
      color: s.color,
      border: s.border,
      width: full ? "100%" : undefined,
      ...(style || {})
    },
    onMouseDown: e => e.currentTarget.style.opacity = ".7",
    onMouseUp: e => e.currentTarget.style.opacity = "1",
    onTouchStart: e => e.currentTarget.style.opacity = ".7",
    onTouchEnd: e => e.currentTarget.style.opacity = "1"
  }), children);
}
function SH({
  title
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      margin: "20px 0 12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: C.text,
      fontFamily: C.fontSerif
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: C.border,
      marginLeft: 4
    }
  }));
}
function Toggle({
  options,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      background: C.border,
      borderRadius: 10,
      padding: 3,
      gap: 2
    }
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.v,
    onClick: () => onChange(o.v),
    style: {
      flex: 1,
      padding: "9px 0",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 700,
      fontFamily: C.font,
      transition: "all .2s",
      background: value === o.v ? C.card : "transparent",
      color: value === o.v ? C.accent : C.textL,
      boxShadow: value === o.v ? "0 1px 4px rgba(0,0,0,.15)" : "none"
    }
  }, o.l)));
}
function Toast({
  msg,
  type
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      top: 16,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      padding: "11px 18px",
      borderRadius: 20,
      background: type === "err" ? "#3A0808" : "#0F2A1A",
      color: type === "err" ? "#FFA0A0" : "#80FFB4",
      fontSize: 12.5,
      fontWeight: 700,
      boxShadow: "0 4px 24px rgba(0,0,0,.3)",
      whiteSpace: "nowrap",
      animation: "slideDown .25s"
    }
  }, msg);
}
function Sheet({
  open,
  onClose,
  title,
  children
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(0,0,0,.45)",
      animation: "fadeIn .2s"
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      background: C.bg,
      borderRadius: "20px 20px 0 0",
      maxHeight: "92vh",
      display: "flex",
      flexDirection: "column",
      animation: "slideUp .3s cubic-bezier(.32,1.2,.5,1)"
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      padding: "10px 0 4px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 4,
      borderRadius: 2,
      background: C.borderM
    }
  })), title && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 20px 14px",
      borderBottom: "1px solid #E8DDD0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      fontFamily: "'Lora',serif",
      color: C.text
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 22,
      color: C.textL,
      lineHeight: 1,
      padding: "0 0 0 16px"
    }
  }, "x")), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowY: "auto",
      flex: 1,
      padding: "16px 20px 40px"
    }
  }, children)));
}
function Stat({
  val,
  label,
  color
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: C.card,
      borderRadius: 14,
      padding: "13px 11px",
      border: "1px solid #E8DDD0",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color,
      fontFamily: "'Lora',serif",
      lineHeight: 1.1
    }
  }, val), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9.5,
      color: C.textL,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: ".07em",
      marginTop: 3
    }
  }, label));
}
function GiorniEditor({
  value,
  onChange
}) {
  const gl = value || blankGL();
  const IS = getIS();
  const setG = (key, field, val) => onChange({
    ...gl,
    [key]: {
      ...gl[key],
      [field]: val
    }
  });
  const tot = oreGL(gl).toFixed(1);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.textL,
      fontWeight: 600
    }
  }, "Clicca giorno per attivare, poi imposta orario"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 800,
      color: C.accent,
      background: C.accentL,
      padding: "3px 10px",
      borderRadius: 20
    }
  }, tot, "h/sett")), GG_KEYS.map(k => {
    const g = gl[k] || {
      attivo: false,
      inizio: "",
      fine: ""
    };
    const ore = g.attivo && g.inizio && g.fine ? calcOre(g.inizio, g.fine) : null;
    return /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 0",
        borderBottom: "1px solid " + C.border
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setG(k, "attivo", !g.attivo),
      style: {
        width: 44,
        height: 44,
        borderRadius: 10,
        border: "1.5px solid " + (g.attivo ? C.accent : C.border),
        background: g.attivo ? C.accent : C.card,
        color: g.attivo ? "#fff" : C.textL,
        fontWeight: 800,
        fontSize: 12,
        cursor: "pointer",
        flexShrink: 0,
        transition: "all .15s"
      }
    }, GG_LABEL[k]), g.attivo ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "time",
      value: g.inizio,
      onChange: e => setG(k, "inizio", e.target.value),
      style: {
        ...IS,
        padding: "8px 10px",
        fontSize: 13,
        flex: 1
      },
      onFocus: e => e.target.style.borderColor = C.accent,
      onBlur: e => e.target.style.borderColor = C.border
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: C.textL,
        flexShrink: 0
      }
    }, "\u2014"), /*#__PURE__*/React.createElement("input", {
      type: "time",
      value: g.fine,
      onChange: e => setG(k, "fine", e.target.value),
      style: {
        ...IS,
        padding: "8px 10px",
        fontSize: 13,
        flex: 1
      },
      onFocus: e => e.target.style.borderColor = C.accent,
      onBlur: e => e.target.style.borderColor = C.border
    }), ore && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 800,
        color: C.green,
        flexShrink: 0,
        minWidth: 28
      }
    }, ore.toFixed(1), "h")) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: C.textL,
        flex: 1,
        fontStyle: "italic"
      }
    }, "Giorno libero"));
  }));
}
function Riepilogo({
  c
}) {
  if (!c) return null;
  const conv = c.convivenza === "convivente",
    liv = c.livelloCCNL,
    info = LIV[liv] || {
      label: liv,
      desc: ""
    };
  const pagaB = conv ? n2(c.pagaMensile) : n2(c.pagaOraria) * n2(c.oreSett) * 52 / 12;
  const pagaCS = withScatti(pagaB, c.scatti);
  const rows = [["Convivenza", conv ? "Convivente" : "Non convivente"], ["Orario max", conv ? "54h/sett 10h/gg (Art.14)" : "40h/sett 8h/gg (Art.14)"], conv && MIN_CONV[liv] ? ["Min. mensile tab.", "euro " + MIN_CONV[liv].toFixed(2) + " (dic.2025)"] : [], MIN_ORA[liv] ? ["Min. orario tab.", "euro " + MIN_ORA[liv].toFixed(2) + "/h (dic.2025)"] : [], parseInt(c.scatti) > 0 ? ["Scatti (Art.37)", c.scatti + "x4% = +" + c.scatti * 4 + "%"] : [], pagaCS > 0 ? ["Paga stimata", "euro " + pagaCS.toFixed(2) + "/mese"] : [], pagaCS > 0 ? ["TFR/mese (Art.41)", "euro " + tfrM(pagaCS)] : [], pagaCS > 0 ? ["13a/mese (Art.39)", "euro " + tredM(pagaCS)] : [], conv ? ["Vitto conv.(Tab.F)", "euro " + (VITTO_GG * 30).toFixed(2) + "/mese"] : [], conv ? ["Alloggio conv.(Tab.F)", "euro " + (ALLOG_GG * 30).toFixed(2) + "/mese"] : [], ["Periodo prova (Art.12)", prova(liv, c.convivenza)], ["Preavviso <5aa (Art.40)", preav(c.oreSett, false)], ["Preavviso >5aa (Art.40)", preav(c.oreSett, true)], ["Ferie (Art.17)", "26 giorni lavorativi/anno"], ["Conserv. posto malattia", "<6m:10gg / >6m:45gg / >2aa:180gg"], ["Contrib. contr.(Art.54)", "0.06 euro/h (0.04 datore + 0.02 lav.)"]].filter(r => r.length === 2);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.card,
      borderRadius: 14,
      border: "1px solid " + C.borderM,
      padding: "14px 16px",
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 800,
      color: C.accent,
      textTransform: "uppercase",
      letterSpacing: ".09em",
      marginBottom: 10
    }
  }, "Riepilogo CCNL 2025-2028"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: C.textM,
      marginBottom: 12,
      lineHeight: 1.5,
      background: C.bg,
      borderRadius: 8,
      padding: "8px 10px",
      border: "1px solid " + C.border
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: C.text
    }
  }, info.label), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: C.textM
    }
  }, info.desc)), rows.map(function (r) {
    return /*#__PURE__*/React.createElement("div", {
      key: r[0],
      style: {
        display: "flex",
        gap: 8,
        padding: "7px 0",
        borderBottom: "1px solid " + C.border
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        color: C.textM,
        minWidth: 140,
        fontWeight: 700,
        flexShrink: 0
      }
    }, r[0]), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: C.text,
        flex: 1
      }
    }, r[1]));
  }));
}
function LoginScreen({
  onLogin
}) {
  C = THEMES[localStorage.getItem("bm_theme") || "chiaro"];
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const doLogin = async () => {
    if (!auth_fb) {
      setErr("Firebase non configurato. Aggiorna FB_CONFIG nel file.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth_fb.signInWithPopup(provider);
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: C.bg,
      padding: 32,
      fontFamily: C.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 32,
      fontWeight: 800,
      fontFamily: C.fontSerif,
      color: C.text,
      marginBottom: 8
    }
  }, "BabySitter Manager"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: C.textL,
      marginBottom: 40,
      textAlign: "center"
    }
  }, "CCNL Colf e Badanti 2025-2028"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.card,
      borderRadius: 20,
      padding: 28,
      width: "100%",
      maxWidth: 340,
      border: "1px solid " + C.border,
      boxShadow: "0 4px 24px rgba(0,0,0,.1)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: C.text,
      marginBottom: 20,
      textAlign: "center"
    }
  }, "Accedi per continuare"), /*#__PURE__*/React.createElement("button", {
    onClick: doLogin,
    disabled: loading,
    style: {
      width: "100%",
      padding: "14px 20px",
      borderRadius: 12,
      border: "1.5px solid " + C.border,
      background: C.card,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      fontSize: 15,
      fontWeight: 700,
      color: C.text,
      transition: "all .15s"
    },
    onMouseDown: e => e.currentTarget.style.background = C.bg,
    onMouseUp: e => e.currentTarget.style.background = C.card
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 48 48"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "#EA4335",
    d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#4285F4",
    d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#FBBC05",
    d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#34A853",
    d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "none",
    d: "M0 0h48v48H0z"
  })), loading ? "Accesso in corso..." : "Continua con Google"), err && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      fontSize: 11.5,
      color: C.red,
      background: C.redB,
      borderRadius: 8,
      padding: "8px 12px",
      lineHeight: 1.5
    }
  }, err), !auth_fb && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      fontSize: 11,
      color: C.textL,
      lineHeight: 1.6,
      textAlign: "center"
    }
  }, "Per usare login Google: crea progetto su ", /*#__PURE__*/React.createElement("strong", null, "console.firebase.google.com"), ", poi aggiorna ", /*#__PURE__*/React.createElement("code", {
    style: {
      background: C.bg,
      padding: "1px 4px",
      borderRadius: 4
    }
  }, "FB_CONFIG"), " nel file HTML.")));
}
function LiqSheet({
  c,
  db,
  onClose
}) {
  const p = db.persone.find(x => x.id === c.personaId);
  const pagaB = c.convivenza === "convivente" ? n2(c.pagaMensile) : n2(c.pagaOraria) * n2(c.oreSett) * 52 / 12;
  const pagaCS = withScatti(pagaB, c.scatti);
  const conv = c.convivenza === "convivente";
  const oreSett = n2(c.oreSett);
  const [dataFine, setDataFine] = useState(toDS(new Date()));
  const [motivazione, setMotivazione] = useState("dimissioni");
  const [ferieResidueInput, setFerieResidueInput] = useState("");
  const [anticTFR, setAnticTFR] = useState("0");
  if (!pagaCS) return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px",
      color: C.textL,
      textAlign: "center"
    }
  }, "Inserisci paga nel contratto.");
  const dataInizio = c.dataInizio || "";
  const inizio = parseDate(dataInizio);
  if (!inizio) return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px",
      color: C.textL,
      textAlign: "center"
    }
  }, "Inserisci data inizio contratto.");
  const fine = parseDate(dataFine) || new Date();
  const msServizio = Math.max(0, fine - inizio);
  const anniS = msServizio / (365.25 * 24 * 3600 * 1000);
  const mesiTot = Math.floor(msServizio / (30.4375 * 24 * 3600 * 1000));

  // TFR
  const retribAnnua = pagaCS * 12 + pagaCS + (conv ? (VITTO_GG + ALLOG_GG) * 365 : 0);
  const quotaAnnua = retribAnnua / 13.5;
  let tfrTot = 0;
  const aInizio = inizio.getFullYear(),
    aFine = fine.getFullYear();
  for (let a = aInizio; a <= aFine; a++) {
    const iniA = a === aInizio ? inizio : new Date(a, 0, 1);
    const finA = a === aFine ? fine : new Date(a, 11, 31);
    const giorniA = (finA - iniA) / (24 * 3600 * 1000) + 1;
    tfrTot += quotaAnnua * Math.min(giorniA / 365, 1);
  }
  const anticTFRv = Math.min(n2(anticTFR), tfrTot * 0.7);
  const tfrNetto = tfrTot - anticTFRv;

  // Preavviso
  const hasPrvPos = motivazione === "licenziamento_senza_preavviso" || motivazione === "dimissioni_giusta_causa";
  const hasPrvNeg = motivazione === "dimissioni_senza_preavviso";
  const giorniPrv = oreSett >= 25 ? anniS >= 5 ? 30 : 15 : mesiTot / 12 >= 2 ? 15 : 8;
  const giorniPrvEff = hasPrvNeg ? Math.ceil(giorniPrv / 2) : giorniPrv;
  const indPrv = hasPrvPos || hasPrvNeg ? pagaCS / 26 * giorniPrvEff : 0;

  // Ferie
  const annoFine = fine.getFullYear();
  const annoStr3 = annoFine + "-01";
  const inizioMFerie = dataInizio.substring(0, 7) > annoStr3 ? dataInizio.substring(0, 7) : annoStr3;
  const fineMFerie = dataFine.substring(0, 7);
  const mFerie = inizioMFerie <= fineMFerie ? Math.max(0, (parseInt(fineMFerie.split("-")[0]) - parseInt(inizioMFerie.split("-")[0])) * 12 + (parseInt(fineMFerie.split("-")[1]) - parseInt(inizioMFerie.split("-")[1])) + 1) : 0;
  const ferieMaturateAnno = Math.floor(CCNL.ferie * mFerie / 12);
  const ferieResidue = ferieResidueInput !== "" ? n2(ferieResidueInput) : ferieMaturateAnno;
  const indFerie = ferieResidue * (pagaCS / 26);

  // 13a pro-quota
  const mese13 = fine.getMonth() + 1;
  const ind13 = pagaCS * (mese13 / 12);
  const totLordo = tfrNetto + (hasPrvPos ? indPrv : hasPrvNeg ? -indPrv : 0) + indFerie + ind13;  return { totLordo }; };

export const GG_DEF = {}; // if missing
export const setC = (val) => { C = val; };
export const setCCNL = (val) => { CCNL = val; };
export const setVITTO_GG = (val) => { VITTO_GG = val; };
export const setALLOG_GG = (val) => { ALLOG_GG = val; };

