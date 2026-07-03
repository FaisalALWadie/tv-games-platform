// Hardcoded question bank for حروف. Each key is an Arabic letter;
// every question's answer starts with that letter (ignoring the definite article ال).

import type { Question } from '../types'

export const QUESTION_BANK: Record<string, Question[]> = {
  'أ': [
    { id: 'أ1', letter: 'أ', text: 'ثاني أكبر قارة في العالم من حيث المساحة؟', answer: 'أفريقيا' },
    { id: 'أ2', letter: 'أ', text: 'ما عاصمة الإمارات العربية المتحدة؟', answer: 'أبو ظبي' },
  ],
  'ب': [
    { id: 'ب1', letter: 'ب', text: 'ما عاصمة فرنسا؟', answer: 'باريس' },
    { id: 'ب2', letter: 'ب', text: 'ما عاصمة العراق؟', answer: 'بغداد' },
  ],
  'ت': [
    { id: 'ت1', letter: 'ت', text: 'ما عاصمة دولة تونس؟', answer: 'تونس' },
    { id: 'ت2', letter: 'ت', text: 'في أي دولة تقع مدينة إسطنبول؟', answer: 'تركيا' },
  ],
  'ث': [
    { id: 'ث1', letter: 'ث', text: 'كم عدد أضلاع المثلث؟', answer: 'ثلاثة' },
    { id: 'ث2', letter: 'ث', text: 'إلى أي فصيلة حيوانية تنتمي الحيتان والأفيال؟', answer: 'الثدييات' },
  ],
  'ج': [
    { id: 'ج1', letter: 'ج', text: 'ما أعلى قمة جبلية في العالم؟', answer: 'جبل إيفرست' },
    { id: 'ج2', letter: 'ج', text: 'ما أكبر دولة في أفريقيا من حيث المساحة؟', answer: 'الجزائر' },
  ],
  'ح': [
    { id: 'ح1', letter: 'ح', text: 'ما أكبر حيوان في العالم؟', answer: 'حوت أزرق' },
    { id: 'ح2', letter: 'ح', text: 'ما الحيوان الذي يُستخدم في سباقات الخيل؟', answer: 'الحصان' },
  ],
  'خ': [
    { id: 'خ1', letter: 'خ', text: 'ما عاصمة السودان؟', answer: 'الخرطوم' },
    { id: 'خ2', letter: 'خ', text: 'ما اسم الخليج الفاصل بين شبه الجزيرة العربية وإيران؟', answer: 'الخليج العربي' },
  ],
  'د': [
    { id: 'د1', letter: 'د', text: 'ما عاصمة سوريا؟', answer: 'دمشق' },
    { id: 'د2', letter: 'د', text: 'ما اسم أشهر مدن الإمارات وأكبرها اقتصاداً؟', answer: 'دبي' },
  ],
  'ذ': [
    { id: 'ذ1', letter: 'ذ', text: 'ما اسم المعدن الثمين الأصفر اللون؟', answer: 'الذهب' },
    { id: 'ذ2', letter: 'ذ', text: 'ما أصغر وحدة بنائية للعنصر الكيميائي؟', answer: 'الذرة' },
  ],
  'ر': [
    { id: 'ر1', letter: 'ر', text: 'ما عاصمة المملكة العربية السعودية؟', answer: 'الرياض' },
    { id: 'ر2', letter: 'ر', text: 'ما أكبر دولة في العالم من حيث المساحة؟', answer: 'روسيا' },
  ],
  'ز': [
    { id: 'ز1', letter: 'ز', text: 'ما أطول الحيوانات البرية عنقاً في العالم؟', answer: 'الزرافة' },
    { id: 'ز2', letter: 'ز', text: 'ما المعدن الوحيد الذي يكون سائلاً في درجة حرارة الغرفة؟', answer: 'الزئبق' },
  ],
  'س': [
    { id: 'س1', letter: 'س', text: 'أي دولة أوروبية تشتهر بصناعة الساعات والشوكولاتة؟', answer: 'سويسرا' },
    { id: 'س2', letter: 'س', text: 'ما الدولة الأفريقية التي عاصمتها الخرطوم؟', answer: 'السودان' },
  ],
  'ش': [
    { id: 'ش1', letter: 'ش', text: 'ما النجم الأقرب إلى كوكب الأرض؟', answer: 'الشمس' },
    { id: 'ش2', letter: 'ش', text: 'ما الشكل الجغرافي الذي تتخذه أرض العرب في آسيا؟', answer: 'شبه جزيرة' },
  ],
  'ص': [
    { id: 'ص1', letter: 'ص', text: 'ما أكثر دول العالم من حيث عدد السكان؟', answer: 'الصين' },
    { id: 'ص2', letter: 'ص', text: 'ما أكبر صحراء رملية في العالم؟', answer: 'الصحراء الكبرى' },
  ],
  'ض': [
    { id: 'ض1', letter: 'ض', text: 'ما أسرع شيء معروف في الكون؟', answer: 'الضوء' },
    { id: 'ض2', letter: 'ض', text: 'ما الحيوان البرمائي الذي يعيش في الماء والبر ويصدر نقيقاً؟', answer: 'الضفدع' },
  ],
  'ط': [
    { id: 'ط1', letter: 'ط', text: 'ما عاصمة اليابان؟', answer: 'طوكيو' },
    { id: 'ط2', letter: 'ط', text: 'ما الوسيلة التي تنقل المسافرين عبر الجو؟', answer: 'الطائرة' },
  ],
  'ظ': [
    { id: 'ظ1', letter: 'ظ', text: 'ما الذي تُحدثه الأشجار حين تحجب أشعة الشمس؟', answer: 'الظل' },
    { id: 'ظ2', letter: 'ظ', text: 'ما اسم الغطاء الصلب في طرف أصابع الإنسان؟', answer: 'الظفر' },
  ],
  'ع': [
    { id: 'ع1', letter: 'ع', text: 'ما عاصمة الأردن؟', answer: 'عمّان' },
    { id: 'ع2', letter: 'ع', text: 'أي كوكب في المجموعة الشمسية هو الأقرب إلى الشمس؟', answer: 'عطارد' },
  ],
  'غ': [
    { id: 'غ1', letter: 'غ', text: 'ما الحالة الثالثة للمادة إلى جانب الصلبة والسائلة؟', answer: 'الغاز' },
    { id: 'غ2', letter: 'غ', text: 'ما الدولة الأفريقية الغربية التي عاصمتها أكرا وتشتهر بالكاكاو؟', answer: 'غانا' },
  ],
  'ف': [
    { id: 'ف1', letter: 'ف', text: 'في أي دولة يقع برج إيفل؟', answer: 'فرنسا' },
    { id: 'ف2', letter: 'ف', text: 'ما أكبر الحيوانات البرية حجماً في العالم؟', answer: 'الفيل' },
  ],
  'ق': [
    { id: 'ق1', letter: 'ق', text: 'ما عاصمة مصر؟', answer: 'القاهرة' },
    { id: 'ق2', letter: 'ق', text: 'ما التابع الطبيعي الوحيد لكوكب الأرض؟', answer: 'القمر' },
  ],
  'ك': [
    { id: 'ك1', letter: 'ك', text: 'ما عاصمة أستراليا؟', answer: 'كانبيرا' },
    { id: 'ك2', letter: 'ك', text: 'ما أكبر دول أمريكا الشمالية مساحةً؟', answer: 'كندا' },
  ],
  'ل': [
    { id: 'ل1', letter: 'ل', text: 'ما عاصمة المملكة المتحدة؟', answer: 'لندن' },
    { id: 'ل2', letter: 'ل', text: 'ما الدولة العربية التي عاصمتها بيروت؟', answer: 'لبنان' },
  ],
  'م': [
    { id: 'م1', letter: 'م', text: 'في أي دولة تقع الأهرامات الفرعونية؟', answer: 'مصر' },
    { id: 'م2', letter: 'م', text: 'ما الكوكب المعروف بلونه الأحمر في المجموعة الشمسية؟', answer: 'المريخ' },
  ],
  'ن': [
    { id: 'ن1', letter: 'ن', text: 'ما أطول نهر في العالم؟', answer: 'النيل' },
    { id: 'ن2', letter: 'ن', text: 'ما الأجسام الكونية المضيئة التي تملأ السماء ليلاً؟', answer: 'النجوم' },
  ],
  'ه': [
    { id: 'ه1', letter: 'ه', text: 'ما الطائر الذي يُعتبر رمزاً للسلام؟', answer: 'الهدهد' },
    { id: 'ه2', letter: 'ه', text: 'ما الهضبة الأعلى في العالم والمعروفة بـ"سقف العالم"؟', answer: 'هضبة التبت' },
  ],
  'و': [
    { id: 'و1', letter: 'و', text: 'ما عاصمة الولايات المتحدة الأمريكية؟', answer: 'واشنطن' },
    { id: 'و2', letter: 'و', text: 'ما عاصمة بولندا؟', answer: 'وارسو' },
  ],
  'ي': [
    { id: 'ي1', letter: 'ي', text: 'ما الدولة التي تُعرف بـ"أرض الشمس المشرقة"؟', answer: 'اليابان' },
    { id: 'ي2', letter: 'ي', text: 'ما الدولة الأوروبية التي عاصمتها أثينا؟', answer: 'اليونان' },
  ],
}

export function getRandomQuestion(letter: string, excludeIds: string[]): Question | null {
  const pool = QUESTION_BANK[letter]
  if (!pool || pool.length === 0) return null

  let available = pool.filter((q) => !excludeIds.includes(q.id))

  // All questions for this letter used — cycle, only excluding the last shown one.
  if (available.length === 0) {
    const lastId = excludeIds[excludeIds.length - 1]
    available = pool.filter((q) => q.id !== lastId)
    if (available.length === 0) available = pool
  }

  return available[Math.floor(Math.random() * available.length)]
}
