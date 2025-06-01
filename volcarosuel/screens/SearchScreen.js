// SearchScreen.js

import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  FlatList,
  ImageBackground,
  Platform,
  StatusBar,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Animated,
  Keyboard,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../../auth/AuthContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─── EXACT DIMENSIONS ────────────────────────────────────────────────
// (All of these remain exactly as before; we’re not touching them.)
const SEARCH_BAR_HEIGHT = 50;
const SEARCH_BAR_BORDER_RADIUS = 25;
const SEARCH_BAR_HORIZONTAL_MARGIN = 20;

const SECTION_TOP_MARGIN = 16;
const SECTION_SIDE_MARGIN = 20;
const SECTION_FONT_SIZE = 24;

const PILL_HEIGHT = 40;
const PILL_BORDER_RADIUS = 20;
const PILL_HORIZONTAL_PADDING = 20;
const PILL_SPACING = 12;
const PILL_FONT_SIZE = 16;

const CARD_WIDTH = SCREEN_WIDTH * 0.6;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.45;
const CARD_BORDER_RADIUS = 20;
const CARD_GAP = 16;

const SEE_MORE_HEIGHT = 52;
const SEE_MORE_BORDER_RADIUS = 26;
const SEE_MORE_HORIZONTAL_PADDING = 24;

const PROFILE_IMAGE_SIZE = 68;
const HEART_DIAMETER = 36;

// ─── NEW CATEGORY ARRAY ──────────────────────────────────────────────
// Each object now has an `id`, `title`, `icon`, and `reference`.
const categories = [
  { id: "1", title: "Animals",    icon: "paw-outline",          reference: "Animal" },
  { id: "2", title: "Arts",       icon: "color-palette-outline", reference: "Arts" },
  { id: "6", title: "Education",  icon: "school-outline",        reference: "Education" },
  { id: "7", title: "Environment",icon: "leaf-outline",          reference: "Environment" },
  { id: "4", title: "Family",     icon: "people-circle-outline",  reference: "Family" },
  { id: "8", title: "Hospital",   icon: "medkit-outline",         reference: "Hospital" },
  { id: "9", title: "Library",    icon: "book-outline",           reference: "Library" },
  { id: "11", title: "Seniors",   icon: "walk-outline",           reference: "Seniors" },
  { id: "5", title: "Tech",       icon: "laptop-outline",         reference: "Tech" },
];

// Trip cards (hard‐code California first, then two others)
const defaultTrips = [
  {
    id: "CA",
    name: "California",
    image:
      "https://images.unsplash.com/photo-1500048993953-cfaebf7bf6f3?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "2",
    name: "Paris",
    image:
      "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=60",
  },
  {
    id: "3",
    name: "Tokyo",
    image:
      "https://images.unsplash.com/photo-1568817410669-212e17f42d20?auto=format&fit=crop&w=800&q=60",
  },
];

// Replace with your own secure mechanism
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

