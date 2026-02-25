import React, { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import {
  Plus,
  Search,
  Bell,
  LogOut,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ReportStatus, UserRole } from "../constants/enums";
import ReportForm from "./ReportForm";
import ReportCard from "./ReportCard";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // sesuaikan path

/* ================== ICON COLOR MAP ================== */
const COLOR_MAP = {
  blue: { bg: "rgba(59,130,246,0.1)", text: "#60a5fa" },
  amber: { bg: "rgba(251,191,36,0.1)", text: "#fbbf24" },
  indigo: { bg: "rgba(99,102,241,0.1)", text: "#818cf8" },
  emerald: { bg: "rgba(16,185,129,0.1)", text: "#34d399" },
};

/* ================== LOGO ================== */
const PelindoLogo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <rect width="40" height="40" rx="12" fill="url(#pelindoGradient)" />
    <path
      d="M20 8V32M20 8C16 12 10 12 10 12M20 8C24 12 30 12 30 12M10 28C10 28 16 28 20 32M30 28C30 28 24 28 20 32"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="20"
      cy="20"
      r="4"
      fill="white"
      fillOpacity="0.3"
      stroke="white"
      strokeWidth="1.2"
    />
    <defs>
      <linearGradient id="pelindoGradient" x1="0" y1="0" x2="40" y2="40">
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
  </svg>
);

/* ================== COMPONENT ================== */
export default function Dashboard({
  user,
  notifications,
  onAddReport,
  onUpdateReport,
  onMarkNotificationsAsRead,
  onLogout,
}) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const hour = new Date().getHours();
    const g =
      hour < 12 ? "Pagi" : hour < 15 ? "Siang" : hour < 18 ? "Sore" : "Malam";
    setGreeting(`Selamat ${g}, ${user.name.split(" ")[0]}`);
  }, [user.name]);

  useEffect(() => {
    const unsubscribeActions = onSnapshot(
      collection(db, "unsafe_actions"),
      (snapshot) => {
        const actions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          findingType: "Unsafe Action",
        }));

        setReports((prev) => {
          const conditions = prev.filter(
            (r) => r.findingType === "Unsafe Condition",
          );
          return [...actions, ...conditions];
        });
      },
    );

    const unsubscribeConditions = onSnapshot(
      collection(db, "unsafe_conditions"),
      (snapshot) => {
        const conditions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          findingType: "Unsafe Condition",
        }));

        setReports((prev) => {
          const actions = prev.filter((r) => r.findingType === "Unsafe Action");
          return [...actions, ...conditions];
        });
      },
    );

    return () => {
      unsubscribeActions();
      unsubscribeConditions();
    };
  }, []);

  const filteredReports = useMemo(() => {
    let result = [...reports];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.description.toLowerCase().includes(q) ||
          r.findingType.toLowerCase().includes(q),
      );
    }
    return result.sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date),
    );
  }, [reports, searchQuery, sortOrder]);

  const handleToggleNotif = () => {
    if (!isNotifOpen) onMarkNotificationsAsRead();
    setIsNotifOpen(!isNotifOpen);
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  const stats = [
    {
      label: "Total",
      value: reports.length,
      icon: FileText,
      color: "blue",
      path: "/reports",
    },
    {
      label: "Menunggu",
      value: reports.filter((r) => r.status === ReportStatus.OPEN).length,
      icon: AlertTriangle,
      color: "amber",
      path: "/reports/menunggu",
    },
    {
      label: "Diproses",
      value: reports.filter((r) => r.status === ReportStatus.IN_PROGRESS)
        .length,
      icon: Clock,
      color: "indigo",
      path: "/reports/diproses",
    },
    {
      label: "Selesai",
      value: reports.filter((r) => r.status === ReportStatus.CLOSED).length,
      icon: CheckCircle2,
      color: "emerald",
      path: "/reports/selesai",
    },
  ];

  return (
    <Wrapper>
      {/* ================= HEADER ================= */}
      <Header className="glass-card">
        <HeaderLeft>
          <PelindoLogo />
          <div>
            <Title className="font-brand">PT. PELINDO MULTI TERMINAL</Title>
            <Greeting>{greeting}</Greeting>
          </div>
        </HeaderLeft>

        <HeaderRight>
          <NotifWrapper>
            <IconButton active={isNotifOpen} onClick={handleToggleNotif}>
              <Bell size={18} />
              {hasUnread && <UnreadDot />}
            </IconButton>

            {isNotifOpen && (
              <NotifBox className="glass-card">
                <NotifHeader>
                  <span>Notifikasi</span>
                  <X size={14} onClick={() => setIsNotifOpen(false)} />
                </NotifHeader>
                <NotifList>
                  {notifications.length ? (
                    [...notifications].reverse().map((n) => (
                      <NotifItem key={n.id}>
                        <strong>{n.title}</strong>
                        <small>{n.time}</small>
                        <p>{n.message}</p>
                      </NotifItem>
                    ))
                  ) : (
                    <EmptyNotif>Tidak ada notifikasi</EmptyNotif>
                  )}
                </NotifList>
              </NotifBox>
            )}
          </NotifWrapper>

          <PrimaryButton onClick={() => setIsReportModalOpen(true)}>
            <Plus size={16} /> Tambah Laporan
          </PrimaryButton>

          <IconButton danger onClick={onLogout}>
            <LogOut size={18} />
          </IconButton>
        </HeaderRight>
      </Header>

      {/* ================= MAIN ================= */}
      <Main>
        <StatsRow>
          {stats.map((s) => (
            <StatCard
              key={s.label}
              onClick={() => navigate(s.path)}
              role="button"
              tabIndex={0}
            >
              <StatIcon
                style={{
                  background: COLOR_MAP[s.color].bg,
                  color: COLOR_MAP[s.color].text,
                }}
              >
                <s.icon size={18} />
              </StatIcon>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </StatCard>
          ))}
        </StatsRow>

        <Grid>
          {filteredReports.length ? (
            filteredReports.map((r) => (
              <ReportCard
                key={r.id}
                report={r}
                isBPO={user.role === UserRole.BPO}
                onUpdate={(u) => onUpdateReport(r.id, u)}
              />
            ))
          ) : (
            <EmptyState className="glass-card">
              <ShieldAlert size={48} />
              <p>Tidak ada laporan ditemukan.</p>
            </EmptyState>
          )}
        </Grid>
      </Main>

      {/* ================= MODAL ================= */}
      {isReportModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ReportForm
              onClose={() => setIsReportModalOpen(false)}
              onSubmit={(d) => {
                onAddReport(d);
                setIsReportModalOpen(false);
              }}
            />
          </ModalContent>
        </ModalOverlay>
      )}
    </Wrapper>
  );
}

