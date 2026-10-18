const tabsContainer = document.querySelector('#tabs');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

const topLeft = document.querySelector('#top-left');
const topRight = document.querySelector('#top-right');
const bottomRight = document.querySelector('#bottom-right');
const bottomLeft = document.querySelector('#bottom-left');

const topLeftValue = document.querySelector('#top-left-value');
const topRightValue = document.querySelector('#top-right-value');
const bottomRightValue = document.querySelector('#bottom-right-value');
const bottomLeftValue = document.querySelector('#bottom-left-value');

const padding = document.querySelector('#padding');
const paddingValue = document.querySelector('#padding-value');
const textTransform = document.querySelector('#text-transform');

const rangeInputs = document.querySelectorAll('input[type="range"]');

const preview = document.querySelector('#preview');
const previewButton = document.querySelector('#preview-button');
const coordinates = document.querySelector('#coordinates');

const cssCode = document.querySelector('#css-code');
const copyButton = document.querySelector('#copy-button');
const copyMessage = document.querySelector('#copy-message');

const presetForm = document.querySelector('#preset-form');
const presetName = document.querySelector('#preset-name');
const presetError = document.querySelector('#preset-error');

const scrollTopButton = document.querySelector('#scroll-top');

function hideTabs() {
    tabs.forEach(function (tab) {
        tab.classList.remove('active');
    });

    tabContents.forEach(function (content) {
        content.classList.remove('active');
    });
}

function showTab(tabName) {
    const tab = document.querySelector(`[data-tab="${tabName}"]`);
    const content = document.querySelector(`[data-content="${tabName}"]`);

    if (tab) {
        tab.classList.add('active');
    }

    if (content) {
        content.classList.add('active');
    }
}

function handleTabsClick(event) {
    console.log(event.type);
    console.log(event.target);
    console.log(event.currentTarget);

    if (!event.target.classList.contains('tab')) {
        return;
    }

    const tabName = event.target.dataset.tab;

    hideTabs();
    showTab(tabName);
}

function getRadius() {
    return `${topLeft.value}px ${topRight.value}px ${bottomRight.value}px ${bottomLeft.value}px`;
}

function updateCssCode() {
    const lines = [
        `border-radius: ${getRadius()};`,
        `padding: ${padding.value}px;`,
        `text-transform: ${textTransform.value};`
    ];

    cssCode.value = lines.join('\n');
}

function generateBorderRadius() {
    preview.style.borderRadius = getRadius();

    topLeftValue.textContent = `${topLeft.value} px`;
    topRightValue.textContent = `${topRight.value} px`;
    bottomRightValue.textContent = `${bottomRight.value} px`;
    bottomLeftValue.textContent = `${bottomLeft.value} px`;

    updateCssCode();
}

function generatePadding() {
    preview.style.padding = `${padding.value}px`;
    paddingValue.textContent = `${padding.value} px`;

    updateCssCode();
}

function generateTextTransform() {
    preview.style.textTransform = textTransform.value;

    updateCssCode();
}

function showCopyMessage(text) {
    copyMessage.textContent = text;

    setTimeout(function () {
        copyMessage.textContent = '';
    }, 2000);
}

function copyWithSelection() {
    cssCode.select();

    const copied = typeof document.execCommand === 'function' && document.execCommand('copy');

    if (copied) {
        showCopyMessage('CSS-код скопійовано');
    } else {
        showCopyMessage('Не вдалося скопіювати CSS-код');
    }
}

function copyCSS() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cssCode.value)
            .then(function () {
                showCopyMessage('CSS-код скопійовано');
            })
            .catch(copyWithSelection);
    } else {
        copyWithSelection();
    }
}

function validatePresetName() {
    if (presetName.value.trim() === '') {
        presetName.classList.add('error');
        presetError.textContent = 'Введіть назву пресета';
        return false;
    }

    presetName.classList.remove('error');
    presetError.textContent = '';
    return true;
}

function handlePresetFocus() {
    presetName.classList.add('focused');
}

function handlePresetBlur() {
    presetName.classList.remove('focused');
    validatePresetName();
}

function handlePresetSubmit(event) {
    event.preventDefault();

    if (!validatePresetName()) {
        return;
    }

    console.log(`Пресет: ${presetName.value.trim()}`);
    console.log(cssCode.value);
}

function handleKeyDown(event) {
    if (event.key !== 'Escape') {
        return;
    }

    rangeInputs.forEach(function (range) {
        range.value = 0;
    });

    generateBorderRadius();
    generatePadding();
}

function handlePreviewClick() {
    console.log('Preview click');
}

function handleButtonClick(event) {
    event.stopPropagation();
    console.log('Button click');
}

function handlePreviewMouseOver() {
    preview.classList.add('hovered');
}

function handlePreviewMouseOut(event) {
    if (preview.contains(event.relatedTarget)) {
        return;
    }

    preview.classList.remove('hovered');
}

function handlePreviewMouseMove(event) {
    coordinates.textContent = `X: ${event.clientX}; Y: ${event.clientY}`;
    console.log(`pageX: ${event.pageX}; pageY: ${event.pageY}`);
}

function handleScroll() {
    if (window.scrollY > 300) {
        scrollTopButton.classList.add('visible');
    } else {
        scrollTopButton.classList.remove('visible');
    }
}

function handleScrollTopClick() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function init() {
    console.log('DOM готовий');

    tabsContainer.addEventListener('click', handleTabsClick);

    topLeft.addEventListener('input', generateBorderRadius);
    topRight.addEventListener('input', generateBorderRadius);
    bottomRight.addEventListener('input', generateBorderRadius);
    bottomLeft.addEventListener('input', generateBorderRadius);

    padding.addEventListener('input', generatePadding);
    textTransform.addEventListener('change', generateTextTransform);

    copyButton.addEventListener('click', copyCSS);

    presetName.addEventListener('focus', handlePresetFocus);
    presetName.addEventListener('blur', handlePresetBlur);
    presetForm.addEventListener('submit', handlePresetSubmit);

    document.addEventListener('keydown', handleKeyDown);

    preview.addEventListener('click', handlePreviewClick);
    previewButton.addEventListener('click', handleButtonClick);
    preview.addEventListener('mouseover', handlePreviewMouseOver);
    preview.addEventListener('mouseout', handlePreviewMouseOut);
    preview.addEventListener('mousemove', handlePreviewMouseMove);

    window.addEventListener('scroll', handleScroll);
    scrollTopButton.addEventListener('click', handleScrollTopClick);

    generateBorderRadius();
    generatePadding();
    generateTextTransform();
}

document.addEventListener('DOMContentLoaded', init);

window.addEventListener('load', function () {
    console.log('Сторінка завантажена');
});