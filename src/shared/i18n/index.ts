export type Language = 'ru' | 'en' | 'it';

export interface Translations {
  // Brand & Nav
  appName: string;
  tagline: string;
  brandSubtitle: string;
  navCatalog: string;
  navBuy: string;
  navRent: string;
  navPopular: string;
  navDistricts: string;
  navAdmin: string;
  navAnalytics: string;
  navFavorites: string;
  navCompare: string;
  navAlerts: string;

  // View modes
  viewSplit: string;
  viewGrid: string;
  viewMap: string;

  // Deal types
  dealSale: string;
  dealRentLong: string;
  dealRentDaily: string;
  dealAll: string;

  // Search & Filters
  searchPlaceholder: string;
  allDistricts: string;
  bedrooms: string;
  bedroomsAll: string;
  studio: string;
  bathrooms: string;
  areaM2: string;
  priceFrom: string;
  priceTo: string;
  areaFrom: string;
  areaTo: string;
  filters: string;
  reset: string;
  foundProperties: string;
  sortBy: string;
  sortFeatured: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortAreaDesc: string;
  sortNewest: string;
  distanceToBeach: string;
  firstLine: string;

  // Badges & Amenities
  priceOnRequest: string;
  deposit: string;
  utilitiesExcluded: string;
  utilitiesIncluded: string;
  seaView: string;
  poolView: string;
  gardenView: string;
  privateBeach: string;
  beachAccess: string;
  swimmingPool: string;
  furnished: string;
  security247: string;
  parking: string;
  balcony: string;
  terrace: string;
  garden: string;
  wifi: string;
  ac: string;
  washingMachine: string;
  verified: string;
  showPhone: string;

  // Property Card
  perM2: string;
  rooms: string;
  area: string;
  beach: string;
  bookViewing: string;
  details: string;
  compound: string;

  // Booking Modal
  bookingTitle: string;
  bookingSubtitle: string;
  inPersonViewing: string;
  inPersonDesc: string;
  videoTour: string;
  videoTourDesc: string;
  reserveRent: string;
  viewingDate: string;
  viewingTime: string;
  yourName: string;
  namePlaceholder: string;
  phoneWhatsapp: string;
  telegramUsername: string;
  notesLabel: string;
  notesPlaceholder: string;
  submitBooking: string;
  bookingSuccessTitle: string;
  bookingSuccessDesc: string;
  sentToTelegram: string;
  whatsappDirect: string;
  close: string;

  // Cookie & Telemetry
  cookieTitle: string;
  cookieDesc: string;
  cookieAcceptAll: string;
  cookieNecessaryOnly: string;

  // Admin
  adminTitle: string;
  adminSubtitle: string;
  tabVisitors: string;
  tabProperties: string;
  tabLeads: string;
  totalVisits: string;
  uniqueUsers: string;
  leadsReceived: string;
  recentLeads: string;
  toggleStatus: string;
  activeStatus: string;
  inactiveStatus: string;

  // Landing pages
  rentHeroTitle: string;
  rentHeroSubtitle: string;
  saleHeroTitle: string;
  saleHeroSubtitle: string;
  districtsHeroTitle: string;
  districtsHeroSubtitle: string;
  catalogTitle: string;
  shareSelection: string;
  favorites: string;
  supabaseConnection: string;
  loadingProperties: string;
  noProperties: string;
  resetFilters: string;
  propertySale: string;
  propertyLongRent: string;
  propertyDailyRent: string;
  unknownDistrict: string;
  bookingRequestSaved: string;
  bookingRequestSavedDescription: string;
  bookingRequestFailure: string;
  contactName: string;
  contactPhone: string;
  contactTelegram: string;
  viewingFormat: string;
  reserveRental: string;
  requestedDate: string;
  requestedTime: string;
  optionalNotes: string;
  sendRequest: string;
  showOnMap: string;
  bedroomsCount: (count: number) => string;
  bathroomsCount: (count: number) => string;
  areaUnit: (area: number) => string;
  saleListingsHeading: string;
  saleListingsDescription: string;
  browseSaleListings: string;
  rentListingsHeading: string;
  rentListingsDescription: string;
  browseAllRentals: string;
  rentLongTerm: string;
  rentDaily: string;
  districtCoordinates: string;
  showDistrictListings: string;
  cookieNoAnalytics: string;
  privacySettings: string;
  dataErrorTitle: string;
  retry: string;
  noPropertiesHint: string;
  loadingDistricts: string;
  noDistricts: string;
  requestStatus: string;
  dateLabel: string;
  clientLabel: string;
  sendingRequest: string;
  bookingDateRequired: string;
  bookingTimeRequired: string;
  settingsTitle: string;
  quickSections: string;
  quickLink: string;
  currencyDisplay: string;
  currencyRatesLoading: string;
  currencyRatesUnavailable: string;
  currencyRatesUpdatedDaily: string;
  languageInterface: string;
  mobileAppTitle: string;
  mobileAppDescription: string;
  directSupport: string;
  additionalNavigation: string;
  settingsMenu: string;
  installed: string;
  pwaActive: string;
  pwaInstall: string;
  pwaInstallOnDevice: string;
  pwaInstructions: string;
  pwaInstalledApp: string;
  pwaAddToDevice: string;
  pwaIosTitle: string;
  pwaIosSafariHint: string;
  pwaIosHomeHint: string;
  pwaIosShareStep: string;
  pwaIosHomeStep: string;
  pwaGotIt: string;
  pwaAndroidGuide: string;
  pwaDesktopGuide: string;
  pwaBrowserGuide: string;
  pwaHttpsGuide: string;
  splashSkip: string;
  splashLoading: string;
  splashSyncing: string;
  splashWelcome: string;
  scrollToTop: string;
  activeFilters: string;
  expandFilters: string;
  collapseFilters: string;
  editFilters: string;
  maxPrice: string;
  noLimit: string;
  propertyType: string;
  propertyTypeAny: string;
  typeApartment: string;
  typeVilla: string;
  typeStudio: string;
  typeDuplex: string;
  typePenthouse: string;
  typeChalet: string;
  typeCommercial: string;
  syncingData: string;
  loadMore: string;
  remainingCount: (count: number) => string;
  shareProperty: string;
  propertyDescription: string;
  amenitiesTitle: string;
  viewFromWindows: string;
  comparisonTitle: string;
  comparisonDescription: string;
  comparisonEmpty: string;
  comparisonEmptyHelp: string;
  comparisonParameter: string;
  comparisonRemove: string;
  comparisonPhotoPrice: string;
  comparisonDistrictCompound: string;
  comparisonTotalArea: string;
  comparisonBedroomsBathrooms: string;
  comparisonBeachAccess: string;
  comparisonHasBeach: string;
  comparisonNoBeach: string;
  comparisonFurniture: string;
  comparisonUnfurnished: string;
  comparisonCount: (count: number) => string;
  adminCheckingAccount: string;
  adminLogin: string;
  adminAccessDescription: string;
  adminPassword: string;
  adminLoginError: string;
  adminSigningIn: string;
  adminSignIn: string;
  adminManageDatabase: string;
  adminChangesSaved: string;
  adminExportLeads: string;
  adminSignOut: string;
  adminProperties: string;
  adminProblematic: string;
  adminLeads: string;
  adminScanDescription: string;
  adminCheckPhotos: string;
  adminCheckProgress: (completed: number, total: number) => string;
  adminNoProblematic: string;
  adminNoPhotos: string;
  adminAllPhotosFailed: string;
  adminSomePhotosFailed: (broken: number, total: number) => string;
  adminWorkingPhotos: (count: number) => string;
  adminObject: string;
  adminUnspecified: string;
  adminRefreshLeads: string;
  adminLoadingLeads: string;
  adminReturnCatalog: string;
  profileShareDescription: string;
  profileTransferTitle: string;
  profileTransferDescription: string;
  profileCopied: string;
  profileCopy: string;
  profileImport: string;
  profileImportPlaceholder: string;
  profileRestore: string;
  profileImportSuccess: string;
  profileImportError: string;
  oneTap: string;
  pwaDesktopLabel: string;
  pwaBrowserLabel: string;
  splashLocation: string;
  mapReloadTitle: string;
  mapRefreshDescription: string;
  refreshMap: string;
  searchDistrict: string;
  mapDistrictTag: string;
  mapSatellite: string;
  mapScheme: string;
  mapToggleDistrictGroups: string;
  mapWholeSharm: string;
  mapResetDistrict: string;
  mapApproxCenters: string;
  mapProperties: string;
  mapLoading: string;
  mapWithoutDistrict: (count: number) => string;
  mapDistricts: string;
  mapAll: string;
  mapFoundListings: (count: number) => string;
  mapZoomDistrict: string;
  mapResetFilter: string;
  mapFullscreen: string;
  mapClosePreview: string;
  viewed: string;
  mapPropertyDetails: string;
  mapZoomDistrictCenter: string;
  mapCard: string;
  mapListings: (count: number) => string;
  mapStartingPrice: string;
  savedProfileTitle: string;
  savedProfileDescription: string;
  historyTab: string;
  favoritesEmptyTitle: string;
  favoritesEmptyDescription: string;
  shareFavorites: string;
  copiedLink: string;
  copyLink: string;
  shareTelegram: string;
  clearFavorites: string;
  removeFavorite: string;
  compareEmptyTitle: string;
  compareEmptyDescription: string;
  removeFromList: string;
  historyEmptyTitle: string;
  historyEmptyDescription: string;
  clearHistory: string;
  recentPropertiesHeading: string;
  recentPropertiesDescription: string;
  emptyRecentProperties: string;
}

