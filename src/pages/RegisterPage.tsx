import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Divider, Form, Grid, Input, Layout, Typography } from 'antd';
import {
  LockOutlined,
  MailOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { authService } from '../services';

const { Content } = Layout;
const { Title, Text, Link } = Typography;
const { useBreakpoint } = Grid;

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<RegisterFormValues>();

  const onFinish = async (values: RegisterFormValues): Promise<void> => {
    setApiError(null);
    setLoading(true);
    try {
      await authService.register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      navigate('/candidates', { replace: true });
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Inscription impossible.');
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
            maxWidth: isMobile ? '100%' : 700,
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            border: 'none',
          }}
          bodyStyle={{ padding: isMobile ? '28px 20px' : '48px 56px' }}
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
              Créer un compte
            </Title>
            <Text type="secondary">Rejoignez la plateforme CMS</Text>
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
              name="name"
              label="Nom complet"
              rules={[
                { required: true, message: 'Le nom est requis.' },
                { min: 2, message: 'Au moins 2 caractères.' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Jean Dupont"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

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
                placeholder="jean@exemple.com"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mot de passe"
              rules={[
                { required: true, message: 'Le mot de passe est requis.' },
                { min: 8, message: 'Au moins 8 caractères.' },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="8 caractères minimum"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirmer le mot de passe"
              dependencies={['password']}
              hasFeedback
              rules={[
                { required: true, message: 'Veuillez confirmer votre mot de passe.' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Les mots de passe ne correspondent pas.'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="Répétez le mot de passe"
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
                {loading ? 'Inscription...' : "S'inscrire"}
              </Button>
            </Form.Item>
          </Form>

          <Divider plain style={{ color: '#8c8c8c', fontSize: 13 }}>
            Déjà un compte ?
          </Divider>

          <Button
            block
            style={{ borderRadius: 8, height: 40 }}
            onClick={() => navigate('/login')}
          >
            Se connecter
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

export default RegisterPage;
