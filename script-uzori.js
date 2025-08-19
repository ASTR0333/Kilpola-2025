document.addEventListener('DOMContentLoaded', function() {
    // Инициализация элементов
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('color-picker');
    const clearBtn = document.getElementById('clear');
    const saveBtn = document.getElementById('save');
    
    // Настройки редактора
    let isDrawing = false;
    let currentTool = 'pencil';
    let currentColor = '#000000';
    const gridSize = 20; // Размер клетки 20x20 пикселей
    const gridColor = '#e0e0e0';

    // История действий для отмены/повтора
    const drawingHistory = {
        states: [],
        currentState: -1,
        
        saveState: function() {
            if (this.currentState < this.states.length - 1) {
                this.states = this.states.slice(0, this.currentState + 1);
            }
            this.states.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            this.currentState++;
        },
        
        undo: function() {
            if (this.currentState > 0) {
                this.currentState--;
                ctx.putImageData(this.states[this.currentState], 0, 0);
                drawGrid();
                return true;
            }
            return false;
        },
        
        redo: function() {
            if (this.currentState < this.states.length - 1) {
                this.currentState++;
                ctx.putImageData(this.states[this.currentState], 0, 0);
                drawGrid();
                return true;
            }
            return false;
        }
    };

    // Инициализация холста
    function initCanvas() {
        const container = document.querySelector('.canvas-container');
        canvas.width = Math.floor((container.clientWidth - 20) / gridSize) * gridSize;
        canvas.height = Math.floor((container.clientHeight - 20) / gridSize) * gridSize;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        drawingHistory.saveState();
    }

    // Рисование сетки
    function drawGrid() {
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        
        // Вертикальные линии
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Горизонтальные линии
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    // Закрашивание пикселей
    function drawPixel(x, y) {
        const pixelX = Math.floor(x / gridSize) * gridSize;
        const pixelY = Math.floor(y / gridSize) * gridSize;
        
        ctx.fillStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;
        ctx.fillRect(pixelX, pixelY, gridSize, gridSize);
        
        // Восстанавливаем границу клетки
        ctx.strokeStyle = gridColor;
        ctx.strokeRect(pixelX, pixelY, gridSize, gridSize);
    }

    // Улучшенная заливка области (заливка с границами)
    function floodFill(startX, startY) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const targetColor = getColorAtPixel(imageData, startX, startY);
        const fillColor = hexToRgb(currentColor);
        const borderColor = hexToRgb('#000000'); // Цвет границы
        
        if (colorsMatch(targetColor, fillColor)) return;
        
        const stack = [[startX, startY]];
        const width = canvas.width;
        const height = canvas.height;
        const visited = new Set();
        
        while (stack.length) {
            const [x, y] = stack.pop();
            const pixelPos = (y * width + x) * 4;
            const key = `${x},${y}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            if (x < 0 || x >= width || y < 0 || y >= height) continue;
            
            const currentColor = getColorAtPixel(imageData, x, y);
            
            // Проверяем, не является ли текущий пиксель границей
            if (colorsMatch(currentColor, borderColor)) continue;
            
            // Проверяем, совпадает ли цвет с целевым
            if (!colorsMatch(currentColor, targetColor)) continue;
            
            // Закрашиваем пиксель
            imageData.data[pixelPos] = fillColor.r;
            imageData.data[pixelPos + 1] = fillColor.g;
            imageData.data[pixelPos + 2] = fillColor.b;
            imageData.data[pixelPos + 3] = 255;
            
            // Добавляем соседние пиксели
            stack.push([x + gridSize, y]);
            stack.push([x - gridSize, y]);
            stack.push([x, y + gridSize]);
            stack.push([x, y - gridSize]);
        }
        
        ctx.putImageData(imageData, 0, 0);
        drawGrid();
    }

    // Вспомогательные функции
    function getColorAtPixel(imageData, x, y) {
        const pos = (Math.floor(y / gridSize) * gridSize * canvas.width + Math.floor(x / gridSize) * gridSize) * 4;
        return {
            r: imageData.data[pos],
            g: imageData.data[pos + 1],
            b: imageData.data[pos + 2],
            a: imageData.data[pos + 3]
        };
    }

    function hexToRgb(hex) {
        hex = hex.replace('#', '');
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    }

    function colorsMatch(c1, c2) {
        return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b;
    }

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        return [
            (e.clientX - rect.left) * (canvas.width / rect.width),
            (e.clientY - rect.top) * (canvas.height / rect.height)
        ];
    }

    // Обработчики событий
    canvas.addEventListener('mousedown', (e) => {
        const [x, y] = getMousePos(e);
        
        if (currentTool === 'fill') {
            floodFill(x, y);
            drawingHistory.saveState();
            return;
        }
        
        isDrawing = true;
        drawPixel(x, y);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const [x, y] = getMousePos(e);
        drawPixel(x, y);
    });

    canvas.addEventListener('mouseup', () => {
        if (isDrawing) {
            isDrawing = false;
            drawingHistory.saveState();
        }
    });

    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
    });

    // Touch поддержка
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        canvas.dispatchEvent(new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        }));
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        canvas.dispatchEvent(new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        }));
    });

    canvas.addEventListener('touchend', () => {
        canvas.dispatchEvent(new MouseEvent('mouseup'));
    });

    // Инструменты
    document.querySelectorAll('.tools button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tools button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.id;
        });
    });

    // Настройки
    colorPicker.addEventListener('input', (e) => {
        currentColor = e.target.value;
    });

    // Кнопки
    clearBtn.addEventListener('click', () => {
        if (confirm('Очистить холст?')) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawGrid();
            drawingHistory.saveState();
        }
    });

    saveBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `pixel-art-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // Горячие клавиши
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            drawingHistory.undo();
        }
    });

    // Инициализация
    initCanvas();
    window.addEventListener('resize', initCanvas);
});