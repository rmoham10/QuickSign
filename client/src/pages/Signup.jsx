import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

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
      await api.post('/auth/send-otp', { phone: data.phone });
      navigate('/verify-phone', { state: { phone: data.phone } });
    } catch (err) {
      setServerError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>BeFit</h1>
        <p style={styles.sub}>Create your account</p>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form} noValidate>

          <div style={styles.fieldWrap}>
            <label htmlFor="full_name" style={styles.label}>Full name</label>
            <input
              id="full_name"
              style={styles.input}
              placeholder="Jane Doe"
              autoComplete="name"
              {...register('full_name', { required: 'Full name is required' })}
            />
            {errors.full_name && <p style={styles.fieldErr}>{errors.full_name.message}</p>}
          </div>

          <div style={styles.fieldWrap}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              style={styles.input}
              placeholder="jane@email.com"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
              })}
            />
            {errors.email && <p style={styles.fieldErr}>{errors.email.message}</p>}
          </div>

          <div style={styles.fieldWrap}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              style={styles.input}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' }
              })}
            />
            {errors.password && <p style={styles.fieldErr}>{errors.password.message}</p>}
          </div>

          <div style={styles.fieldWrap}>
            <label htmlFor="phone" style={styles.label}>Phone number</label>
            <input
              id="phone"
              type="tel"
              style={styles.input}
              placeholder="+1234567890"
              autoComplete="tel"
              {...register('phone', {
                required: 'Phone is required',
                pattern: {
                  value: /^\+[1-9]\d{7,14}$/,
                  message: 'Use international format: +1234567890'
                }
              })}
            />
            {errors.phone && <p style={styles.fieldErr}>{errors.phone.message}</p>}
          </div>

          {serverError && <p style={styles.serverErr}>{serverError}</p>}

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/signin" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:      { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3', fontFamily: 'system-ui, sans-serif' },
  card:      { background: '#fff', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
  logo:      { fontSize: 28, fontWeight: 700, margin: '0 0 4px', color: '#1a1a1a' },
  sub:       { color: '#888', fontSize: 14, margin: '0 0 28px' },
  form:      { display: 'flex', flexDirection: 'column' },
  fieldWrap: { marginBottom: 16 },
  label:     { fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: '#1a1a1a' },
  input:     { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  fieldErr:  { color: '#e24b4a', fontSize: 12, marginTop: 4, marginBottom: 0 },
  serverErr: { color: '#e24b4a', fontSize: 13, marginBottom: 12 },
  btn:       { marginTop: 8, padding: '12px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer' },
  footer:    { textAlign: 'center', fontSize: 13, color: '#888', marginTop: 20 },
  link:      { color: '#534AB7', textDecoration: 'none', fontWeight: 500 },
};