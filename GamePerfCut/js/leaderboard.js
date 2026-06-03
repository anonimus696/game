// leaderboard.js — СИСТЕМА ОБЛІКУ ТА ЗБЕРЕЖЕННЯ РЕКОРДІВ

// Отримання поточної таблиці рекордів
export function getLeaderboard() {
    let data = localStorage.getItem('perfectCut_leaderboard');
    return data ? JSON.parse(data) : [];
}

// Розумне збереження рекорду (БЕЗ ДУБЛЮВАННЯ)
export function saveRecord(name, score) {
    let leaderboard = getLeaderboard();

    // Шукаємо, чи є вже гравець з таким ім'ям в базі
    let existingPlayer = leaderboard.find(item => item.name.toLowerCase() === name.toLowerCase());

    if (existingPlayer) {
        // Якщо гравець є, оновлюємо результат ТІЛЬКИ якщо новий рахунок більший за старий
        if (score > existingPlayer.score) {
            existingPlayer.score = score;
            existingPlayer.name = name; // На випадок, якщо регістр букв змінився (напр. alex -> Alex)
        } else {
            // Якщо зіграв гірше або так само — нічого не міняємо і виходимо
            return;
        }
    } else {
        // Якщо такого гравця ще немає — додаємо новий запис
        leaderboard.push({ name: name, score: score });
    }

    // Сортуємо таблицю від найбільшого рекорду до найменшого
    leaderboard.sort((a, b) => b.score - a.score);

    // Залишаємо в таблиці тільки ТОП-5 гравців, щоб вона не розросталася безкінечно
    if (leaderboard.length > 5) {
        leaderboard = leaderboard.slice(0, 5);
    }

    // Зберігаємо оновлений чистий топ назад у пам'ять
    localStorage.setItem('perfectCut_leaderboard', JSON.stringify(leaderboard));
}