/* ================== STYLES ================== */

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #020617;
  color: #e5e7eb;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const HeaderLeft = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const Title = styled.h2`
  color: #f8fafc;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin: 0;
`;

const Greeting = styled.p`
  color: #60a5fa;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin: 0;
`;

const IconButton = styled.button`
  position: relative;
  padding: 0.6rem;
  border-radius: 0.75rem;
  background: ${({ active, danger }) =>
    active ? "#2563eb" : danger ? "transparent" : "rgba(15,23,42,0.7)"};
  color: ${({ danger }) => (danger ? "#f87171" : "#cbd5f5")};
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ danger }) =>
      danger ? "rgba(248,113,113,0.1)" : "rgba(30,41,59,0.8)"};
  }
`;

const UnreadDot = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: red;
  border-radius: 50%;
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  padding: 0.65rem 1.1rem;
  border-radius: 0.9rem;
  font-weight: 800;
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.35);
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.96);
  }
`;

const Main = styled.main`
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  padding: 1.4rem;
  border-radius: 1.75rem;
  text-align: center;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    background: rgba(30, 41, 59, 0.9);
    border-color: rgba(255, 255, 255, 0.12);
  }

  &:active {
    transform: scale(0.97);
  }

  strong {
    display: block;
    font-size: 1.6rem;
    font-weight: 800;
    color: #f8fafc;
  }

  span {
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #64748b;
  }
`;

const StatIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  margin: 0 auto 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  padding: 4rem;
  text-align: center;
  color: #64748b;

  svg {
    color: #334155;
    margin-bottom: 0.75rem;
  }

  p {
    font-style: italic;
    font-size: 0.85rem;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
`;

const ModalContent = styled.div`
  width: 100%;
  max-width: 540px;
  border-radius: 2rem;
`;

const NotifWrapper = styled.div`
  position: relative;
`;

const NotifBox = styled.div`
  position: absolute;
  top: 120%;
  right: 0;
  width: 320px;
  max-height: 360px;
  border-radius: 1.5rem;
  overflow: hidden;
  z-index: 100;
`;

const NotifHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  span {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #e5e7eb;
  }

  svg {
    cursor: pointer;
    color: #94a3b8;

    &:hover {
      color: white;
    }
  }
`;

const NotifList = styled.div`
  max-height: 280px;
  overflow-y: auto;
`;

const NotifItem = styled.div`
  padding: 0.85rem 1rem;
  background: #020617; /* solid, deep navy */
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  &:hover {
    background: #020617ee;
  }

  strong {
    display: block;
    font-size: 0.75rem;
    color: #f8fafc;
    margin-bottom: 2px;
  }

  small {
    font-size: 0.65rem;
    color: #60a5fa;
  }

  p {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 4px;
    line-height: 1.4;
  }
`;

const EmptyNotif = styled.div`
  padding: 2rem;
  text-align: center;
  font-size: 0.75rem;
  color: #64748b;
`;
