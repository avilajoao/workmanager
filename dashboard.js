// Função para carregar todos os dados do dashboard
async function loadDashboardData() {
    try {
        // Carregar os diferentes tipos de dados
        await Promise.all([
            loadMetricsData(),
            loadProjectsChartData(),
            loadBudgetChartData(),
            loadRecentProjects()
        ]);
        
        // Atualizar a data atual
        updateCurrentDate();
        
        console.log('Dashboard data loaded successfully');
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showErrorNotification('Não foi possível carregar os dados do dashboard');
    }
}

// Função para carregar os dados dos cards de métricas
async function loadMetricsData() {
    try {
        // Fazer requisição para a API
        const response = await fetch('/api/metrics');
        
        if (!response.ok) {
            throw new Error('Failed to fetch metrics data');
        }
        
        const data = await response.json();
        
        // Atualizar os valores nos cards
        document.getElementById('active-projects-count').textContent = data.activeProjects.count;
        document.getElementById('active-projects-trend').textContent = `${data.activeProjects.trend}%`;
        
        // Definir a classe de tendência (positiva ou negativa)
        const projectsTrendElement = document.getElementById('active-projects-trend-icon');
        if (data.activeProjects.trend >= 0) {
            projectsTrendElement.classList.remove('ph-trend-down', 'text-red-500');
            projectsTrendElement.classList.add('ph-trend-up', 'text-green-500');
        } else {
            projectsTrendElement.classList.remove('ph-trend-up', 'text-green-500');
            projectsTrendElement.classList.add('ph-trend-down', 'text-red-500');
        }
        
        // Repetir para os outros cards
        document.getElementById('total-budget').textContent = formatCurrency(data.totalBudget.amount);
        document.getElementById('total-budget-trend').textContent = `${data.totalBudget.trend}%`;
        
        document.getElementById('pending-tasks').textContent = data.pendingTasks.count;
        document.getElementById('pending-tasks-trend').textContent = `${data.pendingTasks.trend}%`;
        
        document.getElementById('active-teams').textContent = data.activeTeams.count;
        document.getElementById('active-teams-trend').textContent = `${data.activeTeams.trend}%`;
        
        // Atualizar os ícones de tendência para os outros cards também
        updateTrendIcon('total-budget-trend-icon', data.totalBudget.trend);
        updateTrendIcon('pending-tasks-trend-icon', data.pendingTasks.trend);
        updateTrendIcon('active-teams-trend-icon', data.activeTeams.trend);
        
    } catch (error) {
        console.error('Error loading metrics:', error);
        throw error;
    }
}

// Função para atualizar o ícone de tendência
function updateTrendIcon(elementId, trendValue) {
    const element = document.getElementById(elementId);
    if (trendValue >= 0) {
        element.classList.remove('ph-trend-down', 'text-red-500');
        element.classList.add('ph-trend-up', 'text-green-500');
    } else {
        element.classList.remove('ph-trend-up', 'text-green-500');
        element.classList.add('ph-trend-down', 'text-red-500');
    }
}

// Função para carregar os dados do gráfico de projetos
async function loadProjectsChartData() {
    try {
        const response = await fetch('/api/projects/progress');
        
        if (!response.ok) {
            throw new Error('Failed to fetch projects chart data');
        }
        
        const data = await response.json();
        
        // Configurar o gráfico com os dados recebidos
        const ctx = document.getElementById('projectsChart').getContext('2d');
        
        // Destruir o gráfico existente se houver
        if (window.projectsChart) {
            window.projectsChart.destroy();
        }
        
        // Criar novo gráfico
        window.projectsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Progresso (%)',
                    data: data.values,
                    backgroundColor: '#8B5CF6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: '#292929'
                        },
                        ticks: {
                            color: '#A1A1A1'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#A1A1A1'
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error loading projects chart:', error);
        throw error;
    }
}

