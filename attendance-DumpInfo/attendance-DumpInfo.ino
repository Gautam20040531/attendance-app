#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiManager.h> 
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 5
#define RST_PIN 22
#define RED_LED 14   // ফিউচার আপডেটের জন্য
#define GREEN_LED 12 // ফিউচার আপডেটের জন্য

MFRC522 rfid(SS_PIN, RST_PIN);

// তোমার Vercel ওয়েবসাইটের API লিঙ্ক (পরে এটা পরিবর্তন করবে)
const char* serverName = "https://attendance-app-oeht.vercel.app/api/attendance";

void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();

  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  // WiFiManager সেটআপ
  WiFiManager wm;
  
  // যদি কোনো সেভ করা ওয়াইফাই না পায়, তাহলে "ESP32_Setup" নামে হটস্পট তৈরি করবে
  bool res;
  res = wm.autoConnect("ESP32_Setup");

  if(!res) {
    Serial.println("Failed to connect");
    // কানেক্ট না হলে রিস্টার্ট নেবে
    ESP.restart();
  } 
  else {
    Serial.println("Connected to WiFi successfully!");
  }
  Serial.println("Tap an RFID card...");
}

void loop() {
  // নতুন কার্ড আছে কিনা চেক করো
  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  // UID রিড করা
  String uidString = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    uidString += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    uidString += String(rfid.uid.uidByte[i], HEX);
  }
  uidString.toUpperCase();
  
  Serial.println("Card Detected! UID: " + uidString);

  // API তে ডেটা পাঠানো
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    // JSON ডেটা তৈরি (যেমন: {"uid": "A1B2C3D4"})
    String jsonPayload = "{\"uid\":\"" + uidString + "\"}";
    
    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      
      // সাকসেস হলে গ্রিন এলইডি জ্বলবে (১ সেকেন্ডের জন্য)
      digitalWrite(GREEN_LED, HIGH);
      delay(1000);
      digitalWrite(GREEN_LED, LOW);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
      
      // ফেইল হলে রেড এলইডি জ্বলবে
      digitalWrite(RED_LED, HIGH);
      delay(1000);
      digitalWrite(RED_LED, LOW);
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }
  
  // একই কার্ড বারবার রিড হওয়া বন্ধ করতে
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}