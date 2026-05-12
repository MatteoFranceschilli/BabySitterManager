import React, { useState, useEffect, useRef } from 'react';
import { C } from '../utils/constants';
function Stat({
  val,
  label,
  color
}) {
  return (
    /*#__PURE__*/<div
      style={{
        flex: 1,
        background: C.card,
        borderRadius: 14,
        padding: "13px 11px",
        border: "1px solid #E8DDD0",
        minWidth: 0
      }}>
      {/*#__PURE__*/<div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color,
          fontFamily: "'Lora',serif",
          lineHeight: 1.1
        }}>
        {val}
      </div>}
      {/*#__PURE__*/<div
        style={{
          fontSize: 9.5,
          color: C.textL,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".07em",
          marginTop: 3
        }}>
        {label}
      </div>}
    </div>
  );
}
export default Stat;
