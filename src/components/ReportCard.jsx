import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { ReportStatus } from '../constants/enums';

/* ================= STATUS CONFIG ================= */

const STATUS_CONFIG = {
  [ReportStatus.OPEN]: {
    color: 'amber',
    label: 'Waiting',
    icon: AlertTriangle,
    border: 'rgba(251,191,36,0.3)',
    text: '#fbbf24',
  },
  [ReportStatus.IN_PROGRESS]: {
    color: 'indigo',
    label: 'Processing',
    icon: Clock,
    border: 'rgba(99,102,241,0.3)',
    text: '#818cf8',
  },
  [ReportStatus.CLOSED]: {
    color: 'emerald',
    label: 'Resolved',
    icon: CheckCircle2,
    border: 'rgba(16,185,129,0.3)',
    text: '#34d399',
  },
  default: {
    color: 'blue',
    label: 'Other',
    icon: ShieldAlert,
    border: 'rgba(59,130,246,0.3)',
    text: '#60a5fa',
  },
};

/* ================= COMPONENT ================= */

export default function ReportCard({ report, isBPO, onUpdate }) {
  const [showActions, setShowActions] = useState(false);
  const [bpoData, setBpoData] = useState({
    estimationDate: report.estimationDate || '',
    plannedAction: report.plannedAction || '',
    handlingReport: '',
  });

  const config = STATUS_CONFIG[report.status] || STATUS_CONFIG.default;
  const StatusIcon = config.icon;

  return (
    <Card className="glass-card">
      {/* ===== IMAGE ===== */}
      <ImageWrapper>
        {report.photoUrl ? (
          <Image src={report.photoUrl} alt="Report" />
        ) : (
          <NoImage>
            <ShieldAlert size={64} />
          </NoImage>
        )}

        <StatusBadge border={config.border} text={config.text}>
          <StatusIcon size={10} />
          {config.label}
        </StatusBadge>

        <FindingType>{report.findingType}</FindingType>
      </ImageWrapper>

      {/* ===== CONTENT ===== */}
      <Content>
        <Header>
          <Calendar size={12} />
          {report.date}
        </Header>

        <Description>{report.description}</Description>

        <SuggestionBox>
          <span>Usulan Perbaikan</span>
          <p>"{report.suggestion}"</p>
        </SuggestionBox>

        <Footer>
          {isBPO && report.status !== ReportStatus.CLOSED ? (
            <ActionToggle onClick={() => setShowActions(!showActions)}>
              Tindak Lanjut <ChevronRight size={12} />
            </ActionToggle>
          ) : (
            report.status === ReportStatus.CLOSED && (
              <Resolved>
                <CheckCircle2 size={12} />
                <span>Selesai {report.closedAt}</span>
              </Resolved>
            )
          )}
        </Footer>

        {showActions && isBPO && (
          <ActionPanel>
            <Input
              type="date"
              value={bpoData.estimationDate}
              onChange={(e) =>
                setBpoData((p) => ({ ...p, estimationDate: e.target.value }))
              }
            />

            <Textarea
              rows={2}
              placeholder="Rencana tindakan..."
              value={bpoData.plannedAction}
              onChange={(e) =>
                setBpoData((p) => ({ ...p, plannedAction: e.target.value }))
              }
            />

            <SubmitButton
              onClick={() =>
                onUpdate({ ...bpoData, handlingReport: 'Selesai' })
              }
            >
              Update Penanganan
            </SubmitButton>
          </ActionPanel>
        )}
      </Content>
    </Card>
  );
}

/* ================= STYLES ================= */

const Card = styled.div`
  border-radius: 2.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    border-color: rgba(59, 130, 246, 0.2);
  }
`;

const ImageWrapper = styled.div`
  height: 176px;
  position: relative;
  background: #1e293b;
  overflow: hidden;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;

  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const NoImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.1;
  background: linear-gradient(135deg, #334155, #020617);
`;

const badgeBase = css`
  position: absolute;
  top: 20px;
  padding: 6px 12px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(12px);
`;

const StatusBadge = styled.div`
  ${badgeBase};
  left: 20px;
  background: rgba(2, 6, 23, 0.9);
  border: 1px solid ${({ border }) => border};
  color: ${({ text }) => text};
`;

const FindingType = styled.div`
  ${badgeBase};
  right: 20px;
  background: #2563eb;
  color: white;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
`;

const Content = styled.div`
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #64748b;
`;

const Description = styled.h4`
  color: white;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
`;

const SuggestionBox = styled.div`
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);

  span {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-weight: 700;
    color: #64748b;
    display: block;
    margin-bottom: 6px;
  }

  p {
    font-size: 12px;
    color: #94a3b8;
    font-style: italic;
    line-height: 1.5;
  }
`;

const Footer = styled.div`
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: flex-end;
  min-height: 40px;
`;

const ActionToggle = styled.button`
  background: none;
  border: none;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #60a5fa;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    color: #93c5fd;
  }
`;

const Resolved = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #34d399;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
`;

const ActionPanel = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const fieldBase = css`
  width: 100%;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px;
  font-size: 12px;
  color: white;
  outline: none;
`;

const Input = styled.input`
  ${fieldBase}
`;

const Textarea = styled.textarea`
  ${fieldBase}
  resize: none;
`;

const SubmitButton = styled.button`
  background: #2563eb;
  color: white;
  padding: 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  box-shadow: 0 15px 30px rgba(37, 99, 235, 0.25);

  &:active {
    transform: scale(0.96);
  }
`;
