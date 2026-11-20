# Утренняя смена

Вертикальная браузерная аркада-поздравление. Откройте `index.html` или запустите в папке игры `python -m http.server 8000` и откройте `http://localhost:8000/`.

- Оттяните лейкоцит пальцем или мышью и отпустите. Пунктир показывает траекторию. Тап по полю даёт короткий способ прицелиться.
- Во второй локации первый бросок подводит тележку к клапану сердца, а второй отправляет её внутрь с рикошета.
- На клавиатуре пробел или Enter запускают бросок с подсказкой. Esc открывает паузу. Во время диалога тап по экрану, Enter или пробел допечатывают текущую реплику. Следующее нажатие показывает следующую реплику или возвращает к игре. Кнопки паузы и звука работают как обычно.
- Пожелание открывается после чаепития. В финале поцелуй в щёку открывает мем, у второго выбора своя реплика.

Фотографии подставляются автоматически после обновления страницы. Положите JPEG-файлы в папку `assets` рядом с `index.html`.

| Имя файла | Где появится |
| --- | --- |
| `beard.jpg` | Фото с бородой на тележке в сердце |
| `shrek.jpg` | Фото со Шреком в финале |
| `kiss-meme.jpg` | Мем после поцелуя в щёку |
| `tea.jpg` | Отдельное фото на чайном пакетике, если есть |

Если `tea.jpg` отсутствует, пакетик использует фото с бородой. В отсутствие своих фото в игре видны заглушки.

## Публикация на GitHub Pages

1. На GitHub создайте публичный репозиторий, например `morning-shift`, и отметьте **Add a README file**, чтобы появилась ветка `main`. На GitHub Free для Pages нужен публичный репозиторий. Загруженные фотографии будут доступны публично. Добавляйте только те, которыми готовы поделиться. [Документация GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
2. Откройте **Add file → Upload files**. Перетащите `index.html`, `style.css`, `game.js`, `vessel.js`, `sound.js` и папку `assets` целиком. В списке загрузки `index.html` должен лежать в корне, а ресурсы должны иметь пути вида `assets/sip.mp3`. Выберите коммит прямо в `main` и нажмите **Commit changes**. Сборка и установка зависимостей не нужны. [Загрузка файлов через GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository#adding-a-file-to-a-repository-on-github)
3. Откройте **Settings → Pages**. В разделе **Build and deployment** выберите **Deploy from a branch**, затем ветку `main` и папку **/(root)**. Нажмите **Save**. [Настройка источника публикации](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-from-a-branch)
4. Когда публикация завершится, откройте **Visit site** в **Settings → Pages**. Для репозитория из примера адрес будет вида `https://ВАШ-ЛОГИН.github.io/morning-shift/`. Откройте ссылку на телефоне и проверьте запуск, тап за пределами облачка и фото в финале. Если сайт не появился, проверьте запуск **pages build and deployment** во вкладке **Actions**.

Для обновления загрузите изменённые файлы по тем же путям в `main`. GitHub Pages опубликует новую версию автоматически.

Архивный портрет: Рубен Р. Сэллоус, из коллекции Huron County Museum & Historic Gaol. [Источник](https://commons.wikimedia.org/wiki/File:Portrait_of_a_bearded_man,_date_unknown.jpg). Пиксельный образ Егора Вируса — вымышленная пародия с отсылкой к фразе из песни «Будущий бывший». [Клип](https://www.youtube.com/watch?v=iCzdIYw4E-4). Запись глотка: Breviceps, [Drink / Drinking liquid, CC0](https://freesound.org/people/Breviceps/sounds/445970/). Музыка и остальные эффекты синтезируются в Web Audio.
