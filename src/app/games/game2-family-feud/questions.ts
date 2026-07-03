import type { Question } from './types'

export const FAMILY_FEUD_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'سمّ شيئاً تجده في المطبخ',
    answers: [
      { text: 'ثلاجة',       points: 40, revealed: false, aliases: ['براد', 'فريجدير'] },
      { text: 'موقد',        points: 28, revealed: false, aliases: ['طباخ', 'بوتاجاز'] },
      { text: 'ميكروويف',    points: 14, revealed: false, aliases: ['مايكرويف'] },
      { text: 'غسالة صحون',  points: 9,  revealed: false, aliases: ['ماسحة صحون'] },
      { text: 'خلاط',        points: 5,  revealed: false, aliases: ['بلندر'] },
      { text: 'طنجرة',       points: 4,  revealed: false, aliases: ['قدر', 'حلة'] },
    ],
  },
  {
    id: 'q2',
    text: 'سمّ رياضة شعبية في السعودية',
    answers: [
      { text: 'كرة القدم',  points: 50, revealed: false, aliases: ['فوتبول', 'قدم'] },
      { text: 'كرة السلة',  points: 20, revealed: false, aliases: ['بسكتبول'] },
      { text: 'سباحة',      points: 12, revealed: false, aliases: ['عوم'] },
      { text: 'تنس',        points: 10, revealed: false, aliases: ['تنيس'] },
      { text: 'جري',        points: 8,  revealed: false, aliases: ['عدو', 'ركض'] },
    ],
  },
  {
    id: 'q3',
    text: 'سمّ شيئاً تأخذه معك في السفر',
    answers: [
      { text: 'حقيبة',     points: 38, revealed: false, aliases: ['شنطة', 'بقجة'] },
      { text: 'جواز سفر',  points: 24, revealed: false, aliases: ['باسبور', 'جواز'] },
      { text: 'هاتف',      points: 18, revealed: false, aliases: ['موبايل', 'جوال'] },
      { text: 'ملابس',     points: 10, revealed: false, aliases: ['ثياب', 'هدوم'] },
      { text: 'نقود',      points: 6,  revealed: false, aliases: ['فلوس', 'مال'] },
      { text: 'شاحن',      points: 4,  revealed: false, aliases: ['شاحن هاتف', 'باور بنك'] },
    ],
  },
  {
    id: 'q4',
    text: 'سمّ فاكهة مشهورة في الخليج',
    answers: [
      { text: 'تمر',    points: 45, revealed: false, aliases: ['بلح', 'رطب'] },
      { text: 'مانجو',  points: 22, revealed: false, aliases: ['مانجه'] },
      { text: 'بطيخ',  points: 15, revealed: false, aliases: ['حبحب', 'دلاع'] },
      { text: 'موز',   points: 10, revealed: false, aliases: ['بنانا'] },
      { text: 'رمان',  points: 8,  revealed: false, aliases: ['رومان'] },
    ],
  },
  {
    id: 'q5',
    text: 'سمّ شيئاً تشربه في الصباح',
    answers: [
      { text: 'قهوة',  points: 42, revealed: false, aliases: ['كوفي', 'نسكافيه', 'قهوه'] },
      { text: 'شاي',   points: 30, revealed: false, aliases: ['تي', 'أتاي'] },
      { text: 'عصير',  points: 15, revealed: false, aliases: ['جوس', 'عصرة'] },
      { text: 'ماء',   points: 8,  revealed: false, aliases: ['مي', 'ماي'] },
      { text: 'حليب',  points: 5,  revealed: false, aliases: ['لبن'] },
    ],
  },
  {
    id: 'q6',
    text: 'سمّ شيئاً يستخدمه الناس يومياً',
    answers: [
      { text: 'هاتف',       points: 45, revealed: false, aliases: ['جوال', 'موبايل'] },
      { text: 'سيارة',      points: 25, revealed: false, aliases: ['عربية', 'سياره'] },
      { text: 'حاسوب',      points: 14, revealed: false, aliases: ['كمبيوتر', 'لابتوب'] },
      { text: 'مفتاح',      points: 8,  revealed: false, aliases: ['مفاتيح'] },
      { text: 'محفظة',      points: 5,  revealed: false, aliases: ['بطاقة', 'كارت'] },
      { text: 'نظارة',      points: 3,  revealed: false, aliases: ['عدسات'] },
    ],
  },
  {
    id: 'q7',
    text: 'سمّ نشاطاً يفعله الناس في الإجازة',
    answers: [
      { text: 'سفر',    points: 38, revealed: false, aliases: ['سياحة', 'رحلة'] },
      { text: 'نوم',    points: 28, revealed: false, aliases: ['راحة'] },
      { text: 'تسوق',   points: 16, revealed: false, aliases: ['شوبينج', 'تبضع'] },
      { text: 'رياضة',  points: 11, revealed: false, aliases: ['تمرين'] },
      { text: 'قراءة',  points: 7,  revealed: false, aliases: ['مطالعة'] },
    ],
  },
  {
    id: 'q8',
    text: 'سمّ حيواناً يربيه الناس في المنازل',
    answers: [
      { text: 'قطة',   points: 40, revealed: false, aliases: ['بسة', 'قط', 'هر'] },
      { text: 'كلب',   points: 25, revealed: false, aliases: ['كليب'] },
      { text: 'طير',   points: 18, revealed: false, aliases: ['عصفور', 'ببغاء', 'حمامة'] },
      { text: 'سمكة',  points: 10, revealed: false, aliases: ['سمك'] },
      { text: 'أرنب',  points: 7,  revealed: false, aliases: ['ارنب'] },
    ],
  },
  {
    id: 'q9',
    text: 'سمّ شيئاً على طاولة الإفطار السعودي',
    answers: [
      { text: 'خبز',  points: 35, revealed: false, aliases: ['عيش', 'رغيف', 'خبز شعير'] },
      { text: 'بيض',  points: 28, revealed: false, aliases: ['بيضة'] },
      { text: 'تمر',  points: 18, revealed: false, aliases: ['رطب'] },
      { text: 'جبن',  points: 12, revealed: false, aliases: ['قشطة', 'جبنة'] },
      { text: 'عسل',  points: 7,  revealed: false, aliases: ['شهد'] },
    ],
  },
  {
    id: 'q10',
    text: 'سمّ وجهة سفر يفضلها السعوديون',
    answers: [
      { text: 'دبي',       points: 35, revealed: false, aliases: ['الإمارات', 'ابوظبي'] },
      { text: 'تركيا',     points: 25, revealed: false, aliases: ['اسطنبول', 'تركيه'] },
      { text: 'مصر',       points: 18, revealed: false, aliases: ['القاهرة'] },
      { text: 'المالديف',  points: 12, revealed: false, aliases: ['مالديف'] },
      { text: 'باريس',     points: 7,  revealed: false, aliases: ['فرنسا'] },
      { text: 'لندن',      points: 3,  revealed: false, aliases: ['بريطانيا', 'انجلترا'] },
    ],
  },
  {
    id: 'q11',
    text: 'سمّ مكاناً يذهب إليه الناس في عطلة نهاية الأسبوع',
    answers: [
      { text: 'مطعم',   points: 38, revealed: false, aliases: ['مطاعم'] },
      { text: 'مول',    points: 28, revealed: false, aliases: ['مركز تجاري', 'سوق'] },
      { text: 'شاطئ',   points: 18, revealed: false, aliases: ['بحر', 'كورنيش'] },
      { text: 'حديقة',  points: 10, revealed: false, aliases: ['منتزه', 'بارك'] },
      { text: 'سينما',  points: 6,  revealed: false, aliases: ['سيما'] },
    ],
  },
  {
    id: 'q12',
    text: 'سمّ وجبة سعودية شهيرة',
    answers: [
      { text: 'كبسة',  points: 42, revealed: false, aliases: ['رز كبسة', 'كبسه'] },
      { text: 'مندي',  points: 24, revealed: false, aliases: ['مندي لحم'] },
      { text: 'مطبق',  points: 14, revealed: false, aliases: ['مطبق لحم'] },
      { text: 'جريش',  points: 10, revealed: false, aliases: ['هريس'] },
      { text: 'مرق',   points: 7,  revealed: false, aliases: ['شوربة', 'مرقه'] },
      { text: 'حنيذ',  points: 3,  revealed: false, aliases: ['لحم حنيذ'] },
    ],
  },
  {
    id: 'q13',
    text: 'سمّ شيئاً يُشتری في رمضان',
    answers: [
      { text: 'تمر',    points: 40, revealed: false, aliases: ['رطب', 'بلح'] },
      { text: 'فوانيس', points: 22, revealed: false, aliases: ['فانوس', 'هلال'] },
      { text: 'ملابس',  points: 18, revealed: false, aliases: ['ثياب', 'هدوم'] },
      { text: 'عطر',    points: 12, revealed: false, aliases: ['بخور', 'عود'] },
      { text: 'حلويات', points: 8,  revealed: false, aliases: ['قطايف', 'بقلاوة'] },
    ],
  },
  {
    id: 'q14',
    text: 'سمّ صفةً يحبها الناس في صديقهم',
    answers: [
      { text: 'وفاء',     points: 36, revealed: false, aliases: ['وفي', 'أمين'] },
      { text: 'صدق',      points: 28, revealed: false, aliases: ['صادق', 'شفاف'] },
      { text: 'مرح',      points: 18, revealed: false, aliases: ['فكاهي', 'مضحك'] },
      { text: 'كرم',      points: 11, revealed: false, aliases: ['كريم', 'سخي'] },
      { text: 'ذكاء',     points: 7,  revealed: false, aliases: ['ذكي'] },
    ],
  },
  {
    id: 'q15',
    text: 'سمّ شيئاً تفعله قبل النوم',
    answers: [
      { text: 'صلاة',       points: 38, revealed: false, aliases: ['صلاه', 'قيام'] },
      { text: 'قراءة',      points: 24, revealed: false, aliases: ['مطالعة', 'قران'] },
      { text: 'جوال',       points: 20, revealed: false, aliases: ['تصفح', 'موبايل'] },
      { text: 'استحمام',    points: 12, revealed: false, aliases: ['حمام', 'دش'] },
      { text: 'فرشاة أسنان', points: 6, revealed: false, aliases: ['تفريش', 'نظافة أسنان'] },
    ],
  },
]

export const MAX_QUESTIONS = FAMILY_FEUD_QUESTIONS.length
