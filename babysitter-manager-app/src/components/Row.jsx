import React, { useState, useEffect, useRef } from 'react';
import { C } from '../utils/constants';
const Row = ({
  l,
  v,
  bold,
  color,
  sep
}) => /*#__PURE__*/<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "9px 0",
    borderBottom: sep ? "none" : "1px solid " + C.border
  }}>
  {/*#__PURE__*/<span
    style={{
      fontSize: 13,
      color: color || C.textM,
      fontWeight: bold ? 700 : 400
    }}>
    {l}
  </span>}
  {/*#__PURE__*/<span
    style={{
      fontSize: 13,
      fontWeight: bold ? 800 : 500,
      color: color || C.text
    }}>
    {"\u20AC "}
    {v}
  </span>}
</div>;
export default Row;
