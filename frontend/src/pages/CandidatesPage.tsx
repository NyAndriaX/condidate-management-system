import { useNavigate } from 'react-router-dom';
import { Button, Grid, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import CandidateList from '../components/CandidateList/CandidateList';

const { Title } = Typography;
const { useBreakpoint } = Grid;

const CandidatesPage = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Space direction="vertical" size={2}>
          <Title level={3} style={{ margin: 0 }}>Candidats</Title>
          <Typography.Text type="secondary">Gérez et suivez tous vos candidats</Typography.Text>
        </Space>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate('/candidates/new')}
          block={isMobile}
        >
          Nouveau candidat
        </Button>
      </div>

      <CandidateList />
    </>
  );
};

export default CandidatesPage;
