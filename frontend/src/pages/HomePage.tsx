import { useNavigate } from 'react-router-dom';
import { Button, Col, Layout, Row, Space, Typography } from 'antd';
import { LoginOutlined, TeamOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1677ff 100%)' }}>
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        <Row gutter={[32, 32]} justify="center" align="middle" style={{ maxWidth: 960, width: '100%' }}>
          <Col xs={24} md={12} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                background: 'rgba(22,119,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                border: '2px solid rgba(22,119,255,0.4)',
              }}
            >
              <TeamOutlined style={{ fontSize: 48, color: '#60a5fa' }} />
            </div>

            <Title style={{ color: '#fff', fontSize: 42, marginBottom: 16, lineHeight: 1.2 }}>
              Candidate<br />
              <span style={{ color: '#60a5fa' }}>Management</span><br />
              System
            </Title>

            <Paragraph style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, marginBottom: 36 }}>
              Gérez vos candidats efficacement — suivez les candidatures,
              validez les profils et organisez votre pipeline de recrutement.
            </Paragraph>

            <Space size="middle">
              <Button
                type="primary"
                size="large"
                icon={<LoginOutlined />}
                onClick={() => navigate('/login')}
                style={{ height: 48, paddingInline: 32, fontSize: 16 }}
              >
                Se connecter
              </Button>
              <Button
                size="large"
                icon={<TeamOutlined />}
                onClick={() => navigate('/candidates')}
                style={{
                  height: 48,
                  paddingInline: 32,
                  fontSize: 16,
                  background: 'rgba(255,255,255,0.1)',
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: '#fff',
                }}
              >
                Voir les candidats
              </Button>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <Row gutter={[16, 16]}>
              {[
                { icon: '📋', label: 'Gestion centralisée', desc: 'Tous vos candidats en un seul endroit.' },
                { icon: '✅', label: 'Validation rapide', desc: 'Validez ou rejetez en un clic.' },
                { icon: '🔍', label: 'Recherche & filtres', desc: 'Retrouvez n\'importe quel profil instantanément.' },
                { icon: '🔒', label: 'Accès sécurisé', desc: 'Authentification JWT pour vos données.' },
              ].map((item) => (
                <Col xs={24} sm={12} key={item.label}>
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      padding: '20px 20px',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                    <div style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{item.desc}</div>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default HomePage;
