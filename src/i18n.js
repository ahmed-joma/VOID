/* VOID — i18n.js | Multi-language Support */

const VoidI18n = (() => {

  const langs = {

    en: {
      dir: 'ltr',
      flag: 'EN',
      tagline: 'NO TRACE · NO PROOF · NOTHING',
      nav: { home: 'HOME', encode: 'ENCODE', decode: 'DECODE', about: 'ABOUT' },
      hero: {
        sub: 'hide anything inside anything.<br>zero server. zero logs. zero trace.',
        cta: 'ENTER VOID →'
      },
      features: [
        { title: 'AES-256 ENCRYPTION', desc: 'Military-grade encryption before hiding. Wrong password = nothing.' },
        { title: 'LSB STEGANOGRAPHY', desc: 'Message hidden in pixel data. Image looks 100% identical.' },
        { title: 'ZERO SERVER', desc: 'Everything runs in your browser. Nothing is sent anywhere. Ever.' },
        { title: 'SELF-DESTRUCT', desc: 'Revealed messages auto-wipe after 30 seconds.' },
        { title: 'VOID CODE MODE', desc: 'No image needed. Encrypt to a text string that looks like noise.' },
        { title: 'DECOY MESSAGES', desc: 'Wrong password reveals a fake message. Plausible deniability.' }
      ],
      encode: {
        title: 'ENCODE', sub: 'hide a message',
        imageMode: '◎ IMAGE MODE', voidCode: '⬡ VOID CODE',
        selectImage: 'SELECT CARRIER IMAGE',
        dropText: 'drop PNG or BMP here',
        dropHint: 'JPEG compresses and destroys hidden data — use PNG only',
        textModeInfo: 'Your message will be encrypted and encoded as a VOID CODE string.<br>Send it as plain text — it looks like random noise to anyone else.',
        message: 'SECRET MESSAGE', messagePh: 'Type your secret message here...',
        password: 'PASSWORD', passwordPh: 'Strong password...',
        decoy: 'DECOY MESSAGE', decoyOptional: '(optional)', decoyPh: 'Shown on wrong password...',
        capacity: 'CAPACITY',
        btn: 'ENCRYPT & HIDE', btnWorking: 'ENCRYPTING...',
        outputImg: 'ENCODED IMAGE — DOWNLOAD & SEND',
        outputCode: 'VOID CODE — COPY & SEND',
        dlBtn: '↓ DOWNLOAD ENCODED IMAGE',
        copyBtn: 'COPY CODE', copied: 'COPIED ✓',
        sendHint: 'Send via Telegram or email attachment only.<br>WhatsApp compresses images and destroys the hidden data.',
        codeHint: 'Send as plain text anywhere.<br>Looks like random noise to anyone without the password.',
        errMsg: 'Write a message first.',
        errPass: 'Set a password.',
        errImg: 'Select a PNG image first.',
        errFailed: 'Encryption failed.'
      },
      decode: {
        title: 'DECODE', sub: 'reveal a message',
        imageMode: '◎ IMAGE MODE', voidCode: '⬡ VOID CODE',
        encodedImg: 'ENCODED IMAGE',
        dropText: 'drop the encoded image',
        dropHint: 'must be the exact file — do not compress or screenshot',
        voidCodeLabel: 'VOID CODE', voidCodePh: 'V01D://... paste the code here',
        password: 'PASSWORD', passwordPh: 'Enter the password...',
        btn: 'REVEAL MESSAGE', btnWorking: 'EXTRACTING...',
        outputHeader: 'REVEALED MESSAGE',
        selfDestruct: 'SELF-DESTRUCT IN',
        destroyed: '[ MESSAGE DESTROYED — VOID ]',
        errPass: 'Enter the password.',
        errImg: 'Load an encoded image first.',
        errCode: 'Paste a VOID CODE first.',
        errWrong: 'Wrong password or corrupted data.',
        errFailed: 'Decryption failed.'
      },
      about: {
        title: 'HOW VOID WORKS',
        blocks: [
          { num: '01', heading: 'AES-256-GCM ENCRYPTION', text: 'Your message is encrypted using AES-256-GCM, the same algorithm used by governments and militaries worldwide. The key is derived from your password using PBKDF2 with 100,000 iterations and a random salt. Without the exact password, decryption is computationally impossible.' },
          { num: '02', heading: 'LSB STEGANOGRAPHY', text: 'The encrypted data is hidden in the Least Significant Bits of the image\'s pixel values. Each pixel stores 1 bit. Changing the last bit of a color value (e.g., 200 → 201) is invisible to the human eye but encodes your data perfectly.' },
          { num: '03', heading: 'PLAUSIBLE DENIABILITY', text: 'Set a decoy message shown when someone enters a wrong password. If you\'re ever forced to reveal a password, give them the decoy one. They\'ll see an innocent message and have no way to prove another one exists.' },
          { num: '04', heading: 'ZERO SERVER ARCHITECTURE', text: 'VOID runs entirely in your browser using the Web Crypto API. No data is ever sent to any server. No logs. No analytics. No tracking. The code is open source — verify it yourself.' }
        ],
        warningTitle: '⚠ OPERATIONAL SECURITY',
        warningText: 'VOID is only as strong as your operational security.<br>— Send encoded images via Telegram or email attachment.<br>— Never use WhatsApp — it compresses images and destroys hidden data.<br>— Share your password through a completely separate channel.<br>— Use VOID CODE mode when you cannot send images.',
        ghLink: 'VIEW SOURCE ON GITHUB →'
      }
    },

    ar: {
      dir: 'rtl',
      flag: 'AR',
      tagline: 'لا أثر · لا دليل · لا شيء',
      nav: { home: 'الرئيسية', encode: 'تشفير', decode: 'فك تشفير', about: 'كيف يعمل' },
      hero: {
        sub: 'أخفِ أي شيء داخل أي شيء.<br>بلا سيرفر. بلا سجلات. بلا أثر.',
        cta: 'ادخل VOID →'
      },
      features: [
        { title: 'تشفير AES-256', desc: 'تشفير عسكري قبل الإخفاء. كلمة مرور خاطئة = لا شيء.' },
        { title: 'إخفاء في البيكسلات', desc: 'الرسالة مخفية في بيانات الصورة. تبدو متطابقة 100%.' },
        { title: 'بلا سيرفر', desc: 'كل شيء يعمل في متصفحك. لا شيء يُرسل لأي مكان.' },
        { title: 'تدمير ذاتي', desc: 'الرسائل المكشوفة تُمحى تلقائياً بعد 30 ثانية.' },
        { title: 'وضع VOID CODE', desc: 'لا تحتاج صورة. شفّر إلى نص يبدو عشوائياً.' },
        { title: 'رسائل وهمية', desc: 'كلمة مرور خاطئة تُظهر رسالة مزيفة. إنكار معقول.' }
      ],
      encode: {
        title: 'تشفير', sub: 'إخفاء رسالة',
        imageMode: '◎ وضع الصورة', voidCode: '⬡ VOID CODE',
        selectImage: 'اختر الصورة الحاملة',
        dropText: 'اسحب PNG أو BMP هنا',
        dropHint: 'JPEG يضغط الصورة ويدمر البيانات المخفية — استخدم PNG فقط',
        textModeInfo: 'ستُشفَّر رسالتك وتتحول لكود VOID CODE.<br>أرسله كنص عادي — يبدو عشوائياً لأي شخص آخر.',
        message: 'الرسالة السرية', messagePh: 'اكتب رسالتك السرية هنا...',
        password: 'كلمة المرور', passwordPh: 'كلمة مرور قوية...',
        decoy: 'رسالة وهمية', decoyOptional: '(اختياري)', decoyPh: 'تُعرض عند كلمة مرور خاطئة...',
        capacity: 'السعة',
        btn: 'تشفير وإخفاء', btnWorking: 'جاري التشفير...',
        outputImg: 'الصورة المشفرة — حمّل وأرسل',
        outputCode: 'VOID CODE — انسخ وأرسل',
        dlBtn: '↓ تحميل الصورة المشفرة',
        copyBtn: 'نسخ الكود', copied: 'تم النسخ ✓',
        sendHint: 'أرسل عبر تيليغرام أو بريد إلكتروني فقط.<br>واتساب يضغط الصور ويدمر البيانات المخفية.',
        codeHint: 'أرسله كنص عادي في أي مكان.<br>يبدو عشوائياً لأي شخص لا يملك كلمة المرور.',
        errMsg: 'اكتب رسالة أولاً.',
        errPass: 'ضع كلمة مرور.',
        errImg: 'اختر صورة PNG أولاً.',
        errFailed: 'فشل التشفير.'
      },
      decode: {
        title: 'فك التشفير', sub: 'كشف الرسالة',
        imageMode: '◎ وضع الصورة', voidCode: '⬡ VOID CODE',
        encodedImg: 'الصورة المشفرة',
        dropText: 'اسحب الصورة المشفرة هنا',
        dropHint: 'يجب أن يكون نفس الملف — لا تضغطه أو تصوّره',
        voidCodeLabel: 'VOID CODE', voidCodePh: 'V01D://... الصق الكود هنا',
        password: 'كلمة المرور', passwordPh: 'ادخل كلمة المرور...',
        btn: 'كشف الرسالة', btnWorking: 'جاري الاستخراج...',
        outputHeader: 'الرسالة المكشوفة',
        selfDestruct: 'تدمير ذاتي خلال',
        destroyed: '[ تم مسح الرسالة — VOID ]',
        errPass: 'ادخل كلمة المرور.',
        errImg: 'حمّل الصورة المشفرة أولاً.',
        errCode: 'الصق VOID CODE أولاً.',
        errWrong: 'كلمة مرور خاطئة أو بيانات تالفة.',
        errFailed: 'فشل فك التشفير.'
      },
      about: {
        title: 'كيف يعمل VOID',
        blocks: [
          { num: '01', heading: 'تشفير AES-256-GCM', text: 'رسالتك تُشفَّر باستخدام AES-256-GCM، نفس الخوارزمية التي تستخدمها الحكومات والجيوش حول العالم. المفتاح مشتق من كلمة مرورك باستخدام PBKDF2 مع 100,000 تكرار ورمل عشوائي. بدون كلمة المرور الصحيحة، فك التشفير مستحيل حسابياً.' },
          { num: '02', heading: 'إخفاء LSB في البيكسلات', text: 'البيانات المشفرة مخفية في آخر بت من قيم البيكسلات في الصورة. كل بيكسل يخزن بتاً واحداً. تغيير آخر بت في قيمة لون (مثل 200 إلى 201) لا يُرى بالعين البشرية لكنه يُشفّر بياناتك بشكل مثالي.' },
          { num: '03', heading: 'الإنكار المعقول', text: 'ضع رسالة وهمية تظهر عند إدخال كلمة مرور خاطئة. إذا أُجبرت على كشف كلمة المرور، أعطهم كلمة المرور الوهمية. سيرون رسالة بريئة ولا طريقة لإثبات وجود رسالة أخرى.' },
          { num: '04', heading: 'بنية بلا سيرفر', text: 'VOID يعمل بالكامل في متصفحك باستخدام Web Crypto API. لا بيانات تُرسل لأي سيرفر. لا سجلات. لا تحليلات. لا تتبع. الكود مفتوح المصدر — تحقق منه بنفسك.' }
        ],
        warningTitle: '⚠ الأمان التشغيلي',
        warningText: 'VOID لا يتجاوز قوته قوة أمانك التشغيلي.<br>— أرسل الصور المشفرة عبر تيليغرام أو بريد إلكتروني.<br>— لا تستخدم واتساب — يضغط الصور ويدمر البيانات.<br>— شارك كلمة المرور عبر قناة منفصلة تماماً.<br>— استخدم وضع VOID CODE عندما لا تستطيع إرسال صور.',
        ghLink: 'عرض الكود على GitHub →'
      }
    },

    fr: {
      dir: 'ltr',
      flag: 'FR',
      tagline: 'AUCUNE TRACE · AUCUNE PREUVE · RIEN',
      nav: { home: 'ACCUEIL', encode: 'CACHER', decode: 'RÉVÉLER', about: 'À PROPOS' },
      hero: {
        sub: 'cachez tout dans n\'importe quoi.<br>zéro serveur. zéro journal. zéro trace.',
        cta: 'ENTRER VOID →'
      },
      features: [
        { title: 'CHIFFREMENT AES-256', desc: 'Chiffrement militaire avant dissimulation. Mauvais mot de passe = rien.' },
        { title: 'STÉGANOGRAPHIE LSB', desc: 'Message caché dans les données de pixels. Image 100% identique.' },
        { title: 'ZÉRO SERVEUR', desc: 'Tout fonctionne dans votre navigateur. Rien n\'est envoyé nulle part.' },
        { title: 'AUTO-DESTRUCTION', desc: 'Les messages révélés s\'effacent automatiquement après 30 secondes.' },
        { title: 'MODE VOID CODE', desc: 'Pas d\'image nécessaire. Chiffrez en une chaîne de texte aléatoire.' },
        { title: 'MESSAGES LEURRES', desc: 'Mauvais mot de passe révèle un faux message. Déni plausible.' }
      ],
      encode: {
        title: 'CACHER', sub: 'dissimuler un message',
        imageMode: '◎ MODE IMAGE', voidCode: '⬡ VOID CODE',
        selectImage: 'SÉLECTIONNER IMAGE',
        dropText: 'déposez PNG ou BMP ici',
        dropHint: 'JPEG compresse et détruit les données cachées — PNG uniquement',
        textModeInfo: 'Votre message sera chiffré et encodé comme VOID CODE.<br>Envoyez-le en texte brut — ressemble à du bruit aléatoire.',
        message: 'MESSAGE SECRET', messagePh: 'Tapez votre message secret ici...',
        password: 'MOT DE PASSE', passwordPh: 'Mot de passe fort...',
        decoy: 'MESSAGE LEURRE', decoyOptional: '(optionnel)', decoyPh: 'Affiché avec mauvais mot de passe...',
        capacity: 'CAPACITÉ',
        btn: 'CHIFFRER & CACHER', btnWorking: 'CHIFFREMENT...',
        outputImg: 'IMAGE ENCODÉE — TÉLÉCHARGER & ENVOYER',
        outputCode: 'VOID CODE — COPIER & ENVOYER',
        dlBtn: '↓ TÉLÉCHARGER IMAGE ENCODÉE',
        copyBtn: 'COPIER CODE', copied: 'COPIÉ ✓',
        sendHint: 'Envoyez via Telegram ou pièce jointe email.<br>WhatsApp compresse les images et détruit les données cachées.',
        codeHint: 'Envoyez en texte brut n\'importe où.<br>Ressemble à du bruit aléatoire sans le mot de passe.',
        errMsg: 'Écrivez un message d\'abord.',
        errPass: 'Définissez un mot de passe.',
        errImg: 'Sélectionnez une image PNG d\'abord.',
        errFailed: 'Échec du chiffrement.'
      },
      decode: {
        title: 'RÉVÉLER', sub: 'révéler un message',
        imageMode: '◎ MODE IMAGE', voidCode: '⬡ VOID CODE',
        encodedImg: 'IMAGE ENCODÉE',
        dropText: 'déposez l\'image encodée',
        dropHint: 'doit être le fichier exact — ne pas compresser',
        voidCodeLabel: 'VOID CODE', voidCodePh: 'V01D://... collez le code ici',
        password: 'MOT DE PASSE', passwordPh: 'Entrez le mot de passe...',
        btn: 'RÉVÉLER MESSAGE', btnWorking: 'EXTRACTION...',
        outputHeader: 'MESSAGE RÉVÉLÉ',
        selfDestruct: 'AUTO-DESTRUCTION DANS',
        destroyed: '[ MESSAGE DÉTRUIT — VOID ]',
        errPass: 'Entrez le mot de passe.',
        errImg: 'Chargez une image encodée d\'abord.',
        errCode: 'Collez un VOID CODE d\'abord.',
        errWrong: 'Mauvais mot de passe ou données corrompues.',
        errFailed: 'Échec du déchiffrement.'
      },
      about: {
        title: 'COMMENT VOID FONCTIONNE',
        blocks: [
          { num: '01', heading: 'CHIFFREMENT AES-256-GCM', text: 'Votre message est chiffré avec AES-256-GCM, le même algorithme utilisé par les gouvernements et armées du monde entier. La clé est dérivée de votre mot de passe via PBKDF2 avec 100 000 itérations et un sel aléatoire.' },
          { num: '02', heading: 'STÉGANOGRAPHIE LSB', text: 'Les données chiffrées sont cachées dans les Bits de Poids Faible des valeurs de pixels. Chaque pixel stocke 1 bit. Changer le dernier bit (ex: 200 → 201) est invisible à l\'œil humain.' },
          { num: '03', heading: 'DÉNI PLAUSIBLE', text: 'Définissez un message leurre affiché avec un mauvais mot de passe. Si vous êtes forcé de révéler un mot de passe, donnez le mot de passe leurre. Ils verront un message innocent.' },
          { num: '04', heading: 'ARCHITECTURE ZÉRO SERVEUR', text: 'VOID fonctionne entièrement dans votre navigateur via Web Crypto API. Aucune donnée n\'est envoyée à un serveur. Pas de journaux. Pas d\'analyse. Code source ouvert.' }
        ],
        warningTitle: '⚠ SÉCURITÉ OPÉRATIONNELLE',
        warningText: 'VOID est seulement aussi fort que votre sécurité opérationnelle.<br>— Envoyez via Telegram ou pièce jointe email.<br>— Jamais WhatsApp — compresse les images.<br>— Partagez le mot de passe via un canal séparé.<br>— Utilisez VOID CODE si vous ne pouvez pas envoyer d\'images.',
        ghLink: 'VOIR SOURCE SUR GITHUB →'
      }
    },

    de: {
      dir: 'ltr',
      flag: 'DE',
      tagline: 'KEINE SPUR · KEIN BEWEIS · NICHTS',
      nav: { home: 'START', encode: 'VERSTECKEN', decode: 'ENTHÜLLEN', about: 'ÜBER' },
      hero: {
        sub: 'verstecke alles in allem.<br>kein server. keine logs. keine spur.',
        cta: 'VOID BETRETEN →'
      },
      features: [
        { title: 'AES-256 VERSCHLÜSSELUNG', desc: 'Militärverschlüsselung vor dem Verstecken. Falsches Passwort = nichts.' },
        { title: 'LSB STEGANOGRAPHIE', desc: 'Nachricht in Pixeldaten versteckt. Bild sieht 100% identisch aus.' },
        { title: 'KEIN SERVER', desc: 'Alles läuft in Ihrem Browser. Nichts wird gesendet.' },
        { title: 'SELBSTZERSTÖRUNG', desc: 'Enthüllte Nachrichten werden nach 30 Sekunden gelöscht.' },
        { title: 'VOID CODE MODUS', desc: 'Kein Bild benötigt. Als zufällig aussehenden Text verschlüsseln.' },
        { title: 'KÖDER-NACHRICHTEN', desc: 'Falsches Passwort zeigt eine gefälschte Nachricht.' }
      ],
      encode: {
        title: 'VERSTECKEN', sub: 'Nachricht verbergen',
        imageMode: '◎ BILDMODUS', voidCode: '⬡ VOID CODE',
        selectImage: 'TRÄGERBILD WÄHLEN',
        dropText: 'PNG oder BMP hier ablegen',
        dropHint: 'JPEG komprimiert und zerstört versteckte Daten — nur PNG verwenden',
        textModeInfo: 'Ihre Nachricht wird als VOID CODE verschlüsselt.<br>Als Klartext senden — sieht wie zufälliges Rauschen aus.',
        message: 'GEHEIME NACHRICHT', messagePh: 'Geheime Nachricht hier eingeben...',
        password: 'PASSWORT', passwordPh: 'Starkes Passwort...',
        decoy: 'KÖDER-NACHRICHT', decoyOptional: '(optional)', decoyPh: 'Bei falschem Passwort angezeigt...',
        capacity: 'KAPAZITÄT',
        btn: 'VERSCHLÜSSELN & VERSTECKEN', btnWorking: 'VERSCHLÜSSELN...',
        outputImg: 'KODIERTES BILD — HERUNTERLADEN & SENDEN',
        outputCode: 'VOID CODE — KOPIEREN & SENDEN',
        dlBtn: '↓ KODIERTES BILD HERUNTERLADEN',
        copyBtn: 'CODE KOPIEREN', copied: 'KOPIERT ✓',
        sendHint: 'Via Telegram oder E-Mail-Anhang senden.<br>WhatsApp komprimiert Bilder und zerstört versteckte Daten.',
        codeHint: 'Als Klartext überall senden.<br>Sieht ohne Passwort wie Rauschen aus.',
        errMsg: 'Zuerst Nachricht schreiben.',
        errPass: 'Passwort festlegen.',
        errImg: 'Zuerst PNG-Bild auswählen.',
        errFailed: 'Verschlüsselung fehlgeschlagen.'
      },
      decode: {
        title: 'ENTHÜLLEN', sub: 'Nachricht enthüllen',
        imageMode: '◎ BILDMODUS', voidCode: '⬡ VOID CODE',
        encodedImg: 'KODIERTES BILD',
        dropText: 'kodiertes Bild ablegen',
        dropHint: 'muss die genaue Datei sein — nicht komprimieren',
        voidCodeLabel: 'VOID CODE', voidCodePh: 'V01D://... Code hier einfügen',
        password: 'PASSWORT', passwordPh: 'Passwort eingeben...',
        btn: 'NACHRICHT ENTHÜLLEN', btnWorking: 'EXTRAHIEREN...',
        outputHeader: 'ENTHÜLLTE NACHRICHT',
        selfDestruct: 'SELBSTZERSTÖRUNG IN',
        destroyed: '[ NACHRICHT VERNICHTET — VOID ]',
        errPass: 'Passwort eingeben.',
        errImg: 'Zuerst kodiertes Bild laden.',
        errCode: 'Zuerst VOID CODE einfügen.',
        errWrong: 'Falsches Passwort oder beschädigte Daten.',
        errFailed: 'Entschlüsselung fehlgeschlagen.'
      },
      about: {
        title: 'WIE VOID FUNKTIONIERT',
        blocks: [
          { num: '01', heading: 'AES-256-GCM VERSCHLÜSSELUNG', text: 'Ihre Nachricht wird mit AES-256-GCM verschlüsselt, demselben Algorithmus, der von Regierungen und Militärs weltweit verwendet wird. Der Schlüssel wird über PBKDF2 mit 100.000 Iterationen abgeleitet.' },
          { num: '02', heading: 'LSB STEGANOGRAPHIE', text: 'Die verschlüsselten Daten werden in den niedrigstwertigen Bits der Pixelwerte versteckt. Jedes Pixel speichert 1 Bit. Die Änderung ist für das menschliche Auge unsichtbar.' },
          { num: '03', heading: 'PLAUSIBLE BESTREITBARKEIT', text: 'Legen Sie eine Köder-Nachricht fest, die bei falschem Passwort angezeigt wird. Wenn Sie gezwungen werden, ein Passwort preiszugeben, geben Sie das Köder-Passwort an.' },
          { num: '04', heading: 'ZERO-SERVER ARCHITEKTUR', text: 'VOID läuft vollständig in Ihrem Browser über die Web Crypto API. Keine Daten werden an einen Server gesendet. Keine Logs. Open Source.' }
        ],
        warningTitle: '⚠ OPERATIVE SICHERHEIT',
        warningText: 'VOID ist nur so stark wie Ihre operative Sicherheit.<br>— Bilder via Telegram oder E-Mail senden.<br>— Niemals WhatsApp — komprimiert Bilder.<br>— Passwort über separaten Kanal teilen.<br>— VOID CODE verwenden, wenn keine Bilder gesendet werden können.',
        ghLink: 'QUELLCODE AUF GITHUB ANSEHEN →'
      }
    },

    it: {
      dir: 'ltr',
      flag: 'IT',
      tagline: 'NESSUNA TRACCIA · NESSUNA PROVA · NIENTE',
      nav: { home: 'HOME', encode: 'NASCONDERE', decode: 'RIVELARE', about: 'INFO' },
      hero: {
        sub: 'nascondi qualsiasi cosa in qualsiasi cosa.<br>zero server. zero log. zero tracce.',
        cta: 'ENTRA IN VOID →'
      },
      features: [
        { title: 'CRITTOGRAFIA AES-256', desc: 'Crittografia militare prima di nascondere. Password errata = niente.' },
        { title: 'STEGANOGRAFIA LSB', desc: 'Messaggio nascosto nei dati dei pixel. Immagine 100% identica.' },
        { title: 'ZERO SERVER', desc: 'Tutto funziona nel tuo browser. Niente viene inviato da nessuna parte.' },
        { title: 'AUTODISTRUZIONE', desc: 'I messaggi rivelati si cancellano automaticamente dopo 30 secondi.' },
        { title: 'MODALITÀ VOID CODE', desc: 'Nessuna immagine necessaria. Cifra in una stringa di testo casuale.' },
        { title: 'MESSAGGI ESCA', desc: 'Password errata rivela un messaggio falso. Negabilità plausibile.' }
      ],
      encode: {
        title: 'NASCONDERE', sub: 'nascondere un messaggio',
        imageMode: '◎ MODALITÀ IMMAGINE', voidCode: '⬡ VOID CODE',
        selectImage: 'SELEZIONA IMMAGINE',
        dropText: 'trascina PNG o BMP qui',
        dropHint: 'JPEG comprime e distrugge i dati nascosti — usa solo PNG',
        textModeInfo: 'Il tuo messaggio sarà cifrato come VOID CODE.<br>Invialo come testo normale — sembra rumore casuale.',
        message: 'MESSAGGIO SEGRETO', messagePh: 'Scrivi il tuo messaggio segreto qui...',
        password: 'PASSWORD', passwordPh: 'Password forte...',
        decoy: 'MESSAGGIO ESCA', decoyOptional: '(opzionale)', decoyPh: 'Mostrato con password errata...',
        capacity: 'CAPACITÀ',
        btn: 'CIFRA E NASCONDI', btnWorking: 'CIFRATURA...',
        outputImg: 'IMMAGINE CODIFICATA — SCARICA E INVIA',
        outputCode: 'VOID CODE — COPIA E INVIA',
        dlBtn: '↓ SCARICA IMMAGINE CODIFICATA',
        copyBtn: 'COPIA CODICE', copied: 'COPIATO ✓',
        sendHint: 'Invia via Telegram o allegato email.<br>WhatsApp comprime le immagini e distrugge i dati nascosti.',
        codeHint: 'Invia come testo normale ovunque.<br>Sembra rumore casuale senza la password.',
        errMsg: 'Scrivi prima un messaggio.',
        errPass: 'Imposta una password.',
        errImg: 'Seleziona prima un\'immagine PNG.',
        errFailed: 'Cifratura fallita.'
      },
      decode: {
        title: 'RIVELARE', sub: 'rivelare un messaggio',
        imageMode: '◎ MODALITÀ IMMAGINE', voidCode: '⬡ VOID CODE',
        encodedImg: 'IMMAGINE CODIFICATA',
        dropText: 'trascina l\'immagine codificata',
        dropHint: 'deve essere il file esatto — non comprimere',
        voidCodeLabel: 'VOID CODE', voidCodePh: 'V01D://... incolla il codice qui',
        password: 'PASSWORD', passwordPh: 'Inserisci la password...',
        btn: 'RIVELA MESSAGGIO', btnWorking: 'ESTRAZIONE...',
        outputHeader: 'MESSAGGIO RIVELATO',
        selfDestruct: 'AUTODISTRUZIONE TRA',
        destroyed: '[ MESSAGGIO DISTRUTTO — VOID ]',
        errPass: 'Inserisci la password.',
        errImg: 'Carica prima un\'immagine codificata.',
        errCode: 'Incolla prima un VOID CODE.',
        errWrong: 'Password errata o dati corrotti.',
        errFailed: 'Decifratura fallita.'
      },
      about: {
        title: 'COME FUNZIONA VOID',
        blocks: [
          { num: '01', heading: 'CRITTOGRAFIA AES-256-GCM', text: 'Il tuo messaggio è cifrato con AES-256-GCM, lo stesso algoritmo usato da governi ed eserciti in tutto il mondo. La chiave è derivata dalla tua password tramite PBKDF2 con 100.000 iterazioni.' },
          { num: '02', heading: 'STEGANOGRAFIA LSB', text: 'I dati cifrati sono nascosti nei Bit Meno Significativi dei valori dei pixel. Ogni pixel memorizza 1 bit. Cambiare l\'ultimo bit è invisibile all\'occhio umano.' },
          { num: '03', heading: 'NEGABILITÀ PLAUSIBILE', text: 'Imposta un messaggio esca mostrato con una password errata. Se sei costretto a rivelare una password, dai quella esca. Vedranno un messaggio innocente.' },
          { num: '04', heading: 'ARCHITETTURA ZERO SERVER', text: 'VOID funziona interamente nel browser tramite Web Crypto API. Nessun dato viene inviato a server. Nessun log. Nessun tracciamento. Codice open source.' }
        ],
        warningTitle: '⚠ SICUREZZA OPERATIVA',
        warningText: 'VOID è forte quanto la tua sicurezza operativa.<br>— Invia immagini via Telegram o allegato email.<br>— Mai WhatsApp — comprime le immagini.<br>— Condividi la password tramite canale separato.<br>— Usa VOID CODE quando non puoi inviare immagini.',
        ghLink: 'VEDI SORGENTE SU GITHUB →'
      }
    }

  };

  let current = 'en';

  function get(path) {
    const t = langs[current];
    return path.split('.').reduce((obj, k) => obj?.[k], t) ?? path;
  }

  function setLang(lang) {
    if (!langs[lang]) return;
    current = lang;
    document.documentElement.dir = langs[lang].dir;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const val = get(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.innerHTML = val;
      }
    });
    document.querySelectorAll('.void-lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  function getLangs() { return Object.keys(langs); }
  function getLangFlag(lang) { return langs[lang]?.flag || lang.toUpperCase(); }
  function getCurrent() { return current; }

  return { get, setLang, getLangs, getLangFlag, getCurrent, langs };

})();
