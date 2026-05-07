import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Divider, Form, Grid, Input, Layout, Typography } from 'antd';
import { LockOutlined, MailOutlined, TeamOutlined } from '@ant-design/icons';

import { authService } from '../services';

const { Content } = Layout;
const { Title, Text, Link } = Typography;
const { useBreakpoint } = Grid;

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<LoginFormValues>();

  const onFinish = async (values: LoginFormValues): Promise<void> => {
    setApiError(null);
    setLoading(true);
    try {
      await authService.login(values.email, values.password);
      navigate('/candidates', { replace: true });
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1677ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
        }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: isMobile ? '100%' : 620,
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            border: 'none',
          }}
          bodyStyle={{ padding: isMobile ? '28px 20px' : '48px 52px' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#e6f4ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <TeamOutlined style={{ fontSize: 28, color: '#1677ff' }} />
            </div>
            <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
              Connexion
            </Title>
            <Text type="secondary">Accédez à votre espace de gestion</Text>
          </div>

          {apiError && (
            <Alert
              message={apiError}
              type="error"
              showIcon
              style={{ marginBottom: 20, borderRadius: 8 }}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            size="large"
          >
            <Form.Item
              name="email"
              label="Adresse email"
              rules={[
                { required: true, message: "L'email est requis." },
                { type: 'email', message: "L'email doit être valide." },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="vous@exemple.com"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mot de passe"
              rules={[{ required: true, message: 'Le mot de passe est requis.' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="••••••••"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{ height: 44, borderRadius: 8, fontWeight: 600 }}
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </Form.Item>
          </Form>

          <Divider plain style={{ color: '#8c8c8c', fontSize: 13 }}>
            Pas encore de compte ?
          </Divider>

          <Button
            block
            style={{ borderRadius: 8, height: 40 }}
            onClick={() => navigate('/register')}
          >
            Créer un compte
          </Button>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link onClick={() => navigate('/')} style={{ color: '#8c8c8c', fontSize: 13 }}>
              ← Retour à l'accueil
            </Link>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default LoginPage;
