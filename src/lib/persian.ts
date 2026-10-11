const ONES = ["صفر", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"] as const;
const TEENS = [
  "ده",
  "یازده",
  "دوازده",
  "سیزده",
  "چهارده",
  "پانزده",
  "شانزده",
  "هفده",
  "هجده",
  "نوزده",
] as const;
const TENS = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"] as const;
const HUNDREDS = [
  "",
  "صد",
  "دویست",
  "سیصد",
  "چهارصد",
  "پانصد",
  "ششصد",
  "هفتصد",
  "هشتصد",
  "نهصد",
] as const;

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function faDigits(value: string): string {
  return value.replace(/\d/g, (d) => FA_DIGITS[Number(d)] ?? d).replace(".", "٫");
}

export function normalizeFa(input: string): string {
  return input
    .replace(/\u064A/g, "\u06CC")
    .replace(/\u0649/g, "\u06CC")
    .replace(/\u0643/g, "\u06A9")
    .replace(/\u200C{2,}/g, "\u200C")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toAsciiDigits(raw: string): string {
  return raw.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));
}

function under1000(n: number): string {
  if (n <= 0) return "";
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h) parts.push(HUNDREDS[h] ?? "");
  if (rest >= 10 && rest < 20) parts.push(TEENS[rest - 10] ?? "");
  else {
    const t = Math.floor(rest / 10);
    const o = rest % 10;
    if (t) parts.push(TENS[t] ?? "");
    if (o) parts.push(ONES[o] ?? "");
  }
  return parts.filter(Boolean).join(" و ");
}

/** Iranian cardinal, 0 … 999_999_999_999. */
export function cardinalFa(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "";
  if (n === 0) return "صفر";
  const scales = [
    { v: 1_000_000_000, name: "میلیارد" },
    { v: 1_000_000, name: "میلیون" },
    { v: 1000, name: "هزار" },
  ];
  const parts: string[] = [];
  let x = Math.floor(n);
  for (const s of scales) {
    if (x >= s.v) {
      const q = Math.floor(x / s.v);
      x %= s.v;
      if (s.v === 1000 && q === 1) parts.push(s.name);
      else parts.push(`${under1000(q)} ${s.name}`);
    }
  }
  if (x) parts.push(under1000(x));
  return parts.join(" و ");
}

function spellIntToken(digits: string): string {
  const clean = digits.replace(/[,٬]/g, "");
  const digitByDigit = (clean.startsWith("0") && clean.length >= 4) || clean.length >= 10;
  if (digitByDigit) {
    return [...clean].map((d) => ONES[Number(d)] ?? d).join(" ");
  }
  const n = Number(clean);
  if (!Number.isSafeInteger(n)) {
    return [...clean].map((d) => ONES[Number(d)] ?? d).join(" ");
  }
  return cardinalFa(n);
}

function spellFraction(frac: string): string {
  return [...frac].map((d) => ONES[Number(d)] ?? d).join(" ");
}

function spellClock(raw: string): string | null {
  const m = raw.match(/^([0-9۰-۹]{1,2}):([0-9۰-۹]{2})$/);
  if (!m) return null;
  const h = Number(toAsciiDigits(m[1]));
  const min = Number(toAsciiDigits(m[2]));
  if (h > 23 || min > 59) return null;
  const hourPart = cardinalFa(h);
  if (min === 0) return `${hourPart} تمام`;
  return `${hourPart} و ${cardinalFa(min)} دقیقه`;
}

export function expandNumbers(text: string): string {
  text = text.replace(/([0-9۰-۹]+)\s*%/g, (_, n: string) => `${spellIntToken(toAsciiDigits(n))} درصد`);

  text = text.replace(/[0-9۰-۹]{1,2}:[0-9۰-۹]{2}/g, (raw) => spellClock(raw) ?? raw);

  text = text.replace(
    /[0-9۰-۹]{1,3}(?:[,٬][0-9۰-۹]{3})+(?:[.][0-9۰-۹]+)?|[0-9۰-۹]+(?:[.][0-9۰-۹]+)?|[0-9۰-۹]+[٫][0-9۰-۹]+/g,
    (raw) => {
      const ascii = toAsciiDigits(raw);
      const sep = ascii.includes(".") ? "." : ascii.includes("٫") ? "٫" : "";
      if (sep) {
        const [a, b] = ascii.split(sep);
        return `${spellIntToken(a ?? "0")} ممیز ${spellFraction(b ?? "")}`;
      }
      return spellIntToken(ascii);
    },
  );

  return text;
}

export function chunkText(text: string, max = 700): string[] {
  if (text.length <= max) return [text];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    if (text.length - start <= max) {
      chunks.push(text.slice(start));
      break;
    }
    const window = text.slice(start, start + max);
    let cut = -1;
    for (const b of ["\n", "؟", "!", ".", "؛", "،", " "]) {
      const i = window.lastIndexOf(b);
      if (i >= Math.floor(max * 0.45)) {
        cut = i + b.length;
        break;
      }
    }
    if (cut === -1 || cut < 1) cut = max;
    chunks.push(text.slice(start, start + cut));
    start += cut;
  }
  return chunks.filter((c) => c.length > 0);
}

export const VOICES = [
  {
    id: "fa-IR-DilaraNeural",
    name: "دیارا",
    hint: "زن · گرم و روزمره",
  },
  {
    id: "fa-IR-FaridNeural",
    name: "فرید",
    hint: "مرد · رسا و رسمی",
  },
] as const;

export type VoiceId = (typeof VOICES)[number]["id"];

export const SAMPLES: { title: string; text: string }[] = [
  {
    title: "سلام",
    text: "سلام، حالِ شما چطور است؟ من آوا هستم و متن فارسی را با لهجهٔ معیار ایران می‌خوانم.",
  },
  {
    title: "کسرهٔ اضافه",
    text: "کتابِ تازهٔ نویسندهٔ جوان، دربارهٔ تاریخِ معماریِ خانه‌هایِ قدیمیِ شیراز و یزد است.",
  },
  {
    title: "ساعت و عدد",
    text: "جلسه ساعت ۴:۳۰ بعدازظهر، در طبقهٔ سوم، اتاق شمارهٔ ۱۲ برگزار می‌شود. گزارش ۲۳ صفحه‌ای را همراه بیاورید.",
  },
  {
    title: "حافظ",
    text: "الا یا ایها الساقی ادر کأساً و ناولها. که عشق آسان نمود اول، ولی افتاد مشکل‌ها.",
  },
  {
    title: "هوای تهران",
    text: "امروز در تهران هوا نیمه‌ابری است و بیشینهٔ دما به ۲۴ درجه می‌رسد. احتمالِ بارشِ پراکنده در شمالِ شهر وجود دارد.",
  },
];

export const WELCOME =
  "سلام. من آوا هستم. هر متن فارسی را اینجا بنویسید تا با لهجهٔ معیار ایران، روشن و طبیعی، برایتان بخوانم.";

export const MAX_CHARS = 4000;
