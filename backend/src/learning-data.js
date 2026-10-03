// First-party app guides are distinct from machine-operation training.
const sourceUrl = 'https://github.com/john210706/FARMIQ#working-rental-flow';
const guides = [
  [
    'booking',
    {
      en: [
        'Book equipment in FarmIQ',
        'Follow a rental request from choosing a machine to paying the advance.',
        [
          'Sign in as a farmer and open Find machinery. Allow location access to see nearby equipment.',
          'Choose a machine, a future start time and rental hours. Use current location and check the filled farm address.',
          'Choose a verified operator if needed, calculate the quote, read the agreement and send the request.',
          'Wait for the owner to accept. Open My bookings and pay the advance within the displayed payment hold.',
          'Open the booking to see the assigned driver. Dispatch requires an available driver with a recent location.',
        ],
      ],
      ta: [
        'FarmIQ-ல் இயந்திரத்தை முன்பதிவு செய்வது',
        'இயந்திரத் தேர்வு முதல் முன்பணம் வரை செயலி வழிகாட்டி.',
        [
          'விவசாயியாக உள்நுழைந்து இயந்திரங்களைத் தேடுங்கள். அருகிலுள்ள இயந்திரங்களுக்கு இருப்பிட அனுமதி வழங்கவும்.',
          'இயந்திரம், எதிர்காலத் தொடக்க நேரம் மற்றும் வாடகை மணிநேரத்தைத் தேர்ந்தெடுக்கவும். தற்போதைய இருப்பிடத்தைப் பெற்று பண்ணை முகவரியைச் சரிபார்க்கவும்.',
          'தேவைப்பட்டால் சரிபார்க்கப்பட்ட இயக்குநரைத் தேர்ந்தெடுக்கவும். கட்டணத்தைக் கணக்கிட்டு ஒப்பந்தத்தைப் படித்து கோரிக்கையை அனுப்பவும்.',
          'உரிமையாளர் ஒப்புதலுக்காகக் காத்திருக்கவும். என் முன்பதிவுகளில் காட்டப்படும் காலக்கெடுவுக்குள் முன்பணம் செலுத்தவும்.',
          'ஒதுக்கப்பட்ட ஓட்டுநரைப் பார்க்க முன்பதிவைத் திறக்கவும். சமீபத்திய இருப்பிடத்துடன் கிடைக்கும் ஓட்டுநர் தேவை.',
        ],
      ],
      hi: [
        'FarmIQ में मशीन बुक करें',
        'मशीन चुनने से अग्रिम भुगतान तक ऐप का उपयोग सीखें।',
        [
          'किसान के रूप में साइन इन करें और मशीन खोजें खोलें। पास की मशीनों के लिए स्थान की अनुमति दें।',
          'मशीन, भविष्य का समय और किराए के घंटे चुनें। वर्तमान स्थान लें और भरा हुआ खेत का पता जाँचें।',
          'ज़रूरत हो तो सत्यापित ऑपरेटर चुनें। कीमत निकालें, समझौता पढ़ें और अनुरोध भेजें।',
          'मालिक की स्वीकृति का इंतज़ार करें। मेरी बुकिंग में दिखाई गई समय सीमा के भीतर अग्रिम भुगतान करें।',
          'नियुक्त चालक देखने के लिए बुकिंग खोलें। आवंटन के लिए हाल का स्थान साझा करने वाला उपलब्ध चालक चाहिए।',
        ],
      ],
    },
  ],
  [
    'handover',
    {
      en: [
        'Delivery and farmer handover',
        'Use the delivery timeline, inspection evidence and farmer handover code.',
        [
          'The assigned driver opens My deliveries, records pickup photographs and completes the pickup checklist.',
          'The driver starts the delivery and keeps the delivery page open while sharing GPS.',
          'When the driver arrives, the farmer generates the handover code from the booking and shares it with that driver.',
          'The driver enters the code near the farm to confirm delivery. The farmer records the delivery inspection.',
          'The farmer pays the remaining balance and starts the rental. Report damage or problems through a support ticket.',
        ],
      ],
      ta: [
        'விநியோகம் மற்றும் விவசாயி ஒப்படைப்பு',
        'விநியோக நிலைகள், ஆய்வுப் படங்கள் மற்றும் ஒப்படைப்புக் குறியீட்டைப் பயன்படுத்தவும்.',
        [
          'ஒதுக்கப்பட்ட ஓட்டுநர் என் விநியோகங்களைத் திறந்து எடுப்புப் படங்கள் மற்றும் ஆய்வுப் பட்டியலைப் பதிவு செய்கிறார்.',
          'ஓட்டுநர் விநியோகத்தைத் தொடங்கி GPS பகிரும்போது விநியோகப் பக்கத்தைத் திறந்து வைத்திருக்கிறார்.',
          'ஓட்டுநர் வந்ததும் விவசாயி முன்பதிவில் ஒப்படைப்புக் குறியீட்டை உருவாக்கி அந்த ஓட்டுநரிடம் பகிர்கிறார்.',
          'ஓட்டுநர் பண்ணைக்கு அருகில் குறியீட்டை உள்ளிட்டு விநியோகத்தை உறுதிசெய்கிறார். விவசாயி விநியோக ஆய்வைப் பதிவு செய்கிறார்.',
          'விவசாயி மீதித் தொகையைச் செலுத்தி வாடகையைத் தொடங்குகிறார். சேதம் அல்லது சிக்கலுக்கு ஆதரவு கோரிக்கையை அனுப்பவும்.',
        ],
      ],
      hi: [
        'डिलीवरी और किसान को सुपुर्दगी',
        'डिलीवरी के चरण, निरीक्षण तस्वीरें और किसान का सुपुर्दगी कोड उपयोग करें।',
        [
          'नियुक्त चालक मेरी डिलीवरी खोलकर पिकअप की तस्वीरें और जाँच सूची दर्ज करता है।',
          'चालक डिलीवरी शुरू करता है और GPS साझा करते समय डिलीवरी पेज खुला रखता है।',
          'चालक आने पर किसान बुकिंग में सुपुर्दगी कोड बनाकर उसी चालक को देता है।',
          'चालक खेत के पास कोड डालकर डिलीवरी की पुष्टि करता है। किसान डिलीवरी निरीक्षण दर्ज करता है।',
          'किसान बचा हुआ भुगतान करके किराया शुरू करता है। नुकसान या समस्या के लिए सहायता टिकट बनाएँ।',
        ],
      ],
    },
  ],
  [
    'return',
    {
      en: [
        'Return equipment to its owner',
        'Complete the return journey and owner confirmation in FarmIQ.',
        [
          'After using the equipment, the farmer opens the booking and requests the return inspection.',
          'The assigned driver records return photographs and the return checklist at the farm.',
          'The driver starts the return journey and shares GPS while the delivery page is open.',
          'At the owner pickup point, the owner generates a return handover code. The driver enters it to confirm the return.',
          'The owner completes the rental after checking the equipment. The farmer can then leave a review.',
        ],
      ],
      ta: [
        'இயந்திரத்தை உரிமையாளரிடம் திருப்புதல்',
        'FarmIQ-ல் திரும்பும் பயணம் மற்றும் உரிமையாளர் உறுதிப்படுத்தலை முடிக்கவும்.',
        [
          'பயன்பாட்டிற்குப் பிறகு விவசாயி முன்பதிவைத் திறந்து திரும்பப்பெறும் ஆய்வைக் கோருகிறார்.',
          'ஒதுக்கப்பட்ட ஓட்டுநர் பண்ணையில் திரும்பப்பெறும் படங்கள் மற்றும் ஆய்வுப் பட்டியலைப் பதிவு செய்கிறார்.',
          'ஓட்டுநர் திரும்பும் பயணத்தைத் தொடங்கி விநியோகப் பக்கம் திறந்திருக்கும் போது GPS பகிர்கிறார்.',
          'உரிமையாளரின் எடுப்பு இடத்தில் உரிமையாளர் திரும்ப ஒப்படைப்புக் குறியீட்டை உருவாக்குகிறார். ஓட்டுநர் அதை உள்ளிட்டு உறுதிசெய்கிறார்.',
          'இயந்திரத்தைச் சரிபார்த்த பின் உரிமையாளர் வாடகையை முடிக்கிறார். பின்னர் விவசாயி மதிப்புரை அளிக்கலாம்.',
        ],
      ],
      hi: [
        'मशीन मालिक को वापस करें',
        'FarmIQ में वापसी यात्रा और मालिक की पुष्टि पूरी करें।',
        [
          'उपयोग के बाद किसान बुकिंग खोलकर वापसी निरीक्षण का अनुरोध करता है।',
          'नियुक्त चालक खेत पर वापसी की तस्वीरें और जाँच सूची दर्ज करता है।',
          'चालक वापसी यात्रा शुरू करता है और डिलीवरी पेज खुला रखकर GPS साझा करता है।',
          'मालिक के पिकअप स्थान पर मालिक वापसी सुपुर्दगी कोड बनाता है। चालक इसे डालकर वापसी की पुष्टि करता है।',
          'मशीन जाँचने के बाद मालिक किराया पूरा करता है। फिर किसान समीक्षा दे सकता है।',
        ],
      ],
    },
  ],
];
const starterTutorials = guides.flatMap(([key, translations]) =>
  Object.entries(translations).map(([language, [title, summary, steps]]) => ({
    id: `farmiq-guide-${key}-${language}`,
    title,
    summary,
    steps,
    language,
    category: 'FARMIQ',
    sourceUrl,
    published: true,
  })),
);
for (const [id, title, videoId] of [
  ['basics', 'Tractor safety: an introduction', 'UMG5Wmskswc'],
  ['rollovers', 'Understanding tractor rollover hazards', 'SpFEtBh9Hdk'],
  ['pto', 'Awareness of tractor PTO hazards', 'KcekpBUTcuU'],
])
  starterTutorials.push({
    id: `resource-umaine-${id}-en`,
    title,
    language: 'en',
    category: 'TRACTOR',
    published: false,
    summary:
      'English video from University of Maine Cooperative Extension. Preview the video and verify captions before publishing. Local equipment and practices may differ.',
    steps: [
      'Watch the original publisher’s video.',
      'Ask the owner for the manual matching the rented model.',
      'Discuss any unfamiliar controls with a qualified operator before use.',
    ],
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    sourceUrl: 'https://extension.umaine.edu/agriculture/farm-safety/tractor-safety-video-training-series/',
  });
module.exports = { starterTutorials };
