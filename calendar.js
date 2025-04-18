// calendar.js - Gerenciamento do calendário

// Variáveis globais
let currentDate = new Date();
let events = [
    {
        "id": 1,
        "nome": "Construção do Prédio A",
        "dataInicio": "2025-04-01",
        "dataFim": "2025-06-30",
        "descricao": "Planejamento da construção do Prédio A."
    },
    {
        "id": 2,
        "nome": "Reforma do Escritório",
        "dataInicio": "2025-05-01",
        "dataFim": "2025-05-15",
        "descricao": "Reforma completa do escritório principal."
    }
];
let currentView = 'month';

// Inicializar o calendário
function initCalendar() {
    console.log('Inicializando calendário');
    
    // Verificar autenticação
    if (!checkAuth()) return;
    
    // Aplicar tema
    if (typeof applyTheme === 'function') {
        applyTheme();
    }
    
    // Atualizar data atual
    updateCurrentDate();
    
    // Carregar eventos
    loadEvents();
    
    // Configurar controles
    setupControls();
    
    // Renderizar calendário
    console.log('Renderizando calendário com eventos:', events);
    renderCalendar();
}

// Verificar autenticação
function checkAuth() {
    if (!window.auth || !window.auth.isAuthenticated()) {
        return false;
    }
    return true;
}

// Carregar eventos
function loadEvents() {
    console.log('Carregando eventos do sistema...');
    events = [
        {
            id: 1,
            title: "Construção do Prédio A",
            startDate: new Date("2025-04-01"),
            endDate: new Date("2025-06-30"),
            type: 'obra',
            description: "Planejamento da construção do Prédio A.",
            color: 'blue'
        },
        {
            id: 2,
            title: "Reforma do Escritório",
            startDate: new Date("2025-05-01"),
            endDate: new Date("2025-05-15"),
            type: 'obra',
            description: "Reforma completa do escritório principal.",
            color: 'blue'
        }
    ];
    console.log('Eventos processados:', events);
    renderCalendar();
}

// Renderizar calendário
function renderCalendar() {
    if (currentView === 'month') {
        renderMonthView();
    } else if (currentView === 'week') {
        renderWeekView();
    } else if (currentView === 'day') {
        renderDayView();
    } else if (currentView === 'agenda') {
        renderAgendaView();
    }
}

