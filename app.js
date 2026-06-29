/* --- Lógica de la Aplicación: Guía Japón 2026 --- */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- ESTADO GLOBAL ---
    const state = {
        activeTab: 'itinerario',
        activeDay: 1,
        totalDays: 13,
        theme: 'dark', // 'dark' o 'light'
        checklist: {}, // Actividades del itinerario
        infoChecklist: {}, // Checklist de info útil
        notes: {}, // Notas diarias
        expenses: [], // Listado de gastos
        currencyRate: 165 // Tasa de cambio por defecto (1 EUR = 165 JPY)
    };

    // --- ELEMENTOS DEL DOM ---
    const body = document.body;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Elementos del Itinerario
    const dayTabs = document.querySelectorAll('.day-tab');
    const dayCards = document.querySelectorAll('.day-card');
    const prevDayBtn = document.getElementById('prev-day-btn');
    const nextDayBtn = document.getElementById('next-day-btn');
    const daySelector = document.getElementById('day-selector');
    
    // Elementos de Extras
    const filterChips = document.querySelectorAll('.chip');
    const extraCards = document.querySelectorAll('.extra-card');

    // Elementos del Reloj
    const clockEsp = document.getElementById('clock-esp');
    const clockJap = document.getElementById('clock-jap');

    // Elementos del Conversor
    const convEurInput = document.getElementById('conv-eur');
    const convJpyInput = document.getElementById('conv-jpy');
    const convRateInput = document.getElementById('conv-rate');

    // Elementos de Gastos
    const expenseForm = document.getElementById('expense-form');
    const expenseTitle = document.getElementById('expense-title');
    const expenseAmount = document.getElementById('expense-amount');
    const expenseCurrency = document.getElementById('expense-currency');
    const expenseCategory = document.getElementById('expense-category');
    const expensesList = document.getElementById('expenses-list');
    const budgetTotalEur = document.getElementById('budget-total-eur');
    const budgetTotalJpy = document.getElementById('budget-total-jpy');
    const budgetCount = document.getElementById('budget-count');
    const budgetRateDisplay = document.getElementById('budget-rate-display');

    // --- 1. INICIALIZACIÓN ---
    function init() {
        loadSettings();
        applyTheme();
        setupEventListeners();
        updateDayView(state.activeDay);
        restoreChecklists();
        restoreNotes();
        initClocks();
        initConverter();
        renderExpenses();
        updateAllProgress();
        registerServiceWorker();
    }

    // Cargar configuraciones de localStorage
    function loadSettings() {
        // Cargar Tema
        const savedTheme = localStorage.getItem('japon2026-theme');
        if (savedTheme) {
            state.theme = savedTheme;
        } else {
            const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
            state.theme = prefersLight ? 'light' : 'dark';
        }

        // Cargar Día Activo
        const savedDay = localStorage.getItem('japon2026-active-day');
        if (savedDay) {
            state.activeDay = parseInt(savedDay, 10);
        }

        // Cargar Checklists
        const savedChecklist = localStorage.getItem('japon2026-checklist');
        if (savedChecklist) {
            state.checklist = JSON.parse(savedChecklist);
        }

        const savedInfoChecklist = localStorage.getItem('japon2026-info-checklist');
        if (savedInfoChecklist) {
            state.infoChecklist = JSON.parse(savedInfoChecklist);
        }

        // Cargar Notas Diarias
        const savedNotes = localStorage.getItem('japon2026-notes');
        if (savedNotes) {
            state.notes = JSON.parse(savedNotes);
        }

        // Cargar Tasa de Cambio
        const savedRate = localStorage.getItem('japon2026-currency-rate');
        if (savedRate) {
            state.currencyRate = parseFloat(savedRate);
        }

        // Cargar Gastos
        const savedExpenses = localStorage.getItem('japon2026-expenses');
        if (savedExpenses) {
            state.expenses = JSON.parse(savedExpenses);
        }
    }

    // --- 2. CONFIGURACIÓN DEL TEMA ---
    function applyTheme() {
        if (state.theme === 'light') {
            body.classList.add('light-theme');
        } else {
            body.classList.remove('light-theme');
        }
        localStorage.setItem('japon2026-theme', state.theme);
    }

    function toggleTheme() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
        themeToggleBtn.style.transform = 'scale(0.9) rotate(15deg)';
        setTimeout(() => {
            themeToggleBtn.style.transform = 'none';
        }, 150);
    }

    // --- 3. NAVEGACIÓN ENTRE PESTAÑAS ---
    function switchTab(tabId) {
        state.activeTab = tabId;
        
        navItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        tabContents.forEach(content => {
            if (content.id === `tab-${tabId}`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // --- 4. GESTIÓN DEL ITINERARIO ---
    function updateDayView(dayNum) {
        state.activeDay = dayNum;
        localStorage.setItem('japon2026-active-day', dayNum);

        dayTabs.forEach(tab => {
            const tabDay = parseInt(tab.getAttribute('data-day'), 10);
            if (tabDay === dayNum) {
                tab.classList.add('active');
                centerDayTab(tab);
            } else {
                tab.classList.remove('active');
            }
        });

        dayCards.forEach(card => {
            const cardId = `day-card-${dayNum}`;
            if (card.id === cardId) {
                card.classList.add('active');
                
                const hero = card.querySelector('.day-hero');
                const bgImage = card.getAttribute('data-image');
                if (hero && bgImage) {
                    hero.style.backgroundImage = `url('${bgImage}')`;
                }
            } else {
                card.classList.remove('active');
            }
        });

        if (dayNum === 1) {
            prevDayBtn.style.visibility = 'hidden';
        } else {
            prevDayBtn.style.visibility = 'visible';
        }

        if (dayNum === state.totalDays) {
            nextDayBtn.style.visibility = 'hidden';
        } else {
            nextDayBtn.style.visibility = 'visible';
        }

        const dayContainer = document.getElementById('tab-itinerario');
        if (dayContainer) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function centerDayTab(tabElement) {
        const containerWidth = daySelector.offsetWidth;
        const tabWidth = tabElement.offsetWidth;
        const tabLeft = tabElement.offsetLeft;
        
        daySelector.scrollTo({
            left: tabLeft - (containerWidth / 2) + (tabWidth / 2),
            behavior: 'smooth'
        });
    }

    // --- 5. GESTIÓN DE CHECKLISTS & PROGRESO ---
    function restoreChecklists() {
        const taskCheckboxes = document.querySelectorAll('.task-checkbox');
        taskCheckboxes.forEach(checkbox => {
            const item = checkbox.closest('.timeline-item');
            const itemId = item.getAttribute('data-id');
            
            if (state.checklist[itemId]) {
                checkbox.checked = true;
                item.classList.add('completed');
            } else {
                checkbox.checked = false;
                item.classList.remove('completed');
            }
        });

        const infoCheckboxes = document.querySelectorAll('.info-checkbox');
        infoCheckboxes.forEach(checkbox => {
            const infoId = checkbox.getAttribute('data-info-id');
            checkbox.checked = !!state.infoChecklist[infoId];
        });
    }

    function handleTaskChange(e) {
        const checkbox = e.target;
        const item = checkbox.closest('.timeline-item');
        const itemId = item.getAttribute('data-id');
        const dayNum = parseInt(checkbox.getAttribute('data-day'), 10);

        if (checkbox.checked) {
            state.checklist[itemId] = true;
            item.classList.add('completed');
        } else {
            state.checklist[itemId] = false;
            item.classList.remove('completed');
        }

        localStorage.setItem('japon2026-checklist', JSON.stringify(state.checklist));
        updateDayProgress(dayNum);
    }

    function handleInfoTaskChange(e) {
        const checkbox = e.target;
        const infoId = checkbox.getAttribute('data-info-id');

        state.infoChecklist[infoId] = checkbox.checked;
        localStorage.setItem('japon2026-info-checklist', JSON.stringify(state.infoChecklist));
    }

    function updateDayProgress(dayNum) {
        const card = document.getElementById(`day-card-${dayNum}`);
        if (!card) return;

        const checkboxes = card.querySelectorAll('.task-checkbox');
        const total = checkboxes.length;
        if (total === 0) return;

        const checked = card.querySelectorAll('.task-checkbox:checked').length;
        const percent = Math.round((checked / total) * 100);

        const fill = card.querySelector('.progress-fill');
        const text = card.querySelector('.progress-text');

        if (fill) fill.style.width = `${percent}%`;
        if (text) text.textContent = `${percent}% completado (${checked} de ${total})`;
    }

    function updateAllProgress() {
        for (let d = 1; d <= state.totalDays; d++) {
            updateDayProgress(d);
        }
    }

    // --- 6. DIARIO DE VIAJE / NOTAS ---
    function restoreNotes() {
        const noteInputs = document.querySelectorAll('.day-notes-input');
        noteInputs.forEach(input => {
            const dayNum = input.getAttribute('data-day');
            input.value = state.notes[dayNum] || '';
        });
    }

    function handleNoteInput(e) {
        const input = e.target;
        const dayNum = input.getAttribute('data-day');
        state.notes[dayNum] = input.value;
        localStorage.setItem('japon2026-notes', JSON.stringify(state.notes));
    }

    // --- 7. RELOJ DUAL (ESPAÑA & JAPÓN) ---
    function initClocks() {
        function updateTime() {
            const now = new Date();
            
            // Hora de España (Madrid)
            const optionsEsp = { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hour12: false };
            const timeEsp = new Intl.DateTimeFormat('es-ES', optionsEsp).format(now);
            
            // Hora de Japón (Tokio)
            const optionsJap = { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false };
            const timeJap = new Intl.DateTimeFormat('es-ES', optionsJap).format(now);

            clockEsp.textContent = timeEsp;
            clockJap.textContent = timeJap;
        }

        updateTime();
        setInterval(updateTime, 1000); // Actualizar cada segundo
    }

    // --- 8. CONVERSOR DE DIVISAS ---
    function initConverter() {
        convRateInput.value = state.currencyRate;

        // Escuchar cambios en los campos de texto
        convEurInput.addEventListener('input', () => {
            const eur = parseFloat(convEurInput.value);
            if (!isNaN(eur)) {
                convJpyInput.value = Math.round(eur * state.currencyRate);
            } else {
                convJpyInput.value = '';
            }
        });

        convJpyInput.addEventListener('input', () => {
            const jpy = parseFloat(convJpyInput.value);
            if (!isNaN(jpy)) {
                convEurInput.value = (jpy / state.currencyRate).toFixed(2);
            } else {
                convEurInput.value = '';
            }
        });

        convRateInput.addEventListener('input', () => {
            const rate = parseFloat(convRateInput.value);
            if (!isNaN(rate) && rate > 0) {
                state.currencyRate = rate;
                localStorage.setItem('japon2026-currency-rate', rate);
                budgetRateDisplay.textContent = `1 € = ${rate} ¥`;
                
                // Recalcular conversión
                const eur = parseFloat(convEurInput.value);
                if (!isNaN(eur)) {
                    convJpyInput.value = Math.round(eur * rate);
                }
            }
        });
    }

    // --- 9. GESTOR DE GASTOS Y PRESUPUESTO ---
    function renderExpenses() {
        expensesList.innerHTML = '';
        budgetRateDisplay.textContent = `1 € = ${state.currencyRate} ¥`;

        if (state.expenses.length === 0) {
            expensesList.innerHTML = '<p class="empty-list-text">No hay gastos registrados todavía.</p>';
            budgetTotalEur.textContent = '0.00 €';
            budgetTotalJpy.textContent = '0 ¥';
            budgetCount.textContent = '0';
            return;
        }

        let totalEur = 0;
        let totalJpy = 0;

        // Categorías e iconos correspondientes
        const icons = {
            food: '🍜',
            transport: '🚇',
            hotel: '🏨',
            shopping: '🛍/',
            tickets: '🎟/',
            other: '⚙/'
        };

        const categoryNames = {
            food: 'Comida',
            transport: 'Transporte',
            hotel: 'Alojamiento',
            shopping: 'Compras',
            tickets: 'Entradas',
            other: 'Otros'
        };

        state.expenses.forEach((expense, index) => {
            let eurVal = 0;
            let jpyVal = 0;

            if (expense.currency === 'JPY') {
                jpyVal = expense.amount;
                eurVal = jpyVal / state.currencyRate;
            } else {
                eurVal = expense.amount;
                jpyVal = eurVal * state.currencyRate;
            }

            totalEur += eurVal;
            totalJpy += jpyVal;

            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            
            // Icono limpio (remover barras raras si las hubiera)
            const rawIcon = icons[expense.category] || '⚙️';
            const cleanIcon = rawIcon.replace('/', ''); // Sanitizar

            expenseItem.innerHTML = `
                <div class="expense-left">
                    <div class="expense-icon">${cleanIcon}</div>
                    <div class="expense-info">
                        <h4>${expense.title}</h4>
                        <span>${categoryNames[expense.category] || 'Otros'}</span>
                    </div>
                </div>
                <div class="expense-right">
                    <div class="expense-amount-val">
                        <div class="expense-amount-val-eur">${eurVal.toFixed(2)} €</div>
                        <div class="expense-amount-val-jpy">${Math.round(jpyVal).toLocaleString('es-ES')} ¥</div>
                    </div>
                    <button class="delete-expense-btn" data-index="${index}" aria-label="Eliminar gasto">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
            expensesList.appendChild(expenseItem);
        });

        // Actualizar resumen de totales
        budgetTotalEur.textContent = `${totalEur.toFixed(2)} €`;
        budgetTotalJpy.textContent = `${Math.round(totalJpy).toLocaleString('es-ES')} ¥`;
        budgetCount.textContent = state.expenses.length;

        // Agregar listener a los botones de borrar
        const deleteButtons = expensesList.querySelectorAll('.delete-expense-btn');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnClicked = e.target.closest('.delete-expense-btn');
                const index = parseInt(btnClicked.getAttribute('data-index'), 10);
                deleteExpense(index);
            });
        });
    }

    function addExpense(title, amount, currency, category) {
        const newExpense = {
            title,
            amount: parseFloat(amount),
            currency,
            category,
            date: new Date().toISOString()
        };

        state.expenses.push(newExpense);
        localStorage.setItem('japon2026-expenses', JSON.stringify(state.expenses));
        renderExpenses();
    }

    function deleteExpense(index) {
        state.expenses.splice(index, 1);
        localStorage.setItem('japon2026-expenses', JSON.stringify(state.expenses));
        renderExpenses();
    }

    // --- 10. FILTRO DE EXTRAS ---
    function filterExtras(cityFilter) {
        filterChips.forEach(chip => {
            if (chip.getAttribute('data-filter') === cityFilter) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });

        extraCards.forEach(card => {
            const cardCity = card.getAttribute('data-city');
            if (cityFilter === 'all' || cardCity === cityFilter) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // --- 11. ENLACE INTERNO A HOTELES CON ANIMACIÓN ---
    function navigateToHotel(hotelId) {
        switchTab('hoteles');

        const hotelCard = document.getElementById(`hotel-${hotelId}`);
        if (hotelCard) {
            setTimeout(() => {
                hotelCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                hotelCard.classList.add('highlight-flash');
                setTimeout(() => {
                    hotelCard.classList.remove('highlight-flash');
                }, 1600);
            }, 100);
        }
    }

    // --- 12. PWA SERVICE WORKER REGISTRATION ---
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then((reg) => {
                        console.log('Service Worker registrado correctamente con alcance:', reg.scope);
                    })
                    .catch((err) => {
                        console.log('Registro del Service Worker fallido:', err);
                    });
            });
        }
    }

    // --- 13. EVENT LISTENERS ---
    function setupEventListeners() {
        // Tema claro/oscuro
        themeToggleBtn.addEventListener('click', toggleTheme);

        // Navegación inferior
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabId = item.getAttribute('data-tab');
                switchTab(tabId);
            });
        });

        // Selector de días superior
        dayTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const dayNum = parseInt(tab.getAttribute('data-day'), 10);
                updateDayView(dayNum);
            });
        });

        // Botones de día anterior / siguiente
        prevDayBtn.addEventListener('click', () => {
            if (state.activeDay > 1) {
                updateDayView(state.activeDay - 1);
            }
        });

        nextDayBtn.addEventListener('click', () => {
            if (state.activeDay < state.totalDays) {
                updateDayView(state.activeDay + 1);
            }
        });

        // Escuchar cambios en checkboxes de tareas e info
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                handleTaskChange(e);
            } else if (e.target.classList.contains('info-checkbox')) {
                handleInfoTaskChange(e);
            }
        });

        // Escuchar cambios en diarios de viaje
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('day-notes-input')) {
                handleNoteInput(e);
            }
        });

        // Filtros en la sección de extras
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const filter = chip.getAttribute('data-filter');
                filterExtras(filter);
            });
        });

        // Enlaces de hoteles desde el itinerario
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('hotel-highlight')) {
                const hotelId = e.target.getAttribute('data-hotel');
                if (hotelId) {
                    navigateToHotel(hotelId);
                }
            }
        });

        // Formulario de Gastos
        expenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = expenseTitle.value.trim();
            const amount = expenseAmount.value;
            const currency = expenseCurrency.value;
            const category = expenseCategory.value;

            if (title && amount) {
                addExpense(title, amount, currency, category);
                
                // Resetear formulario
                expenseTitle.value = '';
                expenseAmount.value = '';
                expenseTitle.focus();
            }
        });
    }

    // --- EJECUTAR INICIALIZACIÓN ---
    init();
});
