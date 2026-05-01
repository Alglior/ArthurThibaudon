const years = [2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022];
let currentYearIndex = 0;
let interval = null;
let isPlaying = false;
let isComparisonMode = false;

let storedSplitPosition = 50;
let storedSplitOrientation = 'vertical';

const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const leftYearSelect = document.getElementById('leftYearSelect');
const rightYearSelect = document.getElementById('rightYearSelect');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const leftFrame = document.getElementById('leftFrame');
const rightFrame = document.getElementById('rightFrame');
const controlPanel = document.getElementById('controlPanel');
const toggleButton = document.getElementById('toggleButton');
const compareButton = document.getElementById('compareButton');
const mapContainer = document.querySelector('.map-container');
const comparisonDivider = document.querySelector('.comparison-divider');
const closeBtn = document.getElementById('closeTitle');
const reopenBtn = document.getElementById('reopenTitle');
const titleBox = document.getElementById('title');

closeBtn.addEventListener('click', () => {
    titleBox.classList.add('hidden');
    reopenBtn.classList.add('visible');
});

reopenBtn.addEventListener('click', () => {
    titleBox.classList.remove('hidden');
    reopenBtn.classList.remove('visible');
});

toggleButton.addEventListener('click', () => {
    controlPanel.classList.toggle('closed');
    toggleButton.classList.toggle('closed');
});

compareButton.addEventListener('click', toggleComparisonMode);

let isHorizontalSplit = false;

function updateDividerHandle() {
    const handle = comparisonDivider.querySelector('.divider-handle');
    if (isHorizontalSplit) {
        handle.style.left = '50%';
        handle.style.top = '50%';
        handle.innerHTML = '&#8945;';
    } else {
        handle.style.left = '50%';
        handle.style.top = '50%';
        handle.innerHTML = '&#8942;';
    }
}

function toggleComparisonMode() {
    if (isComparisonMode) {
        if (isHorizontalSplit) {
            storedSplitPosition = (parseFloat(leftFrame.style.height) || 50);
        } else {
            storedSplitPosition = (parseFloat(leftFrame.style.width) || 50);
        }
        storedSplitOrientation = isHorizontalSplit ? 'horizontal' : 'vertical';
        
        comparisonDivider.classList.add('deactivating');
        
        setTimeout(() => {
            isComparisonMode = false;
            mapContainer.classList.remove('comparison-mode');
            comparisonDivider.classList.remove('active', 'deactivating');
            rightYearSelect.disabled = true;
            splitOrientationButton.style.display = 'none';
            document.getElementById('rightYearGroup').classList.remove('active');
            
            leftFrame.style.width = '100%';
            leftFrame.style.height = '100vh';
            rightFrame.style.width = '100%';
            rightFrame.style.height = '100vh';
            comparisonDivider.style.left = '50%';
            comparisonDivider.style.top = '50%';
            
            isHorizontalSplit = false;
            mapContainer.classList.remove('horizontal');
            comparisonDivider.classList.remove('horizontal');
            splitOrientationButton.innerHTML = '<i class="fas fa-arrows-alt-h"></i> Division Verticale';
            
            updateDividerHandle();
        }, 300);
    } else {
        isComparisonMode = true;
        mapContainer.classList.add('comparison-mode');
        comparisonDivider.classList.add('active');
        rightYearSelect.disabled = false;
        splitOrientationButton.style.display = 'flex';
        document.getElementById('rightYearGroup').classList.add('active');

        if (storedSplitOrientation === 'horizontal') {
            isHorizontalSplit = true;
            mapContainer.classList.add('horizontal');
            comparisonDivider.classList.add('horizontal');
            updateDividerHandle();
        }
        
        setTimeout(() => {
            if (isHorizontalSplit) {
                leftFrame.style.height = `${storedSplitPosition}%`;
                rightFrame.style.height = `${100 - storedSplitPosition}%`;
                comparisonDivider.style.top = `${storedSplitPosition}%`;
                comparisonDivider.style.left = '0';
            } else {
                leftFrame.style.width = `${storedSplitPosition}%`;
                rightFrame.style.width = `${100 - storedSplitPosition}%`;
                comparisonDivider.style.left = `${storedSplitPosition}%`;
                comparisonDivider.style.top = '0';
            }
        }, 50);
    }

    compareButton.innerHTML = isComparisonMode ?
        '<i class="fas fa-compress-alt"></i> Vue Unique' :
        '<i class="fas fa-clone"></i> Comparer les années';
}

const splitOrientationButton = document.getElementById('splitOrientationButton');
splitOrientationButton.addEventListener('click', toggleSplitOrientation);

