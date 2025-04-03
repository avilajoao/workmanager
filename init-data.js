// init-data.js - Inicialização de dados de exemplo para desenvolvimento

document.addEventListener('DOMContentLoaded', () => {
    // Verificar se já existem dados de exemplo
    if (!localStorage.getItem('dataInitialized')) {
        console.log('Inicializando dados de exemplo...');
        
        // Projetos de exemplo
        const sampleProjects = [
            {
                id: '1',
                name: 'Residencial Vila Verde',
                description: 'Condomínio residencial com 24 unidades e área de lazer completa.',
                status: 'in-progress',
                createdAt: '2023-03-15T10:00:00Z'
            },
            {
                id: '2',
                name: 'Edifício Comercial Centro',
                description: 'Prédio comercial com 12 andares e estacionamento subterrâneo.',
                status: 'planning',
                createdAt: '2023-04-20T14:30:00Z'
            },
            {
                id: '3',
                name: 'Reforma Shopping Plaza',
                description: 'Reforma da praça de alimentação e áreas comuns do shopping.',
                status: 'on-hold',
                createdAt: '2023-02-10T09:15:00Z'
            }
        ];
        
        // Tarefas de exemplo
        const sampleTasks = [
            {
                id: '101',
                title: 'Aprovação de plantas',
                description: 'Obter aprovação das plantas junto à prefeitura.',
                projectId: '1',
                status: 'todo',
                priority: 'high',
                dueDate: '2023-05-15T00:00:00Z',
                createdAt: '2023-04-01T08:30:00Z'
            },
            {
                id: '102',
                title: 'Contratação de equipe',
                description: 'Selecionar e contratar equipe de pedreiros e ajudantes.',
                projectId: '1',
                status: 'in-progress',
                priority: 'medium',
                dueDate: '2023-04-25T00:00:00Z',
                createdAt: '2023-04-05T10:15:00Z'
            },
            {
                id: '103',
                title: 'Compra de materiais',
                description: 'Adquirir materiais de construção para a primeira fase.',
                projectId: '1',
                status: 'done',
                priority: 'high',
                dueDate: '2023-04-10T00:00:00Z',
                createdAt: '2023-03-20T14:45:00Z',
                updatedAt: '2023-04-08T16:30:00Z'
            },
            {
                id: '201',
                title: 'Estudo de viabilidade',
                description: 'Realizar estudo de viabilidade econômica do projeto.',
                projectId: '2',
                status: 'todo',
                priority: 'urgent',
                dueDate: '2023-05-05T00:00:00Z',
                createdAt: '2023-04-22T09:00:00Z'
            },
            {
                id: '202',
                title: 'Elaboração de orçamento',
                description: 'Preparar orçamento detalhado para apresentação aos investidores.',
                projectId: '2',
                status: 'in-progress',
                priority: 'high',
                dueDate: '2023-05-10T00:00:00Z',
                createdAt: '2023-04-23T11:20:00Z'
            },
            {
                id: '301',
                title: 'Revisão de cronograma',
                description: 'Revisar cronograma de obras devido à paralisação temporária.',
                projectId: '3',
                status: 'todo',
                priority: 'medium',
                dueDate: '2023-04-30T00:00:00Z',
                createdAt: '2023-04-15T13:10:00Z'
            }
        ];
        
        // Salvar dados no localStorage
        localStorage.setItem('mockProjects', JSON.stringify(sampleProjects));
        localStorage.setItem('mockTasks', JSON.stringify(sampleTasks));
        localStorage.setItem('dataInitialized', 'true');
        
        console.log('Dados de exemplo inicializados com sucesso!');
    }
});
