import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { translations, Language } from '../utils/translations';

interface BookingFormProps {
  onBack: () => void;
  onSuccess: (data: any) => void;
  language: Language;
}

const countryCodes = [
  { code: '+1',   name: 'USA' },
{ code: '+1',   name: 'CAN' },
{ code: '+7',   name: 'RUS' },
{ code: '+7',   name: 'KAZ' },
{ code: '+20',  name: 'EGY' },
{ code: '+27',  name: 'ZAF' },
{ code: '+30',  name: 'GRC' },
{ code: '+31',  name: 'NLD' },
{ code: '+32',  name: 'BEL' },
{ code: '+33',  name: 'FRA' },
{ code: '+34',  name: 'ESP' },
{ code: '+36',  name: 'HUN' },
{ code: '+39',  name: 'ITA' },
{ code: '+40',  name: 'ROU' },
{ code: '+41',  name: 'CHE' },
{ code: '+43',  name: 'AUT' },
{ code: '+44',  name: 'GBR' },
{ code: '+45',  name: 'DNK' },
{ code: '+46',  name: 'SWE' },
{ code: '+47',  name: 'NOR' },
{ code: '+48',  name: 'POL' },
{ code: '+49',  name: 'DEU' },
{ code: '+51',  name: 'PER' },
{ code: '+52',  name: 'MEX' },
{ code: '+53',  name: 'CUB' },
{ code: '+54',  name: 'ARG' },
{ code: '+55',  name: 'BRA' },
{ code: '+56',  name: 'CHL' },
{ code: '+57',  name: 'COL' },
{ code: '+58',  name: 'VEN' },
{ code: '+60',  name: 'MYS' },
{ code: '+61',  name: 'AUS' },
{ code: '+62',  name: 'IDN' },
{ code: '+63',  name: 'PHL' },
{ code: '+64',  name: 'NZL' },
{ code: '+65',  name: 'SGP' },
{ code: '+66',  name: 'THA' },
{ code: '+81',  name: 'JPN' },
{ code: '+82',  name: 'KOR' },
{ code: '+84',  name: 'VNM' },
{ code: '+86',  name: 'CHN' },
{ code: '+90',  name: 'TUR' },
{ code: '+91',  name: 'IND' },
{ code: '+92',  name: 'PAK' },
{ code: '+93',  name: 'AFG' },
{ code: '+94',  name: 'LKA' },
{ code: '+95',  name: 'MMR' },
{ code: '+98',  name: 'IRN' },
{ code: '+212', name: 'MAR' },
{ code: '+213', name: 'DZA' },
{ code: '+216', name: 'TUN' },
{ code: '+218', name: 'LBY' },
{ code: '+220', name: 'GMB' },
{ code: '+221', name: 'SEN' },
{ code: '+222', name: 'MRT' },
{ code: '+223', name: 'MLI' },
{ code: '+224', name: 'GIN' },
{ code: '+225', name: 'CIV' },
{ code: '+226', name: 'BFA' },
{ code: '+227', name: 'NER' },
{ code: '+228', name: 'TGO' },
{ code: '+229', name: 'BEN' },
{ code: '+230', name: 'MUS' },
{ code: '+231', name: 'LBR' },
{ code: '+232', name: 'SLE' },
{ code: '+233', name: 'GHA' },
{ code: '+234', name: 'NGA' },
{ code: '+235', name: 'TCD' },
{ code: '+236', name: 'CAF' },
{ code: '+237', name: 'CMR' },
{ code: '+238', name: 'CPV' },
{ code: '+239', name: 'STP' },
{ code: '+240', name: 'GNQ' },
{ code: '+241', name: 'GAB' },
{ code: '+242', name: 'COG' },
{ code: '+243', name: 'COD' },
{ code: '+244', name: 'AGO' },
{ code: '+245', name: 'GNB' },
{ code: '+246', name: 'IOT' },
{ code: '+248', name: 'SYC' },
{ code: '+249', name: 'SDN' },
{ code: '+250', name: 'RWA' },
{ code: '+251', name: 'ETH' },
{ code: '+252', name: 'SOM' },
{ code: '+253', name: 'DJI' },
{ code: '+254', name: 'KEN' },
{ code: '+255', name: 'TZA' },
{ code: '+256', name: 'UGA' },
{ code: '+257', name: 'BDI' },
{ code: '+258', name: 'MOZ' },
{ code: '+260', name: 'ZMB' },
{ code: '+261', name: 'MDG' },
{ code: '+262', name: 'REU' },
{ code: '+263', name: 'ZWE' },
{ code: '+264', name: 'NAM' },
{ code: '+265', name: 'MWI' },
{ code: '+266', name: 'LSO' },
{ code: '+267', name: 'BWA' },
{ code: '+268', name: 'SWZ' },
{ code: '+269', name: 'COM' },
{ code: '+290', name: 'SHN' },
{ code: '+291', name: 'ERI' },
{ code: '+297', name: 'ABW' },
{ code: '+298', name: 'FRO' },
{ code: '+299', name: 'GRL' },
{ code: '+350', name: 'GIB' },
{ code: '+351', name: 'PRT' },
{ code: '+352', name: 'LUX' },
{ code: '+353', name: 'IRL' },
{ code: '+354', name: 'ISL' },
{ code: '+355', name: 'ALB' },
{ code: '+356', name: 'MLT' },
{ code: '+357', name: 'CYP' },
{ code: '+358', name: 'FIN' },
{ code: '+359', name: 'BGR' },
{ code: '+370', name: 'LTU' },
{ code: '+371', name: 'LVA' },
{ code: '+372', name: 'EST' },
{ code: '+373', name: 'MDA' },
{ code: '+374', name: 'ARM' },
{ code: '+375', name: 'BLR' },
{ code: '+376', name: 'AND' },
{ code: '+377', name: 'MCO' },
{ code: '+378', name: 'SMR' },
{ code: '+379', name: 'VAT' },
{ code: '+380', name: 'UKR' },
{ code: '+381', name: 'SRB' },
{ code: '+382', name: 'MNE' },
{ code: '+383', name: 'XKX' },
{ code: '+385', name: 'HRV' },
{ code: '+386', name: 'SVN' },
{ code: '+387', name: 'BIH' },
{ code: '+389', name: 'MKD' },
{ code: '+420', name: 'CZE' },
{ code: '+421', name: 'SVK' },
{ code: '+423', name: 'LIE' },
{ code: '+505', name: 'BLZ' },
{ code: '+506', name: 'CRI' },
{ code: '+507', name: 'PAN' },
{ code: '+509', name: 'HTI' },
{ code: '+590', name: 'GLP' },
{ code: '+591', name: 'BOL' },
{ code: '+592', name: 'GUY' },
{ code: '+593', name: 'ECU' },
{ code: '+594', name: 'GUF' },
{ code: '+595', name: 'PRY' },
{ code: '+596', name: 'MTQ' },
{ code: '+597', name: 'SUR' },
{ code: '+598', name: 'URY' },
{ code: '+599', name: 'ANT' },
{ code: '+670', name: 'TLS' },
{ code: '+672', name: 'ATA' },
{ code: '+673', name: 'BRN' },
{ code: '+674', name: 'NRU' },
{ code: '+675', name: 'PNG' },
{ code: '+676', name: 'TON' },
{ code: '+677', name: 'SLB' },
{ code: '+678', name: 'VUT' },
{ code: '+679', name: 'FJI' },
{ code: '+680', name: 'PLW' },
{ code: '+681', name: 'WLF' },
{ code: '+682', name: 'COK' },
{ code: '+683', name: 'TKL' },
{ code: '+685', name: 'WSM' },
{ code: '+686', name: 'KIR' },
{ code: '+687', name: 'NCU' },
{ code: '+688', name: 'TUV' },
{ code: '+689', name: 'PYF' },
{ code: '+850', name: 'PRK' },
{ code: '+852', name: 'HKG' },
{ code: '+853', name: 'MAC' },
{ code: '+855', name: 'KHM' },
{ code: '+856', name: 'LAO' },
{ code: '+880', name: 'BGD' },
{ code: '+886', name: 'TWN' },
{ code: '+960', name: 'MDV' },
{ code: '+961', name: 'LBN' },
{ code: '+962', name: 'JOR' },
{ code: '+963', name: 'SYR' },
{ code: '+964', name: 'IRQ' },
{ code: '+965', name: 'KWT' },
{ code: '+966', name: 'SAU' },
{ code: '+967', name: 'YEM' },
{ code: '+968', name: 'OMN' },
{ code: '+971', name: 'ARE' },
{ code: '+972', name: 'ISR' },
{ code: '+973', name: 'BHR' },
{ code: '+974', name: 'QAT' },
{ code: '+975', name: 'BTN' },
{ code: '+976', name: 'MNG' },
{ code: '+977', name: 'NPL' },
{ code: '+992', name: 'TJK' },
{ code: '+993', name: 'TKM' },
{ code: '+994', name: 'AZE' },
{ code: '+995', name: 'GEO' },
{ code: '+996', name: 'KGZ' },
{ code: '+998', name: 'UZB' },

];

