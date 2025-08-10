// Configuration
// Replace with values from your sandbox account
const CONFIG = {
  clientToken: "test_26966f1f8c51d54baaba0224e16",
  prices: {
    starter: {
      month: "pri_01k274r984nbbbrt9fvpbk9sda",
      year: "pri_01gsz8s48pyr4mbhvv2xfggesg"
    },
    pro: {
      month: "pri_01k274qrwsngnq4tre5y2qe3pp",
      year: "pri_01gsz8z1q1n00f12qt82y31smh"
    }
  }
};

// UI elements
const monthlyBtn = document.getElementById("monthlyBtn");
const yearlyBtn = document.getElementById("yearlyBtn");
const countrySelect = document.getElementById("countrySelect");
const starterPrice = document.getElementById("starter-price");
const proPrice = document.getElementById("pro-price");

// State
let currentBillingCycle = "month";
let currentCountry = "US";
let paddleInitialized = false;

// Initialize Paddle
function initializePaddle() {
  try {
    Paddle.Environment.set("sandbox");
    Paddle.Initialize({
      token: CONFIG.clientToken,
      eventCallback: function (event) {
        console.log("Paddle event:", event);
      }
    });
    paddleInitialized = true;
    updatePrices();
  } catch (error) {
    console.error("Initialization error:", error);
  }
}

// Update billing cycle
function updateBillingCycle(cycle) {
  currentBillingCycle = cycle;
  monthlyBtn.classList.toggle("bg-white", cycle === "month");
  yearlyBtn.classList.toggle("bg-white", cycle === "year");
  updatePrices();
}

// Update prices
async function updatePrices() {
  if (!paddleInitialized) {
    console.log("Paddle not initialized yet");
    return;
  }

  try {
    const request = {
      items: [
        {
          quantity: 1,
          priceId: CONFIG.prices.starter[currentBillingCycle]
        },
        {
          quantity: 1,
          priceId: CONFIG.prices.pro[currentBillingCycle]
        }
      ],
      address: {
        countryCode: currentCountry
      }
    };

    console.log("Fetching prices:", request);
    const result = await Paddle.PricePreview(request);

    result.data.details.lineItems.forEach((item) => {
      const price = item.formattedTotals.subtotal;
      if (item.price.id === CONFIG.prices.starter[currentBillingCycle]) {
        starterPrice.textContent = price;
      } else if (item.price.id === CONFIG.prices.pro[currentBillingCycle]) {
        proPrice.textContent = price;
      }
    });
    console.log("Prices updated:", result);
  } catch (error) {
    console.error(`Error fetching prices: ${error.message}`);
  }
}

// Open checkout
function openCheckout(plan) {
  if (!paddleInitialized) {
    console.log("Paddle not initialized yet");
    return;
  }

  try {
    Paddle.Checkout.open({
      items: [
        {
          priceId: CONFIG.prices[plan][currentBillingCycle],
          quantity: 1
        }
      ],
      settings: {
        theme: "light",
        displayMode: "overlay",
        variant: "one-page"
      }
    });
  } catch (error) {
    console.error(`Checkout error: ${error.message}`);
  }
}

// Event Listeners
countrySelect.addEventListener("change", (e) => {
  currentCountry = e.target.value;
  updatePrices();
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", initializePaddle);
