// =============================================================================
// Algerian Wilayas - Complete list of 58 wilayas
// =============================================================================

export interface Wilaya {
  code: string;
  nameAr: string;
  nameEn: string;
}

export const WILAYAS: Wilaya[] = [
  { code: '01', nameAr: 'أدرار', nameEn: 'Adrar' },
  { code: '02', nameAr: 'الشلف', nameEn: 'Chlef' },
  { code: '03', nameAr: 'الأغواط', nameEn: 'Laghouat' },
  { code: '04', nameAr: 'أم البواقي', nameEn: 'Oum El Bouaghi' },
  { code: '05', nameAr: 'باتنة', nameEn: 'Batna' },
  { code: '06', nameAr: 'بجاية', nameEn: 'Béjaïa' },
  { code: '07', nameAr: 'بسكرة', nameEn: 'Biskra' },
  { code: '08', nameAr: 'بشار', nameEn: 'Béchar' },
  { code: '09', nameAr: 'البليدة', nameEn: 'Blida' },
  { code: '10', nameAr: 'البويرة', nameEn: 'Bouira' },
  { code: '11', nameAr: 'تمنراست', nameEn: 'Tamanrasset' },
  { code: '12', nameAr: 'تبسة', nameEn: 'Tébessa' },
  { code: '13', nameAr: 'تلمسان', nameEn: 'Tlemcen' },
  { code: '14', nameAr: 'تيارت', nameEn: 'Tiaret' },
  { code: '15', nameAr: 'تيزي وزو', nameEn: 'Tizi Ouzou' },
  { code: '16', nameAr: 'الجزائر', nameEn: 'Alger' },
  { code: '17', nameAr: 'الجلفة', nameEn: 'Djelfa' },
  { code: '18', nameAr: 'جيجل', nameEn: 'Jijel' },
  { code: '19', nameAr: 'سطيف', nameEn: 'Sétif' },
  { code: '20', nameAr: 'سعيدة', nameEn: 'Saïda' },
  { code: '21', nameAr: 'سكيكدة', nameEn: 'Skikda' },
  { code: '22', nameAr: 'سيدي بلعباس', nameEn: 'Sidi Bel Abbès' },
  { code: '23', nameAr: 'عنابة', nameEn: 'Annaba' },
  { code: '24', nameAr: 'قالمة', nameEn: 'Guelma' },
  { code: '25', nameAr: 'قسنطينة', nameEn: 'Constantine' },
  { code: '26', nameAr: 'المدية', nameEn: 'Médéa' },
  { code: '27', nameAr: 'مستغانم', nameEn: 'Mostaganem' },
  { code: '28', nameAr: 'المسيلة', nameEn: 'M\'Sila' },
  { code: '29', nameAr: 'معسكر', nameEn: 'Mascara' },
  { code: '30', nameAr: 'ورقلة', nameEn: 'Ouargla' },
  { code: '31', nameAr: 'وهران', nameEn: 'Oran' },
  { code: '32', nameAr: 'البيض', nameEn: 'El Bayadh' },
  { code: '33', nameAr: 'إليزي', nameEn: 'Illizi' },
  { code: '34', nameAr: 'برج بوعريريج', nameEn: 'Bordj Bou Arréridj' },
  { code: '35', nameAr: 'بومرداس', nameEn: 'Boumerdès' },
  { code: '36', nameAr: 'الطارف', nameEn: 'El Tarf' },
  { code: '37', nameAr: 'تندوف', nameEn: 'Tindouf' },
  { code: '38', nameAr: 'تيسمسيلت', nameEn: 'Tissemsilt' },
  { code: '39', nameAr: 'الوادي', nameEn: 'El Oued' },
  { code: '40', nameAr: 'خنشلة', nameEn: 'Khenchela' },
  { code: '41', nameAr: 'سوق أهراس', nameEn: 'Souk Ahras' },
  { code: '42', nameAr: 'تيبازة', nameEn: 'Tipaza' },
  { code: '43', nameAr: 'ميلة', nameEn: 'Mila' },
  { code: '44', nameAr: 'عين الدفلى', nameEn: 'Aïn Defla' },
  { code: '45', nameAr: 'النعامة', nameEn: 'Naâma' },
  { code: '46', nameAr: 'عين تموشنت', nameEn: 'Aïn Témouchent' },
  { code: '47', nameAr: 'غرداية', nameEn: 'Ghardaïa' },
  { code: '48', nameAr: 'غليزان', nameEn: 'Relizane' },
  { code: '49', nameAr: 'تيميمون', nameEn: 'Timimoun' },
  { code: '50', nameAr: 'برج باجي مختار', nameEn: 'Bordj Badji Mokhtar' },
  { code: '51', nameAr: 'أولاد جلال', nameEn: 'Ouled Djellal' },
  { code: '52', nameAr: 'بني عباس', nameEn: 'Béni Abbès' },
  { code: '53', nameAr: 'إن صالح', nameEn: 'In Salah' },
  { code: '54', nameAr: 'إن قزام', nameEn: 'In Guezzam' },
  { code: '55', nameAr: 'تقرت', nameEn: 'Touggourt' },
  { code: '56', nameAr: 'جانت', nameEn: 'Djanet' },
  { code: '57', nameAr: 'المغير', nameEn: 'El M\'Ghair' },
  { code: '58', nameAr: 'المنيعة', nameEn: 'El Meniaa' },
];

/**
 * Get wilaya name by code
 */
export function getWilayaName(code: string, locale: 'ar' | 'en'): string {
  const wilaya = WILAYAS.find(w => w.code === code);
  if (!wilaya) return code;
  return locale === 'ar' ? wilaya.nameAr : wilaya.nameEn;
}

/**
 * Get wilaya by code
 */
export function getWilaya(code: string): Wilaya | undefined {
  return WILAYAS.find(w => w.code === code);
}

/**
 * Search wilayas by name (supports Arabic and English)
 */
export function searchWilayas(query: string): Wilaya[] {
  const q = query.toLowerCase().trim();
  if (!q) return WILAYAS;
  return WILAYAS.filter(w =>
    w.nameAr.includes(q) ||
    w.nameEn.toLowerCase().includes(q) ||
    w.code.includes(q)
  );
}
