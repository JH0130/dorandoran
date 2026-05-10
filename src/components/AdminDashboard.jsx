import React from 'react';

const AdminDashboard = ({ allUsers, healthLogs }) => {
  return (
    <div style={{
      padding: 'var(--spacing-section) var(--spacing-base)',
      backgroundColor: 'var(--color-surface-soft)',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1 style={{ fontSize: 'var(--font-heading-lg)', fontWeight: 700, marginBottom: '40px' }}>
        국 본부장 전용 관제 센터 🚀
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* User Statistics Card */}
        <div className="card-meta">
          <h2 style={{ fontSize: 'var(--font-heading-sm)', marginBottom: '16px' }}>사용자 현황</h2>
          <div style={{ fontSize: 'var(--font-hero)', fontWeight: 700 }}>{allUsers.length}명</div>
          <p style={{ color: 'var(--color-ink)' }}>현재 Echo-Guardian이 지키고 있는 어르신 수</p>
        </div>

        {/* System Status Card */}
        <div className="card-meta">
          <h2 style={{ fontSize: 'var(--font-heading-sm)', marginBottom: '16px' }}>시스템 상태</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></div>
            <span style={{ fontWeight: 700 }}>정상 작동 중</span>
          </div>
          <p style={{ color: 'var(--color-ink)', marginTop: '10px' }}>공공 API 연동 및 GPT-4 엔진 활성화</p>
        </div>
      </div>

      {/* User Data Table */}
      <div className="card-meta" style={{ marginTop: '24px', overflowX: 'auto' }}>
        <h2 style={{ fontSize: 'var(--font-heading-sm)', marginBottom: '16px' }}>상세 데이터 로그</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-surface-soft)' }}>
              <th style={{ padding: '12px' }}>사용자 ID</th>
              <th style={{ padding: '12px' }}>위험 점수</th>
              <th style={{ padding: '12px' }}>상태</th>
              <th style={{ padding: '12px' }}>진료과 추천</th>
              <th style={{ padding: '12px' }}>마지막 대화</th>
            </tr>
          </thead>
          <tbody>
            {healthLogs.map((log, index) => (
              <tr key={index} style={{ borderBottom: '1px solid var(--color-surface-soft)' }}>
                <td style={{ padding: '12px' }}>{log.userId}</td>
                <td style={{ padding: '12px', fontWeight: 700 }}>{log.score}점</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: 'var(--rounded-full)', 
                    backgroundColor: log.status === 'red' ? 'var(--color-critical)' : 'var(--color-success)',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {log.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{log.recommendedDept}</td>
                <td style={{ padding: '12px', color: 'var(--color-ink)' }}>{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
