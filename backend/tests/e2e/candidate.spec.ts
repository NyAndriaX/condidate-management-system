import { expect, test } from '@playwright/test';

test('full candidate workflow', async ({ page }) => {
  // Make the test idempotent: use a unique email + name per run so re-running
  // never collides with leftover data from a previous run (the API returns 409
  // "Un candidat avec cet email existe deja." otherwise).
  const runId = Date.now();
  const candidateEmail = `john.doe.${runId}@test.com`;
  const candidateFirstName = `John${runId}`;
  const candidateLastName = 'Doe';
  const candidateFullName = `${candidateFirstName} ${candidateLastName}`;

  // ─── Login ─────────────────────────────────────────────────────────────
  await page.goto('/login');

  await page.getByLabel('Adresse email').fill('test.user@example.com');
  await page.getByLabel('Mot de passe').fill('Password123!');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await expect(page).toHaveURL(/\/candidates/);

  // ─── Navigate to the new candidate form ────────────────────────────────
  await page.getByRole('button', { name: 'Nouveau candidat' }).click();
  await expect(page).toHaveURL(/\/candidates\/new/);

  // ─── Fill the form ─────────────────────────────────────────────────────
  // CandidateForm uses react-hook-form + Ant Design Form.Item for layout only.
  // Labels are not linked to inputs via htmlFor/id, so we target by placeholder.
  // { exact: true } prevents substring matches (e.g. 'Jean' otherwise also
  // matches the email placeholder 'jean@exemple.com').
  await page.getByPlaceholder('Jean', { exact: true }).fill(candidateFirstName);
  await page.getByPlaceholder('Dupont', { exact: true }).fill(candidateLastName);
  await page.getByPlaceholder('jean@exemple.com', { exact: true }).fill(candidateEmail);
  await page.getByPlaceholder('+33612345678', { exact: true }).fill('+261340000000');
  await page.getByPlaceholder('Ex : Développeur Full Stack', { exact: true }).fill('Developpeur Full Stack');

  // antd InputNumber commits the parsed numeric value to react-hook-form only
  // on blur. Press Tab to force blur so zod's z.number() sees a real number.
  const experienceInput = page.getByPlaceholder('3', { exact: true });
  await experienceInput.fill('5');
  await experienceInput.press('Tab');

  // Skills: type a value, click "Ajouter", and wait for the tag to appear so
  // setValue('skills', ...) has propagated before submit.
  await page.getByPlaceholder('Ex : React, TypeScript, Node.js...', { exact: true }).fill('JavaScript');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  await expect(page.locator('.ant-tag').filter({ hasText: 'JavaScript' }).first()).toBeVisible();

  // Submit and wait for navigation back to the list
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await page.waitForURL(/\/candidates$/, { timeout: 15_000 });

  // ─── Open the newly created candidate ──────────────────────────────────
  await page.getByText(candidateFullName).click();
  await expect(page).toHaveURL(/\/candidates\/[a-f0-9]+$/);

  // ─── Validate the candidate ────────────────────────────────────────────
  await page.getByRole('button', { name: 'Valider' }).click();
  // The backend validation deliberately delays ~2 s; give it up to 10 s.
  // exact: true avoids matching the toast "Candidat validé avec succès."
  // .first() picks the header status tag (two "Validé" tags exist on the page).
  await expect(page.getByText('Validé', { exact: true }).first()).toBeVisible({ timeout: 10_000 });

  // ─── Delete the candidate ──────────────────────────────────────────────
  await page.getByRole('button', { name: 'Supprimer' }).click();
  // Popconfirm renders its confirm button (also "Supprimer") in a portal;
  // wait for 2 buttons before clicking the confirmation one.
  await expect(page.getByRole('button', { name: 'Supprimer' })).toHaveCount(2);
  await page.getByRole('button', { name: 'Supprimer' }).last().click();

  // After deletion, the handler navigates back to the list
  await expect(page).toHaveURL(/\/candidates$/);
  await expect(page.getByText(candidateEmail)).not.toBeVisible();
});
