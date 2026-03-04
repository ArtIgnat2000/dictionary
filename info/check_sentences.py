import json, pathlib, re, collections

OUT = pathlib.Path(r'd:\Sites\Словарь\slovo-platform\src\data\words')
bad = []
patterns = collections.Counter()
for g in range(1, 12):
    data = json.loads((OUT / f'grade{g}.json').read_text('utf-8'))
    for e in data:
        s = e['sentence']
        for bad_pat in ['Объясни значение', 'Составь предложение', 'Вставь пропущенную букву', 'Вставь нужные слова:']:
            if bad_pat in s:
                bad.append(f"grade{g} {e['id']}: {s}")
        p = re.sub(re.escape(e['text']), 'СЛОВО', s, flags=re.IGNORECASE)
        patterns[p] += 1

print('=== ПЛОХИЕ ШАБЛОНЫ ===')
print('\n'.join(bad) if bad else 'Нет!')
print()
print('=== ВСЕ ШАБЛОНЫ ===')
for pat, cnt in sorted(patterns.items(), key=lambda x: -x[1]):
    print(f'{cnt:3d}x  {pat}')
