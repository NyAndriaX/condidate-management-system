import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Avatar,
  ConfigProvider,
  Drawer,
  Dropdown,
  Grid,
  Layout,
  Menu,
  theme,
  Typography,
} from 'antd';
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';

import CandidateDetail from './components/CandidateDetail/CandidateDetail';
import CandidateForm from './components/CandidateForm/CandidateForm';
import AuthGuard from './components/common/AuthGuard';
import { authService, candidateService } from './services';
import { Candidate } from './types/candidate.types';
import CandidatesPage from './pages/CandidatesPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

interface SiderMenuProps {
  onNavigate?: () => void;
}

const SiderMenu = ({ onNavigate }: SiderMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = location.pathname.startsWith('/candidates') ? 'candidates' : 'home';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    onNavigate?.();
  };

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
        onClick={() => go('/')}
      >
        <TeamOutlined style={{ color: '#1677ff', fontSize: 22, marginRight: 8 }} />
        <Text strong style={{ color: '#fff', fontSize: 15, letterSpacing: 0.5 }}>
          CMS
        </Text>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{ borderRight: 0, flex: 1 }}
        items={[
          {
            key: 'candidates',
            icon: <TeamOutlined />,
            label: 'Candidats',
            onClick: () => go('/candidates'),
          },
        ]}
      />

      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <Dropdown
          menu={{
            items: [
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Se déconnecter',
                danger: true,
                onClick: handleLogout,
              },
            ],
          }}
          placement="topLeft"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <Avatar size={32} icon={<UserOutlined />} style={{ background: '#1677ff' }} />
            <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>Mon compte</Text>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.lg;
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop sider */}
      {!isMobile && (
        <Sider
          width={220}
          style={{ minHeight: '100vh', background: '#001529', position: 'sticky', top: 0, left: 0, height: '100vh', overflow: 'auto' }}
        >
          <SiderMenu />
        </Sider>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="left"
          width={220}
          bodyStyle={{ padding: 0, background: '#001529', height: '100%' }}
          headerStyle={{ display: 'none' }}
        >
          <SiderMenu onNavigate={() => setDrawerOpen(false)} />
        </Drawer>
      )}

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: '1px solid #f0f0f0',
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          {isMobile && (
            <button
              onClick={() => setDrawerOpen((o) => !o)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 18,
                color: '#1677ff',
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: 6,
              }}
            >
              {drawerOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            </button>
          )}
          <Typography.Title
            level={isMobile ? 5 : 4}
            style={{ margin: 0, color: '#1677ff', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {isMobile ? 'CMS' : 'Candidate Management System'}
          </Typography.Title>
        </Header>

        <Content
          style={{
            margin: isMobile ? '16px 12px' : '24px',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

const NewCandidatePage = () => {
  const navigate = useNavigate();
  return (
    <MainLayout>
      <CandidateForm
        onSuccess={() => navigate('/candidates')}
        onCancel={() => navigate('/candidates')}
      />
    </MainLayout>
  );
};

const EditCandidatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setError('Candidat introuvable.'); setLoading(false); return; }
    let isMounted = true;
    (async () => {
      try {
        const data = await candidateService.getCandidate(id);
        if (isMounted) setCandidate(data);
      } catch (e) {
        if (isMounted) setError(e instanceof Error ? e.message : 'Candidat introuvable.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [id]);

  return (
    <MainLayout>
      {!loading && (
        error || !candidate
          ? <Navigate to="/candidates" replace />
          : (
            <CandidateForm
              candidate={candidate}
              onSuccess={() => navigate(`/candidates/${candidate._id}`)}
              onCancel={() => navigate('/candidates')}
            />
          )
      )}
    </MainLayout>
  );
};

const CandidateDetailPage = () => {
  const { id } = useParams();
  if (!id) return <Navigate to="/candidates" replace />;
  return (
    <MainLayout>
      <CandidateDetail candidateId={id} />
    </MainLayout>
  );
};

function App() {
  return (
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/candidates"
              element={
                <AuthGuard>
                  <MainLayout>
                    <CandidatesPage />
                  </MainLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/candidates/new"
              element={<AuthGuard><NewCandidatePage /></AuthGuard>}
            />
            <Route
              path="/candidates/:id"
              element={<AuthGuard><CandidateDetailPage /></AuthGuard>}
            />
            <Route
              path="/candidates/:id/edit"
              element={<AuthGuard><EditCandidatePage /></AuthGuard>}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default App;
