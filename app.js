class BharatfincareApp {
    constructor() {
        this.data = {
            combinedTarget: 95500000,
            teams: {
                eli: {
                    name: 'ELI',
                    disbursementTarget: 42500000,
                    collectionTarget: 41496322,
                    disbursed: 0,
                    collected: 0,
                    freshLeads: 0,
                    totalAmount: 0
                },
                nbl: {
                    name: 'NBL',
                    disbursementTarget: 47500000,
                    collectionTarget: 54256582,
                    disbursed: 0,
                    collected: 0,
                    freshLeads: 0,
                    totalAmount: 0
                }
            }
        };
        this.animationDuration = 2500;
        this.isAnimating = false;
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
        this.updateSummary();
    }

    initializeElements() {
        // Combined target elements
        this.combinedCurrentEl = document.getElementById('combined-current');
        this.combinedProgressEl = document.getElementById('combined-progress');
        this.combinedPercentageEl = document.getElementById('combined-percentage');

        // Summary elements
        this.totalFreshLeadsEl = document.getElementById('total-fresh-leads');
        this.totalAmountSummaryEl = document.getElementById('total-amount-summary');
        this.eliFreshSummaryEl = document.getElementById('eli-fresh-summary');
        this.nblFreshSummaryEl = document.getElementById('nbl-fresh-summary');
        this.eliAmountSummaryEl = document.getElementById('eli-amount-summary');
        this.nblAmountSummaryEl = document.getElementById('nbl-amount-summary');

        // Team elements - ELI
        this.eliDisbursedEl = document.getElementById('eli-disbursed');
        this.eliCollectedEl = document.getElementById('eli-collected');
        this.eliDisbursementInputEl = document.getElementById('eli-disbursement-input');
        this.eliCollectionInputEl = document.getElementById('eli-collection-input');
        this.eliDisbursementProgressEl = document.getElementById('eli-disbursement-progress');
        this.eliCollectionProgressEl = document.getElementById('eli-collection-progress');
        this.eliDisbursementPercentageEl = document.getElementById('eli-disbursement-percentage');
        this.eliCollectionPercentageEl = document.getElementById('eli-collection-percentage');
        this.eliStatusEl = document.getElementById('eli-status');

        // ELI new elements (without number tracking)
        this.eliFreshLeadsEl = document.getElementById('eli-fresh-leads');
        this.eliTotalAmountEl = document.getElementById('eli-total-amount');
        this.eliFreshInputEl = document.getElementById('eli-fresh-input');
        this.eliAmountInputEl = document.getElementById('eli-amount-input');

        // Team elements - NBL
        this.nblDisbursedEl = document.getElementById('nbl-disbursed');
        this.nblCollectedEl = document.getElementById('nbl-collected');
        this.nblDisbursementInputEl = document.getElementById('nbl-disbursement-input');
        this.nblCollectionInputEl = document.getElementById('nbl-collection-input');
        this.nblDisbursementProgressEl = document.getElementById('nbl-disbursement-progress');
        this.nblCollectionProgressEl = document.getElementById('nbl-collection-progress');
        this.nblDisbursementPercentageEl = document.getElementById('nbl-disbursement-percentage');
        this.nblCollectionPercentageEl = document.getElementById('nbl-collection-percentage');
        this.nblStatusEl = document.getElementById('nbl-status');

        // NBL new elements (without number tracking)
        this.nblFreshLeadsEl = document.getElementById('nbl-fresh-leads');
        this.nblTotalAmountEl = document.getElementById('nbl-total-amount');
        this.nblFreshInputEl = document.getElementById('nbl-fresh-input');
        this.nblAmountInputEl = document.getElementById('nbl-amount-input');

        // Control elements
        this.updateBtnEl = document.getElementById('update-btn');
        this.resetBtnEl = document.getElementById('reset-btn');

        // Team cards
        this.eliCardEl = document.querySelector('[data-team="eli"]');
        this.nblCardEl = document.querySelector('[data-team="nbl"]');

        // Sample buttons
        this.sampleBtns = document.querySelectorAll('.sample-btn');
    }

    bindEvents() {
        this.updateBtnEl.addEventListener('click', () => this.updateDashboard());
        this.resetBtnEl.addEventListener('click', () => this.resetDashboard());

        // Enter key support for all inputs
        const inputs = [
            this.eliDisbursementInputEl, this.eliCollectionInputEl, this.eliFreshInputEl, this.eliAmountInputEl,
            this.nblDisbursementInputEl, this.nblCollectionInputEl, this.nblFreshInputEl, this.nblAmountInputEl
        ];

        inputs.forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.updateDashboard();
                    }
                });

                // Allow only numeric input for currency fields
                if (input.inputMode === 'numeric' || input.type === 'number') {
                    input.addEventListener('input', (e) => {
                        let value = e.target.value;
                        if (input.type !== 'number') {
                            // Remove any non-numeric characters for currency fields
                            value = value.replace(/[^0-9]/g, '');
                            e.target.value = value;
                        }
                        // Remove error styling if input becomes valid
                        if (e.target.classList.contains('input-error')) {
                            e.target.classList.remove('input-error');
                        }
                    });
                }

                // Select all text on focus for better UX
                input.addEventListener('focus', () => {
                    input.select();
                });
            }
        });

        // Sample buttons
        this.sampleBtns.forEach(btn => {
            btn.addEventListener('click', () => this.loadSampleData(btn));
        });
    }

    async updateDashboard() {
        if (this.isAnimating) return;

        const eliDisbursed = parseInt(this.eliDisbursementInputEl.value) || 0;
        const eliCollected = parseInt(this.eliCollectionInputEl.value) || 0;
        const eliFresh = parseInt(this.eliFreshInputEl.value) || 0;
        const eliAmount = parseInt(this.eliAmountInputEl.value) || 0;

        const nblDisbursed = parseInt(this.nblDisbursementInputEl.value) || 0;
        const nblCollected = parseInt(this.nblCollectionInputEl.value) || 0;
        const nblFresh = parseInt(this.nblFreshInputEl.value) || 0;
        const nblAmount = parseInt(this.nblAmountInputEl.value) || 0;

        // Validation
        if (eliDisbursed < 0 || eliCollected < 0 || nblDisbursed < 0 || nblCollected < 0 ||
            eliFresh < 0 || nblFresh < 0 || eliAmount < 0 || nblAmount < 0) {
            this.showInputError();
            return;
        }

        this.isAnimating = true;
        this.setLoadingState(true);

        // Store old values for animation
        const oldData = {
            eli: {
                disbursed: this.data.teams.eli.disbursed,
                collected: this.data.teams.eli.collected,
                freshLeads: this.data.teams.eli.freshLeads,
                totalAmount: this.data.teams.eli.totalAmount
            },
            nbl: {
                disbursed: this.data.teams.nbl.disbursed,
                collected: this.data.teams.nbl.collected,
                freshLeads: this.data.teams.nbl.freshLeads,
                totalAmount: this.data.teams.nbl.totalAmount
            }
        };

        // Update data
        this.data.teams.eli.disbursed = eliDisbursed;
        this.data.teams.eli.collected = eliCollected;
        this.data.teams.eli.freshLeads = eliFresh;
        this.data.teams.eli.totalAmount = eliAmount;

        this.data.teams.nbl.disbursed = nblDisbursed;
        this.data.teams.nbl.collected = nblCollected;
        this.data.teams.nbl.freshLeads = nblFresh;
        this.data.teams.nbl.totalAmount = nblAmount;

        // Animate all values
        await Promise.all([
            this.animateValue(this.eliDisbursedEl, oldData.eli.disbursed, eliDisbursed),
            this.animateValue(this.eliCollectedEl, oldData.eli.collected, eliCollected),
            this.animateValue(this.eliFreshLeadsEl, oldData.eli.freshLeads, eliFresh, false),
            this.animateValue(this.eliTotalAmountEl, oldData.eli.totalAmount, eliAmount),
            this.animateValue(this.nblDisbursedEl, oldData.nbl.disbursed, nblDisbursed),
            this.animateValue(this.nblCollectedEl, oldData.nbl.collected, nblCollected),
            this.animateValue(this.nblFreshLeadsEl, oldData.nbl.freshLeads, nblFresh, false),
            this.animateValue(this.nblTotalAmountEl, oldData.nbl.totalAmount, nblAmount),
            this.animateCombinedTarget(oldData.eli.disbursed + oldData.nbl.disbursed, eliDisbursed + nblDisbursed)
        ]);

        // Update progress bars and status
        this.updateProgressBars();
        this.updateTeamStatus();
        this.updateTargetAchievement();
        this.updateSummary();
        this.setLoadingState(false);
        this.isAnimating = false;
        this.updateDisplay();
    }

    animateValue(element, startValue, endValue, isCurrency = true) {
        return new Promise((resolve) => {
            element.classList.add('updating');
            const startTime = performance.now();
            const duration = this.animationDuration;

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function for smooth animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);

                element.textContent = isCurrency ? this.formatIndianCurrency(currentValue) : currentValue;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.textContent = isCurrency ? this.formatIndianCurrency(endValue) : endValue;
                    element.classList.remove('updating');
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    animateCombinedTarget(startValue, endValue) {
        return new Promise((resolve) => {
            this.combinedCurrentEl.classList.add('updating');
            const startTime = performance.now();
            const duration = this.animationDuration;

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function for smooth animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);

                this.combinedCurrentEl.textContent = this.formatIndianCurrency(currentValue);

                // Update combined progress bar in real-time
                const percentage = Math.min((currentValue / this.data.combinedTarget) * 100, 100);
                this.combinedProgressEl.style.width = `${percentage}%`;
                this.combinedPercentageEl.textContent = `${Math.round(percentage)}%`;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.combinedCurrentEl.textContent = this.formatIndianCurrency(endValue);
                    this.combinedCurrentEl.classList.remove('updating');
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    updateProgressBars() {
        // ELI progress bars
        const eliDisbursementPercentage = Math.min((this.data.teams.eli.disbursed / this.data.teams.eli.disbursementTarget) * 100, 100);
        const eliCollectionPercentage = Math.min((this.data.teams.eli.collected / this.data.teams.eli.collectionTarget) * 100, 100);

        // NBL progress bars
        const nblDisbursementPercentage = Math.min((this.data.teams.nbl.disbursed / this.data.teams.nbl.disbursementTarget) * 100, 100);
        const nblCollectionPercentage = Math.min((this.data.teams.nbl.collected / this.data.teams.nbl.collectionTarget) * 100, 100);

        // Combined progress (already updated in animation)
        const combinedCurrent = this.data.teams.eli.disbursed + this.data.teams.nbl.disbursed;
        const combinedPercentage = Math.min((combinedCurrent / this.data.combinedTarget) * 100, 100);

        setTimeout(() => {
            // ELI progress bars
            this.eliDisbursementProgressEl.style.width = `${eliDisbursementPercentage}%`;
            this.eliCollectionProgressEl.style.width = `${eliCollectionPercentage}%`;
            this.eliDisbursementPercentageEl.textContent = `${Math.round(eliDisbursementPercentage)}%`;
            this.eliCollectionPercentageEl.textContent = `${Math.round(eliCollectionPercentage)}%`;

            // NBL progress bars
            this.nblDisbursementProgressEl.style.width = `${nblDisbursementPercentage}%`;
            this.nblCollectionProgressEl.style.width = `${nblCollectionPercentage}%`;
            this.nblDisbursementPercentageEl.textContent = `${Math.round(nblDisbursementPercentage)}%`;
            this.nblCollectionPercentageEl.textContent = `${Math.round(nblCollectionPercentage)}%`;

            // Combined progress (final update)
            this.combinedProgressEl.style.width = `${combinedPercentage}%`;
            this.combinedPercentageEl.textContent = `${Math.round(combinedPercentage)}%`;
        }, 100);
    }

    updateTeamStatus() {
        // Clear previous states
        this.eliStatusEl.className = 'team-status';
        this.nblStatusEl.className = 'team-status';

        // Check disbursement targets achievement
        const eliDisbursementAchieved = this.data.teams.eli.disbursed >= this.data.teams.eli.disbursementTarget;
        const nblDisbursementAchieved = this.data.teams.nbl.disbursed >= this.data.teams.nbl.disbursementTarget;

        // Check collection targets achievement
        const eliCollectionAchieved = this.data.teams.eli.collected >= this.data.teams.eli.collectionTarget;
        const nblCollectionAchieved = this.data.teams.nbl.collected >= this.data.teams.nbl.collectionTarget;

        // Determine status based on overall performance
        const eliOverallPercentage = ((this.data.teams.eli.disbursed / this.data.teams.eli.disbursementTarget) +
            (this.data.teams.eli.collected / this.data.teams.eli.collectionTarget)) / 2 * 100;
        const nblOverallPercentage = ((this.data.teams.nbl.disbursed / this.data.teams.nbl.disbursementTarget) +
            (this.data.teams.nbl.collected / this.data.teams.nbl.collectionTarget)) / 2 * 100;

        if (this.data.teams.eli.disbursed === 0 && this.data.teams.nbl.disbursed === 0) {
            this.eliStatusEl.textContent = '';
            this.nblStatusEl.textContent = '';
            return;
        }

        // Set status based on performance
        if (eliDisbursementAchieved && eliCollectionAchieved && nblDisbursementAchieved && nblCollectionAchieved) {
            // Teams achieved all targets
            if (eliOverallPercentage > nblOverallPercentage) {
                this.eliStatusEl.className = 'team-status leading';
                this.eliStatusEl.textContent = '🏆 Leading';
                this.nblStatusEl.textContent = '✅ Complete';
            } else if (nblOverallPercentage > eliOverallPercentage) {
                this.nblStatusEl.className = 'team-status leading';
                this.nblStatusEl.textContent = '🏆 Leading';
                this.eliStatusEl.textContent = '✅ Complete';
            } else {
                this.eliStatusEl.textContent = '🤝 Tied';
                this.nblStatusEl.textContent = '🤝 Tied';
            }
        } else if ((eliDisbursementAchieved && eliCollectionAchieved) && !(nblDisbursementAchieved && nblCollectionAchieved)) {
            this.eliStatusEl.className = 'team-status leading';
            this.eliStatusEl.textContent = '✅ Complete';
            this.nblStatusEl.className = 'team-status trailing';
            this.nblStatusEl.textContent = 'In Progress';
        } else if (!(eliDisbursementAchieved && eliCollectionAchieved) && (nblDisbursementAchieved && nblCollectionAchieved)) {
            this.nblStatusEl.className = 'team-status leading';
            this.nblStatusEl.textContent = '✅ Complete';
            this.eliStatusEl.className = 'team-status trailing';
            this.eliStatusEl.textContent = 'In Progress';
        } else {
            // Neither team completed all targets, show leader based on overall performance
            if (eliOverallPercentage > nblOverallPercentage) {
                this.eliStatusEl.className = 'team-status leading';
                this.eliStatusEl.textContent = '🏆 Leading';
                this.nblStatusEl.className = 'team-status trailing';
                this.nblStatusEl.textContent = 'Trailing';
            } else if (nblOverallPercentage > eliOverallPercentage) {
                this.nblStatusEl.className = 'team-status leading';
                this.nblStatusEl.textContent = '🏆 Leading';
                this.eliStatusEl.className = 'team-status trailing';
                this.eliStatusEl.textContent = 'Trailing';
            } else {
                this.eliStatusEl.textContent = '🤝 Tied';
                this.nblStatusEl.textContent = '🤝 Tied';
            }
        }
    }

    updateTargetAchievement() {
        // Check disbursement target achievement
        const eliDisbursementAchieved = this.data.teams.eli.disbursed >= this.data.teams.eli.disbursementTarget;
        const nblDisbursementAchieved = this.data.teams.nbl.disbursed >= this.data.teams.nbl.disbursementTarget;

        // Check collection target achievement
        const eliCollectionAchieved = this.data.teams.eli.collected >= this.data.teams.eli.collectionTarget;
        const nblCollectionAchieved = this.data.teams.nbl.collected >= this.data.teams.nbl.collectionTarget;

        // Update visual indicators for target achievement
        if (eliDisbursementAchieved && eliCollectionAchieved) {
            this.eliCardEl.classList.add('target-achieved');
        } else {
            this.eliCardEl.classList.remove('target-achieved');
        }

        if (nblDisbursementAchieved && nblCollectionAchieved) {
            this.nblCardEl.classList.add('target-achieved');
        } else {
            this.nblCardEl.classList.remove('target-achieved');
        }
    }

    updateSummary() {
        // Update summary section
        const totalFreshLeads = this.data.teams.eli.freshLeads + this.data.teams.nbl.freshLeads;
        const totalAmount = this.data.teams.eli.totalAmount + this.data.teams.nbl.totalAmount;

        this.totalFreshLeadsEl.textContent = totalFreshLeads;
        this.totalAmountSummaryEl.textContent = this.formatIndianCurrency(totalAmount);

        this.eliFreshSummaryEl.textContent = this.data.teams.eli.freshLeads;
        this.nblFreshSummaryEl.textContent = this.data.teams.nbl.freshLeads;
        this.eliAmountSummaryEl.textContent = this.formatIndianCurrency(this.data.teams.eli.totalAmount);
        this.nblAmountSummaryEl.textContent = this.formatIndianCurrency(this.data.teams.nbl.totalAmount);
    }

    resetDashboard() {
        if (this.isAnimating) return;

        // Reset data
        this.data.teams.eli.disbursed = 0;
        this.data.teams.eli.collected = 0;
        this.data.teams.eli.freshLeads = 0;
        this.data.teams.eli.totalAmount = 0;

        this.data.teams.nbl.disbursed = 0;
        this.data.teams.nbl.collected = 0;
        this.data.teams.nbl.freshLeads = 0;
        this.data.teams.nbl.totalAmount = 0;

        // Clear inputs
        this.eliDisbursementInputEl.value = '';
        this.eliCollectionInputEl.value = '';
        this.eliFreshInputEl.value = '';
        this.eliAmountInputEl.value = '';

        this.nblDisbursementInputEl.value = '';
        this.nblCollectionInputEl.value = '';
        this.nblFreshInputEl.value = '';
        this.nblAmountInputEl.value = '';

        // Update displays
        this.updateDisplay();
        this.updateSummary();

        // Add reset animation
        const elements = [
            this.eliDisbursedEl, this.eliCollectedEl, this.eliFreshLeadsEl, this.eliTotalAmountEl,
            this.nblDisbursedEl, this.nblCollectedEl, this.nblFreshLeadsEl, this.nblTotalAmountEl,
            this.combinedCurrentEl
        ];

        elements.forEach(el => {
            el.classList.add('updating');
            setTimeout(() => el.classList.remove('updating'), 300);
        });

        this.showNotification('Dashboard reset successfully', 'success');
    }

    updateDisplay() {
        // Update displayed values
        this.eliDisbursedEl.textContent = this.formatIndianCurrency(this.data.teams.eli.disbursed);
        this.eliCollectedEl.textContent = this.formatIndianCurrency(this.data.teams.eli.collected);
        this.eliFreshLeadsEl.textContent = this.data.teams.eli.freshLeads;
        this.eliTotalAmountEl.textContent = this.formatIndianCurrency(this.data.teams.eli.totalAmount);

        this.nblDisbursedEl.textContent = this.formatIndianCurrency(this.data.teams.nbl.disbursed);
        this.nblCollectedEl.textContent = this.formatIndianCurrency(this.data.teams.nbl.collected);
        this.nblFreshLeadsEl.textContent = this.data.teams.nbl.freshLeads;
        this.nblTotalAmountEl.textContent = this.formatIndianCurrency(this.data.teams.nbl.totalAmount);

        // Update combined current
        const combinedCurrent = this.data.teams.eli.disbursed + this.data.teams.nbl.disbursed;
        this.combinedCurrentEl.textContent = this.formatIndianCurrency(combinedCurrent);

        // Update 'to go' amount
        const toGo = Math.max(this.data.combinedTarget - combinedCurrent, 0);
        const combinedToGoEl = document.getElementById('combined-to-go');
        if (combinedToGoEl) {
            combinedToGoEl.textContent = `${this.formatIndianCurrency(toGo)} to go`;
        }

        // Update progress bars
        this.updateProgressBars();
        this.updateTeamStatus();
        this.updateTargetAchievement();
    }

    loadSampleData(button) {
        const eliDisbursed = button.dataset.eliDisbursed;
        const eliCollected = button.dataset.eliCollected;
        const eliFresh = button.dataset.eliFresh;
        const eliAmount = button.dataset.eliAmount;

        const nblDisbursed = button.dataset.nblDisbursed;
        const nblCollected = button.dataset.nblCollected;
        const nblFresh = button.dataset.nblFresh;
        const nblAmount = button.dataset.nblAmount;

        this.eliDisbursementInputEl.value = eliDisbursed;
        this.eliCollectionInputEl.value = eliCollected;
        this.eliFreshInputEl.value = eliFresh;
        this.eliAmountInputEl.value = eliAmount;

        this.nblDisbursementInputEl.value = nblDisbursed;
        this.nblCollectionInputEl.value = nblCollected;
        this.nblFreshInputEl.value = nblFresh;
        this.nblAmountInputEl.value = nblAmount;

        // Add visual feedback
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);

        // Auto-update after a brief delay
        setTimeout(() => {
            this.updateDashboard();
        }, 300);
    }

    showInputError() {
        const inputs = [
            this.eliDisbursementInputEl, this.eliCollectionInputEl, this.eliFreshInputEl, this.eliAmountInputEl,
            this.nblDisbursementInputEl, this.nblCollectionInputEl, this.nblFreshInputEl, this.nblAmountInputEl
        ];

        inputs.forEach(input => {
            if (!input.value || parseInt(input.value) < 0) {
                input.classList.add('input-error');
                setTimeout(() => input.classList.remove('input-error'), 2000);
            }
        });
    }

    setLoadingState(loading) {
        const buttonText = this.updateBtnEl.querySelector('.button-text');
        const spinner = this.updateBtnEl.querySelector('.loading-spinner');

        if (loading) {
            this.updateBtnEl.disabled = true;
            this.updateBtnEl.classList.add('loading');
            spinner.classList.remove('hidden');
            buttonText.textContent = 'Updating...';
        } else {
            this.updateBtnEl.disabled = false;
            this.updateBtnEl.classList.remove('loading');
            spinner.classList.add('hidden');
            buttonText.textContent = 'Update Dashboard';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;

        // Add to document
        document.body.appendChild(notification);

        // Show with animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    formatIndianCurrency(num) {
        if (num === 0) return '₹0';

        // Use the Indian number system (2,3,2 pattern)
        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        return formatter.format(num);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BharatfincareApp();
});

// Add keyboard shortcuts and enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + R for reset
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            document.getElementById('reset-btn').click();
        }

        // Ctrl/Cmd + Enter for update
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('update-btn').click();
        }
    });

    // Add visual feedback for team cards
    const cards = document.querySelectorAll('.team-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('target-achieved')) {
                card.style.transform = 'translateY(-2px)';
            }
        });

        card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('target-achieved')) {
                card.style.transform = '';
            }
        });
    });
});