// Função para carregar os dados do gráfico de orçamento
async function loadBudgetChartData() {
    try {
        const response = await fetch('/api/budget/comparison');
        
        if (!response.ok) {
            throw new Error('Failed to fetch budget chart data');
        }
        
        const data = await response.json();
        
        // Configurar o gráfico com os dados recebidos
        const ctx = document.getElementById('budgetChart').getContext('2d');
        
        // Destruir o gráfico existente se houver
        if (window.budgetChart) {
            window.budgetChart.destroy();
        }
        
        // Criar novo gráfico
        window.budgetChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.months,
                datasets: [
                    {
                        label: 'Orçado',
                        data: data.planned,
                        borderColor: '#8B5CF6',
                        backgroundColor: 'transparent',
                        tension: 0.4
                    },
                    {
                        label: 'Realizado',
                        data: data.actual,
                        borderColor: '#10B981',
                        backgroundColor: 'transparent',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#A1A1A1'
                        }
                    }
                },
                scales: {
                    y: {
                        grid: {
                            color: '#292929'
                        },
                        ticks: {
                            color: '#A1A1A1',
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#A1A1A1'
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error loading budget chart:', error);
        throw error;
    }
}

// Função para carregar os projetos recentes
async function loadRecentProjects() {
    try {
        const response = await fetch('/api/projects/recent');
        
        if (!response.ok) {
            throw new Error('Failed to fetch recent projects');
        }
        
        const projects = await response.json();
        
        // Obter a referência para o corpo da tabela
        const tableBody = document.getElementById('recent-projects-table');
        tableBody.innerHTML = ''; // Limpar conteúdo existente
        
        // Adicionar cada projeto à tabela
        projects.forEach(project => {
            // Determinar a classe de status
            let statusClass = '';
            switch (project.status.toLowerCase()) {
                case 'em andamento':
                    statusClass = 'bg-green-500/20 text-green-500';
                    break;
                case 'planejamento':
                    statusClass = 'bg-yellow-500/20 text-yellow-500';
                    break;
                case 'atrasado':
                    statusClass = 'bg-red-500/20 text-red-500';
                    break;
                case 'concluído':
                    statusClass = 'bg-blue-500/20 text-blue-500';
                    break;
                default:
                    statusClass = 'bg-gray-500/20 text-gray-500';
            }
            
            // Determinar o ícone com base no tipo de projeto
            let iconClass = '';
            switch (project.type) {
                case 'building':
                    iconClass = 'ph-buildings text-blue-500';
                    break;
                case 'house':
                    iconClass = 'ph-house-line text-purple-500';
                    break;
                case 'commercial':
                    iconClass = 'ph-storefront text-red-500';
                    break;
                default:
                    iconClass = 'ph-buildings text-gray-500';
            }
            
            // Criar a linha da tabela
            const row = document.createElement('tr');
            row.className = 'border-b border-darkBorder';
            row.innerHTML = `
                <td class="py-4">
                    <div class="flex items-center">
                        <div class="bg-${iconClass.split(' ')[1].replace('text-', '')}/20 p-2 rounded mr-3">
                            <i class="${iconClass}"></i>
                        </div>
                        <span>${project.name}</span>
                    </div>
                </td>
                <td class="py-4">${project.client}</td>
                <td class="py-4">
                    <span class="px-2 py-1 ${statusClass} rounded text-xs">${project.status}</span>
                </td>
                <td class="py-4">
                    <div class="w-full bg-darkBorder rounded-full h-2">
                        <div class="bg-primary h-2 rounded-full" style="width: ${project.progress}%"></div>
                    </div>
                </td>
                <td class="py-4">${project.deadline}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading recent projects:', error);
        throw error;
    }
}

// Função para atualizar a data atual
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    
    // Formatar a data em português do Brasil
    const formattedDate = today.toLocaleDateString('pt-BR', options);
    
    // Capitalizar a primeira letra
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    dateElement.textContent = capitalizedDate;
}

// Função para formatar valores monetários
function formatCurrency(value) {
    return 'R$ ' + value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Função para mostrar notificação de erro
function showErrorNotification(message) {
    // Implementação básica - pode ser substituída por uma biblioteca de notificações
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Carregar dados quando a página for carregada
document.addEventListener('DOMContentLoaded', loadDashboardData);

// Recarregar dados a cada 5 minutos
setInterval(loadDashboardData, 5 * 60 * 1000);
