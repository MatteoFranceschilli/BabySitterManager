import React, { useState, useEffect, useRef } from 'react';
import { C } from '../utils/constants';
function Toggle({
  options,
  value,
  onChange
}) {
  return (
    /*#__PURE__*/<div
      style={{
        display: "flex",
        background: C.border,
        borderRadius: 10,
        padding: 3,
        gap: 2
      }}>
      {options.map(o => /*#__PURE__*/<button
        key={o.v}
        onClick={() => onChange(o.v)}
        style={{
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
        }}>
        {o.l}
      </button>)}
    </div>
  );
}
export default Toggle;
