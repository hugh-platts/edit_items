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
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        fileDropArea.classList.add('highlight');
    }

    function unhighlight() {
        fileDropArea.classList.remove('highlight');
    }

    fileDropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length === 0) return;
        const file = files[0];
        if (!file.type.match('text/html') && !file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
            showError('Please upload an HTML file.');
            return;
        }
        readFile(file);
    }

    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFiles(this.files);
        }
    });

    selectFileBtn.addEventListener('click', function() {
        fileInput.click();
    });

    // Process HTML button
    processHtmlBtn.addEventListener('click', function() {
        const htmlContent = htmlInput.value.trim();
        if (!htmlContent) {
            showError('Please paste HTML content.');
            return;
        }
        processHtml(htmlContent);
    });

    // Handle file reading
    function readFile(file) {
        showLoading();
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            processHtml(content);
        };
        reader.onerror = function() {
            hideLoading();
            showError('Error reading file.');
        };
        reader.readAsText(file);
    }

    // Process HTML content
    function processHtml(html) {
        try {
            showLoading();
            // Validate HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Check for parsing errors
            const parserErrors = doc.querySelectorAll('parsererror');
            if (parserErrors.length > 0) {
                throw new Error('Invalid HTML format');
            }
            
            // Add editing features
            const modifiedHtml = addEditingFeatures(html);
            
            // Display in iframe
            displayInIframe(modifiedHtml);
            
            // Show output section
            outputSection.style.display = 'block';
            
            // Scroll to output
            outputSection.scrollIntoView({ behavior: 'smooth' });
            
            hideLoading();
        } catch (error) {
            hideLoading();
            showError('Error processing HTML: ' + error.message);
        }
    }

    // Add editing features to HTML
    function ad
