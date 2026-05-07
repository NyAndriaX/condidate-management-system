import { expect, test } from '@playwright/test';

test('full candidate workflow', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel(/email/i).fill('test.user@example.com');
  await page.getByLabel(/mot de passe|password/i).fill('Password123!');
  await page.getByRole('button', { name: /se connecter|login/i }).click();

  await expect(page).toHaveURL(/\/candidates/);

  await page.getByRole('button', { name: /nouveau candidat/i }).click();

  await page.getByLabel(/first\s*name|prenom/i).fill('John');
  await page.getByLabel(/last\s*name|nom/i).fill('Doe');
  await page.getByLabel(/email/i).nth(0).fill('john.doe@test.com');
  await page.getByLabel(/phone|telephone/i).fill('+261340000000');
  await page.getByLabel(/position|poste/i).fill('Developpeur Full Stack');
  await page.getByLabel(/experience/i).fill('5');
  await page.getByLabel(/skills|competences/i).fill('JavaScript, TypeScript, React');

  await page.getByRole('button', { name: /enregistrer|soumettre|creer/i }).click();

  await expect(page.getByText('john.doe@test.com')).toBeVisible();

  await page.getByText('john.doe@test.com').click();

  await page.getByRole('button', { name: /valider/i }).click();

  await page.waitForTimeout(2000);
  await expect(page.getByText(/validated/i)).toBeVisible();

  await page.getByRole('button', { name: /supprimer/i }).click();
  await page.getByRole('button', { name: /confirmer|oui|confirm/i }).click();

  await expect(page.getByText('john.doe@test.com')).not.toBeVisible();
});