function toggleSplitOrientation() {
    isHorizontalSplit = !isHorizontalSplit;
    mapContainer.classList.toggle('horizontal', isHorizontalSplit);
    comparisonDivider.classList.toggle('horizontal', isHorizontalSplit);

    leftFrame.style = '';
    rightFrame.style = '';
    comparisonDivider.style = '';

    if (isHorizontalSplit) {
        splitOrientationButton.innerHTML = '<i class="fas fa-arrows-alt-v"></i> Division Horizontale';
        comparisonDivider.style.cursor = 'default';
        comparisonDivider.style.top = '50%';
        comparisonDivider.style.left = '0';
        leftFrame.style.height = '50%';
        rightFrame.style.height = '50%';
    } else {
        splitOrientationButton.innerHTML = '<i class="fas fa-arrows-alt-h"></i> Division Verticale';
        comparisonDivider.style.cursor = 'default';
        comparisonDivider.style.left = '50%';
        comparisonDivider.style.top = '0';
        leftFrame.style.width = '50%';
        rightFrame.style.width = '50%';
    }
    
    updateDividerHandle();
}

let isDragging = false;

function onDrag(e) {
    return;
}

function stopDrag() {
    return;
}

function resetToInitialState() {
    currentYearIndex = 0;
    changeYear('left', years[0]);
    changeYear('right', years[0]);
    speedSlider.value = "1";
    updateSpeedDisplay();
    isPlaying = false;
    updatePlayButton();
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
    isHorizontalSplit = false;
    mapContainer.classList.remove('horizontal');
    comparisonDivider.classList.remove('horizontal');
}

window.addEventListener('load', resetToInitialState);

window.addEventListener('beforeunload', () => {
    if (interval) {
        clearInterval(interval);
    }
});

function updateSpeedDisplay() {
    speedValue.textContent = speedSlider.value + 'x';
}

function getInterval() {
    return 1500 / parseFloat(speedSlider.value);
}

speedSlider.addEventListener('input', () => {
    updateSpeedDisplay();
    if (isPlaying) {
        clearInterval(interval);
        startInterval();
    }
});

function changeYear(side, year) {
    const frame = side === 'left' ? leftFrame : rightFrame;
    
    frame.classList.add('loading');
    
    setTimeout(() => {
        frame.src = `maps/map_${year}.html`;
        if (side === 'left') {
            leftYearSelect.value = year;
            currentYearIndex = years.indexOf(parseInt(year));
        } else {
            rightYearSelect.value = year;
        }
        
        frame.onload = () => {
            setTimeout(() => {
                frame.classList.remove('loading');
            }, 50);
        };
    }, 300);
}

function nextYear() {
    currentYearIndex++;
    if (currentYearIndex >= years.length) {
        currentYearIndex = 0;
    }
    
    const nextYear = years[currentYearIndex];
    changeYear('left', nextYear);
    if (isComparisonMode) {
        const prevYear = years[Math.max(0, currentYearIndex - 1)];
        changeYear('right', prevYear);
    }
    return true;
}

function startInterval() {
    const transitionDuration = 800;
    
    interval = setInterval(() => {
        nextYear();
    }, Math.max(getInterval(), transitionDuration));
}

function togglePlay() {
    if (!isPlaying) {
        isPlaying = true;
        updatePlayButton();
        startInterval();
        
        leftFrame.contentWindow.postMessage({ type: 'playbackState', isPlaying: true }, '*');
        if (isComparisonMode) {
            rightFrame.contentWindow.postMessage({ type: 'playbackState', isPlaying: true }, '*');
        }
    } else {
        pauseYears();
    }
}

function updatePlayButton() {
    playBtn.innerHTML = isPlaying ? 
        '<i class="fas fa-pause"></i> Pause' :
        '<i class="fas fa-play"></i> Play';
    stopBtn.disabled = !isPlaying;
}

function pauseYears() {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
    isPlaying = false;
    updatePlayButton();
    
    leftFrame.contentWindow.postMessage({ type: 'playbackState', isPlaying: false }, '*');
    if (isComparisonMode) {
        rightFrame.contentWindow.postMessage({ type: 'playbackState', isPlaying: false }, '*');
    }
}

function stopYears() {
    pauseYears();
    currentYearIndex = 0;
    changeYear('left', years[0]);
    if (isComparisonMode) {
        changeYear('right', years[0]);
    }
    speedSlider.value = "1";
    updateSpeedDisplay();
}

window.addEventListener('message', (event) => {
    if (event.data.type === 'mapMove') {
        return;
    }
    
    if (event.data.type === 'playbackState') {
        const sourceFrame = event.source;
        const targetFrame = sourceFrame === leftFrame.contentWindow ? rightFrame : leftFrame;
        
        if (sourceFrame) {
            sourceFrame.postMessage({
                type: 'playbackStateUpdate',
                isPlaying: event.data.isPlaying
            }, '*');
        }
    }
});

const legendContainer = document.querySelector('.legend-container');
const closeLegendBtn = document.getElementById('closeLegend');
const showLegendBtn = document.getElementById('showLegend');

closeLegendBtn.addEventListener('click', () => {
    legendContainer.classList.add('hidden');
    showLegendBtn.classList.add('visible');
});

showLegendBtn.addEventListener('click', () => {
    legendContainer.classList.remove('hidden');
    showLegendBtn.classList.remove('visible');
});

resetToInitialState();
