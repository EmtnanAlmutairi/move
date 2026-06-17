import {
  AdminConfig,
  BodyMeasurement,
  ChatMessage,
  ChatThread,
  Community,
  CommunityPost,
  Exercise,
  FeedPost,
  HealthSnapshot,
  InjuryReport,
  LeaderboardEntry,
  MealItem,
  NearbyUser,
  Professional,
  RunSession,
  ScheduledSession,
  StoreItem,
  SubscriptionPlan,
  UserPostGrid,
  UserProfile,
  WeeklyProgressDay,
  WorkoutTask
} from '../types';

// ─── Subscription Plans ────────────────────────────────────────────────────
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'move-plus',
    title: 'MOVE Plus',
    priceSarMonthly: 299,
    description: 'اشتراك شامل مع مدرب + تغذية + علاج طبيعي',
    features: [
      'خطة تدريب مصورة تتحدث أسبوعيا',
      'خطة تغذية يومية قابلة للتعديل',
      'متابعة إصابات واستشفاء',
      'مجتمع وتحديات شهرية'
    ]
  },
  {
    id: 'move-pro',
    title: 'MOVE Pro Team',
    priceSarMonthly: 499,
    description: 'فريق صحي كامل + أولوية رسائل + مراجعة أسبوعية',
    features: [
      'فريق صحي متكامل',
      'اجتماع أسبوعي مباشر',
      'تحليلات صحية متقدمة',
      'دعم ربط أجهزة التتبع'
    ]
  }
];

