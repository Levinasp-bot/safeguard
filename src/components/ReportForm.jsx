import React, { useState, useRef } from 'react';
import styled, { css } from 'styled-components';
import {
  X,
  Calendar,
  Camera,
  Info,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  FolderOpen,
} from 'lucide-react';

/* ================= COMPONENT ================= */

export default function ReportForm({ onClose, onSubmit }) {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    findingType: 'Unsafe Condition',
    description: '',
    suggestion: '',
    photo: null,
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () =>
      setFormData((p) => ({ ...p, photo: reader.result }));
    reader.readAsDataURL(file);
  };

  const openPicker = (capture) => {
    if (!fileInputRef.current) return;
    capture
      ? fileInputRef.current.setAttribute('capture', capture)
      : fileInputRef.current.removeAttribute('capture');
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Wrapper className="glass-card">
      {/* ===== HEADER ===== */}
      <Header>
        <HeaderText>
          <h2 className="font-luxury">Lapor Temuan K3</h2>
          <span>SAFEGUARD PELAPORAN RESMI</span>
        </HeaderText>
        <CloseButton onClick={onClose}>
          <X size={24} />
        </CloseButton>
      </Header>

      {/* ===== FORM ===== */}
      <Form onSubmit={handleSubmit}>
        {/* FINDING TYPE */}
        <Section>
          <Label>
            <AlertCircle size={14} /> Pilih Tipe Temuan
          </Label>
          <TypeGrid>
            {['Unsafe Condition', 'Unsafe Action'].map((type) => (
              <TypeButton
                key={type}
                active={formData.findingType === type}
                onClick={() =>
                  setFormData((p) => ({ ...p, findingType: type }))
                }
                type="button"
              >
                <Dot active={formData.findingType === type} />
                {type}
              </TypeButton>
            ))}
          </TypeGrid>
        </Section>

        {/* PHOTO */}
        <Section>
          <Label>
            <Camera size={14} /> Lampirkan Bukti Foto
          </Label>

          <PhotoGrid>
            <PickerButton onClick={() => openPicker('environment')}>
              <Camera />
              <span>Kamera</span>
            </PickerButton>
            <PickerButton onClick={() => openPicker()}>
              <ImageIcon />
              <span>Galeri</span>
            </PickerButton>
            <PickerButton onClick={() => openPicker()}>
              <FolderOpen />
              <span>File</span>
            </PickerButton>
          </PhotoGrid>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            hidden
            onChange={handleFileChange}
          />

          {formData.photo && (
            <Preview>
              <img src={formData.photo} alt="Preview" />
              <PreviewOverlay>
                <CheckCircle2 />
              </PreviewOverlay>
            </Preview>
          )}
        </Section>

        {/* DATE */}
        <Section>
          <Label>
            <Calendar size={14} /> Tanggal Kejadian
          </Label>
          <Input
            type="date"
            required
            value={formData.date}
            onChange={(e) =>
              setFormData((p) => ({ ...p, date: e.target.value }))
            }
          />
        </Section>

        {/* DESCRIPTION */}
        <Section>
          <Label>
            <Info size={14} /> Deskripsi Temuan
          </Label>
          <Textarea
            rows={3}
            required
            placeholder="Jelaskan secara singkat apa yang terjadi..."
            value={formData.description}
            onChange={(e) =>
              setFormData((p) => ({ ...p, description: e.target.value }))
            }
          />
        </Section>

        {/* SUGGESTION */}
        <Section>
          <Label>
            <Lightbulb size={14} /> Usulan Perbaikan
          </Label>
          <Textarea
            rows={2}
            placeholder="Apa saran Anda agar ini tidak terulang?"
            value={formData.suggestion}
            onChange={(e) =>
              setFormData((p) => ({ ...p, suggestion: e.target.value }))
            }
          />
        </Section>

        <SubmitButton type="submit">
          Kirim
        </SubmitButton>
      </Form>
    </Wrapper>
  );
}

/* ================= STYLES ================= */

const Wrapper = styled.div`
  border-radius: 2.5rem;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: zoomIn 0.3s ease;

  @keyframes zoomIn {
    from {
      transform: scale(0.96);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const Header = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
`;

const HeaderText = styled.div`
  h2 {
    color: white;
    font-size: 1.5rem;
    margin: 0 0 0.5rem;
  }

  span {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.25em;
    color: #60a5fa;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;

  &:hover {
    color: white;
  }
`;

const Form = styled.form`
  padding: 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background: rgba(15, 23, 42, 0.3);
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const TypeButton = styled.button`
  padding: 1.25rem;
  border-radius: 1.5rem;
  border: 1px solid
    ${({ active }) => (active ? '#3b82f6' : 'rgba(255,255,255,0.05)')};
  background: ${({ active }) =>
    active ? '#2563eb' : 'rgba(30,41,59,0.4)'};
  color: ${({ active }) => (active ? 'white' : '#64748b')};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
`;

const Dot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ active }) => (active ? 'white' : '#334155')};
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
`;

const PickerButton = styled.button`
  padding: 1rem;
  border-radius: 1.5rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;

  svg {
    width: 24px;
    height: 24px;
    color: #64748b;
  }

  span {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    color: #64748b;
  }

  &:hover {
    border-color: rgba(59, 130, 246, 0.5);

    svg,
    span {
      color: #60a5fa;
    }
  }
`;

const Preview = styled.div`
  position: relative;
  height: 160px;
  border-radius: 1.5rem;
  overflow: hidden;
  border: 1px solid rgba(59, 130, 246, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PreviewOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(16, 185, 129, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 40px;
    height: 40px;
    color: white;
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.4));
  }
`;

const fieldBase = css`
  width: 100%;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1.5rem;
  padding: 1rem 1.25rem;
  font-size: 14px;
  color: white;
  outline: none;

  &:focus {
    border-color: rgba(59, 130, 246, 0.6);
  }
`;

const Input = styled.input`
  ${fieldBase}
`;

const Textarea = styled.textarea`
  ${fieldBase}
  resize: none;
`;

const SubmitButton = styled.button`
  margin-top: 1rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: linear-gradient(90deg, #2563eb, #4338ca);
  color: white;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.35);

  &:active {
    transform: scale(0.98);
  }
`;
