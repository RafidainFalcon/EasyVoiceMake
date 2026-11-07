Fish Voice Studio — GitHub + Vercel

1. ارفع index.html و style.css و script.js ومجلد api إلى جذر مستودع GitHub.
2. استورد المستودع في Vercel مع Framework Preset: Other و Root Directory: ./.
3. Settings > Environment Variables: أضف FISH_API_KEY مع مفتاح جديد.
4. نفّذ Redeploy بعد حفظ المتغير.
5. افتح رابط Vercel وجرب توليد نص قصير.

لا تفتح index.html محلياً لتجربة التوليد: /api/generate يعمل على Vercel فقط.
لا تضع المفتاح في script.js أو GitHub. لا تحتاج استضافة ثانية.
ملاحظة: نجاح التوليد يعتمد على صلاحية المفتاح والنموذج وحدود Fish Audio وVercel.
