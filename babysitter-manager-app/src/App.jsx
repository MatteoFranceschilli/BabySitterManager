import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { n2, C, CCNL, withScatti, tfrM, tredM, TG, GG_LABEL, calcOre, calcImp, o2m, m2o, oreGL, THEMES, MESI, LIV, MIN_ORA, MIN_CONV, GG_KEYS, GG_DEF, blankC, blankP, blankGL, toDS, fmtOre, calcBustaPaga, preav, autoTipo, genGiornate, setC, setCCNL, setVITTO_GG, setALLOG_GG, VITTO_GG, ALLOG_GG, loadCCNL, defaultDb, blankG, getDow, isFest, isDom, calcTFRTotale, getIS } from './utils/constants';
import Av from './components/Av';
import Bdg from './components/Bdg';
import Btn from './components/Btn';
import GiorniEditor from './components/GiorniEditor';
import Inp from './components/Inp';
import LiqSheet from './components/LiqSheet';
import Row from './components/Row';
import Sel from './components/Sel';
import SH from './components/SH';
import Sheet from './components/Sheet';
import Stat from './components/Stat';
import StatRow from './components/StatRow';
import TA from './components/TA';
import Toast from './components/Toast';
import Toggle from './components/Toggle';
import LoginScreen from './pages/LoginScreen';
import Riepilogo from './pages/Riepilogo';
import InfoINPS from './pages/InfoINPS';
import { app, db_fs, auth_fb } from './services/firebase';
import { saveLocal, loadLocal, saveDB, loadDB_remote, useUserDB } from './hooks/useUserDB';
function App() {
  const [eCPrev, setECPrev] = useState(null); // to track changes later if needed

  const [user, setUser] = useState(undefined);
  const [db, setDb] = useState(() => {
    const d = loadLocal();
    return d ? {
      ...defaultDb(),
      ...d
    } : defaultDb();
  });
  const [dbLoaded, setDbLoaded] = useState(false);
  const saveQRef = useRef(null);

  // Auth listener
  useEffect(() => {
    if (!auth_fb) {
      setUser(null);
      return;
    }
    const unsub = auth_fb.onAuthStateChanged(async u => {
      setUser(u || null);
      if (u) {
        const remote = await loadDB_remote(u.uid);
        if (remote) {
          setDb({
            ...defaultDb(),
            ...remote
          });
          saveLocal(remote);
        }
        setDbLoaded(true);
      }
    });
    return unsub;
  }, []);
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem("bm_theme") || "chiaro");
  setC(THEMES[themeKey] || THEMES.chiaro);
  const applyTheme = key => {
    setC(THEMES[key] || THEMES.chiaro);
    setThemeKey(key);
    localStorage.setItem("bm_theme", key);
  };
  const [emailCfg, setEmailCfg] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bm_email") || "null") || {
        destinatario: "",
        oggetto: "Riepilogo giornate",
        testo: ""
      };
    } catch {
      return {
        destinatario: "",
        oggetto: "Riepilogo giornate",
        testo: ""
      };
    }
  });
  const saveEmail = cfg => {
    setEmailCfg(cfg);
    localStorage.setItem("bm_email", JSON.stringify(cfg));
  };
  const [ccnlCfg, setCcnlCfg] = useState(() => loadCCNL());
  const saveCCNL = cfg => {
    setCcnlCfg(cfg);
    setCCNL(cfg);
    setVITTO_GG(cfg.vittoGg);
    setALLOG_GG(cfg.allogGg);
    localStorage.setItem("bm_ccnl", JSON.stringify(cfg));
  };
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState(null);
  const [sv, setSv] = useState("");
  const [shP, setShP] = useState(false);
  const [shC, setShC] = useState(false);
  const [shG, setShG] = useState(false);
  const [editGid, setEditGid] = useState(null);
  const [shD, setShD] = useState(null);
  const [shGen, setShGen] = useState(null);
  const [shLiq, setShLiq] = useState(null); // contratto per simulatore liquidazione
  const [shBusta, setShBusta] = useState(false);
  const [shEmail, setShEmail] = useState(null);
  const [genDal, setGenDal] = useState("");
  const [genAl, setGenAl] = useState("");
  const [genPrev, setGenPrev] = useState([]);
  const [eP, setEP] = useState(null);
  const [ePid, setEPid] = useState(null);
  const [eC, setEC] = useState(null);
  useEffect(() => {
    if (eC) {
      const minBase = n2(eC.minimoRicalcolato) || MIN_ORA[eC.livelloCCNL] || 0;
      const indennita = (eC.tipo === 'baby-sitter' && !eC.bambinoMaggiore6) ? n2(eC.indennitaBambino || '0.84') : 0;
      const calcPaga = (minBase + indennita).toFixed(2);
      if (eC.pagaOraria !== calcPaga && (eC.pagaOraria === undefined || eC.pagaOraria !== calcPaga)) {
          // auto update
          setEC(prev => ({ ...prev, pagaOraria: calcPaga, pagaMensile: prev.oreSett ? o2m(calcPaga, prev.oreSett) : prev.pagaMensile }));
      }
    }
  }, [eC?.minimoRicalcolato, eC?.livelloCCNL, eC?.tipo, eC?.bambinoMaggiore6, eC?.indennitaBambino]);

  const [eCid, setECid] = useState(null);
  const [ng, setNg] = useState(blankG());
  const [selP, setSelP] = useState(null);
  const [fmese, setFmese] = useState("");
  const [ftipo, setFtipo] = useState("tutti");
  const notify = (m, t) => {
    setToast({
      m,
      t: t || "ok"
    });
    setTimeout(() => setToast(null), 2500);
  };
  const save = nd => {
    setDb(nd);
    setSv("saving");
    saveDB(user?.uid, nd).then(() => {
      setSv("saved");
      setTimeout(() => setSv(""), 1800);
    });
  };
  const pById = id => db.persone.find(p => p.id === id);
  const cByP = pid => db.contratti.find(c => c.personaId === pid);
  const openNP = () => {
    setEP(blankP());
    setEPid("new");
    setShP(true);
  };
  const openEP = p => {
    setEP({
      ...p
    });
    setEPid(p.id);
    setShP(true);
  };
  const closeP = () => {
    setShP(false);
    setTimeout(() => {
      setEP(null);
      setEPid(null);
    }, 300);
  };
  const saveP = () => {
    if (!eP.nome && !eP.cognome) return;
    const persone = ePid === "new" ? [...db.persone, eP] : db.persone.map(p => p.id === ePid ? eP : p);
    save({
      ...db,
      persone
    });
    closeP();
    notify("Persona salvata");
  };
  const delP = id => {
    if (!window.confirm("Eliminare persona e tutti i suoi dati?")) return;
    save({
      ...db,
      persone: db.persone.filter(p => p.id !== id),
      contratti: db.contratti.filter(c => c.personaId !== id),
      giornate: db.giornate.filter(g => g.personaId !== id)
    });
    setShD(null);
    notify("Eliminata");
  };
  const openNC = pid => {
    setEC(blankC(pid || ""));
    setECid("new");
    setShC(true);
  };
  const openEC = c => {
    setEC({
      ...c,
      giorniLavoro: c.giorniLavoro || blankGL()
    });
    setECid(c.id);
    setShC(true);
  };
  const closeC = () => {
    setShC(false);
    setTimeout(() => {
      setEC(null);
      setECid(null);
    }, 300);
  };
  const saveC = () => {
    if (!eC.personaId) return;
    const oreCalc = oreGL(eC.giorniLavoro);
    const oreSett = eC.oreSett || (oreCalc > 0 ? oreCalc.toFixed(1) : "");
    const contratti = eCid === "new" ? [...db.contratti, {
      ...eC,
      oreSett
    }] : db.contratti.map(c => c.id === eCid ? {
      ...eC,
      oreSett
    } : c);
    save({
      ...db,
      contratti
    });
    closeC();
    notify("Contratto salvato");
  };
  const delC = id => {
    save({
      ...db,
      contratti: db.contratti.filter(c => c.id !== id)
    });
    notify("Eliminato");
  };
  const openNG = pid => {
    setNg(blankG(pid || ""));
    setEditGid(null);
    setShG(true);
  };
  const openEG = g => {
    setNg({
      ...g
    });
    setEditGid(g.id);
    setShG(true);
  };
  const closeG = () => {
    setShG(false);
    setTimeout(() => {
      setNg(blankG(selP || ""));
      setEditGid(null);
    }, 300);
  };
  const addG = () => {
    if (!ng.data || !ng.personaId) return;
    const oc = calcOre(ng.oreEntrata, ng.oreUscita);
    if (editGid) {
      const giornate = db.giornate.map(g => g.id === editGid ? {
        ...ng,
        oreCalcolate: oc
      } : g).sort((a, b) => a.data.localeCompare(b.data));
      save({
        ...db,
        giornate
      });
      closeG();
      notify("Giornata modificata");
    } else {
      const g = {
        ...ng,
        id: uid(),
        oreCalcolate: oc
      };
      const giornate = [...db.giornate, g].sort((a, b) => a.data.localeCompare(b.data));
      save({
        ...db,
        giornate
      });
      closeG();
      notify("Giornata aggiunta");
      setFmese(ng.data.substring(0, 7));
    }
  };
  const delG = id => {
    save({
      ...db,
      giornate: db.giornate.filter(g => g.id !== id)
    });
    notify("Eliminata");
  };
  const openGen = c => {
    const oggi = toDS(new Date());
    const fine = c.dataFine || toDS(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
    setGenDal(c.dataInizio || oggi);
    setGenAl(fine);
    setGenPrev([]);
    setShGen(c);
  };
  useEffect(() => {
    if (!shGen || !genDal || !genAl) return;
    setGenPrev(genGiornate(shGen, genDal, genAl));
  }, [shGen, genDal, genAl]);
  const confermaGen = () => {
    if (!genPrev.length || !shGen) return;
    const existK = new Set(db.giornate.map(g => g.personaId + "_" + g.data));
    const nuove = genPrev.filter(g => !existK.has(g.personaId + "_" + g.data));
    const dup = genPrev.length - nuove.length;
    const giornate = [...db.giornate, ...nuove].sort((a, b) => b.data.localeCompare(a.data));
    const pid = shGen.personaId;
    save({
      ...db,
      giornate
    });
    setShGen(null);
    notify(nuove.length + " generate" + (dup > 0 ? " (" + dup + " duplicate saltate)" : ""));
    setTab(2);
    setSelP(pid);
    // auto-select mese dal
    if (genDal) setFmese(genDal.substring(0, 7));
  };
  const applyMin = () => {
    if (!eC) return;
    const conv = eC.convivenza === "convivente",
      liv = eC.livelloCCNL;
    // Usa minimoRicalcolato se disponibile, altrimenti tabellare
    const minOraBase = n2(eC.minimoRicalcolato) || MIN_ORA[liv] || 0;
    const minConvBase = conv ? MIN_CONV[liv] || 0 : 0;
    if (conv) {
      const b = withScatti(minConvBase > 0 ? minConvBase : minOraBase * n2(eC.oreSett) * 52 / 12, eC.scatti);
      const o = eC.oreSett ? m2o(b, eC.oreSett) : minOraBase.toString();
      setEC(c => ({
        ...c,
        pagaMensile: b.toFixed(2),
        pagaOraria: parseFloat(o).toFixed(2)
      }));
    } else {
      const o = withScatti(minOraBase, eC.scatti).toFixed(2);
      const m = eC.oreSett ? o2m(o, eC.oreSett) : "";
      setEC(c => ({
        ...c,
        pagaOraria: o,
        pagaMensile: m
      }));
    }
    notify("Minimi CCNL applicati" + (eC.minimoRicalcolato ? " (con ISTAT)" : ""));
  };
  const NAVTABS = [{
    l: "Persone",
    id: 0
  }, {
    l: "Contratti",
    id: 1
  }, {
    l: "Giornate",
    id: 2
  }, {
    l: "Config.",
    id: 3
  }];
  return (
    /*#__PURE__*/<div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: C.bg,
        fontFamily: C.font
      }}>
      {user === undefined && /*#__PURE__*/<div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.textL,
          fontSize: 14
        }}>
        Caricamento...
      </div>}
      {user === null && <LoginScreen />}
      {user !== undefined && user !== null && <React.Fragment>
        {toast && /*#__PURE__*/<Toast msg={toast.m} type={toast.t} />}
        {/*#__PURE__*/<div
          style={{
            background: C.headerBg || C.card,
            borderBottom: "1px solid " + C.border,
            padding: "14px 20px 12px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
          {/*#__PURE__*/<span
            style={{
              fontSize: 18,
              fontWeight: 800,
              fontFamily: C.fontSerif,
              color: C.text
            }}>
            BabySitter Manager
          </span>}
          {/*#__PURE__*/<div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
            {sv === "saving" && /*#__PURE__*/<span
              style={{
                fontSize: 11,
                color: C.textL
              }}>
              salvataggio...
            </span>}
            {sv === "saved" && /*#__PURE__*/<span
              style={{
                fontSize: 11,
                color: C.green
              }}>
              ✓ salvato
            </span>}
            {user && /*#__PURE__*/<div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
              {user.photoURL && /*#__PURE__*/<img
                src={user.photoURL}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "1.5px solid " + C.border
                }}
                alt="" />}
              {/*#__PURE__*/<button
                onClick={() => auth_fb && auth_fb.signOut()}
                style={{
                  background: "none",
                  border: "1px solid " + C.border,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 11,
                  color: C.textL,
                  padding: "4px 8px",
                  fontFamily: C.font
                }}>
                Esci
              </button>}
              {/*#__PURE__*/<button
                onClick={() => { if(window.confirm('Sei sicuro di voler resettare Firebase?')) { localStorage.removeItem('bm_fb_config'); window.location.reload(); } }}
                style={{
                  background: "none",
                  border: "1px solid " + C.red,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 11,
                  color: C.red,
                  padding: "4px 8px",
                  fontFamily: C.font
                }}>
                Reset FB
              </button>}
            </div>}
            {!user && /*#__PURE__*/<span
              style={{
                fontSize: 10,
                color: C.accent,
                background: C.accentL,
                padding: "3px 8px",
                borderRadius: 10,
                fontWeight: 700
              }}>
              CCNL 2025-28
            </span>}
          </div>}
        </div>}
        {/*#__PURE__*/<div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingBottom: 72
          }}>
          {tab === 0 && /*#__PURE__*/<div
            style={{
              padding: "16px"
            }}>
            {/*#__PURE__*/<div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16
              }}>
              {/*#__PURE__*/<div>
                {/*#__PURE__*/<h1
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    fontFamily: "'Lora',serif",
                    color: C.text,
                    lineHeight: 1
                  }}>
                  Anagrafica
                </h1>}
                {/*#__PURE__*/<p
                  style={{
                    fontSize: 12,
                    color: C.textL,
                    marginTop: 3
                  }}>
                  {db.persone.length}
                  {" persone"}
                </p>}
              </div>}
              {/*#__PURE__*/<Btn sm={true} onClick={openNP}>
                + Aggiungi
              </Btn>}
            </div>}
            {db.persone.length === 0 ? /*#__PURE__*/<div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: C.textL
              }}>
              {/*#__PURE__*/<div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.textM,
                  marginBottom: 16
                }}>
                Nessuna persona registrata
              </div>}
              {/*#__PURE__*/<Btn full={true} onClick={openNP}>
                + Nuova persona
              </Btn>}
            </div> : /*#__PURE__*/<div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10
              }}>
              {db.persone.map(p => {
                const c = cByP(p.id),
                  nG = db.giornate.filter(g => g.personaId === p.id).length;
                return (
                  /*#__PURE__*/<div
                    key={p.id}
                    onClick={() => setShD(p)}
                    style={{
                      background: C.card,
                      borderRadius: 16,
                      border: "1px solid #E8DDD0",
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 13,
                      cursor: "pointer"
                    }}
                    onMouseDown={e => e.currentTarget.style.background = "#F5EDE4"}
                    onMouseUp={e => e.currentTarget.style.background = C.card}
                    onTouchStart={e => e.currentTarget.style.background = "#F5EDE4"}
                    onTouchEnd={e => e.currentTarget.style.background = C.card}>
                    {/*#__PURE__*/<Av p={p} sz={46} />}
                    {/*#__PURE__*/<div
                      style={{
                        flex: 1,
                        minWidth: 0
                      }}>
                      {/*#__PURE__*/<div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: C.text
                        }}>
                        {(p.nome + " " + p.cognome).trim() || "---"}
                      </div>}
                      {p.codiceFiscale && /*#__PURE__*/<div
                        style={{
                          fontSize: 11,
                          color: C.textL,
                          fontFamily: "monospace",
                          marginTop: 2
                        }}>
                        {p.codiceFiscale}
                      </div>}
                      {/*#__PURE__*/<div
                        style={{
                          display: "flex",
                          gap: 6,
                          marginTop: 7,
                          flexWrap: "wrap"
                        }}>
                        {c && /*#__PURE__*/<span
                          style={{
                            fontSize: 10,
                            background: C.accentL,
                            color: C.accent,
                            padding: "2px 8px",
                            borderRadius: 20,
                            fontWeight: 700
                          }}>
                          {c.tipo}
                          {" Liv."}
                          {c.livelloCCNL}
                        </span>}
                        {c && /*#__PURE__*/<span
                          style={{
                            fontSize: 10,
                            background: c.convivenza === "convivente" ? C.blueB : C.greenB,
                            color: c.convivenza === "convivente" ? C.blue : C.green,
                            padding: "2px 8px",
                            borderRadius: 20,
                            fontWeight: 700
                          }}>
                          {c.convivenza === "convivente" ? "Conv." : "Non conv."}
                        </span>}
                        {/*#__PURE__*/<span
                          style={{
                            fontSize: 10,
                            background: "#F0EBE3",
                            color: C.textM,
                            padding: "2px 8px",
                            borderRadius: 20,
                            fontWeight: 700
                          }}>
                          {nG}
                          {" giornate"}
                        </span>}
                      </div>}
                    </div>}
                    {/*#__PURE__*/<span
                      style={{
                        color: C.borderM,
                        fontSize: 20
                      }}>
                      ›
                    </span>}
                  </div>
                );
              })}
            </div>}
          </div>}
          {tab === 1 && /*#__PURE__*/<div
            style={{
              padding: "16px"
            }}>
            {/*#__PURE__*/<div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16
              }}>
              {/*#__PURE__*/<div>
                {/*#__PURE__*/<h1
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    fontFamily: "'Lora',serif",
                    color: C.text,
                    lineHeight: 1
                  }}>
                  Contratti
                </h1>}
                {/*#__PURE__*/<p
                  style={{
                    fontSize: 12,
                    color: C.textL,
                    marginTop: 3
                  }}>
                  {db.contratti.length}
                  {" contratti"}
                </p>}
              </div>}
              {db.persone.length > 0 && /*#__PURE__*/<Btn sm={true} onClick={() => openNC()}>
                + Aggiungi
              </Btn>}
            </div>}
            {db.persone.length === 0 ? /*#__PURE__*/<div
              style={{
                background: C.card,
                borderRadius: 14,
                border: "1px solid #E6C84A",
                padding: "14px 16px",
                fontSize: 13,
                color: "#8A6500"
              }}>
              Aggiungi prima una persona nella tab Persone.
            </div> : db.contratti.length === 0 ? /*#__PURE__*/<div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: C.textL
              }}>
              {/*#__PURE__*/<div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.textM,
                  marginBottom: 16
                }}>
                Nessun contratto
              </div>}
              {/*#__PURE__*/<Btn full={true} onClick={() => openNC()}>
                + Nuovo contratto
              </Btn>}
            </div> : /*#__PURE__*/<div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12
              }}>
              {db.contratti.map(c => {
                const p = pById(c.personaId);
                const pagaB = c.convivenza === "convivente" ? n2(c.pagaMensile) : n2(c.pagaOraria) * n2(c.oreSett) * 52 / 12;
                const gl = c.giorniLavoro || {};
                const giorniAtt = GG_KEYS.filter(k => gl[k] && gl[k].attivo);
                return (
                  /*#__PURE__*/<div
                    key={c.id}
                    style={{
                      background: C.card,
                      borderRadius: 16,
                      border: "1px solid #E8DDD0",
                      padding: "14px 16px"
                    }}>
                    {/*#__PURE__*/<div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 12
                      }}>
                      {/*#__PURE__*/<Av p={p} sz={40} />}
                      {/*#__PURE__*/<div
                        style={{
                          flex: 1,
                          minWidth: 0
                        }}>
                        {/*#__PURE__*/<div
                          style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: C.text
                          }}>
                          {p ? (p.nome + " " + p.cognome).trim() : "---"}
                        </div>}
                        {/*#__PURE__*/<div
                          style={{
                            fontSize: 11,
                            color: C.textL,
                            marginTop: 1
                          }}>
                          {c.dataInizio ? "Dal " + c.dataInizio + (c.dataFine ? " al " + c.dataFine : "") : "Nessuna data"}
                        </div>}
                      </div>}
                      {/*#__PURE__*/<button
                        onClick={() => openEC(c)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 18,
                          padding: 6,
                          borderRadius: 8,
                          color: C.textL
                        }}>
                        ✎
                      </button>}
                      {/*#__PURE__*/<button
                        onClick={() => delC(c.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 15,
                          padding: 6,
                          borderRadius: 8,
                          color: C.red
                        }}>
                        🗑
                      </button>}
                    </div>}
                    {/*#__PURE__*/<div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        marginBottom: giorniAtt.length > 0 ? 10 : 0
                      }}>
                      {/*#__PURE__*/<span
                        style={{
                          fontSize: 11,
                          background: C.accentL,
                          color: C.accent,
                          padding: "3px 9px",
                          borderRadius: 20,
                          fontWeight: 700
                        }}>
                        {c.tipo}
                      </span>}
                      {/*#__PURE__*/<span
                        style={{
                          fontSize: 11,
                          background: C.blueB,
                          color: C.blue,
                          padding: "3px 9px",
                          borderRadius: 20,
                          fontWeight: 700
                        }}>
                        {LIV[c.livelloCCNL] ? LIV[c.livelloCCNL].label : "Liv." + c.livelloCCNL}
                      </span>}
                      {c.pagaOraria && /*#__PURE__*/<span
                        style={{
                          fontSize: 11,
                          background: C.greenB,
                          color: C.green,
                          padding: "3px 9px",
                          borderRadius: 20,
                          fontWeight: 700
                        }}>
                        €
                        {c.pagaOraria}
                        /h
                      </span>}
                      {c.minimoRicalcolato && n2(c.minimoRicalcolato) !== (MIN_ORA[c.livelloCCNL] || 0) && /*#__PURE__*/<span
                        style={{
                          fontSize: 11,
                          background: C.blueB,
                          color: C.blue,
                          padding: "3px 9px",
                          borderRadius: 20,
                          fontWeight: 700
                        }}>
                        ISTAT +
                        {c.istatPerc || 0}
                        %
                      </span>}
                    </div>}
                    {giorniAtt.length > 0 && /*#__PURE__*/<div
                      style={{
                        background: C.card,
                        borderRadius: 10,
                        border: "1px solid " + C.border,
                        padding: "10px 12px",
                        marginBottom: 10
                      }}>
                      {/*#__PURE__*/<div
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: C.accent,
                          textTransform: "uppercase",
                          letterSpacing: ".07em",
                          marginBottom: 8
                        }}>
                        Orario settimanale
                      </div>}
                      {giorniAtt.map(k => {
                        const g = gl[k];
                        const ore = g.inizio && g.fine ? calcOre(g.inizio, g.fine) : null;
                        return (
                          /*#__PURE__*/<div
                            key={k}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "3px 0"
                            }}>
                            {/*#__PURE__*/<span
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: C.text,
                                minWidth: 30
                              }}>
                              {GG_LABEL[k]}
                            </span>}
                            {/*#__PURE__*/<span
                              style={{
                                fontSize: 12,
                                color: C.textM
                              }}>
                              {g.inizio || "--:--"}
                              {" \u2014 "}
                              {g.fine || "--:--"}
                            </span>}
                            {ore && /*#__PURE__*/<span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: C.green,
                                marginLeft: "auto"
                              }}>
                              {ore.toFixed(1)}
                              h
                            </span>}
                          </div>
                        );
                      })}
                      {/*#__PURE__*/<div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: C.accent,
                          marginTop: 8,
                          paddingTop: 6,
                          borderTop: "1px solid " + C.border
                        }}>
                        {"Totale: "}
                        {oreGL(gl).toFixed(1)}
                        h/sett
                      </div>}
                    </div>}
                    {pagaB > 0 && /*#__PURE__*/<div
                      style={{
                        display: "flex",
                        gap: 8,
                        background: C.bg,
                        borderRadius: 10,
                        border: "1px solid " + C.border,
                        padding: "10px 12px",
                        marginBottom: giorniAtt.length > 0 ? 10 : 0
                      }}>
                      {/*#__PURE__*/<div
                        style={{
                          flex: 1,
                          textAlign: "center"
                        }}>
                        {/*#__PURE__*/<div
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: C.accent
                          }}>
                          €
                          {tfrM(pagaB)}
                        </div>}
                        {/*#__PURE__*/<div
                          style={{
                            fontSize: 9.5,
                            color: C.textL,
                            textTransform: "uppercase",
                            fontWeight: 700
                          }}>
                          TFR/mese
                        </div>}
                      </div>}
                      {/*#__PURE__*/<div
                        style={{
                          width: 1,
                          background: C.border
                        }} />}
                      {/*#__PURE__*/<div
                        style={{
                          flex: 1,
                          textAlign: "center"
                        }}>
                        {/*#__PURE__*/<div
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: C.green
                          }}>
                          €
                          {tredM(pagaB)}
                        </div>}
                        {/*#__PURE__*/<div
                          style={{
                            fontSize: 9.5,
                            color: C.textL,
                            textTransform: "uppercase",
                            fontWeight: 700
                          }}>
                          13a/mese
                        </div>}
                      </div>}
                      {/*#__PURE__*/<div
                        style={{
                          width: 1,
                          background: C.border
                        }} />}
                      {/*#__PURE__*/<div
                        style={{
                          flex: 1,
                          textAlign: "center"
                        }}>
                        {/*#__PURE__*/<div
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: C.blue
                          }}>
                          {c.scatti || 0}
                          x4%
                        </div>}
                        {/*#__PURE__*/<div
                          style={{
                            fontSize: 9.5,
                            color: C.textL,
                            textTransform: "uppercase",
                            fontWeight: 700
                          }}>
                          Scatti
                        </div>}
                      </div>}
                    </div>}
                    {giorniAtt.length > 0 && /*#__PURE__*/<Btn full={true} variant="soft" sm={true} onClick={() => openGen(c)}>
                      ▶ Genera giornate dal contratto
                    </Btn>}
                    {(() => {
                      const tfr = calcTFRTotale(c);
                      if (!tfr) return null;
                      return (
                        /*#__PURE__*/<div
                          style={{
                            background: C.bg,
                            borderRadius: 10,
                            border: "1px solid " + C.border,
                            padding: "12px 14px",
                            marginTop: 10
                          }}>
                          {/*#__PURE__*/<div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: C.green,
                              textTransform: "uppercase",
                              letterSpacing: ".07em",
                              marginBottom: 10
                            }}>
                            TFR maturato totale (Art.41)
                          </div>}
                          {/*#__PURE__*/<div
                            style={{
                              display: "flex",
                              gap: 10,
                              marginBottom: 10
                            }}>
                            {/*#__PURE__*/<div
                              style={{
                                flex: 1,
                                background: C.greenB,
                                borderRadius: 10,
                                padding: "10px 12px",
                                textAlign: "center"
                              }}>
                              {/*#__PURE__*/<div
                                style={{
                                  fontSize: 20,
                                  fontWeight: 800,
                                  color: C.green,
                                  fontFamily: C.fontSerif
                                }}>
                                {"\u20AC "}
                                {tfr.totale}
                              </div>}
                              {/*#__PURE__*/<div
                                style={{
                                  fontSize: 10,
                                  color: C.textL,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: ".06em",
                                  marginTop: 3
                                }}>
                                Totale maturato
                              </div>}
                            </div>}
                            {/*#__PURE__*/<div
                              style={{
                                flex: 1,
                                background: C.card,
                                borderRadius: 10,
                                padding: "10px 12px",
                                textAlign: "center",
                                border: "1px solid " + C.border
                              }}>
                              {/*#__PURE__*/<div
                                style={{
                                  fontSize: 16,
                                  fontWeight: 800,
                                  color: C.accent
                                }}>
                                {"\u20AC "}
                                {tfr.quotaAnnua}
                              </div>}
                              {/*#__PURE__*/<div
                                style={{
                                  fontSize: 10,
                                  color: C.textL,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: ".06em",
                                  marginTop: 3
                                }}>
                                Quota annua
                              </div>}
                            </div>}
                            {/*#__PURE__*/<div
                              style={{
                                flex: 1,
                                background: C.card,
                                borderRadius: 10,
                                padding: "10px 12px",
                                textAlign: "center",
                                border: "1px solid " + C.border
                              }}>
                              {/*#__PURE__*/<div
                                style={{
                                  fontSize: 16,
                                  fontWeight: 800,
                                  color: C.blue
                                }}>
                                {tfr.anniMaturati}
                                aa
                              </div>}
                              {/*#__PURE__*/<div
                                style={{
                                  fontSize: 10,
                                  color: C.textL,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: ".06em",
                                  marginTop: 3
                                }}>
                                Anni servizio
                              </div>}
                            </div>}
                          </div>}
                          {/*#__PURE__*/<div
                            style={{
                              fontSize: 10,
                              color: C.textL,
                              lineHeight: 1.5
                            }}>
                            Rivalutazione 1.5%/anno (quota garantita Art.41). Non include rivalutazione ISTAT.
                          </div>}
                        </div>
                      );
                    })()}
                    {/*#__PURE__*/<Btn
                      full={true}
                      variant="ghost"
                      sm={true}
                      style={{
                        marginTop: 8
                      }}
                      onClick={() => setShLiq(c)}>
                      📈 Simula liquidazione finale
                    </Btn>}
                    {/*#__PURE__*/<Btn
                      full={true}
                      variant="ghost"
                      sm={true}
                      style={{
                        marginTop: 8
                      }}
                      onClick={() => {
                        const pe = pById(c.personaId);
                        const gl2 = c.giorniLavoro || {};
                        const gaAtt = GG_KEYS.filter(k => gl2[k] && gl2[k].attivo);
                        const conv = c.convivenza === "convivente";
                        const pagaB = conv ? n2(c.pagaMensile) : n2(c.pagaOraria) * n2(c.oreSett) * 52 / 12;
                        const pagaCS = withScatti(pagaB, c.scatti);
                        const html = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"/>
                <title>Contratto ${pe ? (pe.nome + ' ' + pe.cognome).trim() : ''}</title>
                <style>
                  body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1E1008;margin:0;padding:40px;font-size:13px;line-height:1.6;}
                  h1{font-size:22px;font-weight:800;margin:0 0 4px;}
                  h2{font-size:14px;font-weight:700;color:#C8602A;text-transform:uppercase;letter-spacing:.08em;margin:24px 0 8px;border-bottom:1.5px solid #E8DDD0;padding-bottom:4px;}
                  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #C8602A;}
                  .badge{background:#FDF0E8;color:#C8602A;border:1px solid #F0C9A8;border-radius:20px;padding:3px 12px;font-size:11px;font-weight:700;display:inline-block;}
                  .grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px;}
                  .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F0E8E0;}
                  .label{color:#9A7A60;font-weight:600;}
                  .value{font-weight:600;text-align:right;}
                  .orario table{width:100%;border-collapse:collapse;margin-top:8px;}
                  .orario td,.orario th{padding:7px 12px;border:1px solid #E8DDD0;font-size:12px;}
                  .orario th{background:#FDF0E8;font-weight:700;color:#C8602A;}
                  .totali{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:8px;}
                  .totale-card{background:#F8F4EF;border-radius:8px;padding:10px 14px;text-align:center;}
                  .totale-val{font-size:16px;font-weight:800;color:#C8602A;}
                  .totale-lbl{font-size:10px;color:#9A7A60;text-transform:uppercase;letter-spacing:.06em;margin-top:2px;}
                  .footer{margin-top:40px;padding-top:20px;border-top:1px solid #E8DDD0;display:flex;justify-content:space-between;font-size:11px;color:#9A7A60;}
                  .firma{border-top:1px solid #1E1008;width:180px;margin-top:48px;padding-top:6px;font-size:11px;color:#5A3820;}
                  @media print{body{padding:24px;}}
                </style></head><body>
                <div class="header">
                  <div>
                    <div style="font-size:11px;color:#9A7A60;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Contratto di Lavoro Domestico</div>
                    <h1>${pe ? (pe.nome + ' ' + pe.cognome).trim() : '---'}</h1>
                    ${pe && pe.codiceFiscale ? `<div style="font-family:monospace;color:#9A7A60;font-size:12px">${pe.codiceFiscale}</div>` : ''}
                    <div style="margin-top:8px">
                      <span class="badge">${c.tipo}</span>
                      <span class="badge" style="margin-left:6px">Liv. ${c.livelloCCNL}</span>
                      <span class="badge" style="margin-left:6px">${conv ? 'Convivente' : 'Non convivente'}</span>
                    </div>
                  </div>
                  <div style="text-align:right;font-size:11px;color:#9A7A60">
                    <div>CCNL Colf e Badanti 2025-2028</div>
                    <div style="margin-top:4px">Stampato il ${new Date().toLocaleDateString('it-IT')}</div>
                  </div>
                </div>

                <h2>Dati Anagrafici</h2>
                <div class="grid">
                  ${pe && (pe.dataNascita || pe.luogoNascita) ? `<div class="row"><span class="label">Nascita</span><span class="value">${[pe.dataNascita, pe.luogoNascita].filter(Boolean).join(" a ")}</span></div>` : ''}
                  ${pe && pe.nazionalita ? `<div class="row"><span class="label">Nazionalità</span><span class="value">${pe.nazionalita}</span></div>` : ''}
                  ${pe && pe.telefono ? `<div class="row"><span class="label">Telefono</span><span class="value">${pe.telefono}</span></div>` : ''}
                  ${pe && pe.email ? `<div class="row"><span class="label">Email</span><span class="value">${pe.email}</span></div>` : ''}
                  ${pe && (pe.indirizzo || pe.citta) ? `<div class="row" style="grid-column:1/-1"><span class="label">Indirizzo</span><span class="value">${pe.indirizzo || ''}${pe.citta ? ', ' + pe.citta : ''}</span></div>` : ''}
                  ${pe && pe.tipoDocumento ? `<div class="row" style="grid-column:1/-1"><span class="label">Documento</span><span class="value">${[pe.tipoDocumento + ' ' + (pe.numeroDocumento || ''), pe.dataRilascio && 'Rilascio: ' + pe.dataRilascio, pe.dataScadenza && 'Scadenza: ' + pe.dataScadenza].filter(Boolean).join(' - ')}</span></div>` : ''}
                </div>

                <h2>Dati Contrattuali</h2>
                <div class="grid">
                  <div class="row"><span class="label">Data inizio</span><span class="value">${c.dataInizio || '---'}</span></div>
                  <div class="row"><span class="label">Data fine</span><span class="value">${c.dataFine || 'Indeterminato'}</span></div>
                  <div class="row"><span class="label">Livello CCNL</span><span class="value">${c.livelloCCNL} — ${LIV[c.livelloCCNL] ? LIV[c.livelloCCNL].label : ''}</span></div>
                  <div class="row"><span class="label">Convivenza</span><span class="value">${conv ? 'Convivente (max 54h/sett)' : 'Non convivente (max 40h/sett)'}</span></div>
                  <div class="row"><span class="label">Ore settimanali</span><span class="value">${c.oreSett || '---'}h</span></div>
                  <div class="row"><span class="label">Scatti anzianità</span><span class="value">${c.scatti || 0} (${(c.scatti || 0) * 4}%)</span></div>
                  <div class="row"><span class="label">Paga oraria</span><span class="value">€ ${c.pagaOraria || '---'}/h</span></div>
                  <div class="row"><span class="label">Paga mensile</span><span class="value">€ ${c.pagaMensile || '---'}</span></div>
                  ${n2(c.superminimo) > 0 ? `<div class="row"><span class="label">Superminimo</span><span class="value">€ ${c.superminimo}</span></div>` : ''}
                  <div class="row"><span class="label">Modalità pagamento</span><span class="value">${c.modalitaPagamento || '---'}</span></div>
                  ${c.iban ? `<div class="row" style="grid-column:1/-1"><span class="label">IBAN</span><span class="value" style="font-family:monospace">${c.iban}</span></div>` : ''}
                </div>

                ${pagaCS > 0 ? `
                <h2>Riepilogo Economico</h2>
                <div class="totali">
                  <div class="totale-card"><div class="totale-val">€ ${pagaCS.toFixed(2)}</div><div class="totale-lbl">Paga mensile stimata</div></div>
                  <div class="totale-card"><div class="totale-val">€ ${tfrM(pagaCS)}</div><div class="totale-lbl">TFR / mese (Art.41)</div></div>
                  <div class="totale-card"><div class="totale-val">€ ${tredM(pagaCS)}</div><div class="totale-lbl">Rateo 13a / mese</div></div>
                </div>` : ''}

                ${gaAtt.length > 0 ? `
                <h2>Orario Settimanale</h2>
                <div class="orario"><table>
                  <thead><tr><th>Giorno</th><th>Inizio</th><th>Fine</th><th>Ore</th></tr></thead>
                  <tbody>
                    ${gaAtt.map(k => {
                          const g2 = gl2[k];
                          const ore = g2.inizio && g2.fine ? calcOre(g2.inizio, g2.fine) : null;
                          return `<tr><td><strong>${GG_LABEL[k]}</strong></td><td>${g2.inizio || '--:--'}</td><td>${g2.fine || '--:--'}</td><td>${ore ? ore.toFixed(1) + 'h' : '---'}</td></tr>`;
                        }).join('')}
                    <tr style="background:#FDF0E8"><td colspan="3"><strong>Totale</strong></td><td><strong>${oreGL(gl2).toFixed(1)}h/sett</strong></td></tr>
                  </tbody>
                </table></div>` : ''}

                ${c.note ? `<h2>Note</h2><p style="color:#5A3820">${c.note}</p>` : ''}

                <h2>Disposizioni CCNL</h2>
                <div class="grid" style="font-size:12px">
                  <div class="row"><span class="label">Periodo prova (Art.12)</span><span class="value">${prova(c.livelloCCNL, c.convivenza)}</span></div>
                  <div class="row"><span class="label">Preavviso (Art.40)</span><span class="value">${preav(c.oreSett, false)} / ${preav(c.oreSett, true)}</span></div>
                  <div class="row"><span class="label">Ferie (Art.17)</span><span class="value">26 giorni lavorativi/anno</span></div>
                  <div class="row"><span class="label">Riposo settimanale</span><span class="value">${conv ? '36h (24h domenica + 12h)' : '24h domenica'}</span></div>
                </div>

                <div class="footer">
                  <div>Contratto regolato da CCNL Colf e Badanti 2025-2028 (Cod. CNEL H501)</div>
                </div>

                <div style="display:flex;gap:60px;margin-top:48px">
                  <div class="firma">Firma del Datore di Lavoro</div>
                  <div class="firma">Firma del Lavoratore</div>
                </div>

                </body></html>`;
                        const w = window.open('', '_blank', 'width=900,height=700');
                        w.document.write(html);
                        w.document.close();
                        setTimeout(() => w.print(), 600);
                      }}>
                      📷 Stampa / Scarica PDF
                    </Btn>}
                    {(() => {
                      const anno = new Date().getFullYear();
                      const gAnno = db.giornate.filter(g => g.personaId === c.personaId && g.data.startsWith(anno + ""));
                      if (!gAnno.length) return null;
                      // Mese più recente con giornate → ferie maturate proporzionali
                      const lastMese = gAnno.reduce((a, g) => g.data.substring(0, 7) > a ? g.data.substring(0, 7) : a, "");
                      // Mese di inizio maturazione: max(inizio contratto, gen anno corrente)
                      const annoStr = anno + "-01";
                      const inizioMat = c.dataInizio && c.dataInizio.substring(0, 7) > annoStr ? c.dataInizio.substring(0, 7) : annoStr;
                      const mesiMaturati = lastMese && lastMese >= inizioMat ? Math.max(0, (parseInt(lastMese.split("-")[0]) - parseInt(inizioMat.split("-")[0])) * 12 + (parseInt(lastMese.split("-")[1]) - parseInt(inizioMat.split("-")[1])) + 1) : 0;
                      const ferieMat = Math.floor(CCNL.ferie * mesiMaturati / 12);
                      // Permesso max Art.19: convivente 16h (12h se oreSett<=30), non-conv >=30h→12h, <30h proporzionale
                      const oreSett = n2(c.oreSett);
                      let permessoMax;
                      if (c.convivenza === "convivente") {
                        permessoMax = oreSett > 0 && oreSett <= 30 ? 12 : CCNL.permConv;
                      } else {
                        permessoMax = oreSett >= 30 ? CCNL.permNonConv : Math.round(CCNL.permNonConv * oreSett / 30 * 2) / 2;
                      }
                      const oreOrd = gAnno.filter(g => ["ordinaria", "straord_g", "straord_n", "domenicale", "festiva", "notturna"].includes(g.tipo)).reduce((a, g) => a + n2(g.oreCalcolate) + n2(g.oreExtra), 0);
                      const ferie = gAnno.filter(g => g.tipo === "ferie").length;
                      const orePermesso = gAnno.filter(g => g.tipo === "permesso").reduce((a, g) => a + n2(g.durata), 0);
                      const nPermNR = gAnno.filter(g => g.tipo === "permesso_nr").length;
                      const nLutto = gAnno.filter(g => g.tipo === "lutto").length;
                      const giorniMalattia = gAnno.filter(g => g.tipo === "malattia").length;
                      const giorniAssenza = gAnno.filter(g => g.tipo === "assenza").length;
                      const oreStrG = gAnno.filter(g => g.tipo === "straord_g").reduce((a, g) => a + n2(g.oreCalcolate) + n2(g.oreExtra), 0);
                      const oreStrN = gAnno.filter(g => g.tipo === "straord_n").reduce((a, g) => a + n2(g.oreCalcolate) + n2(g.oreExtra), 0);
                      const rows2 = [{
                        l: "Ore lavorate",
                        v: fmtOre(oreOrd),
                        c: C.accent
                      }, {
                        l: "Ferie godute / maturate",
                        v: ferie + " gg / " + ferieMat + " gg",
                        c: ferie > ferieMat ? C.red : C.green,
                        bar: ferie / ferieMat
                      }, {
                        l: "Ore permesso / massimo",
                        v: fmtOre(orePermesso) + " / " + permessoMax + "h",
                        c: orePermesso > permessoMax ? C.red : C.blue,
                        bar: orePermesso / permessoMax
                      }, oreStrG > 0 && {
                        l: "Straord. diurno",
                        v: fmtOre(oreStrG),
                        c: C.textM
                      }, oreStrN > 0 && {
                        l: "Straord. notturno",
                        v: fmtOre(oreStrN),
                        c: C.textM
                      }, giorniMalattia > 0 && {
                        l: "Giorni malattia",
                        v: giorniMalattia + " gg",
                        c: C.red
                      }, nPermNR > 0 && {
                        l: "Permesso non retribuito",
                        v: nPermNR + " gg",
                        c: C.textL
                      }, nLutto > 0 && {
                        l: "Giorni lutto (Art.19c3)",
                        v: nLutto + " gg",
                        c: "#4527A0"
                      }, giorniAssenza > 0 && {
                        l: "Giorni assenza",
                        v: giorniAssenza + " gg",
                        c: C.red
                      }].filter(Boolean);
                      return (
                        /*#__PURE__*/<div
                          style={{
                            background: C.bg,
                            borderRadius: 10,
                            border: "1px solid " + C.border,
                            padding: "12px 14px",
                            marginTop: 10
                          }}>
                          {/*#__PURE__*/<div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: C.accent,
                              textTransform: "uppercase",
                              letterSpacing: ".07em",
                              marginBottom: 10
                            }}>
                            {"Riepilogo "}
                            {anno}
                          </div>}
                          {rows2.map(r => /*#__PURE__*/<div
                            key={r.l}
                            style={{
                              marginBottom: 8
                            }}>
                            {/*#__PURE__*/<div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 3
                              }}>
                              {/*#__PURE__*/<span
                                style={{
                                  fontSize: 11.5,
                                  color: C.textM,
                                  fontWeight: 600
                                }}>
                                {r.l}
                              </span>}
                              {/*#__PURE__*/<span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 800,
                                  color: r.c
                                }}>
                                {r.v}
                              </span>}
                            </div>}
                            {r.bar != null && /*#__PURE__*/<div
                              style={{
                                height: 4,
                                borderRadius: 2,
                                background: C.border,
                                overflow: "hidden"
                              }}>
                              {/*#__PURE__*/<div
                                style={{
                                  height: "100%",
                                  borderRadius: 2,
                                  background: r.c,
                                  width: Math.min(r.bar, 1) * 100 + "%",
                                  transition: "width .4s"
                                }} />}
                            </div>}
                          </div>)}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>}
          </div>}
          {tab === 2 && (() => {
            // lista mesi disponibili (più recente prima)
            const allMonths = [...new Set(db.giornate.filter(g => !selP || g.personaId === selP).map(g => g.data.substring(0, 7)))].sort().reverse();

            // mese attivo: usa fmese se valido, altrimenti il più recente disponibile
            const activeMese = fmese && allMonths.includes(fmese) ? fmese : allMonths[0] || "";
            const mIdx = allMonths.indexOf(activeMese);
            const prevM = mIdx + 1 < allMonths.length ? allMonths[mIdx + 1] : null; // mese precedente = più vecchio
            const nextM = mIdx - 1 >= 0 ? allMonths[mIdx - 1] : null; // mese successivo = più recente
            const [yr, mm] = activeMese ? activeMese.split("-") : ["", ""];

            // giornate del mese attivo filtrate per persona e tipo
            const gMese = db.giornate.filter(g => {
              if (selP && g.personaId !== selP) return false;
              if (activeMese && !g.data.startsWith(activeMese)) return false;
              if (ftipo !== "tutti" && g.tipo !== ftipo) return false;
              return true;
            }).sort((a, b) => a.data.localeCompare(b.data));

            // paga oraria della persona selezionata (per calcolo importo)
            const pOra = selP ? (cByP(selP) || {}).pagaOraria : null;

            // totali mese
            const mOre = gMese.reduce((a, g) => a + n2(g.oreCalcolate) + n2(g.oreExtra), 0);
            const mPaga = pOra ? gMese.reduce((acc, g) => {
              const ore = n2(g.oreCalcolate) + n2(g.oreExtra);
              const ctr_=selP?cByP(selP):null; let imp = calcImp(ore, pOra, g.tipo); if (ctr_ && (ctr_.tipoRetribuzione === 'mensilizzata')) { const pm = n2(ctr_.pagaMensile); if (pm > 0) imp = (pm / 26 * (1 + (TG[g.tipo]?.perc || 0) / 100)).toFixed(2); }
              return acc + (imp ? n2(imp) : ore * n2(pOra));
            }, 0).toFixed(2) : null;
            return (
              /*#__PURE__*/<div
                style={{
                  padding: "16px"
                }}>
                {/*#__PURE__*/<div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14
                  }}>
                  {/*#__PURE__*/<div>
                    {/*#__PURE__*/<h1
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        fontFamily: "'Lora',serif",
                        color: C.text,
                        lineHeight: 1
                      }}>
                      Giornate
                    </h1>}
                    {/*#__PURE__*/<p
                      style={{
                        fontSize: 12,
                        color: C.textL,
                        marginTop: 3
                      }}>
                      Presenze e maggiorazioni CCNL
                    </p>}
                  </div>}
                  {db.persone.length > 0 && /*#__PURE__*/<Btn sm={true} onClick={() => openNG(selP || "")}>
                    + Aggiungi
                  </Btn>}
                </div>}
                {db.persone.length > 0 && /*#__PURE__*/<div
                  style={{
                    overflowX: "auto",
                    paddingBottom: 6,
                    marginBottom: 14
                  }}>
                  {/*#__PURE__*/<div
                    style={{
                      display: "flex",
                      gap: 8,
                      width: "max-content"
                    }}>
                    {/*#__PURE__*/<button
                      onClick={() => {
                        setSelP(null);
                        setFtipo("tutti");
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 20,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: !selP ? "1.5px solid " + C.accent : "1.5px solid " + C.border,
                        background: !selP ? C.accent : "transparent",
                        color: !selP ? "#fff" : C.textM,
                        whiteSpace: "nowrap"
                      }}>
                      Tutti
                    </button>}
                    {db.persone.map(p => /*#__PURE__*/<button
                      key={p.id}
                      onClick={() => {
                        setSelP(p.id);
                        setFtipo("tutti");
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 20,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: selP === p.id ? "1.5px solid " + C.accent : "1.5px solid " + C.border,
                        background: selP === p.id ? C.accent : "transparent",
                        color: selP === p.id ? "#fff" : C.textM,
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: 6
                      }}>
                      {/*#__PURE__*/<Av p={p} sz={18} />}
                      {(p.nome + " " + p.cognome).trim()}
                    </button>)}
                  </div>}
                </div>}
                {allMonths.length > 0 && /*#__PURE__*/<div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: C.card,
                    borderRadius: 14,
                    padding: "12px 16px",
                    marginBottom: 14,
                    border: "1px solid " + C.borderM
                  }}>
                  {/*#__PURE__*/<button
                    onClick={() => prevM && setFmese(prevM)}
                    disabled={!prevM}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: prevM ? "pointer" : "default",
                      fontSize: 22,
                      color: prevM ? C.accent : C.border,
                      padding: "0 4px",
                      lineHeight: 1,
                      fontWeight: 800
                    }}>
                    ‹
                  </button>}
                  {/*#__PURE__*/<div
                    style={{
                      textAlign: "center",
                      flex: 1
                    }}>
                    {/*#__PURE__*/<div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: C.text,
                        fontFamily: C.fontSerif,
                        lineHeight: 1
                      }}>
                      {MESI[parseInt(mm)]}
                      {" "}
                      {yr}
                    </div>}
                    {/*#__PURE__*/<div
                      style={{
                        fontSize: 11,
                        color: C.textM,
                        marginTop: 4
                      }}>
                      {gMese.length}
                      {" giornate"}
                    </div>}
                  </div>}
                  {/*#__PURE__*/<button
                    onClick={() => nextM && setFmese(nextM)}
                    disabled={!nextM}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: nextM ? "pointer" : "default",
                      fontSize: 22,
                      color: nextM ? C.accent : C.border,
                      padding: "0 4px",
                      lineHeight: 1,
                      fontWeight: 800
                    }}>
                    ›
                  </button>}
                </div>}
                {activeMese && /*#__PURE__*/<div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: 10
                  }}>
                  {/*#__PURE__*/<Stat val={gMese.length} label="Giornate" color={C.blue} />}
                  {/*#__PURE__*/<Stat val={mOre.toFixed(1) + "h"} label="Ore mese" color={C.accent} />}
                  {mPaga && /*#__PURE__*/<Stat val={"€" + mPaga} label="Importo" color={C.green} />}
                </div>}
                {activeMese && selP && gMese.length > 0 && (() => {
                  const ctr = cByP(selP);
                  const p = pById(selP);
                  const hasEmail = emailCfg.destinatario;
                  return (
                    /*#__PURE__*/<div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 14,
                        flexWrap: "wrap"
                      }}>
                      {ctr && ctr.pagaOraria && /*#__PURE__*/<Btn
                        variant="soft"
                        sm={true}
                        style={{
                          flex: 1
                        }}
                        onClick={() => setShBusta(true)}>
                        {"\uD83D\uDCC4 Busta paga "}
                        {MESI[parseInt(mm)]}
                        {" "}
                        {yr}
                      </Btn>}
                      {/*#__PURE__*/<Btn
                        variant="info"
                        sm={true}
                        style={{
                          flex: 1
                        }}
                        onClick={() => {
                          const gg = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
                          const mese = MESI[parseInt(mm)] + " " + yr;
                          const nomePers = p ? p.nome : "";
                          const cognomePers = p ? p.cognome : "";
                          // HTML table
                          const htmlTable = '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;font-size:13px">' + '<thead><tr style="background:#f0f0f0"><th style="text-align:left;padding:8px 12px">Data</th><th style="text-align:left;padding:8px 12px">Tipo giornata</th></tr></thead>' + '<tbody>' + gMese.map((g, i) => {
                            const dd = g.data.split("-");
                            const giorno = gg[getDow(g.data)];
                            const bg = i % 2 === 0 ? "#ffffff" : "#f9f9f9";
                            return '<tr style="background:' + bg + '"><td style="padding:7px 12px">' + dd[2] + "/" + dd[1] + "/" + dd[0] + " " + giorno + '</td><td style="padding:7px 12px">' + (TG[g.tipo] ? TG[g.tipo].label : g.tipo) + (g.tipo === "permesso" && g.durata ? " (" + Math.floor(n2(g.durata)) + "h" + (n2(g.durata) % 1 ? "30" : "") + ")" : '') + '</td></tr>';
                          }).join("") + '</tbody></table>';
                          const testoBase = emailCfg.testo || "Gentile {{NOME}} {{COGNOME}},\ndi seguito le giornate di {{MESE_ANNO}}:\n\n{{TABELLA}}";
                          const replAll = (s, nome, cognome, mese2, tab) => s.replace(/\{\{NOME\}\}/g, nome).replace(/\{\{COGNOME\}\}/g, cognome).replace(/\{\{MESE_ANNO\}\}/g, mese2).replace(/\{\{TABELLA\}\}/g, tab);
                          const bodyHtml = replAll(testoBase.replace(/\n/g, "<br>"), nomePers, cognomePers, mese, htmlTable);
                          const bodyPlain = replAll(testoBase, nomePers, cognomePers, mese, "Data\t\tTipo giornata\n" + gMese.map(g => {
                            const dd = g.data.split("-");
                            return dd[2] + "/" + dd[1] + "/" + dd[0] + " " + gg[getDow(g.data)] + "\t" + (TG[g.tipo] ? TG[g.tipo].label : g.tipo);
                          }).join("\n"));
                          const subjBase = emailCfg.oggetto || "Riepilogo giornate {{MESE_ANNO}}";
                          const subject = replAll(subjBase, nomePers, cognomePers, mese, "");
                          setShEmail({
                            to: emailCfg.destinatario || "",
                            subject,
                            bodyHtml,
                            bodyPlain
                          });
                        }}>
                        {"\u2709 "}
                        {emailCfg.destinatario ? "Invia email" : "Prepara email"}
                      </Btn>}
                    </div>
                  );
                })()}
                {/*#__PURE__*/<div
                  style={{
                    overflowX: "auto",
                    paddingBottom: 6,
                    marginBottom: 14
                  }}>
                  {/*#__PURE__*/<div
                    style={{
                      display: "flex",
                      gap: 7,
                      width: "max-content"
                    }}>
                    {/*#__PURE__*/<button
                      onClick={() => setFtipo("tutti")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 20,
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: ftipo === "tutti" ? "1.5px solid " + C.accent : "1.5px solid " + C.border,
                        background: ftipo === "tutti" ? C.accentL : "transparent",
                        color: ftipo === "tutti" ? C.accent : C.textL,
                        whiteSpace: "nowrap"
                      }}>
                      Tutti
                    </button>}
                    {Object.keys(TG).map(k => /*#__PURE__*/<button
                      key={k}
                      onClick={() => setFtipo(k)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 20,
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: ftipo === k ? "1.5px solid " + TG[k].fg : "1.5px solid " + C.border,
                        background: ftipo === k ? TG[k].bg : "transparent",
                        color: ftipo === k ? TG[k].fg : C.textL,
                        whiteSpace: "nowrap"
                      }}>
                      {TG[k].label}
                    </button>)}
                  </div>}
                </div>}
                {db.persone.length === 0 ? /*#__PURE__*/<div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: C.textL
                  }}>
                  {/*#__PURE__*/<div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: C.textM
                    }}>
                    Aggiungi prima una persona
                  </div>}
                </div> : gMese.length === 0 ? /*#__PURE__*/<div
                  style={{
                    textAlign: "center",
                    padding: "48px 20px",
                    color: C.textL
                  }}>
                  {/*#__PURE__*/<div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: C.textM
                    }}>
                    {"Nessuna giornata in "}
                    {MESI[parseInt(mm)]}
                    {" "}
                    {yr}
                  </div>}
                </div> : /*#__PURE__*/<div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 7
                  }}>
                  {gMese.map(g => {
                    const persona = pById(g.personaId),
                      ore = n2(g.oreCalcolate) + n2(g.oreExtra);
                    const ctr = persona ? cByP(persona.id) : null,
                      pga = ctr && ctr.pagaOraria ? ctr.pagaOraria : null;
                    const baseImp = pga && ore ? calcImp(ore, pga, g.tipo) : null; const isMens=ctr&&ctr.tipoRetribuzione==='mensilizzata'; const imp = isMens && n2(ctr.pagaMensile)>0 ? (n2(ctr.pagaMensile)/26 * (1+(TG[g.tipo]?.perc||0)/100)).toFixed(2) : baseImp,
                      ti = TG[g.tipo] || TG.ordinaria;
                    const dd = g.data.split("-")[2];
                    return (
                      /*#__PURE__*/<div
                        key={g.id}
                        style={{
                          background: C.card,
                          borderRadius: 12,
                          border: "1px solid #E8DDD0",
                          padding: "11px 13px",
                          display: "flex",
                          gap: 11,
                          alignItems: "flex-start"
                        }}>
                        {/*#__PURE__*/<div
                          style={{
                            minWidth: 34,
                            textAlign: "center",
                            paddingTop: 2
                          }}>
                          {/*#__PURE__*/<div
                            style={{
                              fontSize: 22,
                              fontWeight: 800,
                              color: C.text,
                              fontFamily: "'Lora',serif",
                              lineHeight: 1
                            }}>
                            {dd}
                          </div>}
                          {/*#__PURE__*/<div
                            style={{
                              fontSize: 9.5,
                              fontWeight: 700,
                              color: C.textL,
                              textTransform: "uppercase",
                              letterSpacing: ".06em",
                              marginTop: 2
                            }}>
                            {["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"][getDow(g.data)]}
                          </div>}
                        </div>}
                        {/*#__PURE__*/<div
                          style={{
                            flex: 1,
                            minWidth: 0
                          }}>
                          {/*#__PURE__*/<div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                              flexWrap: "wrap",
                              marginBottom: 4
                            }}>
                            {!selP && persona && /*#__PURE__*/<div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4
                              }}>
                              {/*#__PURE__*/<Av p={persona} sz={16} />}
                              {/*#__PURE__*/<span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: C.textM
                                }}>
                                {(persona.nome + " " + persona.cognome).trim()}
                              </span>}
                            </div>}
                            {/*#__PURE__*/<Bdg tipo={g.tipo} />}
                            {g.oreEntrata && g.oreUscita && /*#__PURE__*/<span
                              style={{
                                fontSize: 11,
                                color: C.textM
                              }}>
                              {g.oreEntrata}
                              -
                              {g.oreUscita}
                            </span>}
                            {g.durata && (g.tipo === "permesso" || g.tipo === "permesso_nr" || g.tipo === "lutto") && /*#__PURE__*/<span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: g.tipo === "permesso" ? C.blue : g.tipo === "lutto" ? "#4527A0" : C.textL
                              }}>
                              {Math.floor(n2(g.durata))}
                              h
                              {n2(g.durata) % 1 ? "30" : ""}
                            </span>}
                            {ore > 0 && /*#__PURE__*/<span
                              style={{
                                fontSize: 11.5,
                                fontWeight: 700,
                                color: C.accent
                              }}>
                              {ore.toFixed(1)}
                              h
                            </span>}
                            {imp && /*#__PURE__*/<span
                              style={{
                                fontSize: 11.5,
                                fontWeight: 800,
                                color: C.green,
                                background: C.greenB,
                                padding: "2px 7px",
                                borderRadius: 20
                              }}>
                              €
                              {imp}
                              {ti.perc > 0 ? " (+" + ti.perc + "%)" : ""}
                            </span>}
                          </div>}
                          {g.giustificativo && /*#__PURE__*/<div
                            style={{
                              fontSize: 11.5,
                              color: C.blue,
                              marginBottom: 2,
                              fontWeight: 700
                            }}>
                            {"doc: "}
                            {g.giustificativo}
                          </div>}
                          {g.note && /*#__PURE__*/<div
                            style={{
                              fontSize: 11,
                              color: C.textM,
                              fontStyle: "italic"
                            }}>
                            {g.note}
                          </div>}
                        </div>}
                        {/*#__PURE__*/<button
                          onClick={() => openEG(g)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: C.textL,
                            fontSize: 16,
                            lineHeight: 1,
                            padding: 4,
                            borderRadius: 6,
                            flexShrink: 0
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = C.accent}
                          onMouseLeave={e => e.currentTarget.style.color = C.textL}>
                          ✎
                        </button>}
                        {/*#__PURE__*/<button
                          onClick={() => delG(g.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: C.textL,
                            fontSize: 17,
                            lineHeight: 1,
                            padding: 3,
                            borderRadius: 6,
                            flexShrink: 0
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = C.red}
                          onMouseLeave={e => e.currentTarget.style.color = C.textL}>
                          x
                        </button>}
                      </div>
                    );
                  })}
                </div>}
              </div>
            );
          })()}
          {tab === 3 && /*#__PURE__*/<div
            style={{
              padding: "16px"
            }}>
            {/*#__PURE__*/<div
              style={{
                marginBottom: 24
              }}>
              {/*#__PURE__*/<h1
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  fontFamily: C.fontSerif,
                  color: C.text,
                  lineHeight: 1
                }}>
                Configurazione
              </h1>}
              {/*#__PURE__*/<p
                style={{
                  fontSize: 12,
                  color: C.textL,
                  marginTop: 3
                }}>
                Temi e impostazioni email
              </p>}
            </div>}
            {/*#__PURE__*/<div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: C.accent,
                textTransform: "uppercase",
                letterSpacing: ".09em",
                marginBottom: 12
              }}>
              Temi
            </div>}
            {/*#__PURE__*/<div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginBottom: 32
              }}>
              {Object.keys(THEMES).map(k => {
                const t = THEMES[k];
                const active = themeKey === k;
                return (
                  /*#__PURE__*/<div
                    key={k}
                    onClick={() => applyTheme(k)}
                    style={{
                      borderRadius: 16,
                      border: "2px solid " + (active ? t.accent : t.border),
                      padding: "18px",
                      cursor: "pointer",
                      transition: "all .2s",
                      background: t.bg,
                      position: "relative",
                      overflow: "hidden"
                    }}>
                    {/*#__PURE__*/<div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: "linear-gradient(90deg," + t.accent + "," + t.green + "," + t.blue + ")"
                      }} />}
                    {/*#__PURE__*/<div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        marginTop: 6
                      }}>
                      {/*#__PURE__*/<div
                        style={{
                          fontSize: 32,
                          flexShrink: 0
                        }}>
                        {t.emoji}
                      </div>}
                      {/*#__PURE__*/<div
                        style={{
                          flex: 1
                        }}>
                        {/*#__PURE__*/<div
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: t.text,
                            fontFamily: t.fontSerif,
                            marginBottom: 6
                          }}>
                          {t.name}
                        </div>}
                        {/*#__PURE__*/<div
                          style={{
                            display: "flex",
                            gap: 6
                          }}>
                          {[t.accent, t.green, t.blue, t.red, t.textM].map((col, i) => /*#__PURE__*/<div
                            key={i}
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              background: col,
                              border: "1.5px solid " + t.border
                            }} />)}
                        </div>}
                        {/*#__PURE__*/<div
                          style={{
                            marginTop: 10,
                            background: t.card,
                            borderRadius: 8,
                            padding: "8px 10px",
                            border: "1px solid " + t.border
                          }}>
                          {/*#__PURE__*/<div
                            style={{
                              fontSize: 10,
                              fontFamily: t.font,
                              color: t.textM,
                              marginBottom: 4
                            }}>
                            Anteprima
                          </div>}
                          {/*#__PURE__*/<div
                            style={{
                              display: "flex",
                              gap: 6
                            }}>
                            {/*#__PURE__*/<span
                              style={{
                                fontSize: 10,
                                background: t.accentL,
                                color: t.accent,
                                padding: "2px 8px",
                                borderRadius: 20,
                                fontWeight: 700,
                                fontFamily: t.font
                              }}>
                              baby-sitter
                            </span>}
                            {/*#__PURE__*/<span
                              style={{
                                fontSize: 10,
                                background: t.greenB,
                                color: t.green,
                                padding: "2px 8px",
                                borderRadius: 20,
                                fontWeight: 700,
                                fontFamily: t.font
                              }}>
                              12 giornate
                            </span>}
                          </div>}
                        </div>}
                      </div>}
                      {active && /*#__PURE__*/<div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: t.accent,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: 14,
                          color: t.bg,
                          fontWeight: 900
                        }}>
                        ✓
                      </div>}
                    </div>}
                  </div>
                );
              })}
            </div>}
            {/*#__PURE__*/<div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: C.accent,
                textTransform: "uppercase",
                letterSpacing: ".09em",
                marginBottom: 12
              }}>
              Email riepilogo giornate
            </div>}
            {/*#__PURE__*/<div
              style={{
                background: C.card,
                borderRadius: 16,
                border: "1px solid " + C.border,
                padding: "16px",
                marginBottom: 16
              }}>
              {/*#__PURE__*/<div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 12,
                  marginBottom: 16
                }}>
                {/*#__PURE__*/<Inp
                  label="Destinatario"
                  type="email"
                  value={emailCfg.destinatario}
                  onChange={e => saveEmail({
                    ...emailCfg,
                    destinatario: e.target.value
                  })}
                  placeholder="datore@email.it" />}
                {/*#__PURE__*/<div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}>
                  {/*#__PURE__*/<span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".09em",
                      color: C.textL
                    }}>
                    Oggetto
                  </span>}
                  {/*#__PURE__*/<div
                    style={{
                      display: "flex",
                      gap: 7,
                      flexWrap: "wrap",
                      marginBottom: 4
                    }}>
                    {[["{{NOME}}", "Nome"], ["{{COGNOME}}", "Cognome"], ["{{MESE_ANNO}}", "Mese anno"]].map(([tag, lbl]) => /*#__PURE__*/<button
                      key={tag}
                      onClick={() => {
                        const el = document.getElementById("bm_email_ogg");
                        if (el) {
                          const s = el.selectionStart,
                            e2 = el.selectionEnd,
                            v = el.value;
                          const nv = v.substring(0, s) + tag + v.substring(e2);
                          saveEmail({
                            ...emailCfg,
                            oggetto: nv
                          });
                          setTimeout(() => {
                            el.focus();
                            el.setSelectionRange(s + tag.length, s + tag.length);
                          }, 10);
                        } else saveEmail({
                          ...emailCfg,
                          oggetto: (emailCfg.oggetto || "") + tag
                        });
                      }}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: C.accentL,
                        color: C.accent,
                        border: "1.5px solid " + C.borderM
                      }}>
                      {lbl}
                    </button>)}
                  </div>}
                  {/*#__PURE__*/<input
                    id="bm_email_ogg"
                    value={emailCfg.oggetto}
                    onChange={e => saveEmail({
                      ...emailCfg,
                      oggetto: e.target.value
                    })}
                    placeholder="Riepilogo giornate {{MESE_ANNO}}"
                    style={{
                      ...getIS()
                    }}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.border} />}
                </div>}
                {/*#__PURE__*/<div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}>
                  {/*#__PURE__*/<span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".09em",
                      color: C.textL
                    }}>
                    Testo (usa campi dinamici)
                  </span>}
                  {/*#__PURE__*/<div
                    style={{
                      display: "flex",
                      gap: 7,
                      flexWrap: "wrap",
                      marginBottom: 4
                    }}>
                    {[["{{NOME}}", "Nome"], ["{{COGNOME}}", "Cognome"], ["{{MESE_ANNO}}", "Mese anno"], ["{{TABELLA}}", "Tabella giornate"]].map(([tag, lbl]) => /*#__PURE__*/<button
                      key={tag}
                      onClick={() => {
                        const el = document.getElementById("bm_email_body");
                        if (el) {
                          const s = el.selectionStart,
                            e2 = el.selectionEnd,
                            v = el.value;
                          const nv = v.substring(0, s) + tag + v.substring(e2);
                          saveEmail({
                            ...emailCfg,
                            testo: nv
                          });
                          setTimeout(() => {
                            el.focus();
                            el.setSelectionRange(s + tag.length, s + tag.length);
                          }, 10);
                        } else saveEmail({
                          ...emailCfg,
                          testo: (emailCfg.testo || "") + tag
                        });
                      }}
                      style={{
                        padding: "5px 11px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        background: C.accentL,
                        color: C.accent,
                        border: "1.5px solid " + C.borderM
                      }}>
                      {lbl}
                    </button>)}
                  </div>}
                  {/*#__PURE__*/<textarea
                    id="bm_email_body"
                    value={emailCfg.testo}
                    onChange={e => saveEmail({
                      ...emailCfg,
                      testo: e.target.value
                    })}
                    placeholder={"Gentile {{NOME}} {{COGNOME}},\ndi seguito le giornate di {{MESE_ANNO}}:\n\n{{TABELLA}}"}
                    style={{
                      ...getIS(),
                      resize: "vertical",
                      minHeight: 130,
                      fontSize: 13,
                      lineHeight: 1.6
                    }}
                    onFocus={e => e.target.style.borderColor = C.accent}
                    onBlur={e => e.target.style.borderColor = C.border} />}
                </div>}
              </div>}
              {/*#__PURE__*/<div
                style={{
                  fontSize: 11,
                  color: C.textL,
                  marginBottom: 12,
                  lineHeight: 1.6
                }}>
                La tabella viene generata automaticamente con le giornate del mese selezionato in Giornate. Usa il pulsante "Invia email" dalla tab Giornate dopo aver selezionato persona e mese.
              </div>}
              {/*#__PURE__*/<div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.textM,
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  marginBottom: 8
                }}>
                Anteprima tabella
              </div>}
              {/*#__PURE__*/<div
                style={{
                  overflowX: "auto"
                }}>
                {/*#__PURE__*/<table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                    fontFamily: C.font
                  }}>
                  {/*#__PURE__*/<thead>
                    {/*#__PURE__*/<tr
                      style={{
                        background: C.bg
                      }}>
                      {/*#__PURE__*/<th
                        style={{
                          padding: "8px 10px",
                          textAlign: "left",
                          borderBottom: "2px solid " + C.border,
                          color: C.textM,
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: ".06em"
                        }}>
                        Data
                      </th>}
                      {/*#__PURE__*/<th
                        style={{
                          padding: "8px 10px",
                          textAlign: "left",
                          borderBottom: "2px solid " + C.border,
                          color: C.textM,
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: ".06em"
                        }}>
                        Tipo
                      </th>}
                      {/*#__PURE__*/<th
                        style={{
                          padding: "8px 10px",
                          textAlign: "left",
                          borderBottom: "2px solid " + C.border,
                          color: C.textM,
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: ".06em"
                        }}>
                        Ore
                      </th>}
                      {/*#__PURE__*/<th
                        style={{
                          padding: "8px 10px",
                          textAlign: "left",
                          borderBottom: "2px solid " + C.border,
                          color: C.textM,
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: ".06em"
                        }}>
                        Tipo giornata
                      </th>}
                    </tr>}
                  </thead>}
                  {/*#__PURE__*/<tbody>
                    {["01/05/2025", "02/05/2025", "05/05/2025"].map((d, i) => /*#__PURE__*/<tr
                      key={i}
                      style={{
                        background: i % 2 === 0 ? C.card : C.bg
                      }}>
                      {/*#__PURE__*/<td
                        style={{
                          padding: "7px 10px",
                          borderBottom: "1px solid " + C.border,
                          color: C.text,
                          fontWeight: 600
                        }}>
                        {d}
                      </td>}
                      {/*#__PURE__*/<td
                        style={{
                          padding: "7px 10px",
                          borderBottom: "1px solid " + C.border,
                          color: C.textM
                        }}>
                        Ordinaria
                      </td>}
                      {/*#__PURE__*/<td
                        style={{
                          padding: "7px 10px",
                          borderBottom: "1px solid " + C.border,
                          color: C.accent,
                          fontWeight: 700
                        }}>
                        5.0h
                      </td>}
                      {/*#__PURE__*/<td
                        style={{
                          padding: "7px 10px",
                          borderBottom: "1px solid " + C.border,
                          color: C.blue
                        }}>
                        —
                      </td>}
                    </tr>)}
                  </tbody>}
                </table>}
              </div>}
            </div>}
          </div>}
        </div>}
        {/*#__PURE__*/<div
          style={{
            height: 64,
            background: C.navBg || C.card,
            borderTop: "1px solid " + C.border,
            display: "flex",
            flexShrink: 0
          }}>
          {NAVTABS.map(n => /*#__PURE__*/<button
            key={n.id}
            onClick={() => setTab(n.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px 0",
              position: "relative"
            }}>
            {/*#__PURE__*/<span
              style={{
                fontSize: 10,
                fontWeight: tab === n.id ? 800 : 500,
                color: tab === n.id ? C.accent : C.textL,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                fontFamily: C.font
              }}>
              {n.l}
            </span>}
            {tab === n.id && /*#__PURE__*/<div
              style={{
                width: 24,
                height: 2.5,
                borderRadius: 2,
                background: C.accent
              }} />}
          </button>)}
        </div>}
        {/*#__PURE__*/<Sheet open={!!shD} onClose={() => setShD(null)} title="">
          {shD && (() => {
            const p = shD,
              c = cByP(p.id),
              nG = db.giornate.filter(g => g.personaId === p.id).length;
            const datesDoc = [p.dataRilascio && `Rilascio: ${p.dataRilascio}`, p.dataScadenza && `Scadenza: ${p.dataScadenza}`].filter(Boolean).join(" - ");
            const rows2 = [(p.dataNascita || p.luogoNascita) && ["Nascita", [p.dataNascita, p.luogoNascita].filter(Boolean).join(" a ")], p.nazionalita && ["Nazionalita", p.nazionalita], p.telefono && ["Telefono", p.telefono], p.email && ["Email", p.email], (p.indirizzo || p.citta) && ["Indirizzo", p.indirizzo + (p.citta ? ", " + p.citta : "")], p.tipoDocumento && ["Documento", [p.tipoDocumento + " " + p.numeroDocumento, datesDoc].filter(Boolean).join(" - ")]].filter(Boolean);
            return (
              /*#__PURE__*/<div>
                {/*#__PURE__*/<div
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    marginBottom: 20
                  }}>
                  {/*#__PURE__*/<Av p={p} sz={56} />}
                  {/*#__PURE__*/<div>
                    {/*#__PURE__*/<div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        fontFamily: "'Lora',serif",
                        color: C.text,
                        lineHeight: 1.2
                      }}>
                      {(p.nome + " " + p.cognome).trim() || "---"}
                    </div>}
                    {p.codiceFiscale && /*#__PURE__*/<div
                      style={{
                        fontSize: 11,
                        color: C.textL,
                        fontFamily: "monospace",
                        marginTop: 3
                      }}>
                      {p.codiceFiscale}
                    </div>}
                    {/*#__PURE__*/<div
                      style={{
                        display: "flex",
                        gap: 6,
                        marginTop: 8
                      }}>
                      {c && /*#__PURE__*/<span
                        style={{
                          fontSize: 11,
                          background: C.accentL,
                          color: C.accent,
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontWeight: 700
                        }}>
                        {c.tipo}
                        {" Liv."}
                        {c.livelloCCNL}
                      </span>}
                      {/*#__PURE__*/<span
                        style={{
                          fontSize: 11,
                          background: C.greenB,
                          color: C.green,
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontWeight: 700
                        }}>
                        {nG}
                        {" giornate"}
                      </span>}
                    </div>}
                  </div>}
                </div>}
                {rows2.map(function (r) {
                  return (
                    /*#__PURE__*/<div
                      key={r[0]}
                      style={{
                        display: "flex",
                        gap: 10,
                        padding: "9px 0",
                        borderBottom: "1px solid #E8DDD0"
                      }}>
                      {/*#__PURE__*/<span
                        style={{
                          fontSize: 12,
                          color: C.textL,
                          minWidth: 110,
                          fontWeight: 600
                        }}>
                        {r[0]}
                      </span>}
                      {/*#__PURE__*/<span
                        style={{
                          fontSize: 13,
                          color: C.text,
                          flex: 1,
                          wordBreak: "break-all"
                        }}>
                        {r[1]}
                      </span>}
                    </div>
                  );
                })}
                {c && /*#__PURE__*/<Riepilogo c={c} />}
                {/*#__PURE__*/<div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginTop: 20
                  }}>
                  {/*#__PURE__*/<Btn
                    full={true}
                    onClick={() => {
                      setShD(null);
                      openEP(p);
                    }}>
                    Modifica anagrafica
                  </Btn>}
                  {/*#__PURE__*/<Btn
                    full={true}
                    variant="soft"
                    onClick={() => {
                      setShD(null);
                      c ? openEC(c) : openNC(p.id);
                    }}>
                    {c ? "Modifica contratto" : "Crea contratto"}
                  </Btn>}
                  {c && c.giorniLavoro && GG_KEYS.some(k => c.giorniLavoro[k] && c.giorniLavoro[k].attivo) && /*#__PURE__*/<Btn
                    full={true}
                    variant="info"
                    onClick={() => {
                      setShD(null);
                      openGen(c);
                    }}>
                    ▶ Genera giornate
                  </Btn>}
                  {/*#__PURE__*/<Btn
                    full={true}
                    variant="ghost"
                    onClick={() => {
                      setShD(null);
                      setSelP(p.id);
                      setTab(2);
                    }}>
                    Vedi giornate
                  </Btn>}
                  {/*#__PURE__*/<Btn full={true} variant="danger" onClick={() => delP(p.id)}>
                    Elimina persona
                  </Btn>}
                  {/*#__PURE__*/<Btn full={true} variant="ghost" onClick={() => setShD(null)}>
                    Chiudi
                  </Btn>}
                </div>}
              </div>
            );
          })()}
        </Sheet>}
        {/*#__PURE__*/<Sheet
          open={shP}
          onClose={closeP}
          title={ePid === "new" ? "Nuova Persona" : "Modifica Persona"}>
          {eP && /*#__PURE__*/<div>
            {/*#__PURE__*/<SH title="Dati Personali" />}
            {/*#__PURE__*/<div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12
              }}>
              {/*#__PURE__*/<Inp
                label="Nome"
                value={eP.nome}
                onChange={e => setEP(p => ({
                  ...p,
                  nome: e.target.value
                }))}
                placeholder="Maria" />}
              {/*#__PURE__*/<Inp
                label="Cognome"
                value={eP.cognome}
                onChange={e => setEP(p => ({
                  ...p,
                  cognome: e.target.value
                }))}
                placeholder="Rossi" />}
              {/*#__PURE__*/<Inp
                label="Data Nascita"
                type="date"
                value={eP.dataNascita}
                onChange={e => setEP(p => ({
                  ...p,
                  dataNascita: e.target.value
                }))} />}
              {/*#__PURE__*/<Inp
                label="Cod. Fiscale"
                value={eP.codiceFiscale}
                onChange={e => setEP(p => ({
                  ...p,
                  codiceFiscale: e.target.value.toUpperCase()
                }))}
                maxLength={16} />}
              {/*#__PURE__*/<Inp
                label="Luogo di nascita"
                value={eP.luogoNascita || ""}
                onChange={e => setEP(p => ({
                  ...p,
                  luogoNascita: e.target.value
                }))}
                placeholder="Roma" />}
              {/*#__PURE__*/<Inp
                label="Nazionalita"
                value={eP.nazionalita}
                onChange={e => setEP(p => ({
                  ...p,
                  nazionalita: e.target.value
                }))}
                placeholder="Italiana" />}
            </div>}
            {/*#__PURE__*/<SH title="Documento" />}
            {/*#__PURE__*/<div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12
              }}>
              {/*#__PURE__*/<Sel
                label="Tipo"
                value={eP.tipoDocumento}
                onChange={e => setEP(p => ({
                  ...p,
                  tipoDocumento: e.target.value
                }))}>
                {/*#__PURE__*/<option value="">
                  ---
                </option>}
                {/*#__PURE__*/<option value="CI">
                  Carta d'Identita
                </option>}
                {/*#__PURE__*/<option value="passaporto">
                  Passaporto
                </option>}
                {/*#__PURE__*/<option value="patente">
                  Patente
                </option>}
                {/*#__PURE__*/<option value="permesso_soggiorno">
                  Permesso Soggiorno
                </option>}
              </Sel>}
              {/*#__PURE__*/<Inp
                label="Numero"
                value={eP.numeroDocumento}
                onChange={e => setEP(p => ({
                  ...p,
                  numeroDocumento: e.target.value
                }))}
                placeholder="AA1234567" />}
              {/*#__PURE__*/<Inp
                label="Data rilascio"
                type="date"
                value={eP.dataRilascio || ""}
                onChange={e => setEP(p => ({
                  ...p,
                  dataRilascio: e.target.value
                }))} />}
              {/*#__PURE__*/<Inp
                label="Data scadenza"
                type="date"
                value={eP.dataScadenza || ""}
                onChange={e => setEP(p => ({
                  ...p,
                  dataScadenza: e.target.value
                }))} />}
            </div>}
            {/*#__PURE__*/<SH title="Contatti" />}
            {/*#__PURE__*/<div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12
              }}>
              {/*#__PURE__*/<Inp
                label="Indirizzo"
                full={true}
                value={eP.indirizzo}
                onChange={e => setEP(p => ({
                  ...p,
                  indirizzo: e.target.value
                }))}
                placeholder="Via Roma, 1" />}
              {/*#__PURE__*/<Inp
                label="Citta"
                value={eP.citta}
                onChange={e => setEP(p => ({
                  ...p,
                  citta: e.target.value
                }))}
                placeholder="Milano" />}
              {/*#__PURE__*/<Inp
                label="CAP"
                value={eP.cap}
                onChange={e => setEP(p => ({
                  ...p,
                  cap: e.target.value
                }))}
                maxLength={5} />}
              {/*#__PURE__*/<Inp
                label="Telefono"
                type="tel"
                value={eP.telefono}
                onChange={e => setEP(p => ({
                  ...p,
                  telefono: e.target.value
                }))}
                placeholder="+39 333..." />}
              {/*#__PURE__*/<Inp
                label="Email"
                full={true}
                type="email"
                value={eP.email}
                onChange={e => setEP(p => ({
                  ...p,
                  email: e.target.value
                }))}
                placeholder="maria@email.it" />}
            </div>}
            {/*#__PURE__*/<div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 22
              }}>
              {/*#__PURE__*/<Btn full={true} onClick={saveP}>
                Salva
              </Btn>}
              {/*#__PURE__*/<Btn
                variant="ghost"
                onClick={closeP}
                style={{
                  minWidth: 80
                }}>
                Annulla
              </Btn>}
            </div>}
          </div>}
        </Sheet>}
        {/*#__PURE__*/<Sheet
          open={shC}
          onClose={closeC}
          title={eCid === "new" ? "Nuovo Contratto" : "Modifica Contratto"}>
          {eC && /*#__PURE__*/<div>
            {/*#__PURE__*/<SH title="Intestatario" />}
            {/*#__PURE__*/<Sel
              label="Persona *"
              value={eC.personaId}
              onChange={e => setEC(c => ({
                ...c,
                personaId: e.target.value
              }))}>
              {/*#__PURE__*/<option value="">
                --- Seleziona ---
              </option>}
              {db.persone.map(p => /*#__PURE__*/<option key={p.id} value={p.id}>
                {(p.nome + " " + p.cognome).trim()}
              </option>)}
            </Sel>}
            {/*#__PURE__*/<SH title="Convivenza (Art.14)" />}
            {/*#__PURE__*/<Toggle
              options={[{
                v: "convivente",
                l: "Convivente"
              }, {
                v: "non-convivente",
                l: "Non convivente"
              }]}
              value={eC.convivenza}
              onChange={v => setEC(c => ({
                ...c,
                convivenza: v
              }))} />}
            {/*#__PURE__*/<div
              style={{
                fontSize: 11,
                color: C.textL,
                marginTop: 8
              }}>
              {eC.convivenza === "convivente" ? "Max 54h/sett, 10h/gg" : "Max 40h/sett, 8h/gg"}
            </div>}
            {/*#__PURE__*/<SH title="Tipo retribuzione" />}
            {/*#__PURE__*/<Toggle
              options={[{
                v: "oraria",
                l: "Su base oraria"
              }, {
                v: "mensilizzata",
                l: "Mensilizzata"
              }]}
              value={eC.tipoRetribuzione || "oraria"}
              onChange={v => setEC(c => ({
                ...c,
                tipoRetribuzione: v
              }))} />}
            {/*#__PURE__*/<div
              style={{
                fontSize: 11,
                color: C.textL,
                marginTop: 8,
                lineHeight: 1.6
              }}>
              {(eC.tipoRetribuzione || "oraria") === "oraria" ? "Paghi le ore effettivamente lavorate ogni mese. Importo variabile." : "Stipendio fisso mensile. Le assenze si decurtano di 1/26 al giorno (Art.34 CCNL)."}
            </div>}

            {/*#__PURE__*/<SH title="Modalità calcolo Contributi INPS" />}
            {/*#__PURE__*/<Sel 
              value={eC.calcContributi || "reale"}
              onChange={e => setEC(c => ({
                ...c,
                calcContributi: e.target.value
              }))} 
            >
              <option value="reale">Reale (Scaglioni base alle ore)</option>
              <option value="agevolata">Agevolata fissa (&gt;24 h/settimana)</option>
            </Sel>}
            {/*#__PURE__*/<div
              style={{
                fontSize: 11,
                color: C.textL,
                marginTop: 8,
                marginBottom: 16,
                lineHeight: 1.6
              }}>
              {(eC.calcContributi || "reale") === "reale" ? "Calcolo a scaglioni in base alla retribuzione oraria effettiva (dinamico)." : "Usa sempre la fascia agevolata fissa (€ 1.30/ora nominale circa)."}
            </div>}

            {/*#__PURE__*/<SH title="Tipo e Livello CCNL (Art.9)" />}
            {/*#__PURE__*/<div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 12
              }}>
              {/*#__PURE__*/<Sel
                label="Tipo"
                value={eC.tipo}
                onChange={e => setEC(c => ({
                  ...c,
                  tipo: e.target.value
                }))}>
                {["baby-sitter", "colf", "badante", "apprendistato", "occasionale"].map(t => /*#__PURE__*/<option key={t} value={t}>
                  {t}
                </option>)}
              </Sel>}
              {/*#__PURE__*/<Sel
                label="Livello CCNL"
                value={eC.livelloCCNL}
                onChange={e => setEC(c => ({
                  ...c,
                  livelloCCNL: e.target.value
                }))}>
                {Object.keys(LIV).map(l => /*#__PURE__*/<option key={l} value={l}>
                  {LIV[l].label}
                </option>)}
              </Sel>}
            </div>}
            {eC.tipo === 'baby-sitter' && /*#__PURE__*/<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}> {/*#__PURE__*/<div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}> {/*#__PURE__*/<span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em', color: C.textL }}> Bambino/a &gt; 6 anni </span>} {/*#__PURE__*/<Toggle
                    value={eC.bambinoMaggiore6 ? 1 : 0}
                    options={[{v: 1, l: 'Sì'}, {v: 0, l: 'No'}]}
                    onChange={v => setEC(c => ({
                      ...c,
                      bambinoMaggiore6: v === 1,
                      indennitaBambino: (v === 0 && !c.indennitaBambino) ? '0.84' : (v === 0 ? c.indennitaBambino : '')
                    }))}
                  />} </div>} {!eC.bambinoMaggiore6 && /*#__PURE__*/<Inp label='Indennità (euro/h)' type='number' step='0.01' value={eC.indennitaBambino || '0.84'} onChange={e => setEC(c => ({ ...c, indennitaBambino: e.target.value }))} placeholder='0.84' />} </div>} {LIV[eC.livelloCCNL] && /*#__PURE__*/<div
              style={{
                fontSize: 11.5,
                color: C.textM,
                background: C.bg,
                border: "1px solid " + C.border,
                borderRadius: 8,
                padding: "8px 12px",
                marginBottom: 4,
                lineHeight: 1.5
              }}>
              {LIV[eC.livelloCCNL].desc}
            </div>}
            {/*#__PURE__*/<SH title="Periodo" />}
            {/*#__PURE__*/<div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12
              }}>
              {/*#__PURE__*/<Inp
                label="Data Inizio"
                type="date"
                value={eC.dataInizio}
                onChange={e => setEC(c => ({
                  ...c,
                  dataInizio: e.target.value
                }))} />}
              {/*#__PURE__*/<Inp
                label="Data Fine (opz.)"
                type="date"
                value={eC.dataFine}
                onChange={e => setEC(c => ({
                  ...c,
                  dataFine: e.target.value
                }))} />}
              {/*#__PURE__*/<Sel
                label="Scatti Anzianita (Art.37)"
                value={eC.scatti}
                onChange={e => setEC(c => ({
                  ...c,
                  scatti: parseInt(e.target.value)
                }))}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map(n => /*#__PURE__*/<option key={n} value={n}>
                  {n === 0 ? "Nessuno" : n + " scatto" + (n > 1 ? "i" : "") + " (+" + n * 4 + "%)"}
                </option>)}
              </Sel>}
            </div>}
            {/*#__PURE__*/<SH title="Orario settimanale" />}
            {/*#__PURE__*/<GiorniEditor
              value={eC.giorniLavoro}
              onChange={gl => {
                const oc = oreGL(gl);
                setEC(c => ({
                  ...c,
                  giorniLavoro: gl,
                  oreSett: oc > 0 ? oc.toFixed(1) : c.oreSett
                }));
              }} />}
            {/*#__PURE__*/<SH title="Adeguamento ISTAT (Art.38)" />}
            {(() => {
              const istatV = n2(eC.istatPerc || "0");
              const baseV = n2(eC.minimoRicalcolato) || MIN_ORA[eC.livelloCCNL] || 0;
              const nuovoMinV = istatV > 0 ? baseV * (1 + istatV / 100) : baseV;
              const displayMinV = eC._ricalcolaConfirm ? nuovoMinV : baseV;
              return (
                /*#__PURE__*/<div
                  style={{
                    background: C.card,
                    borderRadius: 12,
                    border: "1px solid " + C.border,
                    padding: "14px",
                    marginBottom: 4
                  }}>
                  {/*#__PURE__*/<div
                    style={{
                      fontSize: 11,
                      color: C.textL,
                      marginBottom: 12,
                      lineHeight: 1.6
                    }}>
                    Minimo rivalutato annualmente dalla Commissione (Art.38). Inserisci coefficiente % e premi Ricalcola.
                  </div>}
                  {/*#__PURE__*/<div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginBottom: 12
                    }}>
                    {/*#__PURE__*/<Inp
                      label="Coefficiente ISTAT (%)"
                      type="number"
                      step="0.01"
                      min="0"
                      value={eC.istatPerc || "0"}
                      onChange={e => setEC(c => ({
                        ...c,
                        istatPerc: e.target.value,
                        _ricalcolaConfirm: false
                      }))}
                      placeholder="es. 12.36" />}
                    {/*#__PURE__*/<div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5
                      }}>
                      {/*#__PURE__*/<span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: ".09em",
                          color: C.textL
                        }}>
                        Minimo ricalcolato (€/h)
                      </span>}
                      {/*#__PURE__*/<Inp
                        value={displayMinV.toFixed(2)}
                        readOnly={true}
                        style={{
                          background: C.bg,
                          color: C.green,
                          fontWeight: 800,
                          fontSize: 15
                        }}
                      />}
                    </div>}
                  </div>}
                  {/*#__PURE__*/<div
                    style={{
                      fontSize: 11,
                      color: C.textL,
                      marginBottom: 12,
                      lineHeight: 1.5
                    }}>
                    {"Base: "}
                    {/*#__PURE__*/<strong>
                      {"\u20AC "}
                      {baseV.toFixed(4)}
                      /h
                    </strong>}
                    {" \xB7 Tab. dic.2025: \u20AC"}
                    {MIN_ORA[eC.livelloCCNL] || "---"}
                    /h
                  </div>}
                  {eC._ricalcolaConfirm ? /*#__PURE__*/<div
                    style={{
                      background: C.accentL,
                      borderRadius: 10,
                      padding: "12px 14px",
                      marginBottom: 4,
                      border: "1px solid " + C.borderM
                    }}>
                    {/*#__PURE__*/<div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.text,
                        marginBottom: 6
                      }}>
                      €
                      {baseV.toFixed(4)}
                      {" \xD7 (1 + "}
                      {istatV}
                      {"%) = "}
                      {/*#__PURE__*/<strong
                        style={{
                          color: C.green
                        }}>
                        €
                        {nuovoMinV.toFixed(2)}
                        /h
                      </strong>}
                    </div>}
                    {/*#__PURE__*/<div
                      style={{
                        fontSize: 11,
                        color: C.textL,
                        marginBottom: 10
                      }}>
                      Giornate già inserite non verranno modificate.
                    </div>}
                    {/*#__PURE__*/<div
                      style={{
                        display: "flex",
                        gap: 8
                      }}>
                      {/*#__PURE__*/<Btn
                        sm={true}
                        onClick={() => {
                          const nuovaPaga = withScatti(nuovoMinV, eC.scatti).toFixed(2);
                          const nuovaMens = eC.oreSett ? o2m(nuovaPaga, eC.oreSett) : "";
                          setEC(c => ({
                            ...c,
                            minimoRicalcolato: nuovoMinV.toFixed(2),
                            pagaOraria: nuovaPaga,
                            pagaMensile: nuovaMens,
                            _ricalcolaConfirm: false
                          }));
                          notify("Minimo ricalcolato: €" + nuovoMinV.toFixed(2) + "/h");
                        }}>
                        Conferma
                      </Btn>}
                      {/*#__PURE__*/<Btn
                        sm={true}
                        variant="ghost"
                        onClick={() => setEC(c => ({
                          ...c,
                          _ricalcolaConfirm: false
                        }))}>
                        Annulla
                      </Btn>}
                    </div>}
                  </div> : /*#__PURE__*/<div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap"
                    }}>
                    {/*#__PURE__*/<Btn
                      sm={true}
                      variant="soft"
                      onClick={() => {
                        if (istatV <= 0) {
                          notify("Coefficiente ISTAT deve essere > 0", "err");
                          return;
                        }
                        setEC(c => ({
                          ...c,
                          _ricalcolaConfirm: true
                        }));
                      }}>
                      Ricalcola minimo
                    </Btn>}
                    {eC.minimoRicalcolato && n2(eC.minimoRicalcolato) !== (MIN_ORA[eC.livelloCCNL] || 0) && /*#__PURE__*/<Btn
                      sm={true}
                      variant="ghost"
                      onClick={() => setEC(c => ({
                        ...c,
                        minimoRicalcolato: "",
                        istatPerc: "0",
                        _ricalcolaConfirm: false,
                        pagaOraria: (MIN_ORA[c.livelloCCNL] || "").toString(),
                        pagaMensile: c.oreSett ? o2m(MIN_ORA[c.livelloCCNL] || 0, c.oreSett) : ""
                      }))}
                      style={{
                        fontSize: 11
                      }}>
                      Ripristina tabellare
                    </Btn>}
                  </div>}
                </div>
              );
            })()}
            {/*#__PURE__*/<Btn
              variant="info"
              sm={true}
              full={true}
              onClick={applyMin}
              style={{
                marginBottom: 10
              }}>
              Applica minimi tabellari CCNL 2025
            </Btn>}
            {/*#__PURE__*/<div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12
              }}>
              {/*#__PURE__*/<Inp
                label="Ore settimanali"
                type="number"
                step="0.5"
                value={eC.oreSett}
                onChange={e => setEC(c => ({
                  ...c,
                  oreSett: e.target.value
                }))}
                placeholder="calcolato dai giorni" />}
              {/*#__PURE__*/<Inp
                label="Paga Oraria (euro)"
                type="number"
                step="0.01"
                value={eC.pagaOraria}
                onChange={e => {
                  const v = e.target.value;
                  setEC(c => ({
                    ...c,
                    pagaOraria: v,
                    pagaMensile: c.oreSett ? o2m(v, c.oreSett) : c.pagaMensile
                  }));
                }}
                placeholder={(MIN_ORA[eC.livelloCCNL] || "").toString()} />}
              {/*#__PURE__*/<Inp
                label="Paga Mensile (euro)"
                type="number"
                step="0.01"
                value={eC.pagaMensile}
                onChange={e => {
                  const v = e.target.value;
                  setEC(c => ({
                    ...c,
                    pagaMensile: v,
                    pagaOraria: c.oreSett ? m2o(v, c.oreSett) : c.pagaOraria
                  }));
                }}
                placeholder={eC.convivenza === "convivente" ? (MIN_CONV[eC.livelloCCNL] || "").toString() : ""} />}
              {/*#__PURE__*/<Inp
                label="Superminimo (opz.)"
                type="number"
                step="0.01"
                value={eC.superminimo}
                onChange={e => setEC(c => ({
                  ...c,
                  superminimo: e.target.value
                }))}
                placeholder="0" />}
            </div>}
            {eC.livelloCCNL && /*#__PURE__*/<div
              style={{
                fontSize: 11,
                color: C.textL,
                marginTop: 8,
                lineHeight: 1.6
              }}>
              {"Min. CCNL dic.2025: "}
              {eC.convivenza === "convivente" ? "euro " + (MIN_CONV[eC.livelloCCNL] || "---") + "/mese - " : ""}
              {"euro "}
              {MIN_ORA[eC.livelloCCNL] || "---"}
              /h
            </div>}
            {/*#__PURE__*/<SH title="Pagamento" />}
            {/*#__PURE__*/<div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12
              }}>
              {/*#__PURE__*/<Sel
                label="Modalita"
                value={eC.modalitaPagamento}
                onChange={e => setEC(c => ({
                  ...c,
                  modalitaPagamento: e.target.value
                }))}>
                {["bonifico", "contanti", "assegno"].map(m => /*#__PURE__*/<option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>)}
              </Sel>}
              {eC.modalitaPagamento === "bonifico" && /*#__PURE__*/<Inp
                label="IBAN"
                value={eC.iban}
                onChange={e => setEC(c => ({
                  ...c,
                  iban: e.target.value.toUpperCase()
                }))}
                placeholder="IT60X..." />}
              {eC.modalitaPagamento === "bonifico" && /*#__PURE__*/<Inp
                label="Banca"
                value={eC.banca}
                onChange={e => setEC(c => ({
                  ...c,
                  banca: e.target.value
                }))}
                placeholder="Intesa Sanpaolo" />}
            </div>}
            {/*#__PURE__*/<SH title="Note" />}
            {/*#__PURE__*/<TA
              value={eC.note}
              onChange={e => setEC(c => ({
                ...c,
                note: e.target.value
              }))}
              placeholder="Note aggiuntive..."
              style={{
                minHeight: 60
              }} />}
            {/*#__PURE__*/<Riepilogo c={eC} />}
            {/*#__PURE__*/<InfoINPS c={eC} />}
            {/*#__PURE__*/<div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 22
              }}>
              {/*#__PURE__*/<Btn full={true} onClick={saveC} disabled={!eC.personaId}>
                Salva contratto
              </Btn>}
              {/*#__PURE__*/<Btn
                variant="ghost"
                onClick={closeC}
                style={{
                  minWidth: 80
                }}>
                Annulla
              </Btn>}
            </div>}
          </div>}
        </Sheet>}
        {/*#__PURE__*/<Sheet
          open={!!shGen}
          onClose={() => setShGen(null)}
          title="Genera giornate dal contratto">
          {shGen && (() => {
            const p = pById(shGen.personaId);
            const gl = shGen.giorniLavoro || {};
            const giorniAtt = GG_KEYS.filter(k => gl[k] && gl[k].attivo);
            const existK = new Set(db.giornate.map(g => g.personaId + "_" + g.data));
            const nuove = genPrev.filter(g => !existK.has(g.personaId + "_" + g.data)).length;
            const dup = genPrev.length - nuove;
            return (
              /*#__PURE__*/<div>
                {/*#__PURE__*/<div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    marginBottom: 16
                  }}>
                  {/*#__PURE__*/<Av p={p} sz={40} />}
                  {/*#__PURE__*/<div>
                    {/*#__PURE__*/<div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: C.text
                      }}>
                      {p ? (p.nome + " " + p.cognome).trim() : "---"}
                    </div>}
                    {/*#__PURE__*/<div
                      style={{
                        fontSize: 12,
                        color: C.textL,
                        marginTop: 2
                      }}>
                      {giorniAtt.map(k => GG_LABEL[k]).join(", ")}
                    </div>}
                  </div>}
                </div>}
                {/*#__PURE__*/<div
                  style={{
                    background: C.bg,
                    border: "1px solid " + C.border,
                    borderRadius: 10,
                    padding: "10px 14px",
                    marginBottom: 16
                  }}>
                  {giorniAtt.map(k => {
                    const g = gl[k];
                    const ore = g.inizio && g.fine ? calcOre(g.inizio, g.fine) : null;
                    return (
                      /*#__PURE__*/<div
                        key={k}
                        style={{
                          display: "flex",
                          gap: 8,
                          padding: "3px 0"
                        }}>
                        {/*#__PURE__*/<span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: C.text,
                            minWidth: 30
                          }}>
                          {GG_LABEL[k]}
                        </span>}
                        {/*#__PURE__*/<span
                          style={{
                            fontSize: 12,
                            color: C.textM
                          }}>
                          {g.inizio || "--:--"}
                          {" \u2014 "}
                          {g.fine || "--:--"}
                          {ore ? " (" + ore.toFixed(1) + "h)" : ""}
                        </span>}
                      </div>
                    );
                  })}
                  {/*#__PURE__*/<div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: C.accent,
                      marginTop: 6,
                      paddingTop: 6,
                      borderTop: "1px solid #E8DDD0"
                    }}>
                    {"Totale: "}
                    {oreGL(gl).toFixed(1)}
                    h/sett
                  </div>}
                </div>}
                {/*#__PURE__*/<SH title="Intervallo di generazione" />}
                {/*#__PURE__*/<div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginBottom: 16
                  }}>
                  {/*#__PURE__*/<Inp
                    label="Dal"
                    type="date"
                    value={genDal}
                    onChange={e => setGenDal(e.target.value)} />}
                  {/*#__PURE__*/<Inp
                    label="Al"
                    type="date"
                    value={genAl}
                    onChange={e => setGenAl(e.target.value)} />}
                </div>}
                {genPrev.length > 0 && /*#__PURE__*/<div
                  style={{
                    marginBottom: 16
                  }}>
                  {/*#__PURE__*/<div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginBottom: 12
                    }}>
                    {/*#__PURE__*/<Stat val={genPrev.length} label="Totali" color={C.blue} />}
                    {/*#__PURE__*/<Stat val={nuove} label="Nuove" color={C.green} />}
                    {dup > 0 && /*#__PURE__*/<Stat val={dup} label="Duplicate" color={C.textL} />}
                  </div>}
                  {/*#__PURE__*/<div
                    style={{
                      maxHeight: 240,
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6
                    }}>
                    {genPrev.map(g => {
                      const isDup = existK.has(g.personaId + "_" + g.data);
                      const parts = g.data.split("-"),
                        mm = parts[1],
                        dd = parts[2];
                      const ore = n2(g.oreCalcolate);
                      return (
                        /*#__PURE__*/<div
                          key={g.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 12px",
                            borderRadius: 10,
                            background: isDup ? "#F0EEE9" : C.card,
                            border: "1px solid " + C.border,
                            opacity: isDup ? .45 : 1
                          }}>
                          {/*#__PURE__*/<div
                            style={{
                              minWidth: 36,
                              textAlign: "center"
                            }}>
                            {/*#__PURE__*/<div
                              style={{
                                fontSize: 9,
                                fontWeight: 800,
                                color: C.textL,
                                textTransform: "uppercase"
                              }}>
                              {MESI[parseInt(mm)]}
                            </div>}
                            {/*#__PURE__*/<div
                              style={{
                                fontSize: 18,
                                fontWeight: 800,
                                color: C.text,
                                fontFamily: "'Lora',serif",
                                lineHeight: 1
                              }}>
                              {dd}
                            </div>}
                          </div>}
                          {/*#__PURE__*/<div
                            style={{
                              flex: 1
                            }}>
                            {/*#__PURE__*/<div
                              style={{
                                display: "flex",
                                gap: 6,
                                flexWrap: "wrap",
                                alignItems: "center"
                              }}>
                              {/*#__PURE__*/<Bdg tipo={g.tipo} />}
                              {/*#__PURE__*/<span
                                style={{
                                  fontSize: 11,
                                  color: C.textM
                                }}>
                                {g.oreEntrata}
                                -
                                {g.oreUscita}
                              </span>}
                              {ore > 0 && /*#__PURE__*/<span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: C.accent
                                }}>
                                {ore.toFixed(1)}
                                h
                              </span>}
                            </div>}
                          </div>}
                          {isDup && /*#__PURE__*/<span
                            style={{
                              fontSize: 9.5,
                              color: C.textL,
                              fontWeight: 800,
                              flexShrink: 0
                            }}>
                            GIA PRESENTE
                          </span>}
                        </div>
                      );
                    })}
                  </div>}
                </div>}
                {genDal && genAl && genPrev.length === 0 && /*#__PURE__*/<div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: C.textL,
                    fontSize: 13
                  }}>
                  Nessun giorno lavorativo nell'intervallo.
                </div>}
                {/*#__PURE__*/<div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 8
                  }}>
                  {/*#__PURE__*/<Btn full={true} onClick={confermaGen} disabled={nuove === 0}>
                    {"Genera "}
                    {nuove}
                    {" giornate"}
                  </Btn>}
                  {/*#__PURE__*/<Btn
                    variant="ghost"
                    onClick={() => setShGen(null)}
                    style={{
                      minWidth: 80
                    }}>
                    Annulla
                  </Btn>}
                </div>}
              </div>
            );
          })()}
        </Sheet>}
        {/*#__PURE__*/<Sheet
          open={shG}
          onClose={closeG}
          title={editGid ? "Modifica Giornata" : "Aggiungi Giornata"}>
          {/*#__PURE__*/<div>
            {/*#__PURE__*/<Sel
              label="Persona *"
              value={ng.personaId}
              onChange={e => setNg(g => ({
                ...g,
                personaId: e.target.value
              }))}>
              {/*#__PURE__*/<option value="">
                --- Seleziona ---
              </option>}
              {db.persone.map(p => /*#__PURE__*/<option key={p.id} value={p.id}>
                {(p.nome + " " + p.cognome).trim()}
              </option>)}
            </Sel>}
            {/*#__PURE__*/<div
              style={{
                height: 12
              }} />}
            {/*#__PURE__*/<Inp
              label="Data *"
              type="date"
              value={ng.data}
              onChange={e => {
                const v = e.target.value;
                const t = autoTipo(v);
                setNg(g => ({
                  ...g,
                  data: v,
                  tipo: t
                }));
              }} />}
            {ng.data && (isFest(ng.data) || isDom(ng.data)) && /*#__PURE__*/<div
              style={{
                fontSize: 11.5,
                color: C.green,
                fontWeight: 700,
                marginTop: 6
              }}>
              {isFest(ng.data) ? "Festivita nazionale - +60%" : "Domenica - +60%"}
            </div>}
            {/*#__PURE__*/<SH title="Tipo giornata (Art.15 CCNL)" />}
            {/*#__PURE__*/<div
              style={{
                display: "flex",
                gap: 7,
                flexWrap: "wrap"
              }}>
              {Object.keys(TG).map(k => {
                const t = TG[k];
                return (
                  /*#__PURE__*/<button
                    key={k}
                    onClick={() => setNg(g => ({
                      ...g,
                      tipo: k
                    }))}
                    style={{
                      padding: "7px 12px",
                      borderRadius: 20,
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "1.5px solid " + (ng.tipo === k ? t.fg : C.border),
                      background: ng.tipo === k ? t.bg : "transparent",
                      color: ng.tipo === k ? t.fg : C.textM,
                      transition: "all .15s",
                      whiteSpace: "nowrap"
                    }}>
                    {t.label}
                  </button>
                );
              })}
            </div>}
            {/*#__PURE__*/<SH title="Orario" />}
            {ng.tipo === "permesso" || ng.tipo === "permesso_nr" || ng.tipo === "lutto" ? /*#__PURE__*/<div>
              {/*#__PURE__*/<span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".09em",
                  color: C.textL,
                  display: "block",
                  marginBottom: 8
                }}>
                {ng.tipo === "permesso" ? "Durata permesso" : ng.tipo === "lutto" ? "Durata assenza per lutto" : "Durata permesso non retribuito"}
              </span>}
              {/*#__PURE__*/<div
                style={{
                  display: "flex",
                  gap: 7,
                  flexWrap: "wrap"
                }}>
                {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8].map(h => {
                  const lbl = Math.floor(h) + "h" + (h % 1 ? "30" : "");
                  const sel = ng.durata === String(h);
                  const ac = ng.tipo === "permesso" ? C.blue : ng.tipo === "lutto" ? "#4527A0" : C.textM;
                  return (
                    /*#__PURE__*/<button
                      key={h}
                      onClick={() => setNg(g => ({
                        ...g,
                        durata: String(h)
                      }))}
                      style={{
                        padding: "8px 13px",
                        borderRadius: 20,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: "1.5px solid " + (sel ? ac : C.border),
                        background: sel ? ac : "transparent",
                        color: sel ? "#fff" : C.textM,
                        transition: "all .15s"
                      }}>
                      {lbl}
                    </button>
                  );
                })}
              </div>}
              {ng.durata && /*#__PURE__*/<div
                style={{
                  marginTop: 10,
                  background: ng.tipo === "permesso" ? C.blueB : ng.tipo === "lutto" ? "#EDE7F6" : C.bg,
                  borderRadius: 10,
                  padding: "10px 12px"
                }}>
                {/*#__PURE__*/<span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: ng.tipo === "permesso" ? C.blue : ng.tipo === "lutto" ? "#4527A0" : C.textM
                  }}>
                  {Math.floor(n2(ng.durata))}
                  h
                  {n2(ng.durata) % 1 ? " 30min" : ""}
                  {ng.tipo === "permesso_nr" ? " (non retribuito)" : ng.tipo === "lutto" ? " (lutto)" : ""}
                </span>}
              </div>}
            </div> : /*#__PURE__*/<div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12
              }}>
              {/*#__PURE__*/<Inp
                label="Entrata"
                type="time"
                value={ng.oreEntrata}
                onChange={e => setNg(g => ({
                  ...g,
                  oreEntrata: e.target.value
                }))} />}
              {/*#__PURE__*/<Inp
                label="Uscita"
                type="time"
                value={ng.oreUscita}
                onChange={e => setNg(g => ({
                  ...g,
                  oreUscita: e.target.value
                }))} />}
              {/*#__PURE__*/<Inp
                label="Ore extra"
                type="number"
                step="0.5"
                min="0"
                value={ng.oreExtra}
                onChange={e => setNg(g => ({
                  ...g,
                  oreExtra: e.target.value
                }))}
                placeholder="0" />}
            </div>}
            {(() => {
              const ore = (calcOre(ng.oreEntrata, ng.oreUscita) || 0) + n2(ng.oreExtra);
              const ctr = ng.personaId ? cByP(ng.personaId) : null;
              const baseImp = ctr && ctr.pagaOraria && ore ? calcImp(ore, ctr.pagaOraria, ng.tipo) : null; const isMens=ctr&&ctr.tipoRetribuzione==='mensilizzata'; const imp = isMens && n2(ctr.pagaMensile)>0 ? (n2(ctr.pagaMensile)/26 * (1+(TG[ng.tipo]?.perc||0)/100)).toFixed(2) : baseImp;
              const ti = TG[ng.tipo] || TG.ordinaria;
              if (!ore) return null;
              return (
                /*#__PURE__*/<div
                  style={{
                    marginTop: 10,
                    background: C.greenB,
                    borderRadius: 10,
                    padding: "10px 12px",
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap"
                  }}>
                  {/*#__PURE__*/<span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.green
                    }}>
                    {ore.toFixed(2)}
                    h
                  </span>}
                  {imp && /*#__PURE__*/<span
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: C.green
                    }}>
                    €
                    {imp}
                    {ti.perc > 0 ? " (+" + ti.perc + "%)" : ""}
                  </span>}
                </div>
              );
            })()}
            {/*#__PURE__*/<SH title="Giustificativo" />}
            {/*#__PURE__*/<Inp
              label="Documento / Certificato"
              value={ng.giustificativo}
              onChange={e => setNg(g => ({
                ...g,
                giustificativo: e.target.value
              }))}
              placeholder="Certificato medico, ricevuta..." />}
            {/*#__PURE__*/<div
              style={{
                height: 12
              }} />}
            {/*#__PURE__*/<TA
              label="Note"
              value={ng.note}
              onChange={e => setNg(g => ({
                ...g,
                note: e.target.value
              }))}
              placeholder="Attivita svolte, note..." />}
            {/*#__PURE__*/<div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 22
              }}>
              {/*#__PURE__*/<Btn full={true} onClick={addG} disabled={!ng.data || !ng.personaId}>
                {editGid ? "Salva modifiche" : "Aggiungi"}
              </Btn>}
              {/*#__PURE__*/<Btn
                variant="ghost"
                onClick={closeG}
                style={{
                  minWidth: 80
                }}>
                Annulla
              </Btn>}
            </div>}
          </div>}
        </Sheet>}
        {/*#__PURE__*/<Sheet open={shBusta} onClose={() => setShBusta(false)} title="">
          {shBusta && tab === 2 && (() => {
            const allMonths2 = [...new Set(db.giornate.filter(g => !selP || g.personaId === selP).map(g => g.data.substring(0, 7)))].sort().reverse();
            const activeMese2 = fmese && allMonths2.includes(fmese) ? fmese : allMonths2[0] || "";
            const [yr2, mm2] = activeMese2 ? activeMese2.split("-") : ["", ""];
            const gMese2 = db.giornate.filter(g => {
              if (selP && g.personaId !== selP) return false;
              if (activeMese2 && !g.data.startsWith(activeMese2)) return false;
              return true;
            });
            const p = selP ? pById(selP) : null;
            const ctr = selP ? cByP(selP) : null;
            const bp = calcBustaPaga(gMese2, ctr);
            if (!bp) return (
              /*#__PURE__*/<div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: C.textL
                }}>
                Nessun dato sufficiente. Aggiungi paga oraria nel contratto.
              </div>
            );
            const Row = ({
              l,
              v,
              bold,
              color,
              sep
            }) => /*#__PURE__*/<div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "9px 0",
                borderBottom: sep ? "none" : "1px solid " + C.border
              }}>
              {/*#__PURE__*/<span
                style={{
                  fontSize: 13,
                  color: color || C.textM,
                  fontWeight: bold ? 700 : 400
                }}>
                {l}
              </span>}
              {/*#__PURE__*/<span
                style={{
                  fontSize: 13,
                  fontWeight: bold ? 800 : 500,
                  color: color || C.text
                }}>
                {"\u20AC "}
                {v}
              </span>}
            </div>;
            return (
              /*#__PURE__*/<div>
                {/*#__PURE__*/<div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    marginBottom: 20,
                    padding: "16px",
                    background: C.bg,
                    borderRadius: 14,
                    border: "1px solid " + C.borderM
                  }}>
                  {p && /*#__PURE__*/<Av p={p} sz={44} />}
                  {/*#__PURE__*/<div>
                    {/*#__PURE__*/<div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: C.accent,
                        textTransform: "uppercase",
                        letterSpacing: ".09em"
                      }}>
                      Busta Paga
                    </div>}
                    {/*#__PURE__*/<div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        fontFamily: "'Lora',serif",
                        color: C.text
                      }}>
                      {MESI[parseInt(mm2)]}
                      {" "}
                      {yr2}
                    </div>}
                    {p && /*#__PURE__*/<div
                      style={{
                        fontSize: 12,
                        color: C.textM,
                        marginTop: 2
                      }}>
                      {(p.nome + " " + p.cognome).trim()}
                    </div>}
                  </div>}
                </div>}
                {/*#__PURE__*/<div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: C.textL,
                    textTransform: "uppercase",
                    letterSpacing: ".09em",
                    marginBottom: 8
                  }}>
                  Ore lavorate
                </div>}
                {/*#__PURE__*/<div
                  style={{
                    background: C.card,
                    borderRadius: 12,
                    border: "1px solid #E8DDD0",
                    padding: "4px 14px",
                    marginBottom: 16
                  }}>
                  {bp.rows.map(r => /*#__PURE__*/<div
                    key={r.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: "1px solid #F5F0EA"
                    }}>
                    {/*#__PURE__*/<div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                      }}>
                      {/*#__PURE__*/<span
                        style={{
                          fontSize: 10,
                          background: r.bg,
                          color: r.fg,
                          padding: "2px 7px",
                          borderRadius: 20,
                          fontWeight: 700,
                          textTransform: "uppercase"
                        }}>
                        {r.label}
                      </span>}
                      {/*#__PURE__*/<span
                        style={{
                          fontSize: 12,
                          color: C.textL
                        }}>
                        {r.ore}
                      </span>}
                    </div>}
                    {/*#__PURE__*/<span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.text
                      }}>
                      {"\u20AC "}
                      {r.imp}
                    </span>}
                  </div>)}
                  {/*#__PURE__*/<div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderTop: "1.5px solid " + C.borderM,
                      marginTop: 2
                    }}>
                    {/*#__PURE__*/<span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: C.text
                      }}>
                      Totale retribuzione
                    </span>}
                    {/*#__PURE__*/<span
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: C.accent
                      }}>
                      {"\u20AC "}
                      {bp.totLordo}
                    </span>}
                  </div>}
                </div>}
                {/*#__PURE__*/<div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: C.textL,
                    textTransform: "uppercase",
                    letterSpacing: ".09em",
                    marginBottom: 8
                  }}>
                  Presenze del mese
                </div>}
                {/*#__PURE__*/<div
                  style={{
                    background: C.card,
                    borderRadius: 12,
                    border: "1px solid " + C.border,
                    padding: "4px 14px",
                    marginBottom: 16
                  }}>
                  {(() => {
                    const StatRow = ({
                      l,
                      v,
                      bar,
                      barColor,
                      warn
                    }) => /*#__PURE__*/<div
                      style={{
                        padding: "8px 0",
                        borderBottom: "1px solid " + C.border
                      }}>
                      {/*#__PURE__*/<div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: bar ? 4 : 0
                        }}>
                        {/*#__PURE__*/<span
                          style={{
                            fontSize: 12.5,
                            color: warn ? C.red : C.textM
                          }}>
                          {l}
                        </span>}
                        {/*#__PURE__*/<span
                          style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: warn ? C.red : C.text
                          }}>
                          {v}
                        </span>}
                      </div>}
                      {bar != null && /*#__PURE__*/<div
                        style={{
                          height: 3,
                          borderRadius: 2,
                          background: C.border
                        }}>
                        {/*#__PURE__*/<div
                          style={{
                            height: "100%",
                            borderRadius: 2,
                            background: barColor,
                            width: Math.min(bar, 1) * 100 + "%"
                          }} />}
                      </div>}
                    </div>;
                    const ferieColor = bp.ferieMese > bp.ferieMat2 ? C.red : C.green;
                    const permColor = bp.orePermRet > bp.permMax ? C.red : C.blue;
                    return (
                      /*#__PURE__*/<React.Fragment>
                        {/*#__PURE__*/<StatRow
                          l="Ferie godute / maturate"
                          v={bp.ferieMese + " gg / " + bp.ferieMat2 + " gg"}
                          bar={bp.ferieMat2 > 0 ? bp.ferieMese / bp.ferieMat2 : 0}
                          barColor={ferieColor}
                          warn={bp.ferieMese > bp.ferieMat2} />}
                        {/*#__PURE__*/<StatRow
                          l="Permesso retrib. goduto / max"
                          v={fmtOre(bp.orePermRet) + " / " + bp.permMax + "h"}
                          bar={bp.permMax > 0 ? bp.orePermRet / bp.permMax : 0}
                          barColor={permColor}
                          warn={bp.orePermRet > bp.permMax} />}
                        {bp.nPermNR > 0 && /*#__PURE__*/<StatRow
                          l="Permesso non retribuito"
                          v={bp.orePermNR > 0 ? fmtOre(bp.orePermNR) : bp.nPermNR + " gg"} />}
                        {bp.nLutto > 0 && /*#__PURE__*/<StatRow
                          l="Lutto (Art.19c3)"
                          v={bp.oreLutto > 0 ? fmtOre(bp.oreLutto) : bp.nLutto + " gg"} />}
                        {bp.nMalattia > 0 && /*#__PURE__*/<StatRow l="Giorni malattia" v={bp.nMalattia + " gg"} warn={true} />}
                        {bp.nAssenze > 0 && /*#__PURE__*/<StatRow l="Giorni assenza" v={bp.nAssenze + " gg"} warn={true} />}
                      </React.Fragment>
                    );
                  })()}
                </div>}
                {/*#__PURE__*/<div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: C.textL,
                    textTransform: "uppercase",
                    letterSpacing: ".09em",
                    marginBottom: 8
                  }}>
                  Voci mensili
                </div>}
                {/*#__PURE__*/<div
                  style={{
                    background: C.card,
                    borderRadius: 12,
                    border: "1px solid #E8DDD0",
                    padding: "4px 14px",
                    marginBottom: 16
                  }}>
                  {bp.supermin && /*#__PURE__*/<Row l="Superminimo" v={bp.supermin} />}
                  {bp.vittoMens && /*#__PURE__*/<Row l="Indennita vitto (Tab.F)" v={bp.vittoMens} />}
                  {bp.allogMens && /*#__PURE__*/<Row l="Indennita alloggio (Tab.F)" v={bp.allogMens} />}
                  {/*#__PURE__*/<Row l={"Rateo 13a mensilit\xE0 (1/12)"} v={bp.tredMens} />}
                  {/*#__PURE__*/<Row l="Accantonamento TFR (1/13.5)" v={bp.tfrMens} sep={true} />}
                </div>}
                {/*#__PURE__*/<div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: C.textL,
                    textTransform: "uppercase",
                    letterSpacing: ".09em",
                    marginBottom: 8
                  }}>
                  Contributi (stima)
                </div>}
                {/*#__PURE__*/<div
                  style={{
                    background: C.card,
                    borderRadius: 12,
                    border: "1px solid #E8DDD0",
                    padding: "4px 14px",
                    marginBottom: 16
                  }}>
                  {/*#__PURE__*/<Row l="Contributi INPS datore (~17.91%)" v={bp.contribDatore} />}
                  {/*#__PURE__*/<Row l="Contributi INPS lavoratore (~5.84%)" v={bp.contribLav} />}
                  
                </div>}
                {/*#__PURE__*/<div
                  style={{
                    background: C.greenB,
                    borderRadius: 12,
                    border: "1px solid " + C.green + "44",
                    padding: "14px 16px",
                    marginBottom: 8
                  }}>
                  {/*#__PURE__*/<div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                      paddingBottom: 10,
                      borderBottom: "1px solid #B8D8C8"
                    }}>
                    {/*#__PURE__*/<span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: C.textM
                      }}>
                      Netto stimato lavoratore
                    </span>}
                    {/*#__PURE__*/<span
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: C.green,
                        fontFamily: "'Lora',serif"
                      }}>
                      {"\u20AC "}
                      {bp.nettoStimato}
                    </span>}
                  </div>}
                  {/*#__PURE__*/<div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                    {/*#__PURE__*/<span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: C.textL
                      }}>
                      Costo totale datore
                    </span>}
                    {/*#__PURE__*/<span
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: C.accent
                      }}>
                      {"\u20AC "}
                      {bp.costoDatore}
                    </span>}
                  </div>}
                </div>}
                {/*#__PURE__*/<div
                  style={{
                    fontSize: 10,
                    color: C.textL,
                    lineHeight: 1.6,
                    marginTop: 8,
                    padding: "0 2px"
                  }}>
                  * Stima indicativa. Contributi INPS calcolati su retribuzione oraria convenzionale. Per calcoli ufficiali consulta CAF o patronato.
                </div>}
                {/*#__PURE__*/<div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 20
                  }}>
                  {/*#__PURE__*/<Btn full={true} variant="ghost" onClick={() => setShBusta(false)}>
                    Chiudi
                  </Btn>}
                  {/*#__PURE__*/<Btn
                    full={true}
                    variant="soft"
                    onClick={() => {
                      const pe = selP ? pById(selP) : null;
                      const ctr = selP ? cByP(selP) : null;
                      if (!bp || !pe) return;
                      const mLabel = MESI[parseInt(mm2)] + " " + yr2;
                      const rowsHtml = bp.rows.map(r => `<tr><td><span style="background:${r.bg};color:${r.fg};padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700">${r.label}</span></td><td style="text-align:center">${r.ore}</td><td style="text-align:right;font-weight:700">€ ${r.imp}</td></tr>`).join("");
                      const html = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"/>
              <title>Busta Paga ${(pe.nome + ' ' + pe.cognome).trim()} ${mLabel}</title>
              <style>
              body{font-family:'Helvetica Neue',Arial,sans-serif;color:#1E1008;margin:0;padding:40px;font-size:13px;line-height:1.6;}
              h2{font-size:13px;font-weight:700;color:#C8602A;text-transform:uppercase;letter-spacing:.08em;margin:22px 0 8px;border-bottom:1.5px solid #E8DDD0;padding-bottom:4px;}
              .header{background:#F8F4EF;border-radius:10px;padding:20px 24px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:flex-start;}
              .name{font-size:20px;font-weight:800;}
              .sub{font-size:11px;color:#9A7A60;margin-top:2px;}
              .badge{background:#FDF0E8;color:#C8602A;border:1px solid #F0C9A8;border-radius:20px;padding:2px 10px;font-size:11px;font-weight:700;}
              table{width:100%;border-collapse:collapse;margin-bottom:4px;}
              th{text-align:left;font-size:11px;color:#9A7A60;text-transform:uppercase;letter-spacing:.06em;padding:6px 10px;border-bottom:2px solid #E8DDD0;}
              td{padding:8px 10px;border-bottom:1px solid #F0E8E0;}
              .total-row td{font-weight:800;font-size:14px;background:#FDF0E8;color:#C8602A;}
              .section{background:#F8F4EF;border-radius:8px;padding:4px 14px;margin-bottom:16px;}
              .row2{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F0E8E0;}
              .lbl{color:#9A7A60;}
              .val{font-weight:600;}
              .bar-wrap{height:4px;background:#E8DDD0;border-radius:2px;margin-top:4px;}
              .totali{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;}
              .totale-card{background:#EAF3EE;border-radius:8px;padding:12px 16px;}
              .totale-val{font-size:20px;font-weight:800;color:#3D7A52;}
              .totale-sub{font-size:18px;font-weight:800;color:#C8602A;}
              .totale-lbl{font-size:10px;color:#9A7A60;text-transform:uppercase;letter-spacing:.06em;margin-top:2px;}
              .warn{color:#B03030;}
              .nota{font-size:10px;color:#9A7A60;margin-top:16px;line-height:1.6;}
              .footer{margin-top:32px;padding-top:16px;border-top:1px solid #E8DDD0;font-size:10px;color:#9A7A60;display:flex;justify-content:space-between;}
              @media print{body{padding:24px;}}
              </style></head><body>

              <div class="header">
                <div>
                  <div style="font-size:11px;color:#9A7A60;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Busta Paga</div>
                  <div class="name">${(pe.nome + ' ' + pe.cognome).trim()}</div>
                  <div class="sub">${mLabel}</div>
                  <div style="margin-top:10px">
                    <span class="badge">${ctr ? ctr.tipo : ''}</span>
                    <span class="badge" style="margin-left:6px">Liv. ${ctr ? ctr.livelloCCNL : ''}</span>
                    <span class="badge" style="margin-left:6px">${ctr && (ctr.tipoRetribuzione || 'oraria') === 'mensilizzata' ? 'Mensilizzata' : 'Base oraria'}</span>
                    <span class="badge" style="margin-left:6px">${ctr && ctr.convivenza === 'convivente' ? 'Convivente' : 'Non convivente'}</span>
                  </div>
                </div>
                <div style="text-align:right;font-size:11px;color:#9A7A60">
                  <div>CCNL Colf e Badanti 2025-2028</div>
                  <div style="margin-top:4px">Stampato il ${new Date().toLocaleDateString('it-IT')}</div>
                  ${ctr && ctr.pagaOraria ? `<div style="margin-top:8px;font-weight:700;color:#1E1008">€ ${ctr.pagaOraria}/h</div>` : ''}
                </div>
              </div>

              ${bp.nMalattia || bp.nAssenze || bp.nPermNR || bp.nLutto ? `
              <h2>Presenze del mese</h2>
              <div class="section">
                <div class="row2"><span class="lbl">Ferie godute / maturate</span><span class="val">${bp.ferieMese} gg / ${bp.ferieMat2} gg</span></div>
                <div class="row2"><span class="lbl">Permesso retrib. goduto / max</span><span class="val">${fmtOre(bp.orePermRet)} / ${bp.permMax}h</span></div>
                ${bp.nPermNR > 0 ? `<div class="row2"><span class="lbl">Permesso non retribuito</span><span class="val">${bp.orePermNR > 0 ? fmtOre(bp.orePermNR) : bp.nPermNR + ' gg'}</span></div>` : ''}
                ${bp.nLutto > 0 ? `<div class="row2"><span class="lbl">Lutto (Art.19c3)</span><span class="val">${bp.oreLutto > 0 ? fmtOre(bp.oreLutto) : bp.nLutto + ' gg'}</span></div>` : ''}
                ${bp.nMalattia > 0 ? `<div class="row2"><span class="lbl warn">Giorni malattia</span><span class="val warn">${bp.nMalattia} gg</span></div>` : ''}
                ${bp.nAssenze > 0 ? `<div class="row2"><span class="lbl warn">Giorni assenza</span><span class="val warn">${bp.nAssenze} gg</span></div>` : ''}
              </div>` : ''}

              <h2>Ore lavorate</h2>
              <div class="section">
              <table>
                <thead><tr><th>Tipo</th><th style="text-align:center">Ore</th><th style="text-align:right">Importo</th></tr></thead>
                <tbody>${rowsHtml}</tbody>
                <tfoot><tr class="total-row"><td colspan="2">Totale retribuzione</td><td style="text-align:right">€ ${bp.totLordo}</td></tr></tfoot>
              </table>
              </div>

              <h2>Voci mensili</h2>
              <div class="section">
                ${bp.supermin ? `<div class="row2"><span class="lbl">Superminimo</span><span class="val">€ ${bp.supermin}</span></div>` : ''}
                ${bp.vittoMens ? `<div class="row2"><span class="lbl">Indennità vitto (Tab.F)</span><span class="val">€ ${bp.vittoMens}</span></div>` : ''}
                ${bp.allogMens ? `<div class="row2"><span class="lbl">Indennità alloggio (Tab.F)</span><span class="val">€ ${bp.allogMens}</span></div>` : ''}
                <div class="row2"><span class="lbl">Rateo 13a mensilità (1/12)</span><span class="val">€ ${bp.tredMens}</span></div>
                <div class="row2"><span class="lbl">Accantonamento TFR (1/13.5)</span><span class="val">€ ${bp.tfrMens}</span></div>
              </div>

              <h2>Contributi (stima)</h2>
              <div class="section">
                <div class="row2"><span class="lbl">Contributi INPS datore (~${CCNL.contribDatore}%)</span><span class="val">€ ${bp.contribDatore}</span></div>
                <div class="row2"><span class="lbl">Contributi INPS lavoratore (~${CCNL.contribLav}%)</span><span class="val">€ ${bp.contribLav}</span></div>
                
              </div>

              <div class="totali">
                <div class="totale-card">
                  <div class="totale-val">€ ${bp.nettoStimato}</div>
                  <div class="totale-lbl">Netto stimato lavoratore</div>
                </div>
                <div class="totale-card" style="background:#FDF0E8">
                  <div class="totale-sub">€ ${bp.costoDatore}</div>
                  <div class="totale-lbl">Costo totale datore</div>
                </div>
              </div>

              <p class="nota">* Stima indicativa. Contributi INPS calcolati su retribuzione oraria convenzionale. Per calcoli ufficiali consulta CAF o patronato.</p>

              <div class="footer">
                <div>CCNL Colf e Badanti 2025-2028 (Cod. CNEL H501)</div>
                <div>BabySitter Manager</div>
              </div>

              </body></html>`;
                      const w = window.open('', '_blank', 'width=900,height=700');
                      w.document.write(html);
                      w.document.close();
                      setTimeout(() => w.print(), 600);
                    }}>
                    📷 Stampa / PDF
                  </Btn>}
                </div>}
              </div>
            );
          })()}
        </Sheet>}
        {/*#__PURE__*/<Sheet
          open={!!shEmail}
          onClose={() => setShEmail(null)}
          title="Riepilogo giornate">
          {shEmail && /*#__PURE__*/<div>
            {/*#__PURE__*/<div
              style={{
                marginBottom: 14
              }}>
              {/*#__PURE__*/<div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.textL,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  marginBottom: 4
                }}>
                A
              </div>}
              {/*#__PURE__*/<div
                style={{
                  fontSize: 14,
                  color: C.text,
                  background: C.bg,
                  borderRadius: 8,
                  padding: "10px 12px",
                  border: "1px solid " + C.border
                }}>
                {shEmail.to || "(nessun destinatario)"}
              </div>}
            </div>}
            {/*#__PURE__*/<div
              style={{
                marginBottom: 14
              }}>
              {/*#__PURE__*/<div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.textL,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  marginBottom: 4
                }}>
                Oggetto
              </div>}
              {/*#__PURE__*/<div
                style={{
                  fontSize: 14,
                  color: C.text,
                  background: C.bg,
                  borderRadius: 8,
                  padding: "10px 12px",
                  border: "1px solid " + C.border
                }}>
                {shEmail.subject}
              </div>}
            </div>}
            {/*#__PURE__*/<div
              style={{
                marginBottom: 16
              }}>
              {/*#__PURE__*/<div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.textL,
                  textTransform: "uppercase",
                  letterSpacing: ".08em",
                  marginBottom: 8
                }}>
                Anteprima corpo
              </div>}
              {/*#__PURE__*/<div
                style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: "14px 16px",
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: "#1E1008",
                  overflowX: "auto"
                }}
                dangerouslySetInnerHTML={{
                  __html: shEmail.bodyHtml
                }} />}
            </div>}
            {/*#__PURE__*/<div
              style={{
                display: "flex",
                gap: 10
              }}>
              {/*#__PURE__*/<Btn
                full={true}
                onClick={() => {
                  if (navigator.clipboard && window.ClipboardItem) {
                    const blob = new Blob([shEmail.bodyHtml], {
                      type: "text/html"
                    });
                    const blobPlain = new Blob([shEmail.bodyPlain], {
                      type: "text/plain"
                    });
                    navigator.clipboard.write([new ClipboardItem({
                      "text/html": blob,
                      "text/plain": blobPlain
                    })]).then(() => notify("Copiato (HTML)")).catch(() => {
                      navigator.clipboard.writeText(shEmail.bodyPlain).then(() => notify("Copiato"));
                    });
                  } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(shEmail.bodyPlain).then(() => notify("Copiato"));
                  } else {
                    const ta = document.createElement("textarea");
                    ta.value = shEmail.bodyPlain;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand("copy");
                    document.body.removeChild(ta);
                    notify("Copiato");
                  }
                }}>
                📋 Copia corpo
              </Btn>}
              {/*#__PURE__*/<Btn
                variant="info"
                onClick={() => {
                  const uri = "mailto:" + encodeURIComponent(shEmail.to) + "?subject=" + encodeURIComponent(shEmail.subject) + "&body=" + encodeURIComponent(shEmail.bodyPlain);
                  window.location.href = uri;
                }}>
                ✉ Apri client
              </Btn>}
            </div>}
          </div>}
        </Sheet>}
      </React.Fragment>}
      {/*#__PURE__*/<Sheet
        open={!!shLiq}
        onClose={() => setShLiq(null)}
        title="Simulatore Liquidazione Finale">
        {shLiq && /*#__PURE__*/<LiqSheet c={shLiq} db={db} onClose={() => setShLiq(null)} />}
      </Sheet>}
    </div>
  );
}

export default App;