// ─── Exercises ─────────────────────────────────────────────────────────────
const chestExercises: Exercise[] = [
  { id: 'e1', name: 'بنش بريس بالبار', sets: 4, reps: '8-10', restSec: 90, muscleGroup: 'صدر', thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600', coachNote: 'أبقِ كتفيك مثبتتين على المقعد طوال الحركة. أنزل البار حتى يلمس صدرك بلطف، ولا تقفل المرفقين في القمة. تخيّل أنك تدفع المقعد بعيداً عنك بدلاً من دفع البار للأعلى.' },
  { id: 'e2', name: 'فلاي على المنحدر', sets: 3, reps: '12', restSec: 60, muscleGroup: 'صدر', thumbnail: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600', notes: 'ركز على الامتداد الكامل', coachNote: 'ذراعاك شبه مستقيمتان مع انحناء بسيط في المرفق — كأنك تعانق شجرة كبيرة. ركّز على إحساس الشد في الصدر عند الانفتاح، والانقباض في منتصف الصدر عند الإغلاق.' },
  { id: 'e3', name: 'ضغط بالدمبلز على المنحدر', sets: 3, reps: '10-12', restSec: 60, muscleGroup: 'صدر', thumbnail: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600', coachNote: 'ابدأ بأوزان معقولة حتى تُتقن المسار. أبقِ المعصمين مستقيمين تماماً طوال الحركة. زاوية المقعد 30-45 درجة تشغّل الصدر العلوي بشكل أفضل.' },
  { id: 'e4', name: 'تمرين الترايسبس بالحبل', sets: 3, reps: '15', restSec: 45, muscleGroup: 'ترايسبس', thumbnail: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600', coachNote: 'المرفقان ثابتان بجانب الجسم ولا يتحركان. اضغط حتى نهاية الحركة الكاملة، وقف ثانية في الأسفل. لا تتأرجح — الحركة من المرفق فقط.' },
  { id: 'e5', name: 'ضغط الترايسبس المعكوس', sets: 3, reps: '12', restSec: 45, muscleGroup: 'ترايسبس', thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', coachNote: 'الإمساك المعكوس يشغّل الترايسبس من زاوية مختلفة. الحركة البطيئة للأعلى أهم من السرعة — التحكم يساوي النتيجة.' },
];

const backExercises: Exercise[] = [
  { id: 'e6', name: 'سحب بالبار (ديدليفت)', sets: 4, reps: '6-8', restSec: 120, muscleGroup: 'ظهر', thumbnail: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600', coachNote: 'ظهرك مستقيم دائماً — أهم قاعدة في التمرين. الحركة تبدأ من الورك وليس الظهر. الصدر للأمام، النظر للأمام، والبار قريب من جسمك طوال المسار.' },
  { id: 'e7', name: 'سحب علوي بالحبل', sets: 4, reps: '10-12', restSec: 75, muscleGroup: 'ظهر', thumbnail: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=600', coachNote: 'تخيّل أنك تضغط أكواعك نحو جيوب بنطالك. لا تسحب بالعضلات الأمامية — الظهر يقود الحركة. أبقِ صدرك ممتلئاً ومرتفعاً.' },
  { id: 'e8', name: 'سحب البار للبطن', sets: 3, reps: '10', restSec: 60, muscleGroup: 'ظهر', thumbnail: 'https://images.unsplash.com/photo-1583454155184-870a1f63aebc?w=600', notes: 'اسحب الكوعين للخلف', coachNote: 'الجذع بزاوية 45 درجة وثابت — لا يتحرك مع الوزن. اسحب الكوعين للخلف والأعلى. وقفة في نهاية الحركة لثانية كاملة لتشغيل العضلة الوسطى.' },
  { id: 'e9', name: 'عضلة الباي بالبار', sets: 4, reps: '10-12', restSec: 60, muscleGroup: 'بايسبس', thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600', coachNote: 'المرفقان ثابتان على جانبي الجسم ولا يتحركان للأمام. ركّز على الانقباض الكامل في القمة. النزول البطيء يبني العضلة أكثر من الصعود.' },
  { id: 'e10', name: 'هامر كيرل بالدمبلز', sets: 3, reps: '12', restSec: 45, muscleGroup: 'بايسبس', thumbnail: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600', coachNote: 'الإمساك المحايد (كالمطرقة) يُشغّل باي الإبهام والعضلة الطولية معاً. حركة متناوبة بين اليدين تُحسّن التركيز العضلي.' },
];

const cardioExercises: Exercise[] = [
  { id: 'e11', name: 'إحماء: مشي سريع', sets: 1, reps: '10 دقائق', restSec: 0, muscleGroup: 'كارديو', thumbnail: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600', coachNote: 'الإحماء ليس اختيارياً — هو جزء من التمرين. ارفع نبضك تدريجياً. خصص دقيقتين لتمديد ديناميكي قبل البدء.' },
  { id: 'e12', name: 'سبرنت متقطع HIIT', sets: 8, reps: '30 ث عمل / 30 ث راحة', restSec: 30, muscleGroup: 'كارديو', thumbnail: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600', coachNote: 'في فترة العمل أعطِ 90-100% من طاقتك. في فترة الراحة تعافَ تماماً — استرح ولا تتحرك. الكثافة الحقيقية هي المفتاح لحرق الدهون بعد التمرين.' },
  { id: 'e13', name: 'قفز الحبل', sets: 3, reps: '100 قفزة', restSec: 60, muscleGroup: 'كارديو', thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', coachNote: 'أبقِ المرفقين قريبين من جسمك والحبل يدار من المعصمين لا الذراعين. القفز بسيط وصغير — لا داعي للارتفاع الكبير. إيقاع منتظم أهم من سرعة عالية.' },
  { id: 'e14', name: 'بلانك', sets: 3, reps: '60 ثانية', restSec: 45, muscleGroup: 'كور', thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600', coachNote: 'جسمك خط مستقيم من الرأس للعقب. لا ترفع أردافك للأعلى، ولا تتركها تنخفض. شدّ بطنك وأرداف للداخل، واضغط على الأرض بأمتانتيك. النفَس المنتظم ضروري.' },
  { id: 'e15', name: 'تمرين بطني دائري', sets: 3, reps: '20', restSec: 45, muscleGroup: 'كور', thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600', coachNote: 'الزفير عند الضغط للأعلى يُشغّل الكور أكثر. يداك تدعمان رقبتك فقط — لا تسحبانها. ركّز على تقلص العضلة البطنية وليس مجرد الحركة.' },
];

const legExercises: Exercise[] = [
  { id: 'e16', name: 'سكوات بالبار', sets: 4, reps: '8-10', restSec: 120, muscleGroup: 'أرجل', thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600', coachNote: 'الركبتان تتبعان اتجاه أصابع القدمين دائماً. انزل حتى الإفخاذ موازية للأرض أو أقل. الوزن على الكعبين — لو رفعت أصابعك عن الأرض فأنت صح. ظهرك مستقيم طوال الحركة.' },
  { id: 'e17', name: 'ليج بريس', sets: 4, reps: '12-15', restSec: 90, muscleGroup: 'أرجل', thumbnail: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600', coachNote: 'لا تقفل ركبتيك في الأعلى أبداً. القدمان على مستوى الكتف أو أوسع قليلاً. تحكّم في الإنزال ببطء — 2 ثانية للنزول، انفجر في الصعود.' },
  { id: 'e18', name: 'لانج متناوب بالدمبلز', sets: 3, reps: '10 لكل رجل', restSec: 60, muscleGroup: 'أرجل', thumbnail: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600', coachNote: 'الركبة الخلفية تقترب من الأرض دون أن تلمسها. الجذع مستقيم وصدرك مرتفع. الخطوة كبيرة بما يكفي لتكون الساق الأمامية عمودية على الأرض.' },
  { id: 'e19', name: 'رفع الساق (كالف)', sets: 4, reps: '20', restSec: 45, muscleGroup: 'أرجل', thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', notes: 'ابقَ على رؤوس الأصابع', coachNote: 'الصعود الكامل على رؤوس الأصابع مع توقف ثانية في الأعلى. النزول البطيء يمدّ العضلة كاملاً — هذا أهم من الصعود. جرّب تمرينها بقدم واحدة لتركيز أكبر.' },
  { id: 'e20', name: 'هام كيرل جهاز', sets: 3, reps: '12-15', restSec: 60, muscleGroup: 'أرجل', thumbnail: 'https://images.unsplash.com/photo-1516748088049-71b9c5e9f73b?w=600', coachNote: 'الورك ثابت على الكرسي لا يتحرك. ركّز على تقلص الجهة الخلفية من الفخذ بالكامل. النزول بمقاومة أهم من سرعة الصعود — أبطئ في مرحلة الإرجاع.' },
];

const barbellExercises: Exercise[] = [
  { id: 'e21', name: 'ديدليفت', sets: 4, reps: '5', restSec: 180, muscleGroup: 'ظهر', thumbnail: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600', coachNote: 'هذا الملك — الديدليفت يشغّل كل جسمك. ظهرك مستقيم كالقضيب، الصدر للأمام، والنظر أمامك. ابدأ بالدفع من الأرض عبر الساقين، ثم الورك. البار يبقى ملتصقاً بجسمك طوال الحركة.' },
  { id: 'e22', name: 'سكوات بالبار', sets: 5, reps: '5', restSec: 180, muscleGroup: 'أرجل', thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600', coachNote: 'البار على الجزء العلوي من الظهر، ليس على الرقبة. انزل حتى الإفخاذ موازية للأرض — "parallel or bust". الوزن على الكعبين، الركبتان تتبعان أصابع القدم.' },
  { id: 'e23', name: 'أوفرهيد بريس بالبار', sets: 3, reps: '6-8', restSec: 120, muscleGroup: 'كتف', thumbnail: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=600', coachNote: 'ادفع البار مباشرة للأعلى فوق الرأس — مسار مستقيم هو الأفضل. الجذع مشدود كالحجر، لا تقوّس ظهرك. تنفّس للخارج عند الدفع، للداخل عند الإنزال.' },
  { id: 'e24', name: 'بنش بريس بالبار', sets: 4, reps: '6-8', restSec: 120, muscleGroup: 'صدر', thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600', coachNote: 'كتفاك مثبّتتان على المقعد — اسحبهما للأسفل والخلف وابقِهما هناك. أنزل البار للصدر بشكل مسيطر، ادفع بقوة. المسار بشكل قوس خفيف — ليس خطاً مستقيماً.' },
  { id: 'e25', name: 'بنت أوفر رو بالبار', sets: 4, reps: '8', restSec: 120, muscleGroup: 'ظهر', thumbnail: 'https://images.unsplash.com/photo-1583454155184-870a1f63aebc?w=600', coachNote: 'الجذع موازٍ للأرض تقريباً، الظهر مستقيم. اسحب البار نحو السرّة لا الصدر. الأكواع تتحرك للخلف والأعلى. وقفة في القمة لثانية — ستشعر بضغط في منتصف الظهر.' },
];

// ─── Weekly Workouts ────────────────────────────────────────────────────────
export const weeklyWorkout: WorkoutTask[] = [
  {
    id: 'w1',
    dayLabel: 'الأحد',
    title: 'تمرين الصدر والترايسبس',
    durationMin: 60,
    intensity: 'high',
    completed: true,
    videoUrl: 'https://example.com/workout-1',
    coachName: 'كابتن خالد',
    coachId: 'p1',
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=700',
    exercises: chestExercises
  },
  {
    id: 'w2',
    dayLabel: 'الاثنين',
    title: 'تمرين الظهر والبايسبس',
    durationMin: 65,
    intensity: 'high',
    completed: true,
    videoUrl: 'https://example.com/workout-2',
    coachName: 'كابتن خالد',
    coachId: 'p1',
    thumbnail: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=700',
    exercises: backExercises
  },
  {
    id: 'w3',
    dayLabel: 'الثلاثاء',
    title: 'كارديو ولياقة قلبية',
    durationMin: 45,
    intensity: 'medium',
    completed: false,
    videoUrl: 'https://example.com/workout-3',
    coachName: 'كابتن خالد',
    coachId: 'p1',
    thumbnail: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=700',
    exercises: cardioExercises
  },
  {
    id: 'w4',
    dayLabel: 'الأربعاء',
    title: 'تمارين الأرجل والكور',
    durationMin: 70,
    intensity: 'high',
    completed: false,
    videoUrl: 'https://example.com/workout-4',
    coachName: 'كابتن خالد',
    coachId: 'p1',
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700',
    exercises: legExercises
  },
  {
    id: 'w5',
    dayLabel: 'الخميس',
    title: 'تمرين الأثقال الحر',
    durationMin: 75,
    intensity: 'high',
    completed: false,
    videoUrl: 'https://example.com/workout-5',
    coachName: 'كابتن خالد',
    coachId: 'p1',
    thumbnail: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=700',
    exercises: barbellExercises
  }
];

// ─── Today's Schedule ───────────────────────────────────────────────────────
export const todaySchedule: ScheduledSession[] = [
  { id: 's1', time: '07:30', title: 'فحص الجاهزية', type: 'checkin', durationMin: 5, subtitle: 'سجّل نومك وحالتك', isCompleted: true, color: '#30B36A' },
  { id: 's2', time: '09:00', title: 'تمرين الصدر والترايسبس', type: 'workout', durationMin: 60, subtitle: 'كابتن خالد • 5 تمارين', isCompleted: false, workoutId: 'w1', color: '#FF5C39' },
  { id: 's3', time: '12:30', title: 'وجبة الغداء', type: 'meal', durationMin: 30, subtitle: 'سارة منير • 450 سعرة', isCompleted: false, color: '#F79A3E' },
  { id: 's4', time: '15:00', title: 'تمرين الأثقال الحر', type: 'workout', durationMin: 75, subtitle: 'كابتن خالد • 5 تمارين', isCompleted: false, workoutId: 'w5', color: '#8E5CF5' },
  { id: 's5', time: '17:00', title: 'وجبة خفيفة', type: 'meal', durationMin: 10, subtitle: 'زبادي + فواكه • 180 سعرة', isCompleted: false, color: '#F79A3E' },
  { id: 's6', time: '19:00', title: 'مراجعة أسبوعية مع المدرب', type: 'coaching', durationMin: 15, subtitle: 'كابتن خالد • متابعة التقدم', isCompleted: false, color: '#1A9ECC' }
];

// ─── Meals ──────────────────────────────────────────────────────────────────
export const todayMeals: MealItem[] = [
  { id: 'm1', mealType: 'breakfast', title: 'توست أفوكادو وبيض', calories: 320, time: '08:00 ص', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400', protein: 18, carbs: 28, fat: 14 },
  { id: 'm2', mealType: 'lunch', title: 'سلطة سلمون مشوي', calories: 450, time: '01:00 م', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', protein: 38, carbs: 22, fat: 18 },
  { id: 'm3', mealType: 'snack', title: 'زبادي يوناني وتوت', calories: 180, time: '04:00 م', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', protein: 12, carbs: 20, fat: 4 }
];

// ─── Injuries ───────────────────────────────────────────────────────────────
export const injuries: InjuryReport[] = [
  { id: 'i1', area: 'أسفل الظهر', severity: 1, status: 'monitoring', note: 'تم تعديل خطة التمرين تلقائيا لتقليل الضغط' }
];

// ─── Chat Threads ───────────────────────────────────────────────────────────
export const chats: ChatThread[] = [
  { id: 'c1', name: 'فريق الدعم المتكامل', role: 'team', lastMessage: 'شكرا لكم جميعا فريق رائع', timeLabel: '10:12 ص', unreadCount: 2, avatarColor: '#1A9ECC' },
  { id: 'c2', name: 'سارة منير', role: 'nutritionist', lastMessage: 'تأكد من القيام بمقاييس التقدم', timeLabel: 'أمس', unreadCount: 0, avatarColor: '#30B36A' },
  { id: 'c3', name: 'د. يثنى', role: 'physio', lastMessage: 'كيف كانت وجبة الغداء اليوم؟', timeLabel: 'أمس', unreadCount: 0, avatarColor: '#7C5CBF' },
  { id: 'c4', name: 'كابتن خالد', role: 'coach', lastMessage: 'هل تشعر بتحسن في الركبة؟', timeLabel: 'الاثنين', unreadCount: 1, avatarColor: '#FF5C39' }
];

// ─── Chat Messages ──────────────────────────────────────────────────────────
export const chatMessages: Record<string, ChatMessage[]> = {
  c1: [
    { id: 'm1', threadId: 'c1', senderName: 'كابتن خالد', isMe: false, text: 'صباح الخير امتنان، جاهز للتمرين اليوم؟ 💪', timeLabel: '09:00 ص', type: 'text' },
    { id: 'm2', threadId: 'c1', senderName: 'أنا', isMe: true, text: 'صباح النور! نعم جاهز ومتحمس', timeLabel: '09:05 ص', type: 'text' },
    { id: 'm3', threadId: 'c1', senderName: 'سارة منير', isMe: false, text: 'لا تنسى أكل قبل التمرين بـ 90 دقيقة 🥗', timeLabel: '09:10 ص', type: 'text' },
    { id: 'm4', threadId: 'c1', senderName: 'د. يثنى', isMe: false, text: 'وتمارين الإحماء مهمة جداً اليوم لأسفل الظهر', timeLabel: '09:15 ص', type: 'text' },
    { id: 'm5', threadId: 'c1', senderName: 'أنا', isMe: true, text: 'شكرا لكم جميعا فريق رائع 🙏', timeLabel: '10:12 ص', type: 'text' }
  ],
  c2: [
    { id: 'n1', threadId: 'c2', senderName: 'سارة منير', isMe: false, text: 'مرحبا امتنان، راجعت خطة تغذيتك هذا الأسبوع', timeLabel: 'أمس 09:00', type: 'text' },
    { id: 'n2', threadId: 'c2', senderName: 'سارة منير', isMe: false, text: 'نسبة البروتين ممتازة، لكن نحتاج زيادة الكارب قليلاً في أيام التمرين الشديد', timeLabel: 'أمس 09:01', type: 'text' },
    { id: 'n3', threadId: 'c2', senderName: 'أنا', isMe: true, text: 'حسناً، ما الأطعمة التي أضيفها؟', timeLabel: 'أمس 09:20', type: 'text' },
    { id: 'n4', threadId: 'c2', senderName: 'سارة منير', isMe: false, text: 'الشوفان قبل التمرين، أو الموز. وتأكد من القيام بمقاييس التقدم', timeLabel: 'أمس 09:30', type: 'text' }
  ],
  c3: [
    { id: 'ph1', threadId: 'c3', senderName: 'د. يثنى', isMe: false, text: 'كيف حال أسفل الظهر اليوم؟', timeLabel: 'أمس 14:00', type: 'text' },
    { id: 'ph2', threadId: 'c3', senderName: 'أنا', isMe: true, text: 'أحسن من البارحة، الألم تقلص', timeLabel: 'أمس 14:30', type: 'text' },
    { id: 'ph3', threadId: 'c3', senderName: 'د. يثنى', isMe: false, text: 'ممتاز! استمر في تمارين الكور اليومية. كيف كانت وجبة الغداء اليوم؟', timeLabel: 'أمس 15:00', type: 'text' }
  ],
  c4: [
    { id: 'co1', threadId: 'c4', senderName: 'كابتن خالد', isMe: false, text: 'أحسنت على تمرين الأمس! كان الأداء قوي جداً', timeLabel: 'الاثنين 11:00', type: 'text' },
    { id: 'co2', threadId: 'c4', senderName: 'أنا', isMe: true, text: 'شكراً كابتن، كنت مركز اليوم', timeLabel: 'الاثنين 11:15', type: 'text' },
    { id: 'co3', threadId: 'c4', senderName: 'كابتن خالد', isMe: false, text: 'هل تشعر بتحسن في الركبة؟', timeLabel: 'الاثنين 11:20', type: 'text' }
  ]
};

// ─── Professionals ──────────────────────────────────────────────────────────
export const professionals: Professional[] = [
  {
    id: 'p1',
    name: 'كابتن خالد العتيبي',
    role: 'coach',
    specialization: 'تضخيم وبناء العضلات',
    bio: 'مدرب معتمد دولياً بخبرة 10 سنوات في تدريب رياضيي القوة والبناء العضلي. تدرّب على يديه أكثر من 500 عميل.',
    rating: 4.9,
    reviewsCount: 318,
    yearsExp: 10,
    clientsCount: 520,
    pricePerMonth: 499,
    avatarInitials: 'خا',
    avatarColor: '#FF5C39',
    isSelected: true,
    badge: 'الأكثر طلباً',
    videos: [
      { id: 'v1', title: 'تمرين الصدر الكامل', thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', durationMin: 45, category: 'صدر', viewsCount: 12400 },
      { id: 'v2', title: 'بناء ظهر V شكل', thumbnail: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400', durationMin: 50, category: 'ظهر', viewsCount: 9800 },
      { id: 'v3', title: 'أرجل متفجرة - سكوات', thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', durationMin: 55, category: 'أرجل', viewsCount: 15200 },
      { id: 'v4', title: 'كارديو عالي الكثافة', thumbnail: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400', durationMin: 30, category: 'كارديو', viewsCount: 7600 }
    ]
  },
  {
    id: 'p2',
    name: 'أحمد الشهري',
    role: 'coach',
    specialization: 'إنقاص الوزن والكارديو',
    bio: 'متخصص في برامج إنقاص الوزن والتحول الجسدي. شهادة ACSM وخبرة 7 سنوات مع نتائج مثبتة.',
    rating: 4.7,
    reviewsCount: 204,
    yearsExp: 7,
    clientsCount: 380,
    pricePerMonth: 399,
    avatarInitials: 'أح',
    avatarColor: '#1A9ECC',
    videos: [
      { id: 'v5', title: 'HIIT 20 دقيقة فقط', thumbnail: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400', durationMin: 20, category: 'كارديو', viewsCount: 8200 },
      { id: 'v6', title: 'حرق الدهون للمبتدئين', thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400', durationMin: 35, category: 'كارديو', viewsCount: 11000 },
      { id: 'v7', title: 'تمارين المنزل بدون أدوات', thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', durationMin: 25, category: 'لياقة', viewsCount: 19400 }
    ]
  },
  {
    id: 'p3',
    name: 'سارة منير',
    role: 'nutritionist',
    specialization: 'تغذية رياضية وحمية علاجية',
    bio: 'أخصائية تغذية سريرية ورياضية، ماجستير في علم التغذية. متخصصة في الأنظمة الغذائية للرياضيين وبناء العضلات.',
    rating: 4.9,
    reviewsCount: 412,
    yearsExp: 8,
    clientsCount: 680,
    pricePerMonth: 349,
    avatarInitials: 'سا',
    avatarColor: '#30B36A',
    isSelected: true,
    badge: 'أفضل تقييم',
    videos: [
      { id: 'v8', title: 'وجبة ما قبل التمرين', thumbnail: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400', durationMin: 10, category: 'تغذية', viewsCount: 22000 },
      { id: 'v9', title: 'حساب البروتين اليومي', thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', durationMin: 15, category: 'تغذية', viewsCount: 18500 }
    ]
  },
  {
    id: 'p4',
    name: 'ليلى الزهراني',
    role: 'nutritionist',
    specialization: 'نظام كيتو وصيام متقطع',
    bio: 'دكتوراه في التغذية البشرية، متخصصة في الأنظمة الغذائية المتقدمة وعلاج مقاومة الأنسولين.',
    rating: 4.6,
    reviewsCount: 287,
    yearsExp: 6,
    clientsCount: 340,
    pricePerMonth: 299,
    avatarInitials: 'لي',
    avatarColor: '#F79A3E',
    videos: [
      { id: 'v10', title: 'مبادئ الكيتو للرياضيين', thumbnail: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', durationMin: 20, category: 'تغذية', viewsCount: 9300 }
    ]
  },
  {
    id: 'p5',
    name: 'د. يثنى الحربي',
    role: 'physio',
    specialization: 'إعادة التأهيل الرياضي',
    bio: 'دكتوراه في العلاج الطبيعي الرياضي. متخصصة في إعادة تأهيل إصابات الملاعب وآلام الظهر والركبة.',
    rating: 4.8,
    reviewsCount: 156,
    yearsExp: 9,
    clientsCount: 210,
    pricePerMonth: 399,
    avatarInitials: 'يث',
    avatarColor: '#7C5CBF',
    isSelected: true,
    badge: 'معتمدة',
    videos: [
      { id: 'v11', title: 'تمارين أسفل الظهر الآمنة', thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400', durationMin: 15, category: 'علاج', viewsCount: 6700 },
      { id: 'v12', title: 'إحماء الركبة للرياضيين', thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', durationMin: 12, category: 'علاج', viewsCount: 5200 }
    ]
  },
  {
    id: 'p6',
    name: 'د. فيصل القحطاني',
    role: 'physio',
    specialization: 'علاج الأكتاف والمفاصل',
    bio: 'معالج طبيعي متخصص في إصابات الأكتاف والرياضيين المحترفين. عمل مع أندية كرة قدم سعودية.',
    rating: 4.7,
    reviewsCount: 98,
    yearsExp: 11,
    clientsCount: 180,
    pricePerMonth: 449,
    avatarInitials: 'في',
    avatarColor: '#DA3D2A',
    videos: [
      { id: 'v13', title: 'تمارين تقوية الكتف', thumbnail: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=400', durationMin: 18, category: 'علاج', viewsCount: 4100 }
    ]
  }
];

// ─── Communities ────────────────────────────────────────────────────────────
export const communities: Community[] = [
  {
    id: 'com1',
    name: 'تحدي بناء العضلات 90 يوم',
    description: 'مجتمع متخصص لمن يريد بناء عضلات حقيقية خلال 90 يوماً مع كابتن خالد',
    category: 'strength',
    coachId: 'p1',
    coachName: 'كابتن خالد',
    coachInitials: 'خا',
    coachColor: '#FF5C39',
    membersCount: 1240,
    postsCount: 3820,
    isJoined: true,
    isFree: false,
    priceMonthly: 99,
    coverGradient: ['#FF4500', '#FF7A18'],
    latestPost: 'انتهيت من تمرين الصدر اليوم 💪 الأوزان تقدمت!',
    latestPostTime: 'منذ 3 دقائق'
  },
  {
    id: 'com2',
    name: 'عشاق الجري 🏃',
    description: 'لمحبي الجري والماراثونات، شارك مساراتك وإنجازاتك',
    category: 'running',
    coachId: 'p2',
    coachName: 'أحمد الشهري',
    coachInitials: 'أح',
    coachColor: '#1A9ECC',
    membersCount: 892,
    postsCount: 2100,
    isJoined: false,
    isFree: true,
    coverGradient: ['#D96010', '#FF9A00'],
    latestPost: 'ركضت 10 كم الصباح! 🔥',
    latestPostTime: 'منذ 12 دقيقة'
  },
  {
    id: 'com3',
    name: 'أكل صح مع سارة',
    description: 'وصفات صحية يومية وأسرار التغذية الرياضية مع أخصائية سارة منير',
    category: 'nutrition',
    coachId: 'p3',
    coachName: 'سارة منير',
    coachInitials: 'سا',
    coachColor: '#30B36A',
    membersCount: 2180,
    postsCount: 5400,
    isJoined: true,
    isFree: false,
    priceMonthly: 79,
    coverGradient: ['#B5FF45', '#FF7A18'],
    latestPost: 'وصفة الغداء اليوم: سلمون مع كينوا! 🥗',
    latestPostTime: 'منذ 1 ساعة'
  },
  {
    id: 'com4',
    name: 'تحدي إنقاص 10 كيلو',
    description: 'مجتمع دعم لأهداف إنقاص الوزن مع متابعة مستمرة من المدربين',
    category: 'wellness',
    coachId: 'p2',
    coachName: 'أحمد الشهري',
    coachInitials: 'أح',
    coachColor: '#1A9ECC',
    membersCount: 654,
    postsCount: 1890,
    isJoined: false,
    isFree: false,
    priceMonthly: 89,
    coverGradient: ['#FF7A18', '#FFBA5C'],
    latestPost: 'فقدت 3 كيلو هذا الشهر! شكراً للفريق',
    latestPostTime: 'منذ 2 ساعة'
  }
];

// ─── Community Posts ────────────────────────────────────────────────────────
export const communityPosts: Record<string, CommunityPost[]> = {
  com1: [
    { id: 'cp1', communityId: 'com1', authorName: 'كابتن خالد', authorInitials: 'خا', authorColor: '#FF5C39', isCoach: true, text: '🎯 تمرين اليوم: تمرين الصدر الكامل\n\nركزوا على التحكم بالوزن ومد العضلة كامل. شاهدوا الفيديو في التطبيق 💪', timeLabel: 'منذ 30 دقيقة', likesCount: 124, commentsCount: 18, imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600', isLiked: false },
    { id: 'cp2', communityId: 'com1', authorName: 'محمد الغامدي', authorInitials: 'مح', authorColor: '#1A9ECC', isCoach: false, text: 'انتهيت من تمرين الصدر اليوم 💪 أضفت 5 كيلو على البنش بريس مقارنة الأسبوع الماضي! التقدم واضح', timeLabel: 'منذ 3 دقائق', likesCount: 43, commentsCount: 7, isLiked: true },
    { id: 'cp3', communityId: 'com1', authorName: 'فهد الدوسري', authorInitials: 'فه', authorColor: '#30B36A', isCoach: false, text: 'سؤال للكابتن: هل أضيف تمرين ترايسبس إضافي في نهاية الجلسة؟', timeLabel: 'منذ 1 ساعة', likesCount: 12, commentsCount: 3 },
    { id: 'cp4', communityId: 'com1', authorName: 'كابتن خالد', authorInitials: 'خا', authorColor: '#FF5C39', isCoach: true, text: '📊 نتائج الأسبوع الثالث:\n✅ 89% من الأعضاء أكملوا التمارين\n💪 متوسط زيادة الأوزان: 8%\n🏆 الأسبوع القادم: تقييم شامل', timeLabel: 'منذ 2 ساعة', likesCount: 198, commentsCount: 34, isLiked: false }
  ],
  com3: [
    { id: 'cp5', communityId: 'com3', authorName: 'سارة منير', authorInitials: 'سا', authorColor: '#30B36A', isCoach: true, text: '🥗 وصفة اليوم: سلمون مع الكينوا\n\nمكونات: سلمون 150ج، كينوا نصف كوب، خضروات مشكلة\n\nسعرات: 450 • بروتين: 38ج • كارب: 32ج\n\nالتحضير 15 دقيقة فقط!', timeLabel: 'منذ 1 ساعة', likesCount: 312, commentsCount: 45, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600', isLiked: true },
    { id: 'cp6', communityId: 'com3', authorName: 'نورة العنزي', authorInitials: 'نو', authorColor: '#7C5CBF', isCoach: false, text: 'جربت وصفة أمس 😍 الطعم رائع والشبع لساعات طويلة', timeLabel: 'منذ 45 دقيقة', likesCount: 67, commentsCount: 8, isLiked: false }
  ]
};

// ─── Store Items ────────────────────────────────────────────────────────────
export const storeItems: StoreItem[] = [
  { id: 'si1', name: 'برنامج بناء العضلات 90 يوم', description: 'برنامج شامل مع كابتن خالد: 4 تمارين أسبوعياً، فيديوهات احترافية، متابعة مستمرة', price: 799, originalPrice: 1200, category: 'program', imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500', rating: 4.9, reviewsCount: 234, coachName: 'كابتن خالد', isFeatured: true, durationWeeks: 12, tag: 'الأكثر مبيعاً' },
  { id: 'si2', name: 'برنامج إنقاص الوزن الذكي', description: 'برنامج HIIT + تغذية متكاملة من أحمد الشهري وسارة منير معاً، نتائج مضمونة', price: 599, originalPrice: 899, category: 'program', imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500', rating: 4.7, reviewsCount: 189, coachName: 'أحمد الشهري', durationWeeks: 8, tag: 'خصم 33%' },
  { id: 'si3', name: 'استشارة تغذية شهرية', description: 'خطة غذائية مخصصة + متابعة أسبوعية + تعديلات مستمرة مع سارة منير', price: 349, category: 'consultation', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500', rating: 4.9, reviewsCount: 412, coachName: 'سارة منير' },
  { id: 'si4', name: 'جلسة علاج طبيعي فردية', description: 'جلسة تأهيل مخصصة مع د. يثنى لمشاكل الظهر والمفاصل - أونلاين أو حضور', price: 250, category: 'consultation', imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500', rating: 4.8, reviewsCount: 98, coachName: 'د. يثنى' },
  { id: 'si5', name: 'بروتين واي - 2 كيلو', description: 'بروتين واي عالي الجودة، 25ج بروتين لكل وجبة، شوكولاتة وفانيلا وفراولة', price: 189, originalPrice: 229, category: 'supplement', imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500', rating: 4.5, reviewsCount: 567, tag: 'خصم 18%' },
  { id: 'si6', name: 'أحزمة رفع الأثقال المهنية', description: 'أحزمة جلد أصلية لحماية أسفل الظهر أثناء التمرين، مقاس قابل للتعديل', price: 149, category: 'equipment', imageUrl: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=500', rating: 4.3, reviewsCount: 134 },
  { id: 'si7', name: 'برنامج ماراثون 10 كم', description: 'تدريب تدريجي لمدة 8 أسابيع للوصول لـ 10 كم مع أحمد الشهري، مناسب للمبتدئين', price: 449, category: 'program', imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=500', rating: 4.6, reviewsCount: 78, coachName: 'أحمد الشهري', durationWeeks: 8 },
  { id: 'si8', name: 'كريتين مونوهيدرات', description: 'كريتين نقي 100%، يساعد على زيادة القوة والأداء الرياضي', price: 89, category: 'supplement', imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500', rating: 4.6, reviewsCount: 289 }
];

// ─── Health Snapshot ────────────────────────────────────────────────────────
export const healthSnapshot: HealthSnapshot = {
  readinessPercent: 75,
  sleepHours: 7.4,
  steps: 9044,
  heartRate: 68
};

export const adminConfig: AdminConfig = {
  workoutPlanVersion: 'v2.4',
  nutritionPlanVersion: 'v1.9',
  challengesEnabled: true
};

// ─── Run History ────────────────────────────────────────────────────────────
export const runHistory: RunSession[] = [
  { id: 'r1', date: '2026-04-18', dateLabel: 'أمس', durationSec: 2340, distanceKm: 5.2, avgPaceSecPerKm: 450, calories: 398, avgHeartRate: 152, steps: 6890 },
  { id: 'r2', date: '2026-04-16', dateLabel: 'الثلاثاء', durationSec: 1860, distanceKm: 3.8, avgPaceSecPerKm: 489, calories: 291, avgHeartRate: 145, steps: 5020 },
  { id: 'r3', date: '2026-04-14', dateLabel: 'الأحد', durationSec: 3120, distanceKm: 7.1, avgPaceSecPerKm: 440, calories: 543, avgHeartRate: 158, steps: 9380 },
  { id: 'r4', date: '2026-04-11', dateLabel: 'الخميس', durationSec: 2580, distanceKm: 6.0, avgPaceSecPerKm: 430, calories: 459, avgHeartRate: 155, steps: 7920 },
  { id: 'r5', date: '2026-04-09', dateLabel: 'الثلاثاء', durationSec: 1680, distanceKm: 3.5, avgPaceSecPerKm: 480, calories: 268, avgHeartRate: 142, steps: 4630 }
];

// ─── Weekly Progress ────────────────────────────────────────────────────────
export const weeklyProgress: WeeklyProgressDay[] = [
  { dayShort: 'أح', steps: 9044, stepsGoal: 10000, workoutDone: true, caloriesBurned: 520, runKm: 0 },
  { dayShort: 'إث', steps: 7800, stepsGoal: 10000, workoutDone: true, caloriesBurned: 480, runKm: 3.8 },
  { dayShort: 'ثل', steps: 5200, stepsGoal: 10000, workoutDone: false, caloriesBurned: 290, runKm: 0 },
  { dayShort: 'أر', steps: 11200, stepsGoal: 10000, workoutDone: true, caloriesBurned: 650, runKm: 5.2 },
  { dayShort: 'خم', steps: 6400, stepsGoal: 10000, workoutDone: false, caloriesBurned: 310, runKm: 0 },
  { dayShort: 'جم', steps: 8900, stepsGoal: 10000, workoutDone: false, caloriesBurned: 420, runKm: 0 },
  { dayShort: 'سب', steps: 4100, stepsGoal: 10000, workoutDone: false, caloriesBurned: 180, runKm: 0 }
];

// ─── Body Measurements ──────────────────────────────────────────────────────
export const bodyMeasurements: BodyMeasurement[] = [
  { date: 'يناير', weightKg: 85.2, bodyFatPct: 22.4 },
  { date: 'فبراير', weightKg: 84.1, bodyFatPct: 21.8 },
  { date: 'مارس', weightKg: 83.0, bodyFatPct: 21.1 },
  { date: 'أبريل', weightKg: 82.1, bodyFatPct: 20.5 }
];

// ─── Leaderboard ────────────────────────────────────────────────────────────
export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'أحمد العتيبي', avatar: 'أح', weeklyPoints: 1840, streak: 21 },
  { rank: 2, name: 'محمد الغامدي', avatar: 'مح', weeklyPoints: 1720, streak: 14 },
  { rank: 3, name: 'امتنان', avatar: 'إم', weeklyPoints: 1590, streak: 6, isMe: true },
  { rank: 4, name: 'سارة الحربي', avatar: 'سا', weeklyPoints: 1420, streak: 9 },
  { rank: 5, name: 'خالد الدوسري', avatar: 'خا', weeklyPoints: 1310, streak: 12 }
];

// ─── User Profile ───────────────────────────────────────────────────────────
export const userProfile: UserProfile = {
  name: 'امتنان',
  email: 'imtnan@move.sa',
  goal: 'muscle-gain',
  joinDate: '2026-01-15',
  avatarInitials: 'إم',
  currentWeight: 82.1,
  targetWeight: 78,
  height: 168,
  age: 26,
  selectedCoachId: 'p1',
  selectedNutritionistId: 'p3',
  selectedPhysioId: 'p5',
  xpPoints: 340,
  xpToNextLevel: 500,
  level: 12,
};

// ─── Social / Map ────────────────────────────────────────────────────────────

export const nearbyUsers: NearbyUser[] = [
  { id: 'n1', initials: 'أم', name: 'أمجد المطيري', sport: 'run',   distanceM: 280,  isLive: true,  color: '#FF6B35', posX: 32, posY: 22 },
  { id: 'n2', initials: 'سع', name: 'سعود الحارثي', sport: 'lift',  distanceM: 450,  isLive: false, color: '#5E81F4', posX: 64, posY: 38 },
  { id: 'n3', initials: 'رش', name: 'رشيد القحطاني',sport: 'yoga',  distanceM: 680,  isLive: true,  color: '#8E5CF5', posX: 18, posY: 56 },
  { id: 'n4', initials: 'خل', name: 'خالد العنزي',  sport: 'cycle', distanceM: 1100, isLive: false, color: '#00BFA5', posX: 78, posY: 64 },
  { id: 'n5', initials: 'فه', name: 'فهد الدوسري',  sport: 'run',   distanceM: 1380, isLive: true,  color: '#FF4500', posX: 48, posY: 74 },
  { id: 'n6', initials: 'نو', name: 'نورة الشمري',  sport: 'yoga',  distanceM: 920,  isLive: false, color: '#FF69B4', posX: 82, posY: 28 },
  { id: 'n7', initials: 'عب', name: 'عبدالله العتيبي',sport: 'lift', distanceM: 760, isLive: true,  color: '#26C6DA', posX: 55, posY: 48 },
];

export const feedPosts: FeedPost[] = [
  {
    id: 'f1', userId: 'n1', userName: 'أمجد المطيري', userInitials: 'أم', userColor: '#FF6B35',
    sport: 'run', activityType: 'pr',
    headline: 'سجّل رقماً قياسياً جديداً في 5 كم',
    subtext: 'أسرع من سجله السابق بـ 1:24 دقيقة',
    metric: '24:18', metricLabel: 'دقيقة',
    timeLabel: 'منذ 12 دقيقة', likesCount: 47, commentsCount: 8, isLiked: false,
    pointsEarned: 150, isPR: true,
    imageUrl: 'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=800'
  },
  {
    id: 'f2', userId: 'n2', userName: 'سعود الحارثي', userInitials: 'سع', userColor: '#5E81F4',
    sport: 'lift', activityType: 'workout',
    headline: 'أتمّ تمرين الصدر والترايسبس',
    subtext: 'حجم إجمالي: 8,400 كغ — 5 تمارين',
    metric: '65', metricLabel: 'دقيقة',
    timeLabel: 'منذ 34 دقيقة', likesCount: 23, commentsCount: 3, isLiked: true,
    pointsEarned: 80,
  },
  {
    id: 'f3', userId: 'n3', userName: 'رشيد القحطاني', userInitials: 'رش', userColor: '#8E5CF5',
    sport: 'yoga', activityType: 'milestone',
    headline: 'أكمل 30 يوماً من تحدي اليوغا',
    subtext: 'إنجاز غير عادي، واصل الزخم',
    timeLabel: 'منذ ساعتين', likesCount: 112, commentsCount: 14, isLiked: false,
    pointsEarned: 500,
  },
  {
    id: 'f4', userId: 'n6', userName: 'نورة الشمري', userInitials: 'نو', userColor: '#FF69B4',
    sport: 'run', activityType: 'run',
    headline: 'ركضت 8.4 كم صباحاً',
    subtext: 'معدل الإيقاع: 5:12 دقيقة/كم',
    metric: '8.4', metricLabel: 'كم',
    timeLabel: 'منذ 3 ساعات', likesCount: 31, commentsCount: 5, isLiked: false,
    pointsEarned: 95,
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800'
  },
  {
    id: 'f5', userId: 'n7', userName: 'عبدالله العتيبي', userInitials: 'عب', userColor: '#26C6DA',
    sport: 'lift', activityType: 'pr',
    headline: 'رقم قياسي جديد في السكوات',
    subtext: '140 كغ × 5 تكرارات — مسيرة قوة',
    metric: '140', metricLabel: 'كغ',
    timeLabel: 'منذ 5 ساعات', likesCount: 88, commentsCount: 12, isLiked: true,
    pointsEarned: 200, isPR: true,
  },
];

export const myPostGrid: UserPostGrid[] = [
  { id: 'pg1', imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',  type: 'workout',   likesCount: 34 },
  { id: 'pg2', imageUrl: 'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=400',  type: 'run',       likesCount: 56 },
  { id: 'pg3', imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400',  type: 'run',       likesCount: 21 },
  { id: 'pg4', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',  type: 'workout',   likesCount: 45 },
  { id: 'pg5', imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400',     type: 'milestone', likesCount: 78 },
  { id: 'pg6', imageUrl: 'https://images.unsplash.com/photo-1583454155184-870a1f63aebc?w=400',  type: 'workout',   likesCount: 29 },
  { id: 'pg7', imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',  type: 'meal',      likesCount: 18 },
  { id: 'pg8', imageUrl: 'https://images.unsplash.com/photo-1516748088049-71b9c5e9f73b?w=400',  type: 'workout',   likesCount: 37 },
  { id: 'pg9', imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400',  type: 'workout',   likesCount: 42 },
];
