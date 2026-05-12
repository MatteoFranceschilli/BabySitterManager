import React, { useState, useEffect, useRef } from 'react';
import { AVC, C } from '../utils/constants';
function Av({
  p,
  sz
}) {
  sz = sz || 38;
  const i = ((p && p.nome ? p.nome[0] : "") + (p && p.cognome ? p.cognome[0] : "")).toUpperCase() || "?";
  const ci = p && p.nome ? p.nome.charCodeAt(0) % AVC.length : 0;
  return (
    /*#__PURE__*/<div
      style={{
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
      }}>
      {i}
    </div>
  );
}
export default Av;
