// Функції для експорту статистики тренувань
class WorkoutExporter {
    constructor() {
        this.workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];
    }

    // Експорт статистики в JSON
    exportToJSON() {
        const data = {
            exportDate: new Date().toISOString(),
            totalWorkouts: this.workoutHistory.length,
            workoutHistory: this.workoutHistory,
            statistics: this.getStatistics()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `plan-lungrena-stats-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Експорт в CSV
    exportToCSV() {
        const headers = ['Дата', 'Тип тренування', 'Тривалість (хв)', 'Оцінка', 'Нотатки'];
        const csvContent = [
            headers.join(','),
            ...this.workoutHistory.map(workout => [
                workout.date,
                workout.type,
                workout.duration,
                workout.rating,
                `"${workout.notes || ''}"`
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `plan-lungrena-workouts-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Отримання статистики
    getStatistics() {
        const now = new Date();
        const startDate = new Date('2024-08-01');
        const weeksSinceStart = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
        
        const thisWeekWorkouts = this.workoutHistory.filter(workout => {
            const workoutDate = new Date(workout.date);
            const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
            return workoutDate >= weekStart && workoutDate <= weekEnd;
        });
        
        const totalDuration = this.workoutHistory.reduce((sum, workout) => sum + (workout.duration || 0), 0);
        const averageRating = this.workoutHistory.length > 0 
            ? this.workoutHistory.reduce((sum, workout) => sum + (workout.rating || 0), 0) / this.workoutHistory.length 
            : 0;
        
        const workoutTypes = {};
        this.workoutHistory.forEach(workout => {
            workoutTypes[workout.type] = (workoutTypes[workout.type] || 0) + 1;
        });
        
        return {
            weeksSinceStart,
            totalWorkouts: this.workoutHistory.length,
            thisWeekWorkouts: thisWeekWorkouts.length,
            totalDuration,
            averageRating: Math.round(averageRating * 10) / 10,
            workoutTypes,
            currentPhase: this.getCurrentPhase()
        };
    }

    // Визначення поточної фази
    getCurrentPhase() {
        const now = new Date();
        const startDate = new Date('2024-08-01');
        const weeksSinceStart = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
        
        if (weeksSinceStart < 8) return 1;
        if (weeksSinceStart < 20) return 2;
        if (weeksSinceStart < 32) return 3;
        return 4;
    }

    // Генерація звіту
    generateReport() {
        const stats = this.getStatistics();
        const report = `
ПЛАН ЛУНГРЕНА - ЗВІТ ПРОГРЕСУ
================================

Дата звіту: ${new Date().toLocaleDateString('uk-UA')}
Тижнів тренувань: ${stats.weeksSinceStart}
Поточна фаза: ${stats.currentPhase}

ЗАГАЛЬНА СТАТИСТИКА:
- Всього тренувань: ${stats.totalWorkouts}
- Тренувань цього тижня: ${stats.thisWeekWorkouts}
- Загальна тривалість: ${stats.totalDuration} хвилин
- Середня оцінка: ${stats.averageRating}/10

РОЗПОДІЛ ПО ТИПАХ ТРЕНУВАНЬ:
${Object.entries(stats.workoutTypes).map(([type, count]) => `- ${this.getWorkoutTypeName(type)}: ${count}`).join('\n')}

ОСТАННІ 10 ТРЕНУВАНЬ:
${this.workoutHistory.slice(-10).reverse().map(workout => 
    `${workout.date} - ${this.getWorkoutTypeName(workout.type)} (${workout.duration}хв, оцінка: ${workout.rating}/10)`
).join('\n')}
        `;
        
        return report;
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
}

// Додавання функцій експорту до глобального об'єкта
window.WorkoutExporter = WorkoutExporter;
