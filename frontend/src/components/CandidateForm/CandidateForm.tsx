import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Grid,
  Input,
  InputNumber,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd';
import { CloseOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';

import { candidateService } from '../../services';
import { Candidate, CreateCandidateDTO } from '../../types/candidate.types';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;
const URL_REGEX = /^https?:\/\/\S+$/i;

interface CandidateFormProps {
  candidate?: Candidate;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  experience: number;
  resume?: string;
}

const CandidateForm = ({ candidate, onSuccess, onCancel }: CandidateFormProps) => {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;
  const [form] = Form.useForm<FormValues>();
  const [skills, setSkills] = useState<string[]>(candidate?.skills ?? []);
  const [skillInput, setSkillInput] = useState('');
  const [skillError, setSkillError] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const addSkill = (): void => {
    const s = skillInput.trim();
    if (s.length < 2) { setSkillError('Au moins 2 caractères.'); return; }
    if (skills.includes(s)) { setSkillError('Compétence déjà ajoutée.'); return; }
    setSkills((prev) => [...prev, s]);
    setSkillInput('');
    setSkillError('');
  };

  const removeSkill = (skill: string): void => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const onFinish = async (values: FormValues): Promise<void> => {
    if (skills.length === 0) {
      setSkillError('Au moins une compétence est requise.');
      return;
    }
    setApiError(null);
    setSubmitting(true);

    const payload: CreateCandidateDTO = {
      ...values,
      skills,
      resume: values.resume || undefined,
    };

    try {
      if (candidate) {
        await candidateService.updateCandidate(candidate._id, payload);
      } else {
        await candidateService.createCandidate(payload);
      }
      onSuccess();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      style={{ borderRadius: 12, width: '100%' }}
      bodyStyle={{ padding: isMobile ? '20px 16px' : '36px 40px' }}
    >
      {/* Page title */}
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ margin: 0 }}>
          {candidate ? 'Modifier le candidat' : 'Nouveau candidat'}
        </Title>
        <Text type="secondary">
          {candidate
            ? 'Mettez à jour les informations du candidat.'
            : 'Remplissez les informations pour créer un nouveau profil.'}
        </Text>
      </div>

      {apiError && (
        <Alert
          message={apiError}
          type="error"
          showIcon
          style={{ marginBottom: 24, borderRadius: 8 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        size="large"
        initialValues={{
          firstName: candidate?.firstName ?? '',
          lastName: candidate?.lastName ?? '',
          email: candidate?.email ?? '',
          phone: candidate?.phone ?? '',
          position: candidate?.position ?? '',
          experience: candidate?.experience ?? 0,
          resume: candidate?.resume ?? '',
        }}
        onFinish={onFinish}
      >
        {/* Section: Identité */}
        <div style={{ marginBottom: 8 }}>
          <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Identité
          </Text>
        </div>
        <Row gutter={[20, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="firstName"
              label="Prénom"
              rules={[
                { required: true, message: 'Le prénom est requis.' },
                { min: 2, message: 'Au moins 2 caractères.' },
                { max: 50, message: '50 caractères maximum.' },
              ]}
            >
              <Input placeholder="Jean" style={{ borderRadius: 8 }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="lastName"
              label="Nom"
              rules={[
                { required: true, message: 'Le nom est requis.' },
                { min: 2, message: 'Au moins 2 caractères.' },
                { max: 50, message: '50 caractères maximum.' },
              ]}
            >
              <Input placeholder="Dupont" style={{ borderRadius: 8 }} />
            </Form.Item>
          </Col>
        </Row>

        {/* Section: Contact */}
        <div style={{ marginBottom: 8, marginTop: 8 }}>
          <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Contact
          </Text>
        </div>
        <Row gutter={[20, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "L'email est requis." },
                { type: 'email', message: "L'email doit être valide." },
              ]}
            >
              <Input placeholder="jean@exemple.com" style={{ borderRadius: 8 }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="phone"
              label="Téléphone"
              tooltip="Format international, ex : +33612345678"
              rules={[
                { required: true, message: 'Le téléphone est requis.' },
                { pattern: PHONE_REGEX, message: 'Format international requis (+33...).' },
              ]}
            >
              <Input placeholder="+33612345678" style={{ borderRadius: 8 }} />
            </Form.Item>
          </Col>
        </Row>

        {/* Section: Profil professionnel */}
        <div style={{ marginBottom: 8, marginTop: 8 }}>
          <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Profil professionnel
          </Text>
        </div>
        <Row gutter={[20, 0]}>
          <Col xs={24} sm={16}>
            <Form.Item
              name="position"
              label="Poste recherché"
              rules={[
                { required: true, message: 'Le poste est requis.' },
                { min: 2, message: 'Au moins 2 caractères.' },
                { max: 100, message: '100 caractères maximum.' },
              ]}
            >
              <Input placeholder="Ex : Développeur Full Stack" style={{ borderRadius: 8 }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="experience"
              label="Expérience (ans)"
              rules={[{ required: true, message: "L'expérience est requise." }]}
            >
              <InputNumber
                min={0}
                max={50}
                style={{ width: '100%', borderRadius: 8 }}
                placeholder="3"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Section: Compétences */}
        <div style={{ marginBottom: 8, marginTop: 8 }}>
          <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Compétences <span style={{ color: '#ff4d4f' }}>*</span>
          </Text>
        </div>
        <Form.Item>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              value={skillInput}
              onChange={(e) => { setSkillInput(e.target.value); setSkillError(''); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
              }}
              placeholder="Ex : React, TypeScript, Node.js..."
              status={skillError ? 'error' : undefined}
              style={{ borderRadius: '8px 0 0 8px' }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addSkill}
              style={{ borderRadius: '0 8px 8px 0' }}
            >
              Ajouter
            </Button>
          </Space.Compact>
          {skillError && (
            <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{skillError}</div>
          )}
          {skills.length > 0 && (
            <div
              style={{
                marginTop: 12,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                padding: '12px 16px',
                background: '#f5f5f5',
                borderRadius: 8,
                border: '1px solid #e8e8e8',
                minHeight: 48,
              }}
            >
              {skills.map((skill) => (
                <Tag
                  key={skill}
                  closable
                  onClose={() => removeSkill(skill)}
                  color="blue"
                  style={{ fontSize: 13, padding: '3px 10px', margin: 0 }}
                >
                  {skill}
                </Tag>
              ))}
            </div>
          )}
        </Form.Item>

        {/* Section: CV */}
        <div style={{ marginBottom: 8, marginTop: 4 }}>
          <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            CV (optionnel)
          </Text>
        </div>
        <Form.Item
          name="resume"
          rules={[
            {
              validator: (_, value) => {
                if (!value || URL_REGEX.test(value)) return Promise.resolve();
                return Promise.reject(new Error('Le CV doit être une URL valide (https://...).'));
              },
            },
          ]}
        >
          <Input
            placeholder="https://monsite.com/cv.pdf"
            style={{ borderRadius: 8 }}
          />
        </Form.Item>

        {/* Actions */}
        <div
          style={{
            borderTop: '1px solid #f0f0f0',
            paddingTop: 24,
            marginTop: 8,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'stretch' : 'flex-start',
          }}
        >
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            icon={<SaveOutlined />}
            size="large"
            style={{ borderRadius: 8, ...(isMobile ? { flex: 1 } : {}) }}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          <Button
            onClick={onCancel}
            disabled={submitting}
            icon={<CloseOutlined />}
            size="large"
            style={{ borderRadius: 8, ...(isMobile ? { flex: 1 } : {}) }}
          >
            Annuler
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default CandidateForm;
