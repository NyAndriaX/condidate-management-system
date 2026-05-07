import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Grid,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons';

import { candidateService } from '../../services';
import { Candidate, CandidateStatus } from '../../types/candidate.types';

const { useBreakpoint } = Grid;

type StatusFilter = 'all' | CandidateStatus;

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

const STATUS_OPTIONS = [
  { label: 'Tous les statuts', value: 'all' },
  { label: 'En attente', value: 'pending' },
  { label: 'Validé', value: 'validated' },
  { label: 'Rejeté', value: 'rejected' },
];

const CandidateList = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    candidateService
      .getCandidates(page, limit, statusFilter === 'all' ? undefined : statusFilter)
      .then((result) => {
        if (!isMounted) return;
        setCandidates(result.candidates);
        setTotal(result.total);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Erreur de chargement.';
        void message.error(msg);
        setCandidates([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [page, limit, statusFilter]);

  const filteredCandidates = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter((c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q),
    );
  }, [candidates, searchTerm]);

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await candidateService.deleteCandidate(id);
      void message.success('Candidat supprimé.');
      setCandidates((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la suppression.';
      void message.error(msg);
    }
  };

  const columns: ColumnsType<Candidate> = [
    {
      title: 'Nom complet',
      key: 'name',
      fixed: 'left' as const,
      width: 180,
      render: (_, record) => (
        <Typography.Text
          strong
          style={{ cursor: 'pointer', color: '#1677ff' }}
          onClick={() => navigate(`/candidates/${record._id}`)}
        >
          {record.firstName} {record.lastName}
        </Typography.Text>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
      width: 220,
    },
    {
      title: 'Poste',
      dataIndex: 'position',
      key: 'position',
      ellipsis: true,
      width: 180,
    },
    {
      title: 'Exp.',
      dataIndex: 'experience',
      key: 'experience',
      render: (exp: number) => `${exp} ans`,
      align: 'center' as const,
      width: 80,
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: CandidateStatus) => (
        <Tag color={STATUS_COLORS[status]} style={{ fontWeight: 600 }}>
          {STATUS_LABELS[status]}
        </Tag>
      ),
      align: 'center' as const,
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center' as const,
      fixed: 'right' as const,
      width: 130,
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/candidates/${record._id}`)}
            title="Voir"
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/candidates/${record._id}/edit`)}
            title="Modifier"
          />
          <Popconfirm
            title="Supprimer ce candidat ?"
            description="Cette action est irréversible."
            okText="Supprimer"
            cancelText="Annuler"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record._id)}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} title="Supprimer" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      style={{ borderRadius: 12 }}
      bodyStyle={{ padding: 0 }}
    >
      {/* Filters bar */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          borderBottom: '1px solid #f0f0f0',
          background: '#fafafa',
          borderRadius: '12px 12px 0 0',
          alignItems: 'center',
        }}
      >
        <Input
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          placeholder="Rechercher par nom..."
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          allowClear
          style={{ width: isMobile ? '100%' : 260, borderRadius: 8 }}
        />
        <Select
          value={statusFilter}
          options={STATUS_OPTIONS}
          onChange={(val: StatusFilter) => { setStatusFilter(val); setPage(1); }}
          style={{ width: isMobile ? '100%' : 200 }}
        />
      </div>

      <Table<Candidate>
        rowKey="_id"
        columns={columns}
        dataSource={filteredCandidates}
        loading={loading}
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          onChange: (p) => setPage(p),
          showSizeChanger: false,
          showTotal: (t) => `${t} candidat(s) au total`,
          style: { padding: '12px 20px' },
          simple: isMobile,
        }}
        style={{ borderRadius: '0 0 12px 12px' }}
        rowClassName={() => 'candidate-row'}
        locale={{ emptyText: 'Aucun candidat trouvé.' }}
      />
    </Card>
  );
};

export default CandidateList;
