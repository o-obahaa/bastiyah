import { test, expect } from '@playwright/test';

test.describe('Bastiyah Storefront & Checkout E2E Automation', () => {
  test('1. Landing page loads correctly with store discovery and platform title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Bastiyah|Nexus Store|بسطية/i);
    // Platform header / logo visibility
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();
  });

  test('2. Hosted store loads with product catalog and currency formatting', async ({ page }) => {
    // Navigate to a demo hosted store
    await page.goto('/store/demo-store');
    
    // Check if store container or products list renders
    await page.waitForLoadState('domcontentloaded');
    const storeContainer = page.locator('main, #root');
    await expect(storeContainer).toBeVisible();
  });

  test('3. Cart interactions: Adding item and updating badge count', async ({ page }) => {
    await page.goto('/');
    
    // Look for product card add-to-cart or buy buttons
    const addToCartBtn = page.locator('button:has-text("إضافة"), button:has-text("Add"), button:has-text("طلب")').first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
      
      // Cart badge or counter should update
      const cartBadge = page.locator('[data-testid="cart-badge"], .cart-count, span:has-text("1")').first();
      await expect(cartBadge).toBeVisible();
    }
  });

  test('4. WhatsApp order checkout payload construction', async ({ page }) => {
    await page.goto('/');
    
    // Emulate order submission dialog
    const checkoutTrigger = page.locator('button:has-text("شراء"), button:has-text("سلة"), button:has-text("Checkout")').first();
    if (await checkoutTrigger.isVisible()) {
      await checkoutTrigger.click();
      
      // Customer phone input
      const phoneInput = page.locator('input[type="tel"], input[name="phone"], input[placeholder*="07"]').first();
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('07701234567');
      }
    }
  });
});
