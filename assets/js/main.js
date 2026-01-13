/* assets/js/main.js */

// Fee Bands (Approximate Standard Tier for demo purposes)
const FEE_BANDS = [
    { limit: 500, fee: 215 },
    { limit: 1000, fee: 310 },
    { limit: 1500, fee: 390 },
    { limit: 2000, fee: 470 },
    { limit: 2500, fee: 550 },
    { limit: 3000, fee: 600 },
    { limit: 4000, fee: 650 },
    { limit: 5000, fee: 700 },
    { limit: 10000, fee: 850 },
    { limit: 99999999, fee: 950 } // Fallback cap
];

// Fixed Costs
const COSTS = {
    assurance: 45, // Avg Assured fee
    v5: 25,        // Logbook
    online: 40     // Online bidding fee
};

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Logic: Calculator
    const hammerInput = document.getElementById("hammerPrice");
    const vatToggle = document.getElementById("vatToggle");
    const elBuyerFee = document.getElementById("elBuyerFee");
    const elFixedFees = document.getElementById("elFixedFees");
    const elVat = document.getElementById("elVat");
    const elTotal = document.getElementById("elTotal");
    const elWarning = document.getElementById("elWarning");

    // Formatter
    const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });

    function calculate() {
        // Guard clause: if we are not on the homepage with the calculator
        if (!hammerInput) return;

        const price = parseFloat(hammerInput.value);
        
        // Reset state
        elWarning.style.display = "none";
        
        if (isNaN(price) || price < 0) {
            elTotal.textContent = "£0.00";
            return;
        }

        // Warning Logic
        if (price > 30000) {
            elWarning.style.display = "block";
            elWarning.textContent = "High Value: Confirm specific fees with auction house.";
        }

        // 1. Calculate Buyer Fee
        let bandFee = 0;
        for (let band of FEE_BANDS) {
            if (price <= band.limit) {
                bandFee = band.fee;
                break;
            }
        }
        // Fallback for high value if not caught by array
        if (bandFee === 0) bandFee = price * 0.05;

        // 2. Fixed Costs
        const totalFixed = COSTS.assurance + COSTS.v5 + COSTS.online;

        // 3. VAT on Fees (20%)
        const taxableFees = bandFee + totalFixed;
        const feeVat = taxableFees * 0.20;

        // 4. VAT on Hammer (if selected)
        const hammerVat = vatToggle.checked ? (price * 0.20) : 0;

        // 5. Total
        const total = price + taxableFees + feeVat + hammerVat;

        // Update UI
        elBuyerFee.textContent = money.format(bandFee);
        elFixedFees.textContent = money.format(totalFixed);
        elVat.textContent = money.format(feeVat + hammerVat);
        elTotal.textContent = money.format(total);

        // Track Event
        trackCalculation();
    }

    // Event Listeners
    if(hammerInput) {
        hammerInput.addEventListener("input", calculate);
        vatToggle.addEventListener("change", calculate);
    }

    // 2. GA4 Event Debounce
    let timeout;
    function trackCalculation() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'calculate', {
                    'event_category': 'Calculator',
                    'event_label': 'Homepage'
                });
            }
        }, 1500);
    }

    // 3. GSAP Animations
    if (typeof gsap !== 'undefined') {
        // Navbar slide down
        gsap.from(".navbar", { y: -50, opacity: 0, duration: 0.8, ease: "power2.out" });
        
        // Hero Content fade in
        gsap.from(".hero", { y: 20, opacity: 0, duration: 0.8, delay: 0.1 });
        
        // Calculator Pop up
        gsap.from(".calc-card", { 
            scale: 0.95, 
            opacity: 0, 
            duration: 0.6, 
            delay: 0.3, 
            ease: "back.out(1.7)" 
        });

        // Cards fade up on scroll
        gsap.utils.toArray('.fade-in-up').forEach(section => {
            gsap.from(section.children, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%"
                },
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.15
            });
        });
    }
});