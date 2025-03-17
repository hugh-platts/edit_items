document.addEventListener('DOMContentLoaded', function() {
    // Element references
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const fileDropArea = document.querySelector('.file-drop-area');
    const fileInput = document.querySelector('.file-input');
    const selectFileBtn = document.querySelector('.select-file-btn');
    const htmlInput = document.getElementById('html-input');
    const processHtmlBtn = document.getElementById('process-html-btn');
    const outputSection = document.querySelector('.output-section');
    const previewFrame = document.getElementById('preview-frame');
    const exportButton = document.getElementById('export-button');
    const getCodeButton = document.getElementById('get-code-button');
    const resetButton = document.getElementById('reset-button');
    const codeModal = document.querySelector('.code-modal');
    const codeOutput = document.getElementById('code-output');
    const copyCodeBtn = document.getElementById('copy-code-btn');
    const closeModal = document.querySelector('.close-modal');
    const loadingOverlay = document.querySelector('.loading-overlay');
    const errorContainer = document.querySelector('.error-container');
    const errorMessage = document.getElementById('error-message');
    const errorCloseBtn = document.getElementById('error-close-btn');

    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.add('active');
        });
    });

    // File drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop
