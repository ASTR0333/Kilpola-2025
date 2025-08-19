document.addEventListener('DOMContentLoaded', function() {
    // ==================== Выпадающее меню ====================
    const dropdown = document.querySelector('.dropdown');
    const dropbtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');

    function closeDropdown() {
        dropdownContent.style.display = 'none';
    }

    dropbtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            closeDropdown();
        }
    });

    dropdownContent.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            closeDropdown();
        }
    });

    // ==================== Раскрывающиеся секции ====================
    const sections = document.querySelectorAll('.expandable-section');
    
    sections.forEach(section => {
        const header = section.querySelector('.section-header');
        
        header.addEventListener('click', function() {
            sections.forEach(s => {
                if (s !== section && s.classList.contains('active')) {
                    s.classList.remove('active');
                }
            });
            section.classList.toggle('active');
        });
    });

    // ==================== Адаптивность ====================
    function handleMobileMenu() {
        if (window.innerWidth <= 768) {
            dropdownContent.style.position = 'static';
            dropdownContent.style.width = '100%';
        } else {
            dropdownContent.style.position = 'absolute';
            dropdownContent.style.width = 'auto';
        }
    }

    handleMobileMenu();
    window.addEventListener('resize', handleMobileMenu);
});