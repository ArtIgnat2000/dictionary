// Базовая версия — меняется вручную при крупных обновлениях.
// Номер сборки (__BUILD_NUMBER__) инжектируется Vite автоматически
// из GITHUB_RUN_NUMBER при каждом пуше в gh-pages.

export const BASE_VERSION = '1.0';

declare const __BUILD_NUMBER__: string;
declare const __BUILD_DATE__: string;

export const BUILD_NUMBER: string = __BUILD_NUMBER__;
export const BUILD_DATE: string = __BUILD_DATE__;

/** Полная строка: «1.0 (сборка 42)» или «1.0 (dev)» */
export const APP_VERSION = `${BASE_VERSION} (сборка ${BUILD_NUMBER})`;
