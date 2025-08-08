// План Лунгрена - Тренувальна програма
class PlanLungrena {
    constructor() {
        this.currentPhase = 1;
        // Встановлюємо завтрашній день як стартовий
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.startDate = tomorrow;
        
        this.workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];
        this.notificationTime = localStorage.getItem('notificationTime') || '08:00'; // Час нагадування з налаштувань
        this.notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false'; // Увімкнені за замовчуванням
        
        this.init();
    }

    init() {
        this.updateDateTime();
        this.loadTodayWorkout();
        this.updateStats();
        this.loadWorkoutHistory();
        this.setupEventListeners();
        this.setupNavigation();
        this.checkNotification();
        
        // Оновлення часу кожну хвилину
        setInterval(() => this.updateDateTime(), 60000);
        
        // Перевірка нагадувань кожну хвилину
        setInterval(() => this.checkNotification(), 60000);
    }

    // Оновлення дати та часу
    updateDateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('uk-UA', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const dateString = now.toLocaleDateString('uk-UA', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        document.getElementById('currentTime').textContent = timeString;
        document.getElementById('currentDate').textContent = dateString;
    }

    // Визначення поточної фази
    getCurrentPhase() {
        const now = new Date();
        const weeksSinceStart = Math.floor((now - this.startDate) / (7 * 24 * 60 * 60 * 1000));
        
        if (weeksSinceStart < 8) return 1; // Фаза 1: 1-2 місяці
        if (weeksSinceStart < 20) return 2; // Фаза 2: 3-5 місяців
        if (weeksSinceStart < 32) return 3; // Фаза 3: 6-8 місяців
        return 4; // Фаза 4: 9-12 місяців
    }

    // Тренувальні плани для кожної фази
    getWorkoutPlans() {
        const plans = {
            1: {
                name: "Фаза 1: Стабільність і старт",
                description: "Зміцнення спини, сідниць та кору. Покращення постави.",
                workouts: {
                    1: { // Понеділок
                        title: "Біг+Стабільність",
                        description: "Біг 2 км, потім Bird-Dog 3x10, Clamshell 3x15, Glute Bridge 3x15, Wall Angels 3x12",
                        type: "running",
                        duration: 45
                    },
                    2: { // Вівторок
                        title: "Плечі і верх",
                        description: "Pike Push-ups 3x10, Shoulder Taps 3x20, Superman Hold 3x30 сек",
                        type: "strength",
                        duration: 30
                    },
                    3: { // Середа
                        title: "Біг+Мобільність",
                        description: "Біг 3 км, Dead Bug 3x10, Bird-Dog 2x15, дихальні вправи",
                        type: "running",
                        duration: 40
                    },
                    4: { // Четвер
                        title: "Кор і стабільність",
                        description: "Планка 3x45 сек, Glute Kickbacks 3x15/нога, Side Plank 3x30 сек",
                        type: "core",
                        duration: 25
                    },
                    5: { // П'ятниця
                        title: "Верхня частина тіла",
                        description: "Підтягування негативні 3x3, Віджимання 3x10, Shoulder Mobility",
                        type: "strength",
                        duration: 35
                    },
                    6: { // Субота
                        title: "Біг+Баланс",
                        description: "Біг 4 км, Планка 2x1 хв, Bird-Dog 2x15, Баланс на одній нозі",
                        type: "running",
                        duration: 50
                    },
                    0: { // Неділя
                        title: "Відпочинок+Розтяжка",
                        description: "Йога/прогулянка 3-5 км, дихальні вправи, розтягнення 15-20 хв",
                        type: "rest",
                        duration: 30
                    }
                }
            },
            2: {
                name: "Фаза 2: Нарощування основи",
                description: "Збільшення м'язової маси. Біг 5-7 км без перенавантаження.",
                workouts: {
                    1: {
                        title: "Біг+Ноги",
                        description: "Біг 6 км, Split Squats 3x12/нога, Glute Kickbacks 3x15/нога, Calf Raises 3x20",
                        type: "running",
                        duration: 55
                    },
                    2: {
                        title: "Верхній комплекс",
                        description: "Віджимання з нахилом 3x12, Pike Push-ups 3x10, Трицепс на лавці 3x15",
                        type: "strength",
                        duration: 40
                    },
                    3: {
                        title: "Біг+Мобільність",
                        description: "Біг 4 км, Bird-Dog 3x10, Wall Angels 3x15, мобільність 10 хв",
                        type: "running",
                        duration: 35
                    },
                    4: {
                        title: "Спина+Плечі",
                        description: "Australian Pull-ups 3x10, Superman Hold 3x30 сек, Shoulder Taps 3x20",
                        type: "strength",
                        duration: 35
                    },
                    5: {
                        title: "Біг+Плечі",
                        description: "Біг 7 км, Еспандер для плечей 3 підходи, Підтягування 3xмакс",
                        type: "running",
                        duration: 60
                    },
                    6: {
                        title: "Full-body",
                        description: "Присідання + віджимання + баланс 3 кола, стретчинг 15 хв",
                        type: "strength",
                        duration: 45
                    },
                    0: {
                        title: "Відновлення",
                        description: "Йога, пілатес або легка руханка + масаж, холодний душ",
                        type: "rest",
                        duration: 30
                    }
                }
            },
            3: {
                name: "Фаза 3: Атлетизм і рельєф",
                description: "Формування атлетичної фігури. Зменшення підшкірного жиру.",
                workouts: {
                    1: {
                        title: "Біг+Плиометрика",
                        description: "Біг 8 км, Jump Squats 3x10, Bulgarian Split Squats 3x10/нога, Планка 3x1 хв",
                        type: "running",
                        duration: 65
                    },
                    2: {
                        title: "Кор і верх",
                        description: "Divebomber Push-ups 3x12, Hanging Knee Raises 3x15, L-sit 3xмакс",
                        type: "strength",
                        duration: 40
                    },
                    3: {
                        title: "Біг+Мобільність",
                        description: "Біг 4 км, Superman 3x30 сек, Wall Angels 3x15, мобільність 15 хв",
                        type: "running",
                        duration: 35
                    },
                    4: {
                        title: "Сила+Баланс",
                        description: "Chin-ups 3xмакс, Plank Variations 3x1 хв, Баланс на нестійкій поверхні",
                        type: "strength",
                        duration: 35
                    },
                    5: {
                        title: "Інтервальний біг",
                        description: "Інтервальний біг 7 км: 10 інтервалів 1 хв бігу + 1 хв ходьби",
                        type: "running",
                        duration: 50
                    },
                    6: {
                        title: "Комбо тренування",
                        description: "Віджимання + підтягування + присідання 3 раунди, координаційні вправи",
                        type: "strength",
                        duration: 45
                    },
                    0: {
                        title: "Активне відновлення",
                        description: "Біг 2 км або активне відновлення: баня, масаж, легкий пилатес",
                        type: "rest",
                        duration: 25
                    }
                }
            },
            4: {
                name: "Фаза 4: Фінішна - Тіло Лунгрена",
                description: "Максимальна мускулатура без зайвого жиру. Функціональне тіло + витривалість.",
                workouts: {
                    1: {
                        title: "Біг+Сила ніг",
                        description: "Біг 10 км, Nordic Curl 3x6, Calf Raises 3x25, Squat Hold 3x1 хв",
                        type: "running",
                        duration: 75
                    },
                    2: {
                        title: "Сила та прес",
                        description: "Підтягування 3-5 підходів, Dragon Flag 3x5, Weighted Plank до 1 хв",
                        type: "strength",
                        duration: 45
                    },
                    3: {
                        title: "Біг+LISS",
                        description: "Біг 6 км + LISS (ходьба/вело 30 хв), Баланс 5 хв на нестійкій поверхні",
                        type: "running",
                        duration: 60
                    },
                    4: {
                        title: "Плечі+Баланс",
                        description: "Archer Push-ups 3x10, Handstand Hold до 30 сек, мобільність плечей 10 хв",
                        type: "strength",
                        duration: 40
                    },
                    5: {
                        title: "Темповий біг",
                        description: "Темповий біг 8 км, L-sit Hold 3xмакс, Hanging Leg Raises 3x15",
                        type: "running",
                        duration: 55
                    },
                    6: {
                        title: "Full-body фінальне",
                        description: "Біг 4 км + Full-body: Підтягування, віджимання, присідання 3xмакс",
                        type: "strength",
                        duration: 50
                    },
                    0: {
                        title: "Глибоке відновлення",
                        description: "Глибокий стретчинг, йога, сауна. Аналіз тижня, ментальна концентрація",
                        type: "rest",
                        duration: 40
                    }
                }
            }
        };
        
        return plans;
    }

    // Завантаження сьогоднішнього тренування
    loadTodayWorkout() {
        const currentPhase = this.getCurrentPhase();
        const today = new Date().getDay(); // 0 = Неділя, 1 = Понеділок, ...
        const plans = this.getWorkoutPlans();
        const phasePlan = plans[currentPhase];
        const workout = phasePlan.workouts[today];
        
        document.getElementById('workoutTitle').textContent = workout.title;
        document.getElementById('workoutDescription').textContent = workout.description;
        document.getElementById('currentPhase').textContent = `Фаза ${currentPhase}`;
        
        // Зберігаємо поточне тренування для модального вікна
        this.currentWorkout = workout;
    }

    // Оновлення статистики
    updateStats() {
        const now = new Date();
        const weeksSinceStart = Math.floor((now - this.startDate) / (7 * 24 * 60 * 60 * 1000));
        const thisWeekWorkouts = this.workoutHistory.filter(workout => {
            const workoutDate = new Date(workout.date);
            const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
            return workoutDate >= weekStart && workoutDate <= weekEnd;
        }).length;
        
        document.getElementById('weeksCount').textContent = weeksSinceStart;
        document.getElementById('weeklyWorkouts').textContent = thisWeekWorkouts;
    }

    // Завантаження історії тренувань
    loadWorkoutHistory() {
        const historyContainer = document.getElementById('workoutHistory');
        historyContainer.innerHTML = '';
        
        const sortedHistory = this.workoutHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedHistory.slice(0, 10).forEach(workout => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const workoutDate = new Date(workout.date);
            const dateString = workoutDate.toLocaleDateString('uk-UA');
            
            historyItem.innerHTML = `
                <div class="history-item-header">
                    <span class="history-date">${dateString}</span>
                    <span class="history-type">${this.getWorkoutTypeName(workout.type)}</span>
                </div>
                <div class="history-details">
                    <span>Тривалість: ${workout.duration} хв</span>
                    <span>Оцінка: ${workout.rating}/10</span>
                </div>
                ${workout.notes ? `<div class="history-notes">${workout.notes}</div>` : ''}
            `;
            
            historyContainer.appendChild(historyItem);
        });
    }

    // Отримання назви типу тренування
    getWorkoutTypeName(type) {
        const types = {
            'running': 'Біг',
            'strength': 'Силове',
            'core': 'Кор',
            'mobility': 'Мобільність',
            'rest': 'Відпочинок'
        };
        return types[type] || type;
    }

    // Налаштування обробників подій
    setupEventListeners() {
        // Збереження тренування
        document.getElementById('saveWorkout').addEventListener('click', () => {
            this.saveWorkout();
        });
        
        // Початок тренування
        document.getElementById('startWorkout').addEventListener('click', () => {
            this.startWorkout();
        });
        
        // Перегляд деталей
        document.getElementById('viewDetails').addEventListener('click', () => {
            this.showWorkoutDetails();
        });
        
        // Модальне вікно
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('startWorkoutModal').addEventListener('click', () => {
            this.startWorkout();
            this.closeModal();
        });
        
        document.getElementById('snoozeModal').addEventListener('click', () => {
            this.snoozeNotification();
        });
        
        // Встановлення поточної дати в форму
        document.getElementById('workoutDate').value = new Date().toISOString().split('T')[0];
        
        // Налаштування сповіщень
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });
        
        // Завантаження налаштувань
        this.loadSettings();
    }

    // Збереження тренування
    saveWorkout() {
        const date = document.getElementById('workoutDate').value;
        const type = document.getElementById('workoutType').value;
        const duration = parseInt(document.getElementById('workoutDuration').value) || 0;
        const notes = document.getElementById('workoutNotes').value;
        const rating = parseInt(document.getElementById('workoutRating').value) || 5;
        
        if (!date || !type) {
            alert('Будь ласка, заповніть обов\'язкові поля (дата та тип тренування)');
            return;
        }
        
        const workout = {
            date,
            type,
            duration,
            notes,
            rating
        };
        
        this.workoutHistory.push(workout);
        localStorage.setItem('workoutHistory', JSON.stringify(this.workoutHistory));
        
        // Очищення форми
        document.getElementById('workoutType').value = '';
        document.getElementById('workoutDuration').value = '';
        document.getElementById('workoutNotes').value = '';
        document.getElementById('workoutRating').value = '';
        
        // Оновлення статистики та історії
        this.updateStats();
        this.loadWorkoutHistory();
        
        alert('Тренування збережено!');
    }

    // Початок тренування
    startWorkout() {
        if (this.currentWorkout) {
            alert(`Починаємо тренування: ${this.currentWorkout.title}\n\n${this.currentWorkout.description}\n\nТривалість: ${this.currentWorkout.duration} хвилин`);
        }
    }

    // Показати деталі тренування
    showWorkoutDetails() {
        if (this.currentWorkout) {
            const modal = document.getElementById('notificationModal');
            const modalBody = document.getElementById('modalWorkoutInfo');
            
            modalBody.innerHTML = `
                <h4>${this.currentWorkout.title}</h4>
                <p><strong>Опис:</strong> ${this.currentWorkout.description}</p>
                <p><strong>Тип:</strong> ${this.getWorkoutTypeName(this.currentWorkout.type)}</p>
                <p><strong>Тривалість:</strong> ${this.currentWorkout.duration} хвилин</p>
            `;
            
            modal.classList.add('show');
        }
    }

    // Закриття модального вікна
    closeModal() {
        document.getElementById('notificationModal').classList.remove('show');
    }

    // Перевірка нагадування
    checkNotification() {
        if (!this.notificationsEnabled) return;
        
        const now = new Date();
        const currentTime = now.toLocaleTimeString('uk-UA', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        if (currentTime === this.notificationTime) {
            this.showNotification();
        }
    }

    // Зміна часу нагадування
    setNotificationTime(time) {
        this.notificationTime = time;
        localStorage.setItem('notificationTime', time);
    }

    // Увімкнення/вимкнення сповіщень
    toggleNotifications(enabled) {
        this.notificationsEnabled = enabled;
        localStorage.setItem('notificationsEnabled', enabled);
    }

    // Отримання налаштувань сповіщень
    getNotificationSettings() {
        return {
            time: this.notificationTime,
            enabled: this.notificationsEnabled
        };
    }

    // Показати нагадування
    showNotification() {
        const modal = document.getElementById('notificationModal');
        const modalBody = document.getElementById('modalWorkoutInfo');
        
        if (this.currentWorkout) {
            modalBody.innerHTML = `
                <h4>${this.currentWorkout.title}</h4>
                <p>${this.currentWorkout.description}</p>
                <p><strong>Тривалість:</strong> ${this.currentWorkout.duration} хвилин</p>
            `;
        }
        
        modal.classList.add('show');
    }

    // Відкласти нагадування
    snoozeNotification() {
        this.closeModal();
        // Відкласти на 15 хвилин
        setTimeout(() => {
            this.showNotification();
        }, 15 * 60 * 1000);
    }

    // Налаштування навігації
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('main > section');
        
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetSection = button.getAttribute('data-section');
                
                // Оновлення активної кнопки
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Показ відповідної секції
                sections.forEach(section => {
                    section.style.display = 'none';
                });
                
                const targetElement = document.querySelector(`.${targetSection}-section`);
                if (targetElement) {
                    targetElement.style.display = 'block';
                }
            });
        });
    }

    // Завантаження тижневого графіка
    loadWeeklySchedule() {
        const currentPhase = this.getCurrentPhase();
        const plans = this.getWorkoutPlans();
        const phasePlan = plans[currentPhase];
        const scheduleContainer = document.getElementById('weeklySchedule');
        
        const days = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const today = new Date().getDay();
        
        scheduleContainer.innerHTML = '';
        
        days.forEach((day, index) => {
            const workout = phasePlan.workouts[index];
            const isToday = index === today;
            
            const dayElement = document.createElement('div');
            dayElement.className = `schedule-day ${isToday ? 'today' : ''}`;
            
            dayElement.innerHTML = `
                <div class="schedule-day-name">${day}</div>
                <div class="schedule-workout">${workout.title}</div>
            `;
            
            scheduleContainer.appendChild(dayElement);
        });
    }

    // Завантаження налаштувань
    loadSettings() {
        const settings = this.getNotificationSettings();
        
        document.getElementById('notificationTime').value = settings.time;
        document.getElementById('notificationsEnabled').checked = settings.enabled;
        
        // Показ дати початку програми
        const startDateDisplay = document.getElementById('startDateDisplay');
        if (startDateDisplay) {
            startDateDisplay.textContent = this.startDate.toLocaleDateString('uk-UA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    // Збереження налаштувань
    saveSettings() {
        const time = document.getElementById('notificationTime').value;
        const enabled = document.getElementById('notificationsEnabled').checked;
        
        this.setNotificationTime(time);
        this.toggleNotifications(enabled);
        
        alert('Налаштування збережено!');
    }
}

// Реєстрація Service Worker для PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Ініціалізація додатку
document.addEventListener('DOMContentLoaded', () => {
    const app = new PlanLungrena();
    
    // Завантаження тижневого графіка
    app.loadWeeklySchedule();
    
    // Показ секції тренувань за замовчуванням
    document.querySelector('.workout-section').style.display = 'block';
    document.querySelector('.progress-section').style.display = 'none';
    document.querySelector('.log-section').style.display = 'none';
    document.querySelector('.schedule-section').style.display = 'none';
    document.querySelector('.settings-section').style.display = 'none';
});
