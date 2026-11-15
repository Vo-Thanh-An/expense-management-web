import { useState, useMemo } from 'react';
import { useToast } from './hooks/useToast';
import { useVault } from './hooks/useVault';
import { NAV_ITEMS } from './config/navigation';
import { computeSummary, computeMonthlyStats } from './utils/finance';
import { currentMonthStr, todayStr } from './utils/format';

import Toast from './components/ui/Toast';
import LoadingScreen from './components/ui/LoadingScreen';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import Header from './components/layout/Header';
import TransactionModal from './components/modals/TransactionModal';
import GoalModal from './components/modals/GoalModal';

import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import LedgerPage from './pages/LedgerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BudgetsPage from './pages/BudgetsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const { toast, showToast, showError } = useToast();
  const { user, booting, notice, transactions, goals, budgets, actions } = useVault({ showToast, showError });

  const [currentPage, setCurrentPage] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  // null = đóng; { editing: null } = thêm mới; { editing: tx } = chỉnh sửa
  const [txModal, setTxModal] = useState(null);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  const summary = useMemo(() => computeSummary(transactions), [transactions]);
  const monthlyStats = useMemo(
    () => computeMonthlyStats(transactions, selectedMonth, budgets),
    [transactions, selectedMonth, budgets]
  );

  const openCreateModal = () => setTxModal({ editing: null });

  const handleExport = () => {
    const payload = { exportedAt: new Date().toISOString(), user, transactions, goals, budgets };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintech-vault-backup-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất file sao lưu thành công!');
  };

  const handleLogout = async () => {
    await actions.logout();
    setCurrentPage('overview');
  };

  if (booting) return <LoadingScreen />;

  if (!user) {
    return (
      <>
        <Toast toast={toast} />
        <LoginPage notice={notice} onAuthenticate={actions.authenticate} />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'ledger':
        return (
          <LedgerPage
            transactions={transactions}
            onEdit={tx => setTxModal({ editing: tx })}
            onDelete={actions.deleteTransaction}
          />
        );
      case 'analytics':
        return <AnalyticsPage selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} monthlyStats={monthlyStats} />;
      case 'budgets':
        return (
          <BudgetsPage
            goals={goals}
            monthlyStats={monthlyStats}
            selectedMonth={selectedMonth}
            actions={actions}
            onCreateGoal={() => setGoalModalOpen(true)}
          />
        );
      case 'settings':
        return <SettingsPage user={user} actions={{ ...actions, logout: handleLogout }} onExport={handleExport} />;
      default:
        return (
          <OverviewPage
            user={user}
            summary={summary}
            monthlyStats={monthlyStats}
            selectedMonth={selectedMonth}
            transactions={transactions}
            onNavigate={setCurrentPage}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col lg:flex-row pb-20 lg:pb-0 relative overflow-x-hidden">
      <Toast toast={toast} />
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} onCreate={openCreateModal} />
      <MobileNav currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="flex-1 lg:pl-68 flex flex-col min-h-screen relative z-10">
        <Header
          title={NAV_ITEMS.find(n => n.id === currentPage)?.label}
          userName={user.name}
          onCreate={openCreateModal}
        />
        <main key={currentPage} className="p-4 sm:p-8 max-w-7xl w-full mx-auto flex-1">
          {renderPage()}
        </main>
      </div>

      {txModal && (
        <TransactionModal
          editing={txModal.editing}
          onClose={() => setTxModal(null)}
          onSave={payload => actions.saveTransaction(txModal.editing?.id, payload)}
        />
      )}
      {goalModalOpen && <GoalModal onClose={() => setGoalModalOpen(false)} onCreate={actions.createGoal} />}
    </div>
  );
}
