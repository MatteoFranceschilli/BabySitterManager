import React, { useState, useEffect, useRef } from 'react';
import { ALLOG_GG, n2, C, toDS, parseDate, VITTO_GG, withScatti, CCNL } from '../utils/constants';
import Inp from './Inp';
import Av from './Av';
import SH from './SH';
import Sel from './Sel';
import Btn from './Btn';

function LiqSheet({
  c,
  db,
  onClose
}) {
  const p = db.persone.find(x => x.id === c.personaId);
  const pagaB = c.convivenza === "convivente" ? n2(c.pagaMensile) : n2(c.pagaOraria) * n2(c.oreSett) * 52 / 12;
  const pagaCS = withScatti(pagaB, c.scatti);
  const conv = c.convivenza === "convivente";
  const oreSett = n2(c.oreSett);
  const [dataFine, setDataFine] = useState(toDS(new Date()));
  const [motivazione, setMotivazione] = useState("dimissioni");
  const [ferieResidueInput, setFerieResidueInput] = useState("");
  const [anticTFR, setAnticTFR] = useState("0");
  if (!pagaCS) return (
    /*#__PURE__*/<div
      style={{
        padding: "20px",
        color: C.textL,
        textAlign: "center"
      }}>
      Inserisci paga nel contratto.
    </div>
  );
  const dataInizio = c.dataInizio || "";
  const inizio = parseDate(dataInizio);
  if (!inizio) return (
    /*#__PURE__*/<div
      style={{
        padding: "20px",
        color: C.textL,
        textAlign: "center"
      }}>
      Inserisci data inizio contratto.
    </div>
  );
  const fine = parseDate(dataFine) || new Date();
  const msServizio = Math.max(0, fine - inizio);
  const anniS = msServizio / (365.25 * 24 * 3600 * 1000);
  const mesiTot = Math.floor(msServizio / (30.4375 * 24 * 3600 * 1000));

  // TFR
  const retribAnnua = pagaCS * 12 + pagaCS + (conv ? (VITTO_GG + ALLOG_GG) * 365 : 0);
  const quotaAnnua = retribAnnua / 13.5;
  let tfrTot = 0;
  const aInizio = inizio.getFullYear(),
    aFine = fine.getFullYear();
  for (let a = aInizio; a <= aFine; a++) {
    const iniA = a === aInizio ? inizio : new Date(a, 0, 1);
    const finA = a === aFine ? fine : new Date(a, 11, 31);
    const giorniA = (finA - iniA) / (24 * 3600 * 1000) + 1;
    tfrTot += quotaAnnua * Math.min(giorniA / 365, 1);
  }
  const anticTFRv = Math.min(n2(anticTFR), tfrTot * 0.7);
  const tfrNetto = tfrTot - anticTFRv;

  // Preavviso
  const hasPrvPos = motivazione === "licenziamento_senza_preavviso" || motivazione === "dimissioni_giusta_causa";
  const hasPrvNeg = motivazione === "dimissioni_senza_preavviso";
  const giorniPrv = oreSett >= 25 ? anniS >= 5 ? 30 : 15 : mesiTot / 12 >= 2 ? 15 : 8;
  const giorniPrvEff = hasPrvNeg ? Math.ceil(giorniPrv / 2) : giorniPrv;
  const indPrv = hasPrvPos || hasPrvNeg ? pagaCS / 26 * giorniPrvEff : 0;

  // Ferie
  const annoFine = fine.getFullYear();
  const annoStr3 = annoFine + "-01";
  const inizioMFerie = dataInizio.substring(0, 7) > annoStr3 ? dataInizio.substring(0, 7) : annoStr3;
  const fineMFerie = dataFine.substring(0, 7);
  const mFerie = inizioMFerie <= fineMFerie ? Math.max(0, (parseInt(fineMFerie.split("-")[0]) - parseInt(inizioMFerie.split("-")[0])) * 12 + (parseInt(fineMFerie.split("-")[1]) - parseInt(inizioMFerie.split("-")[1])) + 1) : 0;
  const ferieMaturateAnno = Math.floor(CCNL.ferie * mFerie / 12);
  const ferieResidue = ferieResidueInput !== "" ? n2(ferieResidueInput) : ferieMaturateAnno;
  const indFerie = ferieResidue * (pagaCS / 26);

  // 13a pro-quota
  const mese13 = fine.getMonth() + 1;
  const ind13 = pagaCS * (mese13 / 12);
  const totLordo = tfrNetto + (hasPrvPos ? indPrv : hasPrvNeg ? -indPrv : 0) + indFerie + ind13;
  const Riga = ({
    l,
    v,
    note,
    color,
    bold
  }) => /*#__PURE__*/<div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      padding: "9px 0",
      borderBottom: "1px solid " + C.border
    }}>
    {/*#__PURE__*/<div
      style={{
        flex: 1,
        paddingRight: 12
      }}>
      {/*#__PURE__*/<span
        style={{
          fontSize: 13,
          color: bold ? C.text : C.textM,
          fontWeight: bold ? 700 : 400
        }}>
        {l}
      </span>}
      {note && /*#__PURE__*/<div
        style={{
          fontSize: 10.5,
          color: C.textL,
          marginTop: 2
        }}>
        {note}
      </div>}
    </div>}
    {/*#__PURE__*/<span
      style={{
        fontSize: 14,
        fontWeight: 800,
        color: color || C.text,
        flexShrink: 0
      }}>
      {"\u20AC "}
      {v}
    </span>}
  </div>;
  return (
    /*#__PURE__*/<div>
      {/*#__PURE__*/<div
        style={{
          background: C.bg,
          borderRadius: 12,
          border: "1px solid " + C.border,
          padding: "12px 14px",
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center"
        }}>
        {/*#__PURE__*/<Av p={p} sz={40} />}
        {/*#__PURE__*/<div>
          {/*#__PURE__*/<div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: C.text
            }}>
            {p ? (p.nome + " " + p.cognome).trim() : "---"}
          </div>}
          {/*#__PURE__*/<div
            style={{
              fontSize: 11,
              color: C.textL,
              marginTop: 2
            }}>
            {"Dal "}
            {dataInizio || "---"}
            {" \xB7 "}
            {mesiTot}
            {" mesi di servizio"}
          </div>}
        </div>}
      </div>}
      {/*#__PURE__*/<SH title="Parametri simulazione" />}
      {/*#__PURE__*/<div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 4
        }}>
        {/*#__PURE__*/<Inp
          label="Data fine rapporto"
          type="date"
          value={dataFine}
          onChange={e => setDataFine(e.target.value)} />}
        {/*#__PURE__*/<Sel
          label="Motivo cessazione"
          value={motivazione}
          onChange={e => setMotivazione(e.target.value)}>
          {/*#__PURE__*/<option value="dimissioni">
            Dimissioni volontarie
          </option>}
          {/*#__PURE__*/<option value="dimissioni_giusta_causa">
            Dimissioni giusta causa
          </option>}
          {/*#__PURE__*/<option value="dimissioni_senza_preavviso">
            Dimissioni senza preavviso
          </option>}
          {/*#__PURE__*/<option value="licenziamento">
            Licenziamento con preavviso
          </option>}
          {/*#__PURE__*/<option value="licenziamento_senza_preavviso">
            Licenziamento senza preavviso (indennità pagata)
          </option>}
          {/*#__PURE__*/<option value="licenziamento_giusta_causa">
            Licenziamento per giusta causa
          </option>}
          {/*#__PURE__*/<option value="scadenza">
            Scadenza contratto
          </option>}
          {/*#__PURE__*/<option value="morte_datore">
            Morte del datore
          </option>}
        </Sel>}
        {/*#__PURE__*/<Inp
          label="Ferie residue (gg)"
          type="number"
          step="1"
          min="0"
          value={ferieResidueInput}
          onChange={e => setFerieResidueInput(e.target.value)}
          placeholder={"stima: " + ferieMaturateAnno + " gg"} />}
        {/*#__PURE__*/<Inp
          label={"Anticipo TFR ricevuto (\u20AC)"}
          type="number"
          step="0.01"
          min="0"
          value={anticTFR}
          onChange={e => setAnticTFR(e.target.value)}
          placeholder="0" />}
      </div>}
      {/*#__PURE__*/<div
        style={{
          fontSize: 11,
          color: C.textL,
          marginBottom: 16,
          lineHeight: 1.5
        }}>
        {"Ferie stimate: "}
        {ferieMaturateAnno}
        {" gg maturate nell'anno in corso. Modifica il campo se conosci il residuo effettivo."}
      </div>}
      {/*#__PURE__*/<SH title="Voci di liquidazione" />}
      {/*#__PURE__*/<div
        style={{
          background: C.card,
          borderRadius: 12,
          border: "1px solid " + C.border,
          padding: "4px 14px",
          marginBottom: 16
        }}>
        {/*#__PURE__*/<Riga
          l="TFR maturato totale (Art.41)"
          v={tfrTot.toFixed(2)}
          note={"Quota annua €" + quotaAnnua.toFixed(2) + " · " + anniS.toFixed(1) + " anni"}
          color={C.green} />}
        {anticTFRv > 0 && /*#__PURE__*/<Riga
          l={"Anticipo TFR gi\xE0 ricevuto"}
          v={"−" + anticTFRv.toFixed(2)}
          note="Da detrarre (max 70% maturato)"
          color={C.red} />}
        {/*#__PURE__*/<Riga l="TFR netto" v={tfrNetto.toFixed(2)} bold={true} color={C.green} />}
        {hasPrvPos && /*#__PURE__*/<Riga
          l="Indennità preavviso (Art.40)"
          v={indPrv.toFixed(2)}
          note={giorniPrvEff + " giorni · €" + (pagaCS / 26).toFixed(2) + "/gg"}
          color={C.accent} />}
        {hasPrvNeg && /*#__PURE__*/<Riga
          l="Trattenuta preavviso non concesso"
          v={"−" + indPrv.toFixed(2)}
          note={giorniPrvEff + " giorni (50% per dimissioni)"}
          color={C.red} />}
        {/*#__PURE__*/<Riga
          l={"Ferie non godute (" + ferieResidue + " gg)"}
          v={indFerie.toFixed(2)}
          note={"€" + (pagaCS / 26).toFixed(2) + "/gg (1/26 mensile)"}
          color={C.blue} />}
        {/*#__PURE__*/<Riga
          l={"13a pro-quota (" + mese13 + "/12)"}
          v={ind13.toFixed(2)}
          note="Mesi nell'anno in corso"
          color={C.accent} />}
      </div>}
      {/*#__PURE__*/<div
        style={{
          background: C.greenB,
          borderRadius: 12,
          border: "1px solid " + C.green + "44",
          padding: "16px",
          marginBottom: 8
        }}>
        {/*#__PURE__*/<div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
          {/*#__PURE__*/<div>
            {/*#__PURE__*/<div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.textM
              }}>
              Totale liquidazione lordo
            </div>}
            {/*#__PURE__*/<div
              style={{
                fontSize: 11,
                color: C.textL,
                marginTop: 2
              }}>
              Stima indicativa
            </div>}
          </div>}
          {/*#__PURE__*/<div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: C.green,
              fontFamily: C.fontSerif
            }}>
            {"\u20AC "}
            {totLordo.toFixed(2)}
          </div>}
        </div>}
      </div>}
      {/*#__PURE__*/<div
        style={{
          fontSize: 10,
          color: C.textL,
          lineHeight: 1.6,
          marginBottom: 16
        }}>
        * Il TFR è soggetto a tassazione separata IRPEF. Non include rivalutazione ISTAT né eventuali arretrati. Per calcoli ufficiali consulta CAF o patronato.
      </div>}
      {/*#__PURE__*/<Btn full={true} variant="ghost" onClick={onClose}>
        Chiudi
      </Btn>}
    </div>
  );
}
export default LiqSheet;
