// 全局数据对象
let myData = {
    incomes: [],      // 存收入记录: {id, date, desc, amount}
    investments: []   // 存投资项目: {id, name, principal, currentReturn, lastUpdate}
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 1. 导航栏切换逻辑 (保留之前的)
    setupNavigation();
    
    // 2. 加载数据
    loadData();

    // 3. 设置日期筛选器默认为当前月份
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // "2023-10"
    const monthFilter = document.getElementById('income-month-filter');
    if(monthFilter) {
        monthFilter.value = currentMonth;
        monthFilter.addEventListener('change', renderIncomeList); // 监听月份变化
    }

    // 4. 渲染页面
    updateUI();
});

// --- 基础功能函数 ---

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabs = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));
            const clickedNav = e.target.closest('.nav-item');
            clickedNav.classList.add('active');
            const targetId = clickedNav.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// 读取本地存储
function loadData() {
    const stored = localStorage.getItem('myTrackerData');
    if (stored) {
        myData = JSON.parse(stored);
    }
}

// 保存到本地存储
function saveData() {
    localStorage.setItem('myTrackerData', JSON.stringify(myData));
    updateUI(); // 保存后刷新界面
}

// 刷新所有界面数据
function updateUI() {
    renderIncomeList();
    renderInvestList();
    updateAssetCard();
    updateSelectOptions();
}

// --- 收入模块逻辑 ---

function saveIncome() {
    const date = document.getElementById('income-date').value;
    const desc = document.getElementById('income-desc').value;
    const amount = parseFloat(document.getElementById('income-amount').value);

    if (!date || !amount) { alert('请填写完整'); return; }

    myData.incomes.push({
        id: Date.now(),
        date: date,
        desc: desc || '收入',
        amount: amount
    });

    saveData();
    closeModal('modal-income');
    // 清空表单
    document.getElementById('income-desc').value = '';
    document.getElementById('income-amount').value = '';
}

function renderIncomeList() {
    const listEl = document.getElementById('income-list');
    const filterValue = document.getElementById('income-month-filter').value; // "2023-10"
    
    listEl.innerHTML = ''; // 清空
    
    // 筛选并排序（按日期倒序）
    const filtered = myData.incomes.filter(item => item.date.startsWith(filterValue));
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    let monthTotal = 0;

    filtered.forEach(item => {
        monthTotal += item.amount;
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="list-left">
                <span class="list-main-text">${item.desc}</span>
                <span class="list-sub-text">${item.date}</span>
            </div>
            <div class="list-right">
                <span class="money-plus">+${item.amount.toFixed(2)}</span>
            </div>
        `;
        listEl.appendChild(li);
    });

    // 更新卡片上的“本月收入”
    document.getElementById('disp-month-income').textContent = `¥${monthTotal.toFixed(2)}`;
}

// --- 投资模块逻辑 ---

// 1. 增加投资 (新建 或 追加)
function toggleNewInvestInput() {
    const select = document.getElementById('invest-select-add');
    const newNameGroup = document.getElementById('group-new-invest-name');
    // 如果选的是 value="new"，显示输入框，否则隐藏
    if (select.value === 'new') {
        newNameGroup.style.display = 'block';
    } else {
        newNameGroup.style.display = 'none';
    }
}

function saveInvestAdd() {
    const date = document.getElementById('invest-add-date').value;
    const select = document.getElementById('invest-select-add');
    const amount = parseFloat(document.getElementById('invest-add-amount').value);

    if (!date || !amount) { alert('请填写完整'); return; }

    if (select.value === 'new') {
        // 新建项目
        const name = document.getElementById('invest-new-name').value;
        if (!name) { alert('请输入新项目名称'); return; }
        
        myData.investments.push({
            id: Date.now(),
            name: name,
            principal: amount, // 本金
            currentReturn: 0,  // 初始收益为0
            lastUpdate: date
        });
    } else {
        // 追加已有项目
        const id = parseInt(select.value);
        const invest = myData.investments.find(i => i.id === id);
        if (invest) {
            invest.principal += amount;
            invest.lastUpdate = date;
        }
    }

    saveData();
    closeModal('modal-invest-add');
    document.getElementById('invest-add-amount').value = '';
    document.getElementById('invest-new-name').value = '';
}

// 2. 更新收益
function saveInvestReturn() {
    const select = document.getElementById('invest-select-return');
    const amount = parseFloat(document.getElementById('invest-return-amount').value); // 总收益数值
    const date = document.getElementById('invest-return-date').value;

    if (!select.value || isNaN(amount) || !date) { alert('请填写完整'); return; }

    const id = parseInt(select.value);
    const invest = myData.investments.find(i => i.id === id);
    if (invest) {
        invest.currentReturn = amount; // 直接更新为输入的总收益
        invest.lastUpdate = date;
    }

    saveData();
    closeModal('modal-invest-return');
    document.getElementById('invest-return-amount').value = '';
}

function renderInvestList() {
    const listEl = document.getElementById('invest-list');
    listEl.innerHTML = '';

    let totalPrincipal = 0;
    let totalReturn = 0;

    myData.investments.forEach(item => {
        totalPrincipal += item.principal;
        totalReturn += item.currentReturn;

        const li = document.createElement('li');
        // 根据正负判断颜色
        const returnClass = item.currentReturn >= 0 ? 'money-plus' : 'money-loss';
        const returnSign = item.currentReturn >= 0 ? '+' : '';

        li.innerHTML = `
            <div class="list-left">
                <span class="list-main-text">${item.name}</span>
                <span class="list-sub-text">本金: ¥${item.principal.toFixed(2)}</span>
            </div>
            <div class="list-right">
                <div class="${returnClass}">${returnSign}${item.currentReturn.toFixed(2)}</div>
                <div class="list-sub-text">收益</div>
            </div>
        `;
        listEl.appendChild(li);
    });

    // 更新卡片数据
    document.getElementById('disp-invest-principal').textContent = `¥${totalPrincipal.toFixed(2)}`;
    const returnEl = document.getElementById('disp-invest-return');
    returnEl.textContent = `¥${totalReturn.toFixed(2)}`;
    returnEl.className = `value ${totalReturn >= 0 ? 'money-plus' : 'money-loss'}`;
}

// 辅助：更新下拉菜单选项
function updateSelectOptions() {
    const addSelect = document.getElementById('invest-select-add');
    const returnSelect = document.getElementById('invest-select-return');
    
    // 清空现有选项（保留 addSelect 的第一个 '新建'）
    addSelect.innerHTML = '<option value="new">+ 新建项目...</option>';
    returnSelect.innerHTML = '<option disabled selected>请选择...</option>';

    myData.investments.forEach(item => {
        // 为“追加投资”添加选项
        const opt1 = document.createElement('option');
        opt1.value = item.id;
        opt1.textContent = item.name;
        addSelect.appendChild(opt1);

        // 为“记收益”添加选项
        const opt2 = document.createElement('option');
        opt2.value = item.id;
        opt2.textContent = item.name;
        returnSelect.appendChild(opt2);
    });
}

function updateAssetCard() {
    // 已经在 renderList 里面顺便更新了，这里预留
}

// --- 弹窗通用控制 ---
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
    // 自动填充今天日期
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll(`#${modalId} input[type="date"]`);
    dateInputs.forEach(input => input.value = today);
    
    // 如果是增加投资，重置新建输入框显示状态
    if(modalId === 'modal-invest-add') {
        document.getElementById('invest-select-add').value = 'new';
        toggleNewInvestInput();
    }
}

window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}
