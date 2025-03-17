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
    function addEditingFeatures(html) {
        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Add CSS styles
        const newStyle = `
        /* Edit/Delete Button Styles */
        .edit-button { background-color: #ffc107 !important; }
        .delete-button { background-color: #dc3545 !important; }
        .edit-button:hover { background-color: #e0a800 !important; }
        .delete-button:hover { background-color: #c82333 !important; }
        
        /* Edit Mode Styles */
        .editable { border: 1px dashed #999; padding: 2px; min-width: 50px; }
        .edit-textarea { width: 100%; height: 150px; padding: 10px; margin: 10px 0; border: 1px solid #ccc; }
        #export-button { margin-top: 20px; padding: 10px 20px; background-color: #28a745; color: white; 
                        border: none; border-radius: 5px; cursor: pointer; }
        `;
        
        const styleTag = doc.createElement('style');
        styleTag.textContent = newStyle;
        doc.head.appendChild(styleTag);

        // Add JavaScript
        const jsCode = `
        function deleteItem(button) {
            const item = button.closest('.item');
            item.remove();
        }

        function toggleEdit(button) {
            const item = button.closest('.item');
            const desc = item.querySelector('.item-description p');
            const title = item.querySelector('.item-title');
            const price = item.querySelector('.item-price');
            const whatsappPrice = item.querySelector('.whatsapp-price');
            const savePrice = item.querySelector('.save-price');

            if (!item.classList.contains('editing')) {
                const textarea = document.createElement('textarea');
                textarea.className = 'edit-textarea';
                textarea.value = desc ? desc.textContent : '';
                if (desc) {
                    desc.parentNode.replaceChild(textarea, desc);
                }
                
                if (title) title.contentEditable = true;
                if (price) price.contentEditable = true;
                if (whatsappPrice) whatsappPrice.contentEditable = true;
                if (savePrice) savePrice.contentEditable = true;
                
                [title, price, whatsappPrice, savePrice].forEach(el => {
                    if (el) el.classList.add('editable');
                });
                
                button.textContent = 'Save';
                item.classList.add('editing');
            } else {
                const textarea = item.querySelector('.edit-textarea');
                if (textarea) {
                    const newDesc = document.createElement('p');
                    newDesc.textContent = textarea.value;
                    textarea.parentNode.replaceChild(newDesc, textarea);
                }
                
                [title, price, whatsappPrice, savePrice].forEach(el => {
                    if (el) {
                        el.contentEditable = false;
                        el.classList.remove('editable');
                    }
                });
                
                button.textContent = 'Edit';
                item.classList.remove('editing');
            }
        }

        document.getElementById('export-button').addEventListener('click', () => {
            const clone = document.documentElement.cloneNode(true);
            clone.querySelectorAll('.edit-button, .delete-button, #export-button').forEach(el => el.remove());
            const scripts = clone.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.textContent.includes('deleteItem') || 
                    script.textContent.includes('toggleEdit')) {
                    script.remove();
                }
            });
            
            const html = \`<!DOCTYPE html>\${clone.outerHTML}\`
                .replace(/contenteditable="true"/g, '')
                .replace(/ class="editable"/g, '')
                .replace(/ class="editing"/g, '');
            
            const blob = new Blob([html], {type: 'text/html'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'edited-listings.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
        `;
        
        const scriptTag = doc.createElement('script');
        scriptTag.textContent = jsCode;
        doc.body.appendChild(scriptTag);

        // Add export button
        let headerControls = doc.querySelector('.header-controls-container');
        if (!headerControls) {
            headerControls = doc.createElement('div');
            headerControls.className = 'header-controls-container';
            doc.body.insertBefore(headerControls, doc.body.firstChild);
        }
        
        const exportBtn = doc.createElement('button');
        exportBtn.id = 'export-button';
        exportBtn.textContent = 'Export Clean Version';
        headerControls.appendChild(exportBtn);

        // Add edit/delete buttons to each item
        const items = doc.querySelectorAll('.item');
        items.forEach(item => {
            let buttonsDiv = item.querySelector('.item-buttons');
            if (!buttonsDiv) {
                buttonsDiv = doc.createElement('div');
                buttonsDiv.className = 'item-buttons';
                item.appendChild(buttonsDiv);
            }
            
            // Create edit button
            const editBtn = doc.createElement('button');
            editBtn.className = 'item-button edit-button';
            editBtn.setAttribute('onclick', 'toggleEdit(this)');
            editBtn.textContent = 'Edit';
            
            // Create delete button
            const deleteBtn = doc.createElement('button');
            deleteBtn.className = 'item-button delete-button';
            deleteBtn.setAttribute('onclick', 'deleteItem(this)');
            deleteBtn.textContent = 'Delete';
            
            // Append buttons
            buttonsDiv.appendChild(editBtn);
            buttonsDiv.appendChild(deleteBtn);
        });

        // Return modified HTML
        return '<!DOCTYPE html>' + doc.documentElement.outerHTML;
    }

    // Display HTML in iframe
    function displayInIframe(html) {
        const iframe = previewFrame;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
    }

    // Export button
    exportButton.addEventListener('click', function() {
        const iframe = previewFrame;
        const iframeWindow = iframe.contentWindow;
        
        if (iframeWindow && iframeWindow.document.getElementById('export-button')) {
            iframeWindow.document.getElementById('export-button').click();
        } else {
            showError('Export function not available in the preview.');
        }
    });

    // Get code button
    getCodeButton.addEventListener('click', function() {
        const iframe = previewFrame;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const html = '<!DOCTYPE html>' + iframeDoc.documentElement.outerHTML;
        
        codeOutput.value = html;
        codeModal.style.display = 'flex';
    });

    // Copy code button
    copyCodeBtn.addEventListener('click', function() {
        codeOutput.select();
        document.execCommand('copy');
        this.textContent = 'Copied!';
        setTimeout(() => {
            this.textContent = 'Copy Code';
        }, 2000);
    });

    // Close modal
    closeModal.addEventListener('click', function() {
        codeModal.style.display = 'none';
    });

    // Close modal on outside click
    window.addEventListener('click', function(e) {
        if (e.target === codeModal) {
            codeModal.style.display = 'none';
        }
    });

    // Reset button
    resetButton.addEventListener('click', function() {
        outputSection.style.display = 'none';
        htmlInput.value = '';
        fileInput.value = '';
        const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
        if (activeTab === 'upload') {
            fileDropArea.classList.remove('highlight');
        }
    });

    // Error handling
    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.style.display = 'block';
    }

    errorCloseBtn.addEventListener('click', function() {
        errorContainer.style.display = 'none';
    });

    // Loading functions
    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        loadingOverlay.style.display = 'none';
    }
});
