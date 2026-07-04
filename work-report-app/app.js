/* ==========================================================================
   帰庫後作業日報システム - アプリケーションロジック (JavaScript)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. 定数・初期モックデータ定義 ---
  const STORAGE_KEY = 'logireport_db_v1';
  
  // 初期モックデータ定義
  const INITIAL_MOCK_DATA = [
    {
      id: 'mock-001',
      date: '2026-07-03',
      driverName: '山田 太郎',
      returnTime: '17:00',
      workStartTime: '17:00',
      workEndTime: '19:30',
      breakTime: 30, // 分
      workDuration: 120, // 分 (2時間00分)
      category: '洗車',
      content: '4号車洗車と車体コーティング、庫内整理作業。',
      status: '管理者承認済み',
      returnedReason: '',
      processedBy: '高橋 茂',
      processedAt: '2026-07-03 20:15'
    },
    {
      id: 'mock-002',
      date: '2026-07-02',
      driverName: '山田 太郎',
      returnTime: '16:30',
      workStartTime: '16:30',
      workEndTime: '18:30',
      breakTime: 0,
      workDuration: 120, // 2時間00分
      category: '車両点検',
      content: '3号車の3ヶ月点検、エンジンオイル量チェック、ライト類点検。',
      status: '勤怠処理済み',
      returnedReason: '',
      processedBy: '高橋 茂',
      processedAt: '2026-07-02 19:00',
      attendanceProcessedAt: '2026-07-03 10:30'
    },
    {
      id: 'mock-003',
      date: '2026-07-01',
      driverName: '山田 太郎',
      returnTime: '18:00',
      workStartTime: '18:00',
      workEndTime: '20:00',
      breakTime: 15,
      workDuration: 105, // 1時間45分
      category: 'その他',
      content: '事務所での運行日誌整理、および荷主への電話連絡対応。',
      status: '差戻し',
      returnedReason: '何の運行日誌を整理したか具体的に追記してください。(例: 6月分運行日報のファイリングなど)',
      processedBy: '高橋 茂',
      processedAt: '2026-07-02 09:15'
    },
    {
      id: 'mock-004',
      date: '2026-07-03',
      driverName: '佐藤 次郎',
      returnTime: '18:15',
      workStartTime: '18:15',
      workEndTime: '21:15',
      breakTime: 60,
      workDuration: 120, // 2時間00分
      category: 'タイヤ交換',
      content: 'スタッドレスタイヤからノーマルタイヤへの交換作業（5号車、6号車分計2台）。',
      status: '入力済み',
      returnedReason: '',
      processedBy: '',
      processedAt: ''
    },
    {
      id: 'mock-005',
      date: '2026-07-02',
      driverName: '佐藤 次郎',
      returnTime: '17:30',
      workStartTime: '17:30',
      workEndTime: '19:00',
      breakTime: 30,
      workDuration: 60, // 1時間00分
      category: '荷台整理',
      content: 'パレット回収および荷台内の清掃・整理整頓作業。',
      status: '管理者承認済み',
      returnedReason: '',
      processedBy: '高橋 茂',
      processedAt: '2026-07-02 19:30'
    },
    {
      id: 'mock-006',
      date: '2026-07-03',
      driverName: '鈴木 一郎',
      returnTime: '16:00',
      workStartTime: '16:00',
      workEndTime: '17:30',
      breakTime: 0,
      workDuration: 90, // 1時間30分
      category: '倉庫作業',
      content: '翌日配送分の荷物の仕分け、検品、およびパレットへの積み替え。',
      status: '入力済み',
      returnedReason: '',
      processedBy: '',
      processedAt: ''
    },
    {
      id: 'mock-007',
      date: '2026-07-01',
      driverName: '鈴木 一郎',
      returnTime: '15:45',
      workStartTime: '16:00',
      workEndTime: '19:00',
      breakTime: 45,
      workDuration: 135, // 2時間15分
      category: '整備',
      content: '1号車のワイパーゴム交換、ウォッシャー液補充、バッテリー始動性点検。',
      status: '勤怠処理済み',
      returnedReason: '',
      processedBy: '高橋 茂',
      processedAt: '2026-07-01 20:00',
      attendanceProcessedAt: '2026-07-03 10:30'
    },
    {
      id: 'mock-008',
      date: '2026-07-03',
      driverName: '田中 三郎',
      returnTime: '19:00',
      workStartTime: '19:00',
      workEndTime: '20:00',
      breakTime: 0,
      workDuration: 60, // 1時間00分
      category: '車内清掃',
      content: '長距離乗務後のキャブ内の掃除機掛け、シート除菌消臭作業。',
      status: '入力済み',
      returnedReason: '',
      processedBy: '',
      processedAt: ''
    }
  ];

  // --- 2. データベース操作関数 ---
  let db = [];
  
  function initDB() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        db = JSON.parse(stored);
      } else {
        db = [...INITIAL_MOCK_DATA];
        saveDB();
      }
    } catch (e) {
      console.error('LocalStorageの読み込みに失敗しました。一時メモリを使用します。', e);
      db = [...INITIAL_MOCK_DATA];
    }
  }

  function saveDB() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('LocalStorageへの保存に失敗しました。', e);
    }
  }

  // --- 3. DOM要素セレクター ---
  
  // ユーザーシミュレーター
  const userSimulator = document.getElementById('user-simulator');
  const roleBanner = document.getElementById('role-banner');
  const roleBadgeText = document.getElementById('role-badge-text');
  const currentUserDisplay = document.getElementById('current-user-display');
  
  // ビューセクション
  const viewDriver = document.getElementById('view-driver');
  const viewManager = document.getElementById('view-manager');
  const viewAttendance = document.getElementById('view-attendance');
  const viewSections = [viewDriver, viewManager, viewAttendance];

  // ドライバー画面要素
  const reportForm = document.getElementById('report-form');
  const editReportId = document.getElementById('edit-report-id');
  const reportDateInput = document.getElementById('report-date');
  const driverNameInput = document.getElementById('driver-name');
  const returnTimeInput = document.getElementById('return-time');
  const workStartTimeInput = document.getElementById('work-start-time');
  const workEndTimeInput = document.getElementById('work-end-time');
  const breakTimeSelect = document.getElementById('break-time');
  const customBreakContainer = document.getElementById('custom-break-container');
  const customBreakTimeInput = document.getElementById('custom-break-time');
  const workCategorySelect = document.getElementById('work-category');
  const workContentTextarea = document.getElementById('work-content');
  const timeWarning = document.getElementById('time-warning');
  const calcHoursSpan = document.getElementById('calc-hours');
  const calcMinutesSpan = document.getElementById('calc-minutes');
  const calcDecimalSpan = document.getElementById('calc-decimal');
  const submitBtn = document.getElementById('submit-btn');
  const btnSubmitText = document.getElementById('btn-submit-text');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const historyDriverName = document.getElementById('history-driver-name');
  const driverHistoryList = document.getElementById('driver-history-list');

  // ドライバー画面タブ
  const btnDriverInput = document.getElementById('btn-driver-input');
  const btnDriverHistory = document.getElementById('btn-driver-history');
  const driverInputContent = document.getElementById('driver-input-content');
  const driverHistoryContent = document.getElementById('driver-history-content');

  // 管理者画面要素
  const tabPending = document.getElementById('tab-pending');
  const tabProcessed = document.getElementById('tab-processed');
  const pendingContainer = document.getElementById('pending-container');
  const processedContainer = document.getElementById('processed-container');
  const managerPendingList = document.getElementById('manager-pending-list');
  const managerProcessedList = document.getElementById('manager-processed-list');
  const pendingCountSpan = document.getElementById('pending-count');
  const processedCountSpan = document.getElementById('processed-count');

  // 勤怠担当画面要素
  const filterMonthSelect = document.getElementById('filter-month');
  const filterDriverSelect = document.getElementById('filter-driver');
  const btnResetFilters = document.getElementById('btn-reset-filters');
  const btnBulkComplete = document.getElementById('btn-bulk-complete');
  const btnExportExcel = document.getElementById('btn-export-excel');
  const attendanceCardList = document.getElementById('attendance-card-list');
  const thCheckAll = document.getElementById('th-check-all');
  const tableDisplayCount = document.getElementById('table-display-count');
  const tableTotalCount = document.getElementById('table-total-count');

  // 差戻しモーダル要素
  const sendbackModal = document.getElementById('sendback-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelSendback = document.getElementById('btn-cancel-sendback');
  const btnConfirmSendback = document.getElementById('btn-confirm-sendback');
  const sendbackReasonTextarea = document.getElementById('sendback-reason');
  const modalDriverName = document.getElementById('modal-driver-name');
  const modalDate = document.getElementById('modal-date');
  let currentSendbackId = null;

  // トースト通知コンテナ
  const toastContainer = document.getElementById('toast-container');

  // --- 4. 共通・ユーティリティ関数 ---

  // トースト表示
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-triangle-exclamation';
    
    toast.innerHTML = `
      <i class="fa-solid ${iconClass}"></i>
      <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // 表示アニメーション用
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 3.5秒後に削除
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // 今日の日付を取得 (YYYY-MM-DD)
  function getTodayDateString() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // 時間を分に変換
  function timeStringToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [hrs, mins] = timeStr.split(':').map(Number);
    return hrs * 60 + mins;
  }

  // 分を時間表示に変換
  function minutesToDisplayString(minutes) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}時間${String(mins).padStart(2, '0')}分`;
  }

  // ログインユーザー情報取得
  function getActiveUserInfo() {
    const selectedOption = userSimulator.options[userSimulator.selectedIndex];
    return {
      id: selectedOption.value,
      role: selectedOption.getAttribute('data-role'),
      name: selectedOption.getAttribute('data-name')
    };
  }

  // --- 5. 画面切り替え & ロール管理 ---
  
  function handleRoleChange() {
    const user = getActiveUserInfo();
    currentUserDisplay.textContent = user.name;
    
    // 全ビュー非表示
    viewSections.forEach(section => section.classList.remove('active'));
    
    if (user.role === 'driver') {
      roleBadgeText.textContent = 'ドライバー画面';
      viewDriver.classList.add('active');
      
      // ドライバー初期タブ選択（日報入力）
      switchDriverTab('input');
      
      // ドライバー用フォーム初期化
      driverNameInput.value = user.name;
      reportDateInput.value = getTodayDateString();
      
      resetFormToNew();
      
      // 履歴一覧の再描画
      historyDriverName.textContent = user.name;
      renderDriverHistory();
    } 
    else if (user.role === 'manager') {
      roleBadgeText.textContent = '管理者承認画面';
      viewManager.classList.add('active');
      
      // 管理者初期タブ選択（承認待ち）
      switchManagerTab('pending');
      renderManagerView();
    } 
    else if (user.role === 'attendance') {
      roleBadgeText.textContent = '勤怠担当画面';
      viewAttendance.classList.add('active');
      
      // 勤怠担当フィルター・テーブル初期化
      populateAttendanceFilters();
      renderAttendanceTable();
    }
    
    showToast(`操作ユーザーを「${user.name}」に切り替えました。`, 'success');
  }

  // ドライバー用サブタブ切り替え
  function switchDriverTab(tabName) {
    if (tabName === 'input') {
      btnDriverInput.classList.add('active');
      btnDriverHistory.classList.remove('active');
      driverInputContent.classList.add('active');
      driverHistoryContent.classList.remove('active');
    } else {
      btnDriverInput.classList.remove('active');
      btnDriverHistory.classList.add('active');
      driverInputContent.classList.remove('active');
      driverHistoryContent.classList.add('active');
      renderDriverHistory();
    }
  }

  btnDriverInput.addEventListener('click', () => switchDriverTab('input'));
  btnDriverHistory.addEventListener('click', () => switchDriverTab('history'));

  // 管理者用サブタブ切り替え
  function switchManagerTab(tabName) {
    if (tabName === 'pending') {
      tabPending.classList.add('active');
      tabProcessed.classList.remove('active');
      pendingContainer.classList.add('active');
      processedContainer.classList.remove('active');
    } else {
      tabPending.classList.remove('active');
      tabProcessed.classList.add('active');
      pendingContainer.classList.remove('active');
      processedContainer.classList.add('active');
    }
  }

  tabPending.addEventListener('click', () => {
    switchManagerTab('pending');
    renderManagerView();
  });
  tabProcessed.addEventListener('click', () => {
    switchManagerTab('processed');
    renderManagerView();
  });


  // --- 6. ドライバー入力画面のロジック ---

  // 休憩時間の選択変更
  breakTimeSelect.addEventListener('change', () => {
    if (breakTimeSelect.value === 'custom') {
      customBreakContainer.classList.remove('hidden');
      customBreakTimeInput.setAttribute('required', 'required');
    } else {
      customBreakContainer.classList.add('hidden');
      customBreakTimeInput.removeAttribute('required');
      customBreakTimeInput.value = '';
    }
    calculateDuration();
  });

  // 帰庫時間入力時の開始時間初期値コピー
  returnTimeInput.addEventListener('input', () => {
    const retVal = returnTimeInput.value;
    const startVal = workStartTimeInput.value;
    
    if (retVal && (!startVal || startVal === returnTimeInput.dataset.prevVal)) {
      workStartTimeInput.value = retVal;
    }
    returnTimeInput.dataset.prevVal = retVal;
    
    calculateDuration();
    checkTimeWarning();
  });

  workStartTimeInput.addEventListener('input', () => {
    calculateDuration();
    checkTimeWarning();
  });
  workEndTimeInput.addEventListener('input', calculateDuration);
  customBreakTimeInput.addEventListener('input', calculateDuration);

  // 作業時間と実働時間の自動計算
  function calculateDuration() {
    const start = workStartTimeInput.value;
    const end = workEndTimeInput.value;
    
    if (!start || !end) {
      calcHoursSpan.textContent = '0';
      calcMinutesSpan.textContent = '00';
      calcDecimalSpan.textContent = '0.00';
      return;
    }

    let startMins = timeStringToMinutes(start);
    let endMins = timeStringToMinutes(end);
    
    // 日またぎの対応
    if (endMins < startMins) {
      endMins += 1440; 
    }

    let breakMins = 0;
    if (breakTimeSelect.value === 'custom') {
      breakMins = parseInt(customBreakTimeInput.value, 10) || 0;
    } else {
      breakMins = parseInt(breakTimeSelect.value, 10) || 0;
    }

    let diffMins = endMins - startMins - breakMins;
    if (diffMins < 0) diffMins = 0;

    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    calcHoursSpan.textContent = hrs;
    calcMinutesSpan.textContent = String(mins).padStart(2, '0');
    calcDecimalSpan.textContent = (diffMins / 60).toFixed(2);
  }

  // 警告処理 (作業開始時間が帰庫時間より前のとき警告)
  function checkTimeWarning() {
    const retVal = returnTimeInput.value;
    const startVal = workStartTimeInput.value;

    if (!retVal || !startVal) {
      timeWarning.classList.add('hidden');
      return;
    }

    const retMins = timeStringToMinutes(retVal);
    const startMins = timeStringToMinutes(startVal);

    if (startMins < retMins) {
      timeWarning.classList.remove('hidden');
    } else {
      timeWarning.classList.add('hidden');
    }
  }

  // ドライバー提出履歴の描画
  function renderDriverHistory() {
    const user = getActiveUserInfo();
    if (user.role !== 'driver') return;

    const records = db.filter(r => r.driverName === user.name)
                      .sort((a, b) => {
                        const dateCompare = b.date.localeCompare(a.date);
                        if (dateCompare !== 0) return dateCompare;
                        return b.returnTime.localeCompare(a.returnTime);
                      });

    if (records.length === 0) {
      driverHistoryList.innerHTML = `
        <div class="empty-state">
          <p>提出済みの作業日報はありません</p>
        </div>
      `;
      return;
    }

    let html = '';
    records.forEach(item => {
      let statusBadgeClass = '';
      if (item.status === '入力済み') statusBadgeClass = 'badge-submitted';
      if (item.status === '差戻し') statusBadgeClass = 'badge-returned';
      if (item.status === '管理者承認済み') statusBadgeClass = 'badge-approved';
      if (item.status === '勤怠処理済み') statusBadgeClass = 'badge-processed';

      const durStr = minutesToDisplayString(item.workDuration);

      let actionBtnHtml = '';
      let returnedReasonHtml = '';

      if (item.status === '差戻し') {
        actionBtnHtml = `
          <div class="card-actions">
            <button type="button" class="btn btn-grey btn-sm btn-edit" data-id="${item.id}">
              修正して再申請する
            </button>
          </div>
        `;
        returnedReasonHtml = `
          <div class="returned-reason-box">
            <strong>差戻し理由:</strong>
            ${item.returnedReason}
          </div>
        `;
      }

      html += `
        <div class="report-card">
          <div class="report-card-header">
            <span class="report-card-title">${item.date}</span>
            <span class="badge ${statusBadgeClass}">${item.status}</span>
          </div>
          <div class="report-card-grid">
            <span class="grid-label">帰庫時間:</span><span class="grid-value">${item.returnTime}</span>
            <span class="grid-label">作業時間:</span><span class="grid-value">${item.workStartTime} 〜 ${item.workEndTime}</span>
            <span class="grid-label">休憩 / 実働:</span><span class="grid-value">${item.breakTime}分 / ${durStr}</span>
            <span class="grid-label">作業区分:</span><span class="grid-value">${item.category}</span>
            <span class="grid-label" style="grid-column:1/-1; margin-top:4px;">作業内容:</span>
            <div class="grid-value-textarea">${item.content}</div>
            ${returnedReasonHtml}
          </div>
          ${item.processedAt ? `<div class="card-signature">確認者: ${item.processedBy} (${item.processedAt})</div>` : ''}
          ${actionBtnHtml}
        </div>
      `;
    });

    driverHistoryList.innerHTML = html;

    // イベントバインド
    const editButtons = driverHistoryList.querySelectorAll('.btn-edit');
    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        loadReportToForm(id);
      });
    });
  }

  // 編集ロード
  function loadReportToForm(id) {
    const report = db.find(r => r.id === id);
    if (!report) return;

    editReportId.value = report.id;
    reportDateInput.value = report.date;
    returnTimeInput.value = report.returnTime;
    workStartTimeInput.value = report.workStartTime;
    workEndTimeInput.value = report.workEndTime;
    
    // 休憩設定
    const standardBreaks = ['0', '15', '30', '45', '60', '90', '120'];
    if (standardBreaks.includes(String(report.breakTime))) {
      breakTimeSelect.value = String(report.breakTime);
      customBreakContainer.classList.add('hidden');
      customBreakTimeInput.removeAttribute('required');
      customBreakTimeInput.value = '';
    } else {
      breakTimeSelect.value = 'custom';
      customBreakContainer.classList.remove('hidden');
      customBreakTimeInput.setAttribute('required', 'required');
      customBreakTimeInput.value = report.breakTime;
    }

    // プルダウンの区分選択
    workCategorySelect.value = report.category;
    workContentTextarea.value = report.content;

    // 編集モードUIへ
    cancelEditBtn.classList.remove('hidden');
    btnSubmitText.textContent = '修正して送信する';
    submitBtn.className = 'btn btn-navy btn-large';
    
    calculateDuration();
    checkTimeWarning();
    
    // タブを入力に切り替え
    switchDriverTab('input');
    showToast('日報データを編集モードで読み込みました。修正して再登録してください。', 'success');
  }

  // 新規状態リセット
  function resetFormToNew() {
    editReportId.value = '';
    reportDateInput.value = getTodayDateString();
    returnTimeInput.value = '';
    workStartTimeInput.value = '';
    workEndTimeInput.value = '';
    breakTimeSelect.value = '60';
    customBreakContainer.classList.add('hidden');
    customBreakTimeInput.removeAttribute('required');
    customBreakTimeInput.value = '';
    workCategorySelect.value = '洗車';
    workContentTextarea.value = '';
    
    cancelEditBtn.classList.add('hidden');
    btnSubmitText.textContent = '日報を登録する (送信)';
    
    calculateDuration();
    checkTimeWarning();
  }

  cancelEditBtn.addEventListener('click', () => {
    resetFormToNew();
    showToast('編集をキャンセルしました。', 'success');
  });

  // ドライバー登録送信
  reportForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const user = getActiveUserInfo();
    if (user.role !== 'driver') {
      showToast('エラー: ドライバー以外のロールでは日報登録できません。', 'error');
      return;
    }

    const dateVal = reportDateInput.value;
    const nameVal = driverNameInput.value;
    const returnVal = returnTimeInput.value;
    const startVal = workStartTimeInput.value;
    const endVal = workEndTimeInput.value;
    const categoryVal = workCategorySelect.value;
    const contentVal = workContentTextarea.value.trim();

    let breakVal = 0;
    if (breakTimeSelect.value === 'custom') {
      breakVal = parseInt(customBreakTimeInput.value, 10) || 0;
    } else {
      breakVal = parseInt(breakTimeSelect.value, 10) || 0;
    }

    let startMins = timeStringToMinutes(startVal);
    let endMins = timeStringToMinutes(endVal);
    if (endMins < startMins) {
      endMins += 1440;
    }
    let durationMins = endMins - startMins - breakVal;
    if (durationMins < 0) durationMins = 0;

    const reportId = editReportId.value;

    if (reportId) {
      // 編集コミット
      const index = db.findIndex(r => r.id === reportId);
      if (index !== -1) {
        db[index].date = dateVal;
        db[index].returnTime = returnVal;
        db[index].workStartTime = startVal;
        db[index].workEndTime = endVal;
        db[index].breakTime = breakVal;
        db[index].workDuration = durationMins;
        db[index].category = categoryVal;
        db[index].content = contentVal;
        db[index].status = '入力済み';
        db[index].returnedReason = '';
        db[index].processedBy = '';
        db[index].processedAt = '';
        
        saveDB();
        showToast('日報を修正送信しました（ステータス：入力済み）。', 'success');
      }
    } else {
      // 新規登録
      const newReport = {
        id: 'rep-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        date: dateVal,
        driverName: nameVal,
        returnTime: returnVal,
        workStartTime: startVal,
        workEndTime: endVal,
        breakTime: breakVal,
        workDuration: durationMins,
        category: categoryVal,
        content: contentVal,
        status: '入力済み',
        returnedReason: '',
        processedBy: '',
        processedAt: ''
      };
      
      db.push(newReport);
      saveDB();
      showToast('日報を送信しました（ステータス：入力済み）。', 'success');
    }

    resetFormToNew();
    
    // 自動的に履歴タブに切り替え、送信成果を見せる
    switchDriverTab('history');
  });


  // --- 7. 管理者確認・承認画面のロジック ---
  let activeManagerTab = 'pending';

  function renderManagerView() {
    const user = getActiveUserInfo();
    if (user.role !== 'manager') return;

    const pendingReports = db.filter(r => r.status === '入力済み');
    const processedReports = db.filter(r => ['管理者承認済み', '差戻し', '勤怠処理済み'].includes(r.status));
    
    pendingCountSpan.textContent = pendingReports.length;
    processedCountSpan.textContent = processedReports.length;

    // 承認待ちリスト
    if (activeManagerTab === 'pending') {
      if (pendingReports.length === 0) {
        managerPendingList.innerHTML = `
          <div class="empty-state">
            <p>承認待ちの作業日報はありません</p>
          </div>
        `;
        return;
      }

      const sortedPending = pendingReports.sort((a, b) => {
        const dComp = a.date.localeCompare(b.date);
        if (dComp !== 0) return dComp;
        return a.returnTime.localeCompare(b.returnTime);
      });

      let html = '';
      sortedPending.forEach(item => {
        const durStr = minutesToDisplayString(item.workDuration);

        html += `
          <div class="report-card">
            <div class="report-card-header">
              <span class="report-card-title">${item.driverName}（${item.date}）</span>
              <span class="badge badge-submitted">${item.status}</span>
            </div>
            <div class="report-card-grid">
              <span class="grid-label">帰庫時間:</span><span class="grid-value">${item.returnTime}</span>
              <span class="grid-label">作業時間:</span><span class="grid-value">${item.workStartTime} 〜 ${item.workEndTime}</span>
              <span class="grid-label">休憩 / 実働:</span><span class="grid-value">${item.breakTime}分 / ${durStr}</span>
              <span class="grid-label">作業区分:</span><span class="grid-value">${item.category}</span>
              <span class="grid-label" style="grid-column:1/-1; margin-top:4px;">作業内容:</span>
              <div class="grid-value-textarea">${item.content}</div>
            </div>
            <div class="card-actions">
              <button type="button" class="btn btn-grey btn-sm btn-manager-sendback" data-id="${item.id}">差戻し</button>
              <button type="button" class="btn btn-navy btn-sm btn-manager-approve" data-id="${item.id}">承認する</button>
            </div>
          </div>
        `;
      });
      managerPendingList.innerHTML = html;

    } 
    // 処理済み履歴リスト
    else {
      if (processedReports.length === 0) {
        managerProcessedList.innerHTML = `
          <div class="empty-state">
            <p>処理履歴はありません</p>
          </div>
        `;
        return;
      }

      const sortedProcessed = processedReports.sort((a, b) => b.processedAt.localeCompare(a.processedAt));

      let html = '';
      sortedProcessed.forEach(item => {
        const durStr = minutesToDisplayString(item.workDuration);
        
        let statusBadgeClass = '';
        if (item.status === '差戻し') statusBadgeClass = 'badge-returned';
        if (item.status === '管理者承認済み') statusBadgeClass = 'badge-approved';
        if (item.status === '勤怠処理済み') statusBadgeClass = 'badge-processed';

        let returnedReasonHtml = '';
        if (item.status === '差戻し') {
          returnedReasonHtml = `
            <div class="returned-reason-box">
              <strong>差戻し理由:</strong> ${item.returnedReason}
            </div>
          `;
        }

        html += `
          <div class="report-card">
            <div class="report-card-header">
              <span class="report-card-title">${item.driverName}（${item.date}）</span>
              <span class="badge ${statusBadgeClass}">${item.status}</span>
            </div>
            <div class="report-card-grid">
              <span class="grid-label">帰庫時間:</span><span class="grid-value">${item.returnTime}</span>
              <span class="grid-label">作業時間:</span><span class="grid-value">${item.workStartTime} 〜 ${item.workEndTime}</span>
              <span class="grid-label">休憩 / 実働:</span><span class="grid-value">${item.breakTime}分 / ${durStr}</span>
              <span class="grid-label">作業区分:</span><span class="grid-value">${item.category}</span>
              <span class="grid-label" style="grid-column:1/-1; margin-top:4px;">作業内容:</span>
              <div class="grid-value-textarea">${item.content}</div>
              ${returnedReasonHtml}
            </div>
            <div class="card-signature">処理者: ${item.processedBy} (${item.processedAt})</div>
          </div>
        `;
      });
      managerProcessedList.innerHTML = html;
    }

    // イベントバインド
    const approveBtns = managerPendingList.querySelectorAll('.btn-manager-approve');
    approveBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        approveReport(id);
      });
    });

    const sendbackBtns = managerPendingList.querySelectorAll('.btn-manager-sendback');
    sendbackBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openSendbackModal(id);
      });
    });
  }

  // 承認実行
  function approveReport(id) {
    const manager = getActiveUserInfo();
    const index = db.findIndex(r => r.id === id);
    if (index === -1) return;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    db[index].status = '管理者承認済み';
    db[index].processedBy = manager.name;
    db[index].processedAt = formattedDate;

    saveDB();
    showToast(`${db[index].driverName}さんの日報を承認しました。`, 'success');
    renderManagerView();
  }

  // 差戻しダイアログ
  function openSendbackModal(id) {
    const report = db.find(r => r.id === id);
    if (!report) return;

    currentSendbackId = id;
    modalDriverName.textContent = report.driverName;
    modalDate.textContent = report.date;
    sendbackReasonTextarea.value = '';
    
    sendbackModal.classList.add('active');
  }

  function closeSendbackModal() {
    sendbackModal.classList.remove('active');
    currentSendbackId = null;
  }

  btnCloseModal.addEventListener('click', closeSendbackModal);
  btnCancelSendback.addEventListener('click', closeSendbackModal);

  btnConfirmSendback.addEventListener('click', () => {
    const reason = sendbackReasonTextarea.value.trim();
    if (!reason) {
      showToast('差戻し理由を入力してください。', 'error');
      sendbackReasonTextarea.focus();
      return;
    }

    const manager = getActiveUserInfo();
    const index = db.findIndex(r => r.id === currentSendbackId);
    if (index === -1) {
      closeSendbackModal();
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    db[index].status = '差戻し';
    db[index].returnedReason = reason;
    db[index].processedBy = manager.name;
    db[index].processedAt = formattedDate;

    saveDB();
    showToast(`${db[index].driverName}さんの日報を差し戻しました。`, 'success');
    
    closeSendbackModal();
    renderManagerView();
  });


  // --- 8. 勤怠担当画面のロジック ---

  function populateAttendanceFilters() {
    const targetRecords = db.filter(r => ['管理者承認済み', '勤怠処理済み'].includes(r.status));
    
    const months = [...new Set(targetRecords.map(r => r.date.substring(0, 7)))];
    months.sort((a, b) => b.localeCompare(a));

    const now = new Date();
    const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (!months.includes(curMonth)) {
      months.unshift(curMonth);
    }

    let html = '';
    months.forEach(m => {
      const [y, mm] = m.split('-');
      html += `<option value="${m}">${y}年${mm}月</option>`;
    });

    const prevVal = filterMonthSelect.value;
    filterMonthSelect.innerHTML = html;
    if (prevVal && filterMonthSelect.querySelector(`option[value="${prevVal}"]`)) {
      filterMonthSelect.value = prevVal;
    } else {
      filterMonthSelect.value = curMonth;
    }
  }

  filterMonthSelect.addEventListener('change', renderAttendanceTable);
  filterDriverSelect.addEventListener('change', renderAttendanceTable);

  btnResetFilters.addEventListener('click', () => {
    const now = new Date();
    filterMonthSelect.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    filterDriverSelect.value = 'all';
    thCheckAll.checked = false;
    renderAttendanceTable();
    showToast('検索フィルターをクリアしました。', 'success');
  });

  // 全選択トグル
  thCheckAll.addEventListener('change', () => {
    const isChecked = thCheckAll.checked;
    const rowChecks = attendanceCardList.querySelectorAll('.row-check');
    rowChecks.forEach(chk => {
      chk.checked = isChecked;
    });
    updateBulkButtonState();
  });

  function updateBulkButtonState() {
    const checkedBoxes = attendanceCardList.querySelectorAll('.row-check:checked');
    btnBulkComplete.disabled = (checkedBoxes.length === 0);
  }

  // 勤怠データのカードレンダリング (モバイル最適化)
  function renderAttendanceTable() {
    const user = getActiveUserInfo();
    if (user.role !== 'attendance') return;

    const filterMonth = filterMonthSelect.value;
    const filterDriver = filterDriverSelect.value;

    let records = db.filter(r => r.status === '管理者承認済み');

    tableTotalCount.textContent = records.length;

    if (filterMonth) {
      records = records.filter(r => r.date.startsWith(filterMonth));
    }
    if (filterDriver !== 'all') {
      records = records.filter(r => r.driverName === filterDriver);
    }

    tableDisplayCount.textContent = records.length;
    thCheckAll.checked = false;
    btnBulkComplete.disabled = true;

    if (records.length === 0) {
      attendanceCardList.innerHTML = `
        <div class="empty-state">
          <p>該当する「管理者承認済み」の日報はありません</p>
        </div>
      `;
      return;
    }

    records.sort((a, b) => {
      const dComp = a.date.localeCompare(b.date);
      if (dComp !== 0) return dComp;
      return a.driverName.localeCompare(b.driverName);
    });

    let html = '';
    records.forEach(item => {
      const durStr = minutesToDisplayString(item.workDuration);

      html += `
        <div class="attendance-item">
          <div class="attendance-check-side">
            <input type="checkbox" class="row-check" data-id="${item.id}">
          </div>
          <div class="attendance-info-side">
            <div class="report-card-header">
              <span class="report-card-title">${item.driverName}（${item.date}）</span>
              <span class="badge badge-approved">${item.status}</span>
            </div>
            <div class="report-card-grid">
              <span class="grid-label">帰庫時間:</span><span class="grid-value">${item.returnTime}</span>
              <span class="grid-label">作業時間:</span><span class="grid-value">${item.workStartTime} 〜 ${item.workEndTime}</span>
              <span class="grid-label">休憩 / 実働:</span><span class="grid-value">${item.breakTime}分 / ${durStr}</span>
              <span class="grid-label">作業区分:</span><span class="grid-value">${item.category}</span>
              <span class="grid-label" style="grid-column:1/-1; margin-top:4px;">作業内容:</span>
              <div class="grid-value-textarea">${item.content}</div>
            </div>
            <div class="card-actions" style="margin-top:6px; padding-top:6px; border-top:none;">
              <button type="button" class="btn btn-green btn-sm btn-row-complete" style="width:100%;" data-id="${item.id}">
                確定（処理済みにする）
              </button>
            </div>
          </div>
        </div>
      `;
    });

    attendanceCardList.innerHTML = html;

    // 個別確定イベントバインド
    const completeBtns = attendanceCardList.querySelectorAll('.btn-row-complete');
    completeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        processAttendance([id]);
      });
    });

    // チェックボックスイベントバインド
    const rowChecks = attendanceCardList.querySelectorAll('.row-check');
    rowChecks.forEach(chk => {
      chk.addEventListener('change', updateBulkButtonState);
    });
  }

  // 確定
  function processAttendance(ids) {
    if (ids.length === 0) return;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    ids.forEach(id => {
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        db[index].status = '勤怠処理済み';
        db[index].attendanceProcessedAt = formattedDate;
      }
    });

    saveDB();
    showToast(`${ids.length}件の日報を「勤怠処理済み」に変更しました。`, 'success');
    renderAttendanceTable();
  }

  // 一括確定ボタン
  btnBulkComplete.addEventListener('click', () => {
    const selectedChecks = attendanceCardList.querySelectorAll('.row-check:checked');
    const ids = Array.from(selectedChecks).map(chk => chk.getAttribute('data-id'));
    
    if (ids.length === 0) return;

    if (confirm(`選択された ${ids.length} 件の日報を一括で「勤怠処理済み」として処理します。よろしいですか？`)) {
      processAttendance(ids);
    }
  });


  // --- 9. Excel出力機能 ---
  btnExportExcel.addEventListener('click', () => {
    const user = getActiveUserInfo();
    if (user.role !== 'attendance') return;

    const filterMonth = filterMonthSelect.value;
    const filterDriver = filterDriverSelect.value;

    let records = db.filter(r => r.status === '管理者承認済み');
    if (filterMonth) {
      records = records.filter(r => r.date.startsWith(filterMonth));
    }
    if (filterDriver !== 'all') {
      records = records.filter(r => r.driverName === filterDriver);
    }

    if (records.length === 0) {
      showToast('出力対象の承認済み日報がありません。', 'error');
      return;
    }

    const exportData = records.map((r, index) => {
      const workDurationHrs = (r.workDuration / 60).toFixed(2);
      return {
        'No.': index + 1,
        '日付': r.date,
        '氏名': r.driverName,
        '帰庫時間': r.returnTime,
        '作業開始時間': r.workStartTime,
        '作業終了時間': r.workEndTime,
        '休憩時間(分)': r.breakTime,
        '作業時間(形式)': minutesToDisplayString(r.workDuration),
        '実働時間数(十進数)': parseFloat(workDurationHrs),
        '作業区分': r.category,
        '作業詳細内容': r.content,
        'ステータス': r.status,
        '承認管理者': r.processedBy,
        '承認日時': r.processedAt
      };
    });

    try {
      const ws = XLSX.utils.json_to_sheet(exportData);

      const wscols = [
        { wch: 6 },  // No
        { wch: 12 }, // 日付
        { wch: 14 }, // 氏名
        { wch: 10 }, // 帰庫
        { wch: 14 }, // 開始
        { wch: 14 }, // 終了
        { wch: 14 }, // 休憩
        { wch: 16 }, // 作業時間形式
        { wch: 18 }, // 実働時間数
        { wch: 14 }, // 区分
        { wch: 40 }, // 詳細内容
        { wch: 16 }, // ステータス
        { wch: 14 }, // 管理者
        { wch: 18 }  // 承認日時
      ];
      ws['!cols'] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "作業日報一覧");

      const fileName = `帰庫後作業日報_勤怠抽出_${filterMonth || '全期間'}_${filterDriver === 'all' ? '全員' : filterDriver}.xlsx`;
      XLSX.writeFile(wb, fileName);
      showToast('Excelファイルをダウンロードしました。', 'success');
    } catch (e) {
      console.error('Excel出力エラー', e);
      showToast('Excelファイルの作成に失敗しました。', 'error');
    }
  });


  // --- 10. 初期化実行 ---
  userSimulator.addEventListener('change', handleRoleChange);
  initDB();
  handleRoleChange();
});
