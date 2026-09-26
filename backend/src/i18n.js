const messages = {
  en: {
    register: 'Register your mobile number with FarmIQ before using SMS bookings.',
    noBookings: 'You have no bookings yet.',
    bookHelp:
      'To request: BOOK machine-id YYYY-MM-DD hours latitude longitude farm-address AGREE. Starts 08:00 India time. AGREE accepts the rental terms: owner approval, 50% advance, inspection, and 10% late cancellation fee. No payment is taken by SMS.',
    badBooking: 'Check the date, hours, coordinates and address in your request.',
    support:
      'Support request recorded. Your operator can review it in FarmIQ. This is not an emergency service.',
    smsHelp:
      'FarmIQ SMS: STATUS for your latest booking; HELP followed by a question for support; BOOK for booking instructions. Payments require the secure app.',
    voiceRegister: 'Please register this mobile number with Farm I Q first.',
    voiceNoBookings: 'You have no bookings.',
    callback: 'Your assisted booking callback request is recorded. An administrator will review it.',
    menu: 'Welcome to Farm I Q. Press 1 for your latest booking status. Press 2 to request assisted booking support.',
    bookingStatus: 'Your booking status is {status}.',
    starts: 'Starts {date}. Booking {id}.',
    requested:
      'Request {id} sent to owner. Total INR {total}; advance INR {advance} after approval. Sign in to pay securely.',
  },
  ta: {
    register: 'SMS முன்பதிவைப் பயன்படுத்த முதலில் உங்கள் கைபேசி எண்ணை FarmIQ-ல் பதிவு செய்யவும்.',
    noBookings: 'உங்களிடம் இன்னும் முன்பதிவுகள் இல்லை.',
    bookHelp:
      'கோரிக்கைக்கு: BOOK இயந்திர-ID YYYY-MM-DD மணிநேரம் அட்சரேகை தீர்க்கரேகை பண்ணை-முகவரி AGREE. இந்திய நேரப்படி காலை 08:00 மணிக்குத் தொடங்கும். AGREE என்பது உரிமையாளர் ஒப்புதல், 50% முன்பணம், ஆய்வு மற்றும் தாமத ரத்துக்கு 10% கட்டணம் ஆகிய வாடகை விதிகளை ஏற்கிறது. SMS மூலம் கட்டணம் வசூலிக்கப்படாது.',
    badBooking: 'உங்கள் கோரிக்கையில் தேதி, மணிநேரம், இருப்பிட எண்கள் மற்றும் முகவரியைச் சரிபார்க்கவும்.',
    support:
      'ஆதரவு கோரிக்கை பதிவு செய்யப்பட்டது. உங்கள் இயக்குநர் அதை FarmIQ-ல் ஆய்வு செய்யலாம். இது அவசர சேவை அல்ல.',
    smsHelp:
      'FarmIQ SMS: சமீபத்திய முன்பதிவுக்கு STATUS; உதவிக்கு HELP மற்றும் கேள்வி; முன்பதிவு வழிமுறைக்கு BOOK. கட்டணத்திற்கு பாதுகாப்பான செயலி தேவை.',
    voiceRegister: 'முதலில் இந்த கைபேசி எண்ணை Farm I Q-ல் பதிவு செய்யவும்.',
    voiceNoBookings: 'உங்களிடம் முன்பதிவுகள் இல்லை.',
    callback: 'உதவி முன்பதிவு திரும்ப அழைக்கும் கோரிக்கை பதிவு செய்யப்பட்டது. நிர்வாகி ஆய்வு செய்வார்.',
    menu: 'Farm I Q-க்கு வரவேற்கிறோம். சமீபத்திய முன்பதிவு நிலைக்கு ஒன்றை அழுத்தவும். உதவி முன்பதிவுக்கு இரண்டை அழுத்தவும்.',
    bookingStatus: 'உங்கள் முன்பதிவு நிலை {status}.',
    starts: 'தொடக்கம் {date}. முன்பதிவு {id}.',
    requested:
      'கோரிக்கை {id} உரிமையாளருக்கு அனுப்பப்பட்டது. மொத்தம் {total} ரூபாய்; ஒப்புதலுக்குப் பின் முன்பணம் {advance} ரூபாய். பாதுகாப்பாகச் செலுத்த உள்நுழையவும்.',
  },
  hi: {
    register: 'SMS बुकिंग उपयोग करने से पहले अपना मोबाइल नंबर FarmIQ में पंजीकृत करें।',
    noBookings: 'आपकी अभी कोई बुकिंग नहीं है।',
    bookHelp:
      'अनुरोध के लिए: BOOK मशीन-ID YYYY-MM-DD घंटे अक्षांश देशांतर खेत-पता AGREE। शुरुआत भारतीय समय सुबह 08:00 बजे होगी। AGREE मालिक की स्वीकृति, 50% अग्रिम, निरीक्षण और देर से रद्द करने पर 10% शुल्क वाली किराया शर्तें स्वीकार करता है। SMS से भुगतान नहीं लिया जाता।',
    badBooking: 'अपने अनुरोध में तारीख, घंटे, निर्देशांक और पता जाँचें।',
    support:
      'सहायता अनुरोध दर्ज किया गया। आपका ऑपरेटर इसे FarmIQ में देख सकता है। यह आपातकालीन सेवा नहीं है।',
    smsHelp:
      'FarmIQ SMS: नवीनतम बुकिंग के लिए STATUS; सहायता हेतु HELP और प्रश्न; बुकिंग निर्देश हेतु BOOK। भुगतान के लिए सुरक्षित ऐप आवश्यक है।',
    voiceRegister: 'पहले इस मोबाइल नंबर को Farm I Q में पंजीकृत करें।',
    voiceNoBookings: 'आपकी कोई बुकिंग नहीं है।',
    callback: 'सहायता बुकिंग कॉलबैक अनुरोध दर्ज हुआ। व्यवस्थापक इसकी समीक्षा करेगा।',
    menu: 'Farm I Q में आपका स्वागत है। नवीनतम बुकिंग स्थिति के लिए एक दबाएँ। सहायता बुकिंग के लिए दो दबाएँ।',
    bookingStatus: 'आपकी बुकिंग स्थिति {status} है।',
    starts: 'शुरुआत {date}। बुकिंग {id}।',
    requested:
      'अनुरोध {id} मालिक को भेजा गया। कुल {total} रुपये; स्वीकृति के बाद अग्रिम {advance} रुपये। सुरक्षित भुगतान के लिए साइन इन करें।',
  },
};
const statuses = {
  ta: {
    REQUESTED: 'கோரப்பட்டது',
    PENDING_PAYMENT: 'கட்டணம் நிலுவை',
    PAID: 'பணம் செலுத்தப்பட்டது',
    ASSIGNED: 'ஒதுக்கப்பட்டது',
    PICKUP_INSPECTION: 'எடுப்பு ஆய்வு',
    IN_TRANSIT: 'போக்குவரத்தில்',
    DELIVERED: 'வழங்கப்பட்டது',
    IN_PROGRESS: 'வாடகை செயலில்',
    RETURN_INSPECTION: 'திரும்பப்பெறும் ஆய்வு',
    RETURN_IN_TRANSIT: 'உரிமையாளரிடம் திரும்பும் வழியில்',
    RETURNED: 'உரிமையாளரிடம் திரும்பியது',
    COMPLETED: 'முடிந்தது',
    CANCELLED: 'ரத்து செய்யப்பட்டது',
    REJECTED: 'நிராகரிக்கப்பட்டது',
  },
  hi: {
    REQUESTED: 'अनुरोधित',
    PENDING_PAYMENT: 'भुगतान लंबित',
    PAID: 'भुगतान हुआ',
    ASSIGNED: 'आवंटित',
    PICKUP_INSPECTION: 'पिकअप निरीक्षण',
    IN_TRANSIT: 'रास्ते में',
    DELIVERED: 'पहुँचा दिया',
    IN_PROGRESS: 'किराया जारी',
    RETURN_INSPECTION: 'वापसी निरीक्षण',
    RETURN_IN_TRANSIT: 'मालिक के पास वापस ले जाया जा रहा है',
    RETURNED: 'मालिक को वापस किया',
    COMPLETED: 'पूर्ण',
    CANCELLED: 'रद्द',
    REJECTED: 'अस्वीकृत',
  },
};
function language(value) {
  return ['ta', 'hi'].includes(value) ? value : 'en';
}
function text(key, lang, values = {}) {
  const selected = language(lang);
  let result = messages[selected][key] || messages.en[key] || key;
  for (const [name, value] of Object.entries(values)) result = result.replaceAll(`{${name}}`, value);
  return result;
}
function status(value, lang) {
  const selected = language(lang);
  return statuses[selected]?.[value] || value.replaceAll('_', ' ').toLowerCase();
}
function voiceLanguage(lang) {
  return { ta: 'ta-IN', hi: 'hi-IN', en: 'en-IN' }[language(lang)];
}
module.exports = { text, status, voiceLanguage };
