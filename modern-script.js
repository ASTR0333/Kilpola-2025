document.addEventListener('DOMContentLoaded', function() {
    // Принудительно устанавливаем светлую тему
    document.body.classList.add('light-theme');
    document.getElementById('theme-toggle').checked = true;
    document.getElementById('theme-label').textContent = 'Светлый режим';
    
    // Скрываем переключатель темы
    document.querySelector('.theme-switcher').style.display = 'none';

    // Логика переключения вкладок
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Логика рисования
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('color-picker');
    const brushSize = document.getElementById('brush-size');
    const sizeValue = document.getElementById('size-value');
    const clearBtn = document.getElementById('clear');
    const saveBtn = document.getElementById('save');
    const tools = document.querySelectorAll('.tools button');
    
    // Состояние рисования
    let isDrawing = false;
    let currentTool = 'pencil';
    let currentColor = '#000000';
    let currentSize = 5;
    let lastX = 0;
    let lastY = 0;

    // История действий
    const drawingHistory = {
        states: [],
        currentState: -1,
        maxStates: 20,
        
        saveState: function() {
            if (this.currentState < this.states.length - 1) {
                this.states = this.states.slice(0, this.currentState + 1);
            }
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            this.states.push(imageData);
            this.currentState++;
            
            if (this.states.length > this.maxStates) {
                this.states.shift();
                this.currentState--;
            }
        },
        
        undo: function() {
            if (this.currentState > 0) {
                this.currentState--;
                ctx.putImageData(this.states[this.currentState], 0, 0);
                return true;
            }
            return false;
        },
        
        redo: function() {
            if (this.currentState < this.states.length - 1) {
                this.currentState++;
                ctx.putImageData(this.states[this.currentState], 0, 0);
                return true;
            }
            return false;
        },
        
        clear: function() {
            this.states = [];
            this.currentState = -1;
        }
    };

    // Инициализация холста
    function initializeCanvas() {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGrid('#f0f0f0');
        drawingHistory.saveState();
    }
    
    function drawGrid(color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        const gridSize = 10;
        const width = canvas.width;
        const height = canvas.height;
        
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    // Функция заливки области
    function floodFill(x, y, fillColor, tolerance = 10) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const targetColor = getPixelColor(imageData, x, y);
        const pixelStack = [[x, y]];
        const fillRgb = hexToRgb(fillColor);
        
        if (colorsMatch(targetColor, fillRgb, tolerance)) return;
        
        while (pixelStack.length) {
            const [x, y] = pixelStack.pop();
            const pos = (y * canvas.width + x) * 4;
            
            if (!pixelInBounds(x, y)) continue;
            if (!colorsMatch(getPixelColor(imageData, x, y), targetColor, tolerance)) continue;
            
            setPixelColor(imageData, pos, fillColor);
            
            pixelStack.push([x + 1, y]);
            pixelStack.push([x - 1, y]);
            pixelStack.push([x, y + 1]);
            pixelStack.push([x, y - 1]);
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    // Вспомогательные функции для заливки
    function getPixelColor(imageData, x, y) {
        const pos = (y * canvas.width + x) * 4;
        return {
            r: imageData.data[pos],
            g: imageData.data[pos + 1],
            b: imageData.data[pos + 2],
            a: imageData.data[pos + 3]
        };
    }

    function setPixelColor(imageData, pos, color) {
        const rgb = hexToRgb(color);
        imageData.data[pos] = rgb.r;
        imageData.data[pos + 1] = rgb.g;
        imageData.data[pos + 2] = rgb.b;
        imageData.data[pos + 3] = 255;
    }

    function pixelInBounds(x, y) {
        return x >= 0 && y >= 0 && x < canvas.width && y < canvas.height;
    }

    function colorsMatch(color1, color2, tolerance = 0) {
        return Math.abs(color1.r - color2.r) <= tolerance &&
               Math.abs(color1.g - color2.g) <= tolerance &&
               Math.abs(color1.b - color2.b) <= tolerance &&
               Math.abs(color1.a - color2.a) <= tolerance;
    }

    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    }

    // Обработчики рисования
    function startDrawing(e) {
        if (currentTool === 'fill') {
            const [x, y] = getMousePos(e);
            floodFill(x, y, currentColor, 10);
            drawingHistory.saveState();
            return;
        }
        
        isDrawing = true;
        [lastX, lastY] = getMousePos(e);
        drawingHistory.saveState();
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        ctx.lineWidth = currentSize;
        ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = currentTool === 'brush' ? 0.7 : 1.0;
        
        const [x, y] = getMousePos(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        [lastX, lastY] = [x, y];
    }
    
    function stopDrawing() {
        if (isDrawing) {
            isDrawing = false;
            drawingHistory.saveState();
        }
    }
    
    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return [
            (e.clientX - rect.left) * scaleX,
            (e.clientY - rect.top) * scaleY
        ];
    }
    
    // Горячие клавиши (Ctrl+Z, Ctrl+Y)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (!drawingHistory.undo()) showNotification('Нечего отменять');
        }
        else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
            e.preventDefault();
            if (!drawingHistory.redo()) showNotification('Нечего повторить');
        }
    });

    // Выбор инструментов
    tools.forEach(tool => {
        tool.addEventListener('click', function() {
            tools.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentTool = this.id;
        });
    });
    
    // Настройки инструментов
    colorPicker.addEventListener('input', function() {
        currentColor = this.value;
    });
    
    brushSize.addEventListener('input', function() {
        currentSize = this.value;
        sizeValue.textContent = this.value + 'px';
    });
    
    // Очистка холста
    clearBtn.addEventListener('click', function() {
        if (confirm('Очистить весь рисунок?')) {
            initializeCanvas();
            drawingHistory.clear();
            drawingHistory.saveState();
        }
    });
    
    // Сохранение PNG с белым фоном
    saveBtn.addEventListener('click', function() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 1. Заполняем белым фоном
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // 2. Копируем рисунок с основного canvas
        tempCtx.drawImage(canvas, 0, 0);
        
        // 3. Создаем ссылку для скачивания
        const link = document.createElement('a');
        link.download = 'узор-' + new Date().toISOString().slice(0, 10) + '.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
        
        showNotification('Рисунок сохранен с белым фоном!');
    });
    
    // Всплывающие уведомления
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = '#2ecc71';
        notification.style.color = '#fff';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        notification.style.fontWeight = 'bold';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
    
    // Настройка размеров canvas
    function setupCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = Math.floor(canvas.width * 0.75);
        initializeCanvas();
    }
    
    // Инициализация и обработчики событий
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    
    // Мышь
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Сенсорные устройства
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        canvas.dispatchEvent(new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        }));
    });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        canvas.dispatchEvent(new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        }));
    });
    
    canvas.addEventListener('touchend', function() {
        canvas.dispatchEvent(new MouseEvent('mouseup', {}));
    });
});