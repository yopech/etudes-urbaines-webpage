'use strict';

// Single source for published works, prices, print geometry and order text.
(() => {
  const works = [
    { id: 'rescuer-03', title: 'Спасатель 03', location: 'Барселона', width: 4000, height: 2666,
      source: 'assets/спасатель_03.jpg',
      alt: 'Спасатель в жёлтой рубашке у вышки 03; в окне отражаются пляж и Барселона',
      description: 'Спасатель у пляжа Барселоны. В окне за его спиной отражаются море, отдыхающие и город. Жёлтая рубашка и красный номер 03 связывают две части кадра.' },
    { id: 'tbilisi', title: 'Тбилиси', location: 'Тбилиси', width: 4526, height: 3394,
      source: 'assets/P1050803.jpg',
      alt: 'Светлый угловой фасад с бирюзовыми деталями на фоне синего неба в Тбилиси',
      description: 'Угол здания на фоне синего неба. Бирюзовые детали на светлом фасаде отбрасывают короткие тени, а две его стороны сходятся почти симметрично.' },
    { id: 'city', title: 'Сити в тумане', location: 'Москва', width: 2638, height: 3517,
      source: 'assets/IMG_20260306_104846_943.jpg',
      alt: 'Башни Москва-Сити в тумане и изгиб эстакады с синей подсветкой',
      description: 'Верхушки башен скрываются в тумане. Внизу изгибается освещённая синим эстакада, а в окнах остаются отдельные огни.' },
    { id: 'kosmaj', title: 'Космай', location: 'Сербия', width: 2898, height: 3864,
      source: 'assets/пост 1.jpg',
      alt: 'Бетонные лучи монумента Космай в зимнем тумане, снег и голые деревья',
      description: 'Зимний Космай: бетонные лучи монумента уходят в туман, вокруг — снег и голые деревья. Почти весь кадр держится на оттенках серого.' }
  ];
  const sizes = { small: { short: 40, long: 60, price: 5900 }, large: { short: 60, long: 90, price: 9900 } };
  function dimensions(work, key) {
    const size = sizes[key];
    if (!size) throw new Error('Unknown print size');
    const portrait = work.height > work.width;
    const sheetWidth = portrait ? size.short : size.long;
    const sheetHeight = portrait ? size.long : size.short;
    const scale = Math.min(sheetWidth / work.width, sheetHeight / work.height);
    const imageWidth = work.width * scale;
    const imageHeight = work.height * scale;
    const horizontalMargin = Math.max(0, (sheetWidth - imageWidth) / 2);
    const verticalMargin = Math.max(0, (sheetHeight - imageHeight) / 2);
    return { sheetWidth, sheetHeight, imageWidth, imageHeight, margin: Math.max(horizontalMargin, verticalMargin), marginAxis: horizontalMargin > verticalMargin ? 'слева и справа' : 'сверху и снизу' };
  }
  const formatNumber = (value) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(value);
  const formatDimensions = (width, height) => `${formatNumber(width)} × ${formatNumber(height)}`;
  const formatPrice = (value) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
  function orderText(work, key, url) {
    const d = dimensions(work, key);
    const fields = d.margin > 0.1 ? `Белые поля ${d.marginAxis}, примерно по ${formatNumber(d.margin)} см.` : 'Изображение практически на весь лист.';
    return `Здравствуйте, Игорь! Хочу обсудить заказ фотографии «${work.title}» (${work.location}).\nЛист: ${formatDimensions(d.sheetWidth, d.sheetHeight)} см.\nИзображение: ≈ ${formatDimensions(d.imageWidth, d.imageHeight)} см. ${fields}\nFujicolor Crystal Archive DPII Silk, без рамы и паспарту.\nПредварительная цена: ≈ ${formatPrice(sizes[key].price)}. Упаковка включена, доставка отдельно.\nПодскажите итоговую стоимость, срок и условия заказа.\n${url}`;
  }
  const catalog = { works, sizes, dimensions, formatNumber, formatDimensions, formatPrice, orderText };
  if (typeof module !== 'undefined' && module.exports) module.exports = catalog;
  else globalThis.PrintCatalog = catalog;
})();
