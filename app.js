// Integrated Folder & Drip Scheduler Application
class IntegratedScheduler {
    constructor() {
        // API endpoints
        this.FOLDER_API = 'https://automation.core.genius365.ai/webhook/form-options';
        this.SUBMIT_API = 'https://automation.core.genius365.ai/webhook/5c71a1df-7a00-4660-b22e-d1aa8107a7a2';

        // DOM elements
        this.form = document.getElementById('integratedForm');
        this.folderSelect = document.getElementById('folderSelect');
        this.folderLoadStatus = document.getElementById('folderLoadStatus');
        this.previewSection = document.getElementById('previewSection');
        this.previewSummary = document.getElementById('previewSummary');
        this.previewTimeline = document.getElementById('previewTimeline');
        this.statusMessage = document.getElementById('statusMessage');

        this.initialize();
    }

    async initialize() {
        this.initializeEventListeners();
        this.setDefaultDates();
        await this.loadFolderOptions();
        this.loadSavedConfig();
    }

    initializeEventListeners() {
        // Mode switching - toggle buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = btn.dataset.mode;

                // Update active state
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update hidden input
                document.getElementById('modeInput').value = mode;

                // Toggle settings display
                this.toggleModeSettings();
            });
        });

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Preview button
        document.getElementById('previewBtn').addEventListener('click', () => this.generatePreview());

        // Auto-save on input changes
        this.form.addEventListener('input', () => this.autoSave());
        this.form.addEventListener('change', () => this.autoSave());

        // Date validation
        document.getElementById('startDate').addEventListener('change', () => this.validateDates());
        document.getElementById('endDate').addEventListener('change', () => this.validateDates());
    }

    // Load folder options from API
    async loadFolderOptions() {
        try {
            this.showFolderStatus('Loading folders...', 'info');

            const response = await fetch(this.FOLDER_API);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Clear loading option
            this.folderSelect.innerHTML = '<option value="">-- Select a folder --</option>';

            // Populate select with options from API
            data.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.label;
                this.folderSelect.appendChild(optionElement);
            });

            this.showFolderStatus('Folders loaded successfully', 'success');
            setTimeout(() => this.clearFolderStatus(), 3000);

        } catch (error) {
            console.error('Error fetching folders:', error);
            this.folderSelect.innerHTML = '<option value="">Error loading folders</option>';
            this.showFolderStatus('Failed to load folders. Please refresh.', 'error');
        }
    }

    showFolderStatus(message, type) {
        this.folderLoadStatus.textContent = message;
        this.folderLoadStatus.className = `inline-status ${type}`;
        this.folderLoadStatus.style.display = 'block';
    }

    clearFolderStatus() {
        this.folderLoadStatus.style.display = 'none';
    }

    setDefaultDates() {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        document.getElementById('startDate').value = this.formatDate(today);
        document.getElementById('endDate').value = this.formatDate(nextWeek);
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    toggleModeSettings() {
        const mode = document.getElementById('modeInput').value;
        const manualSettings = document.getElementById('manualSettings');
        const automatedSettings = document.getElementById('automatedSettings');

        if (mode === 'manual') {
            manualSettings.style.display = 'block';
            automatedSettings.style.display = 'none';
        } else {
            manualSettings.style.display = 'none';
            automatedSettings.style.display = 'block';
        }
    }

    validateDates() {
        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);

        if (endDate <= startDate) {
            this.showStatus('End date must be after start date', 'error');
            return false;
        }
        return true;
    }

    getFormData() {
        const mode = document.getElementById('modeInput').value;
        const selectedDays = Array.from(document.querySelectorAll('input[name="days"]:checked'))
            .map(cb => cb.value);

        const folderValue = this.folderSelect.value;
        const folderLabel = this.folderSelect.options[this.folderSelect.selectedIndex]?.text;

        const baseConfig = {
            folder: {
                value: folderValue,
                label: folderLabel
            },
            mode: mode,
            dateRange: {
                start: document.getElementById('startDate').value,
                end: document.getElementById('endDate').value
            },
            schedule: {
                allowedDays: selectedDays,
                timeRange: {
                    from: document.getElementById('timeFrom').value,
                    to: document.getElementById('timeTo').value
                }
            },
            webhookUrl: document.getElementById('webhookUrl')?.value || ''
        };

        if (mode === 'manual') {
            baseConfig.manual = {
                batchSize: parseInt(document.getElementById('batchSize').value),
                frequencyHours: parseFloat(document.getElementById('frequency').value)
            };
        } else {
            baseConfig.automated = {
                totalCount: parseInt(document.getElementById('totalCount').value)
            };
        }

        return baseConfig;
    }

    // Calculate available time slots
    calculateTimeSlots(config) {
        const slots = [];
        const startDate = new Date(config.dateRange.start + 'T00:00:00');
        const endDate = new Date(config.dateRange.end + 'T23:59:59');

        const [fromHour, fromMinute] = config.schedule.timeRange.from.split(':').map(Number);
        const [toHour, toMinute] = config.schedule.timeRange.to.split(':').map(Number);

        const dayMap = {
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
            'thursday': 4, 'friday': 5, 'saturday': 6
        };

        const allowedDayNumbers = config.schedule.allowedDays.map(day => dayMap[day]);

        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay();

            if (allowedDayNumbers.includes(dayOfWeek)) {
                const slotDate = new Date(currentDate);
                slotDate.setHours(fromHour, fromMinute, 0, 0);

                if (slotDate >= startDate && slotDate <= endDate) {
                    slots.push(new Date(slotDate));
                }
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return slots;
    }

    // Calculate schedule for manual mode
    calculateManualSchedule(config) {
        const executions = [];
        const startDate = new Date(config.dateRange.start + 'T00:00:00');
        const endDate = new Date(config.dateRange.end + 'T23:59:59');
        const frequencyMs = config.manual.frequencyHours * 60 * 60 * 1000;

        const [fromHour, fromMinute] = config.schedule.timeRange.from.split(':').map(Number);
        const [toHour, toMinute] = config.schedule.timeRange.to.split(':').map(Number);

        const dayMap = {
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
            'thursday': 4, 'friday': 5, 'saturday': 6
        };

        const allowedDayNumbers = config.schedule.allowedDays.map(day => dayMap[day]);

        let currentDate = new Date(startDate);
        currentDate.setHours(fromHour, fromMinute, 0, 0);

        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay();
            const currentHour = currentDate.getHours();
            const currentMinute = currentDate.getMinutes();
            const currentTimeInMinutes = currentHour * 60 + currentMinute;
            const fromTimeInMinutes = fromHour * 60 + fromMinute;
            const toTimeInMinutes = toHour * 60 + toMinute;

            if (allowedDayNumbers.includes(dayOfWeek) &&
                currentTimeInMinutes >= fromTimeInMinutes &&
                currentTimeInMinutes <= toTimeInMinutes) {

                executions.push({
                    timestamp: new Date(currentDate),
                    batchSize: config.manual.batchSize
                });
            }

            currentDate = new Date(currentDate.getTime() + frequencyMs);

            // If we've moved past the end time or to next day, skip to next allowed day
            const newHour = currentDate.getHours();
            const newMinute = currentDate.getMinutes();
            const newTimeInMinutes = newHour * 60 + newMinute;

            if (newTimeInMinutes < fromTimeInMinutes || newTimeInMinutes > toTimeInMinutes) {
                // Move to next day and reset to start time
                currentDate.setDate(currentDate.getDate() + 1);
                currentDate.setHours(fromHour, fromMinute, 0, 0);
            }
        }

        return executions;
    }

    // Calculate schedule for automated mode
    calculateAutomatedSchedule(config) {
        const slots = this.calculateTimeSlots(config);
        const totalCount = config.automated.totalCount;
        const totalSlots = slots.length;

        if (totalSlots === 0) {
            return [];
        }

        const executions = [];
        const baseItemsPerSlot = Math.floor(totalCount / totalSlots);
        const remainder = totalCount % totalSlots;

        slots.forEach((slot, index) => {
            // Distribute remainder across first slots
            const batchSize = index < remainder ? baseItemsPerSlot + 1 : baseItemsPerSlot;

            if (batchSize > 0) {
                executions.push({
                    timestamp: slot,
                    batchSize: batchSize
                });
            }
        });

        return executions;
    }

    generatePreview() {
        if (!this.validateDates()) {
            return;
        }

        const config = this.getFormData();

        // Validate folder selection
        if (!config.folder.value) {
            this.showStatus('Please select a folder', 'error');
            return;
        }

        const selectedDays = config.schedule.allowedDays;

        if (selectedDays.length === 0) {
            this.showStatus('Please select at least one day to run', 'error');
            return;
        }

        let executions;
        if (config.mode === 'manual') {
            executions = this.calculateManualSchedule(config);
        } else {
            executions = this.calculateAutomatedSchedule(config);
        }

        if (executions.length === 0) {
            this.showStatus('No valid execution slots found with current settings', 'error');
            return;
        }

        this.displayPreview(config, executions);
        this.previewSection.style.display = 'block';
        this.previewSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    displayPreview(config, executions) {
        const totalExecutions = executions.length;
        const totalItems = executions.reduce((sum, exec) => sum + exec.batchSize, 0);
        const firstExecution = executions[0];
        const lastExecution = executions[executions.length - 1];

        const avgBatchSize = totalItems / totalExecutions;

        let summaryHtml = `
            <div class="preview-stats">
                <div class="stat-item">
                    <strong>Folder:</strong> ${config.folder.label}
                </div>
                <div class="stat-item">
                    <strong>Mode:</strong> ${config.mode.charAt(0).toUpperCase() + config.mode.slice(1)}
                </div>
                <div class="stat-item">
                    <strong>Total Executions:</strong> ${totalExecutions}
                </div>
                <div class="stat-item">
                    <strong>Total Items:</strong> ${totalItems}
                </div>
                <div class="stat-item">
                    <strong>Avg Batch Size:</strong> ${avgBatchSize.toFixed(1)}
                </div>
            </div>
        `;

        if (firstExecution) {
            summaryHtml += `
                <div class="preview-dates">
                    <div><strong>First Execution:</strong> ${this.formatDateTime(firstExecution.timestamp)}</div>
                    <div><strong>Last Execution:</strong> ${this.formatDateTime(lastExecution.timestamp)}</div>
                </div>
            `;
        }

        this.previewSummary.innerHTML = summaryHtml;

        let timelineHtml = '<h3>Execution Timeline (showing first 20)</h3>';
        timelineHtml += '<div class="timeline-list">';

        const displayExecutions = executions.slice(0, 20);
        displayExecutions.forEach((exec, index) => {
            timelineHtml += `
                <div class="timeline-item">
                    <div class="timeline-number">#${index + 1}</div>
                    <div class="timeline-details">
                        <div class="timeline-time">${this.formatDateTime(exec.timestamp)}</div>
                        <div class="timeline-batch">Batch: ${exec.batchSize} items</div>
                    </div>
                </div>
            `;
        });

        if (executions.length > 20) {
            timelineHtml += `
                <div class="timeline-more">
                    ... and ${executions.length - 20} more executions
                </div>
            `;
        }

        timelineHtml += '</div>';

        this.previewTimeline.innerHTML = timelineHtml;
    }

    formatDateTime(date) {
        return date.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateDates()) {
            return;
        }

        const config = this.getFormData();

        // Validate folder selection
        if (!config.folder.value) {
            this.showStatus('Please select a folder', 'error');
            return;
        }

        const selectedDays = config.schedule.allowedDays;

        if (selectedDays.length === 0) {
            this.showStatus('Please select at least one day to run', 'error');
            return;
        }

        // Calculate executions
        let executions;
        if (config.mode === 'manual') {
            executions = this.calculateManualSchedule(config);
        } else {
            executions = this.calculateAutomatedSchedule(config);
        }

        if (executions.length === 0) {
            this.showStatus('No valid execution slots found with current settings', 'error');
            return;
        }

        // Prepare payload for n8n
        const payload = {
            ...config,
            calculatedExecutions: executions.map(exec => ({
                timestamp: exec.timestamp.toISOString(),
                batchSize: exec.batchSize
            })),
            summary: {
                totalExecutions: executions.length,
                totalItems: executions.reduce((sum, exec) => sum + exec.batchSize, 0),
                firstExecution: executions[0].timestamp.toISOString(),
                lastExecution: executions[executions.length - 1].timestamp.toISOString()
            }
        };

        // Send to n8n
        await this.sendToN8n(payload);
    }

    async sendToN8n(payload) {
        const submitBtn = document.getElementById('deployBtn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Deploying...';
        submitBtn.disabled = true;

        // Use custom webhook URL if provided, otherwise use default
        const webhookUrl = payload.webhookUrl || this.SUBMIT_API;

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                this.showStatus('Campaign deployed successfully!', 'success');
                this.clearSavedConfig();

                // Show response data if available
                try {
                    const responseData = await response.json();
                    console.log('n8n Response:', responseData);
                } catch (e) {
                    console.log('n8n webhook executed successfully');
                }

                // Optionally reset form
                // this.form.reset();
                // await this.loadFolderOptions();
            } else {
                throw new Error(`Server returned ${response.status}`);
            }
        } catch (error) {
            console.error('Error:', error);
            this.showStatus('Failed to deploy campaign: ' + error.message, 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    showStatus(message, type = 'info') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `toast-message ${type}`;
        this.statusMessage.style.display = 'block';

        setTimeout(() => {
            this.statusMessage.style.display = 'none';
        }, 5000);
    }

    autoSave() {
        const config = this.getFormData();
        localStorage.setItem('integratedSchedulerConfig', JSON.stringify(config));
    }

    loadSavedConfig() {
        const saved = localStorage.getItem('integratedSchedulerConfig');
        if (!saved) return;

        try {
            const config = JSON.parse(saved);

            // Restore folder selection
            if (config.folder?.value) {
                this.folderSelect.value = config.folder.value;
            }

            // Restore mode
            if (config.mode) {
                document.getElementById('modeInput').value = config.mode;
                // Update button active state
                document.querySelectorAll('.mode-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.mode === config.mode);
                });
                this.toggleModeSettings();
            }

            // Restore dates
            if (config.dateRange?.start) document.getElementById('startDate').value = config.dateRange.start;
            if (config.dateRange?.end) document.getElementById('endDate').value = config.dateRange.end;

            // Restore manual settings
            if (config.manual) {
                if (config.manual.batchSize) document.getElementById('batchSize').value = config.manual.batchSize;
                if (config.manual.frequencyHours) document.getElementById('frequency').value = config.manual.frequencyHours;
            }

            // Restore automated settings
            if (config.automated?.totalCount) {
                document.getElementById('totalCount').value = config.automated.totalCount;
            }

            // Restore days
            if (config.schedule?.allowedDays) {
                document.querySelectorAll('input[name="days"]').forEach(cb => {
                    cb.checked = config.schedule.allowedDays.includes(cb.value);
                });
            }

            // Restore time range
            if (config.schedule?.timeRange) {
                if (config.schedule.timeRange.from) document.getElementById('timeFrom').value = config.schedule.timeRange.from;
                if (config.schedule.timeRange.to) document.getElementById('timeTo').value = config.schedule.timeRange.to;
            }

            // Restore webhook URL
            if (config.webhookUrl) {
                const webhookInput = document.getElementById('webhookUrl');
                if (webhookInput) webhookInput.value = config.webhookUrl;
            }

            console.log('Configuration restored from localStorage');
        } catch (error) {
            console.error('Error loading saved config:', error);
        }
    }

    clearSavedConfig() {
        localStorage.removeItem('integratedSchedulerConfig');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new IntegratedScheduler();
});
