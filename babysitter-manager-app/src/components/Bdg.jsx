import React, { useState, useEffect, useRef } from 'react';
import { TG, C } from '../utils/constants';
function Bdg({
  tipo
}) {
  const t = TG[tipo] || TG.ordinaria;
  return (
    /*#__PURE__*/<span
      style={{
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        background: t.bg,
        color: t.fg,
        textTransform: "uppercase",
        letterSpacing: ".06em",
        whiteSpace: "nowrap"
      }}>
      {t.label}
    </span>
  );
}
export default Bdg;
