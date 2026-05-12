import React, { useState, useEffect, useRef } from 'react';
import { getIS, C } from '../utils/constants';
function TA({
  label,
  full,
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
        gridColumn: full ? "1/-1" : undefined
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
      {/*#__PURE__*/<textarea
        {...p}
        style={{
          ...IS,
          resize: "vertical",
          minHeight: 68,
          ...(style || {})
        }}
        onFocus={e => e.target.style.borderColor = C.accent}
        onBlur={e => e.target.style.borderColor = C.border}
      />}
    </div>
  );
}
export default TA;
