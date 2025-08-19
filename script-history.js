document.addEventListener('DOMContentLoaded', function() {
    // Обработчик для кнопок "Читать далее"
    const readMoreButtons = document.querySelectorAll('.read-more');
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Полная версия статьи будет доступна в ближайшее время. Спасибо за интерес!');
        });
    });

    // Адаптация меню для мобильных устройств
    function handleMobileMenu() {
        const dropdownContent = document.querySelector('.dropdown-content');
        if (window.innerWidth <= 768) {
            dropdownContent.style.position = 'static';
            dropdownContent.style.width = '100%';
            dropdownContent.style.boxShadow = 'none';
        } else {
            dropdownContent.style.position = 'absolute';
            dropdownContent.style.width = 'auto';
            dropdownContent.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
        }
    }

    // Инициализация и обработка изменения размера окна
    handleMobileMenu();
    window.addEventListener('resize', handleMobileMenu);
});