// Renderizar visualização mensal
function renderMonthView() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;
    
    // Limpar grid
    calendarGrid.innerHTML = '';
    
    // Obter primeiro dia do mês
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Obter último dia do mês
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Obter dia da semana do primeiro dia (0 = Domingo, 6 = Sábado)
    let firstDayOfWeek = firstDay.getDay();
    
    // Obter dias do mês anterior para preencher a primeira semana
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    
    // Obter filtros ativos
    const showProjects = document.getElementById('showProjects')?.checked || false;
    const showTasks = document.getElementById('showTasks')?.checked || false;
    const showMeetings = document.getElementById('showMeetings')?.checked || false;
    const showDeadlines = document.getElementById('showDeadlines')?.checked || false;
    const showObras = document.getElementById('showObras')?.checked || false;

    // Filtrar eventos
    const filteredEvents = events.filter(event => {
        if (event.type === 'project' && !showProjects) return false;
        if (event.type === 'task' && !showTasks) return false;
        if (event.type === 'meeting' && !showMeetings) return false;
        if (event.type === 'deadline' && !showDeadlines) return false;
        if (event.type === 'obra' && !showObras) return false; // Filtro para obras
        return true;
    });

    console.log('Eventos filtrados:', filteredEvents);
    
    // Criar dias do calendário
    let dayCount = 1;
    let nextMonthDay = 1;
    
    // Criar 6 semanas (linhas)
    for (let row = 0; row < 6; row++) {
        // Criar 7 dias (colunas)
        for (let col = 0; col < 7; col++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day p-1';
            
            // Determinar qual dia mostrar
            if (row === 0 && col < firstDayOfWeek) {
                // Dias do mês anterior
                const prevMonthDay = prevMonthLastDay - (firstDayOfWeek - col - 1);
                dayElement.innerHTML = `<div class="text-xs text-gray-500">${prevMonthDay}</div>`;
                dayElement.classList.add('other-month');
            } else if (dayCount > lastDay.getDate()) {
                // Dias do próximo mês
                dayElement.innerHTML = `<div class="text-xs text-gray-500">${nextMonthDay}</div>`;
                dayElement.classList.add('other-month');
                nextMonthDay++;
            } else {
                // Dias do mês atual
                dayElement.innerHTML = `<div class="text-xs">${dayCount}</div>`;
                
                // Verificar se é hoje
                const today = new Date();
                if (dayCount === today.getDate() && 
                    currentDate.getMonth() === today.getMonth() && 
                    currentDate.getFullYear() === today.getFullYear()) {
                    dayElement.classList.add('today');
                }
                
                // Adicionar eventos do dia
                const currentDateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayCount);
                const dayEvents = filteredEvents.filter(event => {
                    const eventStart = new Date(event.startDate);
                    const eventEnd = new Date(event.endDate);
                    return currentDateObj >= new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate()) && 
                           currentDateObj <= new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
                });

                console.log(`Eventos para ${currentDateObj.toDateString()}:`, dayEvents);
                
                // Adicionar eventos ao dia
                dayEvents.forEach(event => {
                    const eventElement = document.createElement('div');
                    eventElement.className = `calendar-event event-${event.type}`;
                    eventElement.textContent = event.title;
                    eventElement.dataset.eventId = event.id;

                    // Adicionar evento de clique
                    eventElement.addEventListener('click', () => showEventDetails(event));

                    dayElement.appendChild(eventElement);
                });
                
                // Adicionar evento de clique para adicionar novo evento
                dayElement.addEventListener('click', (e) => {
                    // Verificar se o clique foi diretamente no dia, não em um evento
                    if (e.target === dayElement || e.target === dayElement.firstChild) {
                        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayCount);
                        openNewEventModal(clickedDate);
                    }
                });
                
                dayCount++;
            }
            
            calendarGrid.appendChild(dayElement);
        }
    }
}

// Renderizar visualização semanal (simplificada para este exemplo)
function renderWeekView() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;
    
    // Implementação simplificada - apenas uma mensagem
    calendarGrid.innerHTML = `
        <div class="col-span-7 flex items-center justify-center h-full">
            <div class="text-center p-8">
                <i class="ph ph-calendar-blank text-5xl text-grayText mb-4"></i>
                <h3 class="text-xl font-medium mb-2">Visualização Semanal</h3>
                <p class="text-grayText">Esta visualização será implementada em breve.</p>
            </div>
        </div>
    `;
}

// Renderizar visualização diária (simplificada para este exemplo)
function renderDayView() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;
    
    // Implementação simplificada - apenas uma mensagem
    calendarGrid.innerHTML = `
        <div class="col-span-7 flex items-center justify-center h-full">
            <div class="text-center p-8">
                <i class="ph ph-calendar-blank text-5xl text-grayText mb-4"></i>
                <h3 class="text-xl font-medium mb-2">Visualização Diária</h3>
                <p class="text-grayText">Esta visualização será implementada em breve.</p>
            </div>
        </div>
    `;
}

