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
    <div style={{
      minHeight: '100vh',
      background: '#001238',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Blobs decorativos */}
      <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'rgba(0,48,135,0.35)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'rgba(204,0,1,0.1)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', left: '30%', width: '25vw', height: '25vw', borderRadius: '50%', background: 'rgba(0,32,96,0.2)', pointerEvents: 'none' }} />

      {/* Card */}
      <div style={{
        background: 'white',
        borderRadius: '1.25rem',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Franja bandera peruana */}
        <div style={{ height: '6px', background: 'linear-gradient(to right, #CC0001 33.33%, white 33.33%, white 66.66%, #CC0001 66.66%)' }} />

        {/* Cabecera */}
        <div style={{ padding: '2rem 2rem 1.25rem', textAlign: 'center' }}>
          {/* Badge / Sello */}
          <div style={{
            width: '84px', height: '84px', borderRadius: '50%',
            background: '#002060',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            border: '3px solid #C8A000',
            boxShadow: '0 0 0 6px rgba(200,160,0,0.12), 0 8px 24px rgba(0,32,96,0.3)',
          }}>
            <ShieldCheck style={{ width: '42px', height: '42px', color: '#C8A000' }} />
          </div>
          <div style={{ fontSize: '1.375rem', fontWeight: '800', color: '#002060', letterSpacing: '0.08em' }}>
            SUNAT
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginTop: '0.25rem' }}>
            Facturación Electrónica
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.2rem', lineHeight: 1.4 }}>
            Superintendencia Nacional de Aduanas<br />y de Administración Tributaria
          </div>
        </div>

        {/* Separador */}
        <div style={{ height: '1px', background: '#e2e8f0', margin: '0 1.5rem' }} />

        {/* Formulario */}
        <div style={{ padding: '1.5rem 2rem 2rem' }}>
          <h1 style={{ fontSize: '1rem', fontWeight: '700', color: '#002060', textAlign: 'center', marginBottom: '1.25rem' }}>
            Iniciar Sesión
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
                  {showPass
                    ? <EyeOff style={{ width: '16px', height: '16px' }} />
                    : <Eye style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: '0.625rem', fontSize: '0.875rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                marginTop: '0.25rem',
                background: loading ? '#94a3b8' : '#002060',
                color: 'white',
                border: 'none',
                borderRadius: '0.625rem',
                fontWeight: '700',
                fontSize: '0.9375rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background 0.15s',
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: 'inline-block', width: '1rem', height: '1rem', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', animation: 'icon-spin 0.8s linear infinite' }} />
                  Verificando...
                </>
              ) : (
                <><LogIn style={{ width: '16px', height: '16px' }} /> Ingresar al Sistema</>
              )}
            </button>
          </form>

          {/* Credenciales demo */}
          <div style={{ marginTop: '1.25rem', padding: '0.875rem', borderRadius: '0.625rem', background: '#f0f4ff', border: '1px solid #dbeafe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#002060', marginBottom: '0.5rem' }}>
              <Info style={{ width: '12px', height: '12px' }} /> Credenciales de acceso demo
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Usuario</div>
                <code style={{ display: 'block', marginTop: '0.125rem', padding: '0.25rem 0.5rem', background: 'white', borderRadius: '0.375rem', fontFamily: 'monospace', fontWeight: '700', color: '#002060', fontSize: '0.8125rem' }}>demo</code>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Contraseña</div>
                <code style={{ display: 'block', marginTop: '0.125rem', padding: '0.25rem 0.5rem', background: 'white', borderRadius: '0.375rem', fontFamily: 'monospace', fontWeight: '700', color: '#002060', fontSize: '0.8125rem' }}>demo123</code>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.6875rem', color: '#94a3b8' }}>
            © {new Date().getFullYear()} SUNAT Demo · Solo para pruebas
          </div>
        </div>
      </div>
    </div>
  );
}
