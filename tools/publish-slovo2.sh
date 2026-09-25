#!/usr/bin/env bash
#
# Публикация новой редакции (папка slovo2/) в отдельный репозиторий ArtIgnat2000/slovo2.
#
# Запуск из корня репозитория dictionary:
#   bash tools/publish-slovo2.sh
#
# Требуется, чтобы приложение Arena (или ваш токен) имело доступ к репозиторию slovo2:
#   GitHub → Settings → Applications → Arena AI → Configure → Repository access → Add slovo2
#
set -e

REPO_URL="https://github.com/ArtIgnat2000/slovo2.git"
BRANCH="main"

cd "$(dirname "$0")/.."

echo "▸ Проверяю доступ к $REPO_URL ..."
if ! git ls-remote --exit-code "$REPO_URL" >/dev/null 2>&1; then
  echo "✗ Нет доступа к репозиторию slovo2 (или он пуст)."
  echo "  Дайте приложению Arena доступ к ArtIgnat2000/slovo2 и повторите."
  exit 1
fi

if ! git remote get-url slovo2 >/dev/null 2>&1; then
  git remote add slovo2 "$REPO_URL"
fi

echo "▸ Отправляю содержимое slovo2/ в ветку $BRANCH ..."
git subtree push --prefix=slovo2 slovo2 "$BRANCH"

echo "▸ Включаю GitHub Pages (сборка через Actions) ..."
gh api -X POST "repos/ArtIgnat2000/slovo2/pages" \
  -f build_type=workflow >/dev/null 2>&1 \
  && echo "  ✓ Pages включены" \
  || echo "  · Pages нужно включить вручную: Settings → Pages → Source: GitHub Actions"

echo "✓ Готово: https://github.com/ArtIgnat2000/slovo2"
