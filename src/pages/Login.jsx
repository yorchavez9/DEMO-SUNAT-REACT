import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/client.js';
import { ShieldCheck, LogIn, XCircle, Info, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const ok = login(usuario, password);
      if (!ok) {
        setError('Usuario o contraseña incorrectos');
        setLoading(false);
        return;
      }
      navigate('/');
    }, 250);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#e8ecf0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: '400px', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #d0d5dd', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>

        {/* Cabecera navy */}
        <div style={{ background: '#002060', padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <ShieldCheck style={{ width: '32px', height: '32px', color: 'white' }} />
          </div>
          <div style={{ color: 'white', fontWeight: '800', fontSize: '1.25rem', letterSpacing: '0.06em' }}>SUNAT</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem', marginTop: '0.3rem', lineHeight: 1.5 }}>
            Superintendencia Nacional de Aduanas<br />y de Administración Tributaria
          </div>
        </div>

        {/* Cuerpo del formulario */}
        <div style={{ background: 'white', padding: '2rem' }}>
          <h1 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
            Acceso al Sistema de Facturación
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label">Usuario</label>
              <input
                autoFocus
                className="input"
                value={usuario}
                onChange={(e) => { setUsuario(e.target.value); setError(null); }}
                placeholder="Ingrese su usuario"
                required
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input"
                  style={{ paddingRight: '2.75rem' }}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="Ingrese su contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  {showPass ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '0.7rem 1rem', marginTop: '0.25rem', background: loading ? '#94a3b8' : '#002060', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '700', fontSize: '0.9375rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? (
                <><span style={{ display: 'inline-block', width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', animation: 'icon-spin 0.8s linear infinite' }} /> Verificando...</>
              ) : (
                <><LogIn style={{ width: '16px', height: '16px' }} /> Ingresar</>
              )}
            </button>
          </form>

          {/* Credenciales demo */}
          <div style={{ marginTop: '1.25rem', padding: '0.875rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', marginBottom: '0.5rem' }}>
              <Info style={{ width: '12px', height: '12px' }} /> Credenciales de prueba
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Usuario</div>
                <code style={{ display: 'block', marginTop: '0.125rem', padding: '0.25rem 0.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontFamily: 'monospace', fontWeight: '700', color: '#1e293b', fontSize: '0.8rem' }}>demo</code>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Contraseña</div>
                <code style={{ display: 'block', marginTop: '0.125rem', padding: '0.25rem 0.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontFamily: 'monospace', fontWeight: '700', color: '#1e293b', fontSize: '0.8rem' }}>demo123</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '1.5rem', fontSize: '0.6875rem', color: '#94a3b8', textAlign: 'center' }}>
        © {new Date().getFullYear()} SUNAT Demo · Solo para pruebas
      </div>
    </div>
  );
}