const revenueRanges = [
  'Less than 10k',
  '10k - 50k',
  '50k - 100k',
  '100k - 250k',
  '250k - 500k',
  '500k - 1M',
  'More than 1M',
];

export default function BookingForm({
  selectedDate,
  selectedTime,
  selectedTimezone,
  onBack,
  onSuccess,
  language,
}: BookingFormProps) {
  const t = translations[language];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+1',
    phone: '',
    revenueRange: '',
    website: '',
    businessDescription: '',
    reason: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const fullPhone = `${formData.countryCode}${formData.phone}`;

      const formBody = new URLSearchParams();
      formBody.append('firstName', formData.firstName);
      formBody.append('lastName', formData.lastName);
      formBody.append('email', formData.email);
      formBody.append('countryCode', formData.countryCode);
      formBody.append('phone', formData.phone);
      formBody.append('fullPhone', fullPhone);
      formBody.append('revenueRange', formData.revenueRange);
      formBody.append('website', formData.website);
      formBody.append('businessDescription', formData.businessDescription);
      formBody.append('reason', formData.reason);
      formBody.append('date', formattedDate);
      formBody.append('time', selectedTime);
      formBody.append('timezone', selectedTimezone);

      await fetch('https://n8n.halovisionai.cloud/webhook/halovisionschedule880088', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
        mode: 'no-cors',
      });

      onSuccess();
    } catch (error) {
      console.error('Booking error:', error);
      alert(t.bookingError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 bg-black/50 rounded-xl shadow-xl max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        {t.back}
      </button>

      <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">{t.firstName} *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">{t.lastName}</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-1">{t.email} *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-1">{t.phone}</label>
          <div className="flex gap-2">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className="bg-gray-900 text-white px-3 py-2 rounded-lg border border-gray-700 max-w-[180px]"
            >
              {countryCodes.map(c => (
                <option key={c.code} value={c.code}>
                  {c.name} {c.code}
                </option>
              ))}
            </select>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-1">{t.revenueRange} *</label>
          <select
            name="revenueRange"
            value={formData.revenueRange}
            onChange={handleChange}
            required
            className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700"
          >
            <option value="">{t.selectRevenueRange}</option>
            {revenueRanges.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-1">{t.website} *</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            required
            className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-1">{t.businessDescription} *</label>
          <textarea
            name="businessDescription"
            value={formData.businessDescription}
            onChange={handleChange}
            required
            rows={3}
            className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 resize-none"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-1">{t.reason}</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={2}
            className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {isSubmitting ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  );
}
