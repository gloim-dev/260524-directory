document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. 마스터 데이터 아카이빙 & localStorage 데이터 싱크 커널
     ========================================================================== */
  // 사용자가 등록한 커스텀 링크가 없는 경우 뿌려줄 공장 출고 기본형 데이터베이스
  const FACTORY_DEFAULT_STORE = {
    quickAccess: [
      { id: 'quick-01', name: '다음메일', desc: '사내 주요 메일함 수신 확인', url: 'https://mail.daum.net', icon: 'ph-envelope' },
      { id: 'quick-02', name: '구글챗', desc: '팀원 간 실시간 업무 커뮤니케이션 채널', url: 'https://chat.google.com', icon: 'ph-chat-circle' },
      { id: 'quick-03', name: '글독스', desc: '통합 프로젝트 및 아카이브 문서 공간', url: 'https://docs.google.com/spreadsheets', icon: 'ph-table' },
      { id: 'quick-04', name: '오늘계획', desc: '일일 스케줄 테이블', url: 'https://docs.google.com', icon: 'ph-file-text' },
      { id: 'quick-05', name: '구글 캘린더', desc: '사내 스케줄링 관리 테이블', url: 'https://calendar.google.com', icon: 'ph-calendar-blank' }
    ],
    marketing: [
      { id: 'mark-01', name: 'Google Analytics 4', desc: '클라이언트 웹사이트 로그 분석 및 데이터 트래킹', url: 'https://analytics.google.com', icon: 'ph-trend-up', tags: ['Google', 'Analytics'] },
      { id: 'mark-02', name: 'Search Console', desc: '색인 생성 여부 확인 및 기술 SEO 퍼포먼스 모니터링', url: 'https://search.google.com/search-console', icon: 'ph-google-chrome-logo', tags: ['SEO', 'Console'] },
      { id: 'mark-03', name: '제미나이 (Gemini)', desc: '구글 LLM 기반 고성능 콘텐츠 생성 및 코드 분석 가젯', url: 'https://gemini.google.com', icon: 'ph-sparkle', tags: ['AI', 'Marketing'] },
      { id: 'mark-04', name: '챗GPT (ChatGPT)', desc: 'OpenAI 기반 대화형 업무 보조 및 프롬프트 기획 툴', url: 'https://chatgpt.com', icon: 'ph-cpu', tags: ['AI', 'Workspace'] }
    ],
    designDev: [
      { id: 'des-01', name: 'Framer', desc: '인터랙티브 웹 디자인 프로토타이핑 및 프로덕션', url: 'https://www.framer.com', icon: 'ph-framer-logo', tags: ['Design', 'Interaction'] },
      { id: 'des-02', name: 'Figma', desc: 'UI/UX 협업 프로토타이핑 설계 및 전사 컴포넌트 에셋 허브', url: 'https://www.figma.com', icon: 'ph-paint-brush', tags: ['UIUX', 'Asset'] },
      { id: 'des-03', name: 'Envato Elements', desc: '고감도 유료 테마, 그래픽 리소스, 웹 템플릿 마켓플레이스', url: 'https://elements.envato.com', icon: 'ph-shopping-bag', tags: ['Resource', 'Market'] }
    ],
    operation: [
      { id: 'oper-01', name: '인트라넷', desc: '사내 공지사항 및 업무 매뉴얼 아카이빙 룸', url: '#', icon: 'ph-file-text', tags: ['Internal', 'Daily'] }
    ]
  };

  // 브라우저 내부 저장소로부터 사용자 개인화 서비스 어레이 연동
  let directoryMasterStore = JSON.parse(localStorage.getItem('gloim_dashboard_services'));
  if (!directoryMasterStore) {
    directoryMasterStore = { ...FACTORY_DEFAULT_STORE };
  }

  // 서비스 영구 백업 디스크 직렬화 트랜잭션 함수
  function saveToLocalStorage() {
    localStorage.setItem('gloim_dashboard_services', JSON.stringify(directoryMasterStore));
  }


  /* ==========================================================================
     2. 고도화 대시보드 엔지니어링 (동적 아코디언 카드 렌더링 엔진)
     ========================================================================== */
  let globalEditingFlag = false;
  let currentTargetCategory = 'quickAccess'; 
  let selectedModalIconClass = 'ph-link';

  function renderAllSections() {
    const mappings = [
      { id: 'quick-service-container', key: 'quickAccess', class: 'quick-card' },
      { id: 'marketing-service-container', key: 'marketing', class: 'link-card' },
      { id: 'designdev-service-container', key: 'designDev', class: 'link-card' },
      { id: 'operation-service-container', key: 'operation', class: 'link-card' }
    ];

    mappings.forEach(map => {
      const container = document.getElementById(map.id);
      if(!container) return;
      container.innerHTML = '';
      
      // 실제 등록된 아이템 동적 노드 빌드업
      directoryMasterStore[map.key].forEach(service => {
        container.appendChild(createCardNode(service, map.key, map.class));
      });
      
      // 편집모드 진입 시에 노출되는 [+] 플레이스 홀더 노드 결합
      container.appendChild(createPlaceholderNode(map.key, map.class));
    });
  }

  function createCardNode(service, categoryKey, className) {
    const cardWrapper = document.createElement('div');
    cardWrapper.className = className;
    
    if (!globalEditingFlag) {
      cardWrapper.onclick = () => window.open(service.url, '_blank');
    }

    const tagsHtml = service.tags && service.tags.length > 0 ? `
      <div class="card-tags">
        ${service.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    ` : '';

    // 🔴 핏 마감 보정: 오버플로우 가이드라인 및 삭제 포지션 마운트
    cardWrapper.innerHTML = `
      <div class="card-glow"></div>
      <div class="card-inline-delete-btn" title="서비스 삭제">
        <i class="ph ph-minus-bold"></i>
      </div>
      ${className === 'link-card' ? `
        <div class="card-header">
          <i class="ph ${service.icon} card-icon"></i>
          <i class="ph ph-arrow-square-out link-arrow"></i>
        </div>
        <div class="card-body">
          <h3>${service.name}</h3>
          <p>${service.desc}</p>
        </div>
        ${tagsHtml}
      ` : `
        <div class="quick-icon"><i class="ph ${service.icon}"></i></div>
        <div class="quick-info">
          <h3>${service.name}</h3>
          <p>${service.desc}</p>
        </div>
      `}
    `;

    // 인라인 삭제 이벤트 바인딩 (이벤트 버블링 차단 필수)
    cardWrapper.querySelector('.card-inline-delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      eraseCustomService(categoryKey, service.id);
    });
    
    cardWrapper.addEventListener('mousemove', handleCardGlowEngine);
    return cardWrapper;
  }

  function createPlaceholderNode(categoryKey, className) {
    const addPlaceholderNode = document.createElement('div');
    addPlaceholderNode.className = `${className} add-card-placeholder`;
    addPlaceholderNode.innerHTML = `<i class="ph ph-plus-circle-bold"></i> 서비스 추가`;
    
    addPlaceholderNode.addEventListener('click', (e) => {
      e.stopPropagation(); 
      openServiceModal(categoryKey);
    });
    return addPlaceholderNode;
  }


  /* ==========================================================================
     3. 인터랙션 및 시스템 제어 허브 (아코디언 및 편집 컴파일)
     ========================================================================== */
  // 🛠️ v4.1 신규 스펙: 코어 아코디언 토글 라우터 구현
  window.toggleSectionAccordion = function(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if(!targetSection) return;
    
    const caretIcon = targetSection.querySelector('.accordion-toggle-icon');
    targetSection.classList.toggle('is-collapsed');
    
    if(targetSection.classList.contains('is-collapsed')) {
      if(caretIcon) caretIcon.className = 'ph ph-caret-right accordion-toggle-icon';
    } else {
      if(caretIcon) caretIcon.className = 'ph ph-caret-down accordion-toggle-icon';
    }
  };

  // 사이드바 전용 앵커 스크롤 제어 매핑 함수 고도화
  window.scrollToSection = function(id) {
    const element = document.getElementById(id);
    if(element) {
      // 🛠️ 예외 보정: 접혀있는 상태에서 네비게이션 클릭 시 자동 개방 피드백
      if(element.classList.contains('is-collapsed')) {
        window.toggleSectionAccordion(id);
      }
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 서비스 커스텀 제거 매니저
  function eraseCustomService(categoryKey, id) {
    directoryMasterStore[categoryKey] = directoryMasterStore[categoryKey].filter(s => s.id !== id);
    saveToLocalStorage();
    renderAllSections();
  }

  // 개인화 커스텀 모드 토글 스위치 인터페이스 
  window.togglePersonalizationMode = function() {
    globalEditingFlag = !globalEditingFlag;
    const scrollHub = document.getElementById('directory-scroll-hub');
    const toggleBtn = document.getElementById('edit-mode-toggle-trigger');

    if (globalEditingFlag) {
      scrollHub.classList.add('is-editing-mode');
      toggleBtn.classList.add('editing-active');
      toggleBtn.querySelector('span').innerText = '편집 완료';
      
      // 편집모드 진입 시 시인성 보장을 위해 닫힌 아코디언 폴더를 자동 일제 개방
      document.querySelectorAll('.directory-section.is-collapsed').forEach(section => {
        window.toggleSectionAccordion(section.id);
      });
    } else {
      scrollHub.classList.remove('is-editing-mode');
      toggleBtn.classList.remove('editing-active');
      toggleBtn.querySelector('span').innerText = '서비스 편집';
    }
    renderAllSections();
  };

  // 시스템 인프라 등록 모달 통제
  function openServiceModal(categoryKey) {
    currentTargetCategory = categoryKey;
    const tagFormGroup = document.getElementById('modal-tag-input-group');
    if (categoryKey === 'quickAccess') {
      if(tagFormGroup) tagFormGroup.style.display = 'none';
    } else {
      if(tagFormGroup) tagFormGroup.style.display = 'flex';
    }
    document.getElementById('service-modal').style.display = 'flex';
  }

  window.closeServiceModal = function() {
    document.getElementById('service-modal').style.display = 'none';
    document.getElementById('modal-input-name').value = '';
    document.getElementById('modal-input-desc').value = '';
    document.getElementById('modal-input-url').value = 'https://';
    document.getElementById('modal-input-tags').value = ''; 
  };

  // 아이콘 셀렉터 전용 바인딩
  window.selectModalIcon = function(element, iconClass) {
    document.querySelectorAll('.icon-opt').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    selectedModalIconClass = iconClass;
  };

  // 🏷️ v3.7 스펙: 다중 콤마 스플릿 형태의 동적 커스텀 태그 파싱 모듈 결합
  window.commitCustomService = function() {
    const nameVal = document.getElementById('modal-input-name').value.trim();
    const descVal = document.getElementById('modal-input-desc').value.trim();
    const urlVal = document.getElementById('modal-input-url').value.trim();
    const rawTags = document.getElementById('modal-input-tags').value.trim();

    if (!nameVal) {
      alert('서비스 명칭은 필수 입력 대상입니다.');
      return;
    }

    let parsedTagsArray = [];
    if (currentTargetCategory !== 'quickAccess') {
      if (rawTags) {
        // 공백 제거 후 쉼표 기반 정밀 정렬 추출 어레이화
        parsedTagsArray = rawTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else {
        parsedTagsArray = ['Custom']; 
      }
    }

    const newServiceObj = {
      id: 'cust-' + Date.now(),
      name: nameVal,
      desc: descVal || '사용자 등록 지정 링크',
      url: urlVal,
      icon: selectedModalIconClass,
      tags: parsedTagsArray
    };

    directoryMasterStore[currentTargetCategory].push(newServiceObj);
    saveToLocalStorage();
    window.closeServiceModal();
    renderAllSections();
  };

  // 마우스 반응형 글로우 물리 연산 커널
  function handleCardGlowEngine(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const computedX = e.clientX - rect.left;
    const computedY = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${computedX}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${computedY}px`);
  }


  /* ==========================================================================
     4. 실시간 메모 모듈 (완벽 원복 스펙 및 로컬스토리지 싱크 연동)
     ========================================================================== */
  let memoDataStore = JSON.parse(localStorage.getItem('gloim_dashboard_memos'));
  if (!memoDataStore) {
    memoDataStore = [
      { id: 1, text: "오후 3시 마이그레이션 자동화 툴 설명회 세션 참석", completed: false },
      { id: 2, text: "Elementor 단층 컨테이너 적용 가이드북 확인 필", completed: true }
    ];
  }

  function saveMemosToStorage() {
    localStorage.setItem('gloim_dashboard_memos', JSON.stringify(memoDataStore));
  }

  window.handleMemoKeydown = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      pushLiveMemo();
    }
  };

  function renderLiveMemos() {
    const targetContainer = document.getElementById('memo-render-target');
    if(!targetContainer) return;
    targetContainer.innerHTML = '';

    if (memoDataStore.length === 0) {
      targetContainer.innerHTML = `<div class="memo-text-content" style="text-align:center; color: var(--text-muted); padding:16px 0;">등록된 실시간 태스크가 없습니다.</div>`;
      return;
    }

    memoDataStore.forEach(memo => {
      const item = document.createElement('div');
      item.className = `memo-item ${memo.completed ? 'completed' : ''}`;
      const checkIcon = memo.completed ? 'ph-check-square-fill' : 'ph-square';

      item.innerHTML = `
        <div class="memo-left-block">
          <i class="ph ${checkIcon} memo-checkbox"></i>
          <div>
            <p class="memo-text-content">${memo.text}</p>
          </div>
        </div>
        <div class="memo-action-btns">
          <button class="memo-del-btn" title="완전 삭제">
            <i class="ph ph-trash"></i>
          </button>
        </div>
      `;

      // 토글 완료 스위치 이벤트 핸들러 바인딩
      item.querySelector('.memo-checkbox').addEventListener('click', () => toggleMemoStatus(memo.id));
      // 메모 삭제 이벤트 바인딩
      item.querySelector('.memo-del-btn').addEventListener('click', () => eraseLiveMemo(memo.id));

      targetContainer.appendChild(item);
    });
  }

  function pushLiveMemo() {
    const textarea = document.getElementById('memo-textarea-field');
    const textVal = textarea.value.trim();
    if (!textVal) return;

    const newMemoNode = { id: Date.now(), text: textVal, completed: false };
    memoDataStore.unshift(newMemoNode);
    textarea.value = '';
    
    saveMemosToStorage();
    renderLiveMemos();
  }
  window.pushLiveMemo = pushLiveMemo; // 인라인 마크업 호출 대비 바인딩

  function toggleMemoStatus(id) {
    memoDataStore = memoDataStore.map(memo => {
      if (memo.id === id) return { ...memo, completed: !memo.completed };
      return memo;
    });
    saveMemosToStorage();
    renderLiveMemos();
  }

  function eraseLiveMemo(id) {
    memoDataStore = memoDataStore.filter(memo => memo.id !== id);
    saveMemosToStorage();
    renderLiveMemos();
  }


  /* ==========================================================================
     5. 📆 하이엔드 통합 캘린더 엔진 (일자/요일/시간 실시간 트래커)
     ========================================================================== */
  function runSystemClock() {
    const dateTarget = document.getElementById('live-date');
    const clockTarget = document.getElementById('live-clock');
    if (!clockTarget || !dateTarget) return;

    const d = new Date();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const dayOfWeek = dayNames[d.getDay()];
    
    // 탑바 인포메이션 보드 데이터 맵 체이닝
    dateTarget.innerText = `${month}월 ${date}일(${dayOfWeek})`;

    let hr = d.getHours();
    const min = String(d.getMinutes()).padStart(2, '0');
    const sec = String(d.getSeconds()).padStart(2, '0');
    const amOrPm = hr >= 12 ? 'PM' : 'AM';

    hr = hr % 12 || 12;
    const formattedHr = String(hr).padStart(2, '0');
    clockTarget.innerText = `${formattedHr}:${min}:${sec} ${amOrPm}`;
  }


  /* ==========================================================================
     6. 전역 실시간 검색 엔진 & 테마 스위처 시스템 (공유 보정 업데이트)
     ========================================================================== */
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.link-card:not(.add-card-placeholder), .quick-card:not(.add-card-placeholder)');
      
      // 🛠️ 검색 행동 포착 시 유저 검색 편의를 위해 아코디언 접힘을 전역 우회 자동개방
      if (keyword.length > 0) {
        document.querySelectorAll('.directory-section.is-collapsed').forEach(section => {
          window.toggleSectionAccordion(section.id);
        });
      }
      
      cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const desc = card.querySelector('p').textContent.toLowerCase();
        const tags = card.querySelector('.card-tags') ? Array.from(card.querySelectorAll('.tag')).map(t => t.textContent.toLowerCase()) : [];
        const hasTag = tags.some(tag => tag.includes(keyword));

        if (title.includes(keyword) || desc.includes(keyword) || hasTag) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  }

  // 🛠️ [동적 유지 수정]: 스위칭 연산 시 로컬 스토리지 데이터 동시 보존 트리거 결합
  window.toggleSystemTheme = function() {
    const bodyNode = document.body;
    const themeBtn = document.getElementById('theme-toggle-btn');
    const currentTheme = bodyNode.getAttribute('data-theme') || 'light';

    themeBtn.innerHTML = ''; 
    const iconNode = document.createElement('i');

    if (currentTheme === 'dark') {
      bodyNode.setAttribute('data-theme', 'light');
      localStorage.setItem('gloim_theme', 'light'); // 개인달력 페이지 공유용 키 싱크 마운트
      iconNode.className = 'ph ph-moon';
    } else {
      bodyNode.setAttribute('data-theme', 'dark');
      localStorage.setItem('gloim_theme', 'dark');  // 개인달력 페이지 공유용 키 싱크 마운트
      iconNode.className = 'ph ph-sun';
    }
    
    themeBtn.appendChild(iconNode);

    if (window.PhosphorIcons && typeof window.PhosphorIcons.render === 'function') {
      window.PhosphorIcons.render();
    }
  };


  /* ==========================================================================
     7. 시스템 이니셜라이저 (최초 구동 프로세스 및 스토리지 테마 파싱)
     ========================================================================== */
  // 🛠️ [동적 유지 수정]: 페이지 진입 시 스토리지에 저장되어 있는 최신 글로벌 테마 상태 강제 복원
  const storedTheme = localStorage.getItem('gloim_theme') || 'light';
  document.body.setAttribute('data-theme', storedTheme);
  
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    // 테마 상태에 맞는 알맞은 아이콘으로 첫 사이클 렌더링 동기화
    themeBtn.innerHTML = storedTheme === 'dark' ? `<i class="ph ph-sun"></i>` : `<i class="ph ph-moon"></i>`;
  }

  setInterval(runSystemClock, 1000);
  runSystemClock();     // 지연 없는 초기 1사이클 드라이브
  renderAllSections();  // 마스터 카드 빌드
  renderLiveMemos();   // 개인 태스크 퀵 메모 로드
});