// Renderizar visualização de agenda (simplificada para este exemplo)
function renderAgendaView() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;
    
    // Obter filtros ativos
    const showProjects = document.getElementById('showProjects')?.checked || false;
    const showTasks = document.getElementById('showTasks')?.checked || false;
    const showMeetings = document.getElementById('showMeetings')?.checked || false;
    const showDeadlines = document.getElementById('showDeadlines')?.checked || false;
    const showObras = document.getElementById('showObras')?.checked || false;

    // Filtrar eventos
    const filteredEvents = events.filter(event => {
        if (event.type === 'project' && !showProjects) return false;
        if (event.type === 'task' && !showTasks) return false;
        if (event.type === 'meeting' && !showMeetings) return false;
        if (event.type === 'deadline' && !showDeadlines) return false;
        if (event.type === 'obra' && !showObras) return false; // Filtro para obras
        return true;
    });

    console.log('Eventos filtrados:', filteredEvents);
    
    // Ordenar eventos por data
    const sortedEvents = [...filteredEvents].sort((a, b) => {
        return new Date(a.startDate) - new Date(b.startDate);
    });
    
    // Criar visualização de agenda
    calendarGrid.innerHTML = `
        <div class="col-span-7 overflow-y-auto h-full">
            <div class="p-4">
                <h3 class="text-lg font-medium mb-4">Próximos Eventos</h3>
                <div id="agenda-events" class="space-y-3">
                    ${sortedEvents.length > 0 ? '' : '<p class="text-grayText">Nenhum evento encontrado.</p>'}
                </div>
            </div>
        </div>
    `;
    
    const agendaEvents = document.getElementById('agenda-events');
    if (!agendaEvents) return;
    
    // Adicionar eventos à agenda
    sortedEvents.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = `bg-darkBg border border-darkBorder rounded-lg p-3`;
        
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        
        const formattedStartDate = startDate.toLocaleDateString('pt-BR');
        const formattedStartTime = startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const formattedEndTime = endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        eventElement.innerHTML = `
            <div class="flex items-start">
                <div class="mr-3">
                    <div class="text-sm font-medium">${formattedStartDate}</div>
                    <div class="text-xs text-grayText">${formattedStartTime} - ${formattedEndTime}</div>
                </div>
                <div class="flex-1">
                    <div class="flex items-center">
                        <div class="w-2 h-2 rounded-full bg-${event.color}-500 mr-2"></div>
                        <h4 class="font-medium">${event.title}</h4>
                    </div>
                    <div class="text-sm text-grayText mt-1">${event.description || 'Sem descrição'}</div>
                    <div class="text-xs mt-2 inline-block px-2 py-1 rounded-full event-${event.type}">
                        ${getEventTypeName(event.type)}
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar evento de clique
        eventElement.addEventListener('click', () => showEventDetails(event));
        
        agendaEvents.appendChild(eventElement);
    });
}

// Obter nome do tipo de evento
function getEventTypeName(type) {
    switch (type) {
        case 'project': return 'Projeto';
        case 'task': return 'Tarefa';
        case 'meeting': return 'Reunião';
        case 'deadline': return 'Prazo';
        case 'obra': return 'Obra'; // Adicionado suporte para obras
        default: return type;
    }
}

// Mostrar detalhes do evento (simplificado para este exemplo)
function showEventDetails(event) {
    console.log('Detalhes do evento:', event);
    
    // Aqui você pode implementar um modal para mostrar os detalhes do evento
    alert(`Evento: ${event.title}\nTipo: ${getEventTypeName(event.type)}\nDescrição: ${event.description || 'Sem descrição'}`);
}

// Função auxiliar para mostrar notificações
function showNotification(message, type = 'info') {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        console.log(`Notificação (${type}): ${message}`);
    }
}

// Função para abrir modal de edição
function openEditNoteModal(noteElement, note) {
    // Obter elementos do modal de edição
    const editNoteModal = document.getElementById('editNoteModal');
    const editNoteTitle = document.getElementById('editNoteTitle');
    const editNoteContent = document.getElementById('editNoteContent');
    const editNoteSaveButton = document.getElementById('editNoteSaveButton');
    const editNoteCancelButton = document.getElementById('editNoteCancelButton');
    const editNoteDeleteButton = document.getElementById('editNoteDeleteButton');

    // Preencher campos do modal com dados da nota
    editNoteTitle.value = note.title;
    editNoteContent.value = note.content;

    // Adicionar evento de clique para salvar nota
    const saveHandler = () => {
        // Obter valores dos campos do modal
        const editedTitle = editNoteTitle.value;
        const editedContent = editNoteContent.value;

        // Atualizar nota no array de notas
        note.title = editedTitle;
        note.content = editedContent;

        // Salvar notas no localStorage
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const noteIndex = notes.findIndex(n => n.id === note.id);
        if (noteIndex !== -1) {
            notes[noteIndex] = note;
        }
        localStorage.setItem('notes', JSON.stringify(notes));

        // Fechar modal de edição
        closeModal('editNoteModal');

        // Atualizar lista de notas
        renderNotes();

        // Mostrar notificação de sucesso
        showNotification('Nota salva com sucesso!');
    };

    editNoteSaveButton.addEventListener('click', saveHandler, { once: true });

    // Adicionar evento de clique para cancelar edição
    editNoteCancelButton.addEventListener('click', () => {
        closeModal('editNoteModal');
    });

    // Adicionar evento de clique para excluir nota
    const deleteHandler = () => {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        const updatedNotes = notes.filter(n => n.id !== note.id);
        localStorage.setItem('notes', JSON.stringify(updatedNotes));

        // Fechar modal de edição
        closeModal('editNoteModal');

        // Atualizar lista de notas
        renderNotes();

        // Mostrar notificação de sucesso
        showNotification('Nota excluída com sucesso!');
    };

    editNoteDeleteButton.addEventListener('click', deleteHandler, { once: true });

    // Adicionar evento de clique para fechar modal ao clicar fora
    editNoteModal.addEventListener('click', (event) => {
        if (event.target === editNoteModal) {
            closeModal('editNoteModal');
        }
    });
}

// Função para fechar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Função para renderizar notas
function renderNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const notesGrid = document.getElementById('notesGrid');
    if (!notesGrid) return;

    notesGrid.innerHTML = notes.map(note => `
        <div class="note bg-darkBg border border-darkBorder rounded-lg p-4 mb-4">
            <h3 class="text-lg font-medium mb-2">${note.title}</h3>
            <p class="text-grayText">${note.content}</p>
        </div>
    `).join('');

    // Adicionar evento de clique para abrir modal de edição
    const noteElements = document.querySelectorAll('.note');
    noteElements.forEach((noteElement, index) => {
        noteElement.addEventListener('click', () => {
            openEditNoteModal(noteElement, notes[index]);
        });
    });
}

// Função para abrir modal de novo evento
function openNewEventModal(date) {
    const modal = document.getElementById('newEventModal');
    if (modal) {
        modal.style.display = 'flex';
        // Preencher a data no modal, se necessário
        const eventDateInput = document.getElementById('eventDate');
        if (eventDateInput) {
            eventDateInput.value = date.toISOString().split('T')[0];
        }
    }
}

// Exportar funções
window.initCalendar = initCalendar;
window.renderAgendaView = renderAgendaView;
window.showNotification = showNotification;
window.renderNotes = renderNotes;

// Adicionar checkbox para mostrar obras
const filtersContainer = document.getElementById('filtersContainer');
if (filtersContainer) {
    const showObrasCheckbox = document.createElement('label');
    showObrasCheckbox.innerHTML = `
        <input type="checkbox" id="showObras" checked>
        Mostrar Obras
    `;
    filtersContainer.appendChild(showObrasCheckbox);
}

// Adicionar container de filtros
const filtersContainerElement = document.createElement('div');
filtersContainerElement.id = 'filtersContainer';
document.body.appendChild(filtersContainerElement);

// Adicionar grid do calendário
const calendarGridElement = document.createElement('div');
calendarGridElement.id = 'calendarGrid';
calendarGridElement.className = 'grid grid-cols-7 gap-2';
document.body.appendChild(calendarGridElement);

document.addEventListener('DOMContentLoaded', function() {
    if (typeof initCalendar === 'function') {
        initCalendar();
    } else {
        console.error('A função initCalendar não está definida');
    }
});