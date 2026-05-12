import React, { useState, useEffect, useRef } from 'react';
import { C } from '../utils/constants';
function SH({
  title
}) {
  return (
    /*#__PURE__*/<div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        margin: "20px 0 12px"
      }}>
      {/*#__PURE__*/<span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: C.text,
          fontFamily: C.fontSerif
        }}>
        {title}
      </span>}
      {/*#__PURE__*/<div
        style={{
          flex: 1,
          height: 1,
          background: C.border,
          marginLeft: 4
        }} />}
    </div>
  );
}
export default SH;
