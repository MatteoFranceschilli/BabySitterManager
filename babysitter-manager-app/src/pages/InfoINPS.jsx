import React from 'react';
import { C } from '../utils/constants';

function InfoINPS({ c }) {
  if (!c) return null;

  return (
    <div
      style={{
        background: C.card,
        borderRadius: 14,
        border: "1px solid " + C.borderM,
        padding: "14px 16px",
        marginTop: 14
      }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: C.accent,
          textTransform: "uppercase",
          letterSpacing: ".09em",
          marginBottom: 10
        }}>
        Esempi Calcolo INPS
      </div>
      <div
        style={{
          fontSize: 11.5,
          color: C.textM,
          marginBottom: 12,
          lineHeight: 1.5,
          background: C.bg,
          borderRadius: 8,
          padding: "8px 10px",
          border: "1px solid " + C.border
        }}>
        <strong style={{ color: C.text }}>Costi e Formule (Tariffe 2025)</strong><br />
        <span style={{ fontSize: 11, color: C.textM }}>
          L'INPS si calcola moltiplicando le <strong>ore lavorate nel periodo</strong> per una specifica tariffa in €.
          La retribuzione oraria usata per individuare lo scaglione include la quota oraria di 13a ed eventuali quote vitto e alloggio.
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        
        <div style={{ borderBottom: "1px solid " + C.border, paddingBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>1. Retribuzione effettiva ≤ 9,40 €/h</div>
          <div style={{ fontSize: 10.5, color: C.textM, marginTop: 4 }}>
            <strong>Tariffa Oraria:</strong> 1,79 € Tot (di cui 0,45 € lavoratore)<br/>
            <strong>Esempio:</strong> 100 ore x 1,79 € = 179,00 € (Trattenuta: 100 x 0,45 = 45,00 €)
          </div>
        </div>

        <div style={{ borderBottom: "1px solid " + C.border, paddingBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>2. Retrib. effettiva da 9,41 € a 11,45 €/h</div>
          <div style={{ fontSize: 10.5, color: C.textM, marginTop: 4 }}>
            <strong>Tariffa Oraria:</strong> 2,02 € Tot (di cui 0,51 € lavoratore)<br/>
            <strong>Esempio:</strong> 100 ore x 2,02 € = 202,00 € (Trattenuta: 100 x 0,51 = 51,00 €)
          </div>
        </div>

        <div style={{ borderBottom: "1px solid " + C.border, paddingBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>3. Retribuzione effettiva &gt; 11,45 €/h</div>
          <div style={{ fontSize: 10.5, color: C.textM, marginTop: 4 }}>
            <strong>Tariffa Oraria:</strong> 2,46 € Tot (di cui 0,62 € lavoratore)<br/>
            <strong>Esempio:</strong> 100 ore x 2,46 € = 246,00 € (Trattenuta: 100 x 0,62 = 62,00 €)
          </div>
        </div>

        <div style={{ paddingBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>4. Orario &gt; 24h o Modalità Agevolata</div>
          <div style={{ fontSize: 10.5, color: C.textM, marginTop: 4 }}>
            <strong>Tariffa Fissa:</strong> 1,30 € Tot (di cui 0,33 € lavoratore)<br/>
            <span style={{ fontStyle: "italic" }}>Si applica se le ore contrattuali settimanali superano le 24 o se lo si imposta a mano.</span><br/>
            <strong>Esempio:</strong> 100 ore x 1,30 € = 130,00 € (Trattenuta: 100 x 0,33 = 33,00 €)
          </div>
        </div>

      </div>
    </div>
  );
}

export default InfoINPS;
