
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

// === show alert when a notification arrives (foreground) ==========
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// === 50 cheery volunteer / quote messages =========================
const MESSAGES = [
  "Good morning 🌞  Ready to make a difference today?",
  "Rise & shine! The world could use your kindness.",
  "Small acts, big impact. Volunteer on!",
  "Be the reason someone smiles today 😊",
  "Service to others is the rent you pay for your room here on Earth.",
  "Coffee ☕ + compassion = unstoppable you.",
  "Your hands can lift more than weights—they lift spirits.",
  "Volunteers don’t get paid because they’re priceless!",
  "Every action counts. Make yours heroic.",
  "Helping others is self-care in disguise.",
  "Good noon! A perfect time for a good deed.",
  "Your lunchtime reminder to feed both body & soul.",
  "Kind hearts are the gardens, kind deeds are the seeds.",
  "Volunteer: the ultimate power-up for humanity!",
  "A single act of kindness throws out roots in all directions.",
  "Do what you can, where you are. — T. Roosevelt",
  "Change the world by being yourself.",
  "Opportunity for kindness is everywhere.",
  "Service is the shortcut to happiness.",
  "Give a little. Help a lot.",
  "Heroes wear name-tags too.",
  "The earth laughs in flowers—plant some hope today.",
  "Gratitude turns what we have into enough.",
  "Empathy is your super-power 🦸",
  "Acts of kindness: unlimited lives, no cooldowns!",
  "Who knew changing lives could fit in your afternoon?",
  "Hello sunshine ☀️  Spread it around.",
  "No cape required—just show up.",
  "Giving is living. Breathe deeply.",
  "Take a break, take a stand, lend a hand.",
  "Your effort today = someone’s bright memory tomorrow.",
  "Evenings are for reflection—and maybe a quick good deed.",
  "You make the planet better just by caring.",
  "Service is love made visible.",
  "Volunteering: the after-work glow-up.",
  "Happiness is best served shared 🍰",
  "A kindness a day keeps the gloom away.",
  "Listening is the beginning of generosity.",
  "Ready for round two? Kindness never tires.",
  "Compassion is a language everyone understands.",
  "Change begins at 5 p.m.—see you out there!",
  "Your community is your gym. Exercise kindness.",
  "Turn empathy into action tonight.",
  "Dream big, act bigger.",
  "One life touched = mission accomplished.",
  "End the day knowing you made it count. 🌟",
  "Kindness never goes out of style.",
  "Share your super-power today.",
  "Volunteers are love in motion.",
  "Finish strong—help someone!",
];

// ========= Permission & channel helper ===========================
export async function registerForLocalPushAsync(): Promise<boolean> {
  if (Platform.OS === "android") {
    // a channel is *required* on Android 13+ for the prompt to appear
    await Notifications.setNotificationChannelAsync("nexolink-daily", {
      name: "Daily greetings",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  if (!Device.isDevice) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  const finalStatus =
    existingStatus === "granted"
      ? existingStatus
      : (await Notifications.requestPermissionsAsync()).status;

  return finalStatus === "granted";
}

// ========= schedule or reschedule the three daily pushes =========
export async function scheduleDailyGreetings() {
  // clear any previous schedules from this helper
  const prev = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of prev)
    if (n.identifier?.startsWith("nexolink_daily_"))
      await Notifications.cancelScheduledNotificationAsync(n.identifier);

  const times = [
    { id: "nexolink_daily_0700", hour: 7, minute: 0 },
    { id: "nexolink_daily_1200", hour: 12, minute: 0 },
    { id: "nexolink_daily_1700", hour: 17, minute: 0 },
  ];

  await Promise.all(
    times.map(({ id, hour, minute }) =>
      Notifications.scheduleNotificationAsync({
        identifier: id,
        content: {
          title: "NexoLink",
          body: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
          sound: "default",
        },
        trigger: {
          // 👇 key line that fixes the TS complaint
          type: "daily",          // or Notifications.TriggerType.DAILY
          hour,
          minute,
          repeats: true,
        } satisfies Notifications.DailyTriggerInput,
      })
    )
  )}
