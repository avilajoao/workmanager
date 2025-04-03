// Gerenciador de tema
const themeManager = {
    // Aplicar tema
    applyTheme(theme) {
        const body = document.body;
        
        if (theme === 'light') {
            body.classList.remove('bg-darkBg', 'text-white');
            body.classList.add('bg-lightBg', 'text-lightText');
            
            document.querySelectorAll('.panel').forEach(panel => {
                panel.classList.remove('bg-darkPanel', 'border-darkBorder');
                panel.classList.add('bg-lightPanel', 'border-lightBorder');
            });
            
            document.querySelectorAll('.sidebar').forEach(sidebar => {
                sidebar.classList.remove('bg-darkPanel', 'border-darkBorder');
                sidebar.classList.add('bg-lightPanel', 'border-lightBorder');
            });
            
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('bg-darkPanel', 'border-darkBorder');
                menu.classList.add('bg-lightPanel', 'border-lightBorder');
            });
            
            // Atualizar ícone do botão de tema
            const themeToggle = document.getElementById('toggleDarkMode');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="ph ph-sun"></i>';
            }
        } else {
            body.classList.remove('bg-lightBg', 'text-lightText');
            body.classList.add('bg-darkBg', 'text-white');
            
            document.querySelectorAll('.panel').forEach(panel => {
                panel.classList.remove('bg-lightPanel', 'border-lightBorder');
                panel.classList.add('bg-darkPanel', 'border-darkBorder');
            });
            
            document.querySelectorAll('.sidebar').forEach(sidebar => {
                sidebar.classList.remove('bg-lightPanel', 'border-lightBorder');
                sidebar.classList.add('bg-darkPanel', 'border-darkBorder');
            });
            
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('bg-lightPanel', 'border-lightBorder');
                menu.classList.add('bg-darkPanel', 'border-darkBorder');
            });
            
            // Atualizar ícone do botão de tema
            const themeToggle = document.getElementById('toggleDarkMode');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="ph ph-moon"></i>';
            }
        }
        
        // Salvar tema no localStorage
        localStorage.setItem('theme', theme);
    },
    
    // Inicializar tema
    initialize() {
        // Carregar tema salvo
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.applyTheme(savedTheme);
        
        // Adicionar evento ao botão de alternar tema
        const themeToggle = document.getElementById('toggleDarkMode');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const newTheme = document.body.classList.contains('bg-darkBg') ? 'light' : 'dark';
                this.applyTheme(newTheme);
            });
        }
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    themeManager.initialize();
});
