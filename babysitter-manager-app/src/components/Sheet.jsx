import React, { useState, useEffect, useRef } from 'react';
import { C } from '../utils/constants';
function Sheet({
  open,
  onClose,
  title,
  children
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  if (!open) return null;
  return (
    /*#__PURE__*/<div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,.45)",
        animation: "fadeIn .2s"
      }}
      onClick={onClose}>
      {/*#__PURE__*/<div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: C.bg,
          borderRadius: "20px 20px 0 0",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp .3s cubic-bezier(.32,1.2,.5,1)"
        }}
        onClick={e => e.stopPropagation()}>
        {/*#__PURE__*/<div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "10px 0 4px"
          }}>
          {/*#__PURE__*/<div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: C.borderM
            }} />}
        </div>}
        {title && /*#__PURE__*/<div
          style={{
            padding: "8px 20px 14px",
            borderBottom: "1px solid #E8DDD0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
          {/*#__PURE__*/<span
            style={{
              fontSize: 17,
              fontWeight: 700,
              fontFamily: "'Lora',serif",
              color: C.text
            }}>
            {title}
          </span>}
          {/*#__PURE__*/<button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 22,
              color: C.textL,
              lineHeight: 1,
              padding: "0 0 0 16px"
            }}>
            x
          </button>}
        </div>}
        {/*#__PURE__*/<div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "16px 20px 40px"
          }}>
          {children}
        </div>}
      </div>}
    </div>
  );
}
export default Sheet;
