import { useState } from 'react';
import { C, setC, THEMES } from '../utils/constants';
import { auth_fb } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

function LoginScreen() {
  setC(THEMES[localStorage.getItem('bm_theme') || 'chiaro']);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [showConfig] = useState(!auth_fb);
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');

  const saveConfig = (e) => {
    e?.preventDefault?.();
    try {
      if (!apiKey) throw new Error('Manca apiKey');
      const parsed = {
        apiKey,
        authDomain,
        projectId,
        storageBucket,
        messagingSenderId,
        appId
      };
      localStorage.setItem('bm_fb_config', JSON.stringify(parsed));
      window.location.reload();
    } catch(e) {
      setErr('Errore: ' + e.message);
    }
  };

  if (showConfig) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.bg, padding: 32, fontFamily: C.font }}>
        <div style={{ background: C.card, borderRadius: 20, padding: 28, width: '100%', maxWidth: 360, border: '1px solid ' + C.border, boxShadow: '0 4px 24px rgba(0,0,0,.1)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 12, textAlign: 'center' }}>Configurazione Firebase</div>
          <div style={{ fontSize: 12, color: C.textL, marginBottom: 20, textAlign: 'center', lineHeight: 1.5 }}>
            Inserisci i parametri di configurazione del tuo progetto Firebase per continuare.
          </div>
          <form onSubmit={saveConfig} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input type="text" placeholder="apiKey (richiesto)" value={apiKey} onChange={e => setApiKey(e.target.value)} style={{ padding: '10px', borderRadius: 8, border: '1px solid ' + C.border, background: C.bg, color: C.text, outline: 'none', fontFamily: C.font, fontSize: 13 }} />
            <input type="text" placeholder="authDomain" value={authDomain} onChange={e => setAuthDomain(e.target.value)} style={{ padding: '10px', borderRadius: 8, border: '1px solid ' + C.border, background: C.bg, color: C.text, outline: 'none', fontFamily: C.font, fontSize: 13 }} />
            <input type="text" placeholder="projectId" value={projectId} onChange={e => setProjectId(e.target.value)} style={{ padding: '10px', borderRadius: 8, border: '1px solid ' + C.border, background: C.bg, color: C.text, outline: 'none', fontFamily: C.font, fontSize: 13 }} />
            <input type="text" placeholder="storageBucket" value={storageBucket} onChange={e => setStorageBucket(e.target.value)} style={{ padding: '10px', borderRadius: 8, border: '1px solid ' + C.border, background: C.bg, color: C.text, outline: 'none', fontFamily: C.font, fontSize: 13 }} />
            <input type="text" placeholder="messagingSenderId" value={messagingSenderId} onChange={e => setMessagingSenderId(e.target.value)} style={{ padding: '10px', borderRadius: 8, border: '1px solid ' + C.border, background: C.bg, color: C.text, outline: 'none', fontFamily: C.font, fontSize: 13 }} />
            <input type="text" placeholder="appId" value={appId} onChange={e => setAppId(e.target.value)} style={{ padding: '10px', borderRadius: 8, border: '1px solid ' + C.border, background: C.bg, color: C.text, outline: 'none', fontFamily: C.font, fontSize: 13 }} />
            <button 
              type="submit"
              style={{ width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none', background: C.blue, cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 12, transition: 'all .15s', fontFamily: C.font }}>
              Salva e Riavvia
            </button>
          </form>
          {err && <div style={{ marginTop: 14, fontSize: 11.5, color: C.red, background: C.redB, borderRadius: 8, padding: '8px 12px', lineHeight: 1.5 }}>{err}</div>}
        </div>
      </div>
    );
  }

  const doLogin = async (e) => {
    e.preventDefault();
    if (!auth_fb) {
      setErr('Firebase non configurato.');
      return;
    }
    if (!email || !password) {
      setErr('Inserisci email e password.');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth_fb, email, password);
      } else {
        await signInWithEmailAndPassword(auth_fb, email, password);
      }
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.bg, padding: 32, fontFamily: C.font }}>
      <div style={{ fontSize: 32, fontWeight: 800, fontFamily: C.fontSerif, color: C.text, marginBottom: 8 }}>BabySitter Manager</div>
      <div style={{ fontSize: 13, color: C.textL, marginBottom: 40, textAlign: 'center' }}>CCNL Colf e Badanti 2025-2028</div>
      <div style={{ background: C.card, borderRadius: 20, padding: 28, width: '100%', maxWidth: 340, border: '1px solid ' + C.border, boxShadow: '0 4px 24px rgba(0,0,0,.1)' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 20, textAlign: 'center' }}>Accedi per continuare</div>
        <form onSubmit={doLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '12px', borderRadius: 8, border: '1px solid ' + C.border, background: C.bg, color: C.text, outline: 'none', fontFamily: C.font }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '12px', borderRadius: 8, border: '1px solid ' + C.border, background: C.bg, color: C.text, outline: 'none', fontFamily: C.font }} />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none', background: C.blue, cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#fff', transition: 'all .15s', marginTop: 4, fontFamily: C.font }}>
            {loading ? 'Attendi...' : (isRegister ? 'Registrati' : 'Accedi')}
          </button>
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: C.textL, cursor: 'pointer' }} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
          </div>
        </form>
        {err && <div style={{ marginTop: 14, fontSize: 11.5, color: C.red, background: C.redB, borderRadius: 8, padding: '8px 12px', lineHeight: 1.5 }}>{err}</div>}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button type="button" onClick={() => { if(window.confirm('Sei sicuro di voler resettare Firebase?')) { localStorage.removeItem('bm_fb_config'); window.location.reload(); } }} style={{ background: 'transparent', border: 'none', color: C.red, fontSize: 12, cursor: 'pointer', fontFamily: C.font, textDecoration: 'underline' }}>
            Resetta configurazione Firebase
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
