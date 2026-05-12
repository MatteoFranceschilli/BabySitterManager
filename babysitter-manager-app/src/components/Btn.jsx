import React, { useState, useEffect, useRef } from 'react';
import { C } from '../utils/constants';
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
  return (
    /*#__PURE__*/<button
      {...p}
      style={{
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
      }}
      onMouseDown={e => e.currentTarget.style.opacity = ".7"}
      onMouseUp={e => e.currentTarget.style.opacity = "1"}
      onTouchStart={e => e.currentTarget.style.opacity = ".7"}
      onTouchEnd={e => e.currentTarget.style.opacity = "1"}
    >
      {children}
    </button>
  );
}
export default Btn;
