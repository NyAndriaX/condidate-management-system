import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

const candidateSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'Le prénom est requis.')
    .min(2, 'Au moins 2 caractères.')
    .max(50, '50 caractères maximum.'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Le nom est requis.')
    .min(2, 'Au moins 2 caractères.')
    .max(50, '50 caractères maximum.'),
  email: z
    .string()
    .trim()
    .min(1, "L'email est requis.")
    .email("L'email doit être valide."),
  phone: z
    .string()
    .trim()
    .min(1, 'Le téléphone est requis.')
    .regex(PHONE_REGEX, 'Format international requis (+33...).'),
  position: z
    .string()
    .trim()
    .min(1, 'Le poste est requis.')
    .min(2, 'Au moins 2 caractères.')
    .max(100, '100 caractères maximum.'),
  experience: z
    .number({ invalid_type_error: "L'expérience est requise." })
    .min(0, "L'expérience ne peut pas être négative.")
    .max(50, "L'expérience ne peut pas dépasser 50 ans."),
  skills: z
    .array(z.string().trim().min(2, 'Chaque compétence doit contenir au moins 2 caractères.'))
    .min(1, 'Au moins une compétence est requise.'),
  resume: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || URL_REGEX.test(v), { message: 'Le CV doit être une URL valide.' }),
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

interface CandidateFormProps {
  candidate?: Candidate;
  onSuccess: () => void;
  onCancel: () => void;
}

const CandidateForm = ({ candidate, onSuccess, onCancel }: CandidateFormProps) => {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const [skillInput, setSkillInput] = useState('');
  const [skillInputError, setSkillInputError] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      firstName: candidate?.firstName ?? '',
      lastName: candidate?.lastName ?? '',
      email: candidate?.email ?? '',
      phone: candidate?.phone ?? '',
      position: candidate?.position ?? '',
      experience: candidate?.experience ?? 0,
      skills: candidate?.skills ?? [],
      resume: candidate?.resume ?? '',
    },
  });

  const skills = watch('skills') ?? [];

  const addSkill = (): void => {
    const s = skillInput.trim();
    if (s.length < 2) { setSkillInputError('Au moins 2 caractères.'); return; }
    if (skills.includes(s)) { setSkillInputError('Compétence déjà ajoutée.'); return; }
    setValue('skills', [...skills, s], { shouldValidate: true });
    setSkillInput('');
    setSkillInputError('');
  };

  const removeSkill = (skill: string): void => {
    setValue('skills', skills.filter((s) => s !== skill), { shouldValidate: true });
  };

  const onSubmit = async (values: CandidateFormValues): Promise<void> => {
    setApiError(null);
    const payload: CreateCandidateDTO = { ...values, resume: values.resume || undefined };
    try {
      if (candidate) {
        await candidateService.updateCandidate(candidate._id, payload);
      } else {
        await candidateService.createCandidate(payload);
      }
      onSuccess();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    }
  };

  return (
    <Card
      style={{ borderRadius: 12, width: '100%' }}
      bodyStyle={{ padding: isMobile ? '20px 16px' : '36px 40px' }}
    >
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

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Identité */}
        <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Identité
        </Text>
        <Row gutter={[20, 0]} style={{ marginTop: 12 }}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Prénom"
              required
              validateStatus={errors.firstName ? 'error' : ''}
              help={errors.firstName?.message}
            >
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Jean" size="large" style={{ borderRadius: 8 }} />
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Nom"
              required
              validateStatus={errors.lastName ? 'error' : ''}
              help={errors.lastName?.message}
            >
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Dupont" size="large" style={{ borderRadius: 8 }} />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Contact */}
        <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Contact
        </Text>
        <Row gutter={[20, 0]} style={{ marginTop: 12 }}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Email"
              required
              validateStatus={errors.email ? 'error' : ''}
              help={errors.email?.message}
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input {...field} type="email" placeholder="jean@exemple.com" size="large" style={{ borderRadius: 8 }} />
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Téléphone"
              required
              tooltip="Format international, ex : +33612345678"
              validateStatus={errors.phone ? 'error' : ''}
              help={errors.phone?.message}
            >
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="+33612345678" size="large" style={{ borderRadius: 8 }} />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Profil */}
        <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Profil professionnel
        </Text>
        <Row gutter={[20, 0]} style={{ marginTop: 12 }}>
          <Col xs={24} sm={16}>
            <Form.Item
              label="Poste recherché"
              required
              validateStatus={errors.position ? 'error' : ''}
              help={errors.position?.message}
            >
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Ex : Développeur Full Stack" size="large" style={{ borderRadius: 8 }} />
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Expérience (ans)"
              required
              validateStatus={errors.experience ? 'error' : ''}
              help={errors.experience?.message}
            >
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={0}
                    max={50}
                    size="large"
                    style={{ width: '100%', borderRadius: 8 }}
                    placeholder="3"
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Compétences */}
        <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Compétences <span style={{ color: '#ff4d4f' }}>*</span>
        </Text>
        <Form.Item
          style={{ marginTop: 12 }}
          validateStatus={errors.skills ? 'error' : ''}
          help={errors.skills?.message as string | undefined}
        >
          <Space.Compact style={{ width: '100%' }}>
            <Input
              value={skillInput}
              onChange={(e) => { setSkillInput(e.target.value); setSkillInputError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              placeholder="Ex : React, TypeScript, Node.js..."
              size="large"
              status={skillInputError ? 'error' : undefined}
              style={{ borderRadius: '8px 0 0 8px' }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addSkill}
              size="large"
              style={{ borderRadius: '0 8px 8px 0' }}
            >
              Ajouter
            </Button>
          </Space.Compact>
          {skillInputError && (
            <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{skillInputError}</div>
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

        {/* CV */}
        <Text strong style={{ fontSize: 13, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          CV (optionnel)
        </Text>
        <Form.Item
          style={{ marginTop: 12 }}
          validateStatus={errors.resume ? 'error' : ''}
          help={errors.resume?.message}
        >
          <Controller
            name="resume"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="https://monsite.com/cv.pdf"
                size="large"
                style={{ borderRadius: 8 }}
              />
            )}
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
          }}
        >
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            icon={<SaveOutlined />}
            size="large"
            style={{ borderRadius: 8, ...(isMobile ? { flex: 1 } : {}) }}
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          <Button
            onClick={onCancel}
            disabled={isSubmitting}
            icon={<CloseOutlined />}
            size="large"
            style={{ borderRadius: 8, ...(isMobile ? { flex: 1 } : {}) }}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CandidateForm;
