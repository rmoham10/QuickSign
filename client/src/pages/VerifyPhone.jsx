import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function VerifyPhone() {
  const { state } = useLocation();
  const phone = state?.phone;
  const navigate = useNavigate();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const refs = useRef([]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0)
      refs.current[i - 1]?.focus();
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length < 6) return setError('Enter all 6 digits');
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/verify-otp', { phone, otp });
      localStorage.setItem('befit_token', data.token);
      localStorage.setItem('befit_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/send-otp', { phone });
      setResendMsg('New code sent!');
      setTimeout(() => setResendMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not resend');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>BeFit</h1>
        <p style={styles.title}>Verify your phone</p>
        <p style={styles.sub}>We sent a 6-digit code to <strong>{phone}</strong></p>

        <div style={styles.otpRow}>
          {digits.map((d, i) => (
            <input key={i} ref={el => refs.current[i] = el}
              style={styles.otpBox} maxLength={1} value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              inputMode="numeric" />
          ))}
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {resendMsg && <p style={styles.success}>{resendMsg}</p>}

        <button style={styles.btn} onClick={handleVerify} disabled={loading}>
          {loading ? 'Verifying…' : 'Verify'}
        </button>

        <p style={styles.resend}>
          Didn't receive it?{' '}
          <span style={styles.link} onClick={handleResend}>Resend code</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:   { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3', fontFamily: 'system-ui, sans-serif' },
  card:   { background: '#fff', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 400, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', textAlign: 'center' },
  logo:   { fontSize: 28, fontWeight: 700, margin: '0 0 4px', color: '#1a1a1a' },
  title:  { fontSize: 20, fontWeight: 600, margin: '0 0 8px', color: '#1a1a1a' },
  sub:    { color: '#888', fontSize: 14, margin: '0 0 28px' },
  otpRow: { display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 },
  otpBox: { width: 44, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 600, borderRadius: 8, border: '1.5px solid #ddd', outline: 'none' },
  btn:    { width: '100%', padding: '12px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer', marginBottom: 16 },
  error:  { color: '#e24b4a', fontSize: 13, marginBottom: 12 },
  success:{ color: '#1D9E75', fontSize: 13, marginBottom: 12 },
  resend: { fontSize: 13, color: '#888' },
  link:   { color: '#534AB7', cursor: 'pointer', fontWeight: 500 },
};