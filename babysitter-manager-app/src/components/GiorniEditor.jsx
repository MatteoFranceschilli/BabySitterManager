import React, { useState, useEffect, useRef } from 'react';
import { blankGL, getIS, GG_KEYS, calcOre, C, GG_LABEL, oreGL } from '../utils/constants';
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
  return (
    /*#__PURE__*/<div>
      {/*#__PURE__*/<div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10
        }}>
        {/*#__PURE__*/<span
          style={{
            fontSize: 11,
            color: C.textL,
            fontWeight: 600
          }}>
          Clicca giorno per attivare, poi imposta orario
        </span>}
        {/*#__PURE__*/<span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: C.accent,
            background: C.accentL,
            padding: "3px 10px",
            borderRadius: 20
          }}>
          {tot}
          h/sett
        </span>}
      </div>}
      {GG_KEYS.map(k => {
        const g = gl[k] || {
          attivo: false,
          inizio: "",
          fine: ""
        };
        const ore = g.attivo && g.inizio && g.fine ? calcOre(g.inizio, g.fine) : null;
        return (
          /*#__PURE__*/<div
            key={k}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 0",
              borderBottom: "1px solid " + C.border
            }}>
            {/*#__PURE__*/<button
              onClick={() => setG(k, "attivo", !g.attivo)}
              style={{
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
              }}>
              {GG_LABEL[k]}
            </button>}
            {g.attivo ? /*#__PURE__*/<div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flex: 1
              }}>
              {/*#__PURE__*/<input
                type="time"
                value={g.inizio}
                onChange={e => setG(k, "inizio", e.target.value)}
                style={{
                  ...IS,
                  padding: "8px 10px",
                  fontSize: 13,
                  flex: 1
                }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border} />}
              {/*#__PURE__*/<span
                style={{
                  fontSize: 13,
                  color: C.textL,
                  flexShrink: 0
                }}>
                —
              </span>}
              {/*#__PURE__*/<input
                type="time"
                value={g.fine}
                onChange={e => setG(k, "fine", e.target.value)}
                style={{
                  ...IS,
                  padding: "8px 10px",
                  fontSize: 13,
                  flex: 1
                }}
                onFocus={e => e.target.style.borderColor = C.accent}
                onBlur={e => e.target.style.borderColor = C.border} />}
              {ore && /*#__PURE__*/<span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.green,
                  flexShrink: 0,
                  minWidth: 28
                }}>
                {ore.toFixed(1)}
                h
              </span>}
            </div> : /*#__PURE__*/<span
              style={{
                fontSize: 12,
                color: C.textL,
                flex: 1,
                fontStyle: "italic"
              }}>
              Giorno libero
            </span>}
          </div>
        );
      })}
    </div>
  );
}
export default GiorniEditor;