export default function SearchScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  // References for scrolling & animation
  const carouselRef = useRef(null);
  const chatScrollRef = useRef(null);

  // Animate overlay fade‐in/out
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Theme palette (optional)
  const DEFAULT_PALETTE = ["#F8F9FA", "#FFF0D4", "#FFE8C9", "#333"];
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [loadingTheme, setLoadingTheme] = useState(true);

  // Chatbot states
  const [showChatbot, setShowChatbot] = useState(false);
  const [databaseMode, setDatabaseMode] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      text:
        "Hello! I'm your NexoLink assistant. How can I help you find volunteer opportunities today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // “Trips” plus favorite IDs
  const [trips, setTrips] = useState(defaultTrips);
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Currently‐selected category pill → store the actual `reference` string
  // Default to the first category’s `reference` ("Animal").
  const [selectedCategory, setSelectedCategory] = useState(categories[0].reference);

  // Currently‐selected state code (e.g. “CA”)
  const [selectedStateCode, setSelectedStateCode] = useState("CA");

  // Simple bottom‐sheet notification state (fade in/out)
  const [bottomSheetMsg, setBottomSheetMsg] = useState("");
  const bottomSheetOpacity = useRef(new Animated.Value(0)).current;

  // ─── Load user-specific theme (if any):
  useEffect(() => {
    if (!user) {
      setLoadingTheme(false);
      return;
    }
    AsyncStorage.getItem(`@shop/active-${user.uid}`)
      .then((id) => {
        if (!id) return;
        // Example: load from theme packs if needed
        // …
      })
      .catch(console.warn)
      .finally(() => setLoadingTheme(false));
  }, [user]);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("@nexolink/favorites");
        if (stored) {
          const favArray = JSON.parse(stored);
          setFavoriteIds(favArray);
          reorderTrips(favArray);
        }
      } catch (err) {
        console.warn("Failed to load favorites:", err);
      }
    })();
  }, []);

  // Utility: reorder trips so favorites appear first
  const reorderTrips = useCallback((favArray) => {
    const favSet = new Set(favArray);
    const favItems = defaultTrips.filter((t) => favSet.has(t.id));
    const otherItems = defaultTrips.filter((t) => !favSet.has(t.id));
    setTrips([...favItems, ...otherItems]);
  }, []);

  // On mount: scroll carousel to first card
  useEffect(() => {
    setTimeout(() => {
      carouselRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, 50);
  }, []);

  // Auto‐scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 1) {
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Animate overlay fade‐in when showChatbot becomes true
  useEffect(() => {
    if (showChatbot) {
      overlayOpacity.setValue(0);
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 250, // 250ms fade in
        useNativeDriver: true,
      }).start();
    }
  }, [showChatbot]);

  // Animate bottom‐sheet in/out
  const showBottomSheet = (msg) => {
    setBottomSheetMsg(msg);
    bottomSheetOpacity.setValue(0);
    Animated.timing(bottomSheetOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      // hide after 2 seconds
      setTimeout(() => {
        Animated.timing(bottomSheetOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }, 2000);
    });
  };

  // Open chat overlay
  const openChatbot = () => {
    setShowChatbot(true);
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 1000, // 1 second fade in
      useNativeDriver: true,
    }).start();
  };
  // Close chat overlay with 250ms fade out
  const closeChatbot = () => {
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowChatbot(false);
      setIsTyping(false);
      setInputText("");
      Keyboard.dismiss();
    });
  };

  // Toggle database mode, show bottom‐sheet notification
  const toggleDatabaseMode = () => {
    setDatabaseMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        showBottomSheet("Search functionality enhanced");
      } else {
        showBottomSheet("Search functionality back to normal");
      }
      return newMode;
    });
  };

  // Send user message + call OpenAI, then append bot response
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Build conversation array for ChatGPT
    const chatHistory = messages.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));
    chatHistory.push({ role: "user", content: userMessage.text });

    // Prepend a system prompt if databaseMode is on
    const systemPrompt = databaseMode
      ? {
          role: "system",
          content:
            "You are a volunteer-focused assistant with access to volunteer opportunity data. Answer accordingly.",
        }
      : {
          role: "system",
          content:
            "You are a friendly assistant who helps users find volunteer opportunities and answer general volunteering questions.",
        };

    const fullMessages = [systemPrompt, ...chatHistory];

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: fullMessages,
            temperature: 0.7,
            max_tokens: 512,
          }),
        }
      );
      const data = await response.json();
      const botText =
        data.choices?.[0]?.message?.content?.trim() ||
        "Sorry, I didn't catch that.";

      const botMessage = {
        id: Date.now() + 1,
        text: botText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.warn("OpenAI Error:", err);
      const errorMsg = {
        id: Date.now() + 2,
        text: "Sorry, something went wrong. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle “See more” inside a trip card → Carousel screen
  // We pass both the selected volunteer category (reference) and the selected state code
  const handleSeeMore = (tripItem) => {
    navigation.navigate("Carousel", {
      category: selectedCategory,   // e.g. "Animal", "Tech", etc.
      stateCode: selectedStateCode, // e.g. "CA"
      locationId: tripItem.id,
      locationName: tripItem.name,
    });
  };

  // Toggle favorite for a given trip ID
  const toggleFavorite = async (tripId) => {
    let updatedFavs = [];
    if (favoriteIds.includes(tripId)) {
      updatedFavs = favoriteIds.filter((id) => id !== tripId);
    } else {
      updatedFavs = [...favoriteIds, tripId];
    }
    setFavoriteIds(updatedFavs);
    reorderTrips(updatedFavs);

    try {
      await AsyncStorage.setItem(
        "@nexolink/favorites",
        JSON.stringify(updatedFavs)
      );
    } catch (err) {
      console.warn("Failed to save favorites:", err);
    }
  };

  // Render a single chat message bubble
  const renderMessage = ({ item }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.botMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.botText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  // Render one category pill (now using the new object structure)
  const renderCategory = ({ item }) => {
    const isSelected = item.reference === selectedCategory;
    return (
      <TouchableOpacity
        onPress={() => setSelectedCategory(item.reference)}
        style={[
          styles.pill,
          isSelected && styles.pillSelected,
          { marginRight: PILL_SPACING },
        ]}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name={item.icon}
            size={16}
            color={isSelected ? "#fff" : "#666"}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render a single trip card
  const renderTripCard = ({ item }) => {
    const isFav = favoriteIds.includes(item.id);
    return (
      <View style={[styles.cardContainer, { marginRight: CARD_GAP }]}>
        <ImageBackground
          source={{ uri: item.image }}
          style={styles.cardImage}
          imageStyle={styles.cardImageStyle}
        >
          {/* “See more” at bottom */}
          <View style={styles.cardInfoContainer}>
            <Text style={styles.destinationText}>{item.name}</Text>
            <TouchableOpacity
              style={styles.seeMoreContainer}
              onPress={() => handleSeeMore(item)}
              activeOpacity={0.8}
            >
              <View style={styles.seeMoreWrapper}>
                <Text style={styles.seeMoreText}>See more</Text>
                <View style={styles.seeMoreCircle}>
                  <AntDesign name="arrowright" size={18} color="#000" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Heart icon top‐right */}
          <TouchableOpacity
            style={styles.heartContainer}
            onPress={() => toggleFavorite(item.id)}
            activeOpacity={0.8}
          >
            {isFav ? (
              <AntDesign name="heart" size={24} color="#E53935" />
            ) : (
              <AntDesign name="hearto" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </ImageBackground>
      </View>
    );
  };

  // If theme is loading, show a spinner (white background, gray spinner)
  if (loadingTheme) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: "#FFFFFF" }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DEFAULT_PALETTE[3]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: "#F8F9FA" }]}>
      {/* ─── TOP BAR ─────────────────────────────────────────────── */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>Hello,</Text>
          <Text style={styles.welcomeText}>Welcome to NexoLink</Text>
        </View>

        <TouchableOpacity
          style={styles.profileImageContainer}
          activeOpacity={0.8}
        >
          {/* Placeholder image; replace as needed */}
          <Image
            source={require("../../assets/spaceship.png")}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        {/* Tapping this opens chat overlay */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={openChatbot}
          style={[
            styles.searchBar,
            {
              borderRadius: SEARCH_BAR_BORDER_RADIUS,
              height: SEARCH_BAR_HEIGHT,
              zIndex: 10, // higher z-index so it stays on top
            },
          ]}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color="#999"
            style={{ marginLeft: 16, marginRight: 8 }}
          />
          <Text style={styles.searchPlaceholder}>Ask me anything…</Text>
        </TouchableOpacity>

        {/* Database mode toggle button (collapsed state only) */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              width: SEARCH_BAR_HEIGHT,
              height: SEARCH_BAR_HEIGHT,
              borderRadius: SEARCH_BAR_BORDER_RADIUS,
            },
            databaseMode && styles.databaseModeActiveButton,
          ]}
          activeOpacity={0.8}
          onPress={toggleDatabaseMode}
        >
          <Ionicons
            name={databaseMode ? "server" : "server-outline"}
            size={20}
            color={databaseMode ? "#000" : "#fff"}
          />
        </TouchableOpacity>
      </View>

      {/* ─── “Volunteer Causes” TITLE ───────────────────── */}
      <View
        style={[
          styles.sectionHeader,
          {
            marginTop: SECTION_TOP_MARGIN + 10,
            marginHorizontal: SECTION_SIDE_MARGIN,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { fontSize: SECTION_FONT_SIZE }]}>
          Volunteer Causes
        </Text>
      </View>

      {/* ─── CATEGORY PILLS ────────────────────────────── */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={{ paddingHorizontal: SECTION_SIDE_MARGIN }}
        />
      </View>

      {/* ─── OVERLAPPING CARDS CAROUSEL ─────────────────── */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={carouselRef}
          data={trips}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_GAP}
          decelerationRate="fast"
          keyExtractor={(item) => item.id}
          renderItem={renderTripCard}
          contentContainerStyle={{
            paddingLeft: SECTION_SIDE_MARGIN,
            paddingBottom: 40,
          }}
        />
      </View>

      {/* ─── SIMPLE BOTTOM‐SHEET NOTIFICATION ───────────── */}
      {bottomSheetMsg ? (
        <Animated.View
          style={[
            styles.bottomSheetNotification,
            { opacity: bottomSheetOpacity },
          ]}
        >
          <Text style={styles.bottomSheetText}>{bottomSheetMsg}</Text>
        </Animated.View>
      ) : null}

      {/* ─── CHATBOT OVERLAY ─────────────────────────────── */}
      {showChatbot && (
        <Animated.View
          style={[styles.chatbotOverlay, { opacity: overlayOpacity }]}
        >
          <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.chatbotContainer}
            >
              {/* HEADER: Centered “Ordix” + X button */}
              <View style={styles.centeredHeaderWithClose}>
                <Text style={styles.ordixTitle}>Ordix</Text>
                <TouchableOpacity
                  style={styles.overlayCloseButton}
                  onPress={closeChatbot}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* MESSAGES LIST */}
              <FlatList
                ref={chatScrollRef}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMessage}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
              />

              {/* TYPING INDICATOR */}
              {isTyping && (
                <View style={styles.typingContainer}>
                  <View style={styles.typingBubble}>
                    <View style={styles.typingDots}>
                      <View style={[styles.typingDot, styles.typingDot1]} />
                      <View style={[styles.typingDot, styles.typingDot2]} />
                      <View style={[styles.typingDot, styles.typingDot3]} />
                    </View>
                  </View>
                </View>
              )}

              {/* BOTTOM INPUT ROW (blurred) */}
              <BlurView
                intensity={30}
                tint="light"
                style={styles.inputContainer}
              >
                <TextInput
                  style={styles.chatInput}
                  placeholder="Type a message…"
                  placeholderTextColor="#999"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                  onSubmitEditing={sendMessage}
                  keyboardAppearance="dark"
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    inputText.trim() && styles.sendButtonActive,
                  ]}
                  onPress={sendMessage}
                  disabled={!inputText.trim()}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color={inputText.trim() ? "#fff" : "#999"}
                  />
                </TouchableOpacity>
              </BlurView>
            </KeyboardAvoidingView>
          </BlurView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

// ─── STYLES (unchanged from your original) ───────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ─── HEADER (“Hello,” + “Welcome to NexoLink” + Profile icon) ───
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
    zIndex: 5,
  },
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
  },
  profileImageContainer: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  // ─── TOP BAR (Search/Chat opener + DB toggle) ───────────────────
  searchContainer: {
    flexDirection: "row",
    marginTop: 24,
    paddingHorizontal: SEARCH_BAR_HORIZONTAL_MARGIN,
    alignItems: "center",
    zIndex: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchPlaceholder: {
    color: "#999",
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 12,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    // add subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  databaseModeActiveButton: {
    backgroundColor: "#fff",
  },

  // ─── “Volunteer Causes” TITLE ────────────────────────────────
  sectionHeader: {
    // margins set inline
  },
  sectionTitle: {
    fontWeight: "700",
    color: "#111",
  },

  // ─── CATEGORY PILLS ────────────────────────────────────────
  categoriesWrapper: {
    marginTop: 20,
  },
  pill: {
    height: PILL_HEIGHT,
    borderRadius: PILL_BORDER_RADIUS,
    paddingHorizontal: PILL_HORIZONTAL_PADDING,
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pillSelected: {
    backgroundColor: "#000",
  },
  pillText: {
    fontSize: PILL_FONT_SIZE,
    color: "#666",
    fontWeight: "500",
  },
  pillTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },

  // ─── OVERLAPPING CARDS CAROUSEL ──────────────────────────────
  carouselContainer: {
    flex: 1,
    marginTop: 40,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_BORDER_RADIUS,
    overflow: "hidden",
    backgroundColor: "#eee",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  cardImage: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cardImageStyle: {
    borderRadius: CARD_BORDER_RADIUS,
  },
  cardInfoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  destinationText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  heartContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    width: HEART_DIAMETER,
    height: HEART_DIAMETER,
    borderRadius: HEART_DIAMETER / 2,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  seeMoreContainer: {
    alignSelf: "flex-start",
  },
  seeMoreWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: SEE_MORE_BORDER_RADIUS,
    height: SEE_MORE_HEIGHT,
    paddingLeft: SEE_MORE_HORIZONTAL_PADDING,
    paddingRight: 8,
  },
  seeMoreText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  seeMoreCircle: {
    backgroundColor: "#fff",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },

  // ─── SIMPLE BOTTOM‐SHEET NOTIFICATION ─────────────
  bottomSheetNotification: {
    position: "absolute",
    marginTop: 90,
    left: 20,
    right: 20,
    backgroundColor: "black",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSheetText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },

  // ─── CHATBOT OVERLAY ────────────────────────────────────
  chatbotOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  chatbotContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingTop:
      Platform.OS === "android" ? StatusBar.currentHeight + 20 : 60,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    paddingHorizontal: 20,
  },

  centeredHeaderWithClose: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 16,
    marginBottom: 16,
  },
  ordixTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  overlayCloseButton: {
    position: "absolute",
    right: 16,
    top: 12, // center vertically
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ─── MESSAGES ────────────────────────────────────────────
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  botMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 6,
  },
  botBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: "#fff",
  },
  botText: {
    color: "#333",
  },

  // ─── TYPING INDICATOR ────────────────────────────────────
  typingContainer: {
    alignItems: "flex-start",
    marginVertical: 8,
  },
  typingBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#999",
    marginHorizontal: 2,
  },
  typingDot1: {
    // animate if desired
  },
  typingDot2: {
    // animate if desired
  },
  typingDot3: {
    // animate if desired
  },

  // ─── BOTTOM INPUT ROW (blurred) ─────────────────────────
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginTop: 16,
  },
  chatInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
    paddingHorizontal: 16,
    top:0,
    marginBottom:13
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom:10
  },
  sendButtonActive: {
    backgroundColor: "#007AFF",
  },
});