export const translations: Record<Language, Translations> = {
  ru: {
    appName: 'sharmino',
    tagline: 'Недвижимость в Шарм-эль-Шейхе для покупателей и арендаторов',
    brandSubtitle: 'Недвижимость в Шарме',
    navCatalog: 'Каталог',
    navBuy: 'Купить',
    navRent: 'Аренда',
    navPopular: 'Новые',
    navDistricts: 'Районы',
    navAdmin: 'Админка',
    navAnalytics: 'Аналитика цен',
    navFavorites: 'Избранное',
    navCompare: 'Сравнение',
    navAlerts: 'Уведомления',

    viewSplit: 'Карта + Каталог',
    viewGrid: 'Плитка',
    viewMap: 'Карта',

    dealSale: 'Купить',
    dealRentLong: 'Снять надолго',
    dealRentDaily: 'Посуточно',
    dealAll: 'Все предложения',

    searchPlaceholder: 'Поиск по району, компаунду (Domina, Golf Heights, Sunny Lakes, Delta)...',
    allDistricts: 'Все районы Шарма',
    bedrooms: 'Спальни',
    bedroomsAll: 'Все',
    studio: 'Студия',
    bathrooms: 'Санузлы',
    areaM2: 'Площадь м²',
    priceFrom: 'Цена от',
    priceTo: 'до',
    areaFrom: 'Площадь от, м²',
    areaTo: 'Площадь до, м²',
    filters: 'Фильтры',
    reset: 'Сбросить',
    foundProperties: 'Найдено объектов',
    sortBy: 'Сортировка',
    sortFeatured: 'Рекомендуемые',
    sortPriceAsc: 'Сначала дешевле',
    sortPriceDesc: 'Сначала дороже',
    sortAreaDesc: 'По площади',
    sortNewest: 'Свежие объявления',
    distanceToBeach: 'Выход к морю',
    firstLine: '1-я линия',

    priceOnRequest: 'Цена по запросу',
    deposit: 'Залог',
    utilitiesExcluded: 'КУ оплачиваются отдельно',
    utilitiesIncluded: 'КУ включены в стоимость',
    seaView: 'Вид на море',
    poolView: 'Вид на бассейн',
    gardenView: 'Вид на сад',
    privateBeach: 'Свой пляж',
    beachAccess: 'Выход к пляжу',
    swimmingPool: 'Бассейн',
    furnished: 'С мебелью',
    security247: 'Охрана 24/7',
    parking: 'Парковка',
    balcony: 'Балкон',
    terrace: 'Терраса',
    garden: 'Сад',
    wifi: 'Быстрый Wi-Fi',
    ac: 'Кондиционер',
    washingMachine: 'Стиральная машина',
    verified: 'Проверено модерацией',
    showPhone: 'Показать телефон',

    perM2: 'за м²',
    rooms: 'Комнат',
    area: 'Площадь',
    bookViewing: 'Забронировать просмотр',
    details: 'Подробнее',
    compound: 'Компаунд',

    bookingTitle: 'Запись на просмотр',
    bookingSubtitle: 'Заявка будет сохранена в базе данных. После настройки уведомления о ней отправляются команде в Telegram.',
    inPersonViewing: 'Очный просмотр',
    inPersonDesc: 'Встреча на объекте в Шарм-эль-Шейхе',
    videoTour: 'Видео-тур онлайн',
    videoTourDesc: 'Live в WhatsApp / Telegram с показом',
    reserveRent: 'Бронь аренды',
    viewingDate: 'Дата просмотра',
    viewingTime: 'Удобное время',
    yourName: 'Ваше имя',
    namePlaceholder: 'Например, Александр',
    phoneWhatsapp: 'Телефон / WhatsApp',
    telegramUsername: 'Telegram (@никнейм)',
    notesLabel: 'Пожелания / Вопросы (опционально)',
    notesPlaceholder: 'Время приезда, трансфер, вопросы по договору...',
    submitBooking: 'Отправить заявку на просмотр',
    bookingSuccessTitle: 'Заявка успешно отправлена!',
    bookingSuccessDesc: 'Заявка сохранена в базе данных. Команда свяжется с вами по указанному телефону.',
    sentToTelegram: 'Заявка сохранена в базе',
    whatsappDirect: 'Написать в WhatsApp прямо сейчас',

    cookieTitle: 'Конфиденциальность и данные',
    cookieDesc: 'Язык, валюта и избранное сохраняются в этом браузере. Контактные данные и текст заявки отправляются в Supabase. Статистика посещений и устройства включается только после согласия, если владелец сайта настроил Google Analytics.',
    cookieAcceptAll: 'Разрешить аналитику',
    cookieNecessaryOnly: 'Только необходимые',
    cookieNoAnalytics: 'Сейчас аналитика посещений не подключена. Сайт хранит настройки и избранное в браузере, а данные заявки отправляет в Supabase.',
    privacySettings: 'Настройки конфиденциальности',

    adminTitle: 'Панель управления базой объектов',
    adminSubtitle: 'Управление объектами, проверка изображений и заявки клиентов',
    tabVisitors: 'Посетители & Cookies',
    tabProperties: 'Объекты в БД',
    tabLeads: 'Входящие заявки',
    totalVisits: 'Всего визитов',
    uniqueUsers: 'Уникальных гостей',
    leadsReceived: 'Получено заявок',
    recentLeads: 'Последние заявки клиентов',
    toggleStatus: 'Переключить статус',
    activeStatus: 'Активен на сайте',
    inactiveStatus: 'Снят с публикации',

    rentHeroTitle: 'Аренда жилья в Шарм-эль-Шейхе',
    rentHeroSubtitle: 'Квартиры, апартаменты и виллы для краткосрочной и долгосрочной аренды.',
    saleHeroTitle: 'Покупка жилья в Шарм-эль-Шейхе',
    saleHeroSubtitle: 'Объявления о продаже квартир, домов и другой недвижимости.',
    districtsHeroTitle: 'Районы Шарм-эль-Шейха',
    districtsHeroSubtitle: 'Обзор пляжей, коралловых рифов и инфраструктуры от Наама Бэй до Монтазы.',
    catalogTitle: 'Каталог недвижимости',
    shareSelection: 'Поделиться подборкой',
    favorites: 'Избранное',
    supabaseConnection: 'Данные каталога',
    loadingProperties: 'Загрузка объектов…',
    noProperties: 'По заданным условиям объекты не найдены',
    resetFilters: 'Сбросить фильтры',
    propertySale: 'Продажа',
    propertyLongRent: 'Аренда / мес.',
    propertyDailyRent: 'Посуточно',
    unknownDistrict: 'Район не указан',
    beach: 'Пляж',
    bookingRequestSaved: 'Заявка сохранена',
    bookingRequestSavedDescription: 'Заявка записана в базу данных. Команда свяжется с вами по указанному телефону.',
    bookingRequestFailure: 'Не удалось отправить заявку. Попробуйте ещё раз.',
    contactName: 'Ваше имя',
    contactPhone: 'Телефон / WhatsApp',
    contactTelegram: 'Telegram',
    viewingFormat: 'Формат связи',
    reserveRental: 'Запрос по аренде',
    requestedDate: 'Желаемая дата',
    requestedTime: 'Желаемое время',
    optionalNotes: 'Комментарий (необязательно)',
    sendRequest: 'Отправить заявку',
    showOnMap: 'Показать на карте',
    bedroomsCount: (count) => {
      const mod10 = count % 10;
      const mod100 = count % 100;
      const noun = mod10 === 1 && mod100 !== 11 ? 'спальня' : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'спальни' : 'спален';
      return `${count} ${noun}`;
    },
    bathroomsCount: (count) => {
      const mod10 = count % 10;
      const mod100 = count % 100;
      const noun = mod10 === 1 && mod100 !== 11 ? 'санузел' : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'санузла' : 'санузлов';
      return `${count} ${noun}`;
    },
    areaUnit: (area) => `${area} м²`,
    saleListingsHeading: 'Объекты на продажу',
    saleListingsDescription: 'Объявления о продаже недвижимости в Шарм-эль-Шейхе.',
    browseSaleListings: 'Смотреть объекты на продажу',
    rentListingsHeading: 'Объекты в аренду',
    rentListingsDescription: 'Объявления о краткосрочной и долгосрочной аренде.',
    browseAllRentals: 'Смотреть все варианты',
    rentLongTerm: 'Долгосрочная аренда',
    rentDaily: 'Посуточная аренда',
    districtCoordinates: 'Приблизительные координаты района',
    showDistrictListings: 'Смотреть объекты в районе',
    dataErrorTitle: 'Не удалось загрузить данные',
    retry: 'Повторить',
    noPropertiesHint: 'Измените параметры поиска или сбросьте фильтры.',
    loadingDistricts: 'Загрузка районов…',
    noDistricts: 'Районы не найдены.',
    requestStatus: 'Статус заявки:',
    dateLabel: 'Дата',
    clientLabel: 'Клиент',
    sendingRequest: 'Отправка…',
    bookingDateRequired: 'Укажите желаемую дату.',
    bookingTimeRequired: 'Укажите желаемое время.',
    settingsTitle: 'Настройки и навигация',
    quickSections: 'Разделы платформы',
    quickLink: 'Быстрый переход',
    currencyDisplay: 'Валюта отображения цен',
    currencyRatesLoading: 'Загрузка курса…',
    currencyRatesUnavailable: 'Курс временно недоступен',
    currencyRatesUpdatedDaily: 'Курсы обновляются раз в сутки.',
    languageInterface: 'Язык интерфейса',
    mobileAppTitle: 'Мобильное приложение (PWA)',
    mobileAppDescription: 'Добавьте ярлык Sharmino на главный экран или рабочий стол для быстрого доступа к сайту.',
    directSupport: 'Связь и консультации',
    additionalNavigation: 'Дополнительная навигация',
    settingsMenu: 'Меню',
    installed: 'Установлено',
    pwaActive: 'PWA активна',
    pwaInstall: 'Установить',
    pwaInstallOnDevice: 'Установить PWA на устройство',
    pwaInstructions: 'Инструкция',
    pwaInstalledApp: 'Установите приложение Sharmino',
    pwaAddToDevice: 'Добавьте приложение на устройство',
    pwaIosTitle: 'Установка Sharmino на iOS',
    pwaIosSafariHint: 'Для установки откройте эту страницу в Safari, затем добавьте её на домашний экран:',
    pwaIosHomeHint: 'Добавьте Sharmino на домашний экран:',
    pwaIosShareStep: '1. Нажмите кнопку «Поделиться» внизу в Safari',
    pwaIosHomeStep: '2. Выберите «На экран Домой»',
    pwaGotIt: 'Понятно, закрыть',
    pwaAndroidGuide: 'Откройте меню браузера (⋮) и выберите «Установить приложение» или «Добавить на главный экран».',
    pwaDesktopGuide: 'Используйте значок установки в адресной строке Chrome/Edge или пункт «Установить приложение» в меню браузера.',
    pwaBrowserGuide: 'Откройте меню браузера и найдите установку приложения или добавление на главный экран, если эта функция поддерживается.',
    pwaHttpsGuide: 'Установка доступна на HTTPS-сайте (или на localhost для разработки). Браузер покажет системное подтверждение.',
    splashSkip: 'Пропустить',
    splashLoading: 'Загрузка каталога…',
    splashSyncing: 'Загрузка предложений…',
    splashWelcome: 'Добро пожаловать в Шарм-эль-Шейх',
    scrollToTop: 'Наверх',
    activeFilters: 'Активно:',
    expandFilters: 'Развернуть фильтры',
    collapseFilters: 'Скрыть фильтры',
    editFilters: 'Изменить',
    maxPrice: 'Макс. цена',
    noLimit: 'Без ограничения',
    propertyType: 'Тип объекта',
    propertyTypeAny: 'Любой тип',
    typeApartment: 'Квартира',
    typeVilla: 'Вилла',
    typeStudio: 'Студия',
    typeDuplex: 'Дуплекс',
    typePenthouse: 'Пентхаус',
    typeChalet: 'Шале',
    typeCommercial: 'Коммерческая недвижимость',
    syncingData: 'Обновление данных',
    loadMore: 'Показать ещё',
    remainingCount: (count) => `осталось ${count}`,
    shareProperty: 'Поделиться объектом',
    propertyDescription: 'Описание объекта',
    amenitiesTitle: 'Удобства и инфраструктура',
    viewFromWindows: 'Вид из окон',
    comparisonTitle: 'Сравнение объектов недвижимости',
    comparisonDescription: 'Сопоставление цен, расположения, характеристик и удобств.',
    comparisonEmpty: 'Нет объектов для сравнения',
    comparisonEmptyHelp: 'Добавьте до 4 объектов с помощью значка сравнения на карточках каталога.',
    comparisonParameter: 'Параметр',
    comparisonRemove: 'Убрать из сравнения',
    comparisonPhotoPrice: 'Фото и стоимость',
    comparisonDistrictCompound: 'Район и компаунд',
    comparisonTotalArea: 'Общая площадь',
    comparisonBedroomsBathrooms: 'Спальни и санузлы',
    comparisonBeachAccess: 'Выход к морю / пляжу',
    comparisonHasBeach: 'Есть пляж',
    comparisonNoBeach: 'Нет прямого доступа',
    comparisonFurniture: 'Мебель и отделка',
    comparisonUnfurnished: 'Без мебели',
    comparisonCount: (count) => `${count} из 4`,
    adminCheckingAccount: 'Проверка учётной записи…',
    adminLogin: 'Вход администратора',
    adminAccessDescription: 'Доступ проверяется политиками RLS по роли пользователя в app_metadata.',
    adminPassword: 'Пароль',
    adminLoginError: 'Ошибка проверки входа',
    adminSigningIn: 'Вход…',
    adminSignIn: 'Войти',
    adminManageDatabase: 'Управление базой',
    adminChangesSaved: 'Изменения отправляются напрямую в Supabase.',
    adminExportLeads: 'Экспорт заявок',
    adminSignOut: 'Выйти',
    adminProperties: 'Объекты',
    adminProblematic: 'Проблемные',
    adminLeads: 'Заявки',
    adminScanDescription: 'Объекты без фотографий видны сразу. Проверка ссылок загружает изображения и может занять время.',
    adminCheckPhotos: 'Проверить фотографии',
    adminCheckProgress: (completed, total) => `Проверено ${completed} / ${total}`,
    adminNoProblematic: 'Не найдено объектов без фотографий или с обнаруженными ошибками. Чтобы проверить ссылки, нажмите «Проверить фотографии».',
    adminNoPhotos: 'Нет фотографий',
    adminAllPhotosFailed: 'Не загружается ни одна фотография',
    adminSomePhotosFailed: (broken, total) => `Не загружается ${broken} из ${total}`,
    adminWorkingPhotos: (count) => `работает ${count}`,
    adminObject: 'Объект',
    adminUnspecified: 'не указан',
    adminRefreshLeads: 'Обновить заявки',
    adminLoadingLeads: 'Загрузка заявок…',
    adminReturnCatalog: 'Вернуться к каталогу',
    profileShareDescription: 'Откройте ссылку на другом устройстве, чтобы перенести туда избранное и сравнение.',
    profileTransferTitle: 'Перенос данных профиля',
    profileTransferDescription: 'Вставьте ранее скопированные данные профиля в формате ссылки, Base64 или JSON.',
    profileCopied: 'Скопировано',
    profileCopy: 'Копировать',
    profileImport: 'Импорт данных профиля',
    profileImportPlaceholder: 'Вставьте сюда ссылку, Base64 или JSON с данными профиля…',
    profileRestore: 'Восстановить подборку',
    profileImportSuccess: 'Данные профиля успешно импортированы.',
    profileImportError: 'Не удалось прочитать данные профиля. Проверьте формат и попробуйте ещё раз.',
    oneTap: '1 шаг',
    pwaDesktopLabel: 'Компьютер',
    pwaBrowserLabel: 'Ваш браузер',
    splashLocation: 'Южный Синай · Египет',
    mapReloadTitle: 'Не удалось отобразить карту',
    mapRefreshDescription: 'Обновите карту, чтобы повторить загрузку.',
    refreshMap: 'Обновить карту',
    searchDistrict: 'Поиск по названию района',
    mapDistrictTag: 'Район',
    mapSatellite: 'Спутник',
    mapScheme: 'Схема',
    mapToggleDistrictGroups: 'Показать или скрыть объекты по районам',
    mapWholeSharm: 'Весь Шарм',
    mapResetDistrict: 'Сбросить фильтр района',
    mapApproxCenters: 'Показываются приблизительные центры районов, а не точные координаты объектов',
    mapProperties: 'На карте:',
    mapLoading: 'Загрузка…',
    mapWithoutDistrict: (count) => `${count} без района`,
    mapDistricts: 'Районы:',
    mapAll: 'Все',
    mapFoundListings: (count) => `Найдено ${count} предложений`,
    mapZoomDistrict: 'Приблизить район',
    mapResetFilter: 'Сбросить фильтр',
    mapFullscreen: 'Во весь экран',
    mapClosePreview: 'Закрыть превью',
    viewed: 'Просмотрено',
    mapPropertyDetails: 'Подробнее об объекте',
    mapZoomDistrictCenter: 'Приблизить примерный центр района',
    mapCard: 'Смотреть карточку',
    mapListings: (count) => `${count} объектов`,
    mapStartingPrice: 'от',
    savedProfileTitle: 'Профиль и сохранённые объекты',
    savedProfileDescription: 'Избранное и сравнение сохраняются в этом браузере.',
    historyTab: 'История',
    favoritesEmptyTitle: 'Список избранного пока пуст',
    favoritesEmptyDescription: 'Нажимайте на сердечко в каталоге, чтобы сохранить понравившиеся объекты.',
    shareFavorites: 'Поделиться подборкой',
    copiedLink: 'Ссылка скопирована',
    copyLink: 'Скопировать ссылку',
    shareTelegram: 'Отправить в Telegram',
    clearFavorites: 'Очистить избранное',
    removeFavorite: 'Убрать из избранного',
    compareEmptyTitle: 'Список сравнения пуст',
    compareEmptyDescription: 'Добавляйте объекты к сравнению, чтобы сопоставить цены, площадь и удобства.',
    removeFromList: 'Удалить',
    historyEmptyTitle: 'История просмотров пуста',
    historyEmptyDescription: 'Здесь отображаются недавно просмотренные объекты.',
    clearHistory: 'Очистить историю',
    recentPropertiesHeading: 'Новые объекты',
    recentPropertiesDescription: 'Недавно добавленные предложения.',
    emptyRecentProperties: 'Активных объектов пока нет.',
    close: 'Закрыть',
  },

  en: {
    appName: 'sharmino',
    tagline: 'Sharm El Sheikh Real Estate for Buyers and Tenants',
    brandSubtitle: 'Sharm real estate',
    navCatalog: 'Catalog',
    navBuy: 'Buy',
    navRent: 'Rent',
    navPopular: 'Latest',
    navDistricts: 'Districts',
    navAdmin: 'Admin',
    navAnalytics: 'Prices',
    navFavorites: 'Favorites',
    navCompare: 'Compare',
    navAlerts: 'Alerts',

    viewSplit: 'Map + Catalog',
    viewGrid: 'Grid',
    viewMap: 'Map',

    dealSale: 'Buy',
    dealRentLong: 'Long-term',
    dealRentDaily: 'Holiday',
    dealAll: 'All Deals',

    searchPlaceholder: 'Search by district, compound (Domina, Golf Heights, Sunny Lakes, Delta)...',
    allDistricts: 'All Districts',
    bedrooms: 'Bedrooms',
    bedroomsAll: 'All',
    studio: 'Studio',
    bathrooms: 'Bathrooms',
    areaM2: 'Area m²',
    priceFrom: 'Price from',
    priceTo: 'to',
    areaFrom: 'Area from, m²',
    areaTo: 'Area up to, m²',
    filters: 'Filters',
    reset: 'Reset',
    foundProperties: 'Properties found',
    sortBy: 'Sort by',
    sortFeatured: 'Recommended',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    sortAreaDesc: 'Largest Area',
    sortNewest: 'Newest Listed',
    distanceToBeach: 'Beach Access',
    firstLine: 'Beachfront',

    priceOnRequest: 'Price on request',
    deposit: 'Deposit',
    utilitiesExcluded: 'Utilities excluded',
    utilitiesIncluded: 'Utilities included',
    seaView: 'Sea View',
    poolView: 'Pool View',
    gardenView: 'Garden View',
    privateBeach: 'Private Beach',
    beachAccess: 'Beach Access',
    swimmingPool: 'Pool',
    furnished: 'Furnished',
    security247: '24/7 Security',
    parking: 'Parking',
    balcony: 'Balcony',
    terrace: 'Terrace',
    garden: 'Garden',
    wifi: 'Fast Wi-Fi',
    ac: 'Air Conditioning',
    washingMachine: 'Washing Machine',
    verified: 'Verified Listing',
    showPhone: 'Show Phone',

    perM2: 'per m²',
    rooms: 'Beds',
    area: 'Area',
    bookViewing: 'Book Viewing',
    details: 'Details',
    compound: 'Compound',

    bookingTitle: 'Book a Viewing',
    bookingSubtitle: 'Your request will be saved to the database. Once configured, notifications are sent to the team in Telegram.',
    inPersonViewing: 'In-person Viewing',
    inPersonDesc: 'Meet on-site in Sharm El Sheikh',
    videoTour: 'Live Video Tour',
    videoTourDesc: 'Live walkthrough via WhatsApp / Telegram',
    reserveRent: 'Reserve Rental',
    viewingDate: 'Viewing Date',
    viewingTime: 'Preferred Time',
    yourName: 'Your Full Name',
    namePlaceholder: 'e.g. John Doe',
    phoneWhatsapp: 'Phone / WhatsApp',
    telegramUsername: 'Telegram username',
    notesLabel: 'Notes or Requests (optional)',
    notesPlaceholder: 'Arrival date, airport pickup, lease duration...',
    submitBooking: 'Send Viewing Request',
    bookingSuccessTitle: 'Request Sent Successfully!',
    bookingSuccessDesc: 'Your request has been saved. The team will contact you using the phone number provided.',
    sentToTelegram: 'Request saved to database',
    whatsappDirect: 'Chat on WhatsApp Now',

    cookieTitle: 'Privacy and data',
    cookieDesc: 'Language, currency and favorites are stored in this browser. Contact details and request text are sent to Supabase. Visitor and device statistics are enabled only after consent, if the site owner configures Google Analytics.',
    cookieAcceptAll: 'Allow analytics',
    cookieNecessaryOnly: 'Necessary only',
    cookieNoAnalytics: 'Visitor analytics is not currently configured. The site stores preferences and favorites in this browser and sends inquiry data to Supabase.',
    privacySettings: 'Privacy settings',

    adminTitle: 'Database Property Management',
    adminSubtitle: 'Manage properties, check images and review customer inquiries',
    tabVisitors: 'Visitors & Cookies',
    tabProperties: 'Properties in DB',
    tabLeads: 'Client Inquiries',
    totalVisits: 'Total Visits',
    uniqueUsers: 'Unique Visitors',
    leadsReceived: 'Leads Received',
    recentLeads: 'Recent Inquiries',
    toggleStatus: 'Toggle Status',
    activeStatus: 'Active on Site',
    inactiveStatus: 'Hidden / Sold',

    rentHeroTitle: 'Property rentals in Sharm El Sheikh',
    rentHeroSubtitle: 'Apartments and villas for short-term and long-term rental.',
    saleHeroTitle: 'Buy Real Estate in Sharm El Sheikh',
    saleHeroSubtitle: 'Listings for apartments, houses and other properties for sale.',
    districtsHeroTitle: 'Sharm El Sheikh Districts',
    districtsHeroSubtitle: 'Guide to beaches, coral reefs, and amenities from Naama Bay to Montazah.',
    catalogTitle: 'Property listings',
    shareSelection: 'Share selection',
    favorites: 'Favorites',
    supabaseConnection: 'Catalog data',
    loadingProperties: 'Loading listings…',
    noProperties: 'No listings match these criteria',
    resetFilters: 'Reset filters',
    propertySale: 'For sale',
    propertyLongRent: 'Monthly rent',
    propertyDailyRent: 'Daily rent',
    unknownDistrict: 'District not specified',
    beach: 'Beach',
    bookingRequestSaved: 'Request saved',
    bookingRequestSavedDescription: 'Your request has been saved. The team will contact you using the phone number provided.',
    bookingRequestFailure: 'Unable to send the request. Please try again.',
    contactName: 'Your name',
    contactPhone: 'Phone / WhatsApp',
    contactTelegram: 'Telegram',
    viewingFormat: 'Contact method',
    reserveRental: 'Rental inquiry',
    requestedDate: 'Preferred date',
    requestedTime: 'Preferred time',
    optionalNotes: 'Message (optional)',
    sendRequest: 'Send request',
    showOnMap: 'Show on map',
    bedroomsCount: (count) => `${count} bedroom${count === 1 ? '' : 's'}`,
    bathroomsCount: (count) => `${count} bathroom${count === 1 ? '' : 's'}`,
    areaUnit: (area) => `${area} m²`,
    saleListingsHeading: 'Properties for sale',
    saleListingsDescription: 'Property listings in Sharm El Sheikh.',
    browseSaleListings: 'Browse properties for sale',
    rentListingsHeading: 'Properties for rent',
    rentListingsDescription: 'Short-term and long-term rental listings.',
    browseAllRentals: 'Browse all rentals',
    rentLongTerm: 'Long-term rentals',
    rentDaily: 'Daily rentals',
    districtCoordinates: 'Approximate district coordinates',
    showDistrictListings: 'View listings in this district',
    dataErrorTitle: 'Unable to load data',
    retry: 'Retry',
    noPropertiesHint: 'Adjust your search criteria or reset filters.',
    loadingDistricts: 'Loading districts…',
    noDistricts: 'No districts found.',
    requestStatus: 'Request status:',
    dateLabel: 'Date',
    clientLabel: 'Client',
    sendingRequest: 'Sending…',
    bookingDateRequired: 'Choose a preferred date.',
    bookingTimeRequired: 'Choose a preferred time.',
    settingsTitle: 'Settings and navigation',
    quickSections: 'Sections',
    quickLink: 'Quick links',
    currencyDisplay: 'Price display currency',
    currencyRatesLoading: 'Loading exchange rate…',
    currencyRatesUnavailable: 'Exchange rate temporarily unavailable',
    currencyRatesUpdatedDaily: 'Exchange rates update once a day.',
    languageInterface: 'Interface language',
    mobileAppTitle: 'Mobile app (PWA)',
    mobileAppDescription: 'Add a Sharmino shortcut to your home screen or desktop for quick access.',
    directSupport: 'Contact and support',
    additionalNavigation: 'Additional navigation',
    settingsMenu: 'Menu',
    installed: 'Installed',
    pwaActive: 'PWA active',
    pwaInstall: 'Install',
    pwaInstallOnDevice: 'Install PWA on this device',
    pwaInstructions: 'Instructions',
    pwaInstalledApp: 'Install the Sharmino app',
    pwaAddToDevice: 'Add the app to your device',
    pwaIosTitle: 'Install Sharmino on iOS',
    pwaIosSafariHint: 'Open this page in Safari, then add it to your Home Screen:',
    pwaIosHomeHint: 'Add Sharmino to your Home Screen:',
    pwaIosShareStep: '1. Tap the Share button at the bottom of Safari',
    pwaIosHomeStep: '2. Select “Add to Home Screen”',
    pwaGotIt: 'Got it',
    pwaAndroidGuide: 'Open the browser menu (⋮) and select “Install app” or “Add to Home screen”.',
    pwaDesktopGuide: 'Use the install icon in Chrome/Edge’s address bar or select “Install app” in the browser menu.',
    pwaBrowserGuide: 'Open the browser menu and look for an install or add-to-home-screen option, if supported.',
    pwaHttpsGuide: 'Installation requires HTTPS (or localhost during development). Confirm the browser prompt to finish.',
    splashSkip: 'Skip',
    splashLoading: 'Loading catalog…',
    splashSyncing: 'Loading listings…',
    splashWelcome: 'Welcome to Sharm El Sheikh',
    scrollToTop: 'Back to top',
    activeFilters: 'Active:',
    expandFilters: 'Expand filters',
    collapseFilters: 'Hide filters',
    editFilters: 'Edit',
    maxPrice: 'Max. price',
    noLimit: 'No limit',
    propertyType: 'Property type',
    propertyTypeAny: 'Any type',
    typeApartment: 'Apartment',
    typeVilla: 'Villa',
    typeStudio: 'Studio',
    typeDuplex: 'Duplex',
    typePenthouse: 'Penthouse',
    typeChalet: 'Chalet',
    typeCommercial: 'Commercial',
    syncingData: 'Updating data',
    loadMore: 'Load more',
    remainingCount: (count) => `${count} remaining`,
    shareProperty: 'Share property',
    propertyDescription: 'Property description',
    amenitiesTitle: 'Features and amenities',
    viewFromWindows: 'View',
    comparisonTitle: 'Compare properties',
    comparisonDescription: 'Compare prices, locations, features and amenities.',
    comparisonEmpty: 'No properties to compare',
    comparisonEmptyHelp: 'Add up to 4 properties using the compare icon on catalog cards.',
    comparisonParameter: 'Feature',
    comparisonRemove: 'Remove from comparison',
    comparisonPhotoPrice: 'Photo and price',
    comparisonDistrictCompound: 'District and compound',
    comparisonTotalArea: 'Total area',
    comparisonBedroomsBathrooms: 'Bedrooms and bathrooms',
    comparisonBeachAccess: 'Sea / beach access',
    comparisonHasBeach: 'Beach access',
    comparisonNoBeach: 'No direct access',
    comparisonFurniture: 'Furniture and finish',
    comparisonUnfurnished: 'Unfurnished',
    comparisonCount: (count) => `${count} of 4`,
    adminCheckingAccount: 'Checking account…',
    adminLogin: 'Administrator sign-in',
    adminAccessDescription: 'Access is checked by RLS policies using the user role in app_metadata.',
    adminPassword: 'Password',
    adminLoginError: 'Unable to verify sign-in',
    adminSigningIn: 'Signing in…',
    adminSignIn: 'Sign in',
    adminManageDatabase: 'Database management',
    adminChangesSaved: 'Changes are sent directly to Supabase.',
    adminExportLeads: 'Export inquiries',
    adminSignOut: 'Sign out',
    adminProperties: 'Properties',
    adminProblematic: 'Problematic',
    adminLeads: 'Inquiries',
    adminScanDescription: 'Properties without photos are listed immediately. Link checks load each image and may take some time.',
    adminCheckPhotos: 'Check photos',
    adminCheckProgress: (completed, total) => `Checked ${completed} / ${total}`,
    adminNoProblematic: 'No properties without photos or with detected errors. Click “Check photos” to test image links.',
    adminNoPhotos: 'No photos',
    adminAllPhotosFailed: 'All photos failed to load',
    adminSomePhotosFailed: (broken, total) => `${broken} of ${total} photos failed to load`,
    adminWorkingPhotos: (count) => `${count} working`,
    adminObject: 'Property',
    adminUnspecified: 'not specified',
    adminRefreshLeads: 'Refresh inquiries',
    adminLoadingLeads: 'Loading inquiries…',
    adminReturnCatalog: 'Back to catalog',
    profileShareDescription: 'Open this link on another device to transfer your favorites and comparison list.',
    profileTransferTitle: 'Transfer profile data',
    profileTransferDescription: 'Paste previously copied profile data as a link, Base64 string or JSON.',
    profileCopied: 'Copied',
    profileCopy: 'Copy',
    profileImport: 'Import profile data',
    profileImportPlaceholder: 'Paste a profile link, Base64 string or JSON here…',
    profileRestore: 'Restore collection',
    profileImportSuccess: 'Profile data imported successfully.',
    profileImportError: 'Unable to read profile data. Check the format and try again.',
    oneTap: '1 step',
    pwaDesktopLabel: 'Desktop',
    pwaBrowserLabel: 'Your browser',
    splashLocation: 'South Sinai · Egypt',
    mapReloadTitle: 'Unable to display the map',
    mapRefreshDescription: 'Refresh the map to try loading it again.',
    refreshMap: 'Refresh map',
    searchDistrict: 'Search districts',
    mapDistrictTag: 'District',
    mapSatellite: 'Satellite',
    mapScheme: 'Map',
    mapToggleDistrictGroups: 'Show or hide listings grouped by district',
    mapWholeSharm: 'All Sharm',
    mapResetDistrict: 'Clear district filter',
    mapApproxCenters: 'Approximate district centers are shown, not precise property coordinates',
    mapProperties: 'On map:',
    mapLoading: 'Loading…',
    mapWithoutDistrict: (count) => `${count} without a district`,
    mapDistricts: 'Districts:',
    mapAll: 'All',
    mapFoundListings: (count) => `${count} listings found`,
    mapZoomDistrict: 'Zoom to district',
    mapResetFilter: 'Clear filter',
    mapFullscreen: 'Full screen',
    mapClosePreview: 'Close preview',
    viewed: 'Viewed',
    mapPropertyDetails: 'View property details',
    mapZoomDistrictCenter: 'Zoom to approximate district center',
    mapCard: 'View listing',
    mapListings: (count) => `${count} listings`,
    mapStartingPrice: 'from',
    savedProfileTitle: 'Profile and saved properties',
    savedProfileDescription: 'Favorites and comparisons are saved in this browser.',
    historyTab: 'Recently viewed',
    favoritesEmptyTitle: 'No saved properties yet',
    favoritesEmptyDescription: 'Tap the heart on a listing to save a property you like.',
    shareFavorites: 'Share collection',
    copiedLink: 'Link copied',
    copyLink: 'Copy link',
    shareTelegram: 'Share on Telegram',
    clearFavorites: 'Clear favorites',
    removeFavorite: 'Remove from favorites',
    compareEmptyTitle: 'No properties to compare',
    compareEmptyDescription: 'Add properties to compare their prices, area and features.',
    removeFromList: 'Remove',
    historyEmptyTitle: 'No viewing history',
    historyEmptyDescription: 'Recently viewed properties will appear here.',
    clearHistory: 'Clear history',
    recentPropertiesHeading: 'Recently added',
    recentPropertiesDescription: 'Recently added listings.',
    emptyRecentProperties: 'There are no active listings yet.',
    close: 'Close',
  },

  it: {
    appName: 'sharmino',
    tagline: 'Immobiliare a Sharm El Sheikh per acquirenti e inquilini',
    brandSubtitle: 'Immobili a Sharm',
    navCatalog: 'Catalogo',
    navBuy: 'Comprare',
    navRent: 'Affitto',
    navPopular: 'Recenti',
    navDistricts: 'Quartieri',
    navAdmin: 'Admin',
    navAnalytics: 'Prezzi',
    navFavorites: 'Preferiti',
    navCompare: 'Confronta',
    navAlerts: 'Notifiche',

    viewSplit: 'Mappa + Catalogo',
    viewGrid: 'Griglia',
    viewMap: 'Mappa',

    dealSale: 'Comprare',
    dealRentLong: 'Lungo termine',
    dealRentDaily: 'Vacanze',
    dealAll: 'Tutti',

    searchPlaceholder: 'Cerca per quartiere, residence (Domina, Golf Heights, Sunny Lakes, Delta)...',
    allDistricts: 'Tutti i quartieri',
    bedrooms: 'Camere',
    bedroomsAll: 'Tutte',
    studio: 'Monolocale',
    bathrooms: 'Bagni',
    areaM2: 'Superficie m²',
    priceFrom: 'Prezzo da',
    priceTo: 'a',
    areaFrom: 'Superficie da, m²',
    areaTo: 'Superficie fino a, m²',
    filters: 'Filtri',
    reset: 'Reimposta',
    foundProperties: 'Immobili trovati',
    sortBy: 'Ordina per',
    sortFeatured: 'Consigliati',
    sortPriceAsc: 'Prezzo: crescente',
    sortPriceDesc: 'Prezzo: decrescente',
    sortAreaDesc: 'Superficie maggiore',
    sortNewest: 'Più recenti',
    distanceToBeach: 'Accesso spiaggia',
    firstLine: 'Prima linea mare',

    priceOnRequest: 'Prezzo su richiesta',
    deposit: 'Cauzione',
    utilitiesExcluded: 'Utenze escluse',
    utilitiesIncluded: 'Utenze incluse',
    seaView: 'Vista mare',
    poolView: 'Vista piscina',
    gardenView: 'Vista giardino',
    privateBeach: 'Spiaggia privata',
    beachAccess: 'Accesso alla spiaggia',
    swimmingPool: 'Piscina',
    furnished: 'Arredato',
    security247: 'Sicurezza 24/7',
    parking: 'Parcheggio',
    balcony: 'Balcone',
    terrace: 'Terrazza',
    garden: 'Giardino',
    wifi: 'Wi-Fi veloce',
    ac: 'Aria condizionata',
    washingMachine: 'Lavatrice',
    verified: 'Annuncio verificato',
    showPhone: 'Mostra telefono',

    perM2: 'al m²',
    rooms: 'Camere',
    area: 'Superficie',
    bookViewing: 'Prenota visita',
    details: 'Dettagli',
    compound: 'Residence',

    bookingTitle: 'Prenota una visita',
    bookingSubtitle: 'La richiesta sarà salvata nel database. Dopo la configurazione, le notifiche saranno inviate al team su Telegram.',
    inPersonViewing: 'Visita sul posto',
    inPersonDesc: 'Incontra l\'agente all\'immobile a Sharm',
    videoTour: 'Video tour online',
    videoTourDesc: 'In diretta WhatsApp / Telegram con tour guidato',
    reserveRent: 'Prenota affitto',
    viewingDate: 'Data visita',
    viewingTime: 'Orario preferito',
    yourName: 'Nome e cognome',
    namePlaceholder: 'Es. Marco Rossi',
    phoneWhatsapp: 'Telefono / WhatsApp',
    telegramUsername: 'Telegram username',
    notesLabel: 'Note o richieste (facoltativo)',
    notesPlaceholder: 'Data arrivo, navetta, durata locazione...',
    submitBooking: 'Invia richiesta visita',
    bookingSuccessTitle: 'Richiesta inviata con successo!',
    bookingSuccessDesc: 'La richiesta è stata salvata. Il team ti contatterà al numero indicato.',
    sentToTelegram: 'Richiesta salvata nel database',
    whatsappDirect: 'Scrivi su WhatsApp ora',

    cookieTitle: 'Privacy e dati',
    cookieDesc: 'Lingua, valuta e preferiti sono salvati in questo browser. I recapiti e il testo della richiesta vengono inviati a Supabase. Le statistiche su visite e dispositivi vengono attivate solo con il consenso, se il proprietario configura Google Analytics.',
    cookieAcceptAll: 'Consenti analytics',
    cookieNecessaryOnly: 'Solo necessari',
    cookieNoAnalytics: 'Le statistiche delle visite non sono attualmente configurate. Il sito salva preferenze e preferiti nel browser e invia le richieste a Supabase.',
    privacySettings: 'Impostazioni privacy',

    adminTitle: 'Gestione del database immobili',
    adminSubtitle: 'Gestione immobili, controllo immagini e richieste dei clienti',
    tabVisitors: 'Visitatori & Cookies',
    tabProperties: 'Immobili nel DB',
    tabLeads: 'Richieste clienti',
    totalVisits: 'Visite totali',
    uniqueUsers: 'Utenti unici',
    leadsReceived: 'Richieste ricevute',
    recentLeads: 'Ultime richieste',
    toggleStatus: 'Modifica stato',
    activeStatus: 'Attivo sul sito',
    inactiveStatus: 'Nascosto / Venduto',

    rentHeroTitle: 'Immobili in affitto a Sharm El Sheikh',
    rentHeroSubtitle: 'Appartamenti e ville per affitti brevi e lunghi.',
    saleHeroTitle: 'Acquisto immobili a Sharm El Sheikh',
    saleHeroSubtitle: 'Annunci di appartamenti, case e altri immobili in vendita.',
    districtsHeroTitle: 'Quartieri di Sharm El Sheikh',
    districtsHeroSubtitle: 'Guida a spiagge, barriere coralline e servizi da Naama Bay a Montazah.',
    catalogTitle: 'Annunci immobiliari',
    shareSelection: 'Condividi selezione',
    favorites: 'Preferiti',
    supabaseConnection: 'Dati del catalogo',
    loadingProperties: 'Caricamento annunci…',
    noProperties: 'Nessun annuncio corrisponde ai criteri',
    resetFilters: 'Reimposta filtri',
    propertySale: 'In vendita',
    propertyLongRent: 'Affitto mensile',
    propertyDailyRent: 'Affitto giornaliero',
    unknownDistrict: 'Quartiere non specificato',
    beach: 'Spiaggia',
    bookingRequestSaved: 'Richiesta salvata',
    bookingRequestSavedDescription: 'La richiesta è stata salvata. Il team ti contatterà al numero indicato.',
    bookingRequestFailure: 'Impossibile inviare la richiesta. Riprova.',
    contactName: 'Il tuo nome',
    contactPhone: 'Telefono / WhatsApp',
    contactTelegram: 'Telegram',
    viewingFormat: 'Metodo di contatto',
    reserveRental: 'Richiesta di affitto',
    requestedDate: 'Data preferita',
    requestedTime: 'Orario preferito',
    optionalNotes: 'Messaggio (facoltativo)',
    sendRequest: 'Invia richiesta',
    showOnMap: 'Mostra sulla mappa',
    bedroomsCount: (count) => `${count} camer${count === 1 ? 'a' : 'e'}`,
    bathroomsCount: (count) => `${count} bagn${count === 1 ? 'o' : 'i'}`,
    areaUnit: (area) => `${area} m²`,
    saleListingsHeading: 'Immobili in vendita',
    saleListingsDescription: 'Annunci immobiliari a Sharm El Sheikh.',
    browseSaleListings: 'Vedi immobili in vendita',
    rentListingsHeading: 'Immobili in affitto',
    rentListingsDescription: 'Annunci per affitti brevi e lunghi.',
    browseAllRentals: 'Vedi tutti gli affitti',
    rentLongTerm: 'Affitti a lungo termine',
    rentDaily: 'Affitti giornalieri',
    districtCoordinates: 'Coordinate approssimative del quartiere',
    showDistrictListings: 'Vedi annunci in questo quartiere',
    dataErrorTitle: 'Impossibile caricare i dati',
    retry: 'Riprova',
    noPropertiesHint: 'Modifica i criteri di ricerca o reimposta i filtri.',
    loadingDistricts: 'Caricamento quartieri…',
    noDistricts: 'Nessun quartiere trovato.',
    requestStatus: 'Stato della richiesta:',
    dateLabel: 'Data',
    clientLabel: 'Cliente',
    sendingRequest: 'Invio…',
    bookingDateRequired: 'Seleziona una data preferita.',
    bookingTimeRequired: 'Seleziona un orario preferito.',
    settingsTitle: 'Impostazioni e navigazione',
    quickSections: 'Sezioni',
    quickLink: 'Collegamenti rapidi',
    currencyDisplay: 'Valuta di visualizzazione',
    currencyRatesLoading: 'Caricamento del tasso…',
    currencyRatesUnavailable: 'Tasso temporaneamente non disponibile',
    currencyRatesUpdatedDaily: 'I tassi si aggiornano una volta al giorno.',
    languageInterface: 'Lingua dell’interfaccia',
    mobileAppTitle: 'App mobile (PWA)',
    mobileAppDescription: 'Aggiungi un collegamento Sharmino alla schermata iniziale o al desktop per accedere rapidamente.',
    directSupport: 'Contatti e assistenza',
    additionalNavigation: 'Navigazione aggiuntiva',
    settingsMenu: 'Menu',
    installed: 'Installata',
    pwaActive: 'PWA attiva',
    pwaInstall: 'Installa',
    pwaInstallOnDevice: 'Installa la PWA sul dispositivo',
    pwaInstructions: 'Istruzioni',
    pwaInstalledApp: 'Installa l’app Sharmino',
    pwaAddToDevice: 'Aggiungi l’app al dispositivo',
    pwaIosTitle: 'Installa Sharmino su iOS',
    pwaIosSafariHint: 'Apri questa pagina in Safari e aggiungila alla schermata Home:',
    pwaIosHomeHint: 'Aggiungi Sharmino alla schermata Home:',
    pwaIosShareStep: '1. Tocca il pulsante Condividi in fondo a Safari',
    pwaIosHomeStep: '2. Seleziona “Aggiungi alla schermata Home”',
    pwaGotIt: 'Ho capito',
    pwaAndroidGuide: 'Apri il menu del browser (⋮) e seleziona “Installa app” o “Aggiungi alla schermata Home”.',
    pwaDesktopGuide: 'Usa l’icona di installazione nella barra degli indirizzi di Chrome/Edge o il menu del browser.',
    pwaBrowserGuide: 'Apri il menu del browser e cerca l’opzione di installazione, se supportata.',
    pwaHttpsGuide: 'L’installazione richiede HTTPS (o localhost in sviluppo). Conferma la richiesta del browser.',
    splashSkip: 'Salta',
    splashLoading: 'Caricamento del catalogo…',
    splashSyncing: 'Caricamento degli annunci…',
    splashWelcome: 'Benvenuto a Sharm El Sheikh',
    scrollToTop: 'Torna in alto',
    activeFilters: 'Attivi:',
    expandFilters: 'Espandi filtri',
    collapseFilters: 'Nascondi filtri',
    editFilters: 'Modifica',
    maxPrice: 'Prezzo max.',
    noLimit: 'Nessun limite',
    propertyType: 'Tipo di immobile',
    propertyTypeAny: 'Qualsiasi tipo',
    typeApartment: 'Appartamento',
    typeVilla: 'Villa',
    typeStudio: 'Monolocale',
    typeDuplex: 'Duplex',
    typePenthouse: 'Attico',
    typeChalet: 'Chalet',
    typeCommercial: 'Commerciale',
    syncingData: 'Aggiornamento dati',
    loadMore: 'Mostra altri',
    remainingCount: (count) => `ne restano ${count}`,
    shareProperty: 'Condividi immobile',
    propertyDescription: 'Descrizione dell’immobile',
    amenitiesTitle: 'Caratteristiche e servizi',
    viewFromWindows: 'Vista',
    comparisonTitle: 'Confronta immobili',
    comparisonDescription: 'Confronta prezzi, posizione, caratteristiche e servizi.',
    comparisonEmpty: 'Nessun immobile da confrontare',
    comparisonEmptyHelp: 'Aggiungi fino a 4 immobili usando l’icona di confronto nel catalogo.',
    comparisonParameter: 'Caratteristica',
    comparisonRemove: 'Rimuovi dal confronto',
    comparisonPhotoPrice: 'Foto e prezzo',
    comparisonDistrictCompound: 'Quartiere e complesso',
    comparisonTotalArea: 'Superficie totale',
    comparisonBedroomsBathrooms: 'Camere e bagni',
    comparisonBeachAccess: 'Accesso al mare / spiaggia',
    comparisonHasBeach: 'Accesso alla spiaggia',
    comparisonNoBeach: 'Nessun accesso diretto',
    comparisonFurniture: 'Arredi e finiture',
    comparisonUnfurnished: 'Non arredato',
    comparisonCount: (count) => `${count} di 4`,
    adminCheckingAccount: 'Verifica dell’account…',
    adminLogin: 'Accesso amministratore',
    adminAccessDescription: 'L’accesso è verificato dalle policy RLS usando il ruolo in app_metadata.',
    adminPassword: 'Password',
    adminLoginError: 'Impossibile verificare l’accesso',
    adminSigningIn: 'Accesso…',
    adminSignIn: 'Accedi',
    adminManageDatabase: 'Gestione database',
    adminChangesSaved: 'Le modifiche vengono inviate direttamente a Supabase.',
    adminExportLeads: 'Esporta richieste',
    adminSignOut: 'Esci',
    adminProperties: 'Immobili',
    adminProblematic: 'Con problemi',
    adminLeads: 'Richieste',
    adminScanDescription: 'Gli immobili senza foto sono elencati subito. Il controllo dei link carica ogni immagine e può richiedere tempo.',
    adminCheckPhotos: 'Controlla foto',
    adminCheckProgress: (completed, total) => `Controllate ${completed} / ${total}`,
    adminNoProblematic: 'Nessun immobile senza foto o con errori rilevati. Seleziona “Controlla foto” per verificare i link.',
    adminNoPhotos: 'Nessuna foto',
    adminAllPhotosFailed: 'Nessuna foto è stata caricata',
    adminSomePhotosFailed: (broken, total) => `${broken} di ${total} foto non caricate`,
    adminWorkingPhotos: (count) => `${count} caricate`,
    adminObject: 'Immobile',
    adminUnspecified: 'non specificato',
    adminRefreshLeads: 'Aggiorna richieste',
    adminLoadingLeads: 'Caricamento richieste…',
    adminReturnCatalog: 'Torna al catalogo',
    profileShareDescription: 'Apri il link su un altro dispositivo per trasferire preferiti e confronto.',
    profileTransferTitle: 'Trasferimento dei dati del profilo',
    profileTransferDescription: 'Incolla i dati del profilo precedentemente copiati come link, Base64 o JSON.',
    profileCopied: 'Copiato',
    profileCopy: 'Copia',
    profileImport: 'Importa dati del profilo',
    profileImportPlaceholder: 'Incolla qui un link, una stringa Base64 o un JSON del profilo…',
    profileRestore: 'Ripristina selezione',
    profileImportSuccess: 'Dati del profilo importati correttamente.',
    profileImportError: 'Impossibile leggere i dati. Controlla il formato e riprova.',
    oneTap: '1 passaggio',
    pwaDesktopLabel: 'Computer',
    pwaBrowserLabel: 'Il browser',
    splashLocation: 'Sinai del Sud · Egitto',
    mapReloadTitle: 'Impossibile visualizzare la mappa',
    mapRefreshDescription: 'Aggiorna la mappa per riprovare.',
    refreshMap: 'Aggiorna mappa',
    searchDistrict: 'Cerca quartieri',
    mapDistrictTag: 'Quartiere',
    mapSatellite: 'Satellite',
    mapScheme: 'Mappa',
    mapToggleDistrictGroups: 'Mostra o nascondi gli immobili per quartiere',
    mapWholeSharm: 'Tutta Sharm',
    mapResetDistrict: 'Rimuovi filtro quartiere',
    mapApproxCenters: 'Sono mostrati i centri approssimativi dei quartieri, non le coordinate precise degli immobili',
    mapProperties: 'Sulla mappa:',
    mapLoading: 'Caricamento…',
    mapWithoutDistrict: (count) => `${count} senza quartiere`,
    mapDistricts: 'Quartieri:',
    mapAll: 'Tutti',
    mapFoundListings: (count) => `Annunci trovati: ${count}`,
    mapZoomDistrict: 'Ingrandisci quartiere',
    mapResetFilter: 'Rimuovi filtro',
    mapFullscreen: 'Schermo intero',
    mapClosePreview: 'Chiudi anteprima',
    viewed: 'Visualizzato',
    mapPropertyDetails: 'Dettagli immobile',
    mapZoomDistrictCenter: 'Ingrandisci il centro approssimativo del quartiere',
    mapCard: 'Apri annuncio',
    mapListings: (count) => `${count} immobili`,
    mapStartingPrice: 'da',
    savedProfileTitle: 'Profilo e immobili salvati',
    savedProfileDescription: 'Preferiti e confronti sono salvati in questo browser.',
    historyTab: 'Visti di recente',
    favoritesEmptyTitle: 'Nessun immobile salvato',
    favoritesEmptyDescription: 'Tocca il cuore su un annuncio per salvarlo.',
    shareFavorites: 'Condividi selezione',
    copiedLink: 'Link copiato',
    copyLink: 'Copia link',
    shareTelegram: 'Condividi su Telegram',
    clearFavorites: 'Svuota preferiti',
    removeFavorite: 'Rimuovi dai preferiti',
    compareEmptyTitle: 'Nessun immobile da confrontare',
    compareEmptyDescription: 'Aggiungi immobili per confrontare prezzi, superficie e caratteristiche.',
    removeFromList: 'Rimuovi',
    historyEmptyTitle: 'Cronologia vuota',
    historyEmptyDescription: 'Qui appariranno gli immobili visualizzati di recente.',
    clearHistory: 'Cancella cronologia',
    recentPropertiesHeading: 'Aggiunti di recente',
    recentPropertiesDescription: 'Annunci aggiunti di recente.',
    emptyRecentProperties: 'Non ci sono ancora immobili attivi.',
    close: 'Chiudi',
  },
};

export function detectSystemLanguage(): Language {
  if (typeof navigator === 'undefined') return 'ru';
  const userLang = (navigator.language || (navigator as { userLanguage?: string }).userLanguage || '').toLowerCase();
  if (userLang.startsWith('it')) return 'it';
  if (userLang.startsWith('ru') || userLang.startsWith('be') || userLang.startsWith('uk')) return 'ru';
  if (userLang.startsWith('en')) return 'en';
  return 'en';
}

export function formatBedrooms(count: number, language: Language): string {
  if (count === 0) return translations[language].studio;
  if (language === 'ru') return translations.ru.bedroomsCount(count);
  return translations[language].bedroomsCount(count);
}

export function formatBathrooms(count: number, language: Language): string {
  return translations[language].bathroomsCount(count);
}

export function getDistrictLabel(
  district: { name_ru: string; name_en: string } | null | undefined,
  language: Language,
): string {
  if (!district) return translations[language].unknownDistrict;
  return language === 'ru' ? district.name_ru : district.name_en;
}

export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem('sharmino_lang') as Language;
    if (saved && (saved === 'ru' || saved === 'en' || saved === 'it')) {
      return saved;
    }
  } catch {
    // ignore
  }
  return detectSystemLanguage();
}
