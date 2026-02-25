// src/App.js

import React, { useState } from "react";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import { UserRole, ReportStatus } from "./constants/enums";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { uploadToCloudinary } from "./utils/uploadToCloudinary";

const INITIAL_REPORTS = [
  {
    id: "1",
    date: "2024-05-15",
    findingType: "Unsafe Condition",
    description:
      "Bantalan fender dermaga terlihat retak dan hampir lepas di Gate 3.",
    suggestion: "Segera lakukan inspeksi struktur dan penggantian fender.",
    reportedBy: {
      name: "Fahmi Ridho",
      position: "Foreman",
      division: "Operasional",
      role: UserRole.USER,
      email: "fahmi@pelindo.co.id",
    },
    status: ReportStatus.OPEN,
    photoUrl:
      "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=800",
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: "n1",
    title: "Update Sistem",
    message: 'Laporan kategori "Unsafe Condition" sedang ditinjau tim teknis.',
    time: "10m lalu",
    isRead: false,
    type: ReportStatus.OPEN,
  },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const handleLogin = (profile) => {
    setUser(profile);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.email.split("@")[0].toUpperCase(),
          position: "Staff Pelaksana",
          division: "Operasional",
          role: firebaseUser.email.includes("admin")
            ? UserRole.BPO
            : UserRole.USER,
          email: firebaseUser.email,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsub();
  }, []);

  const handleAddReport = async (formData) => {
    if (!user) return;

    try {
      // 1️⃣ upload gambar ke cloudinary
      const imageUrl = await uploadToCloudinary(formData.photo);

      // 2️⃣ tentukan collection berdasarkan type
      const collectionName =
        formData.findingType === "Unsafe Action"
          ? "unsafe_actions"
          : "unsafe_conditions";

      // 3️⃣ simpan ke firestore
      await addDoc(collection(db, collectionName), {
        date: formData.date,
        findingType: formData.findingType,
        description: formData.description,
        suggestion: formData.suggestion,
        photoUrl: imageUrl,
        status: ReportStatus.OPEN,
        reportedBy: {
          uid: user.uid,
          name: user.name,
          email: user.email,
          division: user.division,
          role: user.role,
        },
        createdAt: serverTimestamp(),
      });

      // 4️⃣ optional: notif lokal
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          title: "Laporan Berhasil",
          message: `Laporan ${formData.findingType} berhasil dikirim.`,
          time: "Baru saja",
          isRead: false,
          type: ReportStatus.OPEN,
        },
        ...prev,
      ]);
    } catch (error) {
      console.error("Error saving report:", error);
      alert("Gagal mengirim laporan");
    }
  };

  const handleMarkNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleUpdateReport = (reportId, updates) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          const updated = { ...r, ...updates };

          if (updates.handlingReport && !r.closedAt) {
            updated.status = ReportStatus.CLOSED;
            updated.closedAt = new Date().toISOString().split("T")[0];
          } else if (updates.estimationDate) {
            updated.status = ReportStatus.IN_PROGRESS;
          }

          return updated;
        }
        return r;
      }),
    );
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!user) return <Onboarding onFinish={handleLogin} />;

  return (
    <BrowserRouter>
      <Routes>
        {/* default */}
        <Route path="/" element={<Navigate to="/reports" replace />} />

        {/* semua laporan */}
        <Route
          path="/reports"
          element={
            <Dashboard
              user={user}
              reports={reports}
              notifications={notifications}
              onAddReport={handleAddReport}
              onUpdateReport={handleUpdateReport}
              onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
              onLogout={handleLogout}
            />
          }
        />

        {/* menunggu */}
        <Route
          path="/reports/menunggu"
          element={
            <Dashboard
              user={user}
              reports={reports.filter((r) => r.status === ReportStatus.OPEN)}
              notifications={notifications}
              onAddReport={handleAddReport}
              onUpdateReport={handleUpdateReport}
              onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
              onLogout={handleLogout}
            />
          }
        />

        {/* diproses */}
        <Route
          path="/reports/diproses"
          element={
            <Dashboard
              user={user}
              reports={reports.filter(
                (r) => r.status === ReportStatus.IN_PROGRESS,
              )}
              notifications={notifications}
              onAddReport={handleAddReport}
              onUpdateReport={handleUpdateReport}
              onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
              onLogout={handleLogout}
            />
          }
        />

        {/* selesai */}
        <Route
          path="/reports/selesai"
          element={
            <Dashboard
              user={user}
              reports={reports.filter((r) => r.status === ReportStatus.CLOSED)}
              notifications={notifications}
              onAddReport={handleAddReport}
              onUpdateReport={handleUpdateReport}
              onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
              onLogout={handleLogout}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
