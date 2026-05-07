import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Grid,
  Popconfirm,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
} from '@ant-design/icons';

import { candidateService } from '../../services';
import { Candidate, CandidateStatus } from '../../types/candidate.types';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const STATUS_COLORS: Record<CandidateStatus, string> = {
  pending: 'orange',
  validated: 'green',
  rejected: 'red',
};

const STATUS_LABELS: Record<CandidateStatus, string> = {
  pending: 'En attente',
  validated: 'Validé',
  rejected: 'Rejeté',
};

interface CandidateDetailProps {
  candidateId: string;
}

const CandidateDetail = ({ candidateId }: CandidateDetailProps) => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    candidateService
      .getCandidate(candidateId)
      .then((data) => { if (isMounted) { setCandidate(data); setError(null); } })
      .catch((err: unknown) => {
        if (isMounted) setError(err instanceof Error ? err.message : 'Candidat introuvable.');
      })
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [candidateId]);

  const handleValidate = async (): Promise<void> => {
    if (!candidate) return;
    setValidating(true);
    try {
      const updated = await candidateService.validateCandidate(candidate._id);
      setCandidate(updated);
      void message.success('Candidat validé avec succès.');
    } catch (err) {
      void message.error(err instanceof Error ? err.message : 'Validation échouée.');
    } finally {
      setValidating(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!candidate) return;
    setDeleting(true);
    try {
      await candidateService.deleteCandidate(candidate._id);
      void message.success('Candidat supprimé.');
      navigate('/candidates');
    } catch (err) {
      void message.error(err instanceof Error ? err.message : 'Suppression échouée.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card style={{ borderRadius: 12, width: '100%' }}>
        <Skeleton active avatar paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  if (error || !candidate) {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="Candidat introuvable"
          description={error ?? "Ce candidat n'existe pas."}
          type="error"
          showIcon
          style={{ borderRadius: 8 }}
        />
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/candidates')}>
          Retour à la liste
        </Button>
      </Space>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      {/* Breadcrumb / Top bar */}
      <Card
        style={{ borderRadius: 12 }}
        bodyStyle={{ padding: isMobile ? '16px' : '20px 28px' }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 16,
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left: name + status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/candidates')}
            >
              Retour
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              {candidate.firstName} {candidate.lastName}
            </Title>
            <Tag
              color={STATUS_COLORS[candidate.status]}
              style={{ fontWeight: 600, fontSize: 13 }}
            >
              {STATUS_LABELS[candidate.status]}
            </Tag>
          </div>

          {/* Right: actions */}
          <Space wrap>
            {candidate.status === 'pending' && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={validating}
                onClick={handleValidate}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                Valider
              </Button>
            )}
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/candidates/${candidate._id}/edit`)}
            >
              Modifier
            </Button>
            <Popconfirm
              title="Supprimer ce candidat ?"
              description="Cette action est irréversible."
              okText="Supprimer"
              cancelText="Annuler"
              okButtonProps={{ danger: true }}
              onConfirm={handleDelete}
            >
              <Button danger icon={<DeleteOutlined />} loading={deleting}>
                Supprimer
              </Button>
            </Popconfirm>
          </Space>
        </div>
      </Card>

      {/* Info Card */}
      <Card
        style={{ borderRadius: 12, width: '100%' }}
        bodyStyle={{ padding: isMobile ? '16px' : '28px 32px' }}
      >
        <Descriptions
          title={
            <Text strong style={{ fontSize: 15 }}>Informations du candidat</Text>
          }
          column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 3 }}
          bordered
          labelStyle={{ fontWeight: 600, background: '#fafafa', whiteSpace: 'nowrap' }}
          contentStyle={{ background: '#fff' }}
          size="middle"
        >
          <Descriptions.Item label="Prénom">{candidate.firstName}</Descriptions.Item>
          <Descriptions.Item label="Nom">{candidate.lastName}</Descriptions.Item>
          <Descriptions.Item label="Email">
            <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
          </Descriptions.Item>
          <Descriptions.Item label="Téléphone">
            <a href={`tel:${candidate.phone}`}>{candidate.phone}</a>
          </Descriptions.Item>
          <Descriptions.Item label="Poste">{candidate.position}</Descriptions.Item>
          <Descriptions.Item label="Expérience">{candidate.experience} ans</Descriptions.Item>
          <Descriptions.Item label="Compétences" span={3}>
            <Space wrap>
              {candidate.skills.map((skill) => (
                <Tag key={skill} color="blue">
                  {skill}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
          {candidate.resume && (
            <Descriptions.Item label="CV" span={3}>
              <a href={candidate.resume} target="_blank" rel="noreferrer">
                <LinkOutlined style={{ marginRight: 6 }} />
                Voir le CV
              </a>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Statut">
            <Tag color={STATUS_COLORS[candidate.status]} style={{ fontWeight: 600 }}>
              {STATUS_LABELS[candidate.status]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Créé le">
            {new Intl.DateTimeFormat('fr-FR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
            }).format(new Date(candidate.createdAt))}
          </Descriptions.Item>
          <Descriptions.Item label="Mis à jour le">
            {new Intl.DateTimeFormat('fr-FR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
            }).format(new Date(candidate.updatedAt))}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
};

export default CandidateDetail;
