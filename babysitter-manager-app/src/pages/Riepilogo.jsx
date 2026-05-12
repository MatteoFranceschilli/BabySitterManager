import React, { useState, useEffect, useRef } from 'react';
import { MIN_ORA, ALLOG_GG, tredM, n2, MIN_CONV, prova, C, VITTO_GG, tfrM, withScatti, preav, LIV } from '../utils/constants';
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
  const rows = [
    ["Convivenza", conv ? "Convivente" : "Non convivente"], 
    ["Orario max", conv ? "54h/sett 10h/gg (Art.14)" : "40h/sett 8h/gg (Art.14)"], 
    conv && MIN_CONV[liv] ? ["Min. mensile tab.", "euro " + MIN_CONV[liv].toFixed(2) + " (dic.2025)"] : [], 
    MIN_ORA[liv] ? ["Min. orario tab.", "euro " + MIN_ORA[liv].toFixed(2) + "/h (dic.2025)"] : [], 
    parseInt(c.scatti) > 0 ? ["Scatti (Art.37)", c.scatti + "x4% = +" + c.scatti * 4 + "%"] : [], 
    pagaCS > 0 ? ["Paga stimata", "euro " + pagaCS.toFixed(2) + "/mese"] : [], 
    pagaCS > 0 ? ["TFR/mese (Art.41)", "euro " + tfrM(pagaCS)] : [], 
    pagaCS > 0 ? ["13a/mese (Art.39)", "euro " + tredM(pagaCS)] : [], 
    conv ? ["Vitto conv.(Tab.F)", "euro " + (VITTO_GG * 30).toFixed(2) + "/mese"] : [], 
    conv ? ["Alloggio conv.(Tab.F)", "euro " + (ALLOG_GG * 30).toFixed(2) + "/mese"] : [], 
    ["Periodo prova (Art.12)", prova(liv, c.convivenza)], 
    ["Preavviso <5aa (Art.40)", preav(c.oreSett, false)], 
    ["Preavviso >5aa (Art.40)", preav(c.oreSett, true)], 
    ["Ferie (Art.17)", "26 giorni lavorativi/anno"], 
    ["Conserv. posto malattia", "<6m:10gg / >6m:45gg / >2aa:180gg"], 
    ["Contrib. contr.(Art.54)", "0.06 euro/h (0.04 datore + 0.02 lav.)"]
  ].filter(r => r.length === 2);
  return (
    /*#__PURE__*/<div
      style={{
        background: C.card,
        borderRadius: 14,
        border: "1px solid " + C.borderM,
        padding: "14px 16px",
        marginTop: 14
      }}>
      {/*#__PURE__*/<div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: C.accent,
          textTransform: "uppercase",
          letterSpacing: ".09em",
          marginBottom: 10
        }}>
        Riepilogo CCNL 2025-2028
      </div>}
      {/*#__PURE__*/<div
        style={{
          fontSize: 11.5,
          color: C.textM,
          marginBottom: 12,
          lineHeight: 1.5,
          background: C.bg,
          borderRadius: 8,
          padding: "8px 10px",
          border: "1px solid " + C.border
        }}>
        {/*#__PURE__*/<strong
          style={{
            color: C.text
          }}>
          {info.label}
        </strong>}
        {/*#__PURE__*/<br />}
        {/*#__PURE__*/<span
          style={{
            fontSize: 11,
            color: C.textM
          }}>
          {info.desc}
        </span>}
      </div>}
      {rows.map(function (r) {
        return (
          /*#__PURE__*/<div
            key={r[0]}
            style={{
              display: "flex",
              gap: 8,
              padding: "7px 0",
              borderBottom: "1px solid " + C.border
            }}>
            {/*#__PURE__*/<span
              style={{
                fontSize: 10.5,
                color: C.textM,
                minWidth: 140,
                fontWeight: 700,
                flexShrink: 0
              }}>
              {r[0]}
            </span>}
            {/*#__PURE__*/<span
              style={{
                fontSize: 11,
                color: C.text,
                flex: 1
              }}>
              {r[1]}
            </span>}
          </div>
        );
      })}
    </div>
  );
}
export default Riepilogo;
