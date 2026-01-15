document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const tabs = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); // 防止链接跳转

            // 1. 移除所有激活状态
            navItems.forEach(nav => nav.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));

            // 2. 激活当前点击的按钮
            // 处理点击图标或文字时冒泡的问题，确保获取到 .nav-item
            const clickedNav = e.target.closest('.nav-item');
            clickedNav.classList.add('active');

            // 3. 显示对应的页面内容
            const targetId = clickedNav.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
});