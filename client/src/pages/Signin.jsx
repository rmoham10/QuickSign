import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import PageWrapper from './PageWrapper';

export default function Signin() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setServerError(''); setLoading(true);
    try {
      const res = await api.post('/auth/signin', data);
      localStorage.setItem('befit_token', res.data.token);
      localStorage.setItem('befit_user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      const e = err.response?.data;
      if (e?.needsVerification) {
        await api.post('/auth/send-otp', { phone: e.phone });
        navigate('/verify-phone', { state: { phone: e.phone } });
      } else {
        setServerError(e?.error || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
        {
            <div style={styles.page}>
            <div style={styles.card}>
                <p style={styles.sub}>Sign in to your account</p>

                <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
                <Field label="Email" error={errors.email?.message}>
                    <input style={styles.input} type="email" placeholder="jane@email.com"
                    {...register('email', { required: 'Email is required' })} />
                </Field>

                <Field label="Password" error={errors.password?.message}>
                    <input style={styles.input} type="password" placeholder="Your password"
                    {...register('password', { required: 'Password is required' })} />
                </Field>

                {serverError && <p style={styles.error}>{serverError}</p>}

                <button style={styles.btn} type="submit" disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                </button>
                </form>

                <p style={styles.footer}>
                No account? <Link to="/signup" style={styles.link}>Sign up</Link>
                </p>
            </div>
            </div>
        }
    </PageWrapper>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
      {error && <p style={{ color: '#e24b4a', fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

const styles = {
  page:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3', fontFamily: 'system-ui, sans-serif' },
  card:  { background: '#fff', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
  logo:  { fontSize: 28, fontWeight: 700, margin: '0 0 4px', color: '#1a1a1a' },
  sub:   { color: '#888', fontSize: 14, margin: '0 0 28px' },
  form:  { display: 'flex', flexDirection: 'column' },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' },
  btn:   { marginTop: 8, padding: '12px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer' },
  error: { color: '#e24b4a', fontSize: 13, margin: '0 0 12px' },
  footer:{ textAlign: 'center', fontSize: 13, color: '#888', marginTop: 20 },
  link:  { color: '#534AB7', textDecoration: 'none', fontWeight: 500 },
};