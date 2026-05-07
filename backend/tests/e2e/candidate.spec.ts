import { expect, test } from '@playwright/test';

test('full candidate workflow', async ({ page }) => {
  // ─── Login ─────────────────────────────────────────────────────────────
  await page.goto('/login');

  // Ant Design Form.Item label="Adresse email" generates a proper <label for="email">
  await page.getByLabel('Adresse email').fill('test.user@example.com');
  await page.getByLabel('Mot de passe').fill('Password123!');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await expect(page).toHaveURL(/\/candidates/);

  // ─── Navigate to the new candidate form ────────────────────────────────
  await page.getByRole('button', { name: 'Nouveau candidat' }).click();
  await expect(page).toHaveURL(/\/candidates\/new/);

  // ─── Fill the form ─────────────────────────────────────────────────────
  // CandidateForm uses react-hook-form + Ant Design Form.Item for layout only.
  // The label's `for` does not link to the input's id, so we use placeholders.
  await page.getByPlaceholder('Jean').fill('John');
  await page.getByPlaceholder('Dupont').fill('Doe');
  await page.getByPlaceholder('jean@exemple.com').fill('john.doe@test.com');
  await page.getByPlaceholder('+33612345678').fill('+261340000000');
  await page.getByPlaceholder('Ex : Développeur Full Stack').fill('Developpeur Full Stack');
  // Ant Design InputNumber renders an <input> with the placeholder
  await page.getByPlaceholder('3').fill('5');

  // Skills: type a value then click "Ajouter"
  await page.getByPlaceholder('Ex : React, TypeScript, Node.js...').fill('JavaScript');
  await page.getByRole('button', { name: 'Ajouter' }).click();

  // Submit
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await expect(page).toHaveURL(/\/candidates$/);

  // ─── Open the newly created candidate ──────────────────────────────────
  // The list renders "John Doe" as a clickable Typography.Text
  await page.getByText('John Doe').click();
  await expect(page).toHaveURL(/\/candidates\/[a-f0-9]+$/);

  // ─── Validate the candidate ────────────────────────────────────────────
  await page.getByRole('button', { name: 'Valider' }).click();
  // The backend validation intentionally waits ~2 s; give it up to 10 s
  await expect(page.getByText('Validé')).toBeVisible({ timeout: 10_000 });

  // ─── Delete the candidate ──────────────────────────────────────────────
  // Click the "Supprimer" trigger button
  await page.getByRole('button', { name: 'Supprimer' }).click();
  // Ant Design Popconfirm renders its confirm button (also "Supprimer") in a portal
  // appended to <body>; waiting for 2 matching buttons means the popup is visible
  await expect(page.getByRole('button', { name: 'Supprimer' })).toHaveCount(2);
  await page.getByRole('button', { name: 'Supprimer' }).last().click();

  // After deletion, the handler navigates back to the list
  await expect(page).toHaveURL(/\/candidates$/);
  await expect(page.getByText('john.doe@test.com')).not.toBeVisible();
});
