document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.game-image');
    let lastClickTime = 0;

    // Создаем объект с ссылками для каждого периода
    const periodLinks = {
        'img1': 'karel-period.html',
        'img2': 'finnish-period.html',
        'img3': 'soviet-period.html',
        'img4': 'modern-period.html'
    };

    // Обработчики для изображений
    images.forEach(img => {
        img.addEventListener('click', function() {
            const currentTime = new Date().getTime();
            
            // Проверяем двойное нажатие (интервал менее 300мс)
            if (currentTime - lastClickTime < 300) {
                // Удаляем выделение со всех изображений
                images.forEach(image => {
                    image.classList.remove('selected');
                });
                
                // Добавляем выделение выбранному изображению
                this.classList.add('selected');
                
                // Получаем ID выбранного изображения
                const selectedImageId = this.id;
                
                // Открываем соответствующую страницу в новой вкладке
                if (periodLinks[selectedImageId]) {
                    window.open(periodLinks[selectedImageId], '_blank');
                }
            }
            
            lastClickTime = currentTime;
        });
    });
});