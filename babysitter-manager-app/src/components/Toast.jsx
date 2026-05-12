import React, { useState, useEffect, useRef } from 'react';
import { C } from '../utils/constants';
function Toast({
  msg,
  type
}) {
  return (
    /*#__PURE__*/<div
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        padding: "11px 18px",
        borderRadius: 20,
        background: type === "err" ? "#3A0808" : "#0F2A1A",
        color: type === "err" ? "#FFA0A0" : "#80FFB4",
        fontSize: 12.5,
        fontWeight: 700,
        boxShadow: "0 4px 24px rgba(0,0,0,.3)",
        whiteSpace: "nowrap",
        animation: "slideDown .25s"
      }}>
      {msg}
    </div>
  );
}
export default Toast;
