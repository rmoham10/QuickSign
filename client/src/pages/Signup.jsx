import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import PageWrapper from './PageWrapper';

export default function Signup() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      await api.post('/auth/signup', data);
      // Auto-send OTP after signup
      await api.post('/auth/send-otp', { phone: data.phone });
      navigate('/verify-phone', { state: { phone: data.phone } });
    } catch (err) {
      setServerError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
        {
            <div style={styles.page}>
            <div style={styles.card}>
                <p style={styles.sub}>Create your account</p>

                <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
                <Field label="Full name" error={errors.full_name?.message}>
                    <input style={styles.input} placeholder="Jane Doe"
                    {...register('full_name', { required: 'Full name is required' })} />
                </Field>

                <Field label="Email" error={errors.email?.message}>
                    <input style={styles.input} type="email" placeholder="jane@email.com"
                    {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                    })} />
                </Field>

                <Field label="Password" error={errors.password?.message}>
                    <input style={styles.input} type="password" placeholder="Min. 8 characters"
                    {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'At least 8 characters' }
                    })} />
                </Field>

                <Field label="Phone number" error={errors.phone?.message}>
                    <input style={styles.input} placeholder="+1234567890"
                    {...register('phone', {
                        required: 'Phone is required',
                        pattern: { value: /^\+[1-9]\d{7,14}$/, message: 'Use international format: +1234567890' }
                    })} />
                </Field>

                {serverError && <p style={styles.error}>{serverError}</p>}

                <button style={styles.btn} type="submit" disabled={loading}>
                    {loading ? 'Creating account…' : 'Create account'}
                </button>
                </form>

                <p style={styles.footer}>
                Already have an account? <Link to="/signin" style={styles.link}>Sign in</Link>
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
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  btn:   { marginTop: 8, padding: '12px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer' },
  error: { color: '#e24b4a', fontSize: 13, margin: '0 0 12px' },
  footer:{ textAlign: 'center', fontSize: 13, color: '#888', marginTop: 20 },
  link:  { color: '#534AB7', textDecoration: 'none', fontWeight: 500 },
};