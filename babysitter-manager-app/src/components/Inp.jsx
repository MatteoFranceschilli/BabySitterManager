import React, { useState, useEffect, useRef } from 'react';
import { getIS, C } from '../utils/constants';
function Inp({
  label,
  full,
  col,
  style,
  ...p
}) {
  const IS = getIS();
  return (
    /*#__PURE__*/<div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        gridColumn: full ? "1/-1" : col
      }}>
      {label && /*#__PURE__*/<span
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".09em",
          color: C.textL
        }}>
        {label}
      </span>}
      {/*#__PURE__*/<input
        {...p}
        style={{
          ...IS,
          ...(style || {})
        }}
        onFocus={e => e.target.style.borderColor = C.accent}
        onBlur={e => e.target.style.borderColor = C.border}
      />}
    </div>
  );
}
export default Inp;
