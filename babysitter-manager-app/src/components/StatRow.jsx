import React, { useState, useEffect, useRef } from 'react';
import { C } from '../utils/constants';
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
export default StatRow;
