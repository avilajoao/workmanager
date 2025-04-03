// sidebar.js - Gerenciamento da barra lateral

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const toggleSidebar = document.getElementById('toggleSidebar');
    
    if (!sidebar || !toggleSidebar) return;
    
    // Carregar estado salvo da sidebar
    const sidebarExpanded = localStorage.getItem('sidebarExpanded') === 'true';
    
    if (sidebarExpanded) {
        sidebar.classList.add('expanded');
        showSidebarLabels();
    }
    
    toggleSidebar.addEventListener('click', () => {
        sidebar.classList.toggle('expanded');
        
        if (sidebar.classList.contains('expanded')) {
            showSidebarLabels();
            localStorage.setItem('sidebarExpanded', 'true');
        } else {
            hideSidebarLabels();
            localStorage.setItem('sidebarExpanded', 'false');
        }
    });
    
    function showSidebarLabels() {
        const labels = sidebar.querySelectorAll('span.hidden');
        labels.forEach(label => {
            label.classList.remove('hidden');
        });
    }
    
    function hideSidebarLabels() {
        const labels = sidebar.querySelectorAll('span');
        labels.forEach(label => {
            label.classList.add('hidden');
        });
    }
});
