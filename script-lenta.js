document.addEventListener('DOMContentLoaded', function() {
    const timelineData = [
        { year: "1075-1100", event: "Первое упоминание карел в новгородской грамоте" },
        { year: "1396", event: "Первое упоминание Кирьяжского погоста" },
        { year: "1617", event: "Мирный договор со Швецией" },
        { year: "1811", event: "Присоединение Финляндии к Российской империи" },
        { year: "1917", event: "Принятие закона о независимости Финляндии" },
        { year: "1940", event: "Советско-финская война" },
        { year: "1941", event: "Захват острова немецко-финскими войсками" },
        { year: "1944", event: "Освобождение острова советскими войсками" }
    ];

    const eventsContainer = document.getElementById('events-container');
    const slotsContainer = document.getElementById('slots-container');
    const datesContainer = document.querySelector('.dates-container');
    const feedback = document.querySelector('.feedback');
    const checkBtn = document.getElementById('check-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    let draggedEvent = null;
    let originalSlot = null;

    function initTimeline() {
        eventsContainer.innerHTML = '';
        slotsContainer.innerHTML = '';
        datesContainer.innerHTML = '';
        feedback.textContent = '';
        feedback.className = 'feedback';

        // Create slots and dates
        timelineData.forEach(item => {
            // Create slot
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.setAttribute('data-year', item.year);
            slotsContainer.appendChild(slot);

            // Create date
            const date = document.createElement('div');
            date.className = 'date';
            date.textContent = item.year;
            datesContainer.appendChild(date);
        });

        // Create and shuffle events
        const shuffledEvents = [...timelineData].sort(() => Math.random() - 0.5);
        shuffledEvents.forEach(item => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event';
            eventElement.textContent = item.event;
            eventElement.setAttribute('draggable', 'true');
            eventElement.setAttribute('data-year', item.year);
            eventsContainer.appendChild(eventElement);
        });

        setupEventListeners();
    }

    function setupEventListeners() {
        const events = document.querySelectorAll('.event');
        const slots = document.querySelectorAll('.slot');

        events.forEach(event => {
            event.addEventListener('dragstart', function(e) {
                draggedEvent = this;
                originalSlot = this.closest('.slot');
                setTimeout(() => this.style.opacity = '0.4', 0);
                e.dataTransfer.setData('text/plain', '');
            });
            
            event.addEventListener('dragend', function() {
                setTimeout(() => {
                    this.style.opacity = '1';
                    draggedEvent = null;
                    originalSlot = null;
                }, 0);
            });
        });

        slots.forEach(slot => {
            slot.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('highlight');
            });
            
            slot.addEventListener('dragleave', function() {
                this.classList.remove('highlight');
            });
            
            slot.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('highlight');
                
                if (!draggedEvent) return;
                
                // If dropped on occupied slot, swap events
                if (this.firstChild) {
                    const existingEvent = this.firstChild;
                    if (originalSlot) {
                        // Move existing event to original slot
                        originalSlot.appendChild(existingEvent);
                        existingEvent.classList.add('in-slot');
                    } else {
                        // Move existing event back to events container
                        eventsContainer.appendChild(existingEvent);
                        existingEvent.classList.remove('in-slot');
                    }
                } else if (originalSlot) {
                    // Clear original slot if moving from slot to empty slot
                    originalSlot.innerHTML = '';
                }
                
                // Move dragged event to new slot
                this.appendChild(draggedEvent);
                draggedEvent.classList.add('in-slot');
            });
        });

        // Return to events container if dropped outside
        document.addEventListener('dragover', function(e) {
            if (!draggedEvent) return;
            e.preventDefault();
        });
        
        document.addEventListener('drop', function(e) {
            if (!draggedEvent || e.target.closest('.slot')) return;
            e.preventDefault();
            
            if (originalSlot) {
                originalSlot.innerHTML = '';
            }
            eventsContainer.appendChild(draggedEvent);
            draggedEvent.classList.remove('in-slot');
        });
    }

    checkBtn.addEventListener('click', function() {
        const slots = document.querySelectorAll('.slot');
        let correctCount = 0;
        
        slots.forEach(slot => {
            const event = slot.querySelector('.event');
            const year = slot.getAttribute('data-year');
            
            if (event && event.getAttribute('data-year') === year) {
                correctCount++;
            }
        });
        
        if (correctCount === timelineData.length) {
            feedback.textContent = 'Поздравляем! Все события на своих местах!';
            feedback.className = 'feedback correct-feedback';
        } else {
            feedback.textContent = `Правильно ${correctCount} из ${timelineData.length}. Попробуйте еще!`;
            feedback.className = 'feedback incorrect-feedback';
        }
    });

    resetBtn.addEventListener('click', initTimeline);

    initTimeline